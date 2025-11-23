@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   NALLA INK - Démarrage du site
echo ========================================
echo.

cd Backend

echo 🚀 Démarrage du serveur...
echo.
echo ⏳ Le site sera accessible dans quelques secondes...
echo.
echo 📍 URL du site : http://localhost:3000
echo 🔐 Admin : http://localhost:3000/admin.html
echo.
echo ⚠️  NE FERMEZ PAS CETTE FENÊTRE !
echo    Le site fonctionnera tant que cette fenêtre reste ouverte.
echo.
echo ========================================
echo.

node server.js

pause
