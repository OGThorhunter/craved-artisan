# Start Mock Server Script
# This script starts the mock server and checks for any startup issues

Write-Host "🚀 Starting Mock Server..." -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Check if we're in the right directory
if (-not (Test-Path "server")) {
    Write-Host "❌ Error: 'server' directory not found. Please run this script from the project root." -ForegroundColor Red
    exit 1
}

# Check if tsx is available
try {
    $tsxVersion = npx tsx --version 2>$null
    Write-Host "✅ tsx is available" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: tsx is not available. Please install it first." -ForegroundColor Red
    Write-Host "   Run: npm install -g tsx" -ForegroundColor Gray
    exit 1
}

# Check if the mock server file exists
if (-not (Test-Path "server/src/index-mock.ts")) {
    Write-Host "❌ Error: Mock server file not found at server/src/index-mock.ts" -ForegroundColor Red
    exit 1
}

Write-Host "✅ All prerequisites met" -ForegroundColor Green
Write-Host ""

# Start the server
Write-Host "Starting server on port 3001..." -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""

try {
    Set-Location server
    npx tsx src/index-mock.ts
} catch {
    Write-Host "❌ Error starting server: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
} finally {
    Set-Location ..
} 