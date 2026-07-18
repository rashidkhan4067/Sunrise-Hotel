from django.urls import path
from .views import UserProfileView, ClerkUsersListView, UserDetailView, UserResetPasswordView

urlpatterns = [
    path('me/', UserProfileView.as_view(), name='user-profile'),
    path('users/', ClerkUsersListView.as_view(), name='clerk-users-list'),
    path('users/<str:pk>/', UserDetailView.as_view(), name='user-detail'),
    path('users/<str:pk>/reset-password/', UserResetPasswordView.as_view(), name='user-reset-password'),
]
