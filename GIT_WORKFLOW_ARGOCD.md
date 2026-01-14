# 📦 Git Workflow - ArgoCD GitOps

Guide des workflows Git pour le déploiement GitOps avec ArgoCD.

## 🌳 Structure des branches

```
main (production)
  ↑
staging (pré-production)
  ↑
develop (développement)
  ↑
feature/* (fonctionnalités)
hotfix/* (corrections urgentes)
```

## 🚀 Workflow standard

### 1. Créer une nouvelle fonctionnalité

```bash
# 1. Se placer sur develop et mettre à jour
git checkout develop
git pull origin develop

# 2. Créer une branche feature
git checkout -b feature/nouvelle-fonctionnalite

# 3. Développer et commiter
git add .
git commit -m "feat: ajout nouvelle fonctionnalité"

# 4. Pusher la branche
git push origin feature/nouvelle-fonctionnalite

# 5. Créer une Pull Request vers develop sur GitHub
```

### 2. Merger vers develop (Dev)

```bash
# Via Pull Request sur GitHub
# → Après merge : Déploiement automatique en DEV

# Vérifier le déploiement
./argocd-manage.sh status
kubectl get pods -n app-kid-dev
```

### 3. Promouvoir vers staging

```bash
# 1. Mettre à jour develop
git checkout develop
git pull origin develop

# 2. Créer PR de develop vers staging
# Via GitHub UI

# Après merge :
# → Déploiement automatique en STAGING

# Vérifier
./argocd-manage.sh status
kubectl get pods -n app-kid-staging
```

### 4. Déployer en production

```bash
# 1. Mettre à jour staging
git checkout staging
git pull origin staging

# 2. Créer PR de staging vers main
# Via GitHub UI avec reviews obligatoires

# Après merge :
# → Pipeline met à jour les manifests
# → Synchronisation MANUELLE requise

# Synchroniser manuellement en production
./argocd-manage.sh sync prod

# Ou via ArgoCD UI
# Ou via CLI: argocd app sync kid-livraison-prod

# Vérifier
./argocd-manage.sh status
kubectl get pods -n app-kid-prod
```

## 🔥 Hotfix en production

```bash
# 1. Créer branche depuis main
git checkout main
git pull origin main
git checkout -b hotfix/correction-critique

# 2. Corriger le bug
git add .
git commit -m "fix: correction critique [nom du bug]"
git push origin hotfix/correction-critique

# 3. Créer PR vers main
# → Review rapide et merge

# 4. Backporter vers staging et develop
git checkout staging
git pull origin main
git push origin staging

git checkout develop
git pull origin staging
git push origin develop
```

## 📝 Conventions de commit

Utiliser [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Nouvelle fonctionnalité
git commit -m "feat: ajout système de notification"

# Correction de bug
git commit -m "fix: correction calcul tarif"

# Documentation
git commit -m "docs: mise à jour README ArgoCD"

# Refactoring
git commit -m "refactor: restructuration module colis"

# Tests
git commit -m "test: ajout tests unitaires livreur"

# Configuration
git commit -m "chore: mise à jour dépendances"

# CI/CD
git commit -m "ci: ajout workflow ArgoCD"

# Performance
git commit -m "perf: optimisation requêtes database"
```

## 🔄 Workflow GitOps

### Modification code application

```bash
# 1. Branche feature
git checkout -b feature/mon-feature

# 2. Modification code (Backend ou Frontend)
# ... modifications ...

# 3. Commit
git add Backend/ # ou Frontent/
git commit -m "feat: nouvelle fonctionnalité"

# 4. Push
git push origin feature/mon-feature

# 5. PR vers develop → Merge

# 6. GitHub Actions:
#    - Tests
#    - Build image Docker
#    - Push ghcr.io
#    - Update gitops/overlays/dev/kustomization.yaml (nouveau tag)
#    - Commit automatique

# 7. ArgoCD détecte changement Git
#    - Sync automatique vers Kubernetes
#    - Application déployée en dev!
```

### Modification manifests Kubernetes

```bash
# 1. Modifier gitops/
nano gitops/overlays/dev/kustomization.yaml

# 2. Tester localement
kustomize build gitops/overlays/dev

# 3. Commit
git add gitops/
git commit -m "chore(k8s): augmentation replicas dev"

# 4. Push
git push origin develop

# 5. ArgoCD détecte et applique automatiquement
```

### Changer version d'une image manuellement

```bash
# 1. Éditer kustomization.yaml
cd gitops/overlays/prod
nano kustomization.yaml

# Modifier:
images:
  - name: ghcr.io/ORG/kid-backend
    newTag: v1.2.3  # ← Nouvelle version

# 2. Commit
git add .
git commit -m "chore(k8s): déploiement backend v1.2.3 en prod"

# 3. Push vers main
git push origin main

# 4. Sync manuel en prod
./argocd-manage.sh sync prod
```

## 🏷️ Tags et Releases

### Créer une release

```bash
# 1. S'assurer que main est à jour
git checkout main
git pull origin main

# 2. Créer un tag
git tag -a v1.0.0 -m "Release v1.0.0: Première version stable"

# 3. Pusher le tag
git push origin v1.0.0

# GitHub Actions va:
# - Builder les images avec tag v1.0.0
# - Les pusher sur ghcr.io
```

### Utiliser une release spécifique

```bash
# Modifier gitops/overlays/prod/kustomization.yaml
images:
  - name: ghcr.io/ORG/kid-backend
    newTag: v1.0.0  # Tag fixe pour prod
```

## 🔍 Vérifications

### Avant de merger

```bash
# Vérifier les tests
# (automatique via GitHub Actions)

# Vérifier les manifests Kubernetes
kustomize build gitops/overlays/dev | kubectl apply --dry-run=client -f -

# Vérifier qu'il n'y a pas de secrets en clair
grep -r "password" gitops/ --exclude="*.md"
```

### Après déploiement

```bash
# Status ArgoCD
./argocd-manage.sh status

# Logs application
./argocd-manage.sh logs dev

# Pods Kubernetes
kubectl get pods -n app-kid-dev
kubectl describe pod <pod-name> -n app-kid-dev

# Health check
curl http://backend.app-kid-dev.svc.cluster.local:8000/api/health/
```

## 🔄 Rollback

### Via Git (recommandé)

```bash
# 1. Identifier le commit à rollback
git log --oneline

# 2. Créer un revert
git revert <commit-hash>

# 3. Pusher
git push origin develop

# ArgoCD va automatiquement revenir à l'état précédent
```

### Via ArgoCD

```bash
# CLI
./argocd-manage.sh rollback dev

# Ou spécifier une révision
argocd app rollback kid-livraison-dev <revision-number>

# UI ArgoCD
# → Application → History → Rollback
```

## 📊 Monitoring du workflow

```bash
# Voir l'historique des syncs ArgoCD
argocd app history kid-livraison-dev

# Voir les différences avec Git
./argocd-manage.sh diff dev

# Voir les événements Kubernetes
kubectl get events -n app-kid-dev --sort-by='.lastTimestamp'

# Logs du pipeline CI/CD
# → GitHub Actions → Workflows
```

## 🛡️ Protections de branches

Configuration recommandée sur GitHub:

### Branch: `main` (production)
- ✅ Require pull request reviews (2 reviewers)
- ✅ Require status checks to pass
- ✅ Require branches to be up to date
- ✅ Include administrators
- ✅ Restrict who can push

### Branch: `staging`
- ✅ Require pull request reviews (1 reviewer)
- ✅ Require status checks to pass
- ✅ Require branches to be up to date

### Branch: `develop`
- ✅ Require status checks to pass
- ✅ Require branches to be up to date

## 🎯 Bonnes pratiques

1. **Toujours travailler sur une branche feature**
   ```bash
   git checkout -b feature/nom-fonctionnalite
   ```

2. **Commits atomiques et descriptifs**
   ```bash
   git commit -m "feat(colis): ajout validation poids"
   ```

3. **Pull avant push**
   ```bash
   git pull --rebase origin develop
   ```

4. **Tester localement avant commit**
   ```bash
   # Backend
   cd Backend && python manage.py test
   
   # Frontend
   cd Frontent/frontend-app && npm test
   ```

5. **Vérifier Kustomize avant commit**
   ```bash
   kustomize build gitops/overlays/dev
   ```

6. **Ne jamais commiter de secrets**
   ```bash
   # Vérifier avant commit
   git diff | grep -i "password\|secret\|key"
   ```

## 📚 Ressources

- [Git Flow](https://nvie.com/posts/a-successful-git-branching-model/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Flow](https://guides.github.com/introduction/flow/)
- [GitOps Principles](https://opengitops.dev/)

---

**Bon workflow GitOps! 🚀**
