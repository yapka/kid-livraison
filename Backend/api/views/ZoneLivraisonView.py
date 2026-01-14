"""Vue pour ZoneLivraisonModel"""
from rest_framework import viewsets
from api.models import ZoneLivraisonModel
from api.serializers import ZoneLivraisonSerializer
from api.permissions import IsAdminUser # Import the custom permission

class ZoneLivraisonViewSet(viewsets.ModelViewSet):
    queryset = ZoneLivraisonModel.objects.all()
    serializer_class = ZoneLivraisonSerializer
    permission_classes = [IsAdminUser] # Apply the custom permission
