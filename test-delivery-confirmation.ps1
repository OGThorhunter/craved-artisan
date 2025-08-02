# Test Delivery Confirmation Workflow
Write-Host "🧪 Testing Delivery Confirmation Workflow" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# Test 1: Confirm delivery without photo
Write-Host "`n📦 Test 1: Confirm delivery without photo" -ForegroundColor Yellow
$deliveryData = @{
    photoUrl = $null
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/orders/order-1/confirm-delivery" -Method POST -Body $deliveryData -ContentType "application/json"
    Write-Host "✅ Success: Delivery confirmed without photo" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Confirm delivery with photo
Write-Host "`n📸 Test 2: Confirm delivery with photo" -ForegroundColor Yellow
$deliveryDataWithPhoto = @{
    photoUrl = "https://example.com/delivery-photos/order-1-1234567890.jpg"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/orders/order-2/confirm-delivery" -Method POST -Body $deliveryDataWithPhoto -ContentType "application/json"
    Write-Host "✅ Success: Delivery confirmed with photo" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Confirm delivery for non-existent order
Write-Host "`n🚫 Test 3: Confirm delivery for non-existent order" -ForegroundColor Yellow
$deliveryData = @{
    photoUrl = $null
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/orders/non-existent-order/confirm-delivery" -Method POST -Body $deliveryData -ContentType "application/json"
    Write-Host "❌ Unexpected success for non-existent order" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "✅ Expected: 404 Not Found for non-existent order" -ForegroundColor Green
    } else {
        Write-Host "❌ Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 4: Verify order status after delivery confirmation
Write-Host "`n🔍 Test 4: Verify order status after delivery confirmation" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/orders/order-1" -Method GET
    $orderData = $response.Content | ConvertFrom-Json
    Write-Host "✅ Success: Retrieved order data" -ForegroundColor Green
    Write-Host "Order Status: $($orderData.order.status)" -ForegroundColor Gray
    Write-Host "Delivery Status: $($orderData.order.deliveryStatus)" -ForegroundColor Gray
    Write-Host "Delivery Timestamp: $($orderData.order.deliveryTimestamp)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 Delivery Confirmation Workflow Tests Complete!" -ForegroundColor Cyan 