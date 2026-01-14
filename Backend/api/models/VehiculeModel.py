"""Modèle Véhicule"""
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


