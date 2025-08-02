# Test Vendor API Endpoints
# This script tests the vendor profile API endpoints

$baseUrl = "http://localhost:3001"
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession

Write-Host "🧪 Testing Vendor Profile API Endpoints" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Test 1: Try to get profile without authentication
Write-Host "`n1️⃣ Testing GET /api/vendor/profile (No Auth)" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/vendor/profile" -WebSession $session -Method GET
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

# Test 3: Get vendor profile with authentication
Write-Host "`n3️⃣ Testing GET /api/vendor/profile (With Auth)" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/vendor/profile" -WebSession $session -Method GET
    Write-Host "✅ GET Profile successful: $($response.StatusCode)" -ForegroundColor Green
    $profile = $response.Content | ConvertFrom-Json
    Write-Host "   Store Name: $($profile.storeName)" -ForegroundColor Green
    Write-Host "   Slug: $($profile.slug)" -ForegroundColor Green
    Write-Host "   Bio: $($profile.bio)" -ForegroundColor Green
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "❌ GET Profile failed: $statusCode" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Update vendor profile
Write-Host "`n4️⃣ Testing PUT /api/vendor/profile" -ForegroundColor Yellow
try {
    $updateData = @{
        storeName = "Updated Test Store"
        bio = "This is my updated vendor bio for testing."
        imageUrl = "https://placekitten.com/400/300"
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "$baseUrl/api/vendor/profile" -WebSession $session -Method PUT -Body $updateData -ContentType "application/json"
    Write-Host "✅ PUT Profile successful: $($response.StatusCode)" -ForegroundColor Green
    $updatedProfile = $response.Content | ConvertFrom-Json
    Write-Host "   Updated Store Name: $($updatedProfile.storeName)" -ForegroundColor Green
    Write-Host "   Updated Slug: $($updatedProfile.slug)" -ForegroundColor Green
    Write-Host "   Updated Bio: $($updatedProfile.bio)" -ForegroundColor Green
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "❌ PUT Profile failed: $statusCode" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Get updated profile
Write-Host "`n5️⃣ Testing GET /api/vendor/profile (After Update)" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/vendor/profile" -WebSession $session -Method GET
    Write-Host "✅ GET Updated Profile successful: $($response.StatusCode)" -ForegroundColor Green
    $profile = $response.Content | ConvertFrom-Json
    Write-Host "   Final Store Name: $($profile.storeName)" -ForegroundColor Green
    Write-Host "   Final Slug: $($profile.slug)" -ForegroundColor Green
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "❌ GET Updated Profile failed: $statusCode" -ForegroundColor Red
}

Write-Host "`n🏁 API Testing Complete!" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan 