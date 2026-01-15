#!/bin/bash
# Script pour créer manuellement un superuser dans le conteneur

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}👤 Création d'un superuser Django${NC}"
echo ""

# Vérifier si le conteneur tourne
if ! docker ps | grep -q kid-test-backend; then
    echo "❌ Le conteneur backend n'est pas démarré"
    echo "Lancez d'abord: ./test-local-complet.sh"
    exit 1
fi

# Demander les informations
echo "Username (défaut: admin):"
read USERNAME
USERNAME=${USERNAME:-admin}

echo "Email (défaut: admin@kid-livraison.com):"
read EMAIL
EMAIL=${EMAIL:-admin@kid-livraison.com}

echo "Password (défaut: admin123):"
read -s PASSWORD
PASSWORD=${PASSWORD:-admin123}
echo ""

# Créer le superuser
echo -e "${YELLOW}Création en cours...${NC}"
docker exec -it kid-test-backend python -c "
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='$USERNAME').exists():
    User.objects.create_superuser('$USERNAME', '$EMAIL', '$PASSWORD')
    print('✅ Superuser créé!')
else:
    print('⚠️  Utilisateur existe déjà')
"

echo ""
echo -e "${GREEN}✅ Terminé!${NC}"
echo ""
echo "Connectez-vous sur:"
echo "   http://localhost:8001/admin/"
echo ""
echo "   Username: $USERNAME"
echo "   Password: $PASSWORD"
