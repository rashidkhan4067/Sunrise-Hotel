import jwt
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
        return (user, token)

    def verify_token(self, token):
        pem_key = self.get_public_key()
        if not pem_key:
            raise exceptions.AuthenticationFailed('Clerk PEM Public Key is not configured on the backend.')

        try:
            # Decode and verify the signature using RS256
            # Clerk tokens do not enforce audience verification in standard sessions by default, 
            # but we ignore audience to ensure maximum compatibility.
            payload = jwt.decode(
                token,
                pem_key,
                algorithms=['RS256'],
                options={"verify_aud": False}
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
        # Usually, custom claims are defined in the Clerk session JWT template as:
        # { "role": "{{user.public_metadata.role}}" }
        role = payload.get('role') or payload.get('public_metadata', {}).get('role')
        if role:
            role = role.upper()
            if role not in ['ADMIN', 'RECEPTIONIST']:
                role = 'RECEPTIONIST'
        else:
            role = 'RECEPTIONIST'

        first_name = payload.get('first_name') or payload.get('given_name') or ''
        last_name = payload.get('last_name') or payload.get('family_name') or ''

        # Step 1: Match by clerk_id
        try:
            user = User.objects.get(clerk_id=clerk_id)
            # Sync user details if they changed in Clerk
            updated = False
            if email and user.email != email:
                user.email = email
                updated = True
            if role and user.role != role:
                user.role = role
                updated = True
            if first_name and user.first_name != first_name:
                user.first_name = first_name
                updated = True
            if last_name and user.last_name != last_name:
                user.last_name = last_name
                updated = True
            
            if updated:
                user.save()
            return user
        except User.DoesNotExist:
            pass

        # Step 2: Match by email (e.g., if user was registered/seeded locally before linking to Clerk)
        if email:
            try:
                user = User.objects.get(email=email)
                user.clerk_id = clerk_id
                user.role = role
                if first_name and not user.first_name:
                    user.first_name = first_name
                if last_name and not user.last_name:
                    user.last_name = last_name
                user.save()
                return user
            except User.DoesNotExist:
                pass

        # Step 3: Create a new user if no match found
        if not email:
            email = f"{clerk_id}@placeholder.sunrise.com"

        user = User.objects.create_user(
            email=email,
            clerk_id=clerk_id,
            role=role,
            first_name=first_name,
            last_name=last_name
        )
        return user
