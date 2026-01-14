#!/bin/bash

###############################################################################
# Script de gestion ArgoCD pour KID Livraison
# Commandes utiles pour gérer les déploiements ArgoCD
###############################################################################

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
echo_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
echo_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
echo_error() { echo -e "${RED}[ERROR]${NC} $1"; }

ARGOCD_NAMESPACE="argocd"

# Fonction d'aide
show_help() {
    cat << EOF
Usage: ./argocd-manage.sh [COMMAND] [OPTIONS]

Commandes de gestion ArgoCD pour KID Livraison

COMMANDS:
    status              Afficher le statut de toutes les applications
    sync [ENV]          Synchroniser une application (dev|staging|prod|all)
    logs [ENV]          Afficher les logs d'une application
    rollback [ENV]      Rollback d'une application
    diff [ENV]          Afficher les différences
    delete [ENV]        Supprimer une application
    restart [ENV]       Redémarrer les pods d'une application
    port-forward        Démarrer port-forward pour ArgoCD UI
    ui                  Ouvrir ArgoCD UI dans le navigateur
    password            Récupérer/changer le mot de passe admin
    version             Afficher la version d'ArgoCD
    health              Vérifier la santé d'ArgoCD
    apps                Lister toutes les applications

ENV:
    dev                 Environnement de développement
    staging             Environnement de staging
    prod                Environnement de production
    all                 Tous les environnements

EXAMPLES:
    ./argocd-manage.sh status
    ./argocd-manage.sh sync dev
    ./argocd-manage.sh logs prod
    ./argocd-manage.sh rollback staging
    ./argocd-manage.sh port-forward

EOF
}

# Fonction: Status
cmd_status() {
    echo_info "Status des applications ArgoCD:"
    kubectl get applications -n ${ARGOCD_NAMESPACE} -o wide
}

# Fonction: Sync
cmd_sync() {
    local env=$1
    
    if [ -z "$env" ]; then
        echo_error "Environnement requis: dev|staging|prod|all"
        exit 1
    fi
    
    if [ "$env" = "all" ]; then
        echo_info "Synchronisation de toutes les applications..."
        kubectl -n ${ARGOCD_NAMESPACE} patch app kid-livraison-dev --type merge -p '{"operation":{"sync":{}}}'
        kubectl -n ${ARGOCD_NAMESPACE} patch app kid-livraison-staging --type merge -p '{"operation":{"sync":{}}}'
        kubectl -n ${ARGOCD_NAMESPACE} patch app kid-livraison-prod --type merge -p '{"operation":{"sync":{}}}'
    else
        echo_info "Synchronisation de l'application ${env}..."
        kubectl -n ${ARGOCD_NAMESPACE} patch app kid-livraison-${env} --type merge -p '{"operation":{"sync":{}}}'
    fi
    
    echo_success "Synchronisation lancée"
}

# Fonction: Logs
cmd_logs() {
    local env=$1
    
    if [ -z "$env" ]; then
        echo_error "Environnement requis: dev|staging|prod"
        exit 1
    fi
    
    local namespace="app-kid-${env}"
    
    echo_info "Sélectionnez le composant:"
    echo "1) Backend"
    echo "2) Frontend"
    echo "3) PostgreSQL"
    read -p "Choix [1-3]: " component
    
    case $component in
        1) kubectl logs -n ${namespace} -l app=backend -f --tail=100 ;;
        2) kubectl logs -n ${namespace} -l app=frontend -f --tail=100 ;;
        3) kubectl logs -n ${namespace} -l app=postgres -f --tail=100 ;;
        *) echo_error "Choix invalide" ;;
    esac
}

# Fonction: Rollback
cmd_rollback() {
    local env=$1
    
    if [ -z "$env" ]; then
        echo_error "Environnement requis: dev|staging|prod"
        exit 1
    fi
    
    echo_warning "Rollback de l'application ${env}..."
    kubectl -n ${ARGOCD_NAMESPACE} patch app kid-livraison-${env} --type merge -p '{"operation":{"rollback":{}}}'
    
    echo_success "Rollback effectué"
}

# Fonction: Diff
cmd_diff() {
    local env=$1
    
    if [ -z "$env" ]; then
        echo_error "Environnement requis: dev|staging|prod"
        exit 1
    fi
    
    echo_info "Différences pour ${env}:"
    kubectl -n ${ARGOCD_NAMESPACE} get app kid-livraison-${env} -o jsonpath='{.status.operationState.syncResult.resources}' | jq
}

# Fonction: Delete
cmd_delete() {
    local env=$1
    
    if [ -z "$env" ]; then
        echo_error "Environnement requis: dev|staging|prod"
        exit 1
    fi
    
    echo_warning "Suppression de l'application ${env}..."
    read -p "Êtes-vous sûr? [y/N]: " confirm
    
    if [[ "$confirm" =~ ^[Yy]$ ]]; then
        kubectl delete application kid-livraison-${env} -n ${ARGOCD_NAMESPACE}
        echo_success "Application supprimée"
    else
        echo_info "Annulé"
    fi
}

# Fonction: Restart
cmd_restart() {
    local env=$1
    
    if [ -z "$env" ]; then
        echo_error "Environnement requis: dev|staging|prod"
        exit 1
    fi
    
    local namespace="app-kid-${env}"
    
    echo_info "Redémarrage des pods pour ${env}..."
    kubectl rollout restart deployment -n ${namespace}
    
    echo_success "Redémarrage en cours"
}

# Fonction: Port-forward
cmd_port_forward() {
    echo_info "Démarrage du port-forward pour ArgoCD UI..."
    echo_success "ArgoCD UI disponible sur: https://localhost:8080"
    echo_warning "Appuyez sur Ctrl+C pour arrêter"
    kubectl port-forward svc/argocd-server -n ${ARGOCD_NAMESPACE} 8080:443
}

# Fonction: UI
cmd_ui() {
    echo_info "Ouverture d'ArgoCD UI..."
    kubectl port-forward svc/argocd-server -n ${ARGOCD_NAMESPACE} 8080:443 &
    PF_PID=$!
    sleep 3
    
    if command -v xdg-open &> /dev/null; then
        xdg-open https://localhost:8080
    elif command -v open &> /dev/null; then
        open https://localhost:8080
    else
        echo_info "Ouvrez votre navigateur sur: https://localhost:8080"
    fi
    
    echo_warning "Port-forward PID: $PF_PID"
    echo_info "Pour arrêter: kill $PF_PID"
}

# Fonction: Password
cmd_password() {
    echo_info "Mot de passe admin ArgoCD:"
    kubectl -n ${ARGOCD_NAMESPACE} get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
    echo ""
    
    echo ""
    echo_info "Pour changer le mot de passe:"
    echo "  argocd login localhost:8080"
    echo "  argocd account update-password"
}

# Fonction: Version
cmd_version() {
    echo_info "Version ArgoCD:"
    kubectl get deployment argocd-server -n ${ARGOCD_NAMESPACE} -o jsonpath='{.spec.template.spec.containers[0].image}'
    echo ""
}

# Fonction: Health
cmd_health() {
    echo_info "Santé des composants ArgoCD:"
    kubectl get pods -n ${ARGOCD_NAMESPACE}
    echo ""
    echo_info "Services ArgoCD:"
    kubectl get svc -n ${ARGOCD_NAMESPACE}
}

# Fonction: Apps
cmd_apps() {
    echo_info "Liste des applications:"
    kubectl get applications -n ${ARGOCD_NAMESPACE}
}

# Main
case "${1:-}" in
    status)
        cmd_status
        ;;
    sync)
        cmd_sync "${2:-}"
        ;;
    logs)
        cmd_logs "${2:-}"
        ;;
    rollback)
        cmd_rollback "${2:-}"
        ;;
    diff)
        cmd_diff "${2:-}"
        ;;
    delete)
        cmd_delete "${2:-}"
        ;;
    restart)
        cmd_restart "${2:-}"
        ;;
    port-forward)
        cmd_port_forward
        ;;
    ui)
        cmd_ui
        ;;
    password)
        cmd_password
        ;;
    version)
        cmd_version
        ;;
    health)
        cmd_health
        ;;
    apps)
        cmd_apps
        ;;
    help|--help|-h|"")
        show_help
        ;;
    *)
        echo_error "Commande inconnue: $1"
        show_help
        exit 1
        ;;
esac
