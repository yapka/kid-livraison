"""Modèle Livreur"""
from django.db import models


class LivreurModel(models.Model):
    """Informations des livreurs"""

    STATUT_CHOICES = [
        ('DISPONIBLE', 'Disponible'),
        ('EN_LIVRAISON', 'En livraison'),
        ('REPOS', 'Repos'),
        ('ABSENT', 'Absent'),
    ]

    utilisateur = models.OneToOneField('UserModel', on_delete=models.CASCADE, related_name='profil_livreur')
    matricule = models.CharField(max_length=50, unique=True)
    permis_conduire = models.CharField(max_length=50)
    date_validite_permis = models.DateField()
    telephone_pro = models.CharField(max_length=20)
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='DISPONIBLE')
    note_moyenne = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    nombre_livraisons = models.IntegerField(default=0)
    zone_intervention = models.TextField()
    date_embauche = models.DateField()
    actif = models.BooleanField(default=True)

    class Meta:
        db_table = 'livreur'
        verbose_name = 'Livreur'
        verbose_name_plural = 'Livreurs'

    def __str__(self):
        return f"{self.matricule} - {self.utilisateur.get_full_name()}"


