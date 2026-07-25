from datetime import date
from rest_framework import serializers
from django.db.models import Q
from .models import Booking, Folio, FolioItem
from rooms.models import Room
from guests.models import Guest
from rooms.serializers import RoomSerializer
from guests.serializers import GuestSerializer


class BookingSerializer(serializers.ModelSerializer):
    guest_details = GuestSerializer(source='guest', read_only=True)
    room_details = RoomSerializer(source='room', read_only=True)
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)

    class Meta:
        model = Booking
        fields = (
            'booking_id', 'guest', 'guest_details', 'room', 'room_details',
            'check_in', 'check_out', 'adults', 'children', 'total_price', 'status',
            'created_at', 'updated_at'
        )
        read_only_fields = ('booking_id', 'created_at', 'updated_at')

    def validate(self, attrs):
        # Retrieve check_in and check_out dates from attrs (or self.instance if updating)
        check_in = attrs.get('check_in', self.instance.check_in if self.instance else None)
        check_out = attrs.get('check_out', self.instance.check_out if self.instance else None)
        room = attrs.get('room', self.instance.room if self.instance else None)
        status = attrs.get('status', self.instance.status if self.instance else 'PENDING')

        if not check_in or not check_out:
            raise serializers.ValidationError("Both check-in and check-out dates are required.")

        # Business Rule 1: Check-out must be after check-in
        if check_out <= check_in:
            raise serializers.ValidationError({
                "check_out": "Check-out date must be after check-in date."
            })

        # Check-in date cannot be in the past for new bookings
        if not self.instance and check_in < date.today():
            raise serializers.ValidationError({
                "check_in": "Check-in date cannot be in the past."
            })

        # Business Rule 2: Room must be available (not in maintenance)
        if room and room.status == 'MAINTENANCE':
            raise serializers.ValidationError({
                "room": "Selected room is currently undergoing maintenance and cannot be booked."
            })

        # Business Rule 3: Prevent double bookings (overlaps)
        # We search for any active bookings (not CANCELLED or CHECKED_OUT) that overlap with requested dates
        overlap_query = Q(
            room=room,
            check_in__lt=check_out,
            check_out__gt=check_in
        )
        # Exclude current booking when updating
        if self.instance:
            overlap_query &= ~Q(booking_id=self.instance.booking_id)
            
        # Exclude cancelled or checked-out bookings
        overlap_query &= ~Q(status__in=['CANCELLED', 'CHECKED_OUT'])

        overlapping_bookings = Booking.objects.filter(overlap_query, is_deleted=False)
        if overlapping_bookings.exists():
            raise serializers.ValidationError({
                "room": "This room is already booked for the selected dates."
            })

        # Business Rule 4: Auto-calculate Total Price
        if room:
            num_nights = (check_out - check_in).days
            if num_nights <= 0:
                num_nights = 1
            
            # Auto-calculate price
            attrs['total_price'] = room.price_per_night * num_nights

        return attrs


class FolioItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = FolioItem
        fields = ('id', 'folio', 'item_type', 'description', 'amount', 'created_at')


class FolioSerializer(serializers.ModelSerializer):
    items = FolioItemSerializer(many=True, read_only=True)
    balance = serializers.SerializerMethodField()

    class Meta:
        model = Folio
        fields = ('id', 'booking', 'is_closed', 'items', 'balance', 'created_at')

    def get_balance(self, obj):
        total = sum(item.amount for item in obj.items.all())
        return total
