# 🚀 Quick Start - Déploiement ArgoCD KID Livraison

## Installation rapide (10 minutes)

### 1. Prérequis
```bash
# Vérifier kubectl
kubectl version --client

# Avoir un cluster Kubernetes actif
kubectl cluster-info
```

### 2. Installer ArgoCD
```bash
# Installation automatique
./install-argocd.sh

# Ou manuelle
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

### 3. Accéder à ArgoCD
```bash
# Port-forward
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Récupérer le mot de passe
kubectl -n argocd get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d
```

**Ouvrir:** https://localhost:8080  
**Login:** admin / <mot-de-passe>

### 4. Configurer le projet

**Modifier les URLs dans les fichiers:**

1. `argocd/application-*.yaml`: Changer `repoURL`
2. `gitops/base/*.yaml`: Changer les images Docker
3. `gitops/base/ingress.yaml`: Changer les domaines

### 5. Déployer les applications
```bash
# Déployer le projet ArgoCD
kubectl apply -f argocd/appproject.yaml

# Déployer environnement dev
kubectl apply -f argocd/application-dev.yaml

# Vérifier
kubectl get applications -n argocd
```

### 6. Utiliser le script de gestion
```bash
# Voir le status
./argocd-manage.sh status

# Synchroniser
./argocd-manage.sh sync dev

# Voir les logs
./argocd-manage.sh logs dev
```

## Workflow de développement

```bash
# 1. Modifier le code
git checkout -b feature/ma-fonctionnalite
# ... modifications ...

# 2. Commit et push
git add .
git commit -m "feat: nouvelle fonctionnalité"
git push origin feature/ma-fonctionnalite

# 3. Créer une PR vers develop

# 4. Après merge → Déploiement automatique en DEV
```

## Environnements disponibles

| Environnement | Branch    | Namespace       | Auto-sync | Domain                              |
|---------------|-----------|-----------------|-----------|-------------------------------------|
| **Dev**       | develop   | app-kid-dev     | ✅ Oui    | dev.kid-livraison.local             |
| **Staging**   | staging   | app-kid-staging | ✅ Oui    | staging.kid-livraison.example.com   |
| **Prod**      | main      | app-kid-prod    | ❌ Manuel | kid-livraison.example.com           |

## Commandes essentielles

```bash
# Status
./argocd-manage.sh status

# Synchroniser
./argocd-manage.sh sync [dev|staging|prod]

# Logs
./argocd-manage.sh logs [env]

# Rollback
./argocd-manage.sh rollback [env]

# Redémarrer
./argocd-manage.sh restart [env]

# UI
./argocd-manage.sh ui
```

## Dépannage rapide

### Application OutOfSync
```bash
./argocd-manage.sh sync dev --force
```

### Pods qui ne démarrent pas
```bash
kubectl get pods -n app-kid-dev
kubectl logs <pod-name> -n app-kid-dev
./argocd-manage.sh restart dev
```

### Mot de passe ArgoCD oublié
```bash
./argocd-manage.sh password
```

## Documentation complète

Voir [ARGOCD_DEPLOYMENT_GUIDE.md](ARGOCD_DEPLOYMENT_GUIDE.md) pour le guide détaillé.

---

**Vous êtes prêt! 🎉**
