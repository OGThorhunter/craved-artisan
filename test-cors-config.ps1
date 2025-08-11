# Test CORS Configuration
# This script tests the CORS settings for different environments

Write-Host "🔒 Testing CORS Configuration" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Test 1: Development Environment
Write-Host "`nTest 1: Development Environment (localhost:5173)" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -Method GET -Headers @{"Origin"="http://localhost:5173"} -TimeoutSec 10
    Write-Host "✅ CORS Origin: http://localhost:5173 - SUCCESS" -ForegroundColor Green
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Gray
    Write-Host "   Access-Control-Allow-Origin: $($response.Headers['Access-Control-Allow-Origin'])" -ForegroundColor Gray
    Write-Host "   Access-Control-Allow-Credentials: $($response.Headers['Access-Control-Allow-Credentials'])" -ForegroundColor Gray
} catch {
    Write-Host "❌ CORS Origin: http://localhost:5173 - FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Blocked Origin (localhost:3000)
Write-Host "`nTest 2: Blocked Origin (localhost:3000)" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -Method GET -Headers @{"Origin"="http://localhost:3000"} -TimeoutSec 10
    Write-Host "❌ CORS Origin: http://localhost:3000 - Should have been blocked but wasn't" -ForegroundColor Red
} catch {
    Write-Host "✅ CORS Origin: http://localhost:3000 - Correctly blocked" -ForegroundColor Green
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
}

# Test 3: No Origin Header
Write-Host "`nTest 3: No Origin Header" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -Method GET -TimeoutSec 10
    Write-Host "✅ No Origin Header - SUCCESS" -ForegroundColor Green
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Gray
} catch {
    Write-Host "❌ No Origin Header - FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Preflight Request (OPTIONS)
Write-Host "`nTest 4: Preflight Request (OPTIONS)" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -Method OPTIONS -Headers @{
        "Origin"="http://localhost:5173"
        "Access-Control-Request-Method"="POST"
        "Access-Control-Request-Headers"="Content-Type"
    } -TimeoutSec 10
    Write-Host "✅ Preflight Request - SUCCESS" -ForegroundColor Green
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Gray
    Write-Host "   Access-Control-Allow-Methods: $($response.Headers['Access-Control-Allow-Methods'])" -ForegroundColor Gray
    Write-Host "   Access-Control-Allow-Headers: $($response.Headers['Access-Control-Allow-Headers'])" -ForegroundColor Gray
} catch {
    Write-Host "❌ Preflight Request - FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Credentials Support
Write-Host "`nTest 5: Credentials Support" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -Method GET -Headers @{"Origin"="http://localhost:5173"} -TimeoutSec 10
    if ($response.Headers['Access-Control-Allow-Credentials'] -eq 'true') {
        Write-Host "✅ Credentials Support - ENABLED" -ForegroundColor Green
    } else {
        Write-Host "❌ Credentials Support - DISABLED" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Credentials Test - FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎯 CORS Configuration Test Complete!" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
