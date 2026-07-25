import os
import sys
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from rest_framework.test import APIRequestFactory, force_authenticate
from reports.views import SystemStatusView
from accounts.models import User

def run_tests():
    print("==========================================")
    print("   PHASE 14 INTEGRATION VERIFICATION TEST  ")
    print("==========================================")

    test_user, _ = User.objects.get_or_create(email='admin_p14@sunrise.com', defaults={'role': 'ADMIN'})
    factory = APIRequestFactory()

    print("\n[Test 1] System Operational Health Monitor API...")
    view = SystemStatusView.as_view()
    req = factory.get('/api/reports/system-status/')
    force_authenticate(req, user=test_user)

    res = view(req)
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    
    data = res.data
    print(f"System Health Status: {data['status']}")
    print(f"Database Connected: {data['database']['connected']} ({data['database']['engine']})")
    print(f"Active SSE Subscribers: {data['realtimeStream']['activeSubscribers']}")
    print(f"Total Rooms Count: {data['operationalCounts']['totalRooms']}")
    print(f"Available Rooms: {data['operationalCounts']['availableRooms']}")
    print(f"Total Audit Logs: {data['operationalCounts']['totalAuditLogs']}")
    
    assert data['status'] == 'HEALTHY'
    assert data['database']['connected'] is True
    print("-> PASS: System Operational Health Monitor API verified!")

    # Cleanup test user
    test_user.delete()

    print("\n==========================================")
    print("   ALL PHASE 14 VERIFICATION TESTS PASSED  ")
    print("==========================================")

if __name__ == '__main__':
    run_tests()
