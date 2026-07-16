from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .serializers import UserSerializer, UserRegisterSerializer
from .permissions import IsAdmin

User = get_user_model()


class UserProfileView(generics.RetrieveUpdateAPIView):
    """View to view or update current user profile details."""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class RegisterStaffView(generics.CreateAPIView):
    """View to allow Admins to register new staff (receptionists/admins)."""
    serializer_class = UserRegisterSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        user_data = UserSerializer(user).data
        return Response(user_data, status=status.HTTP_201_CREATED)
