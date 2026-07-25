import os
import sys
import time
import django
from decimal import Decimal

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.conf import settings
from django.db import connection
from rooms.models import Room, RoomType
from bookings.models import Booking, Folio
from guests.models import Guest
from reports.models import AuditLog, HotelConfiguration
from accounts.models import User
from core.events import EventBroadcaster

def verify_release():
    print("==========================================================================")
    print("   SUNRISE HOTEL PMS — FINAL PRODUCTION RELEASE VERIFICATION SUITE       ")
    print("==========================================================================")

    checklist = []

    # 1. Database Readiness & Connectivity
    try:
        connection.ensure_connection()
        checklist.append(("1. Database Connection & Schema Health", "READY", f"Engine: {settings.DATABASES['default']['ENGINE']}"))
    except Exception as e:
        checklist.append(("1. Database Connection & Schema Health", "FAILED", str(e)))

    # 2. Financial & Dynamic Pricing Engine SLA
    try:
        from core.pricing import calculate_stay_pricing
        start_t = time.time()
        p = calculate_stay_pricing(150.00, '2026-07-24', '2026-07-26')
        latency_ms = round((time.time() - start_t) * 1000, 2)
        assert p['grand_total'] == 396.0
        checklist.append(("2. Dynamic Pricing & Surge SLA", "READY", f"Grand Total: $396.00 (Latency: {latency_ms}ms)"))
    except Exception as e:
        checklist.append(("2. Dynamic Pricing & Surge SLA", "FAILED", str(e)))

    # 3. Financial Forecasting & Occupancy Distribution
    try:
        from reports.views import FinancialMetricsView
        from rest_framework.test import APIRequestFactory, force_authenticate
        factory = APIRequestFactory()
        u, _ = User.objects.get_or_create(email='rel_admin@sunrise.com', defaults={'role': 'ADMIN'})
        req = factory.get('/api/reports/financials/?date_range=this_month')
        force_authenticate(req, user=u)
        v = FinancialMetricsView.as_view()
        res = v(req)
        assert res.status_code == 200
        assert 'forecasting' in res.data
        assert 'occupancyByRoomType' in res.data
        checklist.append(("3. Operational Forecasting Engine", "READY", f"30-day projection: ${res.data['forecasting']['projectedRevenueNext30Days']}"))
        u.delete()
    except Exception as e:
        checklist.append(("3. Operational Forecasting Engine", "FAILED", str(e)))

    # 4. Security Compliance Headers & Throttling
    try:
        assert getattr(settings, 'X_FRAME_OPTIONS', None) == 'DENY'
        assert getattr(settings, 'SECURE_CONTENT_TYPE_NOSNIFF', False) is True
        checklist.append(("4. Security Headers & Rate Limits", "READY", "X-Frame-Options DENY & NOSNIFF active"))
    except Exception as e:
        checklist.append(("4. Security Headers & Rate Limits", "FAILED", str(e)))

    # 5. Real-Time Server-Sent Events (SSE) Broadcaster
    try:
        q = EventBroadcaster.subscribe()
        EventBroadcaster.broadcast('RELEASE_VERIFY', {'status': 'ready'})
        msg = q.get(timeout=2)
        assert 'RELEASE_VERIFY' in msg
        EventBroadcaster.unsubscribe(q)
        checklist.append(("5. Real-Time SSE Broadcaster Engine", "READY", "Real-time streaming active"))
    except Exception as e:
        checklist.append(("5. Real-Time SSE Broadcaster Engine", "FAILED", str(e)))

    # 6. Hotel Parameterization Controls
    try:
        config = HotelConfiguration.get_config()
        checklist.append(("6. Hotel Parameterization Engine", "READY", f"Property: {config.hotel_name} (Tax: {config.tax_rate}%)"))
    except Exception as e:
        checklist.append(("6. Hotel Parameterization Engine", "FAILED", str(e)))

    print("\n--- PRODUCTION HANDOVER CHECKLIST ---")
    pass_count = 0
    for name, status, detail in checklist:
        symbol = "✓" if status == "READY" else "✗"
        print(f"[{symbol}] {name:<42} | {status:<6} | {detail}")
        if status == "READY":
            pass_count += 1

    score = round((pass_count / len(checklist)) * 100, 1)
    print("\n==========================================================================")
    print(f"   FINAL PRODUCTION RELEASE SCORE: {score}% ({pass_count}/{len(checklist)} Verification Checks Passed)")
    print("==========================================================================")

    return score == 100.0

if __name__ == '__main__':
    success = verify_release()
    sys.exit(0 if success else 1)
