#!/bin/bash

# Script d'initialisation pour le premier démarrage

echo "🚀 Initialisation de KID Livraison..."

# Attendre que la base de données soit prête
echo "⏳ Attente de la base de données..."
python manage.py wait_for_db 2>/dev/null || sleep 10

# Migrations
echo "🔄 Application des migrations..."
python manage.py migrate --noinput

# Collecte des fichiers statiques
echo "📦 Collecte des fichiers statiques..."
python manage.py collectstatic --noinput

# Créer un superuser par défaut si aucun utilisateur n'existe
echo "👤 Vérification du superuser..."
python manage.py shell <<EOF
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(is_superuser=True).exists():
    User.objects.create_superuser('admin', 'admin@kid.com', 'admin123')
    print('✅ Superuser créé: admin / admin123')
else:
    print('✅ Superuser existe déjà')
EOF

echo "✅ Initialisation terminée!"
