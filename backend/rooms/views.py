from rest_framework import viewsets, permissions
from .models import Room
from .serializers import RoomSerializer
from accounts.permissions import IsHotelStaff


class RoomViewSet(viewsets.ModelViewSet):
    """ViewSet for managing hotel rooms."""
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    permission_classes = [permissions.IsAuthenticated, IsHotelStaff]
    filterset_fields = ['status', 'room_type', 'floor']
    search_fields = ['room_number']
