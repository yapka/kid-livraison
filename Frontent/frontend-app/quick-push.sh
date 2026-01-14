#!/bin/bash

# Script rapide pour push sans confirmation

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

COMMIT_MSG="${1:-Update: $(date '+%Y-%m-%d %H:%M:%S')}"

echo -e "${YELLOW}🚀 Quick push...${NC}"
echo -e "${YELLOW}Message: ${NC}$COMMIT_MSG"
echo ""

git add .
git commit -m "$COMMIT_MSG"
git push

echo -e "${GREEN}✅ Done!${NC}"
