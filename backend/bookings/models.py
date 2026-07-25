import uuid
from django.db import models
from guests.models import Guest
from rooms.models import Room
from core.soft_delete import SoftDeleteModel


class Booking(SoftDeleteModel):
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
    room = models.ForeignKey(Room, on_delete=models.SET_NULL, null=True, blank=True, related_name='bookings')
    requested_room_type = models.CharField(max_length=20, blank=True, null=True, db_index=True)
    check_in = models.DateField(db_index=True)
    check_out = models.DateField(db_index=True)
    adults = models.IntegerField(default=1)
    children = models.IntegerField(default=0)
    total_price = models.DecimalField(max_digits=10, decimal_places=2, help_text="Total price calculated for the stay")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING', db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        room_str = self.room.room_number if self.room else (self.requested_room_type or 'Unassigned')
        return f"Booking {self.booking_id} - Guest: {self.guest.full_name} - Room: {room_str} ({self.status})"


class Folio(models.Model):
    """Model representing a booking folio/billing account."""
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name='folio')
    created_at = models.DateTimeField(auto_now_add=True)
    is_closed = models.BooleanField(default=False)

    def __str__(self):
        return f"Folio for Booking {self.booking.booking_id} (Closed: {self.is_closed})"


class FolioItem(models.Model):
    """Model representing an item/charge/payment on a folio."""
    ITEM_TYPES = (
        ('ROOM', 'Room Charge'),
        ('TAX', 'Tax Charge'),
        ('INCIDENTAL', 'Incidental Charge'),
        ('PAYMENT', 'Payment'),
    )
    folio = models.ForeignKey(Folio, on_delete=models.CASCADE, related_name='items')
    item_type = models.CharField(max_length=20, choices=ITEM_TYPES)
    description = models.CharField(max_length=200)
    amount = models.DecimalField(max_digits=10, decimal_places=2) # Positive for charges, negative for payments
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"FolioItem {self.id} - Type: {self.item_type} - Amount: {self.amount}"


from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=Booking)
def create_booking_folio(sender, instance, created, **kwargs):
    if created:
        Folio.objects.create(booking=instance)
