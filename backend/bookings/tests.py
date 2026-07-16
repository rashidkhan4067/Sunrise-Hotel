from django.test import TestCase
from datetime import date, timedelta
from rest_framework import serializers
from django.contrib.auth import get_user_model
from rooms.models import Room
from guests.models import Guest
from bookings.models import Booking
from bookings.serializers import BookingSerializer

User = get_user_model()


class BookingBusinessRulesTestCase(TestCase):
    """Test suite for booking business validation rules."""

    def setUp(self):
        # Create standard rooms
        self.available_room = Room.objects.create(
            room_number='401',
            room_type='SINGLE',
            price_per_night=100.00,
            status='AVAILABLE'
        )
        self.maintenance_room = Room.objects.create(
            room_number='402',
            room_type='SINGLE',
            price_per_night=100.00,
            status='MAINTENANCE'
        )
        # Create a guest
        self.guest = Guest.objects.create(
            full_name='Test Guest',
            phone_number='1234567890',
            document_number='ID-99999'
        )

    def test_checkout_date_must_be_after_checkin(self):
        """Verify check-out date cannot be equal or prior to check-in."""
        today = date.today()
        data = {
            'guest': self.guest.id,
            'room': self.available_room.id,
            'check_in': today,
            'check_out': today,  # Same day
            'adults': 1
        }
        serializer = BookingSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('check_out', serializer.errors)

        data['check_out'] = today - timedelta(days=1)  # Prior day
        serializer = BookingSerializer(data=data)
        self.assertFalse(serializer.is_valid())

    def test_checkin_cannot_be_in_the_past(self):
        """Verify new bookings cannot have a check-in date in the past."""
        yesterday = date.today() - timedelta(days=1)
        data = {
            'guest': self.guest.id,
            'room': self.available_room.id,
            'check_in': yesterday,
            'check_out': date.today(),
            'adults': 1
        }
        serializer = BookingSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('check_in', serializer.errors)

    def test_cannot_book_maintenance_room(self):
        """Verify rooms in maintenance mode cannot be booked."""
        today = date.today()
        data = {
            'guest': self.guest.id,
            'room': self.maintenance_room.id,
            'check_in': today,
            'check_out': today + timedelta(days=2),
            'adults': 1
        }
        serializer = BookingSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('room', serializer.errors)

    def test_prevent_double_booking(self):
        """Verify overlapping bookings are rejected."""
        today = date.today()
        # Create an existing booking
        Booking.objects.create(
            guest=self.guest,
            room=self.available_room,
            check_in=today,
            check_out=today + timedelta(days=5),
            total_price=500.00,
            status='CONFIRMED'
        )

        # Try to book overlapping dates: check_in during existing stay
        data = {
            'guest': self.guest.id,
            'room': self.available_room.id,
            'check_in': today + timedelta(days=2),
            'check_out': today + timedelta(days=4),
            'adults': 1
        }
        serializer = BookingSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('room', serializer.errors)

        # Try to book overlapping dates: check_out during existing stay
        data = {
            'guest': self.guest.id,
            'room': self.available_room.id,
            'check_in': today - timedelta(days=2),  # Wait, check_in in past is rejected, so check_in=today-1 isn't allowed anyway.
            # But let's check check_in=today, check_out=today+1 which overlaps
            'check_in': today,
            'check_out': today + timedelta(days=2),
            'adults': 1
        }
        serializer = BookingSerializer(data=data)
        self.assertFalse(serializer.is_valid())

    def test_auto_calculates_total_price(self):
        """Verify price is calculated automatically based on nights * room price."""
        today = date.today()
        data = {
            'guest': self.guest.id,
            'room': self.available_room.id,
            'check_in': today,
            'check_out': today + timedelta(days=3),
            'adults': 1
        }
        serializer = BookingSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        self.assertEqual(serializer.validated_data['total_price'], 300.00)
