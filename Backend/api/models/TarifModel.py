"""Modèle Tarif"""
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

