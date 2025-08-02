# Test Margin Calculator Utility
Write-Host "Testing Margin Calculator Utility" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Test 1: Low margin scenario
Write-Host "`n1. Testing Low Margin Scenario" -ForegroundColor Yellow
$lowMarginData = @{
    price = 10.00
    cost = 9.00
    targetMargin = 25
}

$body = $lowMarginData | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendor/products" -Method POST -Body $body -ContentType "application/json" -Headers @{"Cookie"="connect.sid=s%3Amock-session-id"}
    Write-Host "✅ Low margin test successful (Status: $($response.StatusCode))" -ForegroundColor Green
    
    $data = $response.Content | ConvertFrom-Json
    Write-Host "   Margin Alert: $($data.product.marginAlert)" -ForegroundColor Green
    Write-Host "   Alert Note: $($data.product.alertNote)" -ForegroundColor Green
} catch {
    Write-Host "❌ Low margin test failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: High cost ratio scenario
Write-Host "`n2. Testing High Cost Ratio Scenario" -ForegroundColor Yellow
$highCostData = @{
    price = 20.00
    cost = 16.00
    targetMargin = 30
}

$body = $highCostData | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendor/products" -Method POST -Body $body -ContentType "application/json" -Headers @{"Cookie"="connect.sid=s%3Amock-session-id"}
    Write-Host "✅ High cost test successful (Status: $($response.StatusCode))" -ForegroundColor Green
    
    $data = $response.Content | ConvertFrom-Json
    Write-Host "   Margin Alert: $($data.product.marginAlert)" -ForegroundColor Green
    Write-Host "   Alert Note: $($data.product.alertNote)" -ForegroundColor Green
} catch {
    Write-Host "❌ High cost test failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Healthy margin scenario
Write-Host "`n3. Testing Healthy Margin Scenario" -ForegroundColor Yellow
$healthyData = @{
    price = 15.00
    cost = 8.00
    targetMargin = 25
}

$body = $healthyData | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendor/products" -Method POST -Body $body -ContentType "application/json" -Headers @{"Cookie"="connect.sid=s%3Amock-session-id"}
    Write-Host "✅ Healthy margin test successful (Status: $($response.StatusCode))" -ForegroundColor Green
    
    $data = $response.Content | ConvertFrom-Json
    Write-Host "   Margin Alert: $($data.product.marginAlert)" -ForegroundColor Green
    Write-Host "   Alert Note: $($data.product.alertNote)" -ForegroundColor Green
} catch {
    Write-Host "❌ Healthy margin test failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Get margin alerts
Write-Host "`n4. Testing Margin Alerts Endpoint" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendor/products/alerts/margin" -Method GET -Headers @{"Cookie"="connect.sid=s%3Amock-session-id"}
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

Write-Host "`n🎉 Margin Calculator Testing Complete!" -ForegroundColor Green 