from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from django.utils import timezone
from .models import Booking, Folio, FolioItem
from .serializers import BookingSerializer, FolioSerializer, FolioItemSerializer
from accounts.permissions import IsHotelStaff
from reports.models import log_audit_event
from core.pricing import calculate_stay_pricing


class BookingViewSet(viewsets.ModelViewSet):
    """ViewSet for managing hotel room bookings."""
    serializer_class = BookingSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'create', 'cancel']:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated(), IsHotelStaff()]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['ADMIN', 'RECEPTIONIST']:
            queryset = Booking.objects.filter(is_deleted=False)
        else:
            queryset = Booking.objects.filter(guest__email__iexact=user.email, is_deleted=False)

        search = self.request.query_params.get('search')
        if search:
            from django.db.models import Q
            queryset = queryset.filter(
                Q(booking_id__icontains=search) |
                Q(guest__full_name__icontains=search) |
                Q(room__room_number__icontains=search)
            )
        status = self.request.query_params.get('status')
        if status:
            queryset = queryset.filter(status=status)
        room = self.request.query_params.get('room')
        if room:
            queryset = queryset.filter(room_id=room)
        guest = self.request.query_params.get('guest')
        if guest:
            queryset = queryset.filter(guest_id=guest)
        check_in = self.request.query_params.get('check_in')
        if check_in:
            queryset = queryset.filter(check_in=check_in)
        check_out = self.request.query_params.get('check_out')
        if check_out:
            queryset = queryset.filter(check_out=check_out)
        return queryset

    def create(self, request, *args, **kwargs):
        room_id = request.data.get('room') or request.data.get('room_id')
        if room_id:
            from rooms.models import Room
            try:
                room_obj = Room.objects.get(id=room_id)
                if room_obj.status == 'MAINTENANCE':
                    return Response(
                        {"error": f"Room {room_obj.room_number} is currently under maintenance and cannot be reserved."},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            except (Room.DoesNotExist, ValueError):
                pass
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        booking = serializer.save()
        
        room_price = booking.room.price_per_night if booking.room else 100.00
        pricing = calculate_stay_pricing(room_price, booking.check_in, booking.check_out)
        booking.total_price = pricing['grand_total']
        if booking.room and not booking.requested_room_type:
            booking.requested_room_type = booking.room.room_type
        booking.save()

        room_str = booking.room.room_number if booking.room else (booking.requested_room_type or 'Unassigned')
        log_audit_event(
            user=self.request.user,
            action='CREATE_BOOKING',
            description=f"Created booking for {booking.guest.full_name} in Room {room_str} ({booking.check_in} to {booking.check_out})",
            model_name='Booking',
            object_id=booking.booking_id,
            request=self.request
        )
        
        from accounts.models import User
        from notifications.models import Notification
        
        # If created by guest (CLIENT): notify all hotel staff
        if self.request.user.role == 'CLIENT':
            staff_users = User.objects.filter(role__in=['ADMIN', 'RECEPTIONIST'])
            notifications = []
            for staff in staff_users:
                notifications.append(
                    Notification(
                        recipient=staff,
                        title="New Booking Received",
                        description=f"{booking.guest.full_name} booked room {booking.room.room_number} ({booking.check_in} to {booking.check_out}).",
                        icon='booking'
                    )
                )
            Notification.objects.bulk_create(notifications)
            
        # If created by staff (ADMIN or RECEPTIONIST):
        else:
            # 1. Notify the guest if they have a user account
            if booking.guest and booking.guest.email:
                guest_user = User.objects.filter(email__iexact=booking.guest.email).first()
                if guest_user:
                    Notification.objects.create(
                        recipient=guest_user,
                        title="New Booking Created",
                        description=f"A booking for room {booking.room.room_number} from {booking.check_in} to {booking.check_out} has been created for you.",
                        icon='booking'
                    )
            
            # 2. Notify other staff members
            staff_users = User.objects.filter(role__in=['ADMIN', 'RECEPTIONIST']).exclude(id=self.request.user.id)
            notifications = []
            for staff in staff_users:
                notifications.append(
                    Notification(
                        recipient=staff,
                        title="Booking Created by Staff",
                        description=f"Booking for {booking.guest.full_name} (Room {booking.room.room_number}) was created by {self.request.user.email}.",
                        icon='booking'
                    )
                )
            if notifications:
                Notification.objects.bulk_create(notifications)

    def perform_update(self, serializer):
        old_status = self.get_object().status
        booking = serializer.save()
        
        if old_status != booking.status:
            from accounts.models import User
            from notifications.models import Notification
            
            # If status changed by staff: notify guest and other staff
            if self.request.user.role in ['ADMIN', 'RECEPTIONIST']:
                # 1. Notify guest
                if booking.guest and booking.guest.email:
                    guest_user = User.objects.filter(email__iexact=booking.guest.email).first()
                    if guest_user:
                        title = "Booking Update"
                        desc = f"Your booking for room {booking.room.room_number} is now {booking.status}."
                        if booking.status == 'CONFIRMED':
                            title = "Booking Confirmed"
                            desc = f"Your booking for room {booking.room.room_number} has been confirmed!"
                        elif booking.status == 'CANCELLED':
                            title = "Booking Cancelled"
                            desc = f"Your booking for room {booking.room.room_number} has been cancelled by the staff."
                            
                        Notification.objects.create(
                            recipient=guest_user,
                            title=title,
                            description=desc,
                            icon='booking'
                        )
                
                # 2. Notify other staff
                staff_users = User.objects.filter(role__in=['ADMIN', 'RECEPTIONIST']).exclude(id=self.request.user.id)
                notifications = []
                for staff in staff_users:
                    notifications.append(
                        Notification(
                            recipient=staff,
                            title="Booking Updated by Staff",
                            description=f"Booking for {booking.guest.full_name} was updated to {booking.status} by {self.request.user.email}.",
                            icon='booking'
                        )
                    )
                if notifications:
                    Notification.objects.bulk_create(notifications)
                    
            # If status changed by guest (CLIENT): notify all staff
            elif self.request.user.role == 'CLIENT':
                staff_users = User.objects.filter(role__in=['ADMIN', 'RECEPTIONIST'])
                notifications = []
                for staff in staff_users:
                    notifications.append(
                        Notification(
                            recipient=staff,
                            title="Booking Updated by Guest",
                            description=f"{booking.guest.full_name} updated booking status to {booking.status}.",
                            icon='booking'
                        )
                    )
                Notification.objects.bulk_create(notifications)

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
            
        # Support dynamic room assignment at check-in if room is not yet assigned or being swapped
        room_id = request.data.get('room') or request.data.get('room_id')
        if room_id:
            from rooms.models import Room
            try:
                booking.room = Room.objects.get(id=room_id)
            except Room.DoesNotExist:
                pass

        room = booking.room
        if not room:
            return Response(
                {"error": "No physical room assigned to this booking. Please select a room to check-in."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        if room.status == 'MAINTENANCE':
            return Response(
                {"error": "Room is under maintenance. Cannot perform check-in."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not getattr(room, 'is_clean', True):
            return Response(
                {"error": f"Room {room.room_number} is currently dirty. Please assign a clean room or request housekeeping priority."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Update booking status
        booking.status = 'CHECKED_IN'
        booking.save()
        
        # Update room status to OCCUPIED
        room.status = 'OCCUPIED'
        room.save()

        log_audit_event(
            user=request.user,
            action='CHECK_IN',
            description=f"Checked in guest {booking.guest.full_name} into Room {room.room_number}",
            model_name='Booking',
            object_id=booking.booking_id,
            request=request
        )
        
        # Auto-post room rate and taxes to Guest Folio based on HotelConfiguration & Dynamic Pricing
        folio, created = Folio.objects.get_or_create(booking=booking)
        pricing = calculate_stay_pricing(room.price_per_night, booking.check_in, booking.check_out)
        
        FolioItem.objects.create(
            folio=folio,
            item_type='ROOM',
            description=f"Room Charge: Room {room.room_number} ({pricing['num_nights']} night(s), base Total ${pricing['base_total']:.2f})",
            amount=pricing['base_total']
        )
        
        FolioItem.objects.create(
            folio=folio,
            item_type='TAX',
            description=f"Room Tax ({pricing['tax_rate_pct']}%) for Room {room.room_number}",
            amount=pricing['tax_amount']
        )
        
        # Notify Guest
        if booking.guest and booking.guest.email:
            from accounts.models import User
            from notifications.models import Notification
            guest_user = User.objects.filter(email__iexact=booking.guest.email).first()
            if guest_user:
                Notification.objects.create(
                    recipient=guest_user,
                    title="Check-In Successful",
                    description=f"You have been successfully checked into room {room.room_number}.",
                    icon='booking'
                )
        
        # Notify Other Staff
        from accounts.models import User
        from notifications.models import Notification
        staff_users = User.objects.filter(role__in=['ADMIN', 'RECEPTIONIST']).exclude(id=request.user.id)
        notifications = []
        for staff in staff_users:
            notifications.append(
                Notification(
                    recipient=staff,
                    title="Guest Checked In",
                    description=f"{booking.guest.full_name} has been checked into room {room.room_number} by {request.user.email}.",
                    icon='booking'
                )
            )
        if notifications:
            Notification.objects.bulk_create(notifications)
        
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
            
        # Folio outstanding balance enforcement
        folio = getattr(booking, 'folio', None)
        if folio:
            balance = sum(item.amount for item in folio.items.all())
            if balance != 0:
                return Response(
                    {"error": f"Cannot check-out guest with an outstanding folio balance. Current balance: ${balance:.2f}. Please post payment/refund first before check-out."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
        # Update booking status
        booking.status = 'CHECKED_OUT'
        # Record check-out date as today if checked out early, or keep scheduled date
        # (For simple rules we just change status)
        booking.save()
        
        # Update room status back to AVAILABLE and mark it dirty
        room = booking.room
        room.status = 'AVAILABLE'
        room.is_clean = False
        room.is_inspected = False
        room.save()

        log_audit_event(
            user=request.user,
            action='CHECK_OUT',
            description=f"Checked out guest {booking.guest.full_name} from Room {room.room_number}",
            model_name='Booking',
            object_id=booking.booking_id,
            request=request
        )
        
        # Notify Guest
        if booking.guest and booking.guest.email:
            from accounts.models import User
            from notifications.models import Notification
            guest_user = User.objects.filter(email__iexact=booking.guest.email).first()
            if guest_user:
                Notification.objects.create(
                    recipient=guest_user,
                    title="Check-Out Successful",
                    description=f"You have been successfully checked out of room {room.room_number}. Thank you for staying with us!",
                    icon='booking'
                )
        
        # Notify Other Staff
        from accounts.models import User
        from notifications.models import Notification
        staff_users = User.objects.filter(role__in=['ADMIN', 'RECEPTIONIST']).exclude(id=request.user.id)
        notifications = []
        for staff in staff_users:
            notifications.append(
                Notification(
                    recipient=staff,
                    title="Guest Checked Out",
                    description=f"{booking.guest.full_name} has been checked out of room {room.room_number} by {request.user.email}.",
                    icon='booking'
                )
            )
        if notifications:
            Notification.objects.bulk_create(notifications)
        
        serializer = self.get_serializer(booking)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['POST'], url_path='cancel')
    @transaction.atomic
    def cancel(self, request, pk=None):
        """Action to cancel a booking."""
        booking = self.get_object()
        
        user = request.user
        if user.role not in ['ADMIN', 'RECEPTIONIST']:
            is_owner = (booking.guest.email and booking.guest.email.lower() == user.email.lower())
            if not is_owner:
                return Response(
                    {"error": "You do not have permission to cancel this booking."},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        if booking.status in ['CHECKED_OUT', 'CANCELLED']:
            return Response(
                {"error": f"Cannot cancel a booking that is already {booking.status}."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        old_status = booking.status
        booking.status = 'CANCELLED'
        booking.save()

        log_audit_event(
            user=request.user,
            action='CANCEL_BOOKING',
            description=f"Cancelled booking for {booking.guest.full_name} in Room {booking.room.room_number}",
            model_name='Booking',
            object_id=booking.booking_id,
            request=request
        )
        
        # If the booking was currently CHECKED_IN, we need to free the room
        if old_status == 'CHECKED_IN':
            room = booking.room
            room.status = 'AVAILABLE'
            room.save()
            
        # Notification trigger
        from accounts.models import User
        from notifications.models import Notification
        
        # If cancelled by staff (ADMIN or RECEPTIONIST): notify guest and other staff
        if user.role in ['ADMIN', 'RECEPTIONIST']:
            if booking.guest and booking.guest.email:
                guest_user = User.objects.filter(email__iexact=booking.guest.email).first()
                if guest_user:
                    Notification.objects.create(
                        recipient=guest_user,
                        title="Booking Cancelled",
                        description=f"Your booking for room {booking.room.room_number} from {booking.check_in} to {booking.check_out} has been cancelled by the staff.",
                        icon='booking'
                    )
            
            # Notify other staff
            staff_users = User.objects.filter(role__in=['ADMIN', 'RECEPTIONIST']).exclude(id=user.id)
            notifications = []
            for staff in staff_users:
                notifications.append(
                    Notification(
                        recipient=staff,
                        title="Booking Cancelled by Staff",
                        description=f"Booking for {booking.guest.full_name} in room {booking.room.room_number} was cancelled by {user.email}.",
                        icon='booking'
                    )
                )
            if notifications:
                Notification.objects.bulk_create(notifications)
                
        # If cancelled by guest (CLIENT): notify all staff
        elif user.role == 'CLIENT':
            staff_users = User.objects.filter(role__in=['ADMIN', 'RECEPTIONIST'])
            notifications = []
            for staff in staff_users:
                notifications.append(
                    Notification(
                        recipient=staff,
                        title="Booking Cancelled by Guest",
                        description=f"{booking.guest.full_name} cancelled booking {booking.booking_id} for room {booking.room.room_number}.",
                        icon='booking'
                    )
                )
            Notification.objects.bulk_create(notifications)
            
        serializer = self.get_serializer(booking)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def perform_destroy(self, instance):
        # Notify the guest and other staff before deleting the booking object
        if instance.guest and instance.guest.email:
            from accounts.models import User
            from notifications.models import Notification
            
            # 1. Notify guest
            guest_user = User.objects.filter(email__iexact=instance.guest.email).first()
            if guest_user:
                Notification.objects.create(
                    recipient=guest_user,
                    title="Booking Deleted",
                    description=f"Your booking for room {instance.room.room_number} from {instance.check_in} to {instance.check_out} has been removed by the staff.",
                    icon='booking'
                )
                
            # 2. Notify other staff
            staff_users = User.objects.filter(role__in=['ADMIN', 'RECEPTIONIST']).exclude(id=self.request.user.id)
            notifications = []
            for staff in staff_users:
                notifications.append(
                    Notification(
                        recipient=staff,
                        title="Booking Deleted by Staff",
                        description=f"Booking for {instance.guest.full_name} in room {instance.room.room_number} was deleted by {self.request.user.email}.",
                        icon='booking'
                    )
                )
            if notifications:
                Notification.objects.bulk_create(notifications)
                
        # If the booking was CHECKED_IN, we free the room
        if instance.status == 'CHECKED_IN':
            room = instance.room
            room.status = 'AVAILABLE'
            room.save()

        log_audit_event(
            user=self.request.user,
            action='BOOKING_DELETED',
            description=f"Soft deleted booking {instance.booking_id} for {instance.guest.full_name}",
            model_name='Booking',
            object_id=instance.booking_id,
            request=self.request
        )
        instance.soft_delete()

    @action(detail=True, methods=['GET'], url_path='invoice')
    def get_invoice(self, request, pk=None):
        """Action to generate official guest folio invoice receipt data."""
        booking = self.get_object()
        folio, _ = Folio.objects.get_or_create(booking=booking)
        
        items = FolioItem.objects.filter(folio=folio)
        charges = sum(item.amount for item in items if item.item_type != 'PAYMENT')
        payments = sum(abs(item.amount) for item in items if item.item_type == 'PAYMENT')
        balance = charges - payments

        from reports.models import HotelConfiguration
        config = HotelConfiguration.get_config()

        return Response({
            'invoiceNumber': f"INV-{str(booking.booking_id)[:8].upper()}",
            'hotelInfo': {
                'name': config.hotel_name,
                'taxRate': float(config.tax_rate),
                'checkInTime': config.check_in_time,
                'checkOutTime': config.check_out_time,
            },
            'guestInfo': {
                'fullName': booking.guest.full_name,
                'email': booking.guest.email,
                'phone': booking.guest.phone_number,
                'documentNumber': booking.guest.document_number,
            },
            'bookingInfo': {
                'bookingId': str(booking.booking_id),
                'roomNumber': booking.room.room_number if booking.room else 'Unassigned',
                'roomType': booking.room.room_type if booking.room else (booking.requested_room_type or 'Standard'),
                'checkIn': booking.check_in.strftime('%Y-%m-%d'),
                'checkOut': booking.check_out.strftime('%Y-%m-%d'),
                'status': booking.status,
            },
            'folioItems': [
                {
                    'id': item.id,
                    'type': item.item_type,
                    'description': item.description,
                    'amount': float(item.amount),
                    'date': item.created_at.strftime('%Y-%m-%d %H:%M')
                } for item in items
            ],
            'financialSummary': {
                'totalCharges': float(charges),
                'totalPayments': float(payments),
                'balanceDue': float(balance),
                'isPaid': balance <= 0
            }
        }, status=status.HTTP_200_OK)


class FolioViewSet(viewsets.ModelViewSet):
    """ViewSet for managing booking folios."""
    serializer_class = FolioSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['ADMIN', 'RECEPTIONIST']:
            queryset = Folio.objects.all()
        else:
            queryset = Folio.objects.filter(booking__guest__email__iexact=user.email)

        booking_id = self.request.query_params.get('booking')
        if booking_id:
            queryset = queryset.filter(booking_id=booking_id)
        return queryset

    def list(self, request, *args, **kwargs):
        booking_id = request.query_params.get('booking')
        if booking_id:
            from bookings.models import Booking
            try:
                booking = Booking.objects.get(booking_id=booking_id)
                if not hasattr(booking, 'folio'):
                    Folio.objects.create(booking=booking)
            except Booking.DoesNotExist:
                pass
        return super().list(request, *args, **kwargs)


class FolioItemViewSet(viewsets.ModelViewSet):
    """ViewSet for managing folio charges and payments."""
    serializer_class = FolioItemSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsHotelStaff()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['ADMIN', 'RECEPTIONIST']:
            return FolioItem.objects.all()
        return FolioItem.objects.filter(folio__booking__guest__email__iexact=user.email)

    def perform_create(self, serializer):
        item = serializer.save()
        action_type = 'ADD_PAYMENT' if item.item_type == 'PAYMENT' else 'ADD_CHARGE'
        log_audit_event(
            user=self.request.user,
            action=action_type,
            description=f"Added {item.get_item_type_display()} of ${item.amount} to Folio for Booking {item.folio.booking.booking_id}",
            model_name='FolioItem',
            object_id=item.id,
            request=self.request
        )

