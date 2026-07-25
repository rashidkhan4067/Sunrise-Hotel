import os
import sys
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.utils import timezone
from rooms.models import Room
from guests.models import Guest
from bookings.models import Booking, Folio, FolioItem
from reports.models import AuditLog, log_audit_event
from accounts.models import User

def run_tests():
    print("==========================================")
    print("   PHASE 3 INTEGRATION VERIFICATION TEST   ")
    print("==========================================")

    # Cleanup any leftover test rooms/guests/bookings
    Room.all_objects.filter(room_number__in=['P301', 'P302']).hard_delete()
    Guest.all_objects.filter(email='john.phase3@test.com').hard_delete()

    # 1. Create test user
    user, _ = User.objects.get_or_create(
        email='admin_test@sunrise.com',
        defaults={'role': 'ADMIN', 'first_name': 'Admin', 'last_name': 'Test'}
    )

    # 2. Test Soft Delete on Room
    print("\n[Test 1] Soft Delete on Room...")
    test_room = Room.objects.create(
        room_number='P301',
        room_type='SUITE',
        floor=3,
        capacity=2,
        price_per_night=199.99
    )
    print(f"Created test room {test_room.room_number} (ID: {test_room.id})")
    
    test_room.soft_delete()
    print(f"Executed soft_delete(). is_deleted={test_room.is_deleted}, deleted_at={test_room.deleted_at}")
    assert test_room.is_deleted == True, "Room is_deleted should be True"
    assert test_room.deleted_at is not None, "Room deleted_at should not be None"
    
    # Verify default manager excludes soft deleted items
    active_rooms = Room.objects.filter(room_number='P301')
    all_rooms = Room.all_objects.filter(room_number='P301')
    print(f"Room.objects.filter count: {active_rooms.count()} (Expected 0)")
    print(f"Room.all_objects.filter count: {all_rooms.count()} (Expected 1)")
    assert active_rooms.count() == 0
    assert all_rooms.count() == 1
    print("-> PASS: Room Soft Delete verified!")

    # 3. Test Soft Delete on Guest & Booking
    print("\n[Test 2] Soft Delete on Guest and Booking...")
    test_guest = Guest.objects.create(
        full_name='John Phase3',
        phone_number='1234567890',
        email='john.phase3@test.com',
        document_number='DOC123456'
    )
    test_room2 = Room.objects.create(
        room_number='P302',
        room_type='DELUXE',
        floor=3,
        capacity=2,
        price_per_night=150.00
    )
    test_booking = Booking.objects.create(
        guest=test_guest,
        room=test_room2,
        check_in=timezone.now().date(),
        check_out=timezone.now().date() + timezone.timedelta(days=2),
        total_price=300.00
    )
    
    test_booking.soft_delete()
    print(f"Booking soft deleted: is_deleted={test_booking.is_deleted}")
    assert Booking.objects.filter(booking_id=test_booking.booking_id).count() == 0
    assert Booking.all_objects.filter(booking_id=test_booking.booking_id).count() == 1
    print("-> PASS: Booking Soft Delete verified!")

    # 4. Test Audit Logging
    print("\n[Test 3] Audit Logging Trigger and Persistence...")
    initial_count = AuditLog.objects.count()
    
    log_audit_event(
        user=user,
        action='CHECK_IN',
        description='Checked in test guest John Phase3 into Room P302',
        model_name='Booking',
        object_id=test_booking.booking_id
    )
    
    log_audit_event(
        user=user,
        action='ADD_PAYMENT',
        description='Added payment of $300.00 to Folio',
        model_name='FolioItem',
        object_id='ITEM-999'
    )

    new_count = AuditLog.objects.count()
    print(f"AuditLog count before: {initial_count}, after: {new_count} (Added {new_count - initial_count})")
    assert new_count == initial_count + 2, "Should create 2 AuditLog entries"

    latest_logs = list(AuditLog.objects.all()[:2])
    print(f"Latest Log 1: [{latest_logs[0].action}] {latest_logs[0].description} (User: {latest_logs[0].user_email})")
    print(f"Latest Log 2: [{latest_logs[1].action}] {latest_logs[1].description} (User: {latest_logs[1].user_email})")
    print("-> PASS: Audit Logging verified!")

    # Cleanup test data
    test_room.hard_delete()
    test_room2.hard_delete()
    test_booking.hard_delete()
    test_guest.hard_delete()
    AuditLog.objects.filter(user_email='admin_test@sunrise.com').delete()
    print("\n==========================================")
    print("   ALL PHASE 3 VERIFICATION TESTS PASSED   ")
    print("==========================================")

if __name__ == '__main__':
    run_tests()
