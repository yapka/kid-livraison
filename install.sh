#!/bin/bash

# Script d'installation automatique de KID Distribution
# Ce script installe et configure l'application complète

set -e  # Arrêter en cas d'erreur

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher un message coloré
print_message() {
    echo -e "${BLUE}==>${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Fonction pour vérifier si une commande existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Banner
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}   Installation KID Distribution          ${BLUE}║${NC}"
echo -e "${BLUE}║${NC}   Système de Gestion de Livraison        ${BLUE}║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""

# 1. Vérifier Docker
print_message "Vérification de Docker..."
if command_exists docker; then
    DOCKER_VERSION=$(docker --version | cut -d ' ' -f3 | cut -d ',' -f1)
    print_success "Docker installé (version $DOCKER_VERSION)"
else
    print_error "Docker n'est pas installé"
    echo ""
    echo "Installez Docker depuis: https://docs.docker.com/get-docker/"
    echo "Ou utilisez la commande suivante (Ubuntu/Debian):"
    echo "  curl -fsSL https://get.docker.com -o get-docker.sh"
    echo "  sudo sh get-docker.sh"
    exit 1
fi

# Vérifier si le service Docker est actif
if ! docker info >/dev/null 2>&1; then
    print_error "Le service Docker n'est pas démarré"
    echo "Démarrez-le avec: sudo systemctl start docker"
    exit 1
fi

# 2. Vérifier Docker Compose
print_message "Vérification de Docker Compose..."
if command_exists docker-compose; then
    COMPOSE_VERSION=$(docker-compose --version | cut -d ' ' -f4 | cut -d ',' -f1)
    print_success "Docker Compose installé (version $COMPOSE_VERSION)"
    COMPOSE_CMD="docker-compose"
elif docker compose version >/dev/null 2>&1; then
    COMPOSE_VERSION=$(docker compose version --short)
    print_success "Docker Compose installé (version $COMPOSE_VERSION)"
    COMPOSE_CMD="docker compose"
else
    print_error "Docker Compose n'est pas installé"
    echo ""
    echo "Installez Docker Compose depuis: https://docs.docker.com/compose/install/"
    exit 1
fi

# 3. Vérifier les fichiers nécessaires
print_message "Vérification des fichiers de configuration..."
if [ ! -f "docker-compose.yml" ]; then
    print_error "Fichier docker-compose.yml introuvable"
    exit 1
fi
print_success "Fichier docker-compose.yml trouvé"

if [ ! -f "Backend/.env.example" ]; then
    print_warning "Fichier Backend/.env.example introuvable"
else
    print_success "Fichier Backend/.env.example trouvé"
fi

# 4. Configuration de l'environnement
print_message "Configuration de l'environnement..."

if [ ! -f "Backend/.env" ]; then
    print_warning "Fichier Backend/.env non trouvé, création depuis .env.example..."
    
    if [ -f "Backend/.env.example" ]; then
        cp Backend/.env.example Backend/.env
        
        # Générer une clé secrète Django
        SECRET_KEY=$(openssl rand -base64 50 | tr -d "=+/" | cut -c1-50)
        
        # Demander les informations de configuration
        echo ""
        read -p "Nom de la base de données [kid_db]: " DB_NAME
        DB_NAME=${DB_NAME:-kid_db}
        
        read -p "Utilisateur de la base de données [kid_user]: " DB_USER
        DB_USER=${DB_USER:-kid_user}
        
        read -sp "Mot de passe de la base de données: " DB_PASSWORD
        echo ""
        while [ -z "$DB_PASSWORD" ]; do
            read -sp "Le mot de passe ne peut pas être vide. Entrez un mot de passe: " DB_PASSWORD
            echo ""
        done
        
        read -p "Mode debug (True/False) [False]: " DEBUG
        DEBUG=${DEBUG:-False}
        
        # Mettre à jour le fichier .env
        sed -i "s/DB_NAME=.*/DB_NAME=$DB_NAME/" Backend/.env
        sed -i "s/DB_USER=.*/DB_USER=$DB_USER/" Backend/.env
        sed -i "s/DB_PASSWORD=.*/DB_PASSWORD=$DB_PASSWORD/" Backend/.env
        sed -i "s/SECRET_KEY=.*/SECRET_KEY=$SECRET_KEY/" Backend/.env
        sed -i "s/DEBUG=.*/DEBUG=$DEBUG/" Backend/.env
        sed -i "s/USE_SQLITE=.*/USE_SQLITE=False/" Backend/.env
        
        print_success "Fichier Backend/.env créé et configuré"
    else
        print_error "Impossible de créer Backend/.env"
        exit 1
    fi
else
    print_success "Fichier Backend/.env déjà configuré"
fi

# 5. Arrêter les conteneurs existants (si présents)
print_message "Nettoyage des conteneurs existants..."
$COMPOSE_CMD down --remove-orphans 2>/dev/null || true
print_success "Nettoyage terminé"

# 6. Construction des images Docker
print_message "Construction des images Docker..."
echo "Cela peut prendre plusieurs minutes..."
if $COMPOSE_CMD build --no-cache; then
    print_success "Images construites avec succès"
else
    print_error "Échec de la construction des images"
    exit 1
fi

# 7. Démarrage des conteneurs
print_message "Démarrage des conteneurs..."
if $COMPOSE_CMD up -d; then
    print_success "Conteneurs démarrés"
else
    print_error "Échec du démarrage des conteneurs"
    exit 1
fi

# Attendre que la base de données soit prête
print_message "Attente du démarrage de la base de données..."
sleep 10

# Vérifier que le conteneur backend est en cours d'exécution
if ! docker ps | grep -q "backend"; then
    print_error "Le conteneur backend n'est pas en cours d'exécution"
    echo "Logs du conteneur:"
    $COMPOSE_CMD logs backend
    exit 1
fi

print_success "Base de données prête"

# 8. Exécution des migrations Django
print_message "Exécution des migrations de base de données..."
if $COMPOSE_CMD exec -T backend python manage.py migrate; then
    print_success "Migrations exécutées avec succès"
else
    print_error "Échec des migrations"
    echo "Vérifiez les logs avec: $COMPOSE_CMD logs backend"
    exit 1
fi

# 9. Collecte des fichiers statiques
print_message "Collecte des fichiers statiques..."
if $COMPOSE_CMD exec -T backend python manage.py collectstatic --noinput; then
    print_success "Fichiers statiques collectés"
else
    print_warning "Échec de la collecte des fichiers statiques (non critique)"
fi

# 10. Création du superutilisateur
print_message "Création du superutilisateur Django..."
echo ""
echo "Entrez les informations pour le compte administrateur:"
read -p "Nom d'utilisateur: " ADMIN_USERNAME
while [ -z "$ADMIN_USERNAME" ]; do
    read -p "Le nom d'utilisateur ne peut pas être vide. Nom d'utilisateur: " ADMIN_USERNAME
done

read -p "Email (optionnel): " ADMIN_EMAIL

read -sp "Mot de passe: " ADMIN_PASSWORD
echo ""
while [ -z "$ADMIN_PASSWORD" ]; do
    read -sp "Le mot de passe ne peut pas être vide. Mot de passe: " ADMIN_PASSWORD
    echo ""
done

read -sp "Confirmer le mot de passe: " ADMIN_PASSWORD_CONFIRM
echo ""

if [ "$ADMIN_PASSWORD" != "$ADMIN_PASSWORD_CONFIRM" ]; then
    print_error "Les mots de passe ne correspondent pas"
    exit 1
fi

# Créer le superutilisateur via un script Python
cat > /tmp/create_superuser.py << EOF
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='$ADMIN_USERNAME').exists():
    User.objects.create_superuser('$ADMIN_USERNAME', '$ADMIN_EMAIL', '$ADMIN_PASSWORD')
    print('Superutilisateur créé avec succès')
else:
    print('Utilisateur existe déjà')
EOF

if docker cp /tmp/create_superuser.py $(docker ps -qf "name=backend"):/app/create_superuser.py && \
   $COMPOSE_CMD exec -T backend python create_superuser.py; then
    print_success "Superutilisateur créé avec succès"
    rm -f /tmp/create_superuser.py
else
    print_warning "Impossible de créer le superutilisateur automatiquement"
    echo "Créez-le manuellement avec: $COMPOSE_CMD exec backend python manage.py createsuperuser"
fi

# 11. Afficher les informations de connexion
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║${NC}   Installation terminée avec succès !     ${GREEN}║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
echo ""
print_success "L'application est maintenant accessible"
echo ""
echo -e "${BLUE}URLs d'accès:${NC}"
echo "  - Frontend: http://localhost"
echo "  - Backend API: http://localhost/api"
echo "  - Admin Django: http://localhost/admin"
echo ""
echo -e "${BLUE}Identifiants administrateur:${NC}"
echo "  - Username: $ADMIN_USERNAME"
echo "  - Email: $ADMIN_EMAIL"
echo ""
echo -e "${BLUE}Commandes utiles:${NC}"
echo "  - Voir les logs: $COMPOSE_CMD logs -f"
echo "  - Arrêter: $COMPOSE_CMD down"
echo "  - Redémarrer: $COMPOSE_CMD restart"
echo "  - Status: $COMPOSE_CMD ps"
echo ""
print_message "Vérification de l'état des conteneurs..."
$COMPOSE_CMD ps
echo ""
print_success "Installation complète !"
