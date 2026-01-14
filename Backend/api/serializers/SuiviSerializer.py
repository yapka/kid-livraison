"""Serializer pour SuiviModel"""
from rest_framework import serializers
from api.models.SuiviModel import SuiviModel


class SuiviSerializer(serializers.ModelSerializer):
    """Serializer pour le suivi"""

    utilisateur_nom = serializers.CharField(source='utilisateur.get_full_name', read_only=True)
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)

    class Meta:
        model = SuiviModel
        fields = '__all__'
        read_only_fields = ['date_creation']


