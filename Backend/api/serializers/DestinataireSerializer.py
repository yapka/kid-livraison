"""Serializer pour DestinataireModel"""
from rest_framework import serializers
from api.models.DestinataireModel import DestinataireModel


class DestinataireSerializer(serializers.ModelSerializer):
    """Serializer pour les destinataires"""

    class Meta:
        model = DestinataireModel
        fields = '__all__'
        read_only_fields = ['date_creation']


