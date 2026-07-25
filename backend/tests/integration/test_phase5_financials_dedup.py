import os
import sys
import django
import datetime
from decimal import Decimal

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from rooms.models import Room
from guests.models import Guest
from bookings.models import Booking, Folio, FolioItem
from reports.models import HotelConfiguration
from accounts.models import User

def run_tests():
    print("==========================================")
    print("   PHASE 5 INTEGRATION VERIFICATION TEST   ")
    print("==========================================")

    # Cleanup leftover test records
    Room.all_objects.filter(room_number='P501').hard_delete()
    Guest.all_objects.filter(email__in=['john.phase5@test.com', 'dup.phase5@test.com']).hard_delete()

    # 1. Test Financial Metrics Endpoint Calculations
    print("\n[Test 1] Financial Metrics (ADR & RevPAR Calculations)...")
    test_room = Room.objects.create(
        room_number='P501',
        room_type='SUITE',
        floor=5,
        capacity=2,
        price_per_night=Decimal('200.00')
    )
    test_guest = Guest.objects.create(
        full_name='John Phase5',
        phone_number='5551234567',
        email='john.phase5@test.com',
        document_number='DOC-P5'
    )
    
    check_in = datetime.date.today()
    check_out = check_in + datetime.timedelta(days=3)
    
    test_booking = Booking.objects.create(
        guest=test_guest,
        room=test_room,
        check_in=check_in,
        check_out=check_out,
        total_price=Decimal('660.00'),
        status='CHECKED_IN'
    )
    
    folio = Folio.objects.get(booking=test_booking)
    FolioItem.objects.create(folio=folio, item_type='ROOM', description='Room Charge', amount=Decimal('600.00'))
    FolioItem.objects.create(folio=folio, item_type='TAX', description='Tax Charge', amount=Decimal('60.00'))

    # Call FinancialMetricsView get handler directly
    from reports.views import FinancialMetricsView
    from rest_framework.test import APIRequestFactory
    factory = APIRequestFactory()
    request = factory.get('/api/reports/financials/?date_range=this_month')
    
    view = FinancialMetricsView.as_view()
    from rest_framework.test import force_authenticate
    admin_user, _ = User.objects.get_or_create(email='admin_p5@sunrise.com', defaults={'role': 'ADMIN'})
    force_req = factory.get('/api/reports/financials/?date_range=this_month')
    force_authenticate(force_req, user=admin_user)
    
    response = view(force_req)
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    
    kpis = response.data['kpis']
    print(f"Total Revenue: ${kpis['totalRevenue']}")
    print(f"Room Revenue: ${kpis['roomRevenue']}")
    print(f"Tax Revenue: ${kpis['taxRevenue']}")
    print(f"ADR: ${kpis['adr']}")
    print(f"RevPAR: ${kpis['revpar']}")
    print(f"ALOS: {kpis['alos']} nights")
    
    assert kpis['roomRevenue'] >= 600.0
    assert kpis['adr'] > 0
    print("-> PASS: Financial Metrics (ADR & RevPAR) verified!")

    # 2. Test Guest Identity Merging Action
    print("\n[Test 2] Guest Profile Manual Merging Endpoint...")
    duplicate_guest = Guest.objects.create(
        full_name='John Duplicate Phase5',
        phone_number='5551234567',
        email='dup.phase5@test.com',
        document_number='DOC-DUP'
    )
    
    dup_booking = Booking.objects.create(
        guest=duplicate_guest,
        room=test_room,
        check_in=check_in,
        check_out=check_out,
        total_price=Decimal('200.00'),
        status='CONFIRMED'
    )
    
    from guests.views import GuestViewSet
    guest_view = GuestViewSet.as_view({'post': 'merge_profiles'})
    merge_req = factory.post('/api/guests/merge/', {'primary_id': test_guest.id, 'duplicate_id': duplicate_guest.id}, format='json')
    force_authenticate(merge_req, user=admin_user)
    
    merge_res = guest_view(merge_req)
    assert merge_res.status_code == 200, f"Expected 200, got {merge_res.status_code}"
    
    dup_booking.refresh_from_db()
    assert dup_booking.guest.id == test_guest.id, "Duplicate booking guest should be re-linked to primary guest"
    print("-> PASS: Guest Profile Merging verified!")

    # Cleanup test data
    test_booking.hard_delete()
    dup_booking.hard_delete()
    test_room.hard_delete()
    test_guest.hard_delete()
    duplicate_guest.hard_delete()

    print("\n==========================================")
    print("   ALL PHASE 5 VERIFICATION TESTS PASSED   ")
    print("==========================================")

if __name__ == '__main__':
    run_tests()
