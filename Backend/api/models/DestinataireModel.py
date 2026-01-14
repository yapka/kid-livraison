"""Modèle Destinataire"""
from django.db import models


class DestinataireModel(models.Model):
    """Informations des destinataires"""

    nom_complet = models.CharField(max_length=200)
    telephone = models.CharField(max_length=20)
    email = models.EmailField(blank=True, null=True)
    adresse_complete = models.TextField(null=True)
    ville = models.CharField(max_length=100)
    quartier = models.CharField(max_length=100,null=True)
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


