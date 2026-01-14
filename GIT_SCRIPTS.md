# Scripts Git - Guide d'utilisation

## 📦 Frontend

### `git-push.sh` - Push avec confirmation
```bash
# Avec message personnalisé
./git-push.sh "Fix: correction du bug XYZ"

# Avec message automatique (date/heure)
./git-push.sh
```

### `quick-push.sh` - Push rapide sans confirmation
```bash
# Push rapide avec message auto
./quick-push.sh

# Push rapide avec message personnalisé
./quick-push.sh "Update components"
```

### `build-and-push.sh` - Build puis push
```bash
# Build, test et push
./build-and-push.sh "Release v1.2.3"
```

## 🚀 Projet complet

### `push-all.sh` - Push tout (root + frontend + backend)
```bash
cd /home/nathanael/projet_Livraison

# Push tous les modules
./push-all.sh "Global update"
```

## 💡 Alias Git recommandés

Ajoutez dans `~/.zshrc` ou `~/.bashrc`:

```bash
# Frontend
alias fp='cd /home/nathanael/projet_Livraison/Frontent/frontend-app && ./quick-push.sh'
alias fgp='cd /home/nathanael/projet_Livraison/Frontent/frontend-app && ./git-push.sh'
alias fbp='cd /home/nathanael/projet_Livraison/Frontent/frontend-app && ./build-and-push.sh'

# Backend
alias bp='cd /home/nathanael/projet_Livraison/Backend && git add . && git commit -m "Update: $(date +%Y-%m-%d\ %H:%M:%S)" && git push'

# Projet complet
alias pushall='cd /home/nathanael/projet_Livraison && ./push-all.sh'

# Quick commits
alias gc='git commit -m'
alias gp='git push'
alias gs='git status'
alias ga='git add .'
alias gac='git add . && git commit -m'
alias gacp='git add . && git commit -m "$1" && git push'
```

Puis:
```bash
source ~/.zshrc
```

## 🎯 Utilisation rapide

```bash
# Dans le dossier frontend
cd /home/nathanael/projet_Livraison/Frontent/frontend-app

# Push rapide
./quick-push.sh "Fix: bouton login"

# Ou avec les alias
fp "Fix: bouton login"
```

## 📋 Workflow recommandé

### Développement quotidien:
```bash
# Travailler sur le code...
# Puis push rapide
./quick-push.sh
```

### Avant un merge/pull request:
```bash
# Build + test + push
./build-and-push.sh "Feature: nouvelle page dashboard"
```

### Mise à jour globale:
```bash
# Depuis la racine du projet
./push-all.sh "Release v2.0.0"
```
