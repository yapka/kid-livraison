"""Vue pour LivraisonModel"""
from rest_framework import viewsets
from api.models import LivraisonModel
from api.serializers import LivraisonSerializer
from api.permissions import IsAdminOrOperateurUser # Import the custom permission

class LivraisonViewSet(viewsets.ModelViewSet):
    queryset = LivraisonModel.objects.all()
    serializer_class = LivraisonSerializer
    permission_classes = [IsAdminOrOperateurUser] # Apply the custom permission
