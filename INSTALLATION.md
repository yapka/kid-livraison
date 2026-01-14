# Guide d'Installation - KID Distribution

## Installation Automatique

### Prérequis
- Système Linux (Ubuntu, Debian, CentOS, etc.)
- Accès root ou sudo
- Connexion Internet

### Installation en une commande

```bash
chmod +x install.sh && ./install.sh
```

Le script va automatiquement :
1. ✓ Vérifier Docker et Docker Compose
2. ✓ Configurer l'environnement (.env)
3. ✓ Construire les images Docker
4. ✓ Lancer les conteneurs
5. ✓ Exécuter les migrations
6. ✓ Collecter les fichiers statiques
7. ✓ Créer le superutilisateur

### Informations demandées

Le script vous demandera :
- **Nom de la base de données** (par défaut: kid_db)
- **Utilisateur DB** (par défaut: kid_user)
- **Mot de passe DB** (obligatoire)
- **Mode debug** (par défaut: False)
- **Nom d'utilisateur admin** (obligatoire)
- **Email admin** (optionnel)
- **Mot de passe admin** (obligatoire)

### URLs d'accès après installation

- **Frontend**: http://localhost
- **Backend API**: http://localhost/api
- **Admin Django**: http://localhost/admin

## Installation Manuelle

Si vous préférez installer manuellement :

### 1. Installer Docker

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Démarrer Docker
sudo systemctl start docker
sudo systemctl enable docker
```

### 2. Installer Docker Compose

```bash
# Vérifier si déjà installé avec Docker
docker compose version

# Sinon, installer
sudo apt-get update
sudo apt-get install docker-compose-plugin
```

### 3. Configurer l'environnement

```bash
# Copier le fichier d'exemple
cp Backend/.env.example Backend/.env

# Éditer le fichier
nano Backend/.env
```

Variables importantes :
```env
DB_NAME=kid_db
DB_USER=kid_user
DB_PASSWORD=votre_mot_de_passe_securise
SECRET_KEY=une_cle_secrete_unique
DEBUG=False
USE_SQLITE=False
```

### 4. Construire et lancer

```bash
# Construire les images
docker compose build

# Lancer les conteneurs
docker compose up -d

# Vérifier le statut
docker compose ps
```

### 5. Exécuter les migrations

```bash
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py collectstatic --noinput
```

### 6. Créer le superutilisateur

```bash
docker compose exec backend python manage.py createsuperuser
```

## Commandes Utiles

### Gestion des conteneurs

```bash
# Voir les logs
docker compose logs -f

# Voir les logs d'un service spécifique
docker compose logs -f backend
docker compose logs -f frontend

# Arrêter
docker compose down

# Redémarrer
docker compose restart

# Status
docker compose ps
```

### Base de données

```bash
# Accéder à PostgreSQL
docker compose exec db psql -U kid_user -d kid_db

# Backup de la base
docker compose exec db pg_dump -U kid_user kid_db > backup.sql

# Restore
docker compose exec -T db psql -U kid_user kid_db < backup.sql
```

### Backend Django

```bash
# Shell Django
docker compose exec backend python manage.py shell

# Créer des migrations
docker compose exec backend python manage.py makemigrations

# Appliquer les migrations
docker compose exec backend python manage.py migrate

# Créer un utilisateur
docker compose exec backend python manage.py createsuperuser
```

### Frontend

```bash
# Accéder au conteneur
docker compose exec frontend sh

# Rebuilder le frontend
docker compose build frontend
docker compose restart frontend
```

## Mise à Jour

```bash
# Récupérer les dernières modifications
git pull origin main

# Reconstruire les images
docker compose build

# Redémarrer les conteneurs
docker compose up -d

# Appliquer les nouvelles migrations
docker compose exec backend python manage.py migrate
```

## Dépannage

### Les conteneurs ne démarrent pas

```bash
# Voir les logs détaillés
docker compose logs

# Vérifier l'espace disque
df -h

# Nettoyer Docker
docker system prune -a
```

### Erreur de connexion à la base de données

```bash
# Vérifier que PostgreSQL est démarré
docker compose ps

# Redémarrer le service DB
docker compose restart db

# Attendre quelques secondes et réessayer
sleep 10
docker compose exec backend python manage.py migrate
```

### Port déjà utilisé

```bash
# Trouver le processus utilisant le port 80
sudo lsof -i :80

# Arrêter le processus ou modifier le port dans docker-compose.yml
# Changer 80:80 en 8080:80 par exemple
```

### Permissions insuffisantes

```bash
# Ajouter votre utilisateur au groupe docker
sudo usermod -aG docker $USER

# Se déconnecter et reconnecter
# Ou utiliser sudo devant les commandes docker
sudo docker compose up -d
```

## Désinstallation

```bash
# Arrêter et supprimer les conteneurs
docker compose down -v

# Supprimer les images
docker rmi $(docker images -q 'kid-*')

# Supprimer les volumes (ATTENTION: supprime les données)
docker volume prune
```

## Support

Pour toute aide supplémentaire :
- Documentation complète: `docs/`
- Issues GitHub: Créez une issue sur le dépôt
- Logs: Toujours vérifier `docker compose logs`
