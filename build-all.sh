#!/bin/bash

# Script pour construire toutes les images Docker
set -e

echo " Construction des images Docker..."
echo ""

# Couleurs pour les messages
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour construire avec fallback
build_with_fallback() {
    local name=$1
    local path=$2
    local dockerfile=${3:-Dockerfile}
    
    echo -e "${YELLOW}📦 Construction de $name...${NC}"
    
    # Première tentative : build normal
    if docker build -t "$name" -f "$path/$dockerfile" "$path" 2>&1 | tee /tmp/docker_build.log; then
        echo -e "${GREEN}✅ $name construit avec succès!${NC}"
        return 0
    fi
    
    # Vérifier si c'est un problème DNS
    if grep -q "EAI_AGAIN\|getaddrinfo\|Temporary failure in name resolution" /tmp/docker_build.log; then
        echo -e "${YELLOW}⚠️  Problème DNS détecté, nouvelle tentative avec DNS custom...${NC}"
        
        # Deuxième tentative : avec DNS custom
        if docker build --network=host --dns 8.8.8.8 --dns 8.8.4.4 -t "$name" -f "$path/$dockerfile" "$path"; then
            echo -e "${GREEN}✅ $name construit avec succès (avec DNS custom)!${NC}"
            return 0
        fi
    fi
    
    echo -e "${RED}❌ Échec de la construction de $name${NC}"
    return 1
}

# Construire le backend
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
build_with_fallback "backend-app" "/home/nathanael/projet_Livraison/Backend" "Dockerfile"

# Construire le frontend
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
build_with_fallback "frontend-app" "/home/nathanael/projet_Livraison/Frontent/frontend-app" "Dockerfile"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN} Toutes les images ont été construites!${NC}"
echo ""
echo "Images disponibles:"
docker images | grep -E "backend-app|frontend-app" || echo "Aucune image trouvée"
