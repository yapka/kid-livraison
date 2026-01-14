# 🔧 Guide de correction des problèmes Docker

## Problème identifié

Votre installation Docker ne peut pas résoudre les noms DNS. Cela empêche:
- `npm install` de télécharger les packages Node.js
- `pip install` de télécharger les packages Python

## Solutions (par ordre de préférence)

### Solution 1: Corriger la configuration réseau de Docker (RECOMMANDÉ)

```bash
# 1. Arrêter Docker complètement
sudo systemctl stop docker
sudo systemctl stop docker.socket

# 2. Vérifier la configuration DNS
cat /etc/docker/daemon.json

# 3. Si besoin, éditer la configuration
sudo nano /etc/docker/daemon.json
```

Contenu à mettre dans `/etc/docker/daemon.json`:
```json
{
  "dns": ["8.8.8.8", "8.8.4.4", "1.1.1.1"],
  "dns-opts": ["ndots:0"],
  "dns-search": ["."]
}
```

```bash
# 4. Redémarrer Docker
sudo systemctl start docker

# 5. Tester
docker run --rm alpine nslookup registry.npmjs.org
```

### Solution 2: Utiliser le réseau hôte

Si la solution 1 ne fonctionne pas, construisez avec `--network=host`:

```bash
# Backend
cd /home/nathanael/projet_Livraison/Backend
docker build --network=host -t backend-app .

# Frontend
cd /home/nathanael/projet_Livraison/Frontent/frontend-app
docker build --network=host -t frontend-app .
```

### Solution 3: Vérifier les règles de pare-feu

```bash
# Vérifier si le pare-feu bloque Docker
sudo iptables -L -n | grep DOCKER
sudo ufw status

# Si UFW est actif, autoriser Docker
sudo ufw allow from 172.17.0.0/16
```

### Solution 4: Réinitialiser complètement Docker

```bash
# ATTENTION: Cela supprimera tous vos conteneurs et images!
sudo systemctl stop docker
sudo rm -rf /var/lib/docker
sudo systemctl start docker
```

### Solution 5: Utiliser docker-compose avec configuration DNS

Créer un `docker-compose.yml` avec DNS configuré:

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./Backend
      dockerfile: Dockerfile
    dns:
      - 8.8.8.8
      - 8.8.4.4
    network_mode: bridge
    
  frontend:
    build:
      context: ./Frontent/frontend-app
      dockerfile: Dockerfile
    dns:
      - 8.8.8.8
      - 8.8.4.4
    network_mode: bridge
```

## Diagnostic

Pour comprendre le problème:

```bash
# Tester la résolution DNS dans un conteneur
docker run --rm busybox nslookup google.com

# Vérifier la configuration réseau de Docker
docker network inspect bridge

# Voir les logs Docker
sudo journalctl -u docker -n 50 --no-pager

# Tester avec un DNS spécifique
docker run --rm --dns 8.8.8.8 alpine nslookup google.com
```

## Problèmes spécifiques identifiés dans votre configuration

### Frontend
- ✅ Corrigé: Version Node.js mise à jour de 18 vers 20
- ❌ Problème: `npm install` échoue à cause du DNS
- ❌ Résultat: `vite: not found` car les dépendances ne sont pas installées

### Backend  
- ✅ Corrigé: Version Python mise à jour de 3.13 vers 3.12-slim
- ❌ Problème: `pip install` échoue à cause du DNS
- ❌ Résultat: Packages Django non installés

## Prochaines étapes

1. Exécutez `/home/nathanael/projet_Livraison/fix-docker-dns.sh`
2. Si cela ne fonctionne pas, redémarrez complètement votre machine
3. Si le problème persiste, utilisez la Solution 2 (--network=host)
