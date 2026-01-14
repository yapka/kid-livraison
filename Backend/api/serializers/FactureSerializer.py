"""Serializer pour FactureModel"""
from rest_framework import serializers
from api.models.FactureModel import FactureModel


class FactureSerializer(serializers.ModelSerializer):
    """Serializer pour les factures"""

    colis_numero = serializers.CharField(source='colis.numero_suivi', read_only=True)
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)

    class Meta:
        model = FactureModel
        fields = '__all__'
        read_only_fields = ['numero_facture', 'date_emission']


