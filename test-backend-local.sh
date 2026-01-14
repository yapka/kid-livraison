#!/bin/bash

# Test du backend SANS Docker (local avec PostgreSQL)

echo "🧪 Test Backend Local (Sans Docker)"
echo "===================================="

cd "$(dirname "$0")/Backend"

# Vérifier que PostgreSQL tourne
echo -e "\n🔍 Vérification PostgreSQL..."
if pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo "✅ PostgreSQL est actif"
else
    echo "❌ PostgreSQL n'est pas actif"
    echo "   Démarrez-le avec: sudo systemctl start postgresql"
    echo "   Ou utilisez Docker: docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=kid_password postgres:15"
    exit 1
fi

# Vérifier le venv
if [ ! -d "venv" ]; then
    echo -e "\n📦 Création du virtualenv..."
    python3 -m venv venv
fi

# Activer venv
source venv/bin/activate

# Installer dépendances
echo -e "\n📥 Installation des dépendances..."
pip install --quiet --upgrade pip
pip install --quiet -r requirements.txt

# Vérifier .env
if [ ! -f ".env" ]; then
    echo -e "\n⚠️  Fichier .env manquant, copie depuis .env.example"
    cp .env.example .env
fi

# Tests Django
echo -e "\n🔍 Django check..."
python manage.py check

echo -e "\n🔍 Vérification migrations..."
python manage.py showmigrations

echo -e "\n📝 Application des migrations..."
python manage.py migrate

echo -e "\n✅ Backend prêt!"
echo -e "\n📋 Pour démarrer le serveur:"
echo "   cd Backend"
echo "   source venv/bin/activate"
echo "   python manage.py runserver"
