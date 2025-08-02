# Test Margin Alert System
Write-Host "Testing Margin Alert System" -ForegroundColor Cyan
Write-Host "===========================" -ForegroundColor Cyan

# Test 1: Create a product with low margin (should trigger alert)
Write-Host "`n1. Testing Product Creation with Low Margin" -ForegroundColor Yellow
try {
    $lowMarginProduct = @{
        name = "Low Margin Test Product"
        description = "A test product with low margin to trigger alerts"
        price = 10.00
        cost = 9.00  # 90% cost ratio, should trigger alert
        targetMargin = 25
        stock = 10
        isAvailable = $true
    }
    
    $body = $lowMarginProduct | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendor/products" -Method POST -Body $body -ContentType "application/json"
    Write-Host "✅ Low margin product created successfully (Status: $($response.StatusCode))" -ForegroundColor Green
    
    $data = $response.Content | ConvertFrom-Json
    Write-Host "   Product ID: $($data.product.id)" -ForegroundColor Green
    Write-Host "   Margin Alert: $($data.product.marginAlert)" -ForegroundColor Green
    Write-Host "   Alert Note: $($data.product.alertNote)" -ForegroundColor Green
    
    $lowMarginProductId = $data.product.id
} catch {
    Write-Host "❌ Low margin product creation failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Create a product with high cost ratio (should trigger alert)
Write-Host "`n2. Testing Product Creation with High Cost Ratio" -ForegroundColor Yellow
try {
    $highCostProduct = @{
        name = "High Cost Test Product"
        description = "A test product with high cost ratio to trigger alerts"
        price = 20.00
        cost = 16.00  # 80% cost ratio, should trigger alert
        targetMargin = 30
        stock = 5
        isAvailable = $true
    }
    
    $body = $highCostProduct | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendor/products" -Method POST -Body $body -ContentType "application/json"
    Write-Host "✅ High cost product created successfully (Status: $($response.StatusCode))" -ForegroundColor Green
    
    $data = $response.Content | ConvertFrom-Json
    Write-Host "   Product ID: $($data.product.id)" -ForegroundColor Green
    Write-Host "   Margin Alert: $($data.product.marginAlert)" -ForegroundColor Green
    Write-Host "   Alert Note: $($data.product.alertNote)" -ForegroundColor Green
    
    $highCostProductId = $data.product.id
} catch {
    Write-Host "❌ High cost product creation failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Create a product with healthy margin (should not trigger alert)
Write-Host "`n3. Testing Product Creation with Healthy Margin" -ForegroundColor Yellow
try {
    $healthyProduct = @{
        name = "Healthy Margin Test Product"
        description = "A test product with healthy margin (should not trigger alerts)"
        price = 15.00
        cost = 8.00  # 53% cost ratio, healthy margin
        targetMargin = 25
        stock = 20
        isAvailable = $true
    }
    
    $body = $healthyProduct | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendor/products" -Method POST -Body $body -ContentType "application/json"
    Write-Host "✅ Healthy margin product created successfully (Status: $($response.StatusCode))" -ForegroundColor Green
    
    $data = $response.Content | ConvertFrom-Json
    Write-Host "   Product ID: $($data.product.id)" -ForegroundColor Green
    Write-Host "   Margin Alert: $($data.product.marginAlert)" -ForegroundColor Green
    Write-Host "   Alert Note: $($data.product.alertNote)" -ForegroundColor Green
    
    $healthyProductId = $data.product.id
} catch {
    Write-Host "❌ Healthy margin product creation failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Update product to trigger margin alert
Write-Host "`n4. Testing Product Update to Trigger Margin Alert" -ForegroundColor Yellow
try {
    $updateData = @{
        cost = 14.00  # Increase cost to trigger alert
    }
    
    $body = $updateData | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendor/products/$healthyProductId" -Method PUT -Body $body -ContentType "application/json"
    Write-Host "✅ Product updated successfully (Status: $($response.StatusCode))" -ForegroundColor Green
    
    $data = $response.Content | ConvertFrom-Json
    Write-Host "   Margin Alert: $($data.product.marginAlert)" -ForegroundColor Green
    Write-Host "   Alert Note: $($data.product.alertNote)" -ForegroundColor Green
} catch {
    Write-Host "❌ Product update failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Get products with margin alerts
Write-Host "`n5. Testing Margin Alerts Endpoint" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendor/products/alerts/margin" -Method GET
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

# Test 6: Get all products to verify margin alert status
Write-Host "`n6. Testing Get All Products (Verify Margin Alerts)" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendor/products" -Method GET
    Write-Host "✅ Get all products successful (Status: $($response.StatusCode))" -ForegroundColor Green
    
    $data = $response.Content | ConvertFrom-Json
    Write-Host "   Total Products: $($data.count)" -ForegroundColor Green
    
    $productsWithAlerts = $data.products | Where-Object { $_.marginAlert -eq $true }
    Write-Host "   Products with Margin Alerts: $($productsWithAlerts.Count)" -ForegroundColor Green
    
    foreach ($product in $productsWithAlerts) {
        $margin = $product.price - $product.cost
        $marginPercentage = ($margin / $product.price) * 100
        Write-Host "     - $($product.name): $($marginPercentage)% margin" -ForegroundColor Green
        Write-Host "       Alert Note: $($product.alertNote)" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Get all products failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 Margin Alert System Testing Complete!" -ForegroundColor Green 