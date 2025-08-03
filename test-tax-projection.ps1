# Test Tax Projection Feature
# This script tests the quarterly tax projection and alerts

$baseUrl = "http://localhost:3001"
$testEmail = "vendor@test.com"
$testPassword = "password123"

Write-Host "🧪 Testing Tax Projection Feature" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

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

# Test 4: Initialize Tax Settings
Write-Host "`n4. Initializing Tax Settings..." -ForegroundColor Yellow
$initResponse = Invoke-API -Method "POST" -Url "$baseUrl/api/tax-projection/settings/initialize" -Headers $headers
if ($initResponse.Success) {
    Write-Host "✅ Tax settings initialized" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to initialize tax settings: $($initResponse.Error)" -ForegroundColor Red
}

# Test 5: Get Tax Settings
Write-Host "`n5. Getting Tax Settings..." -ForegroundColor Yellow
$settingsResponse = Invoke-API -Method "GET" -Url "$baseUrl/api/tax-projection/settings" -Headers $headers
if ($settingsResponse.Success) {
    Write-Host "✅ Tax settings retrieved" -ForegroundColor Green
    Write-Host "   Self-Employment Tax Rate: $($settingsResponse.Data.settings.selfEmploymentTaxRate)%" -ForegroundColor Gray
    Write-Host "   Income Tax Rate: $($settingsResponse.Data.settings.incomeTaxRate)%" -ForegroundColor Gray
} else {
    Write-Host "❌ Failed to get tax settings: $($settingsResponse.Error)" -ForegroundColor Red
}

# Test 6: Get Tax Summary
Write-Host "`n6. Getting Tax Summary..." -ForegroundColor Yellow
$summaryResponse = Invoke-API -Method "GET" -Url "$baseUrl/api/tax-projection/vendor/$vendorId/summary" -Headers $headers
if ($summaryResponse.Success) {
    Write-Host "✅ Tax summary retrieved" -ForegroundColor Green
    Write-Host "   Total Upcoming: $($summaryResponse.Data.summary.totalUpcoming)" -ForegroundColor Gray
    Write-Host "   Total Overdue: $($summaryResponse.Data.summary.totalOverdue)" -ForegroundColor Gray
    Write-Host "   Upcoming Count: $($summaryResponse.Data.summary.upcomingCount)" -ForegroundColor Gray
    Write-Host "   Overdue Count: $($summaryResponse.Data.summary.overdueCount)" -ForegroundColor Gray
} else {
    Write-Host "❌ Failed to get tax summary: $($summaryResponse.Error)" -ForegroundColor Red
}

# Test 7: Get Upcoming Obligations
Write-Host "`n7. Getting Upcoming Obligations..." -ForegroundColor Yellow
$obligationsResponse = Invoke-API -Method "GET" -Url "$baseUrl/api/tax-projection/vendor/$vendorId/obligations" -Headers $headers
if ($obligationsResponse.Success) {
    Write-Host "✅ Upcoming obligations retrieved" -ForegroundColor Green
    Write-Host "   Obligations Count: $($obligationsResponse.Data.obligations.Count)" -ForegroundColor Gray
} else {
    Write-Host "❌ Failed to get upcoming obligations: $($obligationsResponse.Error)" -ForegroundColor Red
}

# Test 8: Get All Projections
Write-Host "`n8. Getting All Projections..." -ForegroundColor Yellow
$projectionsResponse = Invoke-API -Method "GET" -Url "$baseUrl/api/tax-projection/vendor/$vendorId/projections" -Headers $headers
if ($projectionsResponse.Success) {
    Write-Host "✅ All projections retrieved" -ForegroundColor Green
    Write-Host "   Projections Count: $($projectionsResponse.Data.projections.Count)" -ForegroundColor Gray
} else {
    Write-Host "❌ Failed to get all projections: $($projectionsResponse.Error)" -ForegroundColor Red
}

# Test 9: Get Specific Quarter Projection
Write-Host "`n9. Getting Specific Quarter Projection..." -ForegroundColor Yellow
$currentYear = Get-Date -Format "yyyy"
$quarterResponse = Invoke-API -Method "GET" -Url "$baseUrl/api/tax-projection/vendor/$vendorId/projection?quarter=Q3&year=$currentYear" -Headers $headers
if ($quarterResponse.Success) {
    Write-Host "✅ Quarter projection retrieved" -ForegroundColor Green
    Write-Host "   Quarter: $($quarterResponse.Data.projection.quarter)" -ForegroundColor Gray
    Write-Host "   Year: $($quarterResponse.Data.projection.year)" -ForegroundColor Gray
    Write-Host "   Estimated Tax: $($quarterResponse.Data.projection.estimatedTax)" -ForegroundColor Gray
    Write-Host "   Status: $($quarterResponse.Data.projection.status)" -ForegroundColor Gray
} else {
    Write-Host "❌ Failed to get quarter projection: $($quarterResponse.Error)" -ForegroundColor Red
}

# Test 10: Send Tax Reminder
Write-Host "`n10. Testing Tax Reminder..." -ForegroundColor Yellow
$reminderBody = @{
    quarter = "Q3"
    year = [int]$currentYear
}

$reminderResponse = Invoke-API -Method "POST" -Url "$baseUrl/api/tax-projection/vendor/$vendorId/reminder" -Body $reminderBody -Headers $headers
if ($reminderResponse.Success) {
    Write-Host "✅ Tax reminder sent successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to send tax reminder: $($reminderResponse.Error)" -ForegroundColor Red
}

# Test 11: Get Tax Alerts
Write-Host "`n11. Getting Tax Alerts..." -ForegroundColor Yellow
$alertsResponse = Invoke-API -Method "GET" -Url "$baseUrl/api/tax-projection/vendor/$vendorId/alerts" -Headers $headers
if ($alertsResponse.Success) {
    Write-Host "✅ Tax alerts retrieved" -ForegroundColor Green
    Write-Host "   Alerts Count: $($alertsResponse.Data.alerts.Count)" -ForegroundColor Gray
} else {
    Write-Host "❌ Failed to get tax alerts: $($alertsResponse.Error)" -ForegroundColor Red
}

# Test 12: Confirm Tax Payment
Write-Host "`n12. Testing Tax Payment Confirmation..." -ForegroundColor Yellow
$paymentBody = @{
    quarter = "Q2"
    year = [int]$currentYear
    paidAmount = 1500.00
}

$paymentResponse = Invoke-API -Method "POST" -Url "$baseUrl/api/tax-projection/vendor/$vendorId/confirm-payment" -Body $paymentBody -Headers $headers
if ($paymentResponse.Success) {
    Write-Host "✅ Tax payment confirmed successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to confirm tax payment: $($paymentResponse.Error)" -ForegroundColor Red
}

# Test 13: Update Tax Settings
Write-Host "`n13. Testing Tax Settings Update..." -ForegroundColor Yellow
$updateSettingsBody = @{
    selfEmploymentTaxRate = 15.3
    incomeTaxRate = 22
    quarterlyDueDates = @{
        Q1 = "April 15"
        Q2 = "June 15"
        Q3 = "September 15"
        Q4 = "January 15"
    }
    reminderDays = @(30, 14, 7, 1)
}

$updateResponse = Invoke-API -Method "PUT" -Url "$baseUrl/api/tax-projection/settings" -Body $updateSettingsBody -Headers $headers
if ($updateResponse.Success) {
    Write-Host "✅ Tax settings updated successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to update tax settings: $($updateResponse.Error)" -ForegroundColor Red
}

# Test 14: Bulk Send Reminders (Admin only)
Write-Host "`n14. Testing Bulk Send Reminders..." -ForegroundColor Yellow
$bulkBody = @{
    daysBeforeDue = 30
}

$bulkResponse = Invoke-API -Method "POST" -Url "$baseUrl/api/tax-projection/bulk-reminders" -Body $bulkBody -Headers $headers
if ($bulkResponse.Success) {
    Write-Host "✅ Bulk reminders sent successfully" -ForegroundColor Green
    Write-Host "   Message: $($bulkResponse.Data.message)" -ForegroundColor Gray
} else {
    Write-Host "❌ Failed to send bulk reminders: $($bulkResponse.Error)" -ForegroundColor Red
}

Write-Host "`n🎉 Tax Projection Feature Tests Completed!" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green

Write-Host "`n📋 Summary:" -ForegroundColor Cyan
Write-Host "- Database schema updated with TaxAlert model" -ForegroundColor White
Write-Host "- Tax projection utility created" -ForegroundColor White
Write-Host "- Tax projection controller implemented" -ForegroundColor White
Write-Host "- API routes configured" -ForegroundColor White
Write-Host "- Frontend component created" -ForegroundColor White
Write-Host "- Tax settings management added" -ForegroundColor White
Write-Host "- Automated reminder system" -ForegroundColor White
Write-Host "- Payment confirmation tracking" -ForegroundColor White

Write-Host "`n🚀 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Run database migration: npx prisma migrate dev" -ForegroundColor White
Write-Host "2. Initialize tax settings via API" -ForegroundColor White
Write-Host "3. Set up CRON job for automated reminders" -ForegroundColor White
Write-Host "4. Integrate tax forecast into vendor dashboard" -ForegroundColor White
Write-Host "5. Configure email service for reminders" -ForegroundColor White 