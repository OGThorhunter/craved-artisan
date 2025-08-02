# Test Delivery Driver Endpoints
Write-Host "🚚 Testing Delivery Driver Endpoints" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Test 1: Fetch delivery batch
Write-Host "`n📦 Test 1: Fetch Delivery Batch" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendor/orders/delivery-batches/monday-2025-08-02" -Method GET
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Success: Delivery batch fetched" -ForegroundColor Green
        $data = $response.Content | ConvertFrom-Json
        Write-Host "   Batch ID: $($data.batchId)" -ForegroundColor Gray
        Write-Host "   Total Orders: $($data.summary.totalOrders)" -ForegroundColor Gray
        Write-Host "   Delivered: $($data.summary.deliveredOrders)" -ForegroundColor Gray
        Write-Host "   Driver: $($data.driverInfo.assignedDriver)" -ForegroundColor Gray
    } else {
        Write-Host "❌ Failed: Unexpected status code $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "⚠️  Expected: Authentication required" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 2: Mark order as delivered
Write-Host "`n✅ Test 2: Mark Order as Delivered" -ForegroundColor Yellow
try {
    $deliveryData = @{
        deliveryNotes = "Left at front door as requested"
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendor/orders/order-1/deliver" -Method POST -Body $deliveryData -ContentType "application/json"
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Success: Order marked as delivered" -ForegroundColor Green
        $data = $response.Content | ConvertFrom-Json
        Write-Host "   Order ID: $($data.orderId)" -ForegroundColor Gray
        Write-Host "   Status: $($data.status)" -ForegroundColor Gray
        Write-Host "   Delivered At: $($data.deliveredAt)" -ForegroundColor Gray
    } else {
        Write-Host "❌ Failed: Unexpected status code $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "⚠️  Expected: Authentication required" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 3: Test with photo upload (simulated)
Write-Host "`n📸 Test 3: Delivery with Photo Upload (Simulated)" -ForegroundColor Yellow
try {
    $deliveryData = @{
        deliveryPhoto = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A"
        deliveryNotes = "Delivered with photo proof"
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendor/orders/order-3/deliver" -Method POST -Body $deliveryData -ContentType "application/json"
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Success: Order delivered with photo" -ForegroundColor Green
        $data = $response.Content | ConvertFrom-Json
        Write-Host "   Order ID: $($data.orderId)" -ForegroundColor Gray
        Write-Host "   Photo: $($data.deliveryPhoto -ne $null)" -ForegroundColor Gray
        Write-Host "   Notes: $($data.deliveryNotes)" -ForegroundColor Gray
    } else {
        Write-Host "❌ Failed: Unexpected status code $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "⚠️  Expected: Authentication required" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n🎯 Delivery Driver Testing Complete!" -ForegroundColor Cyan
Write-Host "Note: All endpoints require authentication (401 expected)" -ForegroundColor Yellow 