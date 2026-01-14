"""Serializer pour VehiculeModel"""
from rest_framework import serializers
from api.models.VehiculeModel import VehiculeModel


class VehiculeSerializer(serializers.ModelSerializer):
    """Serializer pour les véhicules"""

    livreur_nom = serializers.CharField(source='livreur_attribue.utilisateur.get_full_name',
                                        read_only=True, allow_null=True)
    type_vehicule_display = serializers.CharField(source='get_type_vehicule_display', read_only=True)
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)

    class Meta:
        model = VehiculeModel
        fields = '__all__'


