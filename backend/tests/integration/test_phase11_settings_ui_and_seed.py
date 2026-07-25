import os
import sys
import django
from decimal import Decimal

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from rest_framework.test import APIRequestFactory, force_authenticate
from reports.views import HotelConfigurationView
from accounts.models import User
from seed_demo_system_data import seed_data

def run_tests():
    print("==========================================")
    print("   PHASE 11 INTEGRATION VERIFICATION TEST  ")
    print("==========================================")

    test_user, _ = User.objects.get_or_create(email='admin_p11@sunrise.com', defaults={'role': 'ADMIN'})
    factory = APIRequestFactory()

    # 1. Test Hotel Configuration PUT endpoint
    print("\n[Test 1] Hotel Configuration PUT endpoint...")
    view = HotelConfigurationView.as_view()
    req = factory.put('/api/reports/config/', {
        'hotelName': 'Sunrise Hotel Test P11',
        'taxRate': 12.5,
        'weekendSurgeMultiplier': 1.25,
        'currencySymbol': '$',
        'checkInTime': '15:00',
        'checkOutTime': '12:00',
        'cancellationGraceHours': 48
    }, format='json')
    force_authenticate(req, user=test_user)

    res = view(req)
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    
    data = res.data
    print(f"Updated Hotel Name: {data['hotelName']}")
    print(f"Updated Tax Rate: {data['taxRate']}%")
    print(f"Updated Surge Multiplier: x{data['weekendSurgeMultiplier']}")
    
    assert data['hotelName'] == 'Sunrise Hotel Test P11'
    assert data['taxRate'] == 12.5
    assert data['weekendSurgeMultiplier'] == 1.25
    print("-> PASS: Hotel Configuration PUT Endpoint verified!")

    # 2. Test Staging System Data Seed Utility
    print("\n[Test 2] Staging System Data Seed Utility...")
    seed_ok = seed_data()
    assert seed_ok is True
    print("-> PASS: System Data Seed Utility verified!")

    # Cleanup test user
    test_user.delete()

    print("\n==========================================")
    print("   ALL PHASE 11 VERIFICATION TESTS PASSED  ")
    print("==========================================")

if __name__ == '__main__':
    run_tests()
