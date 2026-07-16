from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from rooms.models import Room
from guests.models import Guest
from bookings.models import Booking
from datetime import date, timedelta
import random

User = get_user_model()


class Command(BaseCommand):
    help = 'Seeds the database with initial hotel rooms, users, guests, and bookings'

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING('Starting database seeding...'))
        
        # 1. Create Staff Users
        self.stdout.write('Creating users...')
        admin, created = User.objects.get_or_create(
            email='admin@sunrise.com',
            defaults={
                'first_name': 'Admin',
                'last_name': 'User',
                'role': 'ADMIN',
                'is_staff': True,
                'is_superuser': True
            }
        )
        if created:
            admin.set_password('adminpassword')
            admin.save()
            self.stdout.write(self.style.SUCCESS('Created Admin: admin@sunrise.com / adminpassword'))
        else:
            self.stdout.write('Admin already exists.')

        receptionist, created = User.objects.get_or_create(
            email='receptionist@sunrise.com',
            defaults={
                'first_name': 'Sarah',
                'last_name': 'Receptionist',
                'role': 'RECEPTIONIST',
                'is_staff': True
            }
        )
        if created:
            receptionist.set_password('receptionistpassword')
            receptionist.save()
            self.stdout.write(self.style.SUCCESS('Created Receptionist: receptionist@sunrise.com / receptionistpassword'))
        else:
            self.stdout.write('Receptionist already exists.')

        # 2. Create Rooms
        self.stdout.write('Creating rooms...')
        rooms_data = [
            {'room_number': '101', 'room_type': 'SINGLE', 'floor': 1, 'capacity': 1, 'price_per_night': 80.00, 'status': 'AVAILABLE'},
            {'room_number': '102', 'room_type': 'SINGLE', 'floor': 1, 'capacity': 1, 'price_per_night': 80.00, 'status': 'AVAILABLE'},
            {'room_number': '103', 'room_type': 'DOUBLE', 'floor': 1, 'capacity': 2, 'price_per_night': 120.00, 'status': 'OCCUPIED'},
            {'room_number': '104', 'room_type': 'DOUBLE', 'floor': 1, 'capacity': 2, 'price_per_night': 120.00, 'status': 'AVAILABLE'},
            {'room_number': '105', 'room_type': 'DELUXE', 'floor': 1, 'capacity': 3, 'price_per_night': 180.00, 'status': 'MAINTENANCE'},
            {'room_number': '201', 'room_type': 'DOUBLE', 'floor': 2, 'capacity': 2, 'price_per_night': 130.00, 'status': 'AVAILABLE'},
            {'room_number': '202', 'room_type': 'DOUBLE', 'floor': 2, 'capacity': 2, 'price_per_night': 130.00, 'status': 'AVAILABLE'},
            {'room_number': '203', 'room_type': 'SUITE', 'floor': 2, 'capacity': 4, 'price_per_night': 300.00, 'status': 'OCCUPIED'},
            {'room_number': '204', 'room_type': 'SUITE', 'floor': 2, 'capacity': 4, 'price_per_night': 300.00, 'status': 'AVAILABLE'},
            {'room_number': '301', 'room_type': 'DELUXE', 'floor': 3, 'capacity': 3, 'price_per_night': 200.00, 'status': 'AVAILABLE'},
            {'room_number': '302', 'room_type': 'SUITE', 'floor': 3, 'capacity': 4, 'price_per_night': 350.00, 'status': 'AVAILABLE'},
        ]
        
        rooms = []
        for r_data in rooms_data:
            room, created = Room.objects.get_or_create(
                room_number=r_data['room_number'],
                defaults={
                    'room_type': r_data['room_type'],
                    'floor': r_data['floor'],
                    'capacity': r_data['capacity'],
                    'price_per_night': r_data['price_per_night'],
                    'status': r_data['status']
                }
            )
            rooms.append(room)
            if created:
                self.stdout.write(f"Created Room {room.room_number}")
        
        # 3. Create Guests
        self.stdout.write('Creating guests...')
        guests_data = [
            {'full_name': 'John Doe', 'phone_number': '+15550199', 'email': 'john.doe@gmail.com', 'document_number': 'US-9823412', 'address': '123 Elm St, NY'},
            {'full_name': 'Jane Smith', 'phone_number': '+15550244', 'email': 'jane.smith@yahoo.com', 'document_number': 'US-1029384', 'address': '456 Oak Ave, CA'},
            {'full_name': 'Ali Khan', 'phone_number': '+923001234567', 'email': 'ali.khan@outlook.com', 'document_number': '42201-1234567-1', 'address': 'DHA Phase 5, Karachi'},
            {'full_name': 'Emma Watson', 'phone_number': '+447911123456', 'email': 'emma@watson.co.uk', 'document_number': 'UK-AB9912C', 'address': 'Baker St, London'},
            {'full_name': 'Carlos Santana', 'phone_number': '+5255551234', 'email': 'carlos@santana.mx', 'document_number': 'MX-448192A', 'address': 'Juarez 10, Mexico City'},
        ]
        
        guests = []
        for g_data in guests_data:
            guest, created = Guest.objects.get_or_create(
                phone_number=g_data['phone_number'],
                defaults={
                    'full_name': g_data['full_name'],
                    'email': g_data['email'],
                    'document_number': g_data['document_number'],
                    'address': g_data['address']
                }
            )
            guests.append(guest)
            if created:
                self.stdout.write(f"Created Guest {guest.full_name}")

        # 4. Create Bookings
        self.stdout.write('Creating bookings...')
        today = date.today()
        
        # Room 103: Occupied, Booking Checked In
        room_103 = Room.objects.get(room_number='103')
        guest_john = Guest.objects.get(full_name='John Doe')
        Booking.objects.get_or_create(
            guest=guest_john,
            room=room_103,
            check_in=today - timedelta(days=2),
            defaults={
                'check_out': today + timedelta(days=2),
                'adults': 2,
                'children': 0,
                'total_price': room_103.price_per_night * 4,
                'status': 'CHECKED_IN'
            }
        )

        # Room 203: Occupied, Booking Checked In
        room_203 = Room.objects.get(room_number='203')
        guest_ali = Guest.objects.get(full_name='Ali Khan')
        Booking.objects.get_or_create(
            guest=guest_ali,
            room=room_203,
            check_in=today - timedelta(days=1),
            defaults={
                'check_out': today + timedelta(days=4),
                'adults': 3,
                'children': 1,
                'total_price': room_203.price_per_night * 5,
                'status': 'CHECKED_IN'
            }
        )

        # Pending Booking (Starts tomorrow)
        room_101 = Room.objects.get(room_number='101')
        guest_jane = Guest.objects.get(full_name='Jane Smith')
        Booking.objects.get_or_create(
            guest=guest_jane,
            room=room_101,
            check_in=today + timedelta(days=1),
            defaults={
                'check_out': today + timedelta(days=3),
                'adults': 1,
                'children': 0,
                'total_price': room_101.price_per_night * 2,
                'status': 'CONFIRMED'
            }
        )

        # Checked Out Booking (In the past)
        room_102 = Room.objects.get(room_number='102')
        guest_emma = Guest.objects.get(full_name='Emma Watson')
        Booking.objects.get_or_create(
            guest=guest_emma,
            room=room_102,
            check_in=today - timedelta(days=5),
            defaults={
                'check_out': today - timedelta(days=2),
                'adults': 1,
                'children': 0,
                'total_price': room_102.price_per_night * 3,
                'status': 'CHECKED_OUT'
            }
        )

        # Cancelled Booking
        room_201 = Room.objects.get(room_number='201')
        guest_carlos = Guest.objects.get(full_name='Carlos Santana')
        Booking.objects.get_or_create(
            guest=guest_carlos,
            room=room_201,
            check_in=today - timedelta(days=10),
            defaults={
                'check_out': today - timedelta(days=7),
                'adults': 2,
                'children': 0,
                'total_price': room_201.price_per_night * 3,
                'status': 'CANCELLED'
            }
        )

        self.stdout.write(self.style.SUCCESS('Successfully seeded database!'))
