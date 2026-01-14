
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from . import views

router = DefaultRouter()
router.register(r'users', views.UserViewSet)
router.register(r'expediteurs', views.ExpediteurViewSet)
router.register(r'destinataires', views.DestinataireViewSet)
router.register(r'colis', views.ColisViewSet)
router.register(r'suivis', views.SuiviViewSet)
router.register(r'livreurs', views.LivreurViewSet)
router.register(r'vehicules', views.VehiculeViewSet)
router.register(r'livraisons', views.LivraisonViewSet)
router.register(r'factures', views.FactureViewSet)
router.register(r'zones-livraison', views.ZoneLivraisonViewSet)
router.register(r'notifications', views.NotificationViewSet)
router.register(r'tarifs', views.TarifViewSet)

urlpatterns = [
    # Authentication
    path('auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Health checks pour Kubernetes
    path('health/', views.health_check, name='health_check'),
    path('health/readiness/', views.readiness_check, name='readiness_check'),
    path('health/liveness/', views.liveness_check, name='liveness_check'),
    
    # API routes
    path('', include(router.urls)),
]
