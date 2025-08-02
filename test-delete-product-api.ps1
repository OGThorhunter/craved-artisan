# Test Delete Product API Endpoint
# Prerequisites: Server running on http://localhost:3001 (mock mode)

Write-Host "🧪 Testing Delete Product API Endpoint" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Create a session to maintain cookies
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession

# Step 1: Login as vendor
Write-Host "`n1. Logging in as vendor..." -ForegroundColor Yellow
$loginResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/auth/login" -Method POST -WebSession $session -ContentType "application/json" -Body '{
  "email": "vendor@cravedartisan.com",
  "password": "vendor123"
}'

if ($loginResponse.StatusCode -eq 200) {
    Write-Host "✅ Login successful" -ForegroundColor Green
    $loginData = $loginResponse.Content | ConvertFrom-Json
    Write-Host "   User: $($loginData.user.email)" -ForegroundColor Gray
} else {
    Write-Host "❌ Login failed: $($loginResponse.StatusCode)" -ForegroundColor Red
    exit 1
}

# Step 2: Get current products
Write-Host "`n2. Getting current products..." -ForegroundColor Yellow
$productsResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/vendor/products" -Method GET -WebSession $session

if ($productsResponse.StatusCode -eq 200) {
    $productsData = $productsResponse.Content | ConvertFrom-Json
    Write-Host "✅ Found $($productsData.count) products" -ForegroundColor Green
    
    if ($productsData.count -eq 0) {
        Write-Host "❌ No products to delete. Please create a product first." -ForegroundColor Red
        exit 1
    }
    
    $firstProduct = $productsData.products[0]
    Write-Host "   First product: $($firstProduct.name) (ID: $($firstProduct.id))" -ForegroundColor Gray
} else {
    Write-Host "❌ Failed to get products: $($productsResponse.StatusCode)" -ForegroundColor Red
    exit 1
}

# Step 3: Delete the first product
Write-Host "`n3. Deleting product: $($firstProduct.name)..." -ForegroundColor Yellow
$deleteResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/vendor/products/$($firstProduct.id)" -Method DELETE -WebSession $session

if ($deleteResponse.StatusCode -eq 200) {
    Write-Host "✅ Product deleted successfully" -ForegroundColor Green
    $deleteData = $deleteResponse.Content | ConvertFrom-Json
    Write-Host "   Message: $($deleteData.message)" -ForegroundColor Gray
} else {
    Write-Host "❌ Failed to delete product: $($deleteResponse.StatusCode)" -ForegroundColor Red
    Write-Host "   Response: $($deleteResponse.Content)" -ForegroundColor Red
    exit 1
}

# Step 4: Verify product was deleted
Write-Host "`n4. Verifying product was deleted..." -ForegroundColor Yellow
$verifyResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/vendor/products" -Method GET -WebSession $session

if ($verifyResponse.StatusCode -eq 200) {
    $verifyData = $verifyResponse.Content | ConvertFrom-Json
    Write-Host "✅ Products after deletion: $($verifyData.count)" -ForegroundColor Green
    
    $deletedProduct = $verifyData.products | Where-Object { $_.id -eq $firstProduct.id }
    if ($deletedProduct) {
        Write-Host "❌ Product still exists in list" -ForegroundColor Red
    } else {
        Write-Host "✅ Product successfully removed from list" -ForegroundColor Green
    }
} else {
    Write-Host "❌ Failed to verify deletion: $($verifyResponse.StatusCode)" -ForegroundColor Red
}

# Step 5: Test deleting non-existent product
Write-Host "`n5. Testing delete of non-existent product..." -ForegroundColor Yellow
$fakeId = "non-existent-id"
$fakeDeleteResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/vendor/products/$fakeId" -Method DELETE -WebSession $session

if ($fakeDeleteResponse.StatusCode -eq 404) {
    Write-Host "✅ Correctly returned 404 for non-existent product" -ForegroundColor Green
} else {
    Write-Host "❌ Expected 404, got: $($fakeDeleteResponse.StatusCode)" -ForegroundColor Red
}

Write-Host "`n🎉 Delete Product API Test Complete!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan 