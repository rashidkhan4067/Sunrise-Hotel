from django.db import models
from core.soft_delete import SoftDeleteModel


class RoomType(models.Model):
    """Model representing a room category/type (decoupled from physical room numbers)."""
    code = models.CharField(max_length=20, unique=True, db_index=True)
    name = models.CharField(max_length=50)
    base_price = models.DecimalField(max_digits=8, decimal_places=2)
    capacity = models.IntegerField(default=2)
    description = models.TextField(blank=True, null=True)
    amenities = models.TextField(blank=True, null=True, help_text="Comma-separated amenities")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} (${self.base_price}/night)"


class Room(SoftDeleteModel):
    """Model representing a physical hotel room."""
    
    ROOM_TYPES = (
        ('SINGLE', 'Single'),
        ('DOUBLE', 'Double'),
        ('TWIN', 'Twin'),
        ('DELUXE', 'Deluxe'),
        ('SUITE', 'Suite'),
        ('FAMILY', 'Family'),
    )
    
    STATUS_CHOICES = (
        ('AVAILABLE', 'Available'),
        ('OCCUPIED', 'Occupied'),
        ('CLEANING', 'Cleaning'),
        ('MAINTENANCE', 'Maintenance'),
    )
    
    room_number = models.CharField(max_length=10, unique=True, db_index=True)
    room_type = models.CharField(max_length=20, choices=ROOM_TYPES, default='SINGLE')
    room_type_ref = models.ForeignKey(RoomType, on_delete=models.SET_NULL, null=True, blank=True, related_name='rooms')
    floor = models.IntegerField(default=1)
    capacity = models.IntegerField(default=1)
    price_per_night = models.DecimalField(max_digits=8, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='AVAILABLE', db_index=True)
    is_archived = models.BooleanField(default=False)
    is_clean = models.BooleanField(default=True, db_index=True)
    is_inspected = models.BooleanField(default=True, db_index=True)
    description = models.TextField(blank=True, null=True)
    amenities = models.TextField(blank=True, null=True, help_text="Comma-separated amenities")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['room_number']

    def __str__(self):
        return f"Room {self.room_number} - {self.room_type} ({self.status})"
