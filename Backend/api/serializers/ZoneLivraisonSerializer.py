"""Serializer pour ZoneLivraisonModel"""
from rest_framework import serializers
from api.models.ZoneLivraisonModel import ZoneLivraisonModel


class ZoneLivraisonSerializer(serializers.ModelSerializer):
    """Serializer pour les zones de livraison"""

    class Meta:
        model = ZoneLivraisonModel
        fields = '__all__'


