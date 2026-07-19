from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
import os
import logging
import requests
from django.conf import settings
from .serializers import UserSerializer

User = get_user_model()
logger = logging.getLogger(__name__)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """View to view or update current user profile details."""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def perform_update(self, serializer):
        old_email = self.request.user.email
        email = serializer.validated_data.get('email')
        if email:
            admin_emails = os.getenv('ADMIN_EMAILS') or os.getenv('VITE_ADMIN_EMAILS') or ''
            admin_list = [e.strip().lower() for e in admin_emails.split(',') if e.strip()]
            if email.lower() in admin_list:
                serializer.validated_data['role'] = 'ADMIN'
        user = serializer.save()
        
        # Automatically sync the guest profile name and email if this is a CLIENT user
        if user.role == 'CLIENT':
            try:
                from guests.models import Guest
                full_name = f"{user.first_name} {user.last_name}".strip()
                guests = Guest.objects.filter(email__iexact=old_email)
                if guests.exists():
                    guests.update(
                        full_name=full_name or 'Guest User',
                        email=user.email
                    )
                else:
                    Guest.objects.get_or_create(
                        email=user.email,
                        defaults={
                            'full_name': full_name or 'Guest User',
                            'phone_number': user.phone or '',
                            'document_number': 'PENDING',
                            'is_active': True
                        }
                    )
            except Exception:
                pass


class ClerkUsersListView(APIView):
    """API view to fetch all users from Clerk's Backend API using the secret key."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        secret_key = os.getenv('CLERK_SECRET_KEY') or getattr(settings, 'CLERK_SECRET_KEY', '')
        if not secret_key:
            # Fallback: List local database users who logged in via Clerk (clerk_id is set)
            users = User.objects.exclude(clerk_id__isnull=True).exclude(clerk_id='').exclude(role='CLIENT')
            data = []
            for u in users:
                role_display = 'Admin' if u.role == 'ADMIN' else 'Receptionist'
                data.append({
                    'id': u.clerk_id,
                    'name': f"{u.first_name} {u.last_name}".strip() or (u.email.split('@')[0] if u.email else 'Clerk User'),
                    'email': u.email or '',
                    'avatar': '',
                    'phone': u.phone or '',
                    'role': role_display,
                    'status': 'Active' if u.is_active else 'Inactive',
                    'joinedDate': u.date_joined.strftime('%Y-%m-%d') if u.date_joined else '',
                    'lastLogin': u.last_login.strftime('%Y-%m-%d') if u.last_login else '',
                })
            return Response(data)

        # Call Clerk API to get real users list
        headers = {
            'Authorization': f'Bearer {secret_key}',
            'Content-Type': 'application/json'
        }
        try:
            r = requests.get('https://api.clerk.com/v1/users', headers=headers)
            if r.status_code == 200:
                clerk_users = r.json()
                data = []
                for cu in clerk_users:
                    email_addresses = cu.get('email_addresses', [])
                    email = email_addresses[0].get('email_address', '') if email_addresses else ''
                    first_name = cu.get('first_name') or ''
                    last_name = cu.get('last_name') or ''
                    
                    # Resolve role from public metadata
                    role = cu.get('public_metadata', {}).get('role', 'Client')
                    
                    # Check ADMIN_EMAILS fallback
                    admin_emails_env = os.getenv('ADMIN_EMAILS') or os.getenv('VITE_ADMIN_EMAILS') or ''
                    admin_list = [e.strip().lower() for e in admin_emails_env.split(',') if e.strip()]
                    if email and email.lower() in admin_list:
                        role = 'ADMIN'
                        
                    role_upper = role.upper()
                    
                    if role_upper == 'ADMIN':
                        role_display = 'Admin'
                    elif role_upper == 'RECEPTIONIST':
                        role_display = 'Receptionist'
                    else:
                        # Skip guest/client accounts in the staff management list
                        continue
                        
                    phone_numbers = cu.get('phone_numbers', [])
                    phone = phone_numbers[0].get('phone_number', '') if phone_numbers else ''
                    
                    data.append({
                        'id': cu.get('id'),
                        'name': f"{first_name} {last_name}".strip() or cu.get('username') or email.split('@')[0],
                        'email': email,
                        'avatar': cu.get('image_url') or '',
                        'phone': phone,
                        'role': role_display,
                        'status': 'Active',
                        'joinedDate': new_date_str(cu.get('created_at')),
                        'lastLogin': new_date_str(cu.get('last_sign_in_at')),
                    })
                return Response(data)
            else:
                return Response({'error': f'Clerk API returned {r.status_code}'}, status=r.status_code)
        except Exception as e:
            return Response({'error': str(e)}, status=500)

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            # Get variables
            email = serializer.validated_data.get('email')
            password = request.data.get('password')
            role_val = request.data.get('role', 'RECEPTIONIST').upper()
            status_val = request.data.get('status', 'Active')
            is_active = True if status_val == 'Active' else False
            
            # Map name into first_name and last_name
            name = request.data.get('name', '')
            name_parts = name.split(' ')
            first_name = name_parts[0] if name_parts else ''
            last_name = ' '.join(name_parts[1:]) if len(name_parts) > 1 else ''
            
            clerk_id = None
            secret_key = os.getenv('CLERK_SECRET_KEY') or getattr(settings, 'CLERK_SECRET_KEY', '')
            
            if secret_key:
                # Create user in Clerk
                headers = {
                    'Authorization': f'Bearer {secret_key}',
                    'Content-Type': 'application/json'
                }
                clerk_payload = {
                    'email_address': [email],
                    'password': password,
                    'first_name': first_name,
                    'last_name': last_name,
                    'public_metadata': {
                        'role': role_val.lower()
                    }
                }
                try:
                    r = requests.post('https://api.clerk.com/v1/users', headers=headers, json=clerk_payload)
                    if r.status_code == 200 or r.status_code == 201:
                        clerk_user = r.json()
                        clerk_id = clerk_user.get('id')
                    else:
                        # Return Clerk API error details to frontend
                        return Response(r.json(), status=r.status_code)
                except Exception as e:
                    return Response({'error': f'Failed to create user in Clerk: {str(e)}'}, status=500)
            
            user = serializer.save(
                clerk_id=clerk_id,
                is_active=is_active,
                first_name=first_name,
                last_name=last_name,
                role=role_val
            )
            
            return Response({
                'id': user.clerk_id or str(user.id),
                'name': f"{user.first_name} {user.last_name}".strip() or user.email.split('@')[0],
                'email': user.email,
                'phone': user.phone or '',
                'role': 'Admin' if user.role == 'ADMIN' else 'Receptionist',
                'status': 'Active' if user.is_active else 'Inactive',
                'joinedDate': user.date_joined.strftime('%Y-%m-%d') if user.date_joined else '',
                'lastLogin': user.last_login.strftime('%Y-%m-%d') if user.last_login else '',
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        try:
            user = User.objects.get(id=pk)
        except (User.DoesNotExist, ValueError, ValidationError):
            try:
                user = User.objects.get(clerk_id=pk)
            except User.DoesNotExist:
                return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            status_val = request.data.get('status')
            if status_val:
                user.is_active = True if status_val == 'Active' else False
                user.save()
            
            # Map name if provided
            name = request.data.get('name')
            first_name = ''
            last_name = ''
            if name:
                name_parts = name.split(' ')
                first_name = name_parts[0] if name_parts else ''
                last_name = ' '.join(name_parts[1:]) if len(name_parts) > 1 else ''
                user.first_name = first_name
                user.last_name = last_name
                user.save()
            
            role_val = request.data.get('role')
            if role_val:
                user.role = role_val.upper()
                user.save()

            secret_key = os.getenv('CLERK_SECRET_KEY') or getattr(settings, 'CLERK_SECRET_KEY', '')
            if secret_key and user.clerk_id:
                # Update user in Clerk
                headers = {
                    'Authorization': f'Bearer {secret_key}',
                    'Content-Type': 'application/json'
                }
                clerk_payload = {}
                if name:
                    clerk_payload['first_name'] = first_name
                    clerk_payload['last_name'] = last_name
                if role_val:
                    clerk_payload['public_metadata'] = {
                        'role': role_val.lower()
                    }
                try:
                    requests.patch(f'https://api.clerk.com/v1/users/{user.clerk_id}', headers=headers, json=clerk_payload)
                except Exception as e:
                    logger.warning("Clerk update failed: %s", str(e))

            user = serializer.save()
            return Response({
                'id': user.clerk_id or str(user.id),
                'name': f"{user.first_name} {user.last_name}".strip() or user.email.split('@')[0],
                'email': user.email,
                'phone': user.phone or '',
                'role': 'Admin' if user.role == 'ADMIN' else 'Receptionist',
                'status': 'Active' if user.is_active else 'Inactive',
                'joinedDate': user.date_joined.strftime('%Y-%m-%d') if user.date_joined else '',
                'lastLogin': user.last_login.strftime('%Y-%m-%d') if user.last_login else '',
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        try:
            user = User.objects.get(id=pk)
        except (User.DoesNotExist, ValueError, ValidationError):
            try:
                user = User.objects.get(clerk_id=pk)
            except User.DoesNotExist:
                return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
        secret_key = os.getenv('CLERK_SECRET_KEY') or getattr(settings, 'CLERK_SECRET_KEY', '')
        if secret_key and user.clerk_id:
            headers = {
                'Authorization': f'Bearer {secret_key}',
            }
            try:
                requests.delete(f'https://api.clerk.com/v1/users/{user.clerk_id}', headers=headers)
            except Exception as e:
                logger.warning("Clerk delete failed: %s", str(e))
                
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class UserResetPasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            user = User.objects.get(id=pk)
        except (User.DoesNotExist, ValueError, ValidationError):
            try:
                user = User.objects.get(clerk_id=pk)
            except User.DoesNotExist:
                return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        password = request.data.get('password')
        if not password:
            return Response({'password': ['This field is required.']}, status=status.HTTP_400_BAD_REQUEST)

        secret_key = os.getenv('CLERK_SECRET_KEY') or getattr(settings, 'CLERK_SECRET_KEY', '')
        if secret_key and user.clerk_id:
            headers = {
                'Authorization': f'Bearer {secret_key}',
                'Content-Type': 'application/json'
            }
            try:
                requests.patch(f'https://api.clerk.com/v1/users/{user.clerk_id}', headers=headers, json={'password': password})
            except Exception as e:
                logger.warning("Clerk password update failed: %s", str(e))

        user.set_password(password)
        user.save()
        return Response({'message': 'Password reset successfully'})


def new_date_str(timestamp_ms):
    if not timestamp_ms:
        return ''
    from datetime import datetime
    try:
        dt = datetime.fromtimestamp(timestamp_ms / 1000.0)
        return dt.strftime('%Y-%m-%d')
    except Exception:
        return ''
