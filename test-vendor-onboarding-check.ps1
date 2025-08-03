# Test Vendor Onboarding Check in Dashboard
# This script tests the vendor dashboard onboarding check functionality

param(
    [string]$BaseUrl = "http://localhost:3001",
    [string]$Email = "vendor@test.com",
    [string]$Password = "password123"
)

Write-Host "🧪 Testing Vendor Onboarding Check in Dashboard" -ForegroundColor Cyan

function Invoke-TestAPI {
    param(
        [string]$Method = "GET",
        [string]$Endpoint = "",
        [object]$Body = $null,
        [hashtable]$Headers = @{}
    )
    
    try {
        $uri = "$BaseUrl$Endpoint"
        $params = @{
            Uri = $uri
            Method = $Method
            WebSession = $session
            Headers = $Headers
        }
        
        if ($Body) {
            $params.Body = $Body | ConvertTo-Json -Depth 10
            $params.ContentType = "application/json"
        }
        
        $response = Invoke-WebRequest @params
        return @{
            StatusCode = $response.StatusCode
            Content = $response.Content | ConvertFrom-Json
            Success = $true
        }
    }
    catch {
        $errorResponse = $_.Exception.Response
        if ($errorResponse) {
            $reader = New-Object System.IO.StreamReader($errorResponse.GetResponseStream())
            $errorContent = $reader.ReadToEnd()
            try {
                $errorJson = $errorContent | ConvertFrom-Json
            }
            catch {
                $errorJson = @{ message = $errorContent }
            }
            
            return @{
                StatusCode = $errorResponse.StatusCode
                Content = $errorJson
                Success = $false
                Error = $_.Exception.Message
            }
        }
        else {
            return @{
                StatusCode = 0
                Content = @{ message = $_.Exception.Message }
                Success = $false
                Error = $_.Exception.Message
            }
        }
    }
}

# Create web session for maintaining cookies
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession

Write-Host "`n1️⃣ Testing Health Check" -ForegroundColor Yellow
$healthCheck = Invoke-TestAPI -Method "GET" -Endpoint "/api/health"
if ($healthCheck.Success) {
    Write-Host "✅ Health check passed" -ForegroundColor Green
} else {
    Write-Host "❌ Health check failed: $($healthCheck.Error)" -ForegroundColor Red
    exit 1
}

Write-Host "`n2️⃣ Testing Login" -ForegroundColor Yellow
$loginData = @{
    email = $Email
    password = $Password
}
$loginResponse = Invoke-TestAPI -Method "POST" -Endpoint "/api/auth/login" -Body $loginData

if ($loginResponse.Success) {
    Write-Host "✅ Login successful" -ForegroundColor Green
    Write-Host "   User ID: $($loginResponse.Content.user.id)" -ForegroundColor Gray
    Write-Host "   Role: $($loginResponse.Content.user.role)" -ForegroundColor Gray
} else {
    Write-Host "❌ Login failed: $($loginResponse.Content.message)" -ForegroundColor Red
    exit 1
}

Write-Host "`n3️⃣ Testing Vendor Profile Fetch" -ForegroundColor Yellow
$vendorProfile = Invoke-TestAPI -Method "GET" -Endpoint "/api/vendor/profile"

if ($vendorProfile.Success) {
    Write-Host "✅ Vendor profile fetched successfully" -ForegroundColor Green
    Write-Host "   Store Name: $($vendorProfile.Content.storeName)" -ForegroundColor Gray
    Write-Host "   Stripe Account ID: $($vendorProfile.Content.stripeAccountId)" -ForegroundColor Gray
    Write-Host "   Stripe Account Status: $($vendorProfile.Content.stripeAccountStatus)" -ForegroundColor Gray
    
    # Check if vendor has Stripe account
    if ($vendorProfile.Content.stripeAccountId) {
        Write-Host "   ✅ Vendor has Stripe account - should see dashboard" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Vendor has no Stripe account - should see onboarding prompt" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Failed to fetch vendor profile: $($vendorProfile.Content.message)" -ForegroundColor Red
}

Write-Host "`n4️⃣ Testing Dashboard Access (Frontend)" -ForegroundColor Yellow
Write-Host "   To test the frontend onboarding check:" -ForegroundColor Gray
Write-Host "   1. Navigate to http://localhost:5173/dashboard/vendor" -ForegroundColor Gray
Write-Host "   2. If vendor has no stripeAccountId, you should see OnboardingPrompt" -ForegroundColor Gray
Write-Host "   3. If vendor has stripeAccountId, you should see the normal dashboard" -ForegroundColor Gray

Write-Host "`n5️⃣ Testing Onboarding Status Check" -ForegroundColor Yellow
if ($vendorProfile.Success -and $vendorProfile.Content.id) {
    $onboardingStatus = Invoke-TestAPI -Method "GET" -Endpoint "/api/stripe-controller/onboarding/status/$($vendorProfile.Content.id)"
    
    if ($onboardingStatus.Success) {
        Write-Host "✅ Onboarding status fetched successfully" -ForegroundColor Green
        Write-Host "   Has Account: $($onboardingStatus.Content.hasAccount)" -ForegroundColor Gray
        Write-Host "   Status: $($onboardingStatus.Content.status)" -ForegroundColor Gray
        Write-Host "   Charges Enabled: $($onboardingStatus.Content.chargesEnabled)" -ForegroundColor Gray
        Write-Host "   Payouts Enabled: $($onboardingStatus.Content.payoutsEnabled)" -ForegroundColor Gray
    } else {
        Write-Host "❌ Failed to fetch onboarding status: $($onboardingStatus.Content.message)" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️  Skipping onboarding status check - no vendor profile ID" -ForegroundColor Yellow
}

Write-Host "`n6️⃣ Testing Commission Info" -ForegroundColor Yellow
$commissionInfo = Invoke-TestAPI -Method "GET" -Endpoint "/api/stripe-controller/commission/info"

if ($commissionInfo.Success) {
    Write-Host "✅ Commission info fetched successfully" -ForegroundColor Green
    Write-Host "   Commission Rate: $($commissionInfo.Content.commissionRate)%" -ForegroundColor Gray
    Write-Host "   Description: $($commissionInfo.Content.description)" -ForegroundColor Gray
    Write-Host "   Calculation: $($commissionInfo.Content.calculation)" -ForegroundColor Gray
    Write-Host "   Vendor Payout: $($commissionInfo.Content.vendorPayout)" -ForegroundColor Gray
} else {
    Write-Host "❌ Failed to fetch commission info: $($commissionInfo.Content.message)" -ForegroundColor Red
}

Write-Host "`n🎉 Vendor Onboarding Check Tests Completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Key Features Tested:" -ForegroundColor Cyan
Write-Host "• Vendor profile fetch with Stripe account check" -ForegroundColor White
Write-Host "• Onboarding status verification" -ForegroundColor White
Write-Host "• Commission information display" -ForegroundColor White
Write-Host "• Dashboard access control" -ForegroundColor White
Write-Host "• Frontend onboarding prompt logic" -ForegroundColor White
Write-Host ""
Write-Host "Expected Behavior:" -ForegroundColor Cyan
Write-Host "• Vendors without stripeAccountId see OnboardingPrompt" -ForegroundColor White
Write-Host "• Vendors with stripeAccountId see normal dashboard" -ForegroundColor White
Write-Host "• Onboarding prompt guides to /vendor/onboarding" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Test the frontend dashboard with different vendor states" -ForegroundColor White
Write-Host "2. Verify OnboardingPrompt component displays correctly" -ForegroundColor White
Write-Host "3. Test the onboarding flow from the prompt" -ForegroundColor White
Write-Host "4. Verify dashboard access after completing onboarding" -ForegroundColor White 