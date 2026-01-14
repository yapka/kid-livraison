"""Modèle Zone de Livraison"""
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


