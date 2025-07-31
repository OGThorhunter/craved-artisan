# Craved Artisan Setup Script
# This script helps set up the development environment

Write-Host "🚀 Setting up Craved Artisan Development Environment..." -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Host "✅ npm found: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not found. Please install npm first." -ForegroundColor Red
    exit 1
}

# Create .env file if it doesn't exist
if (-not (Test-Path ".env")) {
    Write-Host "📝 Creating .env file from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ .env file created. Please update it with your configuration." -ForegroundColor Green
} else {
    Write-Host "✅ .env file already exists." -ForegroundColor Green
}

# Install root dependencies
Write-Host "📦 Installing root dependencies..." -ForegroundColor Yellow
npm install

# Install client dependencies
Write-Host "📦 Installing client dependencies..." -ForegroundColor Yellow
Set-Location "client"
npm install
Set-Location ".."

# Install server dependencies
Write-Host "📦 Installing server dependencies..." -ForegroundColor Yellow
Set-Location "server"
npm install
Set-Location ".."

# Install prisma dependencies
Write-Host "📦 Installing Prisma dependencies..." -ForegroundColor Yellow
Set-Location "prisma"
npm install
Set-Location ".."

# Generate Prisma client
Write-Host "🔧 Generating Prisma client..." -ForegroundColor Yellow
Set-Location "prisma"
npx prisma generate
Set-Location ".."

Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Update .env file with your database URL and other configuration" -ForegroundColor White
Write-Host "2. Run 'npm run db:migrate' to set up the database" -ForegroundColor White
Write-Host "3. Run 'npm run dev' to start both client and server" -ForegroundColor White
Write-Host ""
Write-Host "Happy coding! 🎉" -ForegroundColor Green 