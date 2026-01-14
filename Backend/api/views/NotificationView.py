"""Vue pour NotificationModel"""
from rest_framework import viewsets
from api.models import NotificationModel
from api.serializers import NotificationSerializer
from api.permissions import IsAdminOrOperateurUser # Import the custom permission

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = NotificationModel.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [IsAdminOrOperateurUser] # Apply the custom permission
