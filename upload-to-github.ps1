Write-Host "🚀 Uploading Meteora Token Launcher to GitHub..." -ForegroundColor Green
Write-Host ""

# Initialize git repository
Write-Host "📁 Initializing Git repository..." -ForegroundColor Yellow
git init

# Add remote repository
Write-Host "🔗 Adding GitHub remote..." -ForegroundColor Yellow
git remote add origin https://github.com/ledgone09/metoeora.git

# Add all files
Write-Host "📦 Adding all files..." -ForegroundColor Yellow
git add .

# Commit files
Write-Host "💾 Committing files..." -ForegroundColor Yellow
git commit -m "Initial commit: Meteora Token Launcher with Render.com deployment"

# Push to GitHub
Write-Host "🚀 Pushing to GitHub..." -ForegroundColor Yellow
git branch -M main
git push -u origin main

Write-Host ""
Write-Host "✅ Upload complete!" -ForegroundColor Green
Write-Host "🌐 Repository: https://github.com/ledgone09/metoeora" -ForegroundColor Cyan
Write-Host "📖 Deployment Guide: RENDER_DEPLOYMENT.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎯 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Go to render.com"
Write-Host "2. Connect your GitHub repository"
Write-Host "3. Follow the deployment guide"
Write-Host ""
Read-Host "Press Enter to continue" 