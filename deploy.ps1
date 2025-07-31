# Craved Artisan Deployment Script
# This script prepares the application for deployment to Render

Write-Host "🚀 Preparing Craved Artisan for deployment..." -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "client") -or -not (Test-Path "server")) {
    Write-Host "❌ Error: Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

# Build client
Write-Host "📦 Building client..." -ForegroundColor Cyan
Set-Location client
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Client build failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Client built successfully" -ForegroundColor Green

# Build server
Write-Host "🔧 Building server..." -ForegroundColor Cyan
Set-Location ../server
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Server build failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Server built successfully" -ForegroundColor Green

# Check environment variables
Write-Host "🔍 Checking environment variables..." -ForegroundColor Cyan
if (Test-Path ".env") {
    Write-Host "✅ .env file found in server directory" -ForegroundColor Green
} else {
    Write-Host "⚠️  Warning: No .env file found in server directory" -ForegroundColor Yellow
    Write-Host "   Make sure to set environment variables in Render dashboard" -ForegroundColor Yellow
}

# Verify dist directories exist
Write-Host "📁 Verifying build outputs..." -ForegroundColor Cyan
if (Test-Path "../client/dist") {
    Write-Host "✅ Client dist directory exists" -ForegroundColor Green
} else {
    Write-Host "❌ Client dist directory not found" -ForegroundColor Red
    exit 1
}

if (Test-Path "dist") {
    Write-Host "✅ Server dist directory exists" -ForegroundColor Green
} else {
    Write-Host "❌ Server dist directory not found" -ForegroundColor Red
    exit 1
}

# Return to root
Set-Location ..

Write-Host "🎉 Deployment preparation complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Push your code to GitHub" -ForegroundColor White
Write-Host "2. Create a Render account at https://render.com" -ForegroundColor White
Write-Host "3. Follow the deployment guide in DEPLOYMENT.md" -ForegroundColor White
Write-Host "4. Deploy backend first, then frontend" -ForegroundColor White
Write-Host ""
Write-Host "📖 See DEPLOYMENT.md for detailed instructions" -ForegroundColor Yellow 