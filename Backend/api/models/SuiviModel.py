"""Modèle Suivi"""
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
        ('RETOUR_EXPEDITEUR', 'Retour à l\'expéditeur'),
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


