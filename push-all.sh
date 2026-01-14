#!/bin/bash

# Script pour automatiser tous les push (root, frontend, backend)

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

COMMIT_MSG="${1:-Update: $(date '+%Y-%m-%d %H:%M:%S')}"

echo -e "${YELLOW}🚀 Push automatique de tous les modules${NC}"
echo -e "${YELLOW}Message: ${NC}$COMMIT_MSG"
echo ""

# Fonction pour push un répertoire
push_repo() {
    local dir=$1
    local name=$2
    
    if [ -d "$dir/.git" ]; then
        echo ""
        echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${YELLOW}📦 $name${NC}"
        echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        
        cd "$dir"
        
        if git diff --quiet && git diff --staged --quiet; then
            echo -e "${GREEN}✓ Aucun changement${NC}"
        else
            git status --short
            echo ""
            git add .
            git commit -m "$COMMIT_MSG" || echo -e "${YELLOW}⚠️  Rien à commiter${NC}"
            git push || echo -e "${RED}❌ Échec du push${NC}"
            echo -e "${GREEN}✅ Push réussi${NC}"
        fi
    else
        echo -e "${RED}⚠️  $name n'est pas un repo Git${NC}"
    fi
}

# Push le projet principal
push_repo "/home/nathanael/projet_Livraison" "Projet principal"

# Push le frontend
push_repo "/home/nathanael/projet_Livraison/Frontent/frontend-app" "Frontend"

# Push le backend
push_repo "/home/nathanael/projet_Livraison/Backend" "Backend"

echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✨ Tous les push terminés!${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
