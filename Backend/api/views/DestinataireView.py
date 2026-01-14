"""Vue pour DestinataireModel"""
from rest_framework import viewsets
from api.models import DestinataireModel
from api.serializers import DestinataireSerializer
from api.permissions import IsAdminOrOperateurUser # Import the custom permission

class DestinataireViewSet(viewsets.ModelViewSet):
    queryset = DestinataireModel.objects.all()
    serializer_class = DestinataireSerializer
    permission_classes = [IsAdminOrOperateurUser] # Apply the custom permission
