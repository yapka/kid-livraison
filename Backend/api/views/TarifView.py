"""Vue pour TarifModel"""
from rest_framework import viewsets
from api.models import TarifModel
from api.serializers import TarifSerializer
from api.permissions import IsAdminUser # Import the custom permission

class TarifViewSet(viewsets.ModelViewSet):
    queryset = TarifModel.objects.all()
    serializer_class = TarifSerializer
    permission_classes = [IsAdminUser] # Apply the custom permission
