# 🚀 Quick Start - KID Livraison

## ⚡ Démarrage rapide (5 minutes)

### 1. Configuration initiale
```bash
# Copier les variables d'environnement
cp .env.example .env

# Éditer avec vos valeurs (important!)
nano .env
```

### 2. Lancer l'application

#### Option A: Avec Make (recommandé)
```bash
make build    # Construire les images
make up       # Démarrer les services
make migrate  # Appliquer les migrations
```

#### Option B: Docker Compose direct
```bash
docker-compose build
docker-compose up -d
docker-compose exec backend python manage.py migrate
```

### 3. Créer un superuser
```bash
make createsuperuser
# ou
docker-compose exec backend python manage.py createsuperuser
```

### 4. Accéder à l'application
- **Frontend**: http://localhost:80
- **API Backend**: http://localhost:8000/api/
- **Admin Django**: http://localhost:8000/admin/

---

## 📦 Structure du projet

```
projet_Livraison/
├── Backend/                 # API Django REST
│   ├── api/                # Application principale
│   ├── config/             # Configuration Django
│   ├── Dockerfile          # Image Docker backend
│   └── requirements.txt    # Dépendances Python
│
├── Frontent/frontend-app/  # Application React
│   ├── src/               # Code source
│   ├── Dockerfile         # Image Docker frontend
│   └── package.json       # Dépendances Node
│
├── nginx/                  # Configuration Nginx
│   ├── nginx.conf         # Config principale
│   └── conf.d/            # Virtual hosts
│
├── .github/workflows/      # CI/CD GitHub Actions
├── docker-compose.yml      # Orchestration services
├── Makefile               # Commandes simplifiées
└── deploy.sh              # Script de déploiement

```

---

## 🎯 Commandes essentielles

### Gestion des services
```bash
make up              # Démarrer
make down            # Arrêter
make restart         # Redémarrer
make logs            # Voir les logs
make status          # Statut des services
```

### Base de données
```bash
make migrate         # Migrations
make makemigrations  # Créer migrations
make shell-db        # Console PostgreSQL
make backup-db       # Sauvegarder
```

### Développement
```bash
make shell           # Shell Django
make test-backend    # Tests backend
make collectstatic   # Fichiers statiques
```

### Maintenance
```bash
make clean           # Tout nettoyer
make update          # Mettre à jour
```

---

## 🌍 Environnements

### Développement local
```bash
# Mode développement avec hot-reload
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

### Production
```bash
# Avec script automatisé
./deploy.sh production

# Ou avec Make
make prod
```

### Avec monitoring
```bash
# Ajouter Prometheus + Grafana
docker-compose -f docker-compose.yml -f docker-compose.monitoring.yml up -d
```

---

## 🔧 Configuration minimale (.env)

```env
# Base de données
POSTGRES_DB=kid_livraison
POSTGRES_USER=kid_user
POSTGRES_PASSWORD=ChangeMe123!

# Django
DEBUG=False
SECRET_KEY=votre-cle-secrete-ici-50-caracteres-minimum
ALLOWED_HOSTS=localhost,votredomaine.com

# Frontend
VITE_API_BASE_URL=http://localhost:8000
```

**⚠️ IMPORTANT**: Changez `SECRET_KEY` et `POSTGRES_PASSWORD` en production!

Générer une SECRET_KEY:
```bash
python -c "import secrets; print(secrets.token_urlsafe(50))"
```

---

## 🐛 Problèmes courants

### Le backend ne démarre pas
```bash
# Vérifier les logs
docker-compose logs backend

# Redémarrer proprement
docker-compose restart backend
```

### Erreur de migration
```bash
# Réinitialiser la base
docker-compose down -v
docker-compose up -d
make migrate
```

### Port déjà utilisé
```bash
# Trouver le processus
sudo lsof -i :8000

# Ou changer le port dans docker-compose.yml
ports:
  - "8001:8000"  # Au lieu de 8000:8000
```

---

## 📚 Documentation complète

- **DevOps complet**: Voir [README_DEVOPS.md](README_DEVOPS.md)
- **Architecture**: Voir [ARCHITECTURE.md](Frontent/frontend-app/ARCHITECTURE.md)
- **API Docs**: http://localhost:8000/api/swagger/ (après démarrage)

---

## 🆘 Support

**Besoin d'aide?**
```bash
make help  # Liste toutes les commandes
```

**Documentation officielle:**
- Django: https://docs.djangoproject.com
- React: https://react.dev
- Docker: https://docs.docker.com

---

## ✅ Checklist avant production

- [ ] Modifier `DEBUG=False`
- [ ] Générer une nouvelle `SECRET_KEY`
- [ ] Configurer `ALLOWED_HOSTS`
- [ ] Mot de passe PostgreSQL fort
- [ ] Configurer HTTPS/SSL
- [ ] Activer les sauvegardes
- [ ] Configurer le monitoring
- [ ] Tester les migrations
- [ ] Vérifier les logs

---

## 🎉 C'est tout!

Votre application devrait maintenant être accessible:
- Frontend: http://localhost
- Backend API: http://localhost:8000/api/
- Admin: http://localhost:8000/admin/

**Bon développement! 🚀**
