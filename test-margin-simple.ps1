# Simple Margin Alert Test
Write-Host "Simple Margin Alert Test" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan

# First, let's test the margin alerts endpoint with existing mock data
Write-Host "`n1. Testing Margin Alerts Endpoint (Existing Mock Data)" -ForegroundColor Yellow

try {
    # Create a session by making a request to a protected endpoint
    $session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
    
    # First, let's try to get the existing products to see what's there
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendor/products" -Method GET -WebSession $session
    Write-Host "✅ Get products successful (Status: $($response.StatusCode))" -ForegroundColor Green
    
    $data = $response.Content | ConvertFrom-Json
    Write-Host "   Total Products: $($data.count)" -ForegroundColor Green
    
    # Check which products have margin alerts
    $productsWithAlerts = $data.products | Where-Object { $_.marginAlert -eq $true }
    Write-Host "   Products with Margin Alerts: $($productsWithAlerts.Count)" -ForegroundColor Green
    
    foreach ($product in $productsWithAlerts) {
        $margin = $product.price - $product.cost
        $marginPercentage = ($margin / $product.price) * 100
        Write-Host "     - $($product.name): $($marginPercentage)% margin" -ForegroundColor Green
        Write-Host "       Alert Note: $($product.alertNote)" -ForegroundColor Green
    }
    
} catch {
    Write-Host "❌ Get products failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Try to access margin alerts endpoint
Write-Host "`n2. Testing Margin Alerts Endpoint" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendor/products/alerts/margin" -Method GET -WebSession $session
    Write-Host "✅ Margin alerts endpoint successful (Status: $($response.StatusCode))" -ForegroundColor Green
    
    $data = $response.Content | ConvertFrom-Json
    Write-Host "   Total Products with Alerts: $($data.count)" -ForegroundColor Green
    Write-Host "   Summary:" -ForegroundColor Green
    Write-Host "     Total Alerts: $($data.summary.totalAlerts)" -ForegroundColor Green
    Write-Host "     Low Margin Count: $($data.summary.lowMarginCount)" -ForegroundColor Green
    Write-Host "     High Cost Count: $($data.summary.highCostCount)" -ForegroundColor Green
    
    if ($data.products.Count -gt 0) {
        Write-Host "   Products with Alerts:" -ForegroundColor Green
        foreach ($product in $data.products) {
            Write-Host "     - $($product.name): $($product.currentMarginPercentage)% margin" -ForegroundColor Green
        }
    }
} catch {
    Write-Host "❌ Margin alerts endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 Simple Margin Alert Test Complete!" -ForegroundColor Green 