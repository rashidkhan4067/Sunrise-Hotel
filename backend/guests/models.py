from django.db import models


class Guest(models.Model):
    """Model representing a hotel guest."""
    
    full_name = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=20)
    email = models.EmailField(blank=True, null=True)
    document_number = models.CharField(max_length=50, help_text="CNIC / Passport Number")
    address = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['full_name']

    def __str__(self):
        return f"{self.full_name} ({self.phone_number})"
