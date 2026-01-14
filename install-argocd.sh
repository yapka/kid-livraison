#!/bin/bash

###############################################################################
# Script d'installation d'ArgoCD
# Ce script installe et configure ArgoCD sur un cluster Kubernetes
###############################################################################

set -e

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

echo_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

echo_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

echo_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Variables
ARGOCD_VERSION="${ARGOCD_VERSION:-stable}"
ARGOCD_NAMESPACE="argocd"

echo_info "==================================================================="
echo_info "Installation d'ArgoCD v${ARGOCD_VERSION}"
echo_info "==================================================================="

# 1. Vérifier kubectl
echo_info "Vérification de kubectl..."
if ! command -v kubectl &> /dev/null; then
    echo_error "kubectl n'est pas installé!"
    exit 1
fi
echo_success "kubectl trouvé: $(kubectl version --client --short)"

# 2. Vérifier la connexion au cluster
echo_info "Vérification de la connexion au cluster..."
if ! kubectl cluster-info &> /dev/null; then
    echo_error "Impossible de se connecter au cluster Kubernetes!"
    exit 1
fi
echo_success "Connecté au cluster: $(kubectl config current-context)"

# 3. Créer le namespace ArgoCD
echo_info "Création du namespace ${ARGOCD_NAMESPACE}..."
kubectl create namespace ${ARGOCD_NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -
echo_success "Namespace ${ARGOCD_NAMESPACE} créé"

# 4. Installer ArgoCD
echo_info "Installation d'ArgoCD..."
kubectl apply -n ${ARGOCD_NAMESPACE} -f https://raw.githubusercontent.com/argoproj/argo-cd/${ARGOCD_VERSION}/manifests/install.yaml
echo_success "ArgoCD installé"

# 5. Attendre que ArgoCD soit prêt
echo_info "Attente du démarrage d'ArgoCD (peut prendre 2-3 minutes)..."
kubectl wait --for=condition=available --timeout=300s \
    deployment/argocd-server \
    deployment/argocd-repo-server \
    deployment/argocd-applicationset-controller \
    -n ${ARGOCD_NAMESPACE}
echo_success "ArgoCD est prêt!"

# 6. Récupérer le mot de passe admin initial
echo_info "Récupération du mot de passe admin..."
ARGOCD_PASSWORD=$(kubectl -n ${ARGOCD_NAMESPACE} get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d)

# 7. Exposer ArgoCD (options)
echo_info "Comment voulez-vous exposer ArgoCD?"
echo "1) NodePort (développement/test)"
echo "2) LoadBalancer (cloud)"
echo "3) Ingress (production)"
echo "4) Port-forward seulement (local)"
read -p "Choix [1-4]: " EXPOSE_CHOICE

case $EXPOSE_CHOICE in
    1)
        echo_info "Configuration du service en NodePort..."
        kubectl patch svc argocd-server -n ${ARGOCD_NAMESPACE} -p '{"spec": {"type": "NodePort"}}'
        NODEPORT=$(kubectl get svc argocd-server -n ${ARGOCD_NAMESPACE} -o jsonpath='{.spec.ports[0].nodePort}')
        NODE_IP=$(kubectl get nodes -o jsonpath='{.items[0].status.addresses[?(@.type=="ExternalIP")].address}')
        if [ -z "$NODE_IP" ]; then
            NODE_IP=$(kubectl get nodes -o jsonpath='{.items[0].status.addresses[?(@.type=="InternalIP")].address}')
        fi
        echo_success "ArgoCD accessible via: https://${NODE_IP}:${NODEPORT}"
        ;;
    2)
        echo_info "Configuration du service en LoadBalancer..."
        kubectl patch svc argocd-server -n ${ARGOCD_NAMESPACE} -p '{"spec": {"type": "LoadBalancer"}}'
        echo_warning "Attente de l'adresse IP externe (peut prendre quelques minutes)..."
        kubectl get svc argocd-server -n ${ARGOCD_NAMESPACE} -w
        ;;
    3)
        echo_info "Création d'un Ingress pour ArgoCD..."
        cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: argocd-server-ingress
  namespace: ${ARGOCD_NAMESPACE}
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-passthrough: "true"
    nginx.ingress.kubernetes.io/backend-protocol: "HTTPS"
spec:
  rules:
  - host: argocd.example.com  # À MODIFIER
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: argocd-server
            port:
              number: 443
  tls:
  - hosts:
    - argocd.example.com  # À MODIFIER
    secretName: argocd-tls
EOF
        echo_success "Ingress créé. ArgoCD sera accessible via: https://argocd.example.com"
        echo_warning "N'oubliez pas de modifier le host dans l'ingress!"
        ;;
    4)
        echo_info "Utilisation de port-forward..."
        echo_warning "Exécutez: kubectl port-forward svc/argocd-server -n ${ARGOCD_NAMESPACE} 8080:443"
        ;;
    *)
        echo_warning "Choix invalide. Utilisation de port-forward par défaut."
        ;;
esac

# 8. Installer ArgoCD CLI (optionnel)
echo_info "Voulez-vous installer ArgoCD CLI? [y/N]"
read -p "Choix: " INSTALL_CLI

if [[ "$INSTALL_CLI" =~ ^[Yy]$ ]]; then
    echo_info "Installation d'ArgoCD CLI..."
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        curl -sSL -o /tmp/argocd-linux-amd64 https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64
        sudo install -m 555 /tmp/argocd-linux-amd64 /usr/local/bin/argocd
        rm /tmp/argocd-linux-amd64
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        brew install argocd
    fi
    echo_success "ArgoCD CLI installé: $(argocd version --client)"
fi

# 9. Déployer l'AppProject et les Applications
echo_info "Voulez-vous déployer le projet et les applications KID Livraison? [y/N]"
read -p "Choix: " DEPLOY_APP

if [[ "$DEPLOY_APP" =~ ^[Yy]$ ]]; then
    echo_info "Déploiement de l'AppProject..."
    kubectl apply -f argocd/appproject.yaml
    
    echo_info "Quelle application voulez-vous déployer?"
    echo "1) Dev"
    echo "2) Staging"
    echo "3) Production"
    echo "4) Toutes"
    read -p "Choix [1-4]: " APP_CHOICE
    
    case $APP_CHOICE in
        1)
            kubectl apply -f argocd/application-dev.yaml
            ;;
        2)
            kubectl apply -f argocd/application-staging.yaml
            ;;
        3)
            kubectl apply -f argocd/application-prod.yaml
            ;;
        4)
            kubectl apply -f argocd/application-dev.yaml
            kubectl apply -f argocd/application-staging.yaml
            kubectl apply -f argocd/application-prod.yaml
            ;;
        *)
            echo_warning "Choix invalide. Aucune application déployée."
            ;;
    esac
    
    echo_success "Applications déployées"
fi

# 10. Résumé
echo ""
echo_success "==================================================================="
echo_success "ArgoCD installé avec succès!"
echo_success "==================================================================="
echo ""
echo_info "Informations de connexion:"
echo "  Username: admin"
echo "  Password: ${ARGOCD_PASSWORD}"
echo ""
echo_warning "IMPORTANT: Changez le mot de passe admin après la première connexion!"
echo ""
echo_info "Commandes utiles:"
echo "  # Port-forward pour accéder à ArgoCD UI"
echo "  kubectl port-forward svc/argocd-server -n ${ARGOCD_NAMESPACE} 8080:443"
echo ""
echo "  # Connexion avec ArgoCD CLI"
echo "  argocd login localhost:8080"
echo ""
echo "  # Changer le mot de passe admin"
echo "  argocd account update-password"
echo ""
echo "  # Lister les applications"
echo "  kubectl get applications -n ${ARGOCD_NAMESPACE}"
echo ""
echo "  # Voir les logs ArgoCD"
echo "  kubectl logs -n ${ARGOCD_NAMESPACE} deployment/argocd-server -f"
echo ""
echo_success "Prochaines étapes:"
echo "  1. Connectez-vous à ArgoCD UI"
echo "  2. Changez le mot de passe admin"
echo "  3. Configurez vos repos Git"
echo "  4. Déployez vos applications"
echo ""
