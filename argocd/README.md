# Structure ArgoCD - KID Livraison

Ce dossier contient les définitions des Applications ArgoCD pour les différents environnements.

## 📁 Fichiers

- **appproject.yaml** - Définition du projet ArgoCD avec RBAC et restrictions
- **application-dev.yaml** - Application pour l'environnement de développement
- **application-staging.yaml** - Application pour l'environnement de staging
- **application-prod.yaml** - Application pour l'environnement de production

## 🚀 Déploiement

### Ordre de déploiement

1. **Créer le projet d'abord:**
   ```bash
   kubectl apply -f appproject.yaml
   ```

2. **Déployer les applications:**
   ```bash
   # Dev
   kubectl apply -f application-dev.yaml
   
   # Staging
   kubectl apply -f application-staging.yaml
   
   # Production
   kubectl apply -f application-prod.yaml
   ```

### Vérification

```bash
# Lister les applications
kubectl get applications -n argocd

# Détails d'une application
kubectl describe application kid-livraison-dev -n argocd

# Via ArgoCD CLI
argocd app list
argocd app get kid-livraison-dev
```

## ⚙️ Configuration requise

Avant de déployer, modifier dans chaque fichier `application-*.yaml`:

```yaml
spec:
  source:
    repoURL: https://github.com/VOTRE_ORG/VOTRE_REPO.git  # ← À CHANGER
```

## 🔐 Sécurité

Le fichier `appproject.yaml` définit:

- ✅ Sources Git autorisées
- ✅ Destinations Kubernetes autorisées
- ✅ Types de ressources autorisées
- ✅ Rôles et permissions RBAC
- ✅ Fenêtres de synchronisation

### Rôles définis

- **dev-role** - Pour les développeurs (sync dev uniquement)
- **ops-role** - Pour les ops (accès complet)

## 🌍 Environnements

| Application            | Branch  | Namespace       | Auto-sync | Self-heal |
|------------------------|---------|-----------------|-----------|-----------|
| kid-livraison-dev      | develop | app-kid-dev     | ✅        | ✅        |
| kid-livraison-staging  | staging | app-kid-staging | ✅        | ✅        |
| kid-livraison-prod     | main    | app-kid-prod    | ❌        | ❌        |

## 📝 Notes

- **Production** utilise un sync manuel pour plus de contrôle
- Les secrets doivent être chiffrés (Sealed Secrets recommandé)
- Les health checks sont configurés automatiquement
- Les rollback sont supportés via l'historique Git
