# Debug Session Issue
Write-Host "Debugging Session Issue..." -ForegroundColor Green

# Test 1: Login and check session
Write-Host "`nTest 1: Login and check session" -ForegroundColor Yellow
try {
    $loginData = @{
        email = "vendor1@example.com"
        password = "password123"
    } | ConvertTo-Json

    Write-Host "Attempting login..." -ForegroundColor Gray
    $loginResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    $sessionCookie = $loginResponse.Headers['Set-Cookie']
    
    Write-Host "Login successful" -ForegroundColor Green
    Write-Host "Session cookie: $sessionCookie" -ForegroundColor Gray
    
    # Check session
    $headers = @{
        "Cookie" = $sessionCookie
    }
    
    Write-Host "Checking session..." -ForegroundColor Gray
    $sessionResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/auth/session" -Method GET -Headers $headers
    $sessionData = $sessionResponse.Content | ConvertFrom-Json
    
    Write-Host "Session data: $($sessionData | ConvertTo-Json)" -ForegroundColor Gray
    
} catch {
    Write-Host "FAILED: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Response: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}

# Test 2: Try accessing a simple protected endpoint
Write-Host "`nTest 2: Access protected endpoint" -ForegroundColor Yellow
try {
    $headers = @{
        "Cookie" = $sessionCookie
    }
    
    Write-Host "Accessing protected endpoint..." -ForegroundColor Gray
    $protectedResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/protected/test" -Method GET -Headers $headers
    $protectedData = $protectedResponse.Content | ConvertFrom-Json
    
    Write-Host "Protected endpoint response: $($protectedData | ConvertTo-Json)" -ForegroundColor Gray
    
} catch {
    Write-Host "FAILED: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Response: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
} 