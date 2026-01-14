"""Vue pour SuiviModel"""
from rest_framework import viewsets
from api.models import SuiviModel
from api.serializers import SuiviSerializer
from api.permissions import IsAdminOrOperateurUser # Import the custom permission

class SuiviViewSet(viewsets.ModelViewSet):
    queryset = SuiviModel.objects.all()
    serializer_class = SuiviSerializer
    permission_classes = [IsAdminOrOperateurUser] # Apply the custom permission
