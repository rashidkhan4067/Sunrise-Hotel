import os
import sys
import django
from decimal import Decimal

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from rooms.models import Room, RoomType
from reports.models import HotelConfiguration

def seed_data():
    print("==========================================================")
    print("   SUNRISE HOTEL PMS — SYSTEM DATA STAGING SEED UTILITY  ")
    print("==========================================================")

    # 1. Seed Hotel Configuration
    config = HotelConfiguration.get_config()
    config.hotel_name = "Sunrise Hotel & Resort"
    config.tax_rate = Decimal('10.00')
    config.weekend_surge_multiplier = Decimal('1.20')
    config.check_in_time = "14:00"
    config.check_out_time = "11:00"
    config.save()
    print(f"✓ Configured Hotel: {config.hotel_name} (Tax: {config.tax_rate}%, Weekend Surge: x{config.weekend_surge_multiplier})")

    # 2. Seed Room Types
    room_types_data = [
        {'code': 'SINGLE', 'name': 'Single Room', 'base_price': Decimal('80.00'), 'capacity': 1, 'description': 'Cozy single bed room for solo travelers'},
        {'code': 'DOUBLE', 'name': 'Double Room', 'base_price': Decimal('120.00'), 'capacity': 2, 'description': 'Comfortable double bed room for couples'},
        {'code': 'TWIN', 'name': 'Twin Room', 'base_price': Decimal('130.00'), 'capacity': 2, 'description': 'Two single beds suitable for friends or colleagues'},
        {'code': 'DELUXE', 'name': 'Deluxe Room', 'base_price': Decimal('180.00'), 'capacity': 2, 'description': 'Spacious deluxe room with balcony and ocean view'},
        {'code': 'SUITE', 'name': 'Executive Suite', 'base_price': Decimal('250.00'), 'capacity': 4, 'description': 'Luxury suite with living room, king bed, and jacuzzi'},
    ]

    created_types = 0
    for rt_info in room_types_data:
        _, created = RoomType.objects.get_or_create(code=rt_info['code'], defaults=rt_info)
        if created:
            created_types += 1

    print(f"✓ Room categories active: {RoomType.objects.count()} (New created: {created_types})")

    # 3. Seed Physical Demo Rooms
    rooms_seed = [
        {'room_number': '101', 'room_type': 'SINGLE', 'floor': 1, 'capacity': 1, 'price_per_night': Decimal('80.00')},
        {'room_number': '102', 'room_type': 'DOUBLE', 'floor': 1, 'capacity': 2, 'price_per_night': Decimal('120.00')},
        {'room_number': '201', 'room_type': 'DELUXE', 'floor': 2, 'capacity': 2, 'price_per_night': Decimal('180.00')},
        {'room_number': '301', 'room_type': 'SUITE', 'floor': 3, 'capacity': 4, 'price_per_night': Decimal('250.00')},
    ]

    created_rooms = 0
    for r_info in rooms_seed:
        _, created = Room.objects.get_or_create(room_number=r_info['room_number'], defaults=r_info)
        if created:
            created_rooms += 1

    print(f"✓ Physical demo rooms active: {Room.objects.filter(is_archived=False).count()} (New created: {created_rooms})")
    print("==========================================================")
    return True

if __name__ == '__main__':
    seed_data()
