# Test Analytics API Endpoint
Write-Host "Testing Analytics API Endpoint..." -ForegroundColor Green

$baseUrl = "http://localhost:3001/api"
$vendorId = "vendor_001"

# Test daily range
Write-Host "`nTesting daily range..." -ForegroundColor Yellow
$dailyUrl = "$baseUrl/vendor/$vendorId/analytics/trends?range=daily"
try {
    $response = Invoke-RestMethod -Uri $dailyUrl -Method Get
    Write-Host "✅ Daily range test passed" -ForegroundColor Green
    Write-Host "Data points: $($response.data.Count)" -ForegroundColor Cyan
    Write-Host "First data point: $($response.data[0] | ConvertTo-Json)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Daily range test failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test weekly range
Write-Host "`nTesting weekly range..." -ForegroundColor Yellow
$weeklyUrl = "$baseUrl/vendor/$vendorId/analytics/trends?range=weekly"
try {
    $response = Invoke-RestMethod -Uri $weeklyUrl -Method Get
    Write-Host "✅ Weekly range test passed" -ForegroundColor Green
    Write-Host "Data points: $($response.data.Count)" -ForegroundColor Cyan
    Write-Host "First data point: $($response.data[0] | ConvertTo-Json)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Weekly range test failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test monthly range
Write-Host "`nTesting monthly range..." -ForegroundColor Yellow
$monthlyUrl = "$baseUrl/vendor/$vendorId/analytics/trends?range=monthly"
try {
    $response = Invoke-RestMethod -Uri $monthlyUrl -Method Get
    Write-Host "✅ Monthly range test passed" -ForegroundColor Green
    Write-Host "Data points: $($response.data.Count)" -ForegroundColor Cyan
    Write-Host "First data point: $($response.data[0] | ConvertTo-Json)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Monthly range test failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test analytics summary
Write-Host "`nTesting analytics summary..." -ForegroundColor Yellow
$summaryUrl = "$baseUrl/vendor/$vendorId/analytics/summary"
try {
    $response = Invoke-RestMethod -Uri $summaryUrl -Method Get
    Write-Host "✅ Analytics summary test passed" -ForegroundColor Green
    Write-Host "Vendor Name: $($response.data.vendorName)" -ForegroundColor Cyan
    Write-Host "Total Revenue: $($response.data.totalRevenue)" -ForegroundColor Gray
    Write-Host "Total Orders: $($response.data.totalOrders)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Analytics summary test failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test invalid vendor ID
Write-Host "`nTesting invalid vendor ID..." -ForegroundColor Yellow
$invalidUrl = "$baseUrl/vendor/invalid_vendor/analytics/trends?range=daily"
try {
    $response = Invoke-RestMethod -Uri $invalidUrl -Method Get
    Write-Host "❌ Invalid vendor test should have failed" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "✅ Invalid vendor test passed (404 as expected)" -ForegroundColor Green
    } else {
        Write-Host "❌ Invalid vendor test failed with unexpected status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}

# Test invalid range parameter
Write-Host "`nTesting invalid range parameter..." -ForegroundColor Yellow
$invalidRangeUrl = "$baseUrl/vendor/$vendorId/analytics/trends?range=invalid"
try {
    $response = Invoke-RestMethod -Uri $invalidRangeUrl -Method Get
    Write-Host "❌ Invalid range test should have failed" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "✅ Invalid range test passed (400 as expected)" -ForegroundColor Green
    } else {
        Write-Host "❌ Invalid range test failed with unexpected status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}

Write-Host "`nAnalytics API testing completed!" -ForegroundColor Green 