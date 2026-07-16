from rest_framework import viewsets, permissions
from .models import Guest
from .serializers import GuestSerializer
from accounts.permissions import IsHotelStaff


class GuestViewSet(viewsets.ModelViewSet):
    """ViewSet for managing hotel guests."""
    queryset = Guest.objects.all()
    serializer_class = GuestSerializer
    permission_classes = [permissions.IsAuthenticated, IsHotelStaff]
    search_fields = ['full_name', 'phone_number', 'document_number', 'email']
