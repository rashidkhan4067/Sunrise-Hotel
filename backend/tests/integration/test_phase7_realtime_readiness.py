import os
import sys
import django
import json

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from rest_framework.test import APIRequestFactory, force_authenticate
from notifications.views import NotificationStreamView
from accounts.models import User
from core.events import EventBroadcaster

def run_tests():
    print("==========================================")
    print("   PHASE 7 INTEGRATION VERIFICATION TEST   ")
    print("==========================================")

    # 1. Test EventBroadcaster Subscription & Event Emission
    print("\n[Test 1] EventBroadcaster Engine...")
    q = EventBroadcaster.subscribe()
    
    EventBroadcaster.broadcast('CHECK_IN', {'guest': 'John Test', 'room': '101'})
    msg = q.get(timeout=2)
    
    print(f"Received Broadcast Message: {msg.strip()}")
    assert 'event: CHECK_IN' in msg
    assert 'John Test' in msg
    
    EventBroadcaster.unsubscribe(q)
    print("-> PASS: EventBroadcaster broadcast and subscription verified!")

    # 2. Test NotificationStreamView SSE Endpoint
    print("\n[Test 2] NotificationStreamView SSE Streaming Endpoint...")
    factory = APIRequestFactory()
    view = NotificationStreamView.as_view()
    
    test_user, _ = User.objects.get_or_create(email='test_sse_user@sunrise.com', defaults={'role': 'ADMIN'})
    req = factory.get('/api/notifications/stream/')
    force_authenticate(req, user=test_user)
    
    res = view(req)
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    assert res['Content-Type'] == 'text/event-stream'
    print("-> PASS: NotificationStreamView SSE headers verified!")

    # Cleanup test user
    test_user.delete()

    print("\n==========================================")
    print("   ALL PHASE 7 VERIFICATION TESTS PASSED   ")
    print("==========================================")

if __name__ == '__main__':
    run_tests()
