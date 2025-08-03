# Test Financial Insights API Endpoint
Write-Host "Testing Financial Insights API Endpoint..." -ForegroundColor Green

# Start mock server if not running
$serverProcess = Get-Process -Name "node" -ErrorAction SilentlyContinue
if (-not $serverProcess) {
    Write-Host "Starting mock server..." -ForegroundColor Yellow
    .\start-mock-server.ps1
    Start-Sleep -Seconds 3
}

# Test 1: Get financial insights for vendor-1 (default period - last 12 months)
Write-Host "`nTest 1: Getting financial insights for vendor-1 (default period)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendors/vendor-1/financials/insights/test" -Method GET
    $data = $response.Content | ConvertFrom-Json
    
    Write-Host "✅ Successfully retrieved financial insights" -ForegroundColor Green
    Write-Host "Summary: $($data.summary)" -ForegroundColor Cyan
    Write-Host "Top Gains Count: $($data.topGains.Count)" -ForegroundColor Cyan
    Write-Host "Cost Trend: $($data.costTrend.trend) ($($data.costTrend.percentage)%)" -ForegroundColor Cyan
    Write-Host "Burn Rate Status: $($data.burnRate.status)" -ForegroundColor Cyan
    Write-Host "Monthly Cash Flow: $($data.burnRate.monthly)" -ForegroundColor Cyan
    Write-Host "Runway: $($data.burnRate.runway) months" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Failed to get financial insights: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Get financial insights for specific year (2025)
Write-Host "`nTest 2: Getting financial insights for 2025..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendors/vendor-1/financials/insights/test?year=2025" -Method GET
    $data = $response.Content | ConvertFrom-Json
    
    Write-Host "✅ Successfully retrieved 2025 insights" -ForegroundColor Green
    Write-Host "Period: $($data.period.start) to $($data.period.end)" -ForegroundColor Cyan
    Write-Host "Snapshots analyzed: $($data.period.snapshotsCount)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Failed to get 2025 insights: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Get financial insights for specific quarter (Q1 2025)
Write-Host "`nTest 3: Getting financial insights for Q1 2025..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendors/vendor-1/financials/insights/test?year=2025&quarter=Q1" -Method GET
    $data = $response.Content | ConvertFrom-Json
    
    Write-Host "✅ Successfully retrieved Q1 2025 insights" -ForegroundColor Green
    Write-Host "Period: $($data.period.start) to $($data.period.end)" -ForegroundColor Cyan
    Write-Host "Snapshots analyzed: $($data.period.snapshotsCount)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Failed to get Q1 2025 insights: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Get financial insights for vendor-2
Write-Host "`nTest 4: Getting financial insights for vendor-2..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendors/vendor-2/financials/insights/test" -Method GET
    $data = $response.Content | ConvertFrom-Json
    
    Write-Host "✅ Successfully retrieved vendor-2 insights" -ForegroundColor Green
    Write-Host "Summary: $($data.summary)" -ForegroundColor Cyan
    Write-Host "Top Gains Count: $($data.topGains.Count)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Failed to get vendor-2 insights: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Test with no data (non-existent vendor)
Write-Host "`nTest 5: Testing with non-existent vendor..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendors/non-existent/financials/insights/test" -Method GET
    Write-Host "❌ Should have failed with non-existent vendor" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "✅ Correctly returned 404 for non-existent vendor" -ForegroundColor Green
    } else {
        Write-Host "❌ Unexpected error for non-existent vendor: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 6: Test with period that has no data (2020)
Write-Host "`nTest 6: Testing with period that has no data (2020)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendors/vendor-1/financials/insights/test?year=2020" -Method GET
    $data = $response.Content | ConvertFrom-Json
    
    Write-Host "✅ Successfully handled period with no data" -ForegroundColor Green
    Write-Host "Summary: $($data.summary)" -ForegroundColor Cyan
    Write-Host "Top Gains Count: $($data.topGains.Count)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Failed to handle period with no data: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 Financial Insights API tests completed!" -ForegroundColor Green 