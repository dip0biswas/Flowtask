# Quick Deployment Preparation Script
# Run this before deploying to check everything

Write-Host "`n🚀 FlowTask Deployment Preparation" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Check if git is initialized
Write-Host "`n1️⃣ Checking Git..." -ForegroundColor Yellow
if (Test-Path ".git") {
    Write-Host "   ✅ Git initialized" -ForegroundColor Green
} else {
    Write-Host "   ❌ Git not initialized. Run: git init" -ForegroundColor Red
}

# Check important files exist
Write-Host "`n2️⃣ Checking Files..." -ForegroundColor Yellow

$files = @(
    "backend/package.json",
    "backend/server.js",
    "backend/.env",
    "frontend/package.json",
    "frontend/vite.config.js"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "   ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $file missing!" -ForegroundColor Red
    }
}

# Create .gitignore if it doesn't exist
Write-Host "`n3️⃣ Checking .gitignore..." -ForegroundColor Yellow
if (!(Test-Path ".gitignore")) {
    Write-Host "   Creating .gitignore..." -ForegroundColor Yellow
    @"
node_modules/
.env
dist/
.DS_Store
*.log
.vscode/
"@ | Out-File -FilePath ".gitignore" -Encoding utf8
    Write-Host "   ✅ .gitignore created" -ForegroundColor Green
} else {
    Write-Host "   ✅ .gitignore exists" -ForegroundColor Green
}

# Test backend build
Write-Host "`n4️⃣ Testing Backend..." -ForegroundColor Yellow
Push-Location backend
$backendTest = npm list 2>&1
if ($?) {
    Write-Host "   ✅ Backend dependencies OK" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Run: cd backend && npm install" -ForegroundColor Yellow
}
Pop-Location

# Test frontend build
Write-Host "`n5️⃣ Testing Frontend Build..." -ForegroundColor Yellow
Push-Location frontend
Write-Host "   Building... (this may take a minute)" -ForegroundColor Gray
$buildResult = npm run build 2>&1
if ($?) {
    Write-Host "   ✅ Frontend builds successfully!" -ForegroundColor Green
} else {
    Write-Host "   ❌ Build failed. Check errors above." -ForegroundColor Red
}
Pop-Location

# Summary
Write-Host "`n📋 Next Steps:" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "1. Create GitHub repository" -ForegroundColor White
Write-Host "2. Push code: git add . && git commit -m 'Deploy' && git push" -ForegroundColor White
Write-Host "3. Deploy backend to Render.com" -ForegroundColor White
Write-Host "4. Deploy frontend to Vercel.com" -ForegroundColor White
Write-Host "5. Update CORS with frontend URL" -ForegroundColor White
Write-Host "`n📖 Full guide: DEPLOYMENT-GUIDE.md" -ForegroundColor Green
Write-Host "`nPress Enter to continue..."
Read-Host
