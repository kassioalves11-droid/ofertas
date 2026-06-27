@echo off
cd /d "%~dp0"

echo ================================
echo PUBLICANDO VIDEOS NO GITHUB
echo ================================

git add videos/

git diff --cached --quiet
if not errorlevel 1 (
    echo Nenhum video novo para publicar.
    pause
    exit /b
)

git commit -m "Atualiza videos"
git push origin main

echo.
echo FINALIZADO.
pause
