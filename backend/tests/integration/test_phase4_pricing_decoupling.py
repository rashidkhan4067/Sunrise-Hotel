import os
import sys
import django
import datetime
from decimal import Decimal

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from rooms.models import Room, RoomType
from guests.models import Guest
from bookings.models import Booking, Folio, FolioItem
from reports.models import HotelConfiguration
from core.pricing import calculate_stay_pricing
from accounts.models import User

def run_tests():
    print("==========================================")
    print("   PHASE 4 INTEGRATION VERIFICATION TEST   ")
    print("==========================================")

    # Cleanup leftover test records
    RoomType.objects.filter(code='P4_SUITE').delete()
    Room.all_objects.filter(room_number='P401').hard_delete()
    Guest.all_objects.filter(email='john.phase4@test.com').hard_delete()

    # 1. Test HotelConfiguration
    print("\n[Test 1] HotelConfiguration parameters...")
    config = HotelConfiguration.get_config()
    print(f"Hotel Name: {config.hotel_name}, Tax Rate: {config.tax_rate}%, Surge Multiplier: x{config.weekend_surge_multiplier}")
    assert config.tax_rate == Decimal('10.00') or config.tax_rate == Decimal('10.0')
    assert config.weekend_surge_multiplier == Decimal('1.20') or config.weekend_surge_multiplier == Decimal('1.2')
    print("-> PASS: HotelConfiguration default parameters verified!")

    # 2. Test Dynamic Pricing Calculation
    print("\n[Test 2] Dynamic Stay Pricing Calculation (Weekend Surge & Tax)...")
    # Friday 2026-07-24 to Sunday 2026-07-26 (2 nights: Friday night + Saturday night -> 20% surge on both)
    check_in = datetime.date(2026, 7, 24)
    check_out = datetime.date(2026, 7, 26)
    base_price = Decimal('100.00')
    
    pricing = calculate_stay_pricing(base_price, check_in, check_out)
    print(f"Base Total: ${pricing['base_total']} (Expected $240.00 for 2 weekend nights at x1.20)")
    print(f"Tax Amount: ${pricing['tax_amount']} (Expected $24.00 for 10% tax)")
    print(f"Grand Total: ${pricing['grand_total']} (Expected $264.00)")
    
    assert pricing['base_total'] == 240.0, f"Expected 240.0, got {pricing['base_total']}"
    assert pricing['tax_amount'] == 24.0, f"Expected 24.0, got {pricing['tax_amount']}"
    assert pricing['grand_total'] == 264.0, f"Expected 264.0, got {pricing['grand_total']}"
    print("-> PASS: Dynamic Stay Pricing Calculation verified!")

    # 3. Test RoomType Decoupling & Room Assignment
    print("\n[Test 3] RoomType Decoupling & Dynamic Room Assignment...")
    suite_type = RoomType.objects.create(
        code='P4_SUITE',
        name='Executive Suite',
        base_price=Decimal('200.00'),
        capacity=4,
        description='Luxurious suite for Phase 4 test'
    )
    
    test_guest = Guest.objects.create(
        full_name='John Phase4',
        phone_number='9876543210',
        email='john.phase4@test.com',
        document_number='DOC-P4'
    )

    # Create booking WITHOUT a physical room assigned initially
    unassigned_booking = Booking.objects.create(
        guest=test_guest,
        room=None,
        requested_room_type='P4_SUITE',
        check_in=check_in,
        check_out=check_out,
        total_price=Decimal('528.00') # 2 nights at $200 x 1.20 = $480 + 10% tax = $528
    )
    print(f"Unassigned Booking Created: ID {unassigned_booking.booking_id}, Room: {unassigned_booking.room}")
    assert unassigned_booking.room is None, "Room should initially be None"
    assert unassigned_booking.requested_room_type == 'P4_SUITE'

    # Assign physical room P401
    test_room = Room.objects.create(
        room_number='P401',
        room_type='SUITE',
        room_type_ref=suite_type,
        floor=4,
        capacity=4,
        price_per_night=Decimal('200.00')
    )

    unassigned_booking.room = test_room
    unassigned_booking.save()
    print(f"Assigned Room {test_room.room_number} to Booking!")
    assert unassigned_booking.room.room_number == 'P401'
    print("-> PASS: RoomType Decoupling & Dynamic Room Assignment verified!")

    # Cleanup test data
    unassigned_booking.hard_delete()
    test_room.hard_delete()
    test_guest.hard_delete()
    suite_type.delete()

    print("\n==========================================")
    print("   ALL PHASE 4 VERIFICATION TESTS PASSED   ")
    print("==========================================")

if __name__ == '__main__':
    run_tests()
