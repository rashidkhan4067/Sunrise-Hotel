from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'title', 'description', 'is_read', 'icon', 'created_at']
        read_only_fields = ['id', 'title', 'description', 'icon', 'created_at']
