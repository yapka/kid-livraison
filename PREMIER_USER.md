# 👤 Premier utilisateur créé !

## 🔑 Connexion Admin

Votre application est démarrée avec un compte administrateur par défaut :

**URL** : http://localhost:8001/admin/

**Identifiants** :
- Username : `admin`
- Password : `admin123`
- Email : `admin@kid-livraison.com`

## 🎯 Accès rapide

```bash
# Backend Admin
http://localhost:8001/admin/

# API
http://localhost:8001/api/

# Health Check
http://localhost:8001/api/health/

# Frontend
http://localhost:3001
```

## 🔄 Créer un nouvel utilisateur admin

### Option 1 : Script automatique (recommandé)

```bash
./create-admin-user.sh
```

### Option 2 : Depuis le conteneur

```bash
docker exec -it kid-test-backend python manage.py createsuperuser
```

### Option 3 : Depuis le shell Django

```bash
docker exec -it kid-test-backend python manage.py shell

# Puis dans le shell Python:
from django.contrib.auth import get_user_model
User = get_user_model()
User.objects.create_superuser('votre_username', 'email@exemple.com', 'votre_password')
```

## 📝 Prochains déploiements

Le script `create_superuser.py` créera automatiquement un admin lors des prochains démarrages si aucun n'existe.

**Variables d'environnement personnalisables** :
```bash
DJANGO_SUPERUSER_USERNAME=admin
DJANGO_SUPERUSER_EMAIL=admin@kid-livraison.com
DJANGO_SUPERUSER_PASSWORD=admin123
```

## ⚠️ Sécurité en production

**IMPORTANT** : Changez ces identifiants par défaut en production !

```bash
# Changer le password en production
docker exec -it kid-backend python manage.py changepassword admin
```
