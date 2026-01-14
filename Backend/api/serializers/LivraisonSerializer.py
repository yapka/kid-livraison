"""Serializer pour LivraisonModel"""
from rest_framework import serializers
from api.models.LivraisonModel import LivraisonModel


class LivraisonSerializer(serializers.ModelSerializer):
    """Serializer pour les livraisons"""

    colis_numero = serializers.CharField(source='colis.numero_suivi', read_only=True)
    livreur_nom = serializers.CharField(source='livreur.utilisateur.get_full_name', read_only=True)
    vehicule_immatriculation = serializers.CharField(source='vehicule.immatriculation', read_only=True)
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)

    class Meta:
        model = LivraisonModel
        fields = '__all__'
        read_only_fields = ['date_assignation', 'date_creation']


