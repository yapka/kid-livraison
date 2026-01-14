#!/bin/bash

# Script pour créer un package complet pour installation cliente

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

PACKAGE_DIR="/home/nathanael/projet_Livraison/client-package"

echo -e "${YELLOW}📦 Création du package d'installation client${NC}"
echo ""

# Créer la structure
rm -rf "$PACKAGE_DIR"
mkdir -p "$PACKAGE_DIR/docker-images"
mkdir -p "$PACKAGE_DIR/config"
mkdir -p "$PACKAGE_DIR/scripts"

# Copier les scripts
echo "📋 Copie des scripts..."
cp /home/nathanael/projet_Livraison/import-images.sh "$PACKAGE_DIR/scripts/"
cp /home/nathanael/projet_Livraison/import-images.bat "$PACKAGE_DIR/scripts/"
cp /home/nathanael/projet_Livraison/import-images.ps1 "$PACKAGE_DIR/scripts/"
cp /home/nathanael/projet_Livraison/install.bat "$PACKAGE_DIR/" 2>/dev/null || true
cp /home/nathanael/projet_Livraison/install.ps1 "$PACKAGE_DIR/" 2>/dev/null || true
cp /home/nathanael/projet_Livraison/docker-compose.yml "$PACKAGE_DIR/" 2>/dev/null || echo "docker-compose.yml non trouvé"
cp /home/nathanael/projet_Livraison/docker-compose.simple.yml "$PACKAGE_DIR/" 2>/dev/null || true
cp /home/nathanael/projet_Livraison/.env.example "$PACKAGE_DIR/config/" 2>/dev/null || true

# Copier les images exportées
echo "📦 Copie des images Docker..."
if [ -d "/home/nathanael/projet_Livraison/docker-export" ]; then
    cp /home/nathanael/projet_Livraison/docker-export/*.tar.gz "$PACKAGE_DIR/docker-images/" 2>/dev/null || true
fi

# Créer un README pour le client
cat > "$PACKAGE_DIR/README_INSTALLATION.md" << 'EOF'
# Installation de l'Application - Guide Client

## Prérequis

- Docker version 20.10 ou supérieure
- Docker Compose version 2.0 ou supérieure
- 4 GB RAM minimum
- 10 GB d'espace disque

## Vérification des prérequis

```bash
docker --version
docker-compose --version
```

## Installation

### Étape 1: Import des images Docker

```bash
cd scripts
chmod +x import-images.sh
./import-images.sh ../docker-images
```

Cette étape peut prendre quelques minutes selon la taille des images.

### Étape 2: Configuration

```bash
cd ../config
cp .env.example ../.env
nano ../.env
```

Modifiez les variables d'environnement selon vos besoins:
- `POSTGRES_DB`: Nom de la base de données
- `POSTGRES_USER`: Utilisateur PostgreSQL
- `POSTGRES_PASSWORD`: Mot de passe PostgreSQL
- `DJANGO_SECRET_KEY`: Clé secrète Django
- `FRONTEND_PORT`: Port du frontend (défaut: 3000)
- `BACKEND_PORT`: Port du backend (défaut: 8000)

### Étape 3: Démarrage de l'application

```bash
cd ..
docker-compose up -d
```

### Étape 4: Vérification

```bash
# Vérifier que les conteneurs sont démarrés
docker-compose ps

# Voir les logs
docker-compose logs -f
```

### Accès à l'application

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Admin Django: http://localhost:8000/admin

## Commandes utiles

```bash
# Arrêter l'application
docker-compose stop

# Démarrer l'application
docker-compose start

# Redémarrer l'application
docker-compose restart

# Voir les logs
docker-compose logs -f [service]

# Arrêter et supprimer les conteneurs
docker-compose down

# Arrêter et supprimer les conteneurs + volumes
docker-compose down -v
```

## Résolution de problèmes

### Les conteneurs ne démarrent pas

```bash
docker-compose ps
docker-compose logs
```

### Réinitialisation complète

```bash
docker-compose down -v
docker-compose up -d
```

### Problème de port déjà utilisé

Modifiez les ports dans `docker-compose.yml` ou `.env`

## Support

Pour toute assistance, contactez l'équipe de développement.
EOF

# Créer un script d'installation automatique
cat > "$PACKAGE_DIR/install.sh" << 'EOF'
#!/bin/bash

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}🚀 Installation automatique de l'application${NC}"
echo ""

# Vérifier Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker n'est pas installé${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose n'est pas installé${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker et Docker Compose détectés${NC}"
echo ""

# Import des images
echo -e "${YELLOW}📥 Import des images Docker...${NC}"
cd scripts
chmod +x import-images.sh
./import-images.sh ../docker-images
cd ..

# Configuration
echo ""
echo -e "${YELLOW}⚙️  Configuration...${NC}"
if [ ! -f .env ]; then
    if [ -f config/.env.example ]; then
        cp config/.env.example .env
        echo -e "${YELLOW}⚠️  Fichier .env créé depuis l'exemple${NC}"
        echo -e "${YELLOW}⚠️  Veuillez éditer .env avant de continuer${NC}"
        read -p "Appuyez sur Entrée après avoir configuré .env..."
    fi
fi

# Démarrage
echo ""
echo -e "${YELLOW}🚀 Démarrage de l'application...${NC}"
docker-compose up -d

echo ""
echo -e "${GREEN}✨ Installation terminée!${NC}"
echo ""
echo "📊 Statut des services:"
docker-compose ps
echo ""
echo "🌐 Accès:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:8000"
echo ""
echo "📋 Commandes utiles:"
echo "  Logs:     docker-compose logs -f"
echo "  Arrêter:  docker-compose stop"
echo "  Restart:  docker-compose restart"
EOF

chmod +x "$PACKAGE_DIR/install.sh"
chmod +x "$PACKAGE_DIR/scripts/import-images.sh"

# Créer une archive
echo ""
echo -e "${YELLOW}🗜️  Création de l'archive...${NC}"
cd /home/nathanael/projet_Livraison
tar -czf "client-package-$(date +%Y%m%d).tar.gz" -C client-package .

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✨ Package client créé!${NC}"
echo ""
echo "📦 Package complet:"
echo "   $PACKAGE_DIR/"
echo ""
echo "📦 Archive:"
echo "   /home/nathanael/projet_Livraison/client-package-$(date +%Y%m%d).tar.gz"
echo ""
echo "📤 Transférez cette archive au client avec:"
echo "   scp client-package-*.tar.gz user@machine-cliente:/tmp/"
echo ""
echo "📋 Instructions client:"
echo "   tar -xzf client-package-*.tar.gz"
echo "   cd client-package"
echo "   ./install.sh"
