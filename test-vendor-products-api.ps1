# Test Vendor Products API Endpoints
# This script tests the vendor products API endpoints

$baseUrl = "http://localhost:3001"
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession

Write-Host "🧪 Testing Vendor Products API Endpoints" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

# Test 1: Try to get products without authentication
Write-Host "`n1️⃣ Testing GET /api/vendor/products (No Auth)" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/vendor/products" -WebSession $session -Method GET
    Write-Host "❌ Unexpected success: $($response.StatusCode)" -ForegroundColor Red
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "✅ Expected failure: $statusCode" -ForegroundColor Green
    if ($statusCode -eq 401) {
        Write-Host "   Correctly returned 401 Unauthorized" -ForegroundColor Green
    }
}

# Test 2: Login first to get session
Write-Host "`n2️⃣ Logging in to get session..." -ForegroundColor Yellow
try {
    $loginData = @{
        email = "vendor@cravedartisan.com"
        password = "vendor123"
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "$baseUrl/api/auth/login" -WebSession $session -Method POST -Body $loginData -ContentType "application/json"
    Write-Host "✅ Login successful: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "   Session established" -ForegroundColor Green
} catch {
    Write-Host "❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Using mock session for testing..." -ForegroundColor Yellow
}

# Test 3: Get all products (should be empty initially)
Write-Host "`n3️⃣ Testing GET /api/vendor/products (With Auth)" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/vendor/products" -WebSession $session -Method GET
    Write-Host "✅ GET Products successful: $($response.StatusCode)" -ForegroundColor Green
    $products = $response.Content | ConvertFrom-Json
    Write-Host "   Products count: $($products.count)" -ForegroundColor Green
    Write-Host "   Products: $($products.products.Count)" -ForegroundColor Green
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "❌ GET Products failed: $statusCode" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Create a new product
Write-Host "`n4️⃣ Testing POST /api/vendor/products" -ForegroundColor Yellow
try {
    $productData = @{
        name = "Test Artisan Product"
        description = "A beautiful handcrafted item for testing"
        price = 29.99
        imageUrl = "https://placekitten.com/400/300"
        tags = @("handmade", "artisan", "test")
        stock = 10
        isAvailable = $true
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "$baseUrl/api/vendor/products" -WebSession $session -Method POST -Body $productData -ContentType "application/json"
    Write-Host "✅ POST Product successful: $($response.StatusCode)" -ForegroundColor Green
    $createdProduct = $response.Content | ConvertFrom-Json
    Write-Host "   Product ID: $($createdProduct.product.id)" -ForegroundColor Green
    Write-Host "   Product Name: $($createdProduct.product.name)" -ForegroundColor Green
    Write-Host "   Product Price: $($createdProduct.product.price)" -ForegroundColor Green
    
    # Store the product ID for later tests
    $productId = $createdProduct.product.id
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "❌ POST Product failed: $statusCode" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    $productId = "test-product-id"
}

# Test 5: Get the specific product by ID
Write-Host "`n5️⃣ Testing GET /api/vendor/products/$productId" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/vendor/products/$productId" -WebSession $session -Method GET
    Write-Host "✅ GET Product by ID successful: $($response.StatusCode)" -ForegroundColor Green
    $product = $response.Content | ConvertFrom-Json
    Write-Host "   Product Name: $($product.name)" -ForegroundColor Green
    Write-Host "   Product Price: $($product.price)" -ForegroundColor Green
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "❌ GET Product by ID failed: $statusCode" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 6: Update the product
Write-Host "`n6️⃣ Testing PUT /api/vendor/products/$productId" -ForegroundColor Yellow
try {
    $updateData = @{
        name = "Updated Test Product"
        price = 39.99
        stock = 15
        tags = @("updated", "handmade", "artisan")
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "$baseUrl/api/vendor/products/$productId" -WebSession $session -Method PUT -Body $updateData -ContentType "application/json"
    Write-Host "✅ PUT Product successful: $($response.StatusCode)" -ForegroundColor Green
    $updatedProduct = $response.Content | ConvertFrom-Json
    Write-Host "   Updated Name: $($updatedProduct.product.name)" -ForegroundColor Green
    Write-Host "   Updated Price: $($updatedProduct.product.price)" -ForegroundColor Green
    Write-Host "   Updated Stock: $($updatedProduct.product.stock)" -ForegroundColor Green
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "❌ PUT Product failed: $statusCode" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 7: Get all products again (should now have 1 product)
Write-Host "`n7️⃣ Testing GET /api/vendor/products (After Create)" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/vendor/products" -WebSession $session -Method GET
    Write-Host "✅ GET Products successful: $($response.StatusCode)" -ForegroundColor Green
    $products = $response.Content | ConvertFrom-Json
    Write-Host "   Products count: $($products.count)" -ForegroundColor Green
    Write-Host "   Products: $($products.products.Count)" -ForegroundColor Green
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "❌ GET Products failed: $statusCode" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 8: Delete the product
Write-Host "`n8️⃣ Testing DELETE /api/vendor/products/$productId" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/vendor/products/$productId" -WebSession $session -Method DELETE
    Write-Host "✅ DELETE Product successful: $($response.StatusCode)" -ForegroundColor Green
    $deleteResult = $response.Content | ConvertFrom-Json
    Write-Host "   Message: $($deleteResult.message)" -ForegroundColor Green
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "❌ DELETE Product failed: $statusCode" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 9: Get all products again (should be empty after delete)
Write-Host "`n9️⃣ Testing GET /api/vendor/products (After Delete)" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/vendor/products" -WebSession $session -Method GET
    Write-Host "✅ GET Products successful: $($response.StatusCode)" -ForegroundColor Green
    $products = $response.Content | ConvertFrom-Json
    Write-Host "   Products count: $($products.count)" -ForegroundColor Green
    Write-Host "   Products: $($products.products.Count)" -ForegroundColor Green
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "❌ GET Products failed: $statusCode" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🏁 Vendor Products API Testing Complete!" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan 