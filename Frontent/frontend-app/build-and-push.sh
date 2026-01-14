#!/bin/bash

# Script pour automatiser le workflow complet : build + test + push

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

COMMIT_MSG="${1:-Update: $(date '+%Y-%m-%d %H:%M:%S')}"

echo -e "${YELLOW}🚀 Workflow automatique: Build → Test → Push${NC}"
echo ""

# Frontend
cd /home/nathanael/projet_Livraison/Frontent/frontend-app

echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}📦 Frontend${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Vérifier s'il y a des changements
if ! git diff --quiet || ! git diff --staged --quiet; then
    echo -e "${YELLOW}🔨 Build du frontend...${NC}"
    npm run build || {
        echo -e "${RED}❌ Build échoué!${NC}"
        exit 1
    }
    
    echo -e "${GREEN}✅ Build réussi${NC}"
    echo ""
    
    echo -e "${YELLOW}🔍 Vérification...${NC}"
    if [ -d "dist" ]; then
        echo -e "${GREEN}✅ Dossier dist créé${NC}"
    else
        echo -e "${RED}❌ Dossier dist manquant${NC}"
        exit 1
    fi
    
    echo ""
    echo -e "${YELLOW}📤 Git push...${NC}"
    git add .
    git commit -m "$COMMIT_MSG"
    git push
    
    echo -e "${GREEN}✅ Frontend poussé!${NC}"
else
    echo -e "${GREEN}✓ Aucun changement frontend${NC}"
fi

echo ""
echo -e "${GREEN}✨ Workflow terminé!${NC}"
