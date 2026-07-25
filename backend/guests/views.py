from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from .models import Guest
from .serializers import GuestSerializer
from accounts.permissions import IsHotelStaff
from bookings.models import Booking
from reports.models import log_audit_event


class GuestViewSet(viewsets.ModelViewSet):
    """ViewSet for managing hotel guests with identity deduplication."""
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
                
                # Check for existing guest matching email to prevent duplicate
                existing = Guest.objects.filter(email__iexact=user.email).first()
                if not existing:
                    Guest.objects.create(
                        email=user.email,
                        full_name=full_name,
                        phone_number=user.phone or '',
                        document_number='PENDING',
                        is_active=True
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

    def create(self, request, *args, **kwargs):
        """Creates a guest profile or updates existing duplicate if matching email or document exists."""
        email = request.data.get('email', '').strip()
        doc_num = request.data.get('document_number', '').strip()
        phone = request.data.get('phone_number', '').strip()

        from django.db.models import Q
        existing = None
        if email:
            existing = Guest.objects.filter(email__iexact=email).first()
        if not existing and doc_num and doc_num != 'PENDING':
            existing = Guest.objects.filter(document_number__iexact=doc_num).first()
        if not existing and phone:
            existing = Guest.objects.filter(phone_number=phone).first()

        if existing:
            # Update non-empty incoming details on canonical record
            if request.data.get('full_name'):
                existing.full_name = request.data.get('full_name')
            if phone:
                existing.phone_number = phone
            if email:
                existing.email = email
            if doc_num and doc_num != 'PENDING':
                existing.document_number = doc_num
            if request.data.get('address'):
                existing.address = request.data.get('address')
            existing.save()

            log_audit_event(
                user=request.user,
                action='GUEST_UPDATED',
                description=f"Auto-deduplicated and updated profile for guest {existing.full_name}",
                model_name='Guest',
                object_id=existing.id,
                request=request
            )
            serializer = self.get_serializer(existing)
            return Response(serializer.data, status=status.HTTP_200_OK)

        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        guest = serializer.save()
        log_audit_event(
            user=self.request.user,
            action='GUEST_CREATED',
            description=f"Created guest profile for {guest.full_name} ({guest.phone_number})",
            model_name='Guest',
            object_id=guest.id,
            request=self.request
        )

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

        log_audit_event(
            user=request.user,
            action='GUEST_UPDATED',
            description=f"Updated profile for guest {instance.full_name}",
            model_name='Guest',
            object_id=instance.id,
            request=request
        )
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        has_active = Booking.objects.filter(guest=instance, status__in=['PENDING', 'CONFIRMED', 'CHECKED_IN']).exists()
        if has_active:
            return Response(
                {"error": "Guest with active stays cannot be removed. Check out or cancel bookings first."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        log_audit_event(
            user=request.user,
            action='GUEST_DELETED',
            description=f"Soft deleted guest profile {instance.full_name}",
            model_name='Guest',
            object_id=instance.id,
            request=request
        )
        instance.soft_delete()
        return Response({"status": "Guest soft deleted successfully"}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['POST'], url_path='merge')
    @transaction.atomic
    def merge_profiles(self, request):
        """Action endpoint to merge a duplicate guest profile into a primary profile."""
        primary_id = request.data.get('primary_id')
        duplicate_id = request.data.get('duplicate_id')

        if not primary_id or not duplicate_id:
            return Response({"error": "Both primary_id and duplicate_id parameters are required."}, status=status.HTTP_400_BAD_REQUEST)
        if primary_id == duplicate_id:
            return Response({"error": "Primary and duplicate profiles cannot be identical."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            primary = Guest.objects.get(id=primary_id)
            duplicate = Guest.objects.get(id=duplicate_id)
        except Guest.DoesNotExist:
            return Response({"error": "One or both guest profiles do not exist."}, status=status.HTTP_404_NOT_FOUND)

        # Re-link all bookings from duplicate to primary
        updated_count = Booking.objects.filter(guest=duplicate).update(guest=primary)
        
        # Soft delete duplicate
        duplicate.soft_delete()

        log_audit_event(
            user=request.user,
            action='GUEST_UPDATED',
            description=f"Merged duplicate guest {duplicate.full_name} into primary profile {primary.full_name} ({updated_count} bookings re-linked)",
            model_name='Guest',
            object_id=primary.id,
            request=request
        )

        return Response({
            "status": "success",
            "message": f"Successfully merged profiles. {updated_count} bookings re-linked.",
            "primary_id": primary.id
        }, status=status.HTTP_200_OK)
