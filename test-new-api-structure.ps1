# Test the new API structure for financial endpoints
Write-Host "🧪 Testing New API Structure for Financial Endpoints" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# Test GET endpoint
Write-Host "`n📊 Testing GET /api/vendors/:id/financials" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendors/vendor-1/financials/test?range=monthly" -Method GET
    Write-Host "✅ GET Request Successful (Status: $($response.StatusCode))" -ForegroundColor Green
    $data = $response.Content | ConvertFrom-Json
    Write-Host "📈 Data received: $($data.snapshots.Count) snapshots" -ForegroundColor Green
} catch {
    Write-Host "❌ GET Request Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test POST endpoint
Write-Host "`n🔄 Testing POST /api/vendors/:id/financials/generate" -ForegroundColor Yellow
try {
    $body = @{
        period = "monthly"
        notes = "Test generation via new API structure"
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendors/vendor-1/financials/generate/test" -Method POST -Body $body -ContentType "application/json"
    Write-Host "✅ POST Request Successful (Status: $($response.StatusCode))" -ForegroundColor Green
    $data = $response.Content | ConvertFrom-Json
    Write-Host "📊 Generated snapshot ID: $($data.snapshot.id)" -ForegroundColor Green
} catch {
    Write-Host "❌ POST Request Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test quarterly range
Write-Host "`n📅 Testing Quarterly Range" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendors/vendor-1/financials/test?range=quarterly" -Method GET
    Write-Host "✅ Quarterly Request Successful (Status: $($response.StatusCode))" -ForegroundColor Green
    $data = $response.Content | ConvertFrom-Json
    Write-Host "📈 Quarterly data: $($data.snapshots.Count) snapshots" -ForegroundColor Green
} catch {
    Write-Host "❌ Quarterly Request Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 API Structure Test Complete!" -ForegroundColor Cyan 