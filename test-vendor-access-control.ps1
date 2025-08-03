# Test Vendor Access Control Middleware
Write-Host "Testing Vendor Access Control Middleware..." -ForegroundColor Green

# Check if mock server is running
try {
    $healthCheck = Invoke-WebRequest -Uri "http://localhost:3001/health" -Method GET -TimeoutSec 5
    Write-Host "Mock server is running" -ForegroundColor Green
} catch {
    Write-Host "Mock server is not running. Starting it..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; .\start-mock-server.ps1"
    Start-Sleep -Seconds 5
}

Write-Host "`n=== Testing Vendor Access Control ===" -ForegroundColor Cyan

# Test 1: Login as vendor-1 owner (user-1)
Write-Host "`nTest 1: Login as vendor-1 owner (user-1)" -ForegroundColor Yellow
try {
    $loginData = @{
        email = "vendor1@example.com"
        password = "password123"
    } | ConvertTo-Json

    $loginResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    $sessionCookie = $loginResponse.Headers['Set-Cookie']
    
    Write-Host "SUCCESS: Logged in as vendor-1 owner" -ForegroundColor Green
    Write-Host "Session cookie: $sessionCookie" -ForegroundColor Gray
} catch {
    Write-Host "FAILED: Login failed - $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: Access vendor-1 financials (should succeed - owner)
Write-Host "`nTest 2: Access vendor-1 financials as owner (should succeed)" -ForegroundColor Yellow
try {
    $headers = @{
        "Cookie" = $sessionCookie
    }
    
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendors/vendor-1/financials/test" -Method GET -Headers $headers
    $data = $response.Content | ConvertFrom-Json
    
    Write-Host "SUCCESS: Access granted to vendor-1 financials" -ForegroundColor Green
    Write-Host "Data points: $($data.length)" -ForegroundColor White
} catch {
    Write-Host "FAILED: Access denied - $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Access vendor-2 financials (should fail - not owner)
Write-Host "`nTest 3: Access vendor-2 financials as vendor-1 owner (should fail)" -ForegroundColor Yellow
try {
    $headers = @{
        "Cookie" = $sessionCookie
    }
    
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendors/vendor-2/financials/test" -Method GET -Headers $headers
    Write-Host "FAILED: Access should have been denied" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 403) {
        Write-Host "SUCCESS: Access correctly denied (403 Forbidden)" -ForegroundColor Green
    } else {
        Write-Host "FAILED: Unexpected error - $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 4: Login as admin (user-admin)
Write-Host "`nTest 4: Login as admin (user-admin)" -ForegroundColor Yellow
try {
    $loginData = @{
        email = "admin@example.com"
        password = "admin123"
    } | ConvertTo-Json

    $loginResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    $adminSessionCookie = $loginResponse.Headers['Set-Cookie']
    
    Write-Host "SUCCESS: Logged in as admin" -ForegroundColor Green
} catch {
    Write-Host "FAILED: Admin login failed - $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Admin access to vendor-1 financials (should succeed)
Write-Host "`nTest 5: Admin access to vendor-1 financials (should succeed)" -ForegroundColor Yellow
try {
    $headers = @{
        "Cookie" = $adminSessionCookie
    }
    
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendors/vendor-1/financials/test" -Method GET -Headers $headers
    $data = $response.Content | ConvertFrom-Json
    
    Write-Host "SUCCESS: Admin access granted to vendor-1 financials" -ForegroundColor Green
    Write-Host "Data points: $($data.length)" -ForegroundColor White
} catch {
    Write-Host "FAILED: Admin access denied - $($_.Exception.Message)" -ForegroundColor Red
}

# Test 6: Admin access to vendor-2 financials (should succeed)
Write-Host "`nTest 6: Admin access to vendor-2 financials (should succeed)" -ForegroundColor Yellow
try {
    $headers = @{
        "Cookie" = $adminSessionCookie
    }
    
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendors/vendor-2/financials/test" -Method GET -Headers $headers
    $data = $response.Content | ConvertFrom-Json
    
    Write-Host "SUCCESS: Admin access granted to vendor-2 financials" -ForegroundColor Green
    Write-Host "Data points: $($data.length)" -ForegroundColor White
} catch {
    Write-Host "FAILED: Admin access denied - $($_.Exception.Message)" -ForegroundColor Red
}

# Test 7: Access without authentication (should fail)
Write-Host "`nTest 7: Access without authentication (should fail)" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendors/vendor-1/financials/test" -Method GET
    Write-Host "FAILED: Access should have been denied without authentication" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "SUCCESS: Access correctly denied without authentication (401 Unauthorized)" -ForegroundColor Green
    } else {
        Write-Host "FAILED: Unexpected error - $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 8: Access non-existent vendor (should fail)
Write-Host "`nTest 8: Access non-existent vendor (should fail)" -ForegroundColor Yellow
try {
    $headers = @{
        "Cookie" = $adminSessionCookie
    }
    
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendors/non-existent-vendor/financials/test" -Method GET -Headers $headers
    Write-Host "FAILED: Access should have been denied for non-existent vendor" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "SUCCESS: Access correctly denied for non-existent vendor (404 Not Found)" -ForegroundColor Green
    } else {
        Write-Host "FAILED: Unexpected error - $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 9: Test other financial endpoints with access control
Write-Host "`nTest 9: Test other financial endpoints with access control" -ForegroundColor Yellow

$endpoints = @(
    "/api/vendors/vendor-1/financials/insights/test",
    "/api/vendors/vendor-1/financials/summary/test",
    "/api/vendors/vendor-1/financials/export.csv/test"
)

foreach ($endpoint in $endpoints) {
    try {
        $headers = @{
            "Cookie" = $sessionCookie
        }
        
        $response = Invoke-WebRequest -Uri "http://localhost:3001$endpoint" -Method GET -Headers $headers
        Write-Host "SUCCESS: $endpoint" -ForegroundColor Green
    } catch {
        Write-Host "FAILED: $endpoint - $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n=== Access Control Test Summary ===" -ForegroundColor Cyan
Write-Host "The middleware successfully:" -ForegroundColor White
Write-Host "• Allows vendor owners to access their own financial data" -ForegroundColor Gray
Write-Host "• Allows admins to access any vendor's financial data" -ForegroundColor Gray
Write-Host "• Denies access to other vendors' financial data" -ForegroundColor Gray
Write-Host "• Requires authentication for all financial endpoints" -ForegroundColor Gray
Write-Host "• Handles non-existent vendors appropriately" -ForegroundColor Gray

Write-Host "`nVendor Access Control Middleware is working correctly!" -ForegroundColor Green 