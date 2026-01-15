#!/bin/bash
# Test local complet de l'application KID Livraison avec Docker

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Test Local KID Livraison${NC}"
echo "=================================="

# Nettoyage
echo -e "\n${YELLOW}🧹 Nettoyage...${NC}"
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

echo -e "${YELLOW}⏳ Attente PostgreSQL (20s)...${NC}"
sleep 20

# Test connexion DB
echo -e "${YELLOW}🔍 Test connexion DB...${NC}"
docker exec kid-test-db pg_isready -U kid_user
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ PostgreSQL OK${NC}"
else
    echo -e "${RED}❌ PostgreSQL non prêt${NC}"
    exit 1
fi

# Build Backend
echo -e "\n${YELLOW}🔧 Build Backend...${NC}"
cd Backend
docker build -t kid-test-backend:latest -f Dockerfile .
cd ..

# Démarrage Backend
echo -e "${YELLOW}🚀 Démarrage Backend...${NC}"
docker run -d \
  --name kid-test-backend \
  --network kid-test-network \
  -e DEBUG=True \
  -e SECRET_KEY=test-secret-key-local \
  -e DB_NAME=kid_livraison \
  -e DB_USER=kid_user \
  -e DB_PASSWORD=kid_pass_test \
  -e DB_HOST=kid-test-db \
  -e DB_PORT=5432 \
  -e ALLOWED_HOSTS=* \
  -e CORS_ALLOWED_ORIGINS=http://localhost:3001 \
  -p 8001:8000 \
  kid-test-backend:latest \
  sh -c "python manage.py migrate && python create_superuser.py && python manage.py runserver 0.0.0.0:8000"

echo -e "${YELLOW}⏳ Attente Backend (30s)...${NC}"
sleep 30

# Test Backend
echo -e "${YELLOW}🔍 Test Backend...${NC}"
HEALTH_RESPONSE=$(curl -s http://localhost:8001/api/health/ || echo "ERROR")
if [[ $HEALTH_RESPONSE == *"healthy"* ]] || [[ $HEALTH_RESPONSE == *"status"* ]]; then
    echo -e "${GREEN}✅ Backend répond${NC}"
    echo "Response: $HEALTH_RESPONSE"
else
    echo -e "${RED}❌ Backend ne répond pas${NC}"
    echo "Logs:"
    docker logs kid-test-backend --tail=50
    exit 1
fi

# Build Frontend
echo -e "\n${YELLOW}🔧 Build Frontend...${NC}"
cd Frontent/frontend-app
docker build -t kid-test-frontend:latest -f Dockerfile --build-arg VITE_API_BASE_URL=http://localhost:8001 .
cd ../..

# Démarrage Frontend
echo -e "${YELLOW}🚀 Démarrage Frontend...${NC}"
docker run -d \
  --name kid-test-frontend \
  --network kid-test-network \
  -p 3001:80 \
  kid-test-frontend:latest

echo -e "${YELLOW}⏳ Attente Frontend (10s)...${NC}"
sleep 10

# Test Frontend
echo -e "${YELLOW}🔍 Test Frontend...${NC}"
FRONTEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001 || echo "000")
if [ "$FRONTEND_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ Frontend répond (HTTP $FRONTEND_RESPONSE)${NC}"
else
    echo -e "${RED}❌ Frontend ne répond pas (HTTP $FRONTEND_RESPONSE)${NC}"
fi

# Résumé
echo -e "\n${GREEN}=================================="
echo -e "✅ APPLICATION DÉMARRÉE"
echo -e "==================================${NC}"
echo ""
echo -e "${BLUE}📱 Accès:${NC}"
echo "   Backend API:  http://localhost:8001/api/"
echo "   Health:       http://localhost:8001/api/health/"
echo "   Admin:        http://localhost:8001/admin/"
echo "   Frontend:     http://localhost:3001"
echo ""
echo -e "${BLUE}📊 État:${NC}"
docker ps --filter "name=kid-test" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""
echo -e "${BLUE}📝 Logs:${NC}"
echo "   Backend:  docker logs -f kid-test-backend"
echo "   Frontend: docker logs -f kid-test-frontend"
echo "   DB:       docker logs -f kid-test-db"
echo ""
echo -e "${BLUE}🛑 Arrêter:${NC}"
echo "   docker stop kid-test-db kid-test-backend kid-test-frontend"
echo "   docker rm kid-test-db kid-test-backend kid-test-frontend"
echo "   docker network rm kid-test-network"
echo ""
echo -e "${YELLOW}⌨️  Testez maintenant dans votre navigateur !${NC}"
