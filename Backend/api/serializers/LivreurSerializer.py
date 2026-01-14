"""Serializer pour LivreurModel"""
from rest_framework import serializers
from api.models.LivreurModel import LivreurModel
from api.serializers.UserSerializer import UserSerializer


class LivreurSerializer(serializers.ModelSerializer):
    """Serializer pour les livreurs"""

    utilisateur = UserSerializer(read_only=True)
    utilisateur_id = serializers.IntegerField(write_only=True)
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)

    class Meta:
        model = LivreurModel
        fields = '__all__'


