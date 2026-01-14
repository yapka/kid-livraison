# Script d'installation automatique sur Windows (PowerShell)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Installation de l'application" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verifier Docker
try {
    $dockerVersion = docker --version
    Write-Host "[OK] Docker detecte: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERREUR] Docker n'est pas installe ou n'est pas dans le PATH" -ForegroundColor Red
    Write-Host ""
    Write-Host "Installez Docker Desktop pour Windows:" -ForegroundColor Yellow
    Write-Host "https://www.docker.com/products/docker-desktop"
    pause
    exit 1
}

try {
    $composeVersion = docker-compose --version
    Write-Host "[OK] Docker Compose detecte: $composeVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERREUR] Docker Compose n'est pas installe" -ForegroundColor Red
    Write-Host "Docker Compose est inclus avec Docker Desktop" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host ""

# Import des images
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Import des images Docker..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Set-Location scripts
if (Test-Path "import-images.ps1") {
    & .\import-images.ps1 -ImportDir "..\docker-images"
} elseif (Test-Path "import-images.bat") {
    & cmd /c import-images.bat ..\docker-images
} else {
    Write-Host "[ERREUR] Script d'import non trouve" -ForegroundColor Red
    pause
    exit 1
}
Set-Location ..

# Configuration
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Configuration" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path ".env")) {
    if (Test-Path "config\.env.example") {
        Copy-Item "config\.env.example" ".env"
        Write-Host "[INFO] Fichier .env cree depuis l'exemple" -ForegroundColor Yellow
        Write-Host "[WARN] Veuillez editer .env avant de continuer" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Appuyez sur une touche apres avoir configure .env..." -ForegroundColor Yellow
        pause
    }
}

# Demarrage
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Demarrage de l'application..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

docker-compose up -d

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Installation terminee!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Statut des services:" -ForegroundColor Cyan
docker-compose ps
Write-Host ""
Write-Host "Acces:" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:3000"
Write-Host "  Backend:  http://localhost:8000"
Write-Host ""
Write-Host "Commandes utiles:" -ForegroundColor Cyan
Write-Host "  Logs:     docker-compose logs -f"
Write-Host "  Arreter:  docker-compose stop"
Write-Host "  Restart:  docker-compose restart"
Write-Host ""

pause
