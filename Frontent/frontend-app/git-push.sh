#!/bin/bash

# Script pour automatiser git add, commit et push

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Obtenir le message de commit
if [ -z "$1" ]; then
    echo -e "${YELLOW}Message de commit (ou Entrée pour message auto):${NC}"
    read -r COMMIT_MSG
    
    if [ -z "$COMMIT_MSG" ]; then
        COMMIT_MSG="Update: $(date '+%Y-%m-%d %H:%M:%S')"
    fi
else
    COMMIT_MSG="$1"
fi

echo -e "${YELLOW}🔍 Vérification des changements...${NC}"
echo ""

# Afficher le statut
git status --short

echo ""
echo -e "${YELLOW}📝 Message de commit: ${NC}$COMMIT_MSG"
echo ""

# Demander confirmation
read -p "Continuer avec ce commit? (o/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[OoYy]$ ]]; then
    echo -e "${RED}❌ Annulé${NC}"
    exit 0
fi

echo ""
echo -e "${YELLOW}📦 Git add...${NC}"
git add .

echo -e "${YELLOW}💾 Git commit...${NC}"
git commit -m "$COMMIT_MSG"

echo -e "${YELLOW}🚀 Git push...${NC}"
git push

echo ""
echo -e "${GREEN}✅ Push réussi!${NC}"
