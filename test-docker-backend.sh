#!/bin/bash

# Script de test du conteneur Docker backend

echo "🧪 Test du conteneur Docker Backend KID Livraison"
echo "================================================="

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

cd "$(dirname "$0")"

# 1. Build l'image
echo -e "\n${YELLOW}📦 1. Build de l'image Docker...${NC}"
docker compose build backend
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build réussi${NC}"
else
    echo -e "${RED}❌ Échec du build${NC}"
    exit 1
fi

# 2. Démarrer le conteneur de base de données
echo -e "\n${YELLOW}🗄️  2. Démarrage de PostgreSQL...${NC}"
docker compose up -d db
sleep 5
echo -e "${GREEN}✅ PostgreSQL démarré${NC}"

# 3. Tester le backend
echo -e "\n${YELLOW}🚀 3. Test du backend...${NC}"
docker compose run --rm backend python manage.py check
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Django check réussi${NC}"
else
    echo -e "${RED}❌ Django check échoué${NC}"
    docker compose down
    exit 1
fi

# 4. Test des migrations
echo -e "\n${YELLOW}🔄 4. Test des migrations...${NC}"
docker compose run --rm backend python manage.py migrate --check
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Migrations OK${NC}"
else
    echo -e "${YELLOW}⚠️  Migrations à appliquer${NC}"
fi

# 5. Démarrer le backend
echo -e "\n${YELLOW}🚀 5. Démarrage du backend...${NC}"
docker compose up -d backend
sleep 10

# 6. Vérifier que le backend répond
echo -e "\n${YELLOW}🔍 6. Test de l'API...${NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/api/)
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ API accessible (HTTP $HTTP_CODE)${NC}"
else
    echo -e "${RED}❌ API non accessible (HTTP $HTTP_CODE)${NC}"
    docker compose logs backend
fi

# 7. Afficher les logs
echo -e "\n${YELLOW}📝 7. Derniers logs:${NC}"
docker compose logs --tail=20 backend

# 8. Afficher les conteneurs en cours
echo -e "\n${YELLOW}📊 8. Statut des conteneurs:${NC}"
docker compose ps

echo -e "\n${GREEN}✅ Tests terminés!${NC}"
echo -e "\n📋 Commandes utiles:"
echo "  - Voir les logs:     docker compose logs -f backend"
echo "  - Shell Django:      docker compose exec backend python manage.py shell"
echo "  - Arrêter tout:      docker compose down"
echo "  - Nettoyer:          docker compose down -v"
