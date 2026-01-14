# 🚀 Guide DevOps - KID Livraison

## 📋 Table des matières
- [Prérequis](#prérequis)
- [Configuration](#configuration)
- [Déploiement](#déploiement)
- [Commandes utiles](#commandes-utiles)
- [CI/CD](#cicd)
- [Monitoring](#monitoring)
- [Sécurité](#sécurité)
- [Troubleshooting](#troubleshooting)

## 🔧 Prérequis

### Installation Docker & Docker Compose
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Docker Compose
sudo apt install docker-compose-plugin

# Vérification
docker --version
docker compose version
```

## ⚙️ Configuration

### 1. Variables d'environnement
```bash
# Copier le fichier d'exemple
cp .env.example .env

# Éditer les variables
nano .env
```

**Variables importantes:**
- `SECRET_KEY`: Clé secrète Django (générer avec `python -c "import secrets; print(secrets.token_urlsafe(50))"`)
- `POSTGRES_PASSWORD`: Mot de passe PostgreSQL fort
- `ALLOWED_HOSTS`: Liste des domaines autorisés
- `CORS_ALLOWED_ORIGINS`: Origines autorisées pour CORS

### 2. Structure des services

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Frontend   │────▶│   Nginx     │────▶│   Backend   │
│  (React)    │     │ (Reverse    │     │  (Django)   │
│  Port 80    │     │  Proxy)     │     │  Port 8000  │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                                               ▼
                                        ┌─────────────┐
                                        │ PostgreSQL  │
                                        │  Port 5432  │
                                        └─────────────┘
```

## 🚀 Déploiement

### Déploiement rapide (développement)
```bash
# Avec Make
make up

# Ou avec Docker Compose
docker-compose up -d

# Créer un superuser
make createsuperuser
```

### Déploiement complet (production)
```bash
# Avec le script de déploiement
chmod +x deploy.sh
./deploy.sh production

# Ou manuellement
docker-compose --profile production build
docker-compose --profile production up -d
```

### Première installation
```bash
# 1. Clone du projet
git clone <votre-repo>
cd projet_Livraison

# 2. Configuration
cp .env.example .env
# Éditer .env avec vos valeurs

# 3. Build et démarrage
make build
make up

# 4. Migrations et superuser
make migrate
make createsuperuser

# 5. Vérifier le statut
make status
```

## 🛠️ Commandes utiles

### Make commands
```bash
make help              # Affiche l'aide
make build            # Build les images
make up               # Démarre les services
make down             # Arrête les services
make restart          # Redémarre les services
make logs             # Affiche les logs
make logs-all         # Tous les logs
make clean            # Nettoie tout
make migrate          # Lance les migrations
make shell            # Shell Django
make shell-db         # Shell PostgreSQL
make backup-db        # Sauvegarde la DB
make prod             # Mode production
make status           # Statut des services
```

### Docker Compose
```bash
# Logs en temps réel
docker-compose logs -f backend
docker-compose logs -f frontend

# Exécuter des commandes
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser
docker-compose exec backend python manage.py shell

# Restart un service spécifique
docker-compose restart backend

# Rebuild sans cache
docker-compose build --no-cache backend
```

### Base de données
```bash
# Backup
docker-compose exec -T db pg_dump -U kid_user kid_livraison > backup.sql

# Restore
docker-compose exec -T db psql -U kid_user -d kid_livraison < backup.sql

# Accès direct
docker-compose exec db psql -U kid_user -d kid_livraison
```

## 🔄 CI/CD

### GitHub Actions
Le workflow `.github/workflows/ci-cd.yml` effectue:
1. **Tests automatiques** (backend et frontend)
2. **Build des images Docker**
3. **Push vers GitHub Container Registry**
4. **Déploiement automatique** (si branche main)

### Configuration GitHub Secrets
```
Settings > Secrets and variables > Actions

Ajouter:
- DOCKER_USERNAME
- DOCKER_PASSWORD
- SSH_PRIVATE_KEY (pour déploiement)
- SERVER_HOST
- SERVER_USER
```

### Déclenchement manuel
```bash
# Tag une version
git tag v1.0.0
git push origin v1.0.0

# Le workflow se déclenche automatiquement
```

## 📊 Monitoring

### Logs
```bash
# Tous les logs
make logs-all

# Backend uniquement
docker-compose logs -f backend

# Erreurs uniquement
docker-compose logs backend | grep ERROR

# Dernières 100 lignes
docker-compose logs --tail=100 backend
```

### Santé des services
```bash
# Statut
docker-compose ps

# Métriques
docker stats

# Inspecter un container
docker inspect kid_backend
```

### Monitoring avancé (optionnel)
Ajouter Prometheus + Grafana:
```yaml
# Dans docker-compose.yml
prometheus:
  image: prom/prometheus
  volumes:
    - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml

grafana:
  image: grafana/grafana
  ports:
    - "3000:3000"
```

## 🔒 Sécurité

### Checklist de sécurité production
- [ ] `DEBUG=False` dans .env
- [ ] `SECRET_KEY` unique et fort (50+ caractères)
- [ ] `ALLOWED_HOSTS` configuré
- [ ] HTTPS activé (Let's Encrypt)
- [ ] Mots de passe forts pour PostgreSQL
- [ ] Firewall configuré (ports 80, 443, 22 uniquement)
- [ ] Sauvegardes automatiques activées
- [ ] Logs externalisés
- [ ] Rate limiting activé
- [ ] Monitoring des erreurs (Sentry)

### SSL/HTTPS avec Let's Encrypt
```bash
# Installation Certbot
sudo apt install certbot python3-certbot-nginx

# Obtenir un certificat
sudo certbot --nginx -d votredomaine.com -d www.votredomaine.com

# Auto-renouvellement
sudo certbot renew --dry-run
```

### Mise à jour des secrets
```bash
# Générer une nouvelle SECRET_KEY
python -c "import secrets; print(secrets.token_urlsafe(50))"

# Regénérer le mot de passe DB
openssl rand -base64 32
```

## 🐛 Troubleshooting

### Le backend ne démarre pas
```bash
# Vérifier les logs
docker-compose logs backend

# Problèmes courants:
# 1. Base de données pas prête
docker-compose restart backend

# 2. Migrations manquantes
docker-compose exec backend python manage.py migrate

# 3. Port déjà utilisé
sudo lsof -i :8000
```

### Le frontend ne charge pas
```bash
# Vérifier la build
docker-compose logs frontend

# Rebuild le frontend
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

### Erreur de connexion PostgreSQL
```bash
# Vérifier que PostgreSQL est démarré
docker-compose ps db

# Vérifier les credentials
docker-compose exec db psql -U kid_user -d kid_livraison

# Reset la base
docker-compose down -v
docker-compose up -d
```

### Problème de permissions
```bash
# Fichiers statiques
docker-compose exec backend chown -R yapka:yapka /app/staticfiles

# Médias
docker-compose exec backend chown -R yapka:yapka /app/media
```

### Nettoyage complet
```bash
# Tout supprimer et recommencer
make clean
make build
make up
make migrate
```

## 📈 Performance

### Optimisations recommandées
1. **Redis pour le cache**
```yaml
redis:
  image: redis:7-alpine
  ports:
    - "6379:6379"
```

2. **CDN pour les assets statiques**
- Utiliser Cloudflare ou AWS CloudFront

3. **Database Connection Pooling**
```python
# settings.py
DATABASES = {
    'default': {
        'CONN_MAX_AGE': 600,
        'OPTIONS': {
            'connect_timeout': 10,
        }
    }
}
```

4. **Gunicorn workers**
```bash
# Formule: (2 x CPU cores) + 1
gunicorn --workers 5 --threads 2
```

## 🆘 Support

### Contacts
- **Email**: admin@kid-livraison.com
- **Documentation**: https://docs.kid-livraison.com
- **Issues**: https://github.com/votre-org/projet_Livraison/issues

### Ressources utiles
- [Django Deployment Checklist](https://docs.djangoproject.com/en/5.0/howto/deployment/checklist/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Nginx Configuration](https://www.nginx.com/resources/wiki/start/)
