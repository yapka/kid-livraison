"""Vue pour ExpediteurModel"""
from rest_framework import viewsets
from api.models import ExpediteurModel
from api.serializers import ExpediteurSerializer
from api.permissions import IsAdminOrOperateurUser # Import the custom permission

class ExpediteurViewSet(viewsets.ModelViewSet):
    queryset = ExpediteurModel.objects.all()
    serializer_class = ExpediteurSerializer
    permission_classes = [IsAdminOrOperateurUser] # Apply the custom permission
