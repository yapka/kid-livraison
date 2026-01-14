"""Import de toutes les vues"""
from .UserView import UserViewSet
from .ExpediteurView import ExpediteurViewSet
from .DestinataireView import DestinataireViewSet
from .ColisView import ColisViewSet
from .SuiviView import SuiviViewSet
from .LivreurView import LivreurViewSet
from .VehiculeView import VehiculeViewSet
from .LivraisonView import LivraisonViewSet
from .FactureView import FactureViewSet
from .ZoneLivraisonView import ZoneLivraisonViewSet
from .NotificationView import NotificationViewSet
from .TarifView import TarifViewSet
from .HealthView import health_check, readiness_check, liveness_check

__all__ = [
    'UserViewSet',
    'ExpediteurViewSet',
    'DestinataireViewSet',
    'ColisViewSet',
    'SuiviViewSet',
    'LivreurViewSet',
    'VehiculeViewSet',
    'LivraisonViewSet',
    'FactureViewSet',
    'ZoneLivraisonViewSet',
    'NotificationViewSet',
    'TarifViewSet',
    'health_check',
    'readiness_check',
    'liveness_check',
]
