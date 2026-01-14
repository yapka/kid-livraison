"""Serializer pour NotificationModel"""
from rest_framework import serializers
from api.models.NotificationModel import NotificationModel


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer pour les notifications"""

    colis_numero = serializers.CharField(source='colis.numero_suivi', read_only=True)
    type_display = serializers.CharField(source='get_type_notification_display', read_only=True)

    class Meta:
        model = NotificationModel
        fields = '__all__'


