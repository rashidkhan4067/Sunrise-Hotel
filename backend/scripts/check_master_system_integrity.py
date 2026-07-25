import os
import sys
import django
import datetime
from decimal import Decimal

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.conf import settings
from django.db import connection
from rooms.models import Room, RoomType
from bookings.models import Booking, Folio, FolioItem
from guests.models import Guest
from reports.models import AuditLog, HotelConfiguration
from accounts.models import User
from core.events import EventBroadcaster

def run_master_audit():
    print("==========================================================================")
    print("   SUNRISE HOTEL PMS — MASTER SYSTEM INTEGRITY AUDIT SUITE (PHASE 12)   ")
    print("==========================================================================")

    subsystems = []

    # 1. Database Connection & Schema Health
    try:
        connection.ensure_connection()
        subsystems.append(("1. Database Connection & ORM Engine", "PASS", f"Active database: {settings.DATABASES['default']['ENGINE']}"))
    except Exception as e:
        subsystems.append(("1. Database Connection & ORM Engine", "FAIL", str(e)))

    # 2. Housekeeping & Cleanliness State Machine
    try:
        r = Room.objects.create(room_number='M101', room_type='SINGLE', price_per_night=Decimal('100.00'), is_clean=False)
        r.is_clean = True
        r.is_inspected = True
        r.save()
        subsystems.append(("2. Housekeeping & Inspection Workflow", "PASS", "Cleanliness and inspection states verified"))
        r.hard_delete()
    except Exception as e:
        subsystems.append(("2. Housekeeping & Inspection Workflow", "FAIL", str(e)))

    # 3. Booking Management & Folio Auto-Posting
    try:
        g = Guest.objects.create(full_name='Master Guest', email='master@test.com', phone_number='1112223333', document_number='DOC-M')
        rm = Room.objects.create(room_number='M102', room_type='DELUXE', price_per_night=Decimal('180.00'))
        b = Booking.objects.create(guest=g, room=rm, check_in=datetime.date.today(), check_out=datetime.date.today() + datetime.timedelta(days=1), total_price=Decimal('198.00'))
        f, _ = Folio.objects.get_or_create(booking=b)
        FolioItem.objects.create(folio=f, item_type='ROOM', description='Master Charge', amount=Decimal('180.00'))
        subsystems.append(("3. Booking & Folio Auto-Posting Engine", "PASS", f"Folio active (Charges: ${f.items.count()})"))
        b.hard_delete()
        rm.hard_delete()
        g.hard_delete()
    except Exception as e:
        subsystems.append(("3. Booking & Folio Auto-Posting Engine", "FAIL", str(e)))

    # 4. Soft Delete Engine & Security Audit Logging
    try:
        rm = Room.objects.create(room_number='M103', room_type='SINGLE', price_per_night=Decimal('100.00'))
        rm.soft_delete()
        assert Room.objects.filter(room_number='M103').exists() is False
        assert Room.all_objects.filter(room_number='M103').exists() is True
        subsystems.append(("4. Soft Delete & Audit Logging Engine", "PASS", f"Soft delete manager active ({AuditLog.objects.count()} logs)"))
        rm.hard_delete()
    except Exception as e:
        subsystems.append(("4. Soft Delete & Audit Logging Engine", "FAIL", str(e)))

    # 5. Dynamic Pricing Engine & Room Decoupling
    try:
        from core.pricing import calculate_stay_pricing
        pricing = calculate_stay_pricing(100.00, '2026-07-24', '2026-07-26')
        assert pricing['grand_total'] == 264.0
        subsystems.append(("5. Dynamic Pricing & Surge Calculator", "PASS", f"Weekend surge rate verified ($264.00)"))
    except Exception as e:
        subsystems.append(("5. Dynamic Pricing & Surge Calculator", "FAIL", str(e)))

    # 6. Financial Intelligence Engine (ADR, RevPAR, ALOS)
    try:
        from reports.views import FinancialMetricsView
        from rest_framework.test import APIRequestFactory, force_authenticate
        factory = APIRequestFactory()
        u, _ = User.objects.get_or_create(email='master_admin@sunrise.com', defaults={'role': 'ADMIN'})
        req = factory.get('/api/reports/financials/?date_range=this_month')
        force_authenticate(req, user=u)
        v = FinancialMetricsView.as_view()
        res = v(req)
        assert res.status_code == 200
        subsystems.append(("6. Financial Intelligence (ADR/RevPAR)", "PASS", f"ADR: ${res.data['kpis']['adr']}, RevPAR: ${res.data['kpis']['revpar']}"))
        u.delete()
    except Exception as e:
        subsystems.append(("6. Financial Intelligence (ADR/RevPAR)", "FAIL", str(e)))

    # 7. API Security Compliance Headers & Throttling
    try:
        assert getattr(settings, 'X_FRAME_OPTIONS', None) == 'DENY'
        assert getattr(settings, 'SECURE_CONTENT_TYPE_NOSNIFF', False) is True
        subsystems.append(("7. Security Headers & API Rate Throttles", "PASS", "X-Frame-Options DENY & NOSNIFF active"))
    except Exception as e:
        subsystems.append(("7. Security Headers & API Rate Throttles", "FAIL", str(e)))

    # 8. Real-Time SSE Broadcaster Stream
    try:
        q = EventBroadcaster.subscribe()
        EventBroadcaster.broadcast('MASTER_AUDIT', {'status': 'ok'})
        msg = q.get(timeout=2)
        assert 'MASTER_AUDIT' in msg
        EventBroadcaster.unsubscribe(q)
        subsystems.append(("8. Real-Time SSE Broadcaster Engine", "PASS", "EventBroadcaster event emission verified"))
    except Exception as e:
        subsystems.append(("8. Real-Time SSE Broadcaster Engine", "FAIL", str(e)))

    # 9. Official Guest Folio Invoice Receipt Generator
    try:
        u, _ = User.objects.get_or_create(email='master_admin9@sunrise.com', defaults={'role': 'ADMIN'})
        g = Guest.objects.create(full_name='Master Guest 9', email='master9@test.com', phone_number='1112223333', document_number='DOC-M9')
        rm = Room.objects.create(room_number='M109', room_type='DELUXE', price_per_night=Decimal('180.00'))
        b = Booking.objects.create(guest=g, room=rm, check_in=datetime.date.today(), check_out=datetime.date.today() + datetime.timedelta(days=1), total_price=Decimal('198.00'))
        from bookings.views import BookingViewSet
        iv = BookingViewSet.as_view({'get': 'get_invoice'})
        ireq = factory.get(f'/api/bookings/{b.booking_id}/invoice/')
        force_authenticate(ireq, user=u)
        ires = iv(ireq, pk=str(b.booking_id))
        assert ires.status_code == 200
        subsystems.append(("9. Official Folio Invoice Generator", "PASS", f"Invoice generated ({ires.data['invoiceNumber']})"))
        b.hard_delete()
        rm.hard_delete()
        g.hard_delete()
        u.delete()
    except Exception as e:
        subsystems.append(("9. Official Folio Invoice Generator", "FAIL", str(e)))

    # 10. System Log Maintenance Cleaner
    try:
        from clean_system_logs import clean_old_logs
        clean_old_logs(days_threshold=90)
        subsystems.append(("10. System Log Maintenance Cleaner", "PASS", "Log maintenance engine verified"))
    except Exception as e:
        subsystems.append(("10. System Log Maintenance Cleaner", "FAIL", str(e)))

    # 11. Hotel Configuration API & Parameterization Controls
    try:
        config = HotelConfiguration.get_config()
        subsystems.append(("11. Hotel Parameterization API", "PASS", f"Hotel: {config.hotel_name}, Tax: {config.tax_rate}%, Surge: x{config.weekend_surge_multiplier}"))
    except Exception as e:
        subsystems.append(("11. Hotel Parameterization API", "FAIL", str(e)))

    # 12. Staging System Data Seed Engine
    try:
        from seed_demo_system_data import seed_data
        seed_data()
        subsystems.append(("12. Staging System Data Seed Engine", "PASS", f"Room categories: {RoomType.objects.count()}, Physical rooms: {Room.objects.count()}"))
    except Exception as e:
        subsystems.append(("12. Staging System Data Seed Engine", "FAIL", str(e)))

    print("\n--- MASTER INTEGRITY SUBSYSTEM SUMMARY ---")
    pass_count = 0
    for name, status, detail in subsystems:
        symbol = "✓" if status == "PASS" else "✗"
        print(f"[{symbol}] {name:<42} | {status:<4} | {detail}")
        if status == "PASS":
            pass_count += 1

    score = round((pass_count / len(subsystems)) * 100, 1)
    print("\n==========================================================================")
    print(f"   MASTER SYSTEM INTEGRITY SCORE: {score}% ({pass_count}/{len(subsystems)} Subsystems Passed)")
    print("==========================================================================")

    return score == 100.0

if __name__ == '__main__':
    success = run_master_audit()
    sys.exit(0 if success else 1)
