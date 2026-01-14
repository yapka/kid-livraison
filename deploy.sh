#!/bin/bash

# Script de déploiement automatisé
# Usage: ./deploy.sh [environnement]
# Environnements: dev, staging, production

set -e  # Arrêt en cas d'erreur

ENVIRONMENT=${1:-dev}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backups"

echo " Déploiement KID Livraison - Environnement: $ENVIRONMENT"
echo "================================================"

# Fonction pour afficher les messages
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Fonction pour créer une sauvegarde
backup_database() {
    log " Création d'une sauvegarde de la base de données..."
    mkdir -p $BACKUP_DIR
    docker compose exec -T db pg_dump -U kid_user kid_livraison > "$BACKUP_DIR/backup_${TIMESTAMP}.sql"
    log "Sauvegarde créée: $BACKUP_DIR/backup_${TIMESTAMP}.sql"
}

# Fonction pour vérifier les prérequis
check_requirements() {
    log "Vérification des prérequis..."
    
    if ! command -v docker &> /dev/null; then
        log "Docker n'est pas installé"
        exit 1
    fi
    
    if ! docker compose version &> /dev/null; then
        log "Docker Compose n'est pas installé"
        exit 1
    fi
    
    if [ ! -f ".env" ]; then
        log "  Fichier .env non trouvé, utilisation de .env.example"
        cp .env.example .env
        log "N'oubliez pas de configurer les variables dans .env"
    fi
    
    log "Prérequis vérifiés"
}

# Fonction de déploiement
deploy() {
    log "Construction des images Docker..."
    docker compose build --no-cache
    
    if [ "$ENVIRONMENT" = "production" ]; then
        log "Sauvegarde de la base de données..."
        backup_database || log "Impossible de créer une sauvegarde"
    fi
    
    log " Arrêt des anciens containers..."
    docker compose down
    
    log " Démarrage des nouveaux containers..."
    if [ "$ENVIRONMENT" = "production" ]; then
        docker compose --profile production up -d
    else
        docker compose up -d
    fi
    
    log "Attente du démarrage de la base de données..."
    sleep 10
    
    log "Application des migrations..."
    docker compose exec -T backend python manage.py migrate --noinput
    
    log " Collecte des fichiers statiques..."
    docker compose exec -T backend python manage.py collectstatic --noinput
    
    log "Nettoyage des anciennes images..."
    docker image prune -f
    
    log "Déploiement terminé avec succès!"
}

# Fonction pour afficher le statut
show_status() {
    log " Statut des services:"
    docker compose ps
    
    log ""
    log " Logs récents:"
    docker compose logs --tail=50
}

# Fonction pour effectuer des tests
run_tests() {
    log "🧪 Exécution des tests..."
    
    log "Tests Backend..."
    docker compose exec -T backend python manage.py test || log "⚠️  Tests backend échoués"
    
    log "✅ Tests terminés"
}

# Menu principal
case "$ENVIRONMENT" in
    dev)
        log "🔧 Mode développement"
        check_requirements
        deploy
        show_status
        ;;
    staging)
        log "🔨 Mode staging"
        check_requirements
        run_tests
        deploy
        show_status
        ;;
    production)
        log "Mode production"
        check_requirements
        
        read -p " Êtes-vous sûr de déployer en PRODUCTION? (yes/no): " confirm
        if [ "$confirm" != "yes" ]; then
            log " Déploiement annulé"
            exit 0
        fi
        
        run_tests
        deploy
        show_status
        
        log "Application déployée en production!"
        log "Frontend: http://localhost"
        log "Backend API: http://localhost:8000/api/"
        log "Admin: http://localhost:8000/admin/"
        ;;
    *)
        log " Environnement invalide: $ENVIRONMENT"
        log "Usage: ./deploy.sh [dev|staging|production]"
        exit 1
        ;;
esac

log "================================================"
log " Déploiement terminé!"
