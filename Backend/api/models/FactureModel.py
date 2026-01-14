"""Modèle Facture"""
from django.db import models
import random
import string
from decimal import Decimal # Import Decimal


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
    montant_base = models.DecimalField(max_digits=10, decimal_places=2, default=0) # Added default=0
    frais_distance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    frais_poids = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    frais_assurance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    frais_express = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    montant_total = models.DecimalField(max_digits=10, decimal_places=2, default=0) # Added default=0
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

        # Calculate tariffs from the associated colis
        if self.colis and not self.pk: # Only calculate on initial creation of invoice
            calculated_tariffs = self.colis.calculate_tariffs()
            self.montant_base = calculated_tariffs.get('montant_base', Decimal('0.00'))
            self.frais_express = calculated_tariffs.get('frais_express', Decimal('0.00'))
            self.frais_assurance = calculated_tariffs.get('frais_assurance', Decimal('0.00'))
            self.frais_poids = calculated_tariffs.get('frais_poids', Decimal('0.00')) # Ensure frais_poids is included

            # Calculate total amount
            self.montant_total = self.montant_base + self.frais_distance +                                  self.frais_poids + self.frais_assurance + self.frais_express

        super().save(*args, **kwargs)

    def generer_numero_facture(self):
        """Génère un numéro de facture unique"""
        prefix = 'FACT'
        random_str = ''.join(random.choices(string.digits, k=8))
        return f"{prefix}{random_str}"

    def __str__(self):
        return f"{self.numero_facture} - {self.montant_total} FCFA"

