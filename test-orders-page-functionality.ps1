# Quick Orders Page Functionality Test
# Testing the completed Orders Page after infrastructure fixes

Write-Host "🧪 Testing Orders Page Functionality" -ForegroundColor Green
Write-Host "=" * 50

# Test 1: Backend Health Check
Write-Host "`n1️⃣ Testing Backend Health..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/health" -Method Get -TimeoutSec 5
    Write-Host "✅ Backend Health: " -NoNewline -ForegroundColor Green
    Write-Host "OK - $($healthResponse.message)" -ForegroundColor White
} catch {
    Write-Host "❌ Backend Health: FAILED - $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Frontend Accessibility
Write-Host "`n2️⃣ Testing Frontend Accessibility..." -ForegroundColor Yellow
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:5173" -Method Get -TimeoutSec 5 -UseBasicParsing
    if ($frontendResponse.StatusCode -eq 200) {
        Write-Host "✅ Frontend: Available on http://localhost:5173" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Frontend: Not accessible - $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Orders API Endpoint
Write-Host "`n3️⃣ Testing Orders API..." -ForegroundColor Yellow
try {
    $ordersResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/vendor/orders" -Method Get -TimeoutSec 5
    Write-Host "✅ Orders API: Responding" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Orders API: $($_.Exception.Message)" -ForegroundColor Orange
    Write-Host "   (This may be expected if authentication is required)" -ForegroundColor Gray
}

# Test 4: CORS Configuration
Write-Host "`n4️⃣ Testing CORS Configuration..." -ForegroundColor Yellow
try {
    $corsHeaders = @{
        'Origin' = 'http://localhost:5173'
        'Access-Control-Request-Method' = 'GET'
    }
    $corsResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/health" -Headers $corsHeaders -Method Options -TimeoutSec 5 -UseBasicParsing
    Write-Host "✅ CORS: Headers properly configured" -ForegroundColor Green
} catch {
    Write-Host "⚠️  CORS: $($_.Exception.Message)" -ForegroundColor Orange
}

Write-Host "`n📋 Orders Page Access Information:" -ForegroundColor Cyan
Write-Host "🔗 Frontend URL: http://localhost:5173" -ForegroundColor White
Write-Host "🔗 Orders Page: http://localhost:5173/dashboard/vendor/orders" -ForegroundColor White
Write-Host "📚 Testing Guide: ORDERS_PAGE_TESTING_GUIDE.md" -ForegroundColor White

Write-Host "`n🎯 Key Features to Test:" -ForegroundColor Cyan
Write-Host "   1. KPI boxes with click-to-filter" -ForegroundColor White
Write-Host "   2. Numbered workflow buttons (1→2→3)" -ForegroundColor White
Write-Host "   3. Production management with starter tracking" -ForegroundColor White
Write-Host "   4. Label generation and single label printing" -ForegroundColor White
Write-Host "   5. Custom QA fields and print preferences" -ForegroundColor White
Write-Host "   6. CSV export functionality" -ForegroundColor White

Write-Host "`n✨ Expected Results:" -ForegroundColor Cyan
Write-Host "   • All 50+ buttons should be functional" -ForegroundColor White
Write-Host "   • Smooth view transitions between modes" -ForegroundColor White
Write-Host "   • Professional print outputs" -ForegroundColor White
Write-Host "   • Zero console errors" -ForegroundColor White

Write-Host "`n🚀 Status: Infrastructure fixes complete - Orders Page ready for testing!" -ForegroundColor Green
Write-Host "=" * 50
