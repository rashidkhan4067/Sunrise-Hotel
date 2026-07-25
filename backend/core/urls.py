from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
# We will initialize the main API router
router = DefaultRouter()

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Auth Endpoints
    path('api/auth/', include('accounts.urls')),
    
    # Business Feature Endpoints
    path('api/', include('rooms.urls')),
    path('api/', include('guests.urls')),
    path('api/', include('bookings.urls')),
    path('api/', include('reports.urls')),
    path('api/', include('notifications.urls')),
    path('api/', include('support.urls')),
]
