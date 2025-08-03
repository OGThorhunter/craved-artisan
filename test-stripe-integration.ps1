# Test Stripe Connect Integration - Craved Artisan
# This script tests the complete Stripe Connect workflow

Write-Host "🧪 Testing Stripe Connect Integration" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Configuration
$API_BASE = "http://localhost:3001"
$CLIENT_BASE = "http://localhost:5174"

# Test data
$TEST_VENDOR_PROFILE_ID = "test-vendor-profile-id"
$TEST_EMAIL = "test-vendor@example.com"
$TEST_BUSINESS_NAME = "Test Artisan Business"
$TEST_ORDER_ID = "test-order-id"
$TEST_AMOUNT = 100.00

Write-Host "`n📋 Test Configuration:" -ForegroundColor Yellow
Write-Host "API Base: $API_BASE"
Write-Host "Client Base: $CLIENT_BASE"
Write-Host "Test Vendor Profile ID: $TEST_VENDOR_PROFILE_ID"
Write-Host "Test Amount: `$$TEST_AMOUNT"

# Function to make API requests
function Invoke-TestAPI {
    param(
        [string]$Method,
        [string]$Endpoint,
        [object]$Body = $null,
        [hashtable]$Headers = @{}
    )
    
    $uri = "$API_BASE$Endpoint"
    $headers["Content-Type"] = "application/json"
    
    try {
        if ($Body) {
            $jsonBody = $Body | ConvertTo-Json -Depth 10
            $response = Invoke-RestMethod -Uri $uri -Method $Method -Body $jsonBody -Headers $headers
        } else {
            $response = Invoke-RestMethod -Uri $uri -Method $Method -Headers $headers
        }
        return @{ Success = $true; Data = $response }
    }
    catch {
        return @{ Success = $false; Error = $_.Exception.Message; StatusCode = $_.Exception.Response.StatusCode.value__ }
    }
}

# Test 1: Get Commission Rate
Write-Host "`n🔍 Test 1: Getting Commission Rate" -ForegroundColor Green
$commissionTest = Invoke-TestAPI -Method "GET" -Endpoint "/api/stripe/commission-rate"

if ($commissionTest.Success) {
    Write-Host "✅ Commission rate retrieved successfully" -ForegroundColor Green
    Write-Host "   Rate: $($commissionTest.Data.commissionRate)" -ForegroundColor Gray
    Write-Host "   Percentage: $($commissionTest.Data.percentage)" -ForegroundColor Gray
} else {
    Write-Host "❌ Failed to get commission rate" -ForegroundColor Red
    Write-Host "   Error: $($commissionTest.Error)" -ForegroundColor Red
}

# Test 2: Calculate Commission
Write-Host "`n🧮 Test 2: Calculating Commission" -ForegroundColor Green
$calculateTest = Invoke-TestAPI -Method "POST" -Endpoint "/api/stripe/calculate-commission" -Body @{
    amount = $TEST_AMOUNT
}

if ($calculateTest.Success) {
    Write-Host "✅ Commission calculation successful" -ForegroundColor Green
    Write-Host "   Original Amount: `$$($calculateTest.Data.originalAmount)" -ForegroundColor Gray
    Write-Host "   Commission Amount: `$$($calculateTest.Data.commissionAmount)" -ForegroundColor Gray
    Write-Host "   Vendor Payout: `$$($calculateTest.Data.vendorPayoutAmount)" -ForegroundColor Gray
    Write-Host "   Commission Rate: $($calculateTest.Data.commissionPercentage)" -ForegroundColor Gray
} else {
    Write-Host "❌ Failed to calculate commission" -ForegroundColor Red
    Write-Host "   Error: $($calculateTest.Error)" -ForegroundColor Red
}

# Test 3: Create Connect Account (requires authentication)
Write-Host "`n🏦 Test 3: Creating Stripe Connect Account" -ForegroundColor Green
Write-Host "   Note: This test requires authentication and will likely fail without proper session" -ForegroundColor Yellow

$connectAccountTest = Invoke-TestAPI -Method "POST" -Endpoint "/api/stripe/create-connect-account" -Body @{
    vendorProfileId = $TEST_VENDOR_PROFILE_ID
    email = $TEST_EMAIL
    businessName = $TEST_BUSINESS_NAME
}

if ($connectAccountTest.Success) {
    Write-Host "✅ Connect account created successfully" -ForegroundColor Green
    Write-Host "   Account ID: $($connectAccountTest.Data.accountId)" -ForegroundColor Gray
    Write-Host "   Status: $($connectAccountTest.Data.status)" -ForegroundColor Gray
} else {
    Write-Host "⚠️  Connect account creation failed (expected without auth)" -ForegroundColor Yellow
    Write-Host "   Status Code: $($connectAccountTest.StatusCode)" -ForegroundColor Gray
    Write-Host "   Error: $($connectAccountTest.Error)" -ForegroundColor Gray
}

# Test 4: Get Account Status (requires authentication)
Write-Host "`n📊 Test 4: Getting Account Status" -ForegroundColor Green
Write-Host "   Note: This test requires authentication and will likely fail without proper session" -ForegroundColor Yellow

$statusTest = Invoke-TestAPI -Method "GET" -Endpoint "/api/stripe/account-status/$TEST_VENDOR_PROFILE_ID"

if ($statusTest.Success) {
    Write-Host "✅ Account status retrieved successfully" -ForegroundColor Green
    Write-Host "   Status: $($statusTest.Data.status)" -ForegroundColor Gray
    if ($statusTest.Data.chargesEnabled -ne $null) {
        Write-Host "   Charges Enabled: $($statusTest.Data.chargesEnabled)" -ForegroundColor Gray
    }
} else {
    Write-Host "⚠️  Account status retrieval failed (expected without auth)" -ForegroundColor Yellow
    Write-Host "   Status Code: $($statusTest.StatusCode)" -ForegroundColor Gray
    Write-Host "   Error: $($statusTest.Error)" -ForegroundColor Gray
}

# Test 5: Create Payment Intent (requires authentication)
Write-Host "`n💳 Test 5: Creating Payment Intent" -ForegroundColor Green
Write-Host "   Note: This test requires authentication and will likely fail without proper session" -ForegroundColor Yellow

$paymentIntentTest = Invoke-TestAPI -Method "POST" -Endpoint "/api/stripe/create-payment-intent" -Body @{
    orderId = $TEST_ORDER_ID
    amount = $TEST_AMOUNT
    currency = "usd"
}

if ($paymentIntentTest.Success) {
    Write-Host "✅ Payment intent created successfully" -ForegroundColor Green
    Write-Host "   Payment Intent ID: $($paymentIntentTest.Data.paymentIntentId)" -ForegroundColor Gray
    Write-Host "   Client Secret: $($paymentIntentTest.Data.clientSecret.Substring(0, 20))..." -ForegroundColor Gray
} else {
    Write-Host "⚠️  Payment intent creation failed (expected without auth)" -ForegroundColor Yellow
    Write-Host "   Status Code: $($paymentIntentTest.StatusCode)" -ForegroundColor Gray
    Write-Host "   Error: $($paymentIntentTest.Error)" -ForegroundColor Gray
}

# Test 6: Health Check
Write-Host "`n🏥 Test 6: API Health Check" -ForegroundColor Green
$healthTest = Invoke-TestAPI -Method "GET" -Endpoint "/health"

if ($healthTest.Success) {
    Write-Host "✅ API is healthy" -ForegroundColor Green
    Write-Host "   Status: $($healthTest.Data.status)" -ForegroundColor Gray
    Write-Host "   Service: $($healthTest.Data.service)" -ForegroundColor Gray
} else {
    Write-Host "❌ API health check failed" -ForegroundColor Red
    Write-Host "   Error: $($healthTest.Error)" -ForegroundColor Red
}

# Summary
Write-Host "`n📈 Test Summary" -ForegroundColor Cyan
Write-Host "=============" -ForegroundColor Cyan

$totalTests = 6
$passedTests = 0
$failedTests = 0
$authRequiredTests = 0

# Count results (simplified logic)
if ($commissionTest.Success) { $passedTests++ }
if ($calculateTest.Success) { $passedTests++ }
if ($connectAccountTest.StatusCode -eq 401 -or $connectAccountTest.StatusCode -eq 403) { $authRequiredTests++ }
if ($statusTest.StatusCode -eq 401 -or $statusTest.StatusCode -eq 403) { $authRequiredTests++ }
if ($paymentIntentTest.StatusCode -eq 401 -or $paymentIntentTest.StatusCode -eq 403) { $authRequiredTests++ }
if ($healthTest.Success) { $passedTests++ }

$failedTests = $totalTests - $passedTests - $authRequiredTests

Write-Host "Total Tests: $totalTests" -ForegroundColor White
Write-Host "Passed: $passedTests" -ForegroundColor Green
Write-Host "Failed: $failedTests" -ForegroundColor Red
Write-Host "Auth Required: $authRequiredTests" -ForegroundColor Yellow

Write-Host "`n🎯 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Set up Stripe test keys in environment variables" -ForegroundColor White
Write-Host "2. Create a test vendor profile in the database" -ForegroundColor White
Write-Host "3. Authenticate as a vendor user" -ForegroundColor White
Write-Host "4. Test the complete onboarding flow" -ForegroundColor White
Write-Host "5. Test payment processing with test cards" -ForegroundColor White

Write-Host "`n📚 Documentation:" -ForegroundColor Cyan
Write-Host "See STRIPE_CONNECT_IMPLEMENTATION.md for detailed setup instructions" -ForegroundColor White

Write-Host "`n✅ Stripe Connect Integration Test Complete!" -ForegroundColor Green 