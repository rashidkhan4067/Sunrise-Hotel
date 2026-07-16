from django.urls import path
from .views import UserProfileView, RegisterStaffView

urlpatterns = [
    path('me/', UserProfileView.as_view(), name='user-profile'),
    path('register-staff/', RegisterStaffView.as_view(), name='register-staff'),
]
