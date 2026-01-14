#!/bin/bash

# Script complet: Build sur machine avec internet, puis export pour le client

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}🚀 Construction et export des images pour installation cliente${NC}"
echo ""
echo "Ce script va:"
echo "1. Construire les images Docker localement"
echo "2. Les exporter pour transfert vers machine cliente"
echo ""

read -p "Continuer? (o/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[OoYy]$ ]]; then
    exit 0
fi

# Étape 1: Construire les images
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${YELLOW}Étape 1/2: Construction des images${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Backend
echo -e "${YELLOW}🏗️  Construction du backend...${NC}"
cd /home/nathanael/projet_Livraison/Backend
if docker build -t backend-app .; then
    echo -e "${GREEN}✅ Backend construit${NC}"
else
    echo -e "${RED}❌ Échec de la construction du backend${NC}"
    echo "Essayez avec: docker build --network=host --dns 8.8.8.8 -t backend-app ."
    exit 1
fi

echo ""

# Frontend
echo -e "${YELLOW}🏗️  Construction du frontend...${NC}"
cd /home/nathanael/projet_Livraison/Frontent/frontend-app
if docker build -t frontend-app .; then
    echo -e "${GREEN}✅ Frontend construit${NC}"
else
    echo -e "${RED}❌ Échec de la construction du frontend${NC}"
    echo "Essayez avec: docker build --network=host --dns 8.8.8.8 -t frontend-app ."
    exit 1
fi

# Étape 2: Exporter
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${YELLOW}Étape 2/2: Export des images${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd /home/nathanael/projet_Livraison
./export-images.sh

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✨ Terminé!${NC}"
echo ""
echo "📦 Package prêt pour installation cliente:"
echo "   /home/nathanael/projet_Livraison/docker-export/"
echo ""
echo "📋 Instructions pour le client:"
echo "1. Copiez le dossier 'docker-export' sur sa machine"
echo "2. Copiez aussi les fichiers suivants:"
echo "   - import-images.sh"
echo "   - docker-compose.yml"
echo "   - .env (si applicable)"
echo "3. Sur la machine cliente, exécutez:"
echo "   ./import-images.sh docker-export"
echo "   docker-compose up -d"
