#!/bin/bash
# Script pour utiliser les images depuis GitHub Container Registry

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Variables
GITHUB_USER="yapka"
REPO_NAME="kid-livraison"
REGISTRY="ghcr.io"
TAG="${1:-main}"  # Par défaut 'main', ou prendre l'argument

echo -e "${BLUE}🚀 Déploiement depuis GitHub Container Registry${NC}"
echo "Registry: $REGISTRY"
echo "User: $GITHUB_USER"
echo "Repo: $REPO_NAME"
echo "Tag: $TAG"
echo ""

# Login à GHCR (nécessite un Personal Access Token)
echo -e "${YELLOW}🔐 Login à GitHub Container Registry...${NC}"
echo "Si vous n'avez pas de token, créez-en un sur:"
echo "https://github.com/settings/tokens/new"
echo "Avec le scope: read:packages"
echo ""
echo "Entrez votre GitHub Personal Access Token (ou CTRL+C pour annuler):"
read -s GITHUB_TOKEN

echo "$GITHUB_TOKEN" | docker login $REGISTRY -u $GITHUB_USER --password-stdin

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Login échoué${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Login réussi${NC}"

# Pull des images
echo -e "\n${YELLOW}📥 Pull des images depuis GitHub...${NC}"
docker pull $REGISTRY/$GITHUB_USER/$REPO_NAME/backend:$TAG
docker pull $REGISTRY/$GITHUB_USER/$REPO_NAME/frontend:$TAG

# Nettoyage
echo -e "\n${YELLOW}🧹 Nettoyage des anciens conteneurs...${NC}"
docker stop kid-test-db kid-test-backend kid-test-frontend 2>/dev/null || true
docker rm kid-test-db kid-test-backend kid-test-frontend 2>/dev/null || true
docker network rm kid-test-network 2>/dev/null || true

# Réseau
echo -e "${YELLOW}🌐 Création du réseau...${NC}"
docker network create kid-test-network

# PostgreSQL
echo -e "${YELLOW}🗄️  Démarrage PostgreSQL...${NC}"
docker run -d \
  --name kid-test-db \
  --network kid-test-network \
  -e POSTGRES_DB=kid_livraison \
  -e POSTGRES_USER=kid_user \
  -e POSTGRES_PASSWORD=kid_pass_test \
  -p 5434:5432 \
  postgres:15-alpine

echo -e "${YELLOW}⏳ Attente PostgreSQL (15s)...${NC}"
sleep 15

# Backend depuis GHCR
echo -e "${YELLOW}🚀 Démarrage Backend (depuis GitHub)...${NC}"
docker run -d \
  --name kid-test-backend \
  --network kid-test-network \
  -e DEBUG=True \
  -e SECRET_KEY=test-secret-key \
  -e DB_NAME=kid_livraison \
  -e DB_USER=kid_user \
  -e DB_PASSWORD=kid_pass_test \
  -e DB_HOST=kid-test-db \
  -e DB_PORT=5432 \
  -e ALLOWED_HOSTS=* \
  -e CORS_ALLOWED_ORIGINS=http://localhost:3001 \
  -p 8001:8000 \
  $REGISTRY/$GITHUB_USER/$REPO_NAME/backend:$TAG \
  sh -c "python manage.py migrate && python create_superuser.py && python manage.py runserver 0.0.0.0:8000"

echo -e "${YELLOW}⏳ Attente Backend (30s)...${NC}"
sleep 30

# Frontend depuis GHCR
echo -e "${YELLOW}🚀 Démarrage Frontend (depuis GitHub)...${NC}"
docker run -d \
  --name kid-test-frontend \
  --network kid-test-network \
  -p 3001:80 \
  $REGISTRY/$GITHUB_USER/$REPO_NAME/frontend:$TAG

sleep 10

# Tests
echo -e "\n${YELLOW}🔍 Tests...${NC}"
HEALTH=$(curl -s http://localhost:8001/api/health/ || echo "ERROR")
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001)

if [[ $HEALTH == *"healthy"* ]]; then
    echo -e "${GREEN}✅ Backend OK${NC}"
else
    echo -e "${RED}❌ Backend KO${NC}"
fi

if [ "$FRONTEND_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Frontend OK${NC}"
else
    echo -e "${RED}❌ Frontend KO${NC}"
fi

# Résumé
echo -e "\n${GREEN}=================================="
echo -e "✅ DÉPLOIEMENT TERMINÉ"
echo -e "==================================${NC}"
echo ""
echo -e "${BLUE}📱 Accès:${NC}"
echo "   Backend:  http://localhost:8001/api/"
echo "   Frontend: http://localhost:3001"
echo ""
echo -e "${BLUE}🔄 Pour mettre à jour:${NC}"
echo "   ./deploy-from-github.sh $TAG"
echo ""
echo -e "${BLUE}🛑 Pour arrêter:${NC}"
echo "   docker stop kid-test-db kid-test-backend kid-test-frontend"
