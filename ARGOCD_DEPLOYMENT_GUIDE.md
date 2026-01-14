# 🚀 Guide de déploiement ArgoCD - KID Livraison

## 📋 Table des matières

- [Introduction](#introduction)
- [Architecture GitOps](#architecture-gitops)
- [Prérequis](#prérequis)
- [Installation ArgoCD](#installation-argocd)
- [Configuration](#configuration)
- [Déploiement des applications](#déploiement-des-applications)
- [Gestion des environnements](#gestion-des-environnements)
- [CI/CD Pipeline](#cicd-pipeline)
- [Monitoring et troubleshooting](#monitoring-et-troubleshooting)
- [Bonnes pratiques](#bonnes-pratiques)
- [Commandes utiles](#commandes-utiles)
    
---

## 🎯 Introduction

Ce guide détaille la mise en place d'un pipeline GitOps complet avec ArgoCD pour le projet KID Livraison. ArgoCD assure un déploiement automatisé, reproductible et auditable de vos applications Kubernetes.

### Avantages d'ArgoCD

✅ **Déploiement automatique** - Synchronisation automatique avec Git  
✅ **Traçabilité** - Historique complet des déploiements  
✅ **Rollback facile** - Retour arrière en un clic  
✅ **Multi-environnements** - Dev, Staging, Production  
✅ **Sécurité** - RBAC et contrôle d'accès granulaire  
✅ **Self-healing** - Réconciliation automatique des dérives  

---

## 🏗️ Architecture GitOps

### Structure du projet

```
app-kid-main/
├── argocd/                         # Configuration ArgoCD
│   ├── appproject.yaml            # Projet ArgoCD avec RBAC
│   ├── application-dev.yaml       # Application Dev
│   ├── application-staging.yaml   # Application Staging
│   └── application-prod.yaml      # Application Production
│
├── gitops/                        # Manifests Kubernetes
│   ├── base/                      # Configuration de base
│   │   ├── namespace.yaml
│   │   ├── configmap.yaml
│   │   ├── secrets.yaml
│   │   ├── postgres.yaml
│   │   ├── backend.yaml
│   │   ├── frontend.yaml
│   │   ├── ingress.yaml
│   │   └── kustomization.yaml
│   │
│   └── overlays/                  # Configurations par environnement
│       ├── dev/
│       │   ├── kustomization.yaml
│       │   └── ingress-patch.yaml
│       ├── staging/
│       │   ├── kustomization.yaml
│       │   └── ingress-patch.yaml
│       └── prod/
│           ├── kustomization.yaml
│           └── ingress-patch.yaml
│
├── .github/workflows/
│   └── ci-cd-argocd.yml          # Pipeline CI/CD
│
├── install-argocd.sh              # Script d'installation
└── argocd-manage.sh               # Script de gestion
```

### Flux de déploiement

```
┌─────────────┐
│  Developer  │
│    Push      │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  GitHub Actions │
│   CI Pipeline    │
│  - Tests         │
│  - Build images  │
│  - Push registry │
│  - Update Git    │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐       ┌──────────────┐
│   Git Repository │◄──────┤   ArgoCD     │
│   (manifests)    │       │  Auto-sync   │
└─────────────────┘       └──────┬───────┘
                                 │
                                 ▼
                          ┌─────────────┐
                          │  Kubernetes │
                          │   Cluster   │
                          └─────────────┘
```

---

## 🔧 Prérequis

### Infrastructure

- **Cluster Kubernetes** 1.24+
  - Minikube (dev)
  - K3s/K3d (dev/staging)
  - GKE/EKS/AKS (production)
  
- **Outils requis:**
  ```bash
  # Installer kubectl
  curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
  sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
  
  # Installer Helm
  curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
  
  # Installer Kustomize
  curl -s "https://raw.githubusercontent.com/kubernetes-sigs/kustomize/master/hack/install_kustomize.sh" | bash
  sudo mv kustomize /usr/local/bin/
  ```

### Prérequis Git

- Repository Git (GitHub, GitLab, etc.)
- Token d'accès avec droits lecture/écriture
- Branches: `main`, `develop`, `staging`

### Container Registry

- GitHub Container Registry (ghcr.io) - Recommandé
- Docker Hub
- Harbor / Registry privé

---

## 📦 Installation ArgoCD

### Installation automatique

```bash
# Exécuter le script d'installation
./install-argocd.sh
```

Le script va:
1. ✅ Vérifier les prérequis
2. ✅ Créer le namespace ArgoCD
3. ✅ Installer ArgoCD
4. ✅ Configurer l'accès
5. ✅ (Optionnel) Installer ArgoCD CLI
6. ✅ (Optionnel) Déployer les applications

### Installation manuelle

```bash
# 1. Créer le namespace
kubectl create namespace argocd

# 2. Installer ArgoCD
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# 3. Attendre que les pods soient prêts
kubectl wait --for=condition=available --timeout=300s \
    deployment/argocd-server -n argocd

# 4. Récupérer le mot de passe admin
kubectl -n argocd get secret argocd-initial-admin-secret \
    -o jsonpath="{.data.password}" | base64 -d

# 5. Port-forward pour accéder à l'UI
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

### Accès à ArgoCD UI

**URL:** https://localhost:8080  
**Username:** admin  
**Password:** (obtenu à l'étape 4)

⚠️ **IMPORTANT:** Changez le mot de passe immédiatement après la première connexion!

---

## ⚙️ Configuration

### 1. Modifier les URLs du repository

Dans tous les fichiers `argocd/application-*.yaml`, modifier:

```yaml
spec:
  source:
    repoURL: https://github.com/VOTRE_ORG/VOTRE_REPO.git  # ← À MODIFIER
```

### 2. Modifier les images Docker

Dans les fichiers `gitops/base/*.yaml` et `gitops/overlays/*/kustomization.yaml`, modifier:

```yaml
image: ghcr.io/VOTRE_ORG/kid-backend:latest  # ← À MODIFIER
image: ghcr.io/VOTRE_ORG/kid-frontend:latest  # ← À MODIFIER
```

### 3. Configurer les domaines

Dans `gitops/base/ingress.yaml`:

```yaml
spec:
  tls:
    - hosts:
        - kid-livraison.example.com  # ← À MODIFIER
```

### 4. Configurer les secrets

⚠️ **Production:** Utilisez **Sealed Secrets** ou **External Secrets Operator**

```bash
# Installer Sealed Secrets
kubectl apply -f https://github.com/bitnami-labs/sealed-secrets/releases/download/v0.24.0/controller.yaml

# Créer un secret scellé
kubectl create secret generic postgres-secret \
  --from-literal=POSTGRES_PASSWORD=votre-password-securise \
  --dry-run=client -o yaml | \
  kubeseal -o yaml > gitops/base/postgres-sealed-secret.yaml
```

### 5. Configurer GitHub Secrets

Dans votre repository GitHub, ajouter:

- `GITHUB_TOKEN` (automatique)
- Autres secrets si nécessaire

---

## 🚀 Déploiement des applications

### Méthode 1: Via l'UI ArgoCD

1. Ouvrir ArgoCD UI: https://localhost:8080
2. Cliquer sur **+ NEW APP**
3. Remplir les champs:
   - **Application Name:** kid-livraison-dev
   - **Project:** kid-livraison
   - **Sync Policy:** Automatic
   - **Repository URL:** votre-repo-git
   - **Path:** gitops/overlays/dev
   - **Cluster:** https://kubernetes.default.svc
   - **Namespace:** app-kid-dev
4. Cliquer sur **CREATE**

### Méthode 2: Via kubectl

```bash
# Déployer le projet
kubectl apply -f argocd/appproject.yaml

# Déployer les applications
kubectl apply -f argocd/application-dev.yaml
kubectl apply -f argocd/application-staging.yaml
kubectl apply -f argocd/application-prod.yaml

# Vérifier le statut
kubectl get applications -n argocd
```

### Méthode 3: Via ArgoCD CLI

```bash
# Login
argocd login localhost:8080

# Créer une application
argocd app create kid-livraison-dev \
  --repo https://github.com/VOTRE_ORG/VOTRE_REPO.git \
  --path gitops/overlays/dev \
  --dest-server https://kubernetes.default.svc \
  --dest-namespace app-kid-dev \
  --sync-policy automated \
  --auto-prune \
  --self-heal

# Synchroniser
argocd app sync kid-livraison-dev

# Vérifier le statut
argocd app get kid-livraison-dev
```

---

## 🌍 Gestion des environnements

### Environnement Dev

- **Namespace:** app-kid-dev
- **Branch:** develop
- **Auto-sync:** ✅ Activé
- **Self-heal:** ✅ Activé
- **Replicas:** 1
- **Domain:** dev.kid-livraison.local

```bash
# Déployer
kubectl apply -f argocd/application-dev.yaml

# Synchroniser
./argocd-manage.sh sync dev

# Logs
./argocd-manage.sh logs dev
```

### Environnement Staging

- **Namespace:** app-kid-staging
- **Branch:** staging
- **Auto-sync:** ✅ Activé
- **Self-heal:** ✅ Activé
- **Replicas:** 2
- **Domain:** staging.kid-livraison.example.com

```bash
# Déployer
kubectl apply -f argocd/application-staging.yaml

# Synchroniser
./argocd-manage.sh sync staging
```

### Environnement Production

- **Namespace:** app-kid-prod
- **Branch:** main
- **Auto-sync:** ❌ Désactivé (sync manuel)
- **Self-heal:** ❌ Désactivé
- **Replicas:** 3
- **Domain:** kid-livraison.example.com

```bash
# Déployer
kubectl apply -f argocd/application-prod.yaml

# Synchroniser MANUELLEMENT
./argocd-manage.sh sync prod
```

---

## 🔄 CI/CD Pipeline

### Workflow GitHub Actions

Le fichier `.github/workflows/ci-cd-argocd.yml` implémente:

1. **Tests**
   - Backend (Python/Django)
   - Frontend (Node/React)

2. **Build & Push**
   - Images Docker
   - GitHub Container Registry

3. **Update GitOps**
   - Mise à jour des tags dans Kustomize
   - Commit automatique

### Déclencheurs

- **Push sur `develop`** → Déploiement automatique en **dev**
- **Push sur `staging`** → Déploiement automatique en **staging**
- **Push sur `main`** → Update manifests (sync manuel en **prod**)
- **Tag `v*.*.*`** → Release production

### Exemple de workflow

```bash
# 1. Développer une fonctionnalité
git checkout -b feature/nouvelle-fonctionnalite
# ... modifications ...
git commit -m "feat: ajout nouvelle fonctionnalité"
git push origin feature/nouvelle-fonctionnalite

# 2. Créer une PR vers develop
# → Tests automatiques

# 3. Merger dans develop
# → Build + Push + Déploiement automatique en DEV

# 4. Tester en dev, puis merger develop → staging
# → Déploiement automatique en STAGING

# 5. Valider en staging, puis merger staging → main
# → Update manifests, synchronisation MANUELLE en PROD
```

---

## 📊 Monitoring et Troubleshooting

### Vérifier le statut

```bash
# Via script de gestion
./argocd-manage.sh status

# Via kubectl
kubectl get applications -n argocd

# Via ArgoCD CLI
argocd app list
```

### Visualiser les logs

```bash
# Logs d'une application
./argocd-manage.sh logs dev

# Logs ArgoCD
kubectl logs -n argocd deployment/argocd-server -f
kubectl logs -n argocd deployment/argocd-repo-server -f
```

### Problèmes courants

#### 1. Application OutOfSync

```bash
# Forcer une synchronisation
./argocd-manage.sh sync dev

# Ou via ArgoCD UI
argocd app sync kid-livraison-dev --force
```

#### 2. Santé Degraded

```bash
# Vérifier les événements
kubectl get events -n app-kid-dev --sort-by='.lastTimestamp'

# Vérifier les pods
kubectl get pods -n app-kid-dev

# Redémarrer les pods
./argocd-manage.sh restart dev
```

#### 3. Erreur de synchronisation

```bash
# Voir les détails
argocd app get kid-livraison-dev

# Voir les différences
./argocd-manage.sh diff dev

# Rollback si nécessaire
./argocd-manage.sh rollback dev
```

---

## ✨ Bonnes pratiques

### 1. Gestion des secrets

❌ **Ne jamais commiter des secrets en clair dans Git!**

✅ Utiliser:
- **Sealed Secrets** (Bitnami)
- **External Secrets Operator**
- **Vault** (HashiCorp)
- **SOPS** (Mozilla)

### 2. Structure Git

```
main (prod)
  ↑
staging
  ↑
develop (dev)
  ↑
feature/xxx
```

### 3. Tags d'images

- **Dev:** Tags dynamiques (`dev-latest`, `dev-sha`)
- **Staging:** Tags de branche (`staging-sha`)
- **Prod:** Tags sémantiques fixes (`v1.2.3`)

### 4. Sync Policy

- **Dev:** Automated + Self-heal
- **Staging:** Automated + Self-heal
- **Prod:** Manual (contrôle total)

### 5. RBAC

Définir des rôles précis dans `argocd/appproject.yaml`:
- **Développeurs:** Sync dev uniquement
- **Ops:** Sync tous environnements
- **Viewers:** Read-only

---

## 🔧 Commandes utiles

### Script de gestion

```bash
# Status global
./argocd-manage.sh status

# Synchroniser un environnement
./argocd-manage.sh sync dev

# Voir les logs
./argocd-manage.sh logs prod

# Rollback
./argocd-manage.sh rollback staging

# Redémarrer les pods
./argocd-manage.sh restart dev

# Port-forward ArgoCD UI
./argocd-manage.sh port-forward

# Récupérer le mot de passe
./argocd-manage.sh password
```

### kubectl

```bash
# Applications ArgoCD
kubectl get applications -n argocd
kubectl describe application kid-livraison-dev -n argocd

# Pods par environnement
kubectl get pods -n app-kid-dev
kubectl get pods -n app-kid-staging
kubectl get pods -n app-kid-prod

# Forcer un refresh
kubectl patch app kid-livraison-dev -n argocd --type merge -p '{"operation":{"initiatedBy":{"username":"admin"},"sync":{}}}'
```

### ArgoCD CLI

```bash
# Login
argocd login localhost:8080

# Liste des apps
argocd app list

# Détails d'une app
argocd app get kid-livraison-dev

# Synchroniser
argocd app sync kid-livraison-dev

# Historique
argocd app history kid-livraison-dev

# Rollback
argocd app rollback kid-livraison-dev <revision>

# Supprimer
argocd app delete kid-livraison-dev
```

---

## 📚 Ressources supplémentaires

- [ArgoCD Documentation](https://argo-cd.readthedocs.io/)
- [Kustomize Documentation](https://kubectl.docs.kubernetes.io/references/kustomize/)
- [GitOps Principles](https://opengitops.dev/)
- [Best Practices](https://argo-cd.readthedocs.io/en/stable/user-guide/best_practices/)

---

## 🆘 Support

En cas de problème:

1. Vérifier les logs: `./argocd-manage.sh logs <env>`
2. Vérifier le status: `./argocd-manage.sh status`
3. Consulter ArgoCD UI pour les détails
4. Vérifier les événements Kubernetes

---

**Prêt pour le déploiement GitOps! 🚀**
