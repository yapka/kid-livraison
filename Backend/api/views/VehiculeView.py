"""Vue pour VehiculeModel"""
from rest_framework import viewsets
from api.models import VehiculeModel
from api.serializers import VehiculeSerializer
from api.permissions import IsAdminUser # Import the custom permission

class VehiculeViewSet(viewsets.ModelViewSet):
    queryset = VehiculeModel.objects.all()
    serializer_class = VehiculeSerializer
    permission_classes = [IsAdminUser] # Apply the custom permission
