# Craved Artisan Deployment Script
# This script helps prepare and verify the deployment to Render

Write-Host "Craved Artisan Deployment Preparation" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "Error: Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

Write-Host "Found project root" -ForegroundColor Green

# Verify backend build
Write-Host "Verifying backend build..." -ForegroundColor Yellow
if (Test-Path "server") {
    Set-Location server
    Write-Host "Installing server dependencies..." -ForegroundColor Cyan
    npm install
    
    Write-Host "Building server..." -ForegroundColor Cyan
    npm run build
    
    if (Test-Path "dist/index.js") {
        Write-Host "Backend build successful" -ForegroundColor Green
    } else {
        Write-Host "Backend build failed" -ForegroundColor Red
        exit 1
    }
    Set-Location ..
} else {
    Write-Host "Server directory not found" -ForegroundColor Red
    exit 1
}

# Verify frontend build
Write-Host "Verifying frontend build..." -ForegroundColor Yellow
if (Test-Path "client") {
    Set-Location client
    Write-Host "Installing client dependencies..." -ForegroundColor Cyan
    npm install
    
    Write-Host "Building client..." -ForegroundColor Cyan
    npm run build
    
    if (Test-Path "dist") {
        Write-Host "Frontend build successful" -ForegroundColor Green
    } else {
        Write-Host "Frontend build failed" -ForegroundColor Red
        exit 1
    }
    Set-Location ..
} else {
    Write-Host "Client directory not found" -ForegroundColor Red
    exit 1
}

# Check environment variables
Write-Host "Checking environment variables..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host ".env file found" -ForegroundColor Green
    
    $envContent = Get-Content ".env"
    $requiredVars = @("DATABASE_URL", "SESSION_SECRET", "NODE_ENV")
    
    foreach ($var in $requiredVars) {
        if ($envContent -match "^$var=") {
            Write-Host "$var is set" -ForegroundColor Green
        } else {
            Write-Host "$var is missing" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host ".env file not found - you'll need to set environment variables in Render dashboard" -ForegroundColor Yellow
}

# Display deployment information
Write-Host "Deployment Information" -ForegroundColor Green
Write-Host "=====================" -ForegroundColor Green
Write-Host "Backend Build Command: cd server; npm install; npm run build" -ForegroundColor Cyan
Write-Host "Backend Start Command: cd server; npm start" -ForegroundColor Cyan
Write-Host "Frontend Build Command: cd client; npm install; npm run build" -ForegroundColor Cyan
Write-Host "Frontend Publish Directory: client/dist" -ForegroundColor Cyan
Write-Host "Health Check Endpoint: /health" -ForegroundColor Cyan

Write-Host "Next Steps:" -ForegroundColor Green
Write-Host "1. Push your code to GitHub" -ForegroundColor White
Write-Host "2. Go to https://dashboard.render.com" -ForegroundColor White
Write-Host "3. Create a new Web Service for the backend" -ForegroundColor White
Write-Host "4. Create a new Static Site for the frontend" -ForegroundColor White
Write-Host "5. Set environment variables in Render dashboard" -ForegroundColor White
Write-Host "6. Deploy and test!" -ForegroundColor White

Write-Host "See DEPLOYMENT.md for detailed instructions" -ForegroundColor Cyan
Write-Host "Deployment preparation complete!" -ForegroundColor Green 