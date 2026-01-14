"""Vue pour LivreurModel"""
from rest_framework import viewsets
from api.models import LivreurModel
from api.serializers import LivreurSerializer
from api.permissions import IsAdminUser # Import the custom permission

class LivreurViewSet(viewsets.ModelViewSet):
    queryset = LivreurModel.objects.all()
    serializer_class = LivreurSerializer
    permission_classes = [IsAdminUser] # Apply the custom permission
