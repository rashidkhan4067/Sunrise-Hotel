from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from .models import Room
from .serializers import RoomSerializer
from accounts.permissions import IsHotelStaff
from bookings.models import Booking
from reports.models import log_audit_event


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class RoomViewSet(viewsets.ModelViewSet):
    """ViewSet for managing hotel rooms."""
    serializer_class = RoomSerializer
    pagination_class = StandardResultsSetPagination

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'available_rooms']:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated(), IsHotelStaff()]

    def get_queryset(self):
        queryset = Room.objects.filter(is_archived=False)
        search = self.request.query_params.get('search')
        if search:
            from django.db.models import Q
            queryset = queryset.filter(
                Q(room_number__icontains=search) | Q(room_type__icontains=search)
            )
        status = self.request.query_params.get('status')
        if status:
            queryset = queryset.filter(status=status)
        room_type = self.request.query_params.get('room_type')
        if room_type:
            queryset = queryset.filter(room_type=room_type)
        floor = self.request.query_params.get('floor')
        if floor:
            queryset = queryset.filter(floor=floor)
            
        is_clean = self.request.query_params.get('is_clean')
        if is_clean is not None and is_clean != '' and is_clean != 'all':
            queryset = queryset.filter(is_clean=is_clean.lower() == 'true')

        is_inspected = self.request.query_params.get('is_inspected')
        if is_inspected is not None and is_inspected != '' and is_inspected != 'all':
            queryset = queryset.filter(is_inspected=is_inspected.lower() == 'true')
            
        ordering = self.request.query_params.get('ordering')
        if ordering:
            queryset = queryset.order_by(ordering)
        return queryset

    def create(self, request, *args, **kwargs):
        room_number = request.data.get('room_number')
        if Room.objects.filter(room_number=room_number, is_archived=False).exists():
            return Response(
                {"error": "A room with this room number is already registered."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        price = request.data.get('price_per_night')
        if price is not None and float(price) < 0:
            return Response(
                {"error": "Price per night cannot be negative."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        capacity = request.data.get('capacity')
        if capacity is not None and int(capacity) < 1:
            return Response(
                {"error": "Capacity must be at least 1."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        res = super().create(request, *args, **kwargs)
        if res.status_code == 201:
            log_audit_event(
                user=request.user,
                action='ROOM_CREATED',
                description=f"Created Room {request.data.get('room_number')}",
                model_name='Room',
                object_id=res.data.get('id'),
                request=request
            )
        return res

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        next_status = request.data.get('status')
        if next_status == 'AVAILABLE' and instance.status == 'OCCUPIED':
            active_booking = Booking.objects.filter(room=instance, status='CHECKED_IN').exists()
            if active_booking:
                return Response(
                    {"error": "Cannot set occupied room to available directly. Please check out the active guest first."},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
        room_number = request.data.get('room_number')
        if room_number and room_number != instance.room_number:
            if Room.objects.filter(room_number=room_number, is_archived=False).exists():
                return Response(
                    {"error": "A room with this room number is already registered."},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
        price = request.data.get('price_per_night')
        if price is not None and float(price) < 0:
            return Response(
                {"error": "Price per night cannot be negative."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        capacity = request.data.get('capacity')
        if capacity is not None and int(capacity) < 1:
            return Response(
                {"error": "Capacity must be at least 1."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        log_audit_event(
            user=request.user,
            action='ROOM_UPDATED',
            description=f"Updated details for Room {instance.room_number}",
            model_name='Room',
            object_id=instance.id,
            request=request
        )
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        
        import datetime
        today = datetime.date.today()
        # Verify no active or future bookings
        has_active_or_future_bookings = Booking.objects.filter(
            room=instance,
            check_out__gte=today
        ).exclude(status__in=['CANCELLED', 'CHECKED_OUT']).exists()
        
        if has_active_or_future_bookings:
            return Response(
                {"error": "Cannot delete or archive rooms with active or future bookings. Please cancel or check-out active stays first."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        log_audit_event(
            user=request.user,
            action='ROOM_DELETED',
            description=f"Soft deleted/archived Room {instance.room_number}",
            model_name='Room',
            object_id=instance.id,
            request=request
        )
        instance.is_archived = True
        instance.soft_delete()
        return Response({"status": "Room archived successfully"}, status=status.HTTP_200_OK)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        data = serializer.data
        
        # Query current active booking
        import datetime
        today = datetime.date.today()
        current_booking = Booking.objects.filter(
            room=instance,
            status='CHECKED_IN'
        ).first()
        
        if not current_booking:
            # Fall back to confirmed booking covering today
            current_booking = Booking.objects.filter(
                room=instance,
                status='CONFIRMED',
                check_in__lte=today,
                check_out__gte=today
            ).first()
            
        if current_booking:
            data['current_booking'] = {
                'id': str(current_booking.booking_id),
                'check_in': current_booking.check_in.strftime('%Y-%m-%d'),
                'check_out': current_booking.check_out.strftime('%Y-%m-%d'),
                'status': current_booking.status,
                'guest': {
                    'id': current_booking.guest.id,
                    'name': current_booking.guest.full_name,
                    'phone': current_booking.guest.phone_number,
                    'email': current_booking.guest.email or '',
                }
            }
        else:
            data['current_booking'] = None
            
        # Query booking history
        history = Booking.objects.filter(room=instance).order_by('-created_at')[:10]
        data['booking_history'] = [
            {
                'id': str(b.booking_id),
                'check_in': b.check_in.strftime('%Y-%m-%d'),
                'check_out': b.check_out.strftime('%Y-%m-%d'),
                'status': b.status,
                'guest_name': b.guest.full_name,
                'total_price': float(b.total_price),
            } for b in history
        ]
        
        return Response(data)

    @action(detail=False, methods=['GET'], url_path='available')
    def available_rooms(self, request):
        check_in_str = request.query_params.get('check_in')
        check_out_str = request.query_params.get('check_out')
        
        if not check_in_str or not check_out_str:
            return Response(
                {"error": "Both check_in and check_out query parameters are required."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        import datetime
        try:
            check_in = datetime.datetime.strptime(check_in_str, '%Y-%m-%d').date()
            check_out = datetime.datetime.strptime(check_out_str, '%Y-%m-%d').date()
        except ValueError:
            return Response(
                {"error": "Invalid date format. Use YYYY-MM-DD."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        if check_out <= check_in:
            return Response(
                {"error": "check_out must be after check_in."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Get all rooms that are NOT in MAINTENANCE status
        rooms = Room.objects.exclude(status='MAINTENANCE')
        
        # Filter out rooms that have overlapping active bookings
        from django.db.models import Q
        overlapping_rooms = Booking.objects.filter(
            check_in__lt=check_out,
            check_out__gt=check_in
        ).exclude(status__in=['CANCELLED', 'CHECKED_OUT']).values_list('room_id', flat=True)
        
        available_rooms = rooms.exclude(id__in=overlapping_rooms)
        
        serializer = self.get_serializer(available_rooms, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['GET'], url_path='summary')
    def rooms_summary(self, request):
        total = Room.objects.filter(is_archived=False).count()
        available = Room.objects.filter(status='AVAILABLE', is_archived=False).count()
        occupied = Room.objects.filter(status='OCCUPIED', is_archived=False).count()
        cleaning = Room.objects.filter(status='CLEANING', is_archived=False).count()
        maintenance = Room.objects.filter(status='MAINTENANCE', is_archived=False).count()
        dirty = Room.objects.filter(is_clean=False, is_archived=False).count()
        uninspected = Room.objects.filter(is_inspected=False, is_archived=False).count()
        return Response({
            'total': total,
            'available': available,
            'occupied': occupied,
            'cleaning': cleaning,
            'maintenance': maintenance,
            'dirty': dirty,
            'uninspected': uninspected,
        })

    @action(detail=True, methods=['POST'], url_path='toggle-clean')
    def toggle_clean(self, request, pk=None):
        room = self.get_object()
        room.is_clean = not room.is_clean
        if not room.is_clean:
            room.is_inspected = False
        room.save()

        log_audit_event(
            user=request.user,
            action='TOGGLE_CLEAN',
            description=f"Marked Room {room.room_number} as {'CLEAN' if room.is_clean else 'DIRTY'}",
            model_name='Room',
            object_id=room.id,
            request=request
        )
        return Response({
            "status": "success",
            "is_clean": room.is_clean,
            "is_inspected": room.is_inspected
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['POST'], url_path='toggle-inspect')
    def toggle_inspect(self, request, pk=None):
        room = self.get_object()
        if not room.is_clean and not room.is_inspected:
            return Response(
                {"error": "Cannot inspect a dirty room. Clean the room first."},
                status=status.HTTP_400_BAD_REQUEST
            )
        room.is_inspected = not room.is_inspected
        room.save()

        log_audit_event(
            user=request.user,
            action='TOGGLE_INSPECT',
            description=f"Marked Room {room.room_number} as {'INSPECTED' if room.is_inspected else 'PENDING INSPECTION'}",
            model_name='Room',
            object_id=room.id,
            request=request
        )
        return Response({
            "status": "success",
            "is_clean": room.is_clean,
            "is_inspected": room.is_inspected
        }, status=status.HTTP_200_OK)

