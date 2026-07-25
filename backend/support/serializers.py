from rest_framework import serializers
from .models import SupportTicket, ChatMessage
from bookings.models import Booking
from guests.models import Guest

class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = ['id', 'ticket', 'sender', 'sender_role', 'sender_name', 'message', 'timestamp', 'is_read']
        read_only_fields = ['id', 'ticket', 'sender', 'timestamp']


class SupportTicketSerializer(serializers.ModelSerializer):
    guest_name = serializers.SerializerMethodField()
    guest_email = serializers.CharField(source='guest.email', read_only=True)
    room_number = serializers.SerializerMethodField()
    unread_count_staff = serializers.SerializerMethodField()
    unread_count_guest = serializers.SerializerMethodField()
    messages = ChatMessageSerializer(many=True, read_only=True)

    class Meta:
        model = SupportTicket
        fields = [
            'id', 'ticket_id', 'guest', 'guest_name', 'guest_email', 'room_number',
            'subject', 'category', 'priority', 'status', 'created_at', 'updated_at',
            'unread_count_staff', 'unread_count_guest', 'messages'
        ]
        read_only_fields = ['id', 'ticket_id', 'guest', 'created_at', 'updated_at']

    def get_guest_name(self, obj):
        if obj.guest:
            full_name = obj.guest.get_full_name()
            if full_name and full_name.strip():
                return full_name
            return obj.guest.email.split('@')[0].capitalize()
        return "Guest"

    def get_room_number(self, obj):
        if not obj.guest or not obj.guest.email:
            return None
        guest_obj = Guest.objects.filter(email__iexact=obj.guest.email).first()
        if guest_obj:
            active_booking = Booking.objects.filter(guest=guest_obj, status='CHECKED_IN').first()
            if active_booking and active_booking.room:
                return active_booking.room.room_number
            latest_booking = Booking.objects.filter(guest=guest_obj).order_by('-created_at').first()
            if latest_booking and latest_booking.room:
                return latest_booking.room.room_number
        return None

    def get_unread_count_staff(self, obj):
        return obj.messages.filter(sender_role='GUEST', is_read=False).count()

    def get_unread_count_guest(self, obj):
        return obj.messages.filter(sender_role__in=['STAFF', 'ADMIN'], is_read=False).count()
