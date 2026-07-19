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
        
        # 0. Clear existing data completely
        self.stdout.write(self.style.WARNING('Clearing existing bookings, guests, and rooms...'))
        Booking.objects.all().delete()
        Guest.objects.all().delete()
        Room.objects.all().delete()

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
            {'room_number': '101', 'room_type': 'SINGLE', 'floor': 1, 'capacity': 1, 'price_per_night': 12000.00, 'status': 'AVAILABLE'},
            {'room_number': '102', 'room_type': 'SINGLE', 'floor': 1, 'capacity': 1, 'price_per_night': 12000.00, 'status': 'AVAILABLE'},
            {'room_number': '103', 'room_type': 'DOUBLE', 'floor': 1, 'capacity': 2, 'price_per_night': 18000.00, 'status': 'OCCUPIED'},
            {'room_number': '104', 'room_type': 'DOUBLE', 'floor': 1, 'capacity': 2, 'price_per_night': 18000.00, 'status': 'AVAILABLE'},
            {'room_number': '105', 'room_type': 'DELUXE', 'floor': 1, 'capacity': 3, 'price_per_night': 25000.00, 'status': 'MAINTENANCE'},
            {'room_number': '201', 'room_type': 'DOUBLE', 'floor': 2, 'capacity': 2, 'price_per_night': 20000.00, 'status': 'AVAILABLE'},
            {'room_number': '202', 'room_type': 'DOUBLE', 'floor': 2, 'capacity': 2, 'price_per_night': 20000.00, 'status': 'AVAILABLE'},
            {'room_number': '203', 'room_type': 'SUITE', 'floor': 2, 'capacity': 4, 'price_per_night': 45000.00, 'status': 'OCCUPIED'},
            {'room_number': '204', 'room_type': 'SUITE', 'floor': 2, 'capacity': 4, 'price_per_night': 45000.00, 'status': 'AVAILABLE'},
            {'room_number': '301', 'room_type': 'DELUXE', 'floor': 3, 'capacity': 3, 'price_per_night': 28000.00, 'status': 'AVAILABLE'},
            {'room_number': '302', 'room_type': 'SUITE', 'floor': 3, 'capacity': 4, 'price_per_night': 55000.00, 'status': 'AVAILABLE'},
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
            {'full_name': 'Muhammad Ali', 'phone_number': '+923001234567', 'email': 'muhammad.ali@gmail.com', 'document_number': '42201-1234567-1', 'address': 'DHA Phase 5, Karachi'},
            {'full_name': 'Aisha Rehman', 'phone_number': '+923214567890', 'email': 'aisha.rehman@yahoo.com', 'document_number': '35202-9876543-2', 'address': 'Gulberg III, Lahore'},
            {'full_name': 'Zainab Fatima', 'phone_number': '+923335551234', 'email': 'zainab.fatima@outlook.com', 'document_number': '37405-1122334-4', 'address': 'Sector F-7, Islamabad'},
            {'full_name': 'Bilal Ahmed', 'phone_number': '+923129998887', 'email': 'bilal.ahmed@gmail.com', 'document_number': '17301-5556667-7', 'address': 'Hayatabad, Peshawar'},
            {'full_name': 'Usman Tariq', 'phone_number': '+923457776665', 'email': 'usman.tariq@gmail.com', 'document_number': '33100-2233445-5', 'address': 'Samanabad, Faisalabad'},
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
        
        # Today's Operations Bookings
        # Today Check-ins
        guest_ali = Guest.objects.get(full_name='Muhammad Ali')
        room_103 = Room.objects.get(room_number='103')
        Booking.objects.get_or_create(
            guest=guest_ali,
            room=room_103,
            check_in=today,
            defaults={
                'check_out': today + timedelta(days=3),
                'adults': 2,
                'children': 0,
                'total_price': room_103.price_per_night * 3,
                'status': 'CHECKED_IN'
            }
        )

        guest_aisha = Guest.objects.get(full_name='Aisha Rehman')
        room_104 = Room.objects.get(room_number='104')
        Booking.objects.get_or_create(
            guest=guest_aisha,
            room=room_104,
            check_in=today,
            defaults={
                'check_out': today + timedelta(days=2),
                'adults': 1,
                'children': 0,
                'total_price': room_104.price_per_night * 2,
                'status': 'CONFIRMED'
            }
        )

        # Today Check-outs
        guest_bilal = Guest.objects.get(full_name='Bilal Ahmed')
        room_102 = Room.objects.get(room_number='102')
        Booking.objects.get_or_create(
            guest=guest_bilal,
            room=room_102,
            check_in=today - timedelta(days=3),
            defaults={
                'check_out': today,
                'adults': 1,
                'children': 0,
                'total_price': room_102.price_per_night * 3,
                'status': 'CHECKED_OUT'
            }
        )

        guest_usman = Guest.objects.get(full_name='Usman Tariq')
        room_201 = Room.objects.get(room_number='201')
        Booking.objects.get_or_create(
            guest=guest_usman,
            room=room_201,
            check_in=today - timedelta(days=4),
            defaults={
                'check_out': today,
                'adults': 2,
                'children': 0,
                'total_price': room_201.price_per_night * 4,
                'status': 'CHECKED_IN'
            }
        )

        # Future booking
        guest_zainab = Guest.objects.get(full_name='Zainab Fatima')
        room_203 = Room.objects.get(room_number='203')
        Booking.objects.get_or_create(
            guest=guest_zainab,
            room=room_203,
            check_in=today + timedelta(days=2),
            defaults={
                'check_out': today + timedelta(days=6),
                'adults': 3,
                'children': 1,
                'total_price': room_203.price_per_night * 4,
                'status': 'CONFIRMED'
            }
        )

        # 5. Generate Past Bookings for the last 30 days to build nice reports data
        self.stdout.write('Generating 30-day historical reports bookings...')
        pak_guests = [
            {'full_name': 'Zafar Iqbal', 'phone_number': '+923019876543', 'email': 'zafar.iqbal@yahoo.com', 'document_number': '34101-1122334-1', 'address': 'Saddar, Peshawar'},
            {'full_name': 'Amna Bibi', 'phone_number': '+923221234987', 'email': 'amna.bibi@gmail.com', 'document_number': '35201-9988776-2', 'address': 'Johar Town, Lahore'},
            {'full_name': 'Yasir Hussain', 'phone_number': '+923348765432', 'email': 'yasir.hussain@outlook.com', 'document_number': '42101-4455667-3', 'address': 'Clifton, Karachi'},
            {'full_name': 'Sobia Malik', 'phone_number': '+923461122334', 'email': 'sobia.malik@gmail.com', 'document_number': '61101-2233445-4', 'address': 'Sector G-9, Islamabad'},
            {'full_name': 'Kamran Khan', 'phone_number': '+923135556667', 'email': 'kamran.khan@yahoo.com', 'document_number': '21103-7788990-5', 'address': 'Cantt, Rawalpindi'},
            {'full_name': 'Nida Yasir', 'phone_number': '+923058887776', 'email': 'nida.yasir@outlook.com', 'document_number': '33102-1112223-6', 'address': 'People\'s Colony, Faisalabad'},
            {'full_name': 'Tariq Mahmood', 'phone_number': '+923234445556', 'email': 'tariq.mahmood@gmail.com', 'document_number': '38403-9998887-7', 'address': 'Sargodha Road, Faisalabad'},
            {'full_name': 'Sana Javed', 'phone_number': '+923149991112', 'email': 'sana.javed@gmail.com', 'document_number': '42201-5556667-8', 'address': 'Gulshan-e-Iqbal, Karachi'},
            {'full_name': 'Haris Rauf', 'phone_number': '+923067778889', 'email': 'haris.rauf@gmail.com', 'document_number': '35202-3334445-9', 'address': 'Model Town, Lahore'},
            {'full_name': 'Fawad Alam', 'phone_number': '+923362223334', 'email': 'fawad.alam@gmail.com', 'document_number': '42301-7776665-1', 'address': 'North Nazimabad, Karachi'},
        ]

        # Ensure these report guests exist
        history_guests = []
        for g_data in pak_guests:
            guest, _ = Guest.objects.get_or_create(
                phone_number=g_data['phone_number'],
                defaults={
                    'full_name': g_data['full_name'],
                    'email': g_data['email'],
                    'document_number': g_data['document_number'],
                    'address': g_data['address']
                }
            )
            history_guests.append(guest)

        # Generate 25 historical bookings
        random.seed(42)  # For deterministic seed
        all_rooms = list(Room.objects.all())

        for i in range(25):
            days_ago = random.randint(3, 28)
            check_in_date = today - timedelta(days=days_ago)
            stay_nights = random.randint(1, 4)
            check_out_date = check_in_date + timedelta(days=stay_nights)
            
            guest = random.choice(history_guests)
            room = random.choice(all_rooms)
            
            # Determine status: 90% checked out, 10% cancelled
            status = 'CHECKED_OUT' if random.random() > 0.1 else 'CANCELLED'
            
            Booking.objects.create(
                guest=guest,
                room=room,
                check_in=check_in_date,
                check_out=check_out_date,
                adults=random.randint(1, 2),
                children=random.randint(0, 1),
                total_price=room.price_per_night * stay_nights,
                status=status
            )

        self.stdout.write(self.style.SUCCESS('Successfully seeded database!'))


