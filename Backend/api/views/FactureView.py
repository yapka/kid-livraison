"""Vue pour FactureModel"""
from rest_framework import viewsets
from api.models import FactureModel
from api.serializers import FactureSerializer
from api.permissions import IsAdminOrOperateurUser # Import the custom permission

class FactureViewSet(viewsets.ModelViewSet):
    queryset = FactureModel.objects.all()
    serializer_class = FactureSerializer
    permission_classes = [IsAdminOrOperateurUser] # Apply the custom permission
