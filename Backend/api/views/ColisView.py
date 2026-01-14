"""Vue pour ColisModel"""
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from api.models import ColisModel
from api.serializers import ColisListSerializer, ColisDetailSerializer
from api.permissions import IsAdminOrOperateurUser # Import the custom permission
from api.models import FactureModel, SuiviModel, NotificationModel, UserModel # Import necessary models
from django.db import transaction # Import transaction to ensure atomicity

class ColisViewSet(viewsets.ModelViewSet):
    queryset = ColisModel.objects.all()

    permission_classes = [IsAdminOrOperateurUser] # Apply the custom permission

    def get_serializer_class(self):
        if self.action == 'list':
            return ColisListSerializer
        return ColisDetailSerializer

    @action(detail=True, methods=['post'], url_path='livrer')
    def livrer_colis(self, request, pk=None):
        colis = self.get_object()
        code = request.data.get('code')
        # Supposons que le code attendu est le numero_suivi
        if colis.statut != 'EN_ATTENTE':
            return Response({'detail': 'Colis non en attente.'}, status=status.HTTP_400_BAD_REQUEST)
        if code != colis.numero_suivi:
            return Response({'detail': 'Code incorrect.'}, status=status.HTTP_400_BAD_REQUEST)
        colis.statut = 'LIVRE'
        colis.date_livraison_reelle = timezone.now()
        colis.save()
        # Notification de succès (optionnel: à adapter selon votre logique de notification)
        NotificationModel.objects.create(
            colis=colis,
            type_notification='SMS',
            destinataire=colis.destinataire.telephone,
            sujet='Colis livré',
            message=f'Votre colis {colis.numero_suivi} a été remis avec succès.',
            statut='LIVRE'
        )
        return Response({'detail': 'Colis livré avec succès.'}, status=status.HTTP_200_OK)

    def perform_create(self, serializer):
        with transaction.atomic():
            # 1. Save the ColisModel instance
            colis_instance = serializer.save(utilisateur=self.request.user) # Associate with current user

            # 2. Create FactureModel entry
            facture_instance = FactureModel.objects.create(
                colis=colis_instance,
                # The save method of FactureModel will calculate tariffs automatically
                # based on the colis_instance characteristics.
                montant_base=0.00, # Placeholder, will be calculated by FactureModel.save()
                montant_total=0.00, # Placeholder, will be calculated by FactureModel.save()
            )
            # Explicitly call save to trigger tariff calculation if not triggered by create
            # (create often calls save, but being explicit ensures it)
            facture_instance.save()

            # 3. Create initial SuiviModel entry
            SuiviModel.objects.create(
                colis=colis_instance,
                statut='COLIS_RECEPTIONNE',
                description='Colis réceptionné à l\'agence Cocody',
                utilisateur=self.request.user,
                localisation='Agence Cocody'
            )

            # 4. Create SMS NotificationModel for sender
            NotificationModel.objects.create(
                colis=colis_instance,
                type_notification='SMS',
                destinataire=colis_instance.expediteur.telephone,
                sujet='Confirmation d\'enregistrement de colis',
                message=f'Votre colis {colis_instance.numero_suivi} a été enregistré avec succès. Suivi: {colis_instance.get_absolute_url() if hasattr(colis_instance, 'get_absolute_url') else 'URL non disponible'}',
                statut='EN_ATTENTE'
            )

            # 5. Create SMS NotificationModel for recipient
            NotificationModel.objects.create(
                colis=colis_instance,
                type_notification='SMS',
                destinataire=colis_instance.destinataire.telephone,
                sujet='Notification de colis en attente',
                message=f'Un colis ({colis_instance.numero_suivi}) vous est destiné. Statut actuel: En attente. Suivi: {colis_instance.get_absolute_url() if hasattr(colis_instance, 'get_absolute_url') else 'URL non disponible'}',
                statut='EN_ATTENTE'
            )
