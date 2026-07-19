from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import Guest
from .serializers import GuestSerializer
from accounts.permissions import IsHotelStaff
from bookings.models import Booking


class GuestViewSet(viewsets.ModelViewSet):
    """ViewSet for managing hotel guests."""
    serializer_class = GuestSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'update', 'partial_update']:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated(), IsHotelStaff()]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['ADMIN', 'RECEPTIONIST']:
            queryset = Guest.objects.all()
        else:
            if user.email:
                full_name = f"{user.first_name} {user.last_name}".strip()
                if not full_name:
                    full_name = "Guest User"
                
                Guest.objects.get_or_create(
                    email=user.email,
                    defaults={
                        'full_name': full_name,
                        'phone_number': user.phone or '',
                        'document_number': 'PENDING',
                        'is_active': True
                    }
                )
            queryset = Guest.objects.filter(email__iexact=user.email)

        search = self.request.query_params.get('search')
        if search and user.role in ['ADMIN', 'RECEPTIONIST']:
            from django.db.models import Q
            queryset = queryset.filter(
                Q(full_name__icontains=search) |
                Q(phone_number__icontains=search) |
                Q(document_number__icontains=search) |
                Q(email__icontains=search)
            )
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            if is_active.lower() == 'true':
                queryset = queryset.filter(is_active=True)
            elif is_active.lower() == 'false':
                queryset = queryset.filter(is_active=False)
        return queryset

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        user = request.user
        if user.role not in ['ADMIN', 'RECEPTIONIST'] and instance.email.lower() != user.email.lower():
            return Response(
                {"error": "You do not have permission to modify this profile."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        is_active = request.data.get('is_active')
        # If deactivating, verify there are no active bookings
        if is_active is False or is_active == 'false' or is_active == 0:
            active_bookings = Booking.objects.filter(
                guest=instance,
                status__in=['PENDING', 'CONFIRMED', 'CHECKED_IN']
            ).exists()
            if active_bookings:
                return Response(
                    {"error": "Guests with active bookings cannot be deactivated. Cancel or check-out active stays first."},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        # Verify no bookings are linked to this guest for historical reporting compliance
        has_history = Booking.objects.filter(guest=instance).exists()
        if has_history:
            return Response(
                {"error": "Guest records linked to bookings must be retained for historical reporting. Instead of deletion, deactivate the profile."},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().destroy(request, *args, **kwargs)
