# 🚀 Installation sur Machine Cliente - Guide Complet

## Vue d'ensemble

Deux méthodes pour installer sans problème DNS sur la machine cliente.

---

## 📦 Méthode 1: Export/Import d'images (RECOMMANDÉ)

### Sur votre machine (avec internet)

#### Option A: Construction et export automatique
```bash
cd /home/nathanael/projet_Livraison
./build-local-then-export.sh
```

#### Option B: Préparation complète du package client
```bash
cd /home/nathanael/projet_Livraison
./prepare-client-package.sh
```

Cela crée une archive `client-package-YYYYMMDD.tar.gz` contenant:
- Images Docker compressées
- Scripts d'installation
- Configuration
- Documentation

### Transfert vers le client

```bash
# Via SCP
scp client-package-*.tar.gz user@machine-cliente:/tmp/

# Via USB/réseau local
# Copiez simplement le fichier .tar.gz
```

### Sur la machine du client

#### Installation automatique:
```bash
cd /tmp
tar -xzf client-package-*.tar.gz
cd client-package
./install.sh
```

#### Installation manuelle:
```bash
cd /tmp
tar -xzf client-package-*.tar.gz
cd client-package

# Import des images
cd scripts
./import-images.sh ../docker-images
cd ..

# Configuration
nano .env

# Démarrage
docker-compose up -d
```

---

## 🐳 Méthode 2: Docker Compose avec images existantes

Si vous avez déjà publié les images sur Docker Hub ou un registry privé:

### 1. Créer un docker-compose.yml simplifié

```yaml
version: '3.8'

services:
  backend:
    image: votre-registry/backend-app:latest
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/dbname
    depends_on:
      - db
  
  frontend:
    image: votre-registry/frontend-app:latest
    ports:
      - "3000:80"
    depends_on:
      - backend
  
  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=dbname
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### 2. Sur la machine cliente

```bash
# Copier le docker-compose.yml
scp docker-compose.yml user@machine-cliente:/opt/app/

# Sur le client
cd /opt/app
docker-compose pull  # Télécharge les images
docker-compose up -d
```

---

## 📋 Checklist Installation Cliente

### Prérequis
- [ ] Docker installé (version 20.10+)
- [ ] Docker Compose installé (version 2.0+)
- [ ] 4 GB RAM minimum
- [ ] 10 GB espace disque

### Étapes
- [ ] Transférer le package
- [ ] Extraire l'archive
- [ ] Importer les images Docker
- [ ] Configurer le fichier .env
- [ ] Démarrer avec docker-compose
- [ ] Vérifier les services
- [ ] Tester l'accès web

---

## 🔧 Commandes Utiles

### Vérifier l'installation
```bash
# Version Docker
docker --version
docker-compose --version

# Images importées
docker images

# Services actifs
docker-compose ps

# Logs
docker-compose logs -f
```

### Gestion
```bash
# Démarrer
docker-compose up -d

# Arrêter
docker-compose stop

# Redémarrer
docker-compose restart

# Supprimer (conserve les données)
docker-compose down

# Supprimer tout (y compris données)
docker-compose down -v
```

### Maintenance
```bash
# Sauvegarder la base de données
docker-compose exec db pg_dump -U user dbname > backup.sql

# Restaurer la base de données
docker-compose exec -T db psql -U user dbname < backup.sql

# Voir l'utilisation disque
docker system df

# Nettoyer
docker system prune -a
```

---

## ⚠️ Résolution de Problèmes

### "Port already in use"
```bash
# Modifier les ports dans docker-compose.yml ou .env
FRONTEND_PORT=3001
BACKEND_PORT=8001
```

### "Container failed to start"
```bash
# Vérifier les logs
docker-compose logs [service]

# Redémarrer un service spécifique
docker-compose restart [service]
```

### "Permission denied"
```bash
# Ajouter l'utilisateur au groupe docker
sudo usermod -aG docker $USER
# Se reconnecter pour appliquer
```

### Réinitialisation complète
```bash
docker-compose down -v
docker-compose up -d
```

---

## 📊 Taille des Images

Estimation de l'espace nécessaire:
- Backend: ~500 MB
- Frontend: ~150 MB
- PostgreSQL: ~80 MB
- **Total: ~750 MB**

L'archive compressée fait environ **250-300 MB**.

---

## 🔐 Sécurité

### Avant la mise en production:

1. **Changer tous les mots de passe** dans `.env`
2. **Générer une nouvelle SECRET_KEY** Django
3. **Configurer ALLOWED_HOSTS** dans le backend
4. **Activer HTTPS** avec reverse proxy
5. **Configurer les backups** automatiques
6. **Mettre à jour** régulièrement

### Génération de mots de passe sécurisés:
```bash
# Secret key Django
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"

# Mot de passe aléatoire
openssl rand -base64 32
```

---

## 📞 Support

Si vous rencontrez des problèmes:

1. Consultez les logs: `docker-compose logs -f`
2. Vérifiez la configuration: `cat .env`
3. Vérifiez l'espace disque: `df -h`
4. Vérifiez les ports: `netstat -tuln | grep -E '3000|8000'`

---

## ✅ Validation de l'Installation

```bash
# Test complet
curl http://localhost:8000/api/health  # Backend
curl http://localhost:3000             # Frontend

# Vérifier la base de données
docker-compose exec db psql -U user -c "\l"
```

---

**Durée d'installation estimée: 10-20 minutes**
