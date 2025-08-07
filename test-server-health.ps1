# Test Server Health
Write-Host "Testing Server Health..." -ForegroundColor Green

$baseUrl = "http://localhost:3001"

# Test health endpoint
Write-Host "`nTesting health endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get
    Write-Host "✅ Health check passed" -ForegroundColor Green
    Write-Host "Status: $($response.status)" -ForegroundColor Cyan
    Write-Host "Service: $($response.service)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test analytics endpoint with a test vendor ID
Write-Host "`nTesting analytics endpoint..." -ForegroundColor Yellow
$testVendorId = "test-vendor-001"
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/vendor/$testVendorId/analytics/trends?range=daily" -Method Get
    Write-Host "✅ Analytics endpoint responded" -ForegroundColor Green
    Write-Host "Success: $($response.success)" -ForegroundColor Cyan
    Write-Host "Data points: $($response.data.Count)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Analytics endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
    }
}

Write-Host "`nServer health testing completed!" -ForegroundColor Green 