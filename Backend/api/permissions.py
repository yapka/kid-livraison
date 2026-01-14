
from rest_framework import permissions

class BaseRolePermission(permissions.BasePermission):
    """Base permission class to check if the user has a specific role."""

    def has_permission(self, request, view):
        # All other requests require authentication
        if not request.user.is_authenticated:
            return False

        return True # Continue to specific role checks

class IsAdminUser(BaseRolePermission):
    """Allows access only to admin users."""

    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        return request.user.role == 'ADMIN'

class IsOperateurUser(BaseRolePermission):
    """Allows access only to operateur users."""

    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        return request.user.role == 'OPERATEUR'

class IsLivreurUser(BaseRolePermission):
    """Allows access only to livreur users."""

    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        return request.user.role == 'LIVREUR'

class IsAdminOrOperateurUser(BaseRolePermission):
    """Allows access only to admin or operateur users."""

    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        return request.user.role in ['ADMIN', 'OPERATEUR']

class IsAdminOrLivreurUser(BaseRolePermission):
    """Allows access only to admin or livreur users."""

    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        return request.user.role in ['ADMIN', 'LIVREUR']
