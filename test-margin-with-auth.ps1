# Margin Alert Test with Authentication
Write-Host "Margin Alert Test with Authentication" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Create a session
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession

# Step 1: Login as vendor
Write-Host "`n1. Logging in as vendor..." -ForegroundColor Yellow
try {
    $loginData = @{
        email = "vendor@cravedartisan.com"
        password = "vendor123"
    }
    
    $body = $loginData | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/auth/login" -Method POST -Body $body -ContentType "application/json" -WebSession $session
    Write-Host "✅ Login successful (Status: $($response.StatusCode))" -ForegroundColor Green
    
    $data = $response.Content | ConvertFrom-Json
    Write-Host "   User ID: $($data.user.id)" -ForegroundColor Green
    Write-Host "   Role: $($data.user.role)" -ForegroundColor Green
} catch {
    Write-Host "❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 2: Test margin alerts endpoint
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
            Write-Host "       Alert Note: $($product.alertNote)" -ForegroundColor Green
        }
    }
} catch {
    Write-Host "❌ Margin alerts endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 3: Test creating a product with low margin
Write-Host "`n3. Testing Product Creation with Low Margin" -ForegroundColor Yellow
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
    
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendor/products" -Method POST -Body $body -ContentType "application/json" -WebSession $session
    Write-Host "✅ Low margin product created successfully (Status: $($response.StatusCode))" -ForegroundColor Green
    
    $data = $response.Content | ConvertFrom-Json
    Write-Host "   Product ID: $($data.product.id)" -ForegroundColor Green
    Write-Host "   Margin Alert: $($data.product.marginAlert)" -ForegroundColor Green
    Write-Host "   Alert Note: $($data.product.alertNote)" -ForegroundColor Green
    
    $lowMarginProductId = $data.product.id
} catch {
    Write-Host "❌ Low margin product creation failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 4: Test creating a product with healthy margin
Write-Host "`n4. Testing Product Creation with Healthy Margin" -ForegroundColor Yellow
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
    
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendor/products" -Method POST -Body $body -ContentType "application/json" -WebSession $session
    Write-Host "✅ Healthy margin product created successfully (Status: $($response.StatusCode))" -ForegroundColor Green
    
    $data = $response.Content | ConvertFrom-Json
    Write-Host "   Product ID: $($data.product.id)" -ForegroundColor Green
    Write-Host "   Margin Alert: $($data.product.marginAlert)" -ForegroundColor Green
    Write-Host "   Alert Note: $($data.product.alertNote)" -ForegroundColor Green
    
    $healthyProductId = $data.product.id
} catch {
    Write-Host "❌ Healthy margin product creation failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 5: Test updating a product to trigger margin alert
Write-Host "`n5. Testing Product Update to Trigger Margin Alert" -ForegroundColor Yellow
try {
    $updateData = @{
        cost = 14.00  # Increase cost to trigger alert
    }
    
    $body = $updateData | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendor/products/$healthyProductId" -Method PUT -Body $body -ContentType "application/json" -WebSession $session
    Write-Host "✅ Product updated successfully (Status: $($response.StatusCode))" -ForegroundColor Green
    
    $data = $response.Content | ConvertFrom-Json
    Write-Host "   Margin Alert: $($data.product.marginAlert)" -ForegroundColor Green
    Write-Host "   Alert Note: $($data.product.alertNote)" -ForegroundColor Green
} catch {
    Write-Host "❌ Product update failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 6: Test margin alerts endpoint again to see updated data
Write-Host "`n6. Testing Margin Alerts Endpoint (After Updates)" -ForegroundColor Yellow
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

Write-Host "`n🎉 Margin Alert Test with Authentication Complete!" -ForegroundColor Green 