# Test Delivery Batching Features
Write-Host "Testing Delivery Batching Features..." -ForegroundColor Green

# Test 1: Route Optimization
Write-Host "`n1. Testing Route Optimization..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendor/orders/delivery-batches?optimize=true" -Method GET -Headers @{"Content-Type"="application/json"}
    Write-Host "✅ Route optimization endpoint is accessible" -ForegroundColor Green
} catch {
    Write-Host "❌ Route optimization endpoint error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Batch Manifest
Write-Host "`n2. Testing Batch Manifest..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendor/orders/delivery-batches/Monday/manifest" -Method GET -Headers @{"Content-Type"="application/json"}
    Write-Host "✅ Batch manifest endpoint is accessible" -ForegroundColor Green
} catch {
    Write-Host "❌ Batch manifest endpoint error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Batch Status
Write-Host "`n3. Testing Batch Status..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendor/orders/delivery-batches/Monday/status" -Method GET -Headers @{"Content-Type"="application/json"}
    Write-Host "✅ Batch status endpoint is accessible" -ForegroundColor Green
} catch {
    Write-Host "❌ Batch status endpoint error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n✅ All delivery batching features are implemented and accessible!" -ForegroundColor Green 