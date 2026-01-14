@echo off
REM Script d'import des images Docker sur Windows
REM A executer sur la machine du CLIENT

setlocal enabledelayedexpansion

set "IMPORT_DIR=%~1"
if "%IMPORT_DIR%"=="" set "IMPORT_DIR=.\docker-export"

echo ========================================
echo   Import des images Docker
echo ========================================
echo.

if not exist "%IMPORT_DIR%" (
    echo [ERREUR] Dossier %IMPORT_DIR% non trouve!
    echo Usage: %~nx0 [chemin-vers-docker-export]
    exit /b 1
)

cd /d "%IMPORT_DIR%"

echo Import depuis: %IMPORT_DIR%
echo.

REM Fonction pour importer une image
call :import_image "backend-app.tar.gz" "backend-app"
call :import_image "frontend-app.tar.gz" "frontend-app"
call :import_image "postgres.tar.gz" "postgres"
call :import_image "nginx.tar.gz" "nginx"

echo.
echo ========================================
echo   Import termine!
echo ========================================
echo.
echo Images Docker disponibles:
docker images | findstr /i "backend-app frontend-app postgres nginx"
echo.
echo Prochaine etape:
echo Lancez l'application avec: docker-compose up -d
echo.

pause
exit /b 0

:import_image
set "tar_file=%~1"
set "image_name=%~2"

if exist "%tar_file%" (
    echo [INFO] Import de %tar_file%...
    docker load -i "%tar_file%"
    echo [OK] %image_name% importe
    echo.
) else (
    echo [WARN] %tar_file% non trouve, ignore
)
exit /b 0
