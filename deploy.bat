@echo off
echo ==========================================
echo   FlavorQuest - Mise a jour automatique
echo ==========================================

echo [1/3] Ajout des modifications...
git add .

echo [2/3] Sauvegarde...
set /p msg="Message de mise a jour (Entree pour 'Update'): "
if "%msg%"=="" set msg=Update
git commit -m "%msg%"

echo [3/3] Envoi vers GitHub...
git push

echo.
echo ==========================================
echo   Succes ! Netlify va mettre a jour le site.
echo ==========================================
pause
