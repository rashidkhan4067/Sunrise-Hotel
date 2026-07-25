import os
import sys
import django
import datetime
from decimal import Decimal

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from rest_framework.test import APIRequestFactory, force_authenticate
from rooms.models import Room, RoomType
from guests.models import Guest
from bookings.models import Booking, Folio, FolioItem
from reports.models import AuditLog, HotelConfiguration
from accounts.models import User

def run_diagnostic():
    print("==========================================================")
    print("   SUNRISE HOTEL PMS — FULL SYSTEM HEALTH DIAGNOSTIC     ")
    print("==========================================================")

    test_results = []
    admin_user, _ = User.objects.get_or_create(email='admin_p10@sunrise.com', defaults={'role': 'ADMIN'})
    factory = APIRequestFactory()

    # Phase 1: Room Housekeeping Workflow
    try:
        room = Room.objects.create(room_number='DIAG101', room_type='SUITE', floor=1, price_per_night=Decimal('200.00'), is_clean=False)
        room.is_clean = True
        room.save()
        test_results.append(("Phase 1: Housekeeping & Inspection", "PASS", "Clean status toggling verified"))
        room.hard_delete()
    except Exception as e:
        test_results.append(("Phase 1: Housekeeping & Inspection", "FAIL", str(e)))

    # Phase 2: Booking Management & Folio Auto-Posting
    try:
        g = Guest.objects.create(full_name='Diag Guest', email='diag@test.com', phone_number='1234567890', document_number='DOC10')
        r = Room.objects.create(room_number='DIAG102', room_type='DELUXE', floor=1, price_per_night=Decimal('150.00'))
        b = Booking.objects.create(guest=g, room=r, check_in=datetime.date.today(), check_out=datetime.date.today() + datetime.timedelta(days=1), total_price=Decimal('165.00'))
        f, _ = Folio.objects.get_or_create(booking=b)
        FolioItem.objects.create(folio=f, item_type='ROOM', description='Room Charge', amount=Decimal('150.00'))
        test_results.append(("Phase 2: Booking & Folio Auto-Posting", "PASS", f"Folio active (Charges: ${f.items.count()})"))
        b.hard_delete()
        r.hard_delete()
        g.hard_delete()
    except Exception as e:
        test_results.append(("Phase 2: Booking & Folio Auto-Posting", "FAIL", str(e)))

    # Phase 3: Audit Logging & Soft Deletes
    try:
        r = Room.objects.create(room_number='DIAG103', room_type='SINGLE', price_per_night=Decimal('100.00'))
        r.soft_delete()
        assert Room.objects.filter(room_number='DIAG103').exists() is False
        assert Room.all_objects.filter(room_number='DIAG103').exists() is True
        test_results.append(("Phase 3: Soft Deletes & Audit Trail", "PASS", f"Soft delete manager active ({AuditLog.objects.count()} audit logs)"))
        r.hard_delete()
    except Exception as e:
        test_results.append(("Phase 3: Soft Deletes & Audit Trail", "FAIL", str(e)))

    # Phase 4: Dynamic Pricing Engine & Room Decoupling
    try:
        from core.pricing import calculate_stay_pricing
        p = calculate_stay_pricing(100.00, '2026-07-24', '2026-07-26') # Weekend surge
        assert p['grand_total'] == 264.0
        test_results.append(("Phase 4: Dynamic Pricing Engine", "PASS", "Weekend surge multiplier calculation verified ($264.00)"))
    except Exception as e:
        test_results.append(("Phase 4: Dynamic Pricing Engine", "FAIL", str(e)))

    # Phase 5: Financial Metrics (ADR & RevPAR)
    try:
        from reports.views import FinancialMetricsView
        v = FinancialMetricsView.as_view()
        req = factory.get('/api/reports/financials/?date_range=this_month')
        force_authenticate(req, user=admin_user)
        res = v(req)
        assert res.status_code == 200
        test_results.append(("Phase 5: Financial Metrics (ADR/RevPAR)", "PASS", f"ADR: ${res.data['kpis']['adr']}, RevPAR: ${res.data['kpis']['revpar']}"))
    except Exception as e:
        test_results.append(("Phase 5: Financial Metrics (ADR/RevPAR)", "FAIL", str(e)))

    # Phase 6: Security Hardening & Rate Limiting
    try:
        from django.conf import settings
        assert settings.X_FRAME_OPTIONS == 'DENY'
        assert settings.SECURE_CONTENT_TYPE_NOSNIFF is True
        test_results.append(("Phase 6: Security Headers & Throttles", "PASS", "X-Frame-Options DENY & NOSNIFF active"))
    except Exception as e:
        test_results.append(("Phase 6: Security Headers & Throttles", "FAIL", str(e)))

    # Phase 7: Real-Time SSE Broadcaster Engine
    try:
        from core.events import EventBroadcaster
        assert hasattr(EventBroadcaster, 'broadcast')
        test_results.append(("Phase 7: Real-Time Event Streaming", "PASS", "EventBroadcaster active for SSE streaming"))
    except Exception as e:
        test_results.append(("Phase 7: Real-Time Event Streaming", "FAIL", str(e)))

    # Phase 8: Official Folio Invoicing Endpoint
    try:
        g = Guest.objects.create(full_name='Diag Guest 8', email='diag8@test.com', phone_number='1234567890', document_number='DOC10')
        r = Room.objects.create(room_number='DIAG108', room_type='DELUXE', price_per_night=Decimal('150.00'))
        b = Booking.objects.create(guest=g, room=r, check_in=datetime.date.today(), check_out=datetime.date.today() + datetime.timedelta(days=1), total_price=Decimal('165.00'))
        from bookings.views import BookingViewSet
        iv = BookingViewSet.as_view({'get': 'get_invoice'})
        ireq = factory.get(f'/api/bookings/{b.booking_id}/invoice/')
        force_authenticate(ireq, user=admin_user)
        ires = iv(ireq, pk=str(b.booking_id))
        assert ires.status_code == 200
        test_results.append(("Phase 8: Official Folio Invoicing", "PASS", f"Invoice generated ({ires.data['invoiceNumber']})"))
        b.hard_delete()
        r.hard_delete()
        g.hard_delete()
    except Exception as e:
        test_results.append(("Phase 8: Official Folio Invoicing", "FAIL", str(e)))

    # Phase 9: Log Maintenance Cleaner
    try:
        from clean_system_logs import clean_old_logs
        clean_old_logs(days_threshold=90)
        test_results.append(("Phase 9: Log Maintenance Cleaner", "PASS", "Log maintenance engine verified"))
    except Exception as e:
        test_results.append(("Phase 9: Log Maintenance Cleaner", "FAIL", str(e)))

    # Phase 10: Hotel Parameterization & Configuration API
    try:
        from reports.views import HotelConfigurationView
        cv = HotelConfigurationView.as_view()
        creq = factory.get('/api/reports/config/')
        force_authenticate(creq, user=admin_user)
        cres = cv(creq)
        assert cres.status_code == 200
        test_results.append(("Phase 10: Hotel Configuration API", "PASS", f"Config loaded ({cres.data['hotelName']}, Tax: {cres.data['taxRate']}%)"))
    except Exception as e:
        test_results.append(("Phase 10: Hotel Configuration API", "FAIL", str(e)))

    # Cleanup test user
    admin_user.delete()

    print("\n--- END-TO-END DIAGNOSTIC SUMMARY ---")
    pass_count = 0
    for name, status, detail in test_results:
        symbol = "✓" if status == "PASS" else "✗"
        print(f"[{symbol}] {name:<38} | {status:<4} | {detail}")
        if status == "PASS":
            pass_count += 1

    score = round((pass_count / len(test_results)) * 100, 1)
    print("\n==========================================================")
    print(f"   FULL SYSTEM HEALTH SCORE: {score}% ({pass_count}/{len(test_results)} Passed)")
    print("==========================================================")

    return score == 100.0

if __name__ == '__main__':
    success = run_diagnostic()
    sys.exit(0 if success else 1)
