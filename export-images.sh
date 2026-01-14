#!/bin/bash

# Script pour exporter les images Docker pour installation sur machine cliente

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

EXPORT_DIR="/home/nathanael/projet_Livraison/docker-export"

echo -e "${YELLOW}📦 Export des images Docker pour installation cliente${NC}"
echo ""

# Créer le dossier d'export
mkdir -p "$EXPORT_DIR"
cd "$EXPORT_DIR"

echo "📁 Dossier d'export: $EXPORT_DIR"
echo ""

# Fonction pour exporter une image
export_image() {
    local image_name=$1
    local tar_file=$2
    
    echo -e "${YELLOW}📤 Export de $image_name...${NC}"
    
    if docker image inspect "$image_name" > /dev/null 2>&1; then
        docker save "$image_name" | gzip > "$tar_file"
        local size=$(du -h "$tar_file" | cut -f1)
        echo -e "${GREEN}✅ $image_name exporté ($size)${NC}"
        return 0
    else
        echo -e "${RED}❌ Image $image_name non trouvée. Construisez-la d'abord!${NC}"
        return 1
    fi
}

# Exporter les images
export_image "backend-app" "backend-app.tar.gz"
export_image "frontend-app" "frontend-app.tar.gz"

# Exporter aussi les images de base si nécessaire
echo ""
echo -e "${YELLOW}📤 Export des images de base...${NC}"
export_image "postgres:15-alpine" "postgres.tar.gz" || echo "Ignoré"
export_image "nginx:stable-alpine" "nginx.tar.gz" || echo "Ignoré"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✨ Export terminé!${NC}"
echo ""
echo "Fichiers créés:"
ls -lh "$EXPORT_DIR"/*.tar.gz 2>/dev/null || echo "Aucun fichier exporté"
echo ""
echo "📋 Prochaines étapes:"
echo "1. Copiez le dossier '$EXPORT_DIR' sur la machine cliente"
echo "2. Exécutez le script 'import-images.sh' sur la machine cliente"
echo ""
echo "Commande de copie suggérée:"
echo "scp -r $EXPORT_DIR user@machine-cliente:/tmp/"
