#!/usr/bin/env python


import os

# ============================================
# CONFIGURATION
# ============================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
API_DIR = os.path.join(BASE_DIR, "api")
MODELS_DIR = os.path.join(API_DIR, "models")
SERIALIZERS_DIR = os.path.join(API_DIR, "serializers")

# ============================================
# CONTENU DES FICHIERS MODELS
# ============================================

MODELS = {
    "UserModel.py": '''"""Modèle Utilisateur personnalisé"""
from django.contrib.auth.models import AbstractUser
from django.db import models


class UserModel(AbstractUser):
    """Modèle utilisateur personnalisé pour le système de livraison"""

    ROLE_CHOICES = [
        ('ADMIN', 'Administrateur'),
        ('OPERATEUR', 'Opérateur'),
        ('LIVREUR', 'Livreur'),
    ]

    telephone = models.CharField(max_length=20, verbose_name="Téléphone")
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='OPERATEUR')
    actif = models.BooleanField(default=True)
    derniere_connexion = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'utilisateur'
        verbose_name = 'Utilisateur'
        verbose_name_plural = 'Utilisateurs'
        ordering = ['-date_joined']

    def __str__(self):
        return f"{self.get_full_name()} ({self.get_role_display()})"


''',

    "ExpediteurModel.py": '''"""Modèle Expéditeur"""
from django.db import models


class ExpediteurModel(models.Model):
    """Informations des expéditeurs"""

    nom_complet = models.CharField(max_length=200)
    telephone = models.CharField(max_length=20)
    email = models.EmailField(blank=True, null=True)
    adresse_complete = models.TextField()
    ville = models.CharField(max_length=100)
    quartier = models.CharField(max_length=100)
    code_postal = models.CharField(max_length=20, blank=True, null=True)
    complement_adresse = models.TextField(blank=True, null=True)
    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'expediteur'
        verbose_name = 'Expéditeur'
        verbose_name_plural = 'Expéditeurs'
        ordering = ['-date_creation']

    def __str__(self):
        return f"{self.nom_complet} - {self.ville}"


''',

    "DestinataireModel.py": '''"""Modèle Destinataire"""
from django.db import models


class DestinataireModel(models.Model):
    """Informations des destinataires"""

    nom_complet = models.CharField(max_length=200)
    telephone = models.CharField(max_length=20)
    email = models.EmailField(blank=True, null=True)
    adresse_complete = models.TextField()
    ville = models.CharField(max_length=100)
    quartier = models.CharField(max_length=100)
    code_postal = models.CharField(max_length=20, blank=True, null=True)
    complement_adresse = models.TextField(blank=True, null=True)
    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'destinataire'
        verbose_name = 'Destinataire'
        verbose_name_plural = 'Destinataires'
        ordering = ['-date_creation']

    def __str__(self):
        return f"{self.nom_complet} - {self.ville}"


''',

    "ColisModel.py": '''"""Modèle Colis"""
from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal
import random
import string


class ColisModel(models.Model):
    """Modèle principal pour la gestion des colis"""

    STATUT_CHOICES = [
        ('EN_ATTENTE', 'En attente'),
        ('EN_TRANSIT', 'En transit'),
        ('EN_LIVRAISON', 'En cours de livraison'),
        ('LIVRE', 'Livré'),
        ('RETOUR', 'Retour'),
        ('ANNULE', 'Annulé'),
    ]

    TYPE_CHOICES = [
        ('DOCUMENT', 'Document'),
        ('STANDARD', 'Colis standard'),
        ('FRAGILE', 'Fragile'),
        ('VOLUMINEUX', 'Volumineux'),
    ]

    PRIORITE_CHOICES = [
        ('NORMALE', 'Normale'),
        ('EXPRESS', 'Express'),
        ('URGENTE', 'Urgente'),
    ]

    # Relations
    numero_suivi = models.CharField(max_length=50, unique=True, editable=False)
    expediteur = models.ForeignKey('ExpediteurModel', on_delete=models.PROTECT, related_name='colis_expedies')
    destinataire = models.ForeignKey('DestinataireModel', on_delete=models.PROTECT, related_name='colis_recus')
    utilisateur = models.ForeignKey('UserModel', on_delete=models.SET_NULL, null=True, related_name='colis_enregistres')

    # Caractéristiques physiques
    poids = models.DecimalField(max_digits=6, decimal_places=2, validators=[MinValueValidator(Decimal('0.01'))])
    longueur = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    largeur = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    hauteur = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)

    # Détails
    description = models.TextField()
    valeur_declaree = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    type_colis = models.CharField(max_length=20, choices=TYPE_CHOICES, default='STANDARD')
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='EN_ATTENTE')
    priorite = models.CharField(max_length=20, choices=PRIORITE_CHOICES, default='NORMALE')

    # Assurance
    assurance = models.BooleanField(default=False)
    montant_assurance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    instructions_speciales = models.TextField(blank=True, null=True)

    # Dates
    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)
    date_livraison_prevue = models.DateTimeField(null=True, blank=True)
    date_livraison_reelle = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'colis'
        verbose_name = 'Colis'
        verbose_name_plural = 'Colis'
        ordering = ['-date_creation']

    def save(self, *args, **kwargs):
        if not self.numero_suivi:
            self.numero_suivi = self.generer_numero_suivi()
        super().save(*args, **kwargs)

    def generer_numero_suivi(self):
        """Génère un numéro de suivi unique"""
        prefix = 'DLV'
        random_str = ''.join(random.choices(string.digits, k=8))
        return f"{prefix}{random_str}"

    def __str__(self):
        return f"{self.numero_suivi} - {self.destinataire.nom_complet}"


''',

    "SuiviModel.py": '''"""Modèle Suivi"""
from django.db import models


class SuiviModel(models.Model):
    """Historique de suivi des colis"""

    STATUT_CHOICES = [
        ('COLIS_RECEPTIONNE', 'Colis réceptionné'),
        ('EN_PREPARATION', 'En préparation'),
        ('EN_TRANSIT', 'En transit'),
        ('EN_COURS_LIVRAISON', 'En cours de livraison'),
        ('LIVRE', 'Livré'),
        ('ECHEC_LIVRAISON', 'Échec de livraison'),
        ('RETOUR_EXPEDITEUR', "Retour à l'expéditeur"),
    ]

    colis = models.ForeignKey('ColisModel', on_delete=models.CASCADE, related_name='suivis')
    statut = models.CharField(max_length=30, choices=STATUT_CHOICES)
    description = models.TextField()
    localisation = models.CharField(max_length=200, blank=True, null=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    utilisateur = models.ForeignKey('UserModel', on_delete=models.SET_NULL, null=True)
    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'suivi'
        verbose_name = 'Suivi'
        verbose_name_plural = 'Suivis'
        ordering = ['-date_creation']

    def __str__(self):
        return f"{self.colis.numero_suivi} - {self.get_statut_display()}"


''',

    "LivreurModel.py": '''"""Modèle Livreur"""
from django.db import models


class LivreurModel(models.Model):
    """Informations des livreurs"""

    STATUT_CHOICES = [
        ('DISPONIBLE', 'Disponible'),
        ('EN_LIVRAISON', 'En livraison'),
        ('REPOS', 'Repos'),
        ('ABSENT', 'Absent'),
    ]

    utilisateur = models.OneToOneField('UserModel', on_delete=models.CASCADE, related_name='profil_livreur')
    matricule = models.CharField(max_length=50, unique=True)
    permis_conduire = models.CharField(max_length=50)
    date_validite_permis = models.DateField()
    telephone_pro = models.CharField(max_length=20)
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='DISPONIBLE')
    note_moyenne = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    nombre_livraisons = models.IntegerField(default=0)
    zone_intervention = models.TextField()
    date_embauche = models.DateField()
    actif = models.BooleanField(default=True)

    class Meta:
        db_table = 'livreur'
        verbose_name = 'Livreur'
        verbose_name_plural = 'Livreurs'

    def __str__(self):
        return f"{self.matricule} - {self.utilisateur.get_full_name()}"


''',

    "VehiculeModel.py": '''"""Modèle Véhicule"""
from django.db import models


class VehiculeModel(models.Model):
    """Gestion de la flotte de véhicules"""

    TYPE_CHOICES = [
        ('MOTO', 'Moto'),
        ('VOITURE', 'Voiture'),
        ('CAMIONNETTE', 'Camionnette'),
        ('CAMION', 'Camion'),
    ]

    STATUT_CHOICES = [
        ('DISPONIBLE', 'Disponible'),
        ('EN_SERVICE', 'En service'),
        ('MAINTENANCE', 'Maintenance'),
        ('HORS_SERVICE', 'Hors service'),
    ]

    immatriculation = models.CharField(max_length=20, unique=True)
    type_vehicule = models.CharField(max_length=20, choices=TYPE_CHOICES)
    marque = models.CharField(max_length=50)
    modele = models.CharField(max_length=50)
    annee = models.IntegerField()
    capacite_charge = models.DecimalField(max_digits=8, decimal_places=2, help_text="en kg")
    volume_utile = models.DecimalField(max_digits=6, decimal_places=2, help_text="en m³")
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='DISPONIBLE')
    date_visite_technique = models.DateField()
    date_assurance = models.DateField()
    livreur_attribue = models.ForeignKey('LivreurModel', on_delete=models.SET_NULL, null=True, blank=True,
                                         related_name='vehicules')
    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'vehicule'
        verbose_name = 'Véhicule'
        verbose_name_plural = 'Véhicules'

    def __str__(self):
        return f"{self.immatriculation} - {self.marque} {self.modele}"


''',

    "LivraisonModel.py": '''"""Modèle Livraison"""
from django.db import models


class LivraisonModel(models.Model):
    """Gestion des livraisons"""

    STATUT_CHOICES = [
        ('ASSIGNEE', 'Assignée'),
        ('EN_COURS', 'En cours'),
        ('TERMINEE', 'Terminée'),
        ('ECHOUEE', 'Échouée'),
    ]

    colis = models.ForeignKey('ColisModel', on_delete=models.CASCADE, related_name='livraisons')
    livreur = models.ForeignKey('LivreurModel', on_delete=models.PROTECT, related_name='livraisons')
    vehicule = models.ForeignKey('VehiculeModel', on_delete=models.PROTECT, related_name='livraisons')

    # Dates et horaires
    date_assignation = models.DateTimeField(auto_now_add=True)
    heure_depart = models.DateTimeField(null=True, blank=True)
    heure_arrivee = models.DateTimeField(null=True, blank=True)

    # Détails
    distance_parcourue = models.DecimalField(max_digits=8, decimal_places=2, default=0, help_text="en km")
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='ASSIGNEE')
    motif_echec = models.TextField(blank=True, null=True)

    # Preuve de livraison
    signature_destinataire = models.TextField(blank=True, null=True)
    photo_livraison = models.ImageField(upload_to='livraisons/', blank=True, null=True)
    commentaire = models.TextField(blank=True, null=True)

    # Géolocalisation
    latitude_livraison = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude_livraison = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)

    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'livraison'
        verbose_name = 'Livraison'
        verbose_name_plural = 'Livraisons'
        ordering = ['-date_assignation']

    def __str__(self):
        return f"Livraison {self.colis.numero_suivi} - {self.livreur.matricule}"


''',

    "FactureModel.py": '''"""Modèle Facture"""
from django.db import models
import random
import string


class FactureModel(models.Model):
    """Gestion de la facturation"""

    STATUT_CHOICES = [
        ('EN_ATTENTE', 'En attente'),
        ('PAYEE', 'Payée'),
        ('PARTIELLEMENT_PAYEE', 'Partiellement payée'),
        ('ANNULEE', 'Annulée'),
    ]

    MODE_PAIEMENT_CHOICES = [
        ('ESPECES', 'Espèces'),
        ('CARTE', 'Carte bancaire'),
        ('MOBILE_MONEY', 'Mobile Money'),
        ('VIREMENT', 'Virement bancaire'),
    ]

    numero_facture = models.CharField(max_length=50, unique=True, editable=False)
    colis = models.OneToOneField('ColisModel', on_delete=models.PROTECT, related_name='facture')

    # Montants
    montant_base = models.DecimalField(max_digits=10, decimal_places=2)
    frais_distance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    frais_poids = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    frais_assurance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    frais_express = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    montant_total = models.DecimalField(max_digits=10, decimal_places=2)
    montant_paye = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    # Statut et paiement
    statut = models.CharField(max_length=30, choices=STATUT_CHOICES, default='EN_ATTENTE')
    mode_paiement = models.CharField(max_length=20, choices=MODE_PAIEMENT_CHOICES, null=True, blank=True)

    # Dates
    date_emission = models.DateTimeField(auto_now_add=True)
    date_paiement = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'facture'
        verbose_name = 'Facture'
        verbose_name_plural = 'Factures'
        ordering = ['-date_emission']

    def save(self, *args, **kwargs):
        if not self.numero_facture:
            self.numero_facture = self.generer_numero_facture()
        super().save(*args, **kwargs)

    def generer_numero_facture(self):
        """Génère un numéro de facture unique"""
        prefix = 'FACT'
        random_str = ''.join(random.choices(string.digits, k=8))
        return f"{prefix}{random_str}"

    def __str__(self):
        return f"{self.numero_facture} - {self.montant_total} FCFA"


''',

    "ZoneLivraisonModel.py": '''"""Modèle Zone de Livraison"""
from django.db import models


class ZoneLivraisonModel(models.Model):
    """Zones de livraison avec tarifs"""

    nom = models.CharField(max_length=100)
    ville = models.CharField(max_length=100)
    quartiers = models.TextField(help_text="Liste des quartiers séparés par des virgules")
    tarif_base = models.DecimalField(max_digits=10, decimal_places=2)
    tarif_km_supplementaire = models.DecimalField(max_digits=10, decimal_places=2)
    delai_livraison_jours = models.IntegerField(default=1)
    active = models.BooleanField(default=True)
    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'zone_livraison'
        verbose_name = 'Zone de livraison'
        verbose_name_plural = 'Zones de livraison'

    def __str__(self):
        return f"{self.nom} - {self.ville}"


''',

    "NotificationModel.py": '''"""Modèle Notification"""
from django.db import models


class NotificationModel(models.Model):
    """Système de notifications"""

    TYPE_CHOICES = [
        ('SMS', 'SMS'),
        ('EMAIL', 'Email'),
        ('PUSH', 'Notification Push'),
    ]

    STATUT_CHOICES = [
        ('EN_ATTENTE', 'En attente'),
        ('ENVOYEE', 'Envoyée'),
        ('ECHOUEE', 'Échouée'),
    ]

    utilisateur = models.ForeignKey('UserModel', on_delete=models.CASCADE, null=True, blank=True)
    colis = models.ForeignKey('ColisModel', on_delete=models.CASCADE, related_name='notifications')
    type_notification = models.CharField(max_length=10, choices=TYPE_CHOICES)
    destinataire = models.CharField(max_length=200)
    sujet = models.CharField(max_length=200)
    message = models.TextField()
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='EN_ATTENTE')
    date_envoi = models.DateTimeField(null=True, blank=True)
    date_lecture = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'notification'
        verbose_name = 'Notification'
        verbose_name_plural = 'Notifications'
        ordering = ['-date_envoi']

    def __str__(self):
        return f"{self.type_notification} - {self.colis.numero_suivi}"


''',

    "TarifModel.py": '''"""Modèle Tarif"""
from django.db import models


class TarifModel(models.Model):
    """Grille tarifaire"""

    TYPE_SERVICE_CHOICES = [
        ('STANDARD', 'Standard'),
        ('EXPRESS', 'Express'),
        ('URGENTE', 'Urgente'),
    ]

    poids_min = models.DecimalField(max_digits=6, decimal_places=2, help_text="en kg")
    poids_max = models.DecimalField(max_digits=6, decimal_places=2, help_text="en kg")
    distance_min = models.DecimalField(max_digits=6, decimal_places=2, help_text="en km")
    distance_max = models.DecimalField(max_digits=6, decimal_places=2, help_text="en km")
    prix = models.DecimalField(max_digits=10, decimal_places=2)
    type_service = models.CharField(max_length=20, choices=TYPE_SERVICE_CHOICES)
    actif = models.BooleanField(default=True)
    date_debut = models.DateField()
    date_fin = models.DateField(null=True, blank=True)

    class Meta:
        db_table = 'tarif'
        verbose_name = 'Tarif'
        verbose_name_plural = 'Tarifs'

    def __str__(self):
        return f"{self.get_type_service_display()} - {self.poids_min}-{self.poids_max}kg - {self.prix} FCFA"


''',
}



SERIALIZERS = {
    "UserSerializer.py": '''"""Serializer pour UserModel"""

from rest_framework import serializers
from api.models.UserModel import UserModel


class UserSerializer(serializers.ModelSerializer):
    """Serializer pour les utilisateurs"""

    role_display = serializers.CharField(source='get_role_display', read_only=True)

    class Meta:
        model = UserModel
        fields = ['id', 'username', 'email', 'first_name', 'last_name',
                  'telephone', 'role', 'role_display', 'actif', 'date_joined', 'derniere_connexion']
        read_only_fields = ['date_joined']
        extra_kwargs = {'password': {'write_only': True}}


''',

    "ExpediteurSerializer.py": '''"""Serializer pour ExpediteurModel"""
from rest_framework import serializers
from api.models.ExpediteurModel import ExpediteurModel


class ExpediteurSerializer(serializers.ModelSerializer):
    """Serializer pour les expéditeurs"""

    class Meta:
        model = ExpediteurModel
        fields = '__all__'
        read_only_fields = ['date_creation']


''',

    "DestinataireSerializer.py": '''"""Serializer pour DestinataireModel"""
from rest_framework import serializers
from api.models.DestinataireModel import DestinataireModel


class DestinataireSerializer(serializers.ModelSerializer):
    """Serializer pour les destinataires"""

    class Meta:
        model = DestinataireModel
        fields = '__all__'
        read_only_fields = ['date_creation']


''',

    "ColisSerializer.py": '''"""Serializers pour ColisModel"""
from rest_framework import serializers
from api.models.ColisModel import ColisModel
from api.serializers.ExpediteurSerializer import ExpediteurSerializer
from api.serializers.DestinataireSerializer import DestinataireSerializer


class ColisListSerializer(serializers.ModelSerializer):
    """Serializer simplifié pour la liste des colis"""

    expediteur_nom = serializers.CharField(source='expediteur.nom_complet', read_only=True)
    destinataire_nom = serializers.CharField(source='destinataire.nom_complet', read_only=True)
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)

    class Meta:
        model = ColisModel
        fields = ['id', 'numero_suivi', 'expediteur_nom', 'destinataire_nom',
                  'statut', 'statut_display', 'priorite', 'poids', 'date_creation']


class ColisDetailSerializer(serializers.ModelSerializer):
    """Serializer détaillé pour un colis"""

    expediteur = ExpediteurSerializer(read_only=True)
    destinataire = DestinataireSerializer(read_only=True)
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)
    type_colis_display = serializers.CharField(source='get_type_colis_display', read_only=True)

    # IDs pour la création
    expediteur_id = serializers.IntegerField(write_only=True)
    destinataire_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = ColisModel
        fields = '__all__'
        read_only_fields = ['numero_suivi', 'date_creation', 'date_modification']


''',

    "SuiviSerializer.py": '''"""Serializer pour SuiviModel"""
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


''',

    "LivreurSerializer.py": '''"""Serializer pour LivreurModel"""
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


''',

    "VehiculeSerializer.py": '''"""Serializer pour VehiculeModel"""
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


''',

    "LivraisonSerializer.py": '''"""Serializer pour LivraisonModel"""
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


''',

    "FactureSerializer.py": '''"""Serializer pour FactureModel"""
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


''',

    "ZoneLivraisonSerializer.py": '''"""Serializer pour ZoneLivraisonModel"""
from rest_framework import serializers
from api.models.ZoneLivraisonModel import ZoneLivraisonModel


class ZoneLivraisonSerializer(serializers.ModelSerializer):
    """Serializer pour les zones de livraison"""

    class Meta:
        model = ZoneLivraisonModel
        fields = '__all__'


''',

    "NotificationSerializer.py": '''"""Serializer pour NotificationModel"""
from rest_framework import serializers
from api.models.NotificationModel import NotificationModel


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer pour les notifications"""

    colis_numero = serializers.CharField(source='colis.numero_suivi', read_only=True)
    type_display = serializers.CharField(source='get_type_notification_display', read_only=True)

    class Meta:
        model = NotificationModel
        fields = '__all__'


''',

    "TarifSerializer.py": '''"""Serializer pour TarifModel"""
from rest_framework import serializers
from api.models.TarifModel import TarifModel


class TarifSerializer(serializers.ModelSerializer):
    """Serializer pour les tarifs"""

    type_service_display = serializers.CharField(source='get_type_service_display', read_only=True)

    class Meta:
        model = TarifModel
        fields = '__all__'


''',
}


# ============================================
# FICHIERS __init__.py
# ============================================

MODELS_INIT = '''"""Import de tous les models"""
from .UserModel import UserModel
from .ExpediteurModel import ExpediteurModel
from .DestinataireModel import DestinataireModel
from .ColisModel import ColisModel
from .SuiviModel import SuiviModel
from .LivreurModel import LivreurModel
from .VehiculeModel import VehiculeModel
from .LivraisonModel import LivraisonModel
from .FactureModel import FactureModel
from .ZoneLivraisonModel import ZoneLivraisonModel
from .NotificationModel import NotificationModel
from .TarifModel import TarifModel

__all__ = [
    'UserModel',
    'ExpediteurModel',
    'DestinataireModel',
    'ColisModel',
    'SuiviModel',
    'LivreurModel',
    'VehiculeModel',
    'LivraisonModel',
    'FactureModel',
    'ZoneLivraisonModel',
    'NotificationModel',
    'TarifModel',
]
'''

SERIALIZERS_INIT = '''"""Import de tous les serializers"""
from .UserSerializer import UserSerializer
from .ExpediteurSerializer import ExpediteurSerializer
from .DestinataireSerializer import DestinataireSerializer
from .ColisSerializer import ColisListSerializer, ColisDetailSerializer
from .SuiviSerializer import SuiviSerializer
from .LivreurSerializer import LivreurSerializer
from .VehiculeSerializer import VehiculeSerializer
from .LivraisonSerializer import LivraisonSerializer
from .FactureSerializer import FactureSerializer
from .ZoneLivraisonSerializer import ZoneLivraisonSerializer
from .NotificationSerializer import NotificationSerializer
from .TarifSerializer import TarifSerializer

__all__ = [
    'UserSerializer',
    'ExpediteurSerializer',
    'DestinataireSerializer',
    'ColisListSerializer',
    'ColisDetailSerializer',
    'SuiviSerializer',
    'LivreurSerializer',
    'VehiculeSerializer',
    'LivraisonSerializer',
    'FactureSerializer',
    'ZoneLivraisonSerializer',
    'NotificationSerializer',
    'TarifSerializer',
]
'''


# ============================================
# FONCTIONS DE GÉNÉRATION
# ============================================

def create_directories():
    """Créer les dossiers models et serializers"""
    os.makedirs(MODELS_DIR, exist_ok=True)
    os.makedirs(SERIALIZERS_DIR, exist_ok=True)
    print(f"✅ Dossiers créés: {MODELS_DIR}, {SERIALIZERS_DIR}")


def create_models():
    """Créer tous les fichiers de models"""
    print("\n📦 Génération des Models...")

    for filename, content in MODELS.items():
        filepath = os.path.join(MODELS_DIR, filename)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  ✅ {filename}")

    # Créer __init__.py
    init_path = os.path.join(MODELS_DIR, '__init__.py')
    with open(init_path, 'w', encoding='utf-8') as f:
        f.write(MODELS_INIT)
    print(f"  ✅ __init__.py")


def create_serializers():
    """Créer tous les fichiers de serializers"""
    print("\n📄 Génération des Serializers...")

    for filename, content in SERIALIZERS.items():
        filepath = os.path.join(SERIALIZERS_DIR, filename)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  ✅ {filename}")

    # Créer __init__.py
    init_path = os.path.join(SERIALIZERS_DIR, '__init__.py')
    with open(init_path, 'w', encoding='utf-8') as f:
        f.write(SERIALIZERS_INIT)
    print(f"  ✅ __init__.py")


def display_instructions():
    """Afficher les instructions post-génération"""
    print("\n" + "="*50)
    print("🎉 GÉNÉRATION TERMINÉE AVEC SUCCÈS!")
    print("="*50)
    print("\n📋 Prochaines étapes:")
    print("\n1. Configurer config/settings.py:")
    print("   AUTH_USER_MODEL = 'api.UserModel'")
    print("\n2. Créer les migrations:")
    print("   python manage.py makemigrations")
    print("   python manage.py migrate")
    print("\n3. Créer un superutilisateur:")
    print("   python manage.py createsuperuser")
    print("\n4. Lancer le serveur:")
    print("   python manage.py runserver")
    print("\n" + "="*50)


# ============================================
# MAIN
# ============================================

if __name__ == "__main__":
    print("🚀 Génération du projet Django - Système de Livraison")
    print("="*50)

    try:
        create_directories()
        create_models()
        create_serializers()
        display_instructions()

    except Exception as e:
        print(f"\n❌ Erreur: {e}")
