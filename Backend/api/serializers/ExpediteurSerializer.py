"""Serializer pour ExpediteurModel"""
from rest_framework import serializers
from api.models.ExpediteurModel import ExpediteurModel


class ExpediteurSerializer(serializers.ModelSerializer):
    """Serializer pour les expéditeurs"""

    class Meta:
        model = ExpediteurModel
        fields = '__all__'
        read_only_fields = ['date_creation']


