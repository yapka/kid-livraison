"""Serializers pour ColisModel"""
from rest_framework import serializers
from api.models.ColisModel import ColisModel
from api.serializers.ExpediteurSerializer import ExpediteurSerializer
from api.serializers.DestinataireSerializer import DestinataireSerializer


class ColisListSerializer(serializers.ModelSerializer):
    """Serializer simplifié pour la liste des colis"""

    expediteur_nom = serializers.CharField(source='expediteur.nom_complet', read_only=True)
    expediteur_ville = serializers.CharField(source='expediteur.ville', read_only=True)
    destinataire_nom = serializers.CharField(source='destinataire.nom_complet', read_only=True)
    destinataire_ville = serializers.CharField(source='destinataire.ville', read_only=True)
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)
    utilisateur_id = serializers.IntegerField(source='utilisateur.id', read_only=True)

    class Meta:
        model = ColisModel
        fields = ['id', 'numero_suivi', 'expediteur_nom', 'expediteur_ville', 'destinataire_nom', 'destinataire_ville',
                  'statut', 'statut_display', 'priorite', 'poids', 'frais_envoi', 'date_creation', 'utilisateur_id']


class ColisDetailSerializer(serializers.ModelSerializer):
    """Serializer détaillé pour un colis"""

    expediteur = ExpediteurSerializer(read_only=True)
    destinataire = DestinataireSerializer(read_only=True)
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)
    type_colis_display = serializers.CharField(source='get_type_colis_display', read_only=True)

    utilisateur_id = serializers.IntegerField(source='utilisateur.id', read_only=True)

    # IDs pour la création
    expediteur_id = serializers.IntegerField(write_only=True)
    destinataire_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = ColisModel
        fields = '__all__'
        read_only_fields = ['numero_suivi', 'date_creation', 'date_modification']


