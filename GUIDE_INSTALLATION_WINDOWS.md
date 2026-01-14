# 🚀 Installation sur Windows - Guide Client

## Prérequis Windows

### 1. Installer Docker Desktop pour Windows

**Télécharger:** https://www.docker.com/products/docker-desktop

**Configuration minimale:**
- Windows 10 64-bit: Pro, Enterprise, ou Education (Build 19041 ou supérieur)
- Ou Windows 11
- WSL 2 activé (Windows Subsystem for Linux)
- 4 GB RAM minimum
- Virtualisation activée dans le BIOS

### 2. Activer WSL 2 (si pas déjà fait)

Ouvrir PowerShell en tant qu'administrateur et exécuter:

```powershell
wsl --install
```

Redémarrer l'ordinateur après l'installation.

### 3. Vérifier l'installation

Ouvrir PowerShell et vérifier:

```powershell
docker --version
docker-compose --version
```

---

## 📦 Installation de l'Application

### Méthode 1: Installation automatique avec PowerShell (RECOMMANDÉ)

1. **Extraire l'archive**
   ```powershell
   # Clic droit sur client-package-YYYYMMDD.zip > Extraire tout
   # Ou en ligne de commande:
   Expand-Archive -Path client-package-*.zip -DestinationPath C:\Apps\MonApp
   ```

2. **Naviguer vers le dossier**
   ```powershell
   cd C:\Apps\MonApp
   ```

3. **Exécuter l'installation**
   ```powershell
   # Clic droit sur install.ps1 > Exécuter avec PowerShell
   # Ou:
   powershell -ExecutionPolicy Bypass -File .\install.ps1
   ```

### Méthode 2: Installation avec fichier batch

Double-cliquez sur `install.bat` ou:

```cmd
install.bat
```

### Méthode 3: Installation manuelle

#### Étape 1: Import des images

```powershell
cd scripts
.\import-images.ps1 -ImportDir ..\docker-images
cd ..
```

Ou avec CMD:
```cmd
cd scripts
import-images.bat ..\docker-images
cd ..
```

#### Étape 2: Configuration

```powershell
# Copier le fichier d'exemple
copy config\.env.example .env

# Éditer avec Notepad
notepad .env
```

Modifier les variables:
- `POSTGRES_PASSWORD`: Mot de passe PostgreSQL
- `DJANGO_SECRET_KEY`: Clé secrète Django
- `FRONTEND_PORT`: Port du frontend (défaut: 3000)
- `BACKEND_PORT`: Port du backend (défaut: 8000)

#### Étape 3: Démarrage

```powershell
docker-compose up -d
```

---

## 🔧 Commandes Utiles Windows

### PowerShell

```powershell
# Démarrer l'application
docker-compose up -d

# Arrêter l'application
docker-compose stop

# Redémarrer
docker-compose restart

# Voir les logs
docker-compose logs -f

# Voir les logs d'un service spécifique
docker-compose logs -f backend

# Statut des services
docker-compose ps

# Arrêter et supprimer
docker-compose down

# Arrêter et supprimer (avec volumes)
docker-compose down -v
```

### CMD (Invite de commandes)

Les mêmes commandes fonctionnent également dans CMD.

---

## ⚠️ Résolution de Problèmes Windows

### Docker Desktop ne démarre pas

1. **Vérifier WSL 2:**
   ```powershell
   wsl --list --verbose
   ```

2. **Mettre à jour WSL:**
   ```powershell
   wsl --update
   ```

3. **Redémarrer Docker Desktop:**
   - Clic droit sur l'icône Docker dans la barre des tâches
   - Quitter
   - Relancer Docker Desktop

### Erreur "Virtualisation désactivée"

1. Redémarrer et entrer dans le BIOS (F2, F10, ou DEL selon le PC)
2. Chercher "Virtualization Technology" ou "Intel VT-x" ou "AMD-V"
3. Activer l'option
4. Sauvegarder et redémarrer

### Erreur "Port déjà utilisé"

```powershell
# Trouver quel processus utilise le port 3000
netstat -ano | findstr :3000

# Tuer le processus (remplacer PID par le numéro)
taskkill /PID [numéro] /F

# Ou changer les ports dans .env
notepad .env
```

### Permission denied / Access denied

Lancer PowerShell ou CMD **en tant qu'administrateur**:
- Clic droit sur PowerShell/CMD
- "Exécuter en tant qu'administrateur"

### Script PowerShell bloqué

```powershell
# Permettre l'exécution pour cette session
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process

# Puis relancer le script
.\install.ps1
```

### Les conteneurs ne démarrent pas

```powershell
# Vérifier les logs
docker-compose logs

# Vérifier Docker Desktop
# Ouvrir Docker Desktop et vérifier qu'il est bien démarré

# Redémarrer Docker
# Via l'interface Docker Desktop ou:
Restart-Service docker
```

---

## 🌐 Accès à l'Application

Une fois l'installation terminée:

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **Admin Django:** http://localhost:8000/admin

Ouvrir dans votre navigateur préféré (Chrome, Firefox, Edge).

---

## 📁 Structure du Package Windows

```
client-package/
├── install.bat              # Installation automatique (CMD)
├── install.ps1              # Installation automatique (PowerShell)
├── docker-compose.yml       # Configuration Docker Compose
├── README_INSTALLATION.md   # Guide général
├── config/
│   └── .env.example        # Exemple de configuration
├── scripts/
│   ├── import-images.bat   # Import des images (CMD)
│   ├── import-images.ps1   # Import des images (PowerShell)
│   └── import-images.sh    # Import des images (Linux/Mac)
└── docker-images/
    ├── backend-app.tar.gz  # Image Docker du backend
    ├── frontend-app.tar.gz # Image Docker du frontend
    ├── postgres.tar.gz     # Image PostgreSQL
    └── nginx.tar.gz        # Image Nginx
```

---

## 🔐 Configuration Firewall Windows

Si vous devez accéder à l'application depuis d'autres machines:

```powershell
# Ouvrir PowerShell en tant qu'administrateur

# Autoriser le port 3000 (frontend)
New-NetFirewallRule -DisplayName "Docker Frontend" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow

# Autoriser le port 8000 (backend)
New-NetFirewallRule -DisplayName "Docker Backend" -Direction Inbound -LocalPort 8000 -Protocol TCP -Action Allow
```

---

## 💾 Sauvegarde et Restauration (Windows)

### Sauvegarder la base de données

```powershell
docker-compose exec db pg_dump -U user dbname > backup_$(Get-Date -Format "yyyyMMdd").sql
```

### Restaurer la base de données

```powershell
Get-Content backup_20251227.sql | docker-compose exec -T db psql -U user dbname
```

### Sauvegarder les volumes Docker

```powershell
docker run --rm -v projet_livraison_postgres_data:/data -v ${PWD}:/backup alpine tar czf /backup/postgres_backup.tar.gz /data
```

---

## 🚀 Démarrage Automatique au Boot Windows

### Méthode 1: Planificateur de tâches

1. Ouvrir "Planificateur de tâches"
2. "Créer une tâche..."
3. Onglet "Général": Cocher "Exécuter même si l'utilisateur n'est pas connecté"
4. Onglet "Déclencheurs": "Au démarrage"
5. Onglet "Actions": 
   - Programme: `powershell.exe`
   - Arguments: `-File C:\Apps\MonApp\scripts\start-app.ps1`

### Méthode 2: Script de démarrage

Créer `start-app.ps1`:

```powershell
cd C:\Apps\MonApp
docker-compose up -d
```

Placer un raccourci dans:
`C:\ProgramData\Microsoft\Windows\Start Menu\Programs\StartUp`

---

## 📞 Support

### Vérification du système

```powershell
# Informations système
systeminfo

# Version Windows
winver

# Vérifier Docker
docker info
docker-compose version

# Espace disque
Get-PSDrive C
```

### Logs Docker Desktop

Fichier de log: `%APPDATA%\Docker\log.txt`

---

## ✅ Checklist Installation Windows

- [ ] Windows 10/11 64-bit
- [ ] WSL 2 installé et activé
- [ ] Virtualisation activée dans le BIOS
- [ ] Docker Desktop installé et démarré
- [ ] Package client extrait
- [ ] Images Docker importées
- [ ] Fichier .env configuré
- [ ] Application démarrée avec docker-compose
- [ ] Accès web vérifié (http://localhost:3000)

---

**Durée d'installation estimée sur Windows: 15-30 minutes**

(Incluant l'installation de Docker Desktop si nécessaire)
