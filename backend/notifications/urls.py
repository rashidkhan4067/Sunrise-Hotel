from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NotificationViewSet, NotificationStreamView

router = DefaultRouter()
router.register(r'notifications', NotificationViewSet, basename='notification')

urlpatterns = [
    path('notifications/stream/', NotificationStreamView.as_view(), name='notification-stream'),
    path('', include(router.urls)),
]
