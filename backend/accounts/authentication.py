import jwt
import os
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import authentication
from rest_framework import exceptions

User = get_user_model()

class ClerkJWTAuthentication(authentication.BaseAuthentication):
    """
    Custom authentication class for Django REST Framework to verify Clerk JWT session tokens.
    Expects a header: Authorization: Bearer <clerk_jwt_token>
    """
    
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return None

        try:
            parts = auth_header.split()
            if len(parts) != 2 or parts[0].lower() != 'bearer':
                return None
            token = parts[1]
        except Exception:
            return None

        # Verify the Clerk token
        payload = self.verify_token(token)
        if not payload:
            raise exceptions.AuthenticationFailed('Invalid or expired Clerk token')

        # Retrieve or create user profile based on payload
        user = self.get_or_create_user(payload)

        # Update last_login to current time to track active console session
        from django.utils import timezone
        user.last_login = timezone.now()
        user.save(update_fields=['last_login'])

        return (user, token)

    def verify_token(self, token):
        pem_key = self.get_public_key()
        if not pem_key:
            raise exceptions.AuthenticationFailed('Clerk PEM Public Key is not configured on the backend.')

        try:
            # Decode and verify the signature using RS256
            payload = jwt.decode(
                token,
                pem_key,
                algorithms=['RS256'],
                options={"verify_aud": False},
                leeway=120
            )
            return payload
        except jwt.ExpiredSignatureError:
            raise exceptions.AuthenticationFailed('Clerk token has expired.')
        except jwt.InvalidTokenError as e:
            raise exceptions.AuthenticationFailed(f'Invalid Clerk token: {str(e)}')
        except Exception as e:
            raise exceptions.AuthenticationFailed(f'Clerk token verification failed: {str(e)}')

    def get_public_key(self):
        raw_key = getattr(settings, 'CLERK_PEM_PUBLIC_KEY', '')
        if not raw_key:
            return None
        
        # Clean external whitespace and quotes
        key = raw_key.strip('"\' \n\r')
        
        if not key.startswith('-----BEGIN PUBLIC KEY-----'):
            # Standardize base64 block into 64-character PEM format
            # Clean up internal spaces or newlines that might break formatting
            clean_key = "".join(key.split())
            chunks = [clean_key[i:i+64] for i in range(0, len(clean_key), 64)]
            key = "-----BEGIN PUBLIC KEY-----\n" + "\n".join(chunks) + "\n-----END PUBLIC KEY-----"
            
        return key.encode('utf-8')

    def get_or_create_user(self, payload):
        clerk_id = payload.get('sub')
        email = payload.get('email')
        
        if not clerk_id:
            raise exceptions.AuthenticationFailed('Clerk ID (sub) not found in token payload.')

        # Extract roles from Clerk public metadata or standard role field
        role = payload.get('role') or payload.get('public_metadata', {}).get('role')
        if role:
            role = role.upper()
            if role not in ['ADMIN', 'RECEPTIONIST', 'CLIENT']:
                role = 'CLIENT'
        else:
            role = None

        # Allow additional admin emails from environment variable
        admin_emails_env = os.getenv('ADMIN_EMAILS', '')
        admin_email_list = [e.strip().lower() for e in admin_emails_env.split(',') if e.strip()]
        if email and email.lower() in admin_email_list:
            role = 'ADMIN'

        first_name = payload.get('first_name') or payload.get('given_name') or ''
        last_name = payload.get('last_name') or payload.get('family_name') or ''

        # Step 1: Match by clerk_id
        try:
            user = User.objects.get(clerk_id=clerk_id)
            # Sync user details if they changed in Clerk
            updated = False
            
            # If the user's database email or the token email matches admin email list
            user_email = user.email or email
            admin_emails_env = os.getenv('ADMIN_EMAILS', '')
            admin_email_list = [e.strip().lower() for e in admin_emails_env.split(',') if e.strip()]
            if user_email and user_email.lower() in admin_email_list:
                role = 'ADMIN'
            
            if email and user.email != email:
                user.email = email
                updated = True
                
            final_role = role or user.role
            if final_role and user.role != final_role:
                user.role = final_role
                updated = True
                
            if first_name and user.first_name != first_name:
                user.first_name = first_name
                updated = True
            if last_name and user.last_name != last_name:
                user.last_name = last_name
                updated = True
            
            if updated:
                user.save()
            self.ensure_guest_profile(user, first_name, last_name)
            return user
        except User.DoesNotExist:
            pass

        # Step 2: Match by email (e.g., if user was registered/seeded locally before linking to Clerk)
        if email:
            try:
                user = User.objects.get(email=email)
                user.clerk_id = clerk_id

                admin_emails_env = os.getenv('ADMIN_EMAILS', '')
                admin_email_list = [e.strip().lower() for e in admin_emails_env.split(',') if e.strip()]
                if email.lower() in admin_email_list:
                    role = 'ADMIN'
                
                final_role = role or user.role
                if final_role and user.role != final_role:
                    user.role = final_role
                
                if first_name and not user.first_name:
                    user.first_name = first_name
                if last_name and not user.last_name:
                    user.last_name = last_name
                user.save()
                self.ensure_guest_profile(user, first_name, last_name)
                return user
            except User.DoesNotExist:
                pass

        # Step 3: Create a new user if no match found
        if not email:
            email = f"{clerk_id}@placeholder.sunrise.com"

        final_role = role or 'CLIENT'
        admin_emails_env = os.getenv('ADMIN_EMAILS', '')
        admin_email_list = [e.strip().lower() for e in admin_emails_env.split(',') if e.strip()]
        if email and email.lower() in admin_email_list:
            final_role = 'ADMIN'

        user = User.objects.create_user(
            email=email,
            clerk_id=clerk_id,
            role=final_role,
            first_name=first_name,
            last_name=last_name
        )
        self.ensure_guest_profile(user, first_name, last_name)
        return user

    def ensure_guest_profile(self, user, first_name, last_name):
        if user.role == 'CLIENT' and user.email:
            try:
                from guests.models import Guest
                full_name = f"{first_name} {last_name}".strip()
                if not full_name:
                    full_name = "Guest User"
                
                guest, created = Guest.objects.get_or_create(
                    email=user.email,
                    defaults={
                        'full_name': full_name,
                        'phone_number': '',
                        'document_number': 'PENDING',
                        'is_active': True
                    }
                )
                if not created:
                    # Sync name if it was empty or placeholder
                    if not guest.full_name or guest.full_name.startswith('user_'):
                        guest.full_name = full_name
                        guest.save()
            except Exception:
                # Fail gracefully if tables are not migrated yet
                pass
