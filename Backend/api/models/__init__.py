"""Import de tous les models"""
from .UserModel import UserModel
from .ExpediteurModel import ExpediteurModel
from .DestinataireModel import DestinataireModel
from .ColisModel import ColisModel
from .SuiviModel import SuiviModel
from .LivreurModel import LivreurModel
from .VehiculeModel import VehiculeModel
from .LivraisonModel import LivraisonModel
from .FactureModel import FactureModel
from .ZoneLivraisonModel import ZoneLivraisonModel
from .NotificationModel import NotificationModel
from .TarifModel import TarifModel

__all__ = [
    'UserModel',
    'ExpediteurModel',
    'DestinataireModel',
    'ColisModel',
    'SuiviModel',
    'LivreurModel',
    'VehiculeModel',
    'LivraisonModel',
    'FactureModel',
    'ZoneLivraisonModel',
    'NotificationModel',
    'TarifModel',
]
