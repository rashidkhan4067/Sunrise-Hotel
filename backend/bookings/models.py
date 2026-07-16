import uuid
from django.db import models
from guests.models import Guest
from rooms.models import Room


class Booking(models.Model):
    """Model representing a hotel room booking."""
    
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('CONFIRMED', 'Confirmed'),
        ('CHECKED_IN', 'Checked In'),
        ('CHECKED_OUT', 'Checked Out'),
        ('CANCELLED', 'Cancelled'),
    )
    
    booking_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    guest = models.ForeignKey(Guest, on_delete=models.CASCADE, related_name='bookings')
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='bookings')
    check_in = models.DateField()
    check_out = models.DateField()
    adults = models.IntegerField(default=1)
    children = models.IntegerField(default=0)
    total_price = models.DecimalField(max_digits=10, decimal_places=2, help_text="Total price calculated for the stay")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Booking {self.booking_id} - Guest: {self.guest.full_name} - Room: {self.room.room_number} ({self.status})"
