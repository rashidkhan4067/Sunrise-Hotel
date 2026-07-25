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
from export_system_backup import export_backup

def run_tests():
    print("==========================================")
    print("   PHASE 8 INTEGRATION VERIFICATION TEST   ")
    print("==========================================")

    # Cleanup leftover test records
    Room.all_objects.filter(room_number='P801').hard_delete()
    Guest.all_objects.filter(email='john.phase8@test.com').hard_delete()

    test_user, _ = User.objects.get_or_create(email='admin_p8@sunrise.com', defaults={'role': 'ADMIN'})

    # 1. Test Folio Invoice Action Endpoint
    print("\n[Test 1] Official Guest Folio Invoice Receipt Endpoint...")
    test_room = Room.objects.create(
        room_number='P801',
        room_type='SUITE',
        floor=8,
        capacity=2,
        price_per_night=Decimal('250.00'),
        status='AVAILABLE'
    )
    test_guest = Guest.objects.create(
        full_name='John Phase8',
        phone_number='8881234567',
        email='john.phase8@test.com',
        document_number='DOC-P8'
    )
    check_in = datetime.date.today()
    check_out = check_in + datetime.timedelta(days=2)
    
    test_booking = Booking.objects.create(
        guest=test_guest,
        room=test_room,
        check_in=check_in,
        check_out=check_out,
        total_price=Decimal('550.00'),
        status='CHECKED_IN'
    )
    
    folio, _ = Folio.objects.get_or_create(booking=test_booking)
    FolioItem.objects.create(folio=folio, item_type='ROOM', description='Room Charge', amount=Decimal('500.00'))
    FolioItem.objects.create(folio=folio, item_type='TAX', description='Tax Charge', amount=Decimal('50.00'))
    FolioItem.objects.create(folio=folio, item_type='PAYMENT', description='Guest Payment', amount=Decimal('-550.00'))

    factory = APIRequestFactory()
    view = BookingViewSet.as_view({'get': 'get_invoice'})
    req = factory.get(f'/api/bookings/{test_booking.booking_id}/invoice/')
    force_authenticate(req, user=test_user)
    
    res = view(req, pk=str(test_booking.booking_id))
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    
    data = res.data
    print(f"Invoice Number: {data['invoiceNumber']}")
    print(f"Guest: {data['guestInfo']['fullName']}")
    print(f"Total Charges: ${data['financialSummary']['totalCharges']}")
    print(f"Total Payments: ${data['financialSummary']['totalPayments']}")
    print(f"Balance Due: ${data['financialSummary']['balanceDue']}")
    print(f"Is Paid: {data['financialSummary']['isPaid']}")
    
    assert data['financialSummary']['totalCharges'] == 550.0
    assert data['financialSummary']['totalPayments'] == 550.0
    assert data['financialSummary']['isPaid'] is True
    print("-> PASS: Guest Folio Invoice Endpoint verified!")

    # 2. Test Maintenance Room Reservation Prevention
    print("\n[Test 2] Maintenance Room Reservation Blocking...")
    test_room.status = 'MAINTENANCE'
    test_room.save()

    create_view = BookingViewSet.as_view({'post': 'create'})
    create_req = factory.post('/api/bookings/', {
        'guest': test_guest.id,
        'room': test_room.id,
        'check_in': str(check_in),
        'check_out': str(check_out)
    }, format='json')
    force_authenticate(create_req, user=test_user)

    create_res = create_view(create_req)
    assert create_res.status_code == 400, f"Expected 400, got {create_res.status_code}"
    assert "under maintenance" in create_res.data['error']
    print(f"Error returned as expected: {create_res.data['error']}")
    print("-> PASS: Maintenance Room Booking Prevention verified!")

    # 3. Test Database Backup Utility
    print("\n[Test 3] System Data Backup Export Utility...")
    backup_ok = export_backup()
    assert backup_ok is True
    print("-> PASS: System Data Backup Export verified!")

    # Cleanup test data
    test_booking.hard_delete()
    test_room.hard_delete()
    test_guest.hard_delete()
    test_user.delete()

    print("\n==========================================")
    print("   ALL PHASE 8 VERIFICATION TESTS PASSED   ")
    print("==========================================")

if __name__ == '__main__':
    run_tests()
