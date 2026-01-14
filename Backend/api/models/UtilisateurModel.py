from django.contrib.auth.models import AbstractUser
from django.db import models

class UtilisateurModel(AbstractUser):
    ROLES = (('ADMIN', 'ADMIN'), ('OPERATEUR', 'OPERATEUR'), ('LIVREUR', 'LIVREUR'))
    telephone = models.CharField(max_length=20)
    role = models.CharField(max_length=20, choices=ROLES, default='OPERATEUR')
    actif = models.BooleanField(default=True)
    derniere_connexion = models.DateTimeField(null=True, blank=True)

    class Meta:
        app_label = 'api'
