#!/bin/bash

echo "🏗️  Construction avec docker-compose (réseau hôte)..."

cd /home/nathanael/projet_Livraison

# Construire avec docker-compose
docker-compose -f docker-compose.build.yml build --no-cache

echo ""
echo "✅ Construction terminée!"
echo ""
echo "Images créées:"
docker images | grep -E "backend-app|frontend-app"
