from django.db import models


class Room(models.Model):
    """Model representing a hotel room."""
    
    ROOM_TYPES = (
        ('SINGLE', 'Single Room'),
        ('DOUBLE', 'Double Room'),
        ('SUITE', 'Suite'),
        ('DELUXE', 'Deluxe Room'),
    )
    
    STATUS_CHOICES = (
        ('AVAILABLE', 'Available'),
        ('OCCUPIED', 'Occupied'),
        ('MAINTENANCE', 'Maintenance'),
    )
    
    room_number = models.CharField(max_length=10, unique=True)
    room_type = models.CharField(max_length=20, choices=ROOM_TYPES, default='SINGLE')
    floor = models.IntegerField(default=1)
    capacity = models.IntegerField(default=1)
    price_per_night = models.DecimalField(max_digits=8, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='AVAILABLE')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['room_number']

    def __str__(self):
        return f"Room {self.room_number} - {self.room_type} ({self.status})"
