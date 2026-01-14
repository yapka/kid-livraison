# Script d'import des images Docker sur Windows (PowerShell)
# A executer sur la machine du CLIENT

param(
    [string]$ImportDir = ".\docker-export"
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Yellow
Write-Host "  Import des images Docker" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""

if (-not (Test-Path $ImportDir)) {
    Write-Host "[ERREUR] Dossier $ImportDir non trouve!" -ForegroundColor Red
    Write-Host "Usage: .\import-images.ps1 [-ImportDir chemin-vers-docker-export]"
    exit 1
}

Set-Location $ImportDir

Write-Host "Import depuis: $ImportDir" -ForegroundColor Cyan
Write-Host ""

function Import-DockerImage {
    param(
        [string]$TarFile,
        [string]$ImageName
    )
    
    if (Test-Path $TarFile) {
        Write-Host "[INFO] Import de $TarFile..." -ForegroundColor Yellow
        
        # Decompresser et importer
        if ($TarFile -match "\.gz$") {
            # Si c'est un .tar.gz, on doit d'abord decompresser
            $tarFileUncompressed = $TarFile -replace "\.gz$", ""
            
            # Utiliser 7-Zip ou PowerShell pour decompresser
            if (Get-Command 7z -ErrorAction SilentlyContinue) {
                7z e $TarFile -o. -y | Out-Null
                docker load -i $tarFileUncompressed
                Remove-Item $tarFileUncompressed -Force
            } else {
                # Fallback: utiliser docker directement avec gunzip si disponible
                Write-Host "[WARN] 7-Zip non trouve. Essai avec gunzip..." -ForegroundColor Yellow
                docker load -i $TarFile
            }
        } else {
            docker load -i $TarFile
        }
        
        Write-Host "[OK] $ImageName importe" -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host "[WARN] $TarFile non trouve, ignore" -ForegroundColor Yellow
    }
}

# Importer les images
Import-DockerImage -TarFile "backend-app.tar.gz" -ImageName "backend-app"
Import-DockerImage -TarFile "frontend-app.tar.gz" -ImageName "frontend-app"
Import-DockerImage -TarFile "postgres.tar.gz" -ImageName "postgres"
Import-DockerImage -TarFile "nginx.tar.gz" -ImageName "nginx"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Import termine!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Images Docker disponibles:" -ForegroundColor Cyan
docker images | Select-String -Pattern "backend-app|frontend-app|postgres|nginx"
Write-Host ""
Write-Host "Prochaine etape:" -ForegroundColor Yellow
Write-Host "Lancez l'application avec: docker-compose up -d"
Write-Host ""

pause
