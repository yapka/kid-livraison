"""Vue pour UserModel"""
from rest_framework import viewsets
from api.models import UserModel
from api.serializers import UserSerializer
from api.permissions import IsAdminUser # Import the custom permission

class UserViewSet(viewsets.ModelViewSet):
    queryset = UserModel.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser] # Apply the custom permission
