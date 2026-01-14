# 🧪 Guide de Test Docker Backend

## 🚀 Test rapide (automatique)

```bash
# Utiliser le script de test tout-en-un
./test-docker-backend.sh
```

## 🔧 Tests manuels étape par étape

### 1. Build l'image
```bash
docker compose build backend
```

### 2. Démarrer PostgreSQL seul
```bash
docker compose up -d db

# Vérifier que PostgreSQL est prêt
docker compose ps db
docker compose logs db
```

### 3. Tester Django sans démarrer le serveur
```bash
# Check de configuration
docker compose run --rm backend python manage.py check

# Test des migrations
docker compose run --rm backend python manage.py showmigrations

# Créer les migrations
docker compose run --rm backend python manage.py migrate
```

### 4. Démarrer le backend complet
```bash
docker compose up -d backend

# Voir les logs en temps réel
docker compose logs -f backend
```

### 5. Tester l'API
```bash
# Test de l'endpoint API
curl http://localhost:8000/api/

# Test de l'admin
curl http://localhost:8000/admin/
```

## 🐚 Accéder au shell du conteneur

### Shell bash du conteneur
```bash
docker compose exec backend bash
```

### Shell Django
```bash
docker compose exec backend python manage.py shell
```

### Shell PostgreSQL
```bash
docker compose exec backend python manage.py dbshell

# Ou directement dans le conteneur db
docker compose exec db psql -U kid_user -d kid_livraison
```

## 📊 Debugging

### Voir les logs
```bash
# Logs backend
docker compose logs backend

# Logs en temps réel
docker compose logs -f backend

# Dernières 50 lignes
docker compose logs --tail=50 backend
```

### Inspecter le conteneur
```bash
# Statut
docker compose ps

# Détails du conteneur
docker inspect kid_backend

# Ressources utilisées
docker stats kid_backend
```

### Tester les variables d'environnement
```bash
docker compose exec backend env | grep DB_
docker compose exec backend python -c "import os; print(os.getenv('DB_NAME'))"
```

## 🔄 Redémarrer proprement

```bash
# Redémarrer un service
docker compose restart backend

# Redémarrer avec rebuild
docker compose up -d --build backend

# Redémarrer tout
docker compose restart
```

## 🧹 Nettoyage

```bash
# Arrêter les conteneurs
docker compose down

# Arrêter et supprimer les volumes (⚠️  perd les données!)
docker compose down -v

# Supprimer aussi les images
docker compose down --rmi all

# Nettoyer complètement Docker
docker system prune -af
```

## 🎯 Tests spécifiques

### Test de connexion DB
```bash
docker compose exec backend python manage.py dbshell <<EOF
SELECT version();
\l
\dt
\q
EOF
```

### Test des endpoints
```bash
# Test santé
curl -I http://localhost:8000/api/

# Test avec authentification (créer un token d'abord)
TOKEN="votre-jwt-token"
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/colis/
```

### Test de performance
```bash
# Temps de démarrage
time docker compose up -d backend

# Temps de réponse API
time curl -s http://localhost:8000/api/ > /dev/null
```

## 📝 Créer un superuser

```bash
# Interactif
docker compose exec backend python manage.py createsuperuser

# Automatique (développement uniquement!)
docker compose exec backend python manage.py shell <<EOF
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@kid.com', 'admin123')
    print('Superuser créé: admin/admin123')
EOF
```

## 🔍 Vérifications importantes

### Checklist avant production

- [ ] Variables d'environnement configurées dans `.env`
- [ ] `DEBUG=False` en production
- [ ] `SECRET_KEY` unique et sécurisée
- [ ] Migrations appliquées
- [ ] Fichiers statiques collectés
- [ ] Superuser créé
- [ ] Backup de la base de données configuré
- [ ] Logs externalisés
- [ ] Monitoring activé

### Test de sécurité rapide

```bash
# Vérifier DEBUG=False
docker compose exec backend python manage.py check --deploy

# Vérifier les permissions
docker compose exec backend ls -la /app

# Vérifier l'utilisateur (doit être yapka, pas root)
docker compose exec backend whoami
```

## 🆘 Problèmes courants

### Le backend ne démarre pas
```bash
# Vérifier les logs détaillés
docker compose logs backend

# Problème de DB? Vérifier PostgreSQL
docker compose ps db
docker compose logs db

# Rebuild from scratch
docker compose down -v
docker compose build --no-cache backend
docker compose up -d
```

### Erreur de migration
```bash
# Voir l'état des migrations
docker compose exec backend python manage.py showmigrations

# Fake une migration si nécessaire
docker compose exec backend python manage.py migrate --fake

# Supprimer et recréer la DB (⚠️  perd les données!)
docker compose down -v
docker compose up -d db
docker compose run --rm backend python manage.py migrate
```

### Port déjà utilisé
```bash
# Trouver le processus
sudo lsof -i :8000

# Changer le port dans docker-compose.yml
ports:
  - "8001:8000"
```

## 📚 Ressources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Django Deployment Checklist](https://docs.djangoproject.com/en/5.0/howto/deployment/checklist/)
- [PostgreSQL in Docker](https://hub.docker.com/_/postgres)
