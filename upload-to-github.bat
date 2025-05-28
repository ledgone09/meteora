@echo off
echo 🚀 Uploading Meteora Token Launcher to GitHub...
echo.

REM Initialize git repository
echo 📁 Initializing Git repository...
git init

REM Add remote repository
echo 🔗 Adding GitHub remote...
git remote add origin https://github.com/ledgone09/metoeora.git

REM Add all files
echo 📦 Adding all files...
git add .

REM Commit files
echo 💾 Committing files...
git commit -m "Initial commit: Meteora Token Launcher with Render.com deployment"

REM Push to GitHub
echo 🚀 Pushing to GitHub...
git branch -M main
git push -u origin main

echo.
echo ✅ Upload complete!
echo 🌐 Repository: https://github.com/ledgone09/metoeora
echo 📖 Deployment Guide: RENDER_DEPLOYMENT.md
echo.
echo 🎯 Next Steps:
echo 1. Go to render.com
echo 2. Connect your GitHub repository
echo 3. Follow the deployment guide
echo.
pause 