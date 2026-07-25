from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BookingViewSet, FolioViewSet, FolioItemViewSet

router = DefaultRouter()
router.register('bookings', BookingViewSet, basename='booking')
router.register('folios', FolioViewSet, basename='folio')
router.register('folio-items', FolioItemViewSet, basename='folio-item')

urlpatterns = [
    path('', include(router.urls)),
]
