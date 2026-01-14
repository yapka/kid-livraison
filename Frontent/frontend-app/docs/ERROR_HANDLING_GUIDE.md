# Guide d'utilisation du système de gestion d'erreurs

## 📚 Vue d'ensemble

Le système de gestion d'erreurs amélioré comprend :

1. **Utilitaire d'extraction d'erreurs** (`utils/errorHandler.js`)
2. **Système de notifications Toast** (`contexts/ToastContext.jsx`, `components/Toast.jsx`)
3. **Hook personnalisé** (`hooks/useErrorHandler.js`)
4. **ErrorBoundary React** (`components/ErrorBoundary.jsx`)
5. **Intercepteur Axios amélioré** (dans `services/auth.js`)

## 🚀 Utilisation dans les composants

### Méthode 1 : Avec le hook `useErrorHandler`

```jsx
import { useErrorHandler } from '../hooks/useErrorHandler';
import { useToast } from '../contexts/ToastContext';

function MyComponent() {
  const { handleError, withErrorHandling } = useErrorHandler();
  const toast = useToast();

  const fetchData = async () => {
    try {
      const data = await someApiCall();
      toast.success('Données chargées avec succès !');
    } catch (error) {
      // Gestion automatique avec toast
      handleError(error, {
        context: 'Chargement des données',
        showToast: true,
      });
    }
  };

  // OU avec wrapper automatique
  const loadData = async () => {
    const { data, error } = await withErrorHandling(
      () => someApiCall(),
      {
        showSuccessToast: true,
        successMessage: 'Données chargées !',
        context: 'Chargement'
      }
    );
    
    if (error) {
      // L'erreur a déjà été affichée via toast
      return;
    }
    
    // Utiliser data
  };
}
```

### Méthode 2 : Toast directement

```jsx
import { useToast } from '../contexts/ToastContext';

function MyComponent() {
  const toast = useToast();

  const handleAction = () => {
    // Différents types de notifications
    toast.success('Opération réussie !');
    toast.error('Une erreur est survenue');
    toast.warning('Attention !');
    toast.info('Information');

    // Avec titre personnalisé et durée
    toast.addToast({
      type: 'success',
      title: 'Bravo !',
      message: 'Le colis a été créé',
      duration: 3000
    });
  };
}
```

### Méthode 3 : Gestion des erreurs de validation

```jsx
import { useErrorHandler } from '../hooks/useErrorHandler';

function MyForm() {
  const { handleValidationError } = useErrorHandler();
  const [errors, setErrors] = useState({});

  const handleSubmit = async (data) => {
    try {
      await createResource(data);
    } catch (error) {
      if (error.response?.status === 400) {
        // Extraire les erreurs par champ
        const fieldErrors = handleValidationError(error);
        setErrors(fieldErrors);
        // Ex: { poids: "Ce champ est obligatoire", ... }
      }
    }
  };
}
```

## 🔧 Amélioration des services

Les services ont été améliorés pour enrichir les erreurs :

```javascript
// Dans colisService.js
export const getAllColis = async () => {
  try {
    const response = await apiClient.get('/colis/');
    return response.data;
  } catch (error) {
    const errorInfo = extractErrorMessage(error);
    error.userMessage = errorInfo.message;
    error.userDetails = errorInfo.details;
    throw error;
  }
};
```

Maintenant les erreurs contiennent :
- `error.userMessage` : Message principal
- `error.userDetails` : Détails formatés
- Traduction automatique des champs

## 🎨 Personnalisation des messages

### Traduction des champs

Modifier `utils/errorHandler.js` fonction `translateFieldName` :

```javascript
const translations = {
  mon_champ: 'Mon Champ Personnalisé',
  // ...
};
```

### Types de toasts

4 types disponibles :
- `success` (vert) - 5s
- `error` (rouge) - 7s
- `warning` (jaune) - 5s
- `info` (bleu) - 5s

## 📱 Position et style des toasts

Les toasts apparaissent en haut à droite avec :
- Animation slide-in
- Fermeture automatique
- Fermeture manuelle (X)
- Support multi-toasts empilés

## 🛡️ ErrorBoundary

Protège l'application des erreurs React :

```jsx
// Déjà intégré dans App.jsx
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

En cas d'erreur React :
- Affiche une page d'erreur propre
- Boutons "Retour accueil" et "Recharger"
- Détails en mode dev

## 🔍 Débogage

En mode développement (`import.meta.env.DEV`) :

1. **Console groupée** pour chaque erreur :
   ```
   🔴 Erreur - Chargement des colis
     Erreur originale: [Object]
     Message utilisateur: "Données invalides"
     Détails: "Poids: Doit être supérieur à 0"
   ```

2. **Intercepteur Axios** log toutes les erreurs API

3. **ErrorBoundary** affiche la stack trace

## ✅ Checklist migration

Pour migrer un composant existant :

- [ ] Importer `useErrorHandler` et `useToast`
- [ ] Remplacer `console.error` par `handleError`
- [ ] Remplacer `alert()` par `toast.success/error/warning`
- [ ] Utiliser `handleValidationError` pour formulaires
- [ ] Tester en mode dev (voir les logs)
- [ ] Tester les cas d'erreur (400, 401, 500, network)

## 🎯 Exemples de cas d'usage

### Création de ressource
```jsx
const handleCreate = async (formData) => {
  const { data, error } = await withErrorHandling(
    () => createColis(formData),
    {
      showSuccessToast: true,
      successMessage: 'Colis créé avec succès !',
      context: 'Création de colis'
    }
  );
  
  if (error) return;
  navigate('/colis');
};
```

### Suppression avec confirmation
```jsx
const handleDelete = async (id) => {
  if (!confirm('Supprimer ?')) return;
  
  try {
    await deleteColis(id);
    toast.success('Colis supprimé');
    refreshList();
  } catch (error) {
    handleError(error, { showToast: true });
  }
};
```

### Chargement de liste
```jsx
const fetchList = async () => {
  setLoading(true);
  try {
    const data = await getAllColis();
    setData(data);
  } catch (error) {
    handleError(error, {
      context: 'Chargement',
      showToast: true
    });
  } finally {
    setLoading(false);
  }
};
```

## 🚨 Codes HTTP gérés

| Code | Message | Action |
|------|---------|--------|
| 400 | Données invalides | Toast warning + détails champs |
| 401 | Non authentifié | Refresh token auto + redirect login |
| 403 | Accès refusé | Toast warning |
| 404 | Non trouvé | Toast error |
| 500 | Erreur serveur | Toast error |
| Network | Connexion impossible | Toast error spécial |
