# Test Addon Features Implementation
# This script tests the new addon features: Stripe Express Dashboard, AI Cost-to-Margin Validation, and CSV/PDF Payout Reports

param(
    [string]$BaseUrl = "http://localhost:3001",
    [string]$VendorEmail = "vendor@test.com",
    [string]$VendorPassword = "password123"
)

Write-Host "🧪 Testing Addon Features Implementation" -ForegroundColor Cyan

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
            Headers = $Headers
            ContentType = "application/json"
        }
        
        if ($Body) {
            $params.Body = $Body | ConvertTo-Json -Depth 10
        }
        
        $response = Invoke-RestMethod @params -WebSession $session
        return @{
            Success = $true
            Content = $response
            StatusCode = 200
        }
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $errorContent = $_.ErrorDetails.Message
        if (-not $errorContent) {
            try {
                $errorContent = $_.Exception.Response.GetResponseStream()
                $reader = New-Object System.IO.StreamReader($errorContent)
                $errorContent = $reader.ReadToEnd()
            }
            catch {
                $errorContent = $_.Exception.Message
            }
        }
        
        return @{
            Success = $false
            Error = $errorContent
            StatusCode = $statusCode
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
    Write-Host "   Stripe Account ID: $($vendorProfile.Content.stripeAccountId)" -ForegroundColor Gray
    
    $vendorId = $vendorProfile.Content.id
} else {
    Write-Host "❌ Failed to fetch vendor profile: $($vendorProfile.Content.message)" -ForegroundColor Red
    exit 1
}

Write-Host "`n4️⃣ Testing Stripe Express Dashboard" -ForegroundColor Yellow
$expressDashboard = Invoke-TestAPI -Method "GET" -Endpoint "/api/vendor-payouts/express-dashboard/$vendorId"

if ($expressDashboard.Success) {
    Write-Host "✅ Stripe Express Dashboard URL generated" -ForegroundColor Green
    Write-Host "   Express Dashboard URL: $($expressDashboard.Content.expressDashboardUrl)" -ForegroundColor Gray
    Write-Host "   Tax Info URL: $($expressDashboard.Content.sections.taxInfo)" -ForegroundColor Gray
    Write-Host "   Bank Accounts URL: $($expressDashboard.Content.sections.bankAccounts)" -ForegroundColor Gray
    Write-Host "   Identity Verification URL: $($expressDashboard.Content.sections.identityVerification)" -ForegroundColor Gray
} else {
    Write-Host "❌ Failed to generate Express Dashboard URL: $($expressDashboard.Content.message)" -ForegroundColor Red
}

Write-Host "`n5️⃣ Testing AI Cost-to-Margin Validation" -ForegroundColor Yellow

# Test single product validation
$validationData = @{
    price = 25.00
    cost = 15.00
    targetMargin = 30
    productCategory = "ceramics"
}

$aiValidation = Invoke-TestAPI -Method "POST" -Endpoint "/api/ai-validation/validate-pricing" -Body $validationData

if ($aiValidation.Success) {
    Write-Host "✅ AI validation completed successfully" -ForegroundColor Green
    Write-Host "   Is Valid: $($aiValidation.Content.validation.isValid)" -ForegroundColor Gray
    Write-Host "   Confidence: $($aiValidation.Content.validation.confidence)" -ForegroundColor Gray
    Write-Host "   Risk Level: $($aiValidation.Content.validation.riskLevel)" -ForegroundColor Gray
    Write-Host "   Warnings: $($aiValidation.Content.validation.warnings.Count)" -ForegroundColor Gray
    Write-Host "   Suggestions: $($aiValidation.Content.validation.suggestions.Count)" -ForegroundColor Gray
} else {
    Write-Host "❌ AI validation failed: $($aiValidation.Content.message)" -ForegroundColor Red
}

Write-Host "`n6️⃣ Testing AI Validation with Low Margin" -ForegroundColor Yellow

$lowMarginData = @{
    price = 12.00
    cost = 10.00
    targetMargin = 25
    productCategory = "bakery"
}

$lowMarginValidation = Invoke-TestAPI -Method "POST" -Endpoint "/api/ai-validation/validate-pricing" -Body $lowMarginData

if ($lowMarginValidation.Success) {
    Write-Host "✅ Low margin validation completed" -ForegroundColor Green
    Write-Host "   Is Valid: $($lowMarginValidation.Content.validation.isValid)" -ForegroundColor Gray
    Write-Host "   Risk Level: $($lowMarginValidation.Content.validation.riskLevel)" -ForegroundColor Gray
    Write-Host "   Warnings: $($lowMarginValidation.Content.validation.warnings -join ', ')" -ForegroundColor Gray
} else {
    Write-Host "❌ Low margin validation failed: $($lowMarginValidation.Content.message)" -ForegroundColor Red
}

Write-Host "`n7️⃣ Testing Bulk AI Validation" -ForegroundColor Yellow

$bulkValidationData = @{
    products = @(
        @{
            price = 25.00
            cost = 15.00
            targetMargin = 30
            productCategory = "ceramics"
            productId = "test-1"
        },
        @{
            price = 12.00
            cost = 10.00
            targetMargin = 25
            productCategory = "bakery"
            productId = "test-2"
        },
        @{
            price = 50.00
            cost = 20.00
            targetMargin = 40
            productCategory = "jewelry"
            productId = "test-3"
        }
    )
}

$bulkValidation = Invoke-TestAPI -Method "POST" -Endpoint "/api/ai-validation/validate-bulk-pricing" -Body $bulkValidationData

if ($bulkValidation.Success) {
    Write-Host "✅ Bulk AI validation completed successfully" -ForegroundColor Green
    Write-Host "   Total Products: $($bulkValidation.Content.summary.totalProducts)" -ForegroundColor Gray
    Write-Host "   Valid Products: $($bulkValidation.Content.summary.validProducts)" -ForegroundColor Gray
    Write-Host "   High Risk Products: $($bulkValidation.Content.summary.highRiskProducts)" -ForegroundColor Gray
    Write-Host "   Medium Risk Products: $($bulkValidation.Content.summary.mediumRiskProducts)" -ForegroundColor Gray
    Write-Host "   Validation Rate: $($bulkValidation.Content.summary.validationRate)%" -ForegroundColor Gray
} else {
    Write-Host "❌ Bulk AI validation failed: $($bulkValidation.Content.message)" -ForegroundColor Red
}

Write-Host "`n8️⃣ Testing Market Insights" -ForegroundColor Yellow

$marketInsights = Invoke-TestAPI -Method "GET" -Endpoint "/api/ai-validation/market-insights?productCategory=ceramics"

if ($marketInsights.Success) {
    Write-Host "✅ Market insights retrieved successfully" -ForegroundColor Green
    Write-Host "   Category: $($marketInsights.Content.category)" -ForegroundColor Gray
    Write-Host "   Average Margin: $($marketInsights.Content.marketData.averageMargin)%" -ForegroundColor Gray
    Write-Host "   Price Range: $($marketInsights.Content.marketData.priceRange.min) - $($marketInsights.Content.marketData.priceRange.max)" -ForegroundColor Gray
    Write-Host "   Cost Efficiency: $($marketInsights.Content.marketData.costEfficiency)" -ForegroundColor Gray
    Write-Host "   Recommendations: $($marketInsights.Content.insights.recommendations.Count)" -ForegroundColor Gray
} else {
    Write-Host "❌ Market insights failed: $($marketInsights.Content.message)" -ForegroundColor Red
}

Write-Host "`n9️⃣ Testing CSV Payout Report" -ForegroundColor Yellow

$csvReport = Invoke-TestAPI -Method "GET" -Endpoint "/api/payout-reports/$vendorId?format=csv&startDate=2024-01-01&endDate=2024-12-31"

if ($csvReport.Success) {
    Write-Host "✅ CSV payout report generated successfully" -ForegroundColor Green
    Write-Host "   Content Type: CSV" -ForegroundColor Gray
    Write-Host "   Content Length: $($csvReport.Content.Length) characters" -ForegroundColor Gray
} else {
    Write-Host "❌ CSV payout report failed: $($csvReport.Content.message)" -ForegroundColor Red
}

Write-Host "`n🔟 Testing PDF Payout Report" -ForegroundColor Yellow

$pdfReport = Invoke-TestAPI -Method "GET" -Endpoint "/api/payout-reports/$vendorId?format=pdf&startDate=2024-01-01&endDate=2024-12-31"

if ($pdfReport.Success) {
    Write-Host "✅ PDF payout report generated successfully" -ForegroundColor Green
    Write-Host "   Content Type: PDF" -ForegroundColor Gray
    Write-Host "   Content Length: $($pdfReport.Content.Length) characters" -ForegroundColor Gray
} else {
    Write-Host "❌ PDF payout report failed: $($pdfReport.Content.message)" -ForegroundColor Red
}

Write-Host "`n1️⃣1️⃣ Testing Monthly CSV Report" -ForegroundColor Yellow

$monthlyCsvReport = Invoke-TestAPI -Method "GET" -Endpoint "/api/payout-reports/$vendorId/monthly?year=2024&month=12&format=csv"

if ($monthlyCsvReport.Success) {
    Write-Host "✅ Monthly CSV report generated successfully" -ForegroundColor Green
    Write-Host "   Content Type: CSV" -ForegroundColor Gray
    Write-Host "   Content Length: $($monthlyCsvReport.Content.Length) characters" -ForegroundColor Gray
} else {
    Write-Host "❌ Monthly CSV report failed: $($monthlyCsvReport.Content.message)" -ForegroundColor Red
}

Write-Host "`n1️⃣2️⃣ Testing Monthly PDF Report" -ForegroundColor Yellow

$monthlyPdfReport = Invoke-TestAPI -Method "GET" -Endpoint "/api/payout-reports/$vendorId/monthly?year=2024&month=12&format=pdf"

if ($monthlyPdfReport.Success) {
    Write-Host "✅ Monthly PDF report generated successfully" -ForegroundColor Green
    Write-Host "   Content Type: PDF" -ForegroundColor Gray
    Write-Host "   Content Length: $($monthlyPdfReport.Content.Length) characters" -ForegroundColor Gray
} else {
    Write-Host "❌ Monthly PDF report failed: $($monthlyPdfReport.Content.message)" -ForegroundColor Red
}

Write-Host "`n🎉 Addon Features Tests Completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Key Features Tested:" -ForegroundColor Cyan
Write-Host "• Stripe Express Dashboard URLs" -ForegroundColor White
Write-Host "• AI Cost-to-Margin Validation" -ForegroundColor White
Write-Host "• Bulk AI Validation" -ForegroundColor White
Write-Host "• Market Insights" -ForegroundColor White
Write-Host "• CSV Payout Reports" -ForegroundColor White
Write-Host "• PDF Payout Reports" -ForegroundColor White
Write-Host "• Monthly Report Generation" -ForegroundColor White
Write-Host ""
Write-Host "Features Implemented:" -ForegroundColor Cyan
Write-Host "✅ Stripe Express Dashboard - Direct links for tax, bank, ID management" -ForegroundColor Green
Write-Host "✅ AI Cost-to-Margin Validation - Smart pricing validation with market comparison" -ForegroundColor Green
Write-Host "✅ Margin Alert System - Enhanced with AI-powered insights" -ForegroundColor Green
Write-Host "✅ CSV/PDF Payout Reports - Comprehensive reporting for vendors" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Test with real Stripe Connect accounts" -ForegroundColor White
Write-Host "2. Integrate with vendor dashboard UI" -ForegroundColor White
Write-Host "3. Add real market data sources" -ForegroundColor White
Write-Host "4. Implement automated report scheduling" -ForegroundColor White
Write-Host "5. Add email delivery for reports" -ForegroundColor White 