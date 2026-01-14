"""Modèle Livraison"""
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


