# Structure GitOps - KID Livraison

Ce dossier contient tous les manifests Kubernetes pour le déploiement via ArgoCD.

## 📁 Structure

```
gitops/
├── base/                      # Configuration de base (partagée)
│   ├── namespace.yaml         # Namespace Kubernetes
│   ├── configmap.yaml         # Configuration de l'application
│   ├── secrets.yaml           # Secrets (à chiffrer en prod!)
│   ├── postgres.yaml          # Base de données PostgreSQL
│   ├── backend.yaml           # API Backend Django
│   ├── frontend.yaml          # Application Frontend React
│   ├── ingress.yaml           # Exposition externe
│   └── kustomization.yaml     # Configuration Kustomize
│
└── overlays/                  # Configurations spécifiques par env
    ├── dev/
    │   ├── kustomization.yaml
    │   └── ingress-patch.yaml
    ├── staging/
    │   ├── kustomization.yaml
    │   └── ingress-patch.yaml
    └── prod/
        ├── kustomization.yaml
        └── ingress-patch.yaml
```

## 🎯 Kustomize

Nous utilisons Kustomize pour gérer les différences entre environnements:

- **Base**: Configuration commune à tous les environnements
- **Overlays**: Personnalisations par environnement (replicas, domaines, ressources, etc.)

### Tester localement

```bash
# Voir les manifests générés pour dev
kustomize build gitops/overlays/dev

# Voir les manifests générés pour prod
kustomize build gitops/overlays/prod

# Appliquer directement (sans ArgoCD)
kubectl apply -k gitops/overlays/dev
```

## 🔧 Configuration

### Base (`gitops/base/`)

Contient la configuration de base qui s'applique à tous les environnements:

- **2 replicas** par défaut pour Backend et Frontend
- **StatefulSet** pour PostgreSQL avec PVC
- **ConfigMaps** pour la configuration
- **Secrets** pour les données sensibles
- **Services** ClusterIP
- **Ingress** avec TLS

### Overlays

#### Dev (`gitops/overlays/dev/`)
- Namespace: `app-kid-dev`
- Replicas: 1
- Debug: true
- Domain: `dev.kid-livraison.local`
- Auto-sync: ✅

#### Staging (`gitops/overlays/staging/`)
- Namespace: `app-kid-staging`
- Replicas: 2
- Debug: false
- Domain: `staging.kid-livraison.example.com`
- Auto-sync: ✅

#### Prod (`gitops/overlays/prod/`)
- Namespace: `app-kid-prod`
- Replicas: 3
- Debug: false
- Resources: Augmentées
- Domain: `kid-livraison.example.com`
- Auto-sync: ❌ (manuel)

## 📝 Modifications

### Changer les images Docker

Dans `kustomization.yaml` de chaque overlay:

```yaml
images:
  - name: ghcr.io/VOTRE_ORG/kid-backend
    newTag: v1.2.3  # ← Nouvelle version
  - name: ghcr.io/VOTRE_ORG/kid-frontend
    newTag: v1.2.3  # ← Nouvelle version
```

Le pipeline CI/CD fait cette modification automatiquement.

### Changer les domaines

Modifier `ingress-patch.yaml` dans chaque overlay.

### Changer les replicas

Modifier `kustomization.yaml` dans chaque overlay:

```yaml
replicas:
  - name: backend
    count: 3  # ← Nombre de replicas
```

### Changer les ressources

Ajouter un patch dans `kustomization.yaml`:

```yaml
patches:
  - patch: |-
      apiVersion: apps/v1
      kind: Deployment
      metadata:
        name: backend
      spec:
        template:
          spec:
            containers:
              - name: backend
                resources:
                  requests:
                    memory: "1Gi"
                    cpu: "500m"
```

## 🔐 Secrets

⚠️ **IMPORTANT:** Ne jamais commiter de secrets en clair!

### Solutions recommandées

1. **Sealed Secrets** (Bitnami)
   ```bash
   kubectl create secret generic postgres-secret \
     --from-literal=POSTGRES_PASSWORD=secure-password \
     --dry-run=client -o yaml | \
     kubeseal -o yaml > postgres-sealed-secret.yaml
   ```

2. **External Secrets Operator**
   ```yaml
   apiVersion: external-secrets.io/v1beta1
   kind: ExternalSecret
   metadata:
     name: postgres-secret
   spec:
     secretStoreRef:
       name: vault-backend
     target:
       name: postgres-secret
     data:
       - secretKey: POSTGRES_PASSWORD
         remoteRef:
           key: database/postgres
           property: password
   ```

## 🔄 Workflow GitOps

```
1. Développeur push code → GitHub
         ↓
2. GitHub Actions:
   - Tests
   - Build images
   - Push registry
   - Update kustomization.yaml (newTag)
         ↓
3. ArgoCD détecte changement Git
         ↓
4. ArgoCD applique manifests → Kubernetes
         ↓
5. Application déployée!
```

## 📊 Monitoring

```bash
# Status des pods
kubectl get pods -n app-kid-dev
kubectl get pods -n app-kid-staging
kubectl get pods -n app-kid-prod

# Logs
kubectl logs -f deployment/backend -n app-kid-dev
kubectl logs -f deployment/frontend -n app-kid-dev

# Events
kubectl get events -n app-kid-dev --sort-by='.lastTimestamp'
```

## 🆘 Troubleshooting

### Voir les différences

```bash
kustomize build gitops/overlays/dev | kubectl diff -f -
```

### Valider les manifests

```bash
kustomize build gitops/overlays/prod | kubectl apply --dry-run=client -f -
```

### Rollback manuel

```bash
# Revenir à un commit précédent
git revert <commit-hash>
git push

# ArgoCD va automatiquement appliquer l'ancien état
```

## 📚 Ressources

- [Kustomize Documentation](https://kubectl.docs.kubernetes.io/references/kustomize/)
- [ArgoCD Best Practices](https://argo-cd.readthedocs.io/en/stable/user-guide/best_practices/)
- [GitOps Principles](https://opengitops.dev/)
