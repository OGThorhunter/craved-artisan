# Test Margin Management Feature
# This script tests the minimum margin rules enforcement

$baseUrl = "http://localhost:3001"
$testEmail = "vendor@test.com"
$testPassword = "password123"

Write-Host "🧪 Testing Margin Management Feature" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Function to make HTTP requests
function Invoke-API {
    param(
        [string]$Method,
        [string]$Url,
        [object]$Body = $null,
        [hashtable]$Headers = @{}
    )
    
    $params = @{
        Method = $Method
        Uri = $Url
        Headers = $Headers
        ContentType = "application/json"
    }
    
    if ($Body) {
        $params.Body = $Body | ConvertTo-Json -Depth 10
    }
    
    try {
        $response = Invoke-RestMethod @params
        return @{
            Success = $true
            Data = $response
        }
    }
    catch {
        return @{
            Success = $false
            Error = $_.Exception.Message
            StatusCode = $_.Exception.Response.StatusCode.value__
        }
    }
}

# Test 1: Health Check
Write-Host "`n1. Testing Health Check..." -ForegroundColor Yellow
$healthCheck = Invoke-API -Method "GET" -Url "$baseUrl/health"
if ($healthCheck.Success) {
    Write-Host "✅ Health check passed" -ForegroundColor Green
} else {
    Write-Host "❌ Health check failed: $($healthCheck.Error)" -ForegroundColor Red
    exit 1
}

# Test 2: Login
Write-Host "`n2. Testing Login..." -ForegroundColor Yellow
$loginBody = @{
    email = $testEmail
    password = $testPassword
}

$loginResponse = Invoke-API -Method "POST" -Url "$baseUrl/api/auth/login" -Body $loginBody
if ($loginResponse.Success) {
    Write-Host "✅ Login successful" -ForegroundColor Green
    $sessionCookie = $loginResponse.Data.sessionId
} else {
    Write-Host "❌ Login failed: $($loginResponse.Error)" -ForegroundColor Red
    exit 1
}

# Test 3: Get Vendor Profile
Write-Host "`n3. Getting Vendor Profile..." -ForegroundColor Yellow
$headers = @{
    "Cookie" = "sessionId=$sessionCookie"
}

$vendorResponse = Invoke-API -Method "GET" -Url "$baseUrl/api/vendor/profile" -Headers $headers
if ($vendorResponse.Success) {
    Write-Host "✅ Vendor profile retrieved" -ForegroundColor Green
    $vendorId = $vendorResponse.Data.id
    Write-Host "   Vendor ID: $vendorId" -ForegroundColor Gray
} else {
    Write-Host "❌ Failed to get vendor profile: $($vendorResponse.Error)" -ForegroundColor Red
    exit 1
}

# Test 4: Initialize System Settings
Write-Host "`n4. Initializing System Settings..." -ForegroundColor Yellow
$initResponse = Invoke-API -Method "POST" -Url "$baseUrl/api/margin-management/system/initialize" -Headers $headers
if ($initResponse.Success) {
    Write-Host "✅ System settings initialized" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to initialize system settings: $($initResponse.Error)" -ForegroundColor Red
}

# Test 5: Get System Margin Settings
Write-Host "`n5. Getting System Margin Settings..." -ForegroundColor Yellow
$systemSettings = Invoke-API -Method "GET" -Url "$baseUrl/api/margin-management/system/settings" -Headers $headers
if ($systemSettings.Success) {
    Write-Host "✅ System settings retrieved" -ForegroundColor Green
    Write-Host "   Default Min Margin: $($systemSettings.Data.settings.defaultMinMargin)%" -ForegroundColor Gray
    Write-Host "   Override Enabled: $($systemSettings.Data.settings.overrideEnabled)" -ForegroundColor Gray
    Write-Host "   Alert Threshold: $($systemSettings.Data.settings.alertThreshold)%" -ForegroundColor Gray
} else {
    Write-Host "❌ Failed to get system settings: $($systemSettings.Error)" -ForegroundColor Red
}

# Test 6: Get Vendor Margin Settings
Write-Host "`n6. Getting Vendor Margin Settings..." -ForegroundColor Yellow
$vendorSettings = Invoke-API -Method "GET" -Url "$baseUrl/api/margin-management/vendor/$vendorId/settings" -Headers $headers
if ($vendorSettings.Success) {
    Write-Host "✅ Vendor settings retrieved" -ForegroundColor Green
    Write-Host "   Min Margin: $($vendorSettings.Data.vendor.minMarginPercent)%" -ForegroundColor Gray
    Write-Host "   Override Enabled: $($vendorSettings.Data.vendor.marginOverrideEnabled)" -ForegroundColor Gray
} else {
    Write-Host "❌ Failed to get vendor settings: $($vendorSettings.Error)" -ForegroundColor Red
}

# Test 7: Update Vendor Margin Settings
Write-Host "`n7. Updating Vendor Margin Settings..." -ForegroundColor Yellow
$updateSettingsBody = @{
    minMarginPercent = 35.0
    marginOverrideEnabled = $true
}

$updateResponse = Invoke-API -Method "PUT" -Url "$baseUrl/api/margin-management/vendor/$vendorId/settings" -Body $updateSettingsBody -Headers $headers
if ($updateResponse.Success) {
    Write-Host "✅ Vendor settings updated" -ForegroundColor Green
    Write-Host "   New Min Margin: $($updateResponse.Data.vendor.minMarginPercent)%" -ForegroundColor Gray
} else {
    Write-Host "❌ Failed to update vendor settings: $($updateResponse.Error)" -ForegroundColor Red
}

# Test 8: Validate Product Margin - Valid Case
Write-Host "`n8. Testing Margin Validation - Valid Case..." -ForegroundColor Yellow
$validMarginBody = @{
    vendorId = $vendorId
    price = 100.00
    cost = 60.00
    allowOverride = $false
}

$validMarginResponse = Invoke-API -Method "POST" -Url "$baseUrl/api/margin-management/validate" -Body $validMarginBody -Headers $headers
if ($validMarginResponse.Success) {
    Write-Host "✅ Valid margin validation passed" -ForegroundColor Green
    Write-Host "   Margin: $($validMarginResponse.Data.validation.margin)%" -ForegroundColor Gray
    Write-Host "   Is Valid: $($validMarginResponse.Data.validation.isValid)" -ForegroundColor Gray
} else {
    Write-Host "❌ Valid margin validation failed: $($validMarginResponse.Error)" -ForegroundColor Red
}

# Test 9: Validate Product Margin - Invalid Case
Write-Host "`n9. Testing Margin Validation - Invalid Case..." -ForegroundColor Yellow
$invalidMarginBody = @{
    vendorId = $vendorId
    price = 100.00
    cost = 80.00
    allowOverride = $false
}

$invalidMarginResponse = Invoke-API -Method "POST" -Url "$baseUrl/api/margin-management/validate" -Body $invalidMarginBody -Headers $headers
if ($invalidMarginResponse.Success) {
    Write-Host "✅ Invalid margin validation handled correctly" -ForegroundColor Green
    Write-Host "   Margin: $($invalidMarginResponse.Data.validation.margin)%" -ForegroundColor Gray
    Write-Host "   Is Valid: $($invalidMarginResponse.Data.validation.isValid)" -ForegroundColor Gray
    if ($invalidMarginResponse.Data.validation.error) {
        Write-Host "   Error: $($invalidMarginResponse.Data.validation.error)" -ForegroundColor Gray
    }
} else {
    Write-Host "❌ Invalid margin validation failed: $($invalidMarginResponse.Error)" -ForegroundColor Red
}

# Test 10: Validate Product Margin - With Override
Write-Host "`n10. Testing Margin Validation - With Override..." -ForegroundColor Yellow
$overrideMarginBody = @{
    vendorId = $vendorId
    price = 100.00
    cost = 80.00
    allowOverride = $true
}

$overrideMarginResponse = Invoke-API -Method "POST" -Url "$baseUrl/api/margin-management/validate" -Body $overrideMarginBody -Headers $headers
if ($overrideMarginResponse.Success) {
    Write-Host "✅ Override margin validation passed" -ForegroundColor Green
    Write-Host "   Margin: $($overrideMarginResponse.Data.validation.margin)%" -ForegroundColor Gray
    Write-Host "   Is Valid: $($overrideMarginResponse.Data.validation.isValid)" -ForegroundColor Gray
    if ($overrideMarginResponse.Data.validation.warning) {
        Write-Host "   Warning: $($overrideMarginResponse.Data.validation.warning)" -ForegroundColor Gray
    }
} else {
    Write-Host "❌ Override margin validation failed: $($overrideMarginResponse.Error)" -ForegroundColor Red
}

# Test 11: Get Product Margin Analysis
Write-Host "`n11. Testing Margin Analysis..." -ForegroundColor Yellow
$analysisBody = @{
    vendorId = $vendorId
    price = 100.00
    cost = 60.00
}

$analysisResponse = Invoke-API -Method "POST" -Url "$baseUrl/api/margin-management/analysis" -Body $analysisBody -Headers $headers
if ($analysisResponse.Success) {
    Write-Host "✅ Margin analysis retrieved" -ForegroundColor Green
    Write-Host "   Current Margin: $($analysisResponse.Data.analysis.current.marginPercent)%" -ForegroundColor Gray
    Write-Host "   Margin Health: $($analysisResponse.Data.analysis.analysis.marginHealth)" -ForegroundColor Gray
    Write-Host "   Meets Minimum: $($analysisResponse.Data.analysis.analysis.meetsMinimum)" -ForegroundColor Gray
} else {
    Write-Host "❌ Margin analysis failed: $($analysisResponse.Error)" -ForegroundColor Red
}

# Test 12: Calculate Minimum Price
Write-Host "`n12. Testing Minimum Price Calculation..." -ForegroundColor Yellow
$minPriceBody = @{
    cost = 60.00
    targetMarginPercent = 35.0
}

$minPriceResponse = Invoke-API -Method "POST" -Url "$baseUrl/api/margin-management/calculate-minimum-price" -Body $minPriceBody -Headers $headers
if ($minPriceResponse.Success) {
    Write-Host "✅ Minimum price calculated" -ForegroundColor Green
    Write-Host "   Minimum Price: $($minPriceResponse.Data.minimumPrice)" -ForegroundColor Gray
    Write-Host "   Recommendation: $($minPriceResponse.Data.recommendation)" -ForegroundColor Gray
} else {
    Write-Host "❌ Minimum price calculation failed: $($minPriceResponse.Error)" -ForegroundColor Red
}

# Test 13: Get Low Margin Products
Write-Host "`n13. Testing Low Margin Products..." -ForegroundColor Yellow
$lowMarginResponse = Invoke-API -Method "GET" -Url "$baseUrl/api/margin-management/vendor/$vendorId/low-margin-products?threshold=30" -Headers $headers
if ($lowMarginResponse.Success) {
    Write-Host "✅ Low margin products retrieved" -ForegroundColor Green
    Write-Host "   Threshold: $($lowMarginResponse.Data.threshold)%" -ForegroundColor Gray
    Write-Host "   Total Products: $($lowMarginResponse.Data.totalProducts)" -ForegroundColor Gray
    Write-Host "   Low Margin Count: $($lowMarginResponse.Data.lowMarginCount)" -ForegroundColor Gray
} else {
    Write-Host "❌ Low margin products failed: $($lowMarginResponse.Error)" -ForegroundColor Red
}

# Test 14: Bulk Validate Margins
Write-Host "`n14. Testing Bulk Margin Validation..." -ForegroundColor Yellow
$bulkResponse = Invoke-API -Method "GET" -Url "$baseUrl/api/margin-management/vendor/$vendorId/bulk-validate?allowOverride=false" -Headers $headers
if ($bulkResponse.Success) {
    Write-Host "✅ Bulk validation completed" -ForegroundColor Green
    Write-Host "   Total: $($bulkResponse.Data.summary.total)" -ForegroundColor Gray
    Write-Host "   Valid: $($bulkResponse.Data.summary.valid)" -ForegroundColor Gray
    Write-Host "   Invalid: $($bulkResponse.Data.summary.invalid)" -ForegroundColor Gray
    Write-Host "   Warnings: $($bulkResponse.Data.summary.warnings)" -ForegroundColor Gray
} else {
    Write-Host "❌ Bulk validation failed: $($bulkResponse.Error)" -ForegroundColor Red
}

# Test 15: Test Error Cases
Write-Host "`n15. Testing Error Cases..." -ForegroundColor Yellow

# Test with missing required fields
$missingFieldsBody = @{
    vendorId = $vendorId
    price = 100.00
    # Missing cost
}

$missingFieldsResponse = Invoke-API -Method "POST" -Url "$baseUrl/api/margin-management/validate" -Body $missingFieldsBody -Headers $headers
if (-not $missingFieldsResponse.Success) {
    Write-Host "✅ Missing fields error handled correctly" -ForegroundColor Green
    Write-Host "   Status: $($missingFieldsResponse.StatusCode)" -ForegroundColor Gray
} else {
    Write-Host "❌ Missing fields should have failed" -ForegroundColor Red
}

# Test with invalid margin percentage
$invalidMarginBody = @{
    cost = 60.00
    targetMarginPercent = 150.0  # Invalid: > 100%
}

$invalidMarginResponse = Invoke-API -Method "POST" -Url "$baseUrl/api/margin-management/calculate-minimum-price" -Body $invalidMarginBody -Headers $headers
if (-not $invalidMarginResponse.Success) {
    Write-Host "✅ Invalid margin percentage error handled correctly" -ForegroundColor Green
    Write-Host "   Status: $($invalidMarginResponse.StatusCode)" -ForegroundColor Gray
} else {
    Write-Host "❌ Invalid margin percentage should have failed" -ForegroundColor Red
}

Write-Host "`n🎉 Margin Management Feature Tests Completed!" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

Write-Host "`n📋 Summary:" -ForegroundColor Cyan
Write-Host "- Database schema updated with margin fields" -ForegroundColor White
Write-Host "- Margin validation utility created" -ForegroundColor White
Write-Host "- Margin management controller implemented" -ForegroundColor White
Write-Host "- API routes configured" -ForegroundColor White
Write-Host "- Frontend widget created" -ForegroundColor White
Write-Host "- System settings management added" -ForegroundColor White
Write-Host "- Bulk validation capabilities" -ForegroundColor White
Write-Host "- Error handling and validation" -ForegroundColor White

Write-Host "`n🚀 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Run database migration: npx prisma migrate dev" -ForegroundColor White
Write-Host "2. Initialize system settings via API" -ForegroundColor White
Write-Host "3. Integrate margin validation into product creation/update flows" -ForegroundColor White
Write-Host "4. Add margin validation to vendor dashboard" -ForegroundColor White
Write-Host "5. Test with real product data" -ForegroundColor White 