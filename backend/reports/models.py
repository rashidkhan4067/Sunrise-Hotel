import uuid
from django.db import models
from django.conf import settings


class AuditLog(models.Model):
    """Model for recording audit trails of operational and financial actions."""
    
    ACTION_CHOICES = (
        ('CHECK_IN', 'Check In'),
        ('CHECK_OUT', 'Check Out'),
        ('CANCEL_BOOKING', 'Cancel Booking'),
        ('CREATE_BOOKING', 'Create Booking'),
        ('ADD_PAYMENT', 'Add Payment'),
        ('ADD_CHARGE', 'Add Charge'),
        ('TOGGLE_CLEAN', 'Toggle Clean Status'),
        ('TOGGLE_INSPECT', 'Toggle Inspect Status'),
        ('ROOM_CREATED', 'Room Created'),
        ('ROOM_UPDATED', 'Room Updated'),
        ('ROOM_DELETED', 'Room Deleted'),
        ('GUEST_CREATED', 'Guest Created'),
        ('GUEST_UPDATED', 'Guest Updated'),
        ('GUEST_DELETED', 'Guest Deleted'),
        ('STAFF_CREATED', 'Staff Created'),
        ('STAFF_UPDATED', 'Staff Updated'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='audit_logs')
    user_email = models.CharField(max_length=255, blank=True, null=True)
    action = models.CharField(max_length=50, choices=ACTION_CHOICES, db_index=True)
    model_name = models.CharField(max_length=50, blank=True, null=True, db_index=True)
    object_id = models.CharField(max_length=100, blank=True, null=True)
    description = models.TextField()
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"[{self.timestamp.strftime('%Y-%m-%d %H:%M:%S')}] {self.action} by {self.user_email or 'System'}: {self.description}"


def log_audit_event(user=None, action="", description="", model_name=None, object_id=None, request=None):
    """Utility function to log an audit event."""
    try:
        user_obj = user if (user and getattr(user, 'is_authenticated', False)) else None
        user_email = getattr(user_obj, 'email', 'System') if user_obj else 'System'
        
        ip_address = None
        if request:
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            if x_forwarded_for:
                ip_address = x_forwarded_for.split(',')[0].strip()
            else:
                ip_address = request.META.get('REMOTE_ADDR')

        AuditLog.objects.create(
            user=user_obj,
            user_email=user_email,
            action=action,
            description=description,
            model_name=model_name,
            object_id=str(object_id) if object_id else None,
            ip_address=ip_address
        )

        try:
            from core.events import EventBroadcaster
            EventBroadcaster.broadcast(action, {
                'user_email': user_email,
                'action': action,
                'description': description,
                'model_name': model_name,
                'object_id': str(object_id) if object_id else None
            })
        except Exception:
            pass
    except Exception as e:
        print(f"Failed to create audit log: {e}")


class HotelConfiguration(models.Model):
    """Model storing global hotel operational parameters and pricing rules."""
    hotel_name = models.CharField(max_length=100, default="Sunrise Hotel & Resort")
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=10.00, help_text="Room tax rate percentage")
    currency_symbol = models.CharField(max_length=5, default="$")
    weekend_surge_multiplier = models.DecimalField(max_digits=4, decimal_places=2, default=1.20, help_text="Price multiplier for Fri/Sat nights")
    check_in_time = models.CharField(max_length=10, default="14:00")
    check_out_time = models.CharField(max_length=10, default="11:00")
    cancellation_grace_hours = models.IntegerField(default=24)
    updated_at = models.DateTimeField(auto_now=True)

    @classmethod
    def get_config(cls):
        config, _ = cls.objects.get_or_create(id=1)
        return config

    def __str__(self):
        return f"{self.hotel_name} Config (Tax: {self.tax_rate}%, Surge: x{self.weekend_surge_multiplier})"

