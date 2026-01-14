"""Health check view pour Kubernetes probes"""
from django.http import JsonResponse
from django.db import connection
from django.conf import settings
import sys


def health_check(request):
    """
    Endpoint de health check pour les probes Kubernetes
    Vérifie:
    - Disponibilité de l'API
    - Connexion à la base de données
    """
    health_status = {
        'status': 'healthy',
        'service': 'kid-livraison-backend',
        'version': '1.0.0',
        'checks': {}
    }
    
    # Check database connection
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        health_status['checks']['database'] = 'connected'
    except Exception as e:
        health_status['status'] = 'unhealthy'
        health_status['checks']['database'] = f'error: {str(e)}'
        return JsonResponse(health_status, status=503)
    
    # Check Python version
    health_status['checks']['python_version'] = sys.version.split()[0]
    
    # Check debug mode
    health_status['checks']['debug_mode'] = settings.DEBUG
    
    return JsonResponse(health_status)


def readiness_check(request):
    """
    Endpoint de readiness check
    Vérifie si l'application est prête à recevoir du trafic
    """
    try:
        # Check database
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        
        return JsonResponse({
            'status': 'ready',
            'service': 'kid-livraison-backend'
        })
    except Exception as e:
        return JsonResponse({
            'status': 'not ready',
            'error': str(e)
        }, status=503)


def liveness_check(request):
    """
    Endpoint de liveness check
    Vérifie si l'application est vivante (répond aux requêtes)
    """
    return JsonResponse({
        'status': 'alive',
        'service': 'kid-livraison-backend'
    })
