"""Import de tous les serializers"""
from .UserSerializer import UserSerializer
from .ExpediteurSerializer import ExpediteurSerializer
from .DestinataireSerializer import DestinataireSerializer
from .ColisSerializer import ColisListSerializer, ColisDetailSerializer
from .SuiviSerializer import SuiviSerializer
from .LivreurSerializer import LivreurSerializer
from .VehiculeSerializer import VehiculeSerializer
from .LivraisonSerializer import LivraisonSerializer
from .FactureSerializer import FactureSerializer
from .ZoneLivraisonSerializer import ZoneLivraisonSerializer
from .NotificationSerializer import NotificationSerializer
from .TarifSerializer import TarifSerializer
from .CustomTokenObtainPairSerializer import CustomTokenObtainPairSerializer

__all__ = [
    'UserSerializer',
    'ExpediteurSerializer',
    'DestinataireSerializer',
    'ColisListSerializer',
    'ColisDetailSerializer',
    'SuiviSerializer',
    'LivreurSerializer',
    'VehiculeSerializer',
    'LivraisonSerializer',
    'FactureSerializer',
    'ZoneLivraisonSerializer',
    'NotificationSerializer',
    'TarifSerializer',
    'CustomTokenObtainPairSerializer',
]
