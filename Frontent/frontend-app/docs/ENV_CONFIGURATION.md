# Configuration des variables d'environnement

## 📁 Fichiers créés

- **`.env.development`** - Configuration pour développement local
- **`.env.production`** - Configuration pour production
- **`.env.example`** - Template de référence

## 🚀 Utilisation

### En développement

Vite charge automatiquement `.env.development` quand vous lancez :

```bash
npm run dev
```

L'API sera appelée sur `http://localhost:8000/api/`

### En production

Vite charge automatiquement `.env.production` quand vous buildez :

```bash
npm run build
```

⚠️ **Important** : Modifier l'URL dans `.env.production` avec votre vrai domaine de production.

## 🔧 Variables disponibles

| Variable | Description | Exemple |
|----------|-------------|---------|
| `VITE_API_URL` | URL de base de l'API Django | `http://localhost:8000/api/` |
| `VITE_DEBUG` | Mode debug (logs supplémentaires) | `true` ou `false` |

## 📝 Notes importantes

### Préfixe VITE_

Toutes les variables d'environnement **doivent** commencer par `VITE_` pour être accessibles côté client :

```javascript
// ✅ Fonctionne
const apiUrl = import.meta.env.VITE_API_URL;

// ❌ Ne fonctionne pas
const apiUrl = import.meta.env.API_URL;
```

### Redémarrage requis

Après modification d'un fichier `.env`, vous devez **redémarrer le serveur de développement** :

```bash
# Arrêter (Ctrl+C)
# Puis relancer
npm run dev
```

### Sécurité

- Les fichiers `.env` sont dans `.gitignore` (ne pas commiter)
- `.env.example` est versionné (template pour l'équipe)
- Ne jamais mettre de secrets sensibles (tokens, mots de passe)

## 🔍 Vérification

Pour vérifier que les variables sont bien chargées, ouvrez la console du navigateur :

```javascript
console.log('API URL:', import.meta.env.VITE_API_URL);
console.log('Debug mode:', import.meta.env.VITE_DEBUG);
```

## 🎯 Configuration du backend

N'oubliez pas de configurer CORS dans Django pour autoriser votre frontend :

### Backend - settings.py

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Vite dev
    "http://localhost:3000",  # Alternative
    "https://votre-domaine.com",  # Production
]
```

## 🌐 Déploiement

### Netlify / Vercel

Configurer les variables d'environnement dans leur interface :

```
VITE_API_URL=https://api.votre-domaine.com/api/
VITE_DEBUG=false
```

### Serveur classique (Nginx)

1. Builder avec les bonnes variables :
   ```bash
   VITE_API_URL=https://api.production.com/api/ npm run build
   ```

2. Ou créer `.env.production` sur le serveur avant le build

## 🧪 Tests

Pour tester avec une autre API temporairement :

```bash
# Créer .env.development.local (priorité sur .env.development)
echo "VITE_API_URL=http://192.168.1.10:8000/api/" > .env.development.local

# Ce fichier est ignoré par git
npm run dev
```

## 📊 Ordre de priorité des fichiers .env

Vite charge les fichiers dans cet ordre (le dernier écrase les précédents) :

1. `.env` - Toujours chargé
2. `.env.local` - Toujours chargé, ignoré par git
3. `.env.[mode]` - Ex: `.env.development` ou `.env.production`
4. `.env.[mode].local` - Ex: `.env.development.local`, ignoré par git

## ✅ Checklist de configuration

- [x] Créer `.env.development` avec URL locale
- [x] Créer `.env.production` avec URL production
- [x] Créer `.env.example` pour documentation
- [x] Vérifier `.gitignore` (fichiers .env ignorés)
- [ ] Modifier URL dans `.env.production` avec votre domaine
- [ ] Tester en dev (`npm run dev`)
- [ ] Configurer CORS dans Django backend
- [ ] Configurer variables sur plateforme de déploiement
