#!/bin/bash

# Script pour importer les images Docker sur la machine cliente
# À exécuter sur la machine du CLIENT

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

IMPORT_DIR="${1:-./docker-export}"

echo -e "${YELLOW}📦 Import des images Docker${NC}"
echo ""

if [ ! -d "$IMPORT_DIR" ]; then
    echo -e "${RED}❌ Dossier $IMPORT_DIR non trouvé!${NC}"
    echo "Usage: $0 [chemin-vers-docker-export]"
    exit 1
fi

cd "$IMPORT_DIR"

echo "📁 Import depuis: $IMPORT_DIR"
echo ""

# Fonction pour importer une image
import_image() {
    local tar_file=$1
    local image_name=$2
    
    if [ -f "$tar_file" ]; then
        echo -e "${YELLOW}📥 Import de $tar_file...${NC}"
        gunzip -c "$tar_file" | docker load
        echo -e "${GREEN}✅ $image_name importé${NC}"
        echo ""
    else
        echo -e "${YELLOW}⚠️  $tar_file non trouvé, ignoré${NC}"
    fi
}

# Importer les images
import_image "backend-app.tar.gz" "backend-app"
import_image "frontend-app.tar.gz" "frontend-app"
import_image "postgres.tar.gz" "postgres"
import_image "nginx.tar.gz" "nginx"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✨ Import terminé!${NC}"
echo ""
echo "Images Docker disponibles:"
docker images | grep -E "backend-app|frontend-app|postgres|nginx" || echo "Aucune image trouvée"
echo ""
echo "📋 Prochaine étape:"
echo "Lancez l'application avec: docker-compose up -d"
