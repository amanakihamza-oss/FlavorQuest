@echo off
title FlavorQuest - Deploiment
echo ==========================================
echo   FlavorQuest - Mise a jour automatique
echo ==========================================

echo [1/4] Verification du statut...
git status
echo.

echo [2/4] Ajout des modifications...
git add .

echo [3/4] Sauvegarde...
set /p msg="Message de mise a jour (Entree pour 'Update'): "
if "%msg%"=="" set msg=Update
git commit -m "%msg%"

echo [4/4] Envoi vers GitHub...
git push

echo.
echo ==========================================
echo   Succes ! Vercel va mettre a jour le site.
echo   (Si 'Everything up-to-date', c'est que c'est deja bon !)
echo ==========================================
pause
