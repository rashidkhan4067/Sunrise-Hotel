from django.db import models
from accounts.models import User

class Notification(models.Model):
    ICON_CHOICES = (
        ('mail', 'Mail'),
        ('task', 'Task'),
        ('alert', 'Alert'),
        ('booking', 'Booking'),
    )

    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=255)
    description = models.TextField()
    is_read = models.BooleanField(default=False)
    icon = models.CharField(max_length=20, choices=ICON_CHOICES, default='alert')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.recipient.email}"
