from rest_framework import permissions


class IsAdmin(permissions.BasePermission):
    """Custom permission to only allow Admins to access."""
    
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.role == 'ADMIN'
        )


class IsReceptionist(permissions.BasePermission):
    """Custom permission to only allow Receptionists to access."""
    
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.role == 'RECEPTIONIST'
        )


class IsHotelStaff(permissions.BasePermission):
    """Custom permission to allow Admins or Receptionists to access."""
    
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.role in ['ADMIN', 'RECEPTIONIST']
        )
