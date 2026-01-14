"""Modèle Utilisateur personnalisé"""
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


