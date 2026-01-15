#!/usr/bin/env python
"""
Script pour créer le premier superuser Django
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

# Paramètres par défaut (modifiables via variables d'environnement)
username = os.getenv('DJANGO_SUPERUSER_USERNAME', 'admin')
email = os.getenv('DJANGO_SUPERUSER_EMAIL', 'admin@kid-livraison.com')
password = os.getenv('DJANGO_SUPERUSER_PASSWORD', 'admin123')

if not User.objects.filter(username=username).exists():
    User.objects.create_superuser(
        username=username,
        email=email,
        password=password
    )
    print(f'✅ Superuser "{username}" créé avec succès!')
    print(f'   Email: {email}')
    print(f'   Password: {password}')
else:
    print(f'ℹ️  Superuser "{username}" existe déjà.')
