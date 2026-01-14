"""Serializer pour TarifModel"""
from rest_framework import serializers
from api.models.TarifModel import TarifModel


class TarifSerializer(serializers.ModelSerializer):
    """Serializer pour les tarifs"""

    type_service_display = serializers.CharField(source='get_type_service_display', read_only=True)

    class Meta:
        model = TarifModel
        fields = '__all__'


