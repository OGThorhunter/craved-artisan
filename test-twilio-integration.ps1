# Test Twilio Integration for Delivery Notifications
Write-Host "Testing Twilio Integration for Delivery Notifications" -ForegroundColor Cyan

# Test 1: Send delivery confirmation notification
Write-Host "`nTest 1: Send delivery confirmation notification" -ForegroundColor Yellow
$deliveryData = @{
    photoUrl = $null
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/orders/order-1/confirm-delivery/test" -Method POST -Body $deliveryData -ContentType "application/json"
    Write-Host "Success: Delivery confirmation sent" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor Gray
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Send delivery ETA notification
Write-Host "`nTest 2: Send delivery ETA notification" -ForegroundColor Yellow
$etaData = @{
    timeWindow = "2-4 PM"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/orders/order-1/send-eta/test" -Method POST -Body $etaData -ContentType "application/json"
    Write-Host "Success: ETA notification sent" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor Gray
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Send ETA notification with different time window
Write-Host "`nTest 3: Send ETA notification with different time window" -ForegroundColor Yellow
$etaData2 = @{
    timeWindow = "5-7 PM"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/orders/order-1/send-eta/test" -Method POST -Body $etaData2 -ContentType "application/json"
    Write-Host "Success: ETA notification sent with custom time" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor Gray
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Test with non-existent order
Write-Host "`nTest 4: Test with non-existent order" -ForegroundColor Yellow
$etaData3 = @{
    timeWindow = "1-3 PM"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/orders/non-existent-order/send-eta/test" -Method POST -Body $etaData3 -ContentType "application/json"
    Write-Host "Unexpected success for non-existent order" -ForegroundColor Red
} catch {
    Write-Host "Correctly handled non-existent order" -ForegroundColor Green
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Gray
}

Write-Host "`nTwilio Integration Testing Complete!" -ForegroundColor Cyan
Write-Host "Note: Check server logs for Twilio SMS sending attempts" -ForegroundColor Yellow 