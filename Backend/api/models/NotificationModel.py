"""Modèle Notification"""
from django.db import models


class NotificationModel(models.Model):
    """Système de notifications"""

    TYPE_CHOICES = [
        ('SMS', 'SMS'),
        ('EMAIL', 'Email'),
        ('PUSH', 'Notification Push'),
    ]

    STATUT_CHOICES = [
        ('EN_ATTENTE', 'En attente'),
        ('ENVOYEE', 'Envoyée'),
        ('ECHOUEE', 'Échouée'),
    ]

    utilisateur = models.ForeignKey('UserModel', on_delete=models.CASCADE, null=True, blank=True)
    colis = models.ForeignKey('ColisModel', on_delete=models.CASCADE, related_name='notifications')
    type_notification = models.CharField(max_length=10, choices=TYPE_CHOICES)
    destinataire = models.CharField(max_length=200)
    sujet = models.CharField(max_length=200)
    message = models.TextField()
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='EN_ATTENTE')
    date_envoi = models.DateTimeField(null=True, blank=True)
    date_lecture = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'notification'
        verbose_name = 'Notification'
        verbose_name_plural = 'Notifications'
        ordering = ['-date_envoi']

    def __str__(self):
        return f"{self.type_notification} - {self.colis.numero_suivi}"


