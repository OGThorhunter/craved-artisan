# Test Vendor API Endpoints
# This script tests the /api/vendor/:vendorId endpoints

$baseUrl = "http://localhost:3001"

Write-Host "🧪 Testing Vendor API Endpoints" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# Test 1: Get vendor details
Write-Host "`n1. Testing GET /api/vendor/vendor_001" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/vendor/vendor_001" -Method GET
    Write-Host "✅ Success!" -ForegroundColor Green
    Write-Host "   Vendor: $($response.data.name)" -ForegroundColor Cyan
    Write-Host "   Location: $($response.data.location)" -ForegroundColor Cyan
    Write-Host "   Products: $($response.data.products.Count)" -ForegroundColor Cyan
    Write-Host "   Reviews: $($response.data.reviews.Count)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Get vendor products with filtering
Write-Host "`n2. Testing GET /api/vendor/vendor_001/products?inStock=true&limit=2" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/vendor/vendor_001/products?inStock=true&limit=2" -Method GET
    Write-Host "✅ Success!" -ForegroundColor Green
    Write-Host "   Products returned: $($response.data.products.Count)" -ForegroundColor Cyan
    Write-Host "   Total products: $($response.data.pagination.total)" -ForegroundColor Cyan
    Write-Host "   Has more: $($response.data.pagination.hasMore)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Get vendor products with sorting
Write-Host "`n3. Testing GET /api/vendor/vendor_001/products?sortBy=price&sortOrder=desc" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/vendor/vendor_001/products?sortBy=price&sortOrder=desc" -Method GET
    Write-Host "✅ Success!" -ForegroundColor Green
    Write-Host "   First product: $($response.data.products[0].name) - $$($response.data.products[0].price)" -ForegroundColor Cyan
    Write-Host "   Last product: $($response.data.products[-1].name) - $$($response.data.products[-1].price)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Get vendor reviews
Write-Host "`n4. Testing GET /api/vendor/vendor_001/reviews" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/vendor/vendor_001/reviews" -Method GET
    Write-Host "✅ Success!" -ForegroundColor Green
    Write-Host "   Reviews returned: $($response.data.reviews.Count)" -ForegroundColor Cyan
    Write-Host "   Total reviews: $($response.data.pagination.total)" -ForegroundColor Cyan
    Write-Host "   First review: $($response.data.reviews[0].text.Substring(0, [Math]::Min(50, $response.data.reviews[0].text.Length)))..." -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Follow vendor
Write-Host "`n5. Testing POST /api/vendor/vendor_001/follow" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/vendor/vendor_001/follow" -Method POST
    Write-Host "✅ Success!" -ForegroundColor Green
    Write-Host "   Message: $($response.message)" -ForegroundColor Cyan
    Write-Host "   Following: $($response.data.isFollowing)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 6: Unfollow vendor
Write-Host "`n6. Testing DELETE /api/vendor/vendor_001/follow" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/vendor/vendor_001/follow" -Method DELETE
    Write-Host "✅ Success!" -ForegroundColor Green
    Write-Host "   Message: $($response.message)" -ForegroundColor Cyan
    Write-Host "   Following: $($response.data.isFollowing)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 7: Get non-existent vendor
Write-Host "`n7. Testing GET /api/vendor/nonexistent" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/vendor/nonexistent" -Method GET
    Write-Host "❌ Should have returned 404" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "✅ Correctly returned 404 for non-existent vendor" -ForegroundColor Green
    } else {
        Write-Host "❌ Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 8: Get second vendor
Write-Host "`n8. Testing GET /api/vendor/vendor_002" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/vendor/vendor_002" -Method GET
    Write-Host "✅ Success!" -ForegroundColor Green
    Write-Host "   Vendor: $($response.data.name)" -ForegroundColor Cyan
    Write-Host "   Location: $($response.data.location)" -ForegroundColor Cyan
    Write-Host "   Products: $($response.data.products.Count)" -ForegroundColor Cyan
    Write-Host "   Values: $($response.data.values -join ', ')" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 Vendor API Testing Complete!" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green 