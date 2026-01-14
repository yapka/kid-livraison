"""Modèle Colis"""
from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal
import random
import string
from api.models.TarifModel import TarifModel  # Import TarifModel


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
    poids = models.DecimalField(max_digits=6, decimal_places=2, validators=[MinValueValidator(Decimal('0.01'))],null=True)
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

    frais_envoi = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
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
        """Génère un numéro de suivi unique: 3 lettres de la ville + 4 chiffres."""
        ville = None
        try:
            ville = getattr(self.destinataire, 'ville', None)
        except Exception:
            ville = None

        if ville and isinstance(ville, str) and ville.strip():
            cleaned = ''.join(ch for ch in ville.upper() if ch.isalpha())
            prefix = (cleaned + 'XXX')[:3]
        else:
            prefix = 'KID'

        for _ in range(10):
            random_str = ''.join(random.choices(string.digits, k=4))
            candidate = f"{prefix}{random_str}"
            if not self.__class__.objects.filter(numero_suivi=candidate).exists():
                return candidate

        import uuid
        return f"{prefix}{uuid.uuid4().hex[:4].upper()}"

    def calculate_tariffs(self):
        """Calcule les tarifs (montant de base, express, assurance) pour le colis."""
        montant_base = Decimal('0.00')
        frais_express = Decimal('0.00')
        frais_assurance = Decimal('0.00')

        # 1. Calcul du montant de base et des frais de poids
        # Chercher un tarif correspondant au poids et au type de service (priorité)
        try:
            tarif = TarifModel.objects.filter(
                poids_min__lte=self.poids,
                poids_max__gte=self.poids,
                type_service=self.priorite,
                actif=True,
            ).first()

            if tarif:
                montant_base = tarif.prix
            else:
                # Fallback: trouver un tarif générique ou appliquer un tarif par défaut
                # Pour l'instant, on met un montant par défaut si aucun tarif spécifique n'est trouvé
                # ou on pourrait lever une erreur
                montant_base = Decimal('5000.00') # Exemple de tarif de base par défaut
        except TarifModel.DoesNotExist:
            montant_base = Decimal('5000.00') # Tarif par défaut si aucun tarif n'existe
        except Exception as e:
            print(f"Erreur lors de la recherche du tarif: {e}")
            montant_base = Decimal('5000.00')

        # 2. Calcul des frais express (si applicable)
        if self.priorite == 'EXPRESS':
            frais_express = montant_base * Decimal('0.20')  # 20% de supplément pour express
        elif self.priorite == 'URGENTE':
            frais_express = montant_base * Decimal('0.50')  # 50% de supplément pour urgent

        # 3. Calcul des frais d'assurance (si applicable)
        if self.assurance and self.valeur_declaree > 0:
            frais_assurance = self.valeur_declaree * Decimal('0.01')  # 1% de la valeur déclarée

        # Note: Les frais de distance ne sont pas inclus ici car ils dépendraient des zones,
        # qui ne sont pas encore directement liées au ColisModel dans la structure actuelle.
        # Ils devront être calculés au niveau de la Livraison ou via une logique de ZoneLivraison.

        return {
            'montant_base': montant_base,
            'frais_express': frais_express,
            'frais_assurance': frais_assurance,
            'frais_poids': Decimal('0.00'), # Placeholder for now, can be integrated into montant_base or calculated separately
        }

    def __str__(self):
        return f"{self.numero_suivi} - {self.destinataire.nom_complet}"

