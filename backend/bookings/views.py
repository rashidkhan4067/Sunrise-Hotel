from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from django.utils import timezone
from .models import Booking
from .serializers import BookingSerializer
from accounts.permissions import IsHotelStaff


class BookingViewSet(viewsets.ModelViewSet):
    """ViewSet for managing hotel room bookings."""
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated, IsHotelStaff]
    filterset_fields = ['status', 'room', 'guest', 'check_in', 'check_out']
    search_fields = ['guest__full_name', 'room__room_number', 'booking_id']

    @action(detail=True, methods=['POST'], url_path='check-in')
    @transaction.atomic
    def check_in(self, request, pk=None):
        """Action to check-in the guest, changing booking status and room status."""
        booking = self.get_object()
        
        if booking.status not in ['PENDING', 'CONFIRMED']:
            return Response(
                {"error": f"Cannot check-in booking with status {booking.status}. Must be PENDING or CONFIRMED."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        room = booking.room
        if room.status == 'MAINTENANCE':
            return Response(
                {"error": "Room is under maintenance. Cannot perform check-in."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Update booking status
        booking.status = 'CHECKED_IN'
        booking.save()
        
        # Update room status to OCCUPIED
        room.status = 'OCCUPIED'
        room.save()
        
        serializer = self.get_serializer(booking)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['POST'], url_path='check-out')
    @transaction.atomic
    def check_out(self, request, pk=None):
        """Action to check-out the guest, freeing the room."""
        booking = self.get_object()
        
        if booking.status != 'CHECKED_IN':
            return Response(
                {"error": f"Cannot check-out booking with status {booking.status}. Booking must be CHECKED_IN."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Update booking status
        booking.status = 'CHECKED_OUT'
        # Record check-out date as today if checked out early, or keep scheduled date
        # (For simple rules we just change status)
        booking.save()
        
        # Update room status back to AVAILABLE
        room = booking.room
        room.status = 'AVAILABLE'
        room.save()
        
        serializer = self.get_serializer(booking)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['POST'], url_path='cancel')
    @transaction.atomic
    def cancel(self, request, pk=None):
        """Action to cancel a booking."""
        booking = self.get_object()
        
        if booking.status in ['CHECKED_OUT', 'CANCELLED']:
            return Response(
                {"error": f"Cannot cancel a booking that is already {booking.status}."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        old_status = booking.status
        booking.status = 'CANCELLED'
        booking.save()
        
        # If the booking was currently CHECKED_IN, we need to free the room
        if old_status == 'CHECKED_IN':
            room = booking.room
            room.status = 'AVAILABLE'
            room.save()
            
        serializer = self.get_serializer(booking)
        return Response(serializer.data, status=status.HTTP_200_OK)
