# 🦊 Configuration GitLab CI/CD - KID Livraison

## 📋 Variables à configurer dans GitLab

Allez dans **Settings > CI/CD > Variables** et ajoutez :

### 🔐 Variables obligatoires

| Variable | Description | Exemple | Protégé | Masqué |
|----------|-------------|---------|---------|--------|
| `SSH_PRIVATE_KEY` | Clé SSH privée pour déploiement | `-----BEGIN RSA PRIVATE KEY-----` | ✅ | ✅ |
| `STAGING_SERVER` | IP/domaine serveur staging | `staging.kid-livraison.com` | ❌ | ❌ |
| `STAGING_USER` | User SSH staging | `deploy` | ❌ | ❌ |
| `PRODUCTION_SERVER` | IP/domaine serveur production | `kid-livraison.com` | ✅ | ❌ |
| `PRODUCTION_USER` | User SSH production | `deploy` | ✅ | ❌ |

### 🐳 Variables Docker Registry (auto-configurées)

GitLab fournit automatiquement :
- `CI_REGISTRY` : registry.gitlab.com
- `CI_REGISTRY_USER` : gitlab-ci-token
- `CI_REGISTRY_PASSWORD` : token auto-généré
- `CI_REGISTRY_IMAGE` : registry.gitlab.com/kidistribution/app-kid

---

## 🚀 Pipeline CI/CD

### 1️⃣ Stage: Test
- **test-backend** : Tests Django avec PostgreSQL
- **test-frontend** : Lint et build React

### 2️⃣ Stage: Build (branche main uniquement)
- **build-backend** : Build et push image Docker backend
- **build-frontend** : Build et push image Docker frontend

### 3️⃣ Stage: Deploy (manuel)
- **deploy-staging** : Déploiement sur environnement de test
- **deploy-production** : Déploiement en production

---

## 🔧 Configuration des runners

### Activer le Container Registry
```bash
Settings > General > Visibility > Container Registry = Enabled
```

### Utiliser les runners GitLab
Par défaut, GitLab fournit des runners partagés gratuits.

Pour un runner dédié (optionnel) :
```bash
# Sur votre serveur
curl -L https://packages.gitlab.com/install/repositories/runner/gitlab-runner/script.deb.sh | sudo bash
sudo apt-get install gitlab-runner

# Enregistrer le runner
sudo gitlab-runner register
```

---

## 🔑 Génération de la clé SSH

### Sur votre machine locale
```bash
# Générer une clé SSH
ssh-keygen -t ed25519 -C "gitlab-ci@kid-livraison" -f ~/.ssh/gitlab-ci

# Afficher la clé privée (à copier dans GitLab Variables)
cat ~/.ssh/gitlab-ci

# Afficher la clé publique (à ajouter sur vos serveurs)
cat ~/.ssh/gitlab-ci.pub
```

### Sur vos serveurs (staging & production)
```bash
# Se connecter au serveur
ssh user@votre-serveur

# Ajouter la clé publique
echo "ssh-ed25519 AAAAC3... gitlab-ci@kid-livraison" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

---

## 📦 Utilisation des images Docker

Les images sont disponibles dans le Container Registry :

```bash
# Pull les images
docker pull registry.gitlab.com/kidistribution/app-kid/backend:latest
docker pull registry.gitlab.com/kidistribution/app-kid/frontend:latest

# Login au registry
docker login registry.gitlab.com
Username: votre-username
Password: votre-personal-access-token
```

### Créer un Personal Access Token
```
Settings > Access Tokens > Add new token
Scopes: read_registry, write_registry
```

---

##  Workflow de déploiement

### Développement
```bash
# Travailler sur une feature
git checkout -b feature/nouvelle-fonctionnalite
git commit -m "feat: nouvelle fonctionnalité"
git push origin feature/nouvelle-fonctionnalite

# Créer une Merge Request
# GitLab lancera les tests automatiquement
```

### Staging
```bash
# Merge dans develop
git checkout develop
git merge feature/nouvelle-fonctionnalite
git push origin develop

# Aller dans GitLab CI/CD > Pipelines
# Cliquer sur "Play" pour deploy-staging
```

### Production
```bash
# Merge dans main
git checkout main
git merge develop
git push origin main

# Le pipeline build les images automatiquement
# Cliquer sur "Play" pour deploy-production (manuel)
```

---

## 🐛 Debugging

### Voir les logs du pipeline
```
CI/CD > Pipelines > Cliquer sur le pipeline > Cliquer sur le job
```

### Tester localement
```bash
# Installer gitlab-runner localement
brew install gitlab-runner  # macOS
# ou
apt install gitlab-runner   # Linux

# Exécuter un job localement
gitlab-runner exec docker test-backend
```

### Variables manquantes
Si un job échoue avec "variable not defined" :
```
Settings > CI/CD > Variables > Expand > Add Variable
```

---

## 📊 Badges de statut

Ajouter dans votre README.md :

```markdown
[![Pipeline Status](https://gitlab.com/kidistribution/app-kid/badges/main/pipeline.svg)](https://gitlab.com/kidistribution/app-kid/-/commits/main)
[![Coverage Report](https://gitlab.com/kidistribution/app-kid/badges/main/coverage.svg)](https://gitlab.com/kidistribution/app-kid/-/commits/main)
```

---

## ✅ Checklist de configuration

- [ ] Repository créé sur GitLab
- [ ] Variables CI/CD configurées
- [ ] Container Registry activé
- [ ] Clé SSH générée et ajoutée
- [ ] Serveurs configurés avec clé publique
- [ ] `.gitlab-ci.yml` committé
- [ ] Premier pipeline exécuté avec succès
- [ ] Deploy staging testé
- [ ] Deploy production testé

---

## 🆘 Support

**Documentation GitLab CI/CD :**
- https://docs.gitlab.com/ee/ci/
- https://docs.gitlab.com/ee/user/packages/container_registry/

**Exemple de configuration serveur :**
```bash
# Sur le serveur de production
cd /var/www
git clone git@gitlab.com:kidistribution/app-kid.git kid-livraison
cd kid-livraison
cp .env.example .env
nano .env  # Configurer
docker-compose up -d
```
