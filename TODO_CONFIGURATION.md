# 🎯 Actions à effectuer - Configuration ArgoCD

Liste des modifications obligatoires avant le déploiement.

## ⚠️ ACTIONS OBLIGATOIRES

### 1. URLs du repository Git

**Fichiers à modifier:**
- `argocd/application-dev.yaml`
- `argocd/application-staging.yaml`
- `argocd/application-prod.yaml`

**Ligne à changer:**
```yaml
repoURL: https://github.com/VOTRE_ORG/VOTRE_REPO.git  # ← Remplacer par votre URL Git
```

**Votre URL:** `_______________________________________`

---

### 2. Images Docker

**Fichiers à modifier:**
- `gitops/base/backend.yaml` (2 occurrences)
- `gitops/base/frontend.yaml`
- `gitops/base/kustomization.yaml`
- `gitops/overlays/dev/kustomization.yaml`
- `gitops/overlays/staging/kustomization.yaml`
- `gitops/overlays/prod/kustomization.yaml`
- `.github/workflows/ci-cd-argocd.yml`

**Lignes à changer:**
```yaml
image: ghcr.io/VOTRE_ORG/kid-backend:latest  # ← Remplacer VOTRE_ORG
image: ghcr.io/VOTRE_ORG/kid-frontend:latest  # ← Remplacer VOTRE_ORG
```

**Votre organisation:** `_______________________________________`

---

### 3. Domaines / URLs

**Fichiers à modifier:**
- `gitops/base/ingress.yaml`
- `gitops/overlays/dev/ingress-patch.yaml`
- `gitops/overlays/staging/ingress-patch.yaml`
- `gitops/overlays/prod/ingress-patch.yaml`

**Domaines à configurer:**

| Environnement | Domaine actuel (exemple)              | Votre domaine |
|---------------|---------------------------------------|---------------|
| Dev           | dev.kid-livraison.local               | _____________ |
| Staging       | staging.kid-livraison.example.com     | _____________ |
| Production    | kid-livraison.example.com             | _____________ |
| Production API| api.kid-livraison.example.com         | _____________ |

---

### 4. Secrets (SÉCURITÉ CRITIQUE!)

**Fichier à sécuriser:**
- `gitops/base/secrets.yaml`

**⚠️ Secrets par défaut non sécurisés:**
```yaml
POSTGRES_PASSWORD: changeme_in_prod  # ← À CHANGER!
SECRET_KEY: changeme_django_secret_key_in_prod  # ← À CHANGER!
```

**Solutions recommandées:**

#### Option A: Sealed Secrets (Recommandé)
```bash
# 1. Installer Sealed Secrets
kubectl apply -f https://github.com/bitnami-labs/sealed-secrets/releases/download/v0.24.0/controller.yaml

# 2. Créer secret PostgreSQL
kubectl create secret generic postgres-secret \
  --from-literal=POSTGRES_PASSWORD="VOTRE_PASSWORD_SECURISE" \
  --from-literal=POSTGRES_DB="kid_livraison" \
  --from-literal=POSTGRES_USER="kid_user" \
  --from-literal=DB_HOST="postgres" \
  --from-literal=DB_PORT="5432" \
  --dry-run=client -o yaml | \
  kubeseal -o yaml > gitops/base/postgres-sealed-secret.yaml

# 3. Créer secret Backend
kubectl create secret generic backend-secret \
  --from-literal=SECRET_KEY="VOTRE_SECRET_KEY_DJANGO_SECURISE" \
  --dry-run=client -o yaml | \
  kubeseal -o yaml > gitops/base/backend-sealed-secret.yaml

# 4. Supprimer l'ancien fichier secrets.yaml ou le renommer
mv gitops/base/secrets.yaml gitops/base/secrets.yaml.example
```

#### Option B: External Secrets Operator
```bash
# Documentation: https://external-secrets.io/
```

**Vos secrets générés:**
- PostgreSQL Password: ☐ Fait
- Django Secret Key: ☐ Fait
- Sealed Secrets créés: ☐ Fait

---

### 5. Namespace (Optionnel)

Si vous souhaitez utiliser un namespace différent de `app-kid`:

**Fichiers à modifier:**
- `gitops/base/namespace.yaml`
- `gitops/base/kustomization.yaml`
- `gitops/overlays/*/kustomization.yaml`

**Namespace souhaité:** `_______________________________________`

---

## 📋 Checklist de configuration

### Avant l'installation ArgoCD

- [ ] URLs Git modifiées dans `argocd/application-*.yaml`
- [ ] Organisation Docker modifiée dans tous les fichiers
- [ ] Domaines configurés dans les ingress
- [ ] Secrets sécurisés (Sealed Secrets ou External Secrets)
- [ ] Cluster Kubernetes accessible (`kubectl cluster-info`)
- [ ] `kubectl` configuré et fonctionnel

### Installation ArgoCD

- [ ] Exécuter `./install-argocd.sh`
- [ ] ArgoCD accessible (port-forward ou ingress)
- [ ] Mot de passe admin récupéré et changé
- [ ] ArgoCD CLI installé (optionnel)

### Déploiement applications

- [ ] Projet ArgoCD déployé: `kubectl apply -f argocd/appproject.yaml`
- [ ] Application dev déployée: `kubectl apply -f argocd/application-dev.yaml`
- [ ] Application staging déployée: `kubectl apply -f argocd/application-staging.yaml`
- [ ] Application prod déployée: `kubectl apply -f argocd/application-prod.yaml`

### Configuration Git

- [ ] Branches créées: `develop`, `staging`
- [ ] Protection de branche `main` activée
- [ ] GitHub Secrets configurés (si nécessaire)
- [ ] Webhook ArgoCD configuré (optionnel, pour sync immédiat)

### Tests

- [ ] Health checks fonctionnels: `curl http://backend/api/health/`
- [ ] Pipeline CI/CD testé (push sur develop)
- [ ] Déploiement automatique dev vérifié
- [ ] Synchronisation ArgoCD vérifiée

---

## 🔧 Commandes pour vérifier

```bash
# Vérifier la configuration Kustomize
kustomize build gitops/overlays/dev
kustomize build gitops/overlays/prod

# Vérifier si des secrets en clair restent
grep -r "changeme" gitops/

# Tester les manifests
kubectl apply --dry-run=client -k gitops/overlays/dev

# Vérifier la connectivité cluster
kubectl get nodes
kubectl get namespaces
```

---

## 📞 Support

Si vous avez des questions:
1. Consulter [ARGOCD_DEPLOYMENT_GUIDE.md](ARGOCD_DEPLOYMENT_GUIDE.md)
2. Consulter [ARGOCD_QUICKSTART.md](ARGOCD_QUICKSTART.md)
3. Vérifier les logs ArgoCD

---

## ✅ Une fois terminé

Supprimer ce fichier ou le marquer comme complété:
```bash
mv TODO_CONFIGURATION.md TODO_CONFIGURATION.md.done
```

**Bon déploiement! 🚀**
