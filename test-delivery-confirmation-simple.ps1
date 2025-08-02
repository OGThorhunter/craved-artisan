# Simple Delivery Confirmation Test
Write-Host "🧪 Testing Delivery Confirmation Workflow" -ForegroundColor Cyan

# Step 1: Create a test order via checkout
Write-Host "`n📦 Step 1: Creating test order..." -ForegroundColor Yellow
$checkoutData = @{
    items = @(
        @{
            productId = "550e8400-e29b-41d4-a716-446655440000"
            quantity = 2
            price = 25.99
        }
    )
    userId = "test-user-123"
    subtotal = 51.98
    tax = 4.42
    shipping = 0
    total = 56.40
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/orders/checkout" -Method POST -Body $checkoutData -ContentType "application/json"
    $orderData = $response.Content | ConvertFrom-Json
    $orderId = $orderData.order.id
    Write-Host "✅ Order created: $orderId" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to create order: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# Step 2: Confirm delivery without photo
Write-Host "`n📦 Step 2: Confirming delivery without photo..." -ForegroundColor Yellow
$deliveryData = @{
    photoUrl = $null
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/orders/$orderId/confirm-delivery/test" -Method POST -Body $deliveryData -ContentType "application/json"
    Write-Host "✅ Delivery confirmed successfully!" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed to confirm delivery: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 3: Verify order status
Write-Host "`n🔍 Step 3: Verifying order status..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/orders/history/test" -Method GET
    $ordersData = $response.Content | ConvertFrom-Json
    $updatedOrder = $ordersData.orders | Where-Object { $_.id -eq $orderId }
    
    if ($updatedOrder) {
        Write-Host "✅ Order found in history" -ForegroundColor Green
        Write-Host "Status: $($updatedOrder.status)" -ForegroundColor Gray
        Write-Host "Delivery Status: $($updatedOrder.deliveryStatus)" -ForegroundColor Gray
        Write-Host "Delivery Timestamp: $($updatedOrder.deliveryTimestamp)" -ForegroundColor Gray
    } else {
        Write-Host "❌ Order not found in history" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Failed to verify order: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 Test Complete!" -ForegroundColor Cyan 