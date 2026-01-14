@echo off
REM Script d'installation automatique sur Windows

setlocal

echo ========================================
echo   Installation de l'application
echo ========================================
echo.

REM Verifier Docker
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERREUR] Docker n'est pas installe ou n'est pas dans le PATH
    echo.
    echo Installez Docker Desktop pour Windows:
    echo https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo [ERREUR] Docker Compose n'est pas installe
    echo Docker Compose est inclus avec Docker Desktop
    pause
    exit /b 1
)

echo [OK] Docker et Docker Compose detectes
echo.

REM Import des images
echo ========================================
echo   Import des images Docker...
echo ========================================
echo.

cd scripts
if exist import-images.ps1 (
    powershell -ExecutionPolicy Bypass -File import-images.ps1 -ImportDir ..\docker-images
) else if exist import-images.bat (
    call import-images.bat ..\docker-images
) else (
    echo [ERREUR] Script d'import non trouve
    pause
    exit /b 1
)
cd ..

REM Configuration
echo.
echo ========================================
echo   Configuration
echo ========================================
echo.

if not exist .env (
    if exist config\.env.example (
        copy config\.env.example .env
        echo [INFO] Fichier .env cree depuis l'exemple
        echo [WARN] Veuillez editer .env avant de continuer
        echo.
        echo Appuyez sur une touche apres avoir configure .env...
        pause >nul
    )
)

REM Demarrage
echo.
echo ========================================
echo   Demarrage de l'application...
echo ========================================
echo.

docker-compose up -d

echo.
echo ========================================
echo   Installation terminee!
echo ========================================
echo.
echo Statut des services:
docker-compose ps
echo.
echo Acces:
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:8000
echo.
echo Commandes utiles:
echo   Logs:     docker-compose logs -f
echo   Arreter:  docker-compose stop
echo   Restart:  docker-compose restart
echo.

pause
