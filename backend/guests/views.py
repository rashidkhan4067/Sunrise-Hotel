from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import Guest
from .serializers import GuestSerializer
from accounts.permissions import IsHotelStaff
from bookings.models import Booking


class GuestViewSet(viewsets.ModelViewSet):
    """ViewSet for managing hotel guests."""
    serializer_class = GuestSerializer
    permission_classes = [permissions.IsAuthenticated, IsHotelStaff]

    def get_queryset(self):
        queryset = Guest.objects.all()
        search = self.request.query_params.get('search')
        if search:
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
