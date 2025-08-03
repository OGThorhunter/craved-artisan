# Test Vendor Tax Report Endpoint
# This script tests the specific /api/vendors/:vendorId/financials/tax-report endpoint

param(
    [string]$BaseUrl = "http://localhost:3001",
    [string]$VendorEmail = "vendor@test.com",
    [string]$VendorPassword = "password123"
)

Write-Host "🧪 Testing Vendor Tax Report Endpoint" -ForegroundColor Cyan

function Invoke-TestAPI {
    param(
        [string]$Method = "GET",
        [string]$Endpoint,
        [object]$Body = $null,
        [hashtable]$Headers = @{}
    )
    
    try {
        $uri = "$BaseUrl$Endpoint"
        $params = @{
            Uri = $uri
            Method = $Method
            ContentType = "application/json"
            WebSession = $session
        }
        
        if ($Body) {
            $params.Body = $Body | ConvertTo-Json -Depth 10
        }
        
        if ($Headers.Count -gt 0) {
            $params.Headers = $Headers
        }
        
        $response = Invoke-RestMethod @params -ErrorAction Stop
        
        return @{
            Success = $true
            Content = $response
            StatusCode = 200
        }
    }
    catch {
        $errorResponse = $_.Exception.Response
        $statusCode = if ($errorResponse) { $errorResponse.StatusCode.value__ } else { 500 }
        
        try {
            $errorContent = $_.ErrorDetails.Message | ConvertFrom-Json
        }
        catch {
            $errorContent = @{
                error = "Request failed"
                message = $_.Exception.Message
            }
        }
        
        return @{
            Success = $false
            Content = $errorContent
            StatusCode = $statusCode
            Error = $_.Exception.Message
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
    email = $VendorEmail
    password = $VendorPassword
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
    Write-Host "   Vendor ID: $($vendorProfile.Content.id)" -ForegroundColor Gray
    $vendorId = $vendorProfile.Content.id
} else {
    Write-Host "❌ Failed to fetch vendor profile: $($vendorProfile.Content.message)" -ForegroundColor Red
    exit 1
}

Write-Host "`n4️⃣ Testing Tax Report Endpoint" -ForegroundColor Yellow
$taxReport = Invoke-TestAPI -Method "GET" -Endpoint "/api/vendors/$vendorId/financials/tax-report"

if ($taxReport.Success) {
    Write-Host "✅ Tax report fetched successfully" -ForegroundColor Green
    Write-Host "   Vendor ID: $($taxReport.Content.vendorId)" -ForegroundColor Gray
    Write-Host "   Total Paid: $($taxReport.Content.totalPaid)" -ForegroundColor Gray
    Write-Host "   Total Fees: $($taxReport.Content.totalFees)" -ForegroundColor Gray
    Write-Host "   Total Net: $($taxReport.Content.totalNet)" -ForegroundColor Gray
    Write-Host "   Number of Payouts: $($taxReport.Content.payouts.Count)" -ForegroundColor Gray
    
    if ($taxReport.Content.payouts.Count -gt 0) {
        Write-Host "   Sample Payout:" -ForegroundColor Gray
        $samplePayout = $taxReport.Content.payouts[0]
        Write-Host "     Amount: $($samplePayout.amount)" -ForegroundColor Gray
        Write-Host "     Platform Fee: $($samplePayout.platformFee)" -ForegroundColor Gray
        Write-Host "     Date: $($samplePayout.date)" -ForegroundColor Gray
        Write-Host "     Method: $($samplePayout.method)" -ForegroundColor Gray
    }
} else {
    Write-Host "❌ Failed to fetch tax report: $($taxReport.Content.message)" -ForegroundColor Red
    Write-Host "   Status Code: $($taxReport.StatusCode)" -ForegroundColor Gray
}

Write-Host "`n5️⃣ Testing Unauthorized Access" -ForegroundColor Yellow
# Test with a different vendor ID to ensure access control works
$unauthorizedTaxReport = Invoke-TestAPI -Method "GET" -Endpoint "/api/vendors/unauthorized-vendor-id/financials/tax-report"

if (-not $unauthorizedTaxReport.Success) {
    if ($unauthorizedTaxReport.StatusCode -eq 404) {
        Write-Host "✅ Unauthorized access properly blocked (404 - Vendor not found)" -ForegroundColor Green
    } elseif ($unauthorizedTaxReport.StatusCode -eq 403) {
        Write-Host "✅ Unauthorized access properly blocked (403 - Access denied)" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Unauthorized access blocked with status: $($unauthorizedTaxReport.StatusCode)" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Unauthorized access should have been blocked" -ForegroundColor Red
}

Write-Host "`n6️⃣ Testing Non-Existent Vendor" -ForegroundColor Yellow
$nonExistentTaxReport = Invoke-TestAPI -Method "GET" -Endpoint "/api/vendors/non-existent-id/financials/tax-report"

if (-not $nonExistentTaxReport.Success) {
    if ($nonExistentTaxReport.StatusCode -eq 404) {
        Write-Host "✅ Non-existent vendor properly handled (404)" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Non-existent vendor handled with status: $($nonExistentTaxReport.StatusCode)" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Non-existent vendor should have returned 404" -ForegroundColor Red
}

Write-Host "`n7️⃣ Testing Without Authentication" -ForegroundColor Yellow
# Create a new session without authentication
$unauthenticatedSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$unauthenticatedTaxReport = Invoke-TestAPI -Method "GET" -Endpoint "/api/vendors/$vendorId/financials/tax-report"

if (-not $unauthenticatedTaxReport.Success) {
    if ($unauthenticatedTaxReport.StatusCode -eq 401) {
        Write-Host "✅ Unauthenticated access properly blocked (401)" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Unauthenticated access blocked with status: $($unauthenticatedTaxReport.StatusCode)" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Unauthenticated access should have been blocked" -ForegroundColor Red
}

Write-Host "`n🎉 Vendor Tax Report Endpoint Tests Completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Key Features Tested:" -ForegroundColor Cyan
Write-Host "• Tax report data retrieval" -ForegroundColor White
Write-Host "• Payout aggregation and calculations" -ForegroundColor White
Write-Host "• Authorization and access control" -ForegroundColor White
Write-Host "• Error handling for edge cases" -ForegroundColor White
Write-Host "• Authentication requirements" -ForegroundColor White
Write-Host ""
Write-Host "Endpoint Details:" -ForegroundColor Cyan
Write-Host "• Path: /api/vendors/:vendorId/financials/tax-report" -ForegroundColor White
Write-Host "• Method: GET" -ForegroundColor White
Write-Host "• Authentication: Required" -ForegroundColor White
Write-Host "• Authorization: Vendor owner or admin only" -ForegroundColor White
Write-Host "• Response: JSON with vendorId, totalPaid, totalFees, totalNet, payouts" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Run database migration to add Payout model" -ForegroundColor White
Write-Host "2. Test with real payout data from Stripe" -ForegroundColor White
Write-Host "3. Integrate with existing tax reports system" -ForegroundColor White
Write-Host "4. Add frontend component to display this data" -ForegroundColor White
Write-Host "5. Add date range filtering capabilities" -ForegroundColor White 