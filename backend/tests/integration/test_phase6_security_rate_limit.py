import os
import sys
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.conf import settings
from rest_framework.test import APIRequestFactory, force_authenticate
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from accounts.models import User

class MockAuthThrottleView(APIView):
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'auth'
    def get(self, request):
        return Response({'status': 'ok'})

def run_tests():
    print("==========================================")
    print("   PHASE 6 INTEGRATION VERIFICATION TEST   ")
    print("==========================================")

    # 1. Test DRF & Django Security Configuration
    print("\n[Test 1] Django Security Compliance Settings...")
    print(f"X_FRAME_OPTIONS: {getattr(settings, 'X_FRAME_OPTIONS', None)}")
    print(f"SECURE_CONTENT_TYPE_NOSNIFF: {getattr(settings, 'SECURE_CONTENT_TYPE_NOSNIFF', None)}")
    print(f"SECURE_BROWSER_XSS_FILTER: {getattr(settings, 'SECURE_BROWSER_XSS_FILTER', None)}")
    
    assert settings.X_FRAME_OPTIONS == 'DENY'
    assert settings.SECURE_CONTENT_TYPE_NOSNIFF is True
    assert settings.SECURE_BROWSER_XSS_FILTER is True
    print("-> PASS: Security Headers configuration verified!")

    # 2. Test DRF Throttle Rates
    print("\n[Test 2] DRF Rate Limiting Throttles Configuration...")
    drf_settings = getattr(settings, 'REST_FRAMEWORK', {})
    rates = drf_settings.get('DEFAULT_THROTTLE_RATES', {})
    print(f"Throttle Rates Configured: {rates}")
    
    assert rates.get('anon') == '60/minute'
    assert rates.get('user') == '300/minute'
    assert rates.get('auth') == '10/minute'
    print("-> PASS: DRF Rate Limiting Throttles verified!")

    # 3. Test Scoped Rate Limiter Enforcement
    print("\n[Test 3] Scoped Throttling Enforcement on Auth Endpoint...")
    factory = APIRequestFactory()
    view = MockAuthThrottleView.as_view()
    test_user, _ = User.objects.get_or_create(email='test_sec_user@sunrise.com', defaults={'role': 'ADMIN'})

    throttled = False
    for i in range(15):
        req = factory.get('/api/accounts/users/')
        force_authenticate(req, user=test_user)
        res = view(req)
        if res.status_code == 429:
            throttled = True
            print(f"Request #{i+1} successfully throttled with HTTP 429 Too Many Requests!")
            break

    assert throttled is True, "Expected request to be throttled after exceeding 10 requests/min rate limit"
    print("-> PASS: Auth Endpoint Rate Limiting Enforcement verified!")

    # Cleanup test user
    test_user.delete()

    print("\n==========================================")
    print("   ALL PHASE 6 VERIFICATION TESTS PASSED   ")
    print("==========================================")

if __name__ == '__main__':
    run_tests()
