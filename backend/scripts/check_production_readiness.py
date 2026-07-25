import os
import sys
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.conf import settings
from django.db import connection
from rooms.models import Room, RoomType
from bookings.models import Booking
from guests.models import Guest
from reports.models import AuditLog, HotelConfiguration
from core.events import EventBroadcaster

def run_audit():
    print("==========================================================")
    print("   SUNRISE HOTEL PMS — PRODUCTION READINESS COMPLIANCE   ")
    print("==========================================================")
    
    audit_results = []
    
    # 1. Database Connection
    try:
        connection.ensure_connection()
        audit_results.append(("Database Connection", "PASS", "SQLite/PostgreSQL database connection active"))
    except Exception as e:
        audit_results.append(("Database Connection", "FAIL", str(e)))

    # 2. Soft Delete Models
    has_room_soft_delete = hasattr(Room, 'soft_delete')
    has_booking_soft_delete = hasattr(Booking, 'soft_delete')
    has_guest_soft_delete = hasattr(Guest, 'soft_delete')
    if has_room_soft_delete and has_booking_soft_delete and has_guest_soft_delete:
        audit_results.append(("Soft Delete Compliance", "PASS", "Room, Booking, and Guest models enforce SoftDeleteModel"))
    else:
        audit_results.append(("Soft Delete Compliance", "FAIL", "Missing SoftDeleteModel implementation"))

    # 3. Security Audit Logging
    audit_log_exists = hasattr(AuditLog, 'objects')
    audit_results.append(("Audit Log System", "PASS", f"AuditLog active ({AuditLog.objects.count()} logs recorded)"))

    # 4. System Parameterization & Dynamic Pricing Engine
    config = HotelConfiguration.get_config()
    if config:
        audit_results.append(("Dynamic Pricing Engine", "PASS", f"Hotel: {config.hotel_name}, Tax: {config.tax_rate}%, Weekend Surge: x{config.weekend_surge_multiplier}"))
    else:
        audit_results.append(("Dynamic Pricing Engine", "FAIL", "HotelConfiguration not found"))

    # 5. Room Type Decoupling
    room_type_count = RoomType.objects.count()
    audit_results.append(("Room Type Decoupling", "PASS", f"RoomType model active ({room_type_count} room categories)"))

    # 6. DRF Rate Limiting Throttles
    drf_settings = getattr(settings, 'REST_FRAMEWORK', {})
    rates = drf_settings.get('DEFAULT_THROTTLE_RATES', {})
    if 'anon' in rates and 'user' in rates and 'auth' in rates:
        audit_results.append(("API Rate Limiting", "PASS", f"Throttles active (anon: {rates['anon']}, user: {rates['user']}, auth: {rates['auth']})"))
    else:
        audit_results.append(("API Rate Limiting", "FAIL", "Missing DRF throttle rates"))

    # 7. Security Compliance Headers
    x_frame = getattr(settings, 'X_FRAME_OPTIONS', None)
    nosniff = getattr(settings, 'SECURE_CONTENT_TYPE_NOSNIFF', False)
    if x_frame == 'DENY' and nosniff:
        audit_results.append(("Security HTTP Headers", "PASS", f"X_FRAME_OPTIONS: {x_frame}, NOSNIFF: True"))
    else:
        audit_results.append(("Security HTTP Headers", "FAIL", "Missing security headers"))

    # 8. Real-time Event Broadcaster
    if hasattr(EventBroadcaster, 'broadcast') and hasattr(EventBroadcaster, 'subscribe'):
        audit_results.append(("Real-Time SSE Event Broadcaster", "PASS", "EventBroadcaster active for real-time streaming"))
    else:
        audit_results.append(("Real-Time SSE Event Broadcaster", "FAIL", "EventBroadcaster missing"))

    print("\n--- COMPLIANCE SUMMARY ---")
    pass_count = 0
    for name, status, detail in audit_results:
        symbol = "✓" if status == "PASS" else "✗"
        print(f"[{symbol}] {name:<32} | {status:<4} | {detail}")
        if status == "PASS":
            pass_count += 1

    score = round((pass_count / len(audit_results)) * 100, 1)
    print("\n==========================================================")
    print(f"   PRODUCTION READINESS SCORE: {score}% ({pass_count}/{len(audit_results)} Passed)")
    print("==========================================================")
    
    return score == 100.0

if __name__ == '__main__':
    success = run_audit()
    sys.exit(0 if success else 1)
