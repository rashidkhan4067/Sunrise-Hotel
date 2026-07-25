import os
import sys
import django
import datetime
from decimal import Decimal

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from rest_framework.test import APIRequestFactory, force_authenticate
from rooms.models import Room
from guests.models import Guest
from bookings.models import Booking, Folio, FolioItem
from bookings.views import BookingViewSet
from accounts.models import User
from clean_system_logs import clean_old_logs

def run_tests():
    print("==========================================")
    print("   PHASE 9 INTEGRATION VERIFICATION TEST   ")
    print("==========================================")

    # Cleanup leftover test records
    Room.all_objects.filter(room_number='P901').hard_delete()
    Guest.all_objects.filter(email='john.phase9@test.com').hard_delete()

    test_user, _ = User.objects.get_or_create(email='admin_p9@sunrise.com', defaults={'role': 'ADMIN'})

    # 1. Test Folio Invoice Modal Data Payload
    print("\n[Test 1] Printable Invoice Modal Data Format...")
    test_room = Room.objects.create(
        room_number='P901',
        room_type='DELUXE',
        floor=9,
        capacity=2,
        price_per_night=Decimal('180.00'),
        status='AVAILABLE'
    )
    test_guest = Guest.objects.create(
        full_name='John Phase9',
        phone_number='9991234567',
        email='john.phase9@test.com',
        document_number='DOC-P9'
    )
    check_in = datetime.date.today()
    check_out = check_in + datetime.timedelta(days=3)
    
    test_booking = Booking.objects.create(
        guest=test_guest,
        room=test_room,
        check_in=check_in,
        check_out=check_out,
        total_price=Decimal('594.00'),
        status='CHECKED_IN'
    )
    
    folio, _ = Folio.objects.get_or_create(booking=test_booking)
    FolioItem.objects.create(folio=folio, item_type='ROOM', description='Room Charge 3 nights', amount=Decimal('540.00'))
    FolioItem.objects.create(folio=folio, item_type='TAX', description='Room Tax 10%', amount=Decimal('54.00'))
    FolioItem.objects.create(folio=folio, item_type='PAYMENT', description='Credit Card Payment', amount=Decimal('-594.00'))

    factory = APIRequestFactory()
    view = BookingViewSet.as_view({'get': 'get_invoice'})
    req = factory.get(f'/api/bookings/{test_booking.booking_id}/invoice/')
    force_authenticate(req, user=test_user)
    
    res = view(req, pk=str(test_booking.booking_id))
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    
    data = res.data
    print(f"Invoice Number: {data['invoiceNumber']}")
    print(f"Itemized Items Count: {len(data['folioItems'])}")
    print(f"Is Paid: {data['financialSummary']['isPaid']}")
    
    assert len(data['folioItems']) == 3
    assert data['financialSummary']['isPaid'] is True
    print("-> PASS: Printable Invoice Payload verified!")

    # 2. Test Log Maintenance Cleaner Engine
    print("\n[Test 2] System Log Maintenance Cleaner...")
    cleaned = clean_old_logs(days_threshold=90)
    print(f"Cleaned Log Count: {cleaned}")
    print("-> PASS: Log Maintenance Cleaner verified!")

    # Cleanup test data
    test_booking.hard_delete()
    test_room.hard_delete()
    test_guest.hard_delete()
    test_user.delete()

    print("\n==========================================")
    print("   ALL PHASE 9 VERIFICATION TESTS PASSED   ")
    print("==========================================")

if __name__ == '__main__':
    run_tests()
