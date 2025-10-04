# AI Services Setup Script for Craved Artisan (PowerShell)
Write-Host "🚀 Setting up AI services for Craved Artisan..." -ForegroundColor Green

# Check if Docker is running
try {
    docker info | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker and try again." -ForegroundColor Red
    exit 1
}

# Start AI services
Write-Host "📦 Starting AI services with Docker Compose..." -ForegroundColor Yellow
docker compose -f docker-compose.ai.yml up -d

# Wait for services to be ready
Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check service health
Write-Host "🔍 Checking service health..." -ForegroundColor Yellow

# Check Ollama
try {
    $response = Invoke-WebRequest -Uri "http://localhost:11434/api/tags" -UseBasicParsing
    Write-Host "✅ Ollama is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Ollama is not responding" -ForegroundColor Red
}

# Check Receipt OCR
try {
    $response = Invoke-WebRequest -Uri "http://localhost:9001/healthz" -UseBasicParsing
    Write-Host "✅ Receipt OCR service is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Receipt OCR service is not responding" -ForegroundColor Red
}

# Check Insights
try {
    $response = Invoke-WebRequest -Uri "http://localhost:9002/healthz" -UseBasicParsing
    Write-Host "✅ Insights service is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Insights service is not responding" -ForegroundColor Red
}

# Pull required models
Write-Host "📥 Pulling required AI models..." -ForegroundColor Yellow

# Pull Phi-3.5-mini
Write-Host "Pulling Phi-3.5-mini model..." -ForegroundColor Cyan
try {
    $body = @{ name = "phi3.5:mini" } | ConvertTo-Json
    Invoke-WebRequest -Uri "http://localhost:11434/api/pull" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing | Out-Null
    Write-Host "✅ Phi-3.5-mini model pulled successfully" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Failed to pull Phi-3.5-mini" -ForegroundColor Yellow
}

# Pull BGE-small
Write-Host "Pulling BGE-small model..." -ForegroundColor Cyan
try {
    $body = @{ name = "bge-small" } | ConvertTo-Json
    Invoke-WebRequest -Uri "http://localhost:11434/api/pull" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing | Out-Null
    Write-Host "✅ BGE-small model pulled successfully" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Failed to pull BGE-small" -ForegroundColor Yellow
}

Write-Host "🎉 AI services setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Services available at:" -ForegroundColor Cyan
Write-Host "  - Ollama: http://localhost:11434" -ForegroundColor White
Write-Host "  - Receipt OCR: http://localhost:9001" -ForegroundColor White
Write-Host "  - Insights: http://localhost:9002" -ForegroundColor White
Write-Host ""
Write-Host "To stop services: docker compose -f docker-compose.ai.yml down" -ForegroundColor Yellow
Write-Host "To view logs: docker compose -f docker-compose.ai.yml logs -f" -ForegroundColor Yellow
