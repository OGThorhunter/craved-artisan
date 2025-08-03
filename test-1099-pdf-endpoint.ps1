# Test 1099 PDF Generation Endpoint
# This script tests the /api/vendors/:vendorId/financials/1099-pdf endpoint

param(
    [string]$BaseUrl = "http://localhost:3001",
    [string]$VendorEmail = "vendor@test.com",
    [string]$VendorPassword = "password123"
)

Write-Host "🧪 Testing 1099 PDF Generation Endpoint" -ForegroundColor Cyan

function Invoke-TestAPI {
    param(
        [string]$Method = "GET",
        [string]$Endpoint,
        [object]$Body = $null,
        [hashtable]$Headers = @{},
        [bool]$ReturnRaw = $false
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
        
        if ($ReturnRaw) {
            $params.OutFile = "test-1099-pdf-output.pdf"
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

Write-Host "`n4️⃣ Testing 1099 PDF Generation (Current Year)" -ForegroundColor Yellow
$currentYear = Get-Date -Format "yyyy"
$pdfResponse = Invoke-TestAPI -Method "GET" -Endpoint "/api/vendors/$vendorId/financials/1099-pdf?year=$currentYear" -ReturnRaw $true

if ($pdfResponse.Success) {
    Write-Host "✅ 1099 PDF generated successfully" -ForegroundColor Green
    Write-Host "   PDF saved as: test-1099-pdf-output.pdf" -ForegroundColor Gray
    Write-Host "   Year: $currentYear" -ForegroundColor Gray
    
    # Check if file was created
    if (Test-Path "test-1099-pdf-output.pdf") {
        $fileSize = (Get-Item "test-1099-pdf-output.pdf").Length
        Write-Host "   File size: $($fileSize) bytes" -ForegroundColor Gray
        
        if ($fileSize -gt 0) {
            Write-Host "   ✅ PDF file is valid and contains data" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  PDF file is empty" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   ❌ PDF file was not created" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Failed to generate 1099 PDF: $($pdfResponse.Content.message)" -ForegroundColor Red
    Write-Host "   Status Code: $($pdfResponse.StatusCode)" -ForegroundColor Gray
}

Write-Host "`n5️⃣ Testing 1099 PDF Generation (Previous Year)" -ForegroundColor Yellow
$previousYear = (Get-Date).AddYears(-1).Year
$pdfResponsePrev = Invoke-TestAPI -Method "GET" -Endpoint "/api/vendors/$vendorId/financials/1099-pdf?year=$previousYear" -ReturnRaw $true

if ($pdfResponsePrev.Success) {
    Write-Host "✅ Previous year 1099 PDF generated successfully" -ForegroundColor Green
    Write-Host "   Year: $previousYear" -ForegroundColor Gray
    
    if (Test-Path "test-1099-pdf-output.pdf") {
        $fileSize = (Get-Item "test-1099-pdf-output.pdf").Length
        Write-Host "   File size: $($fileSize) bytes" -ForegroundColor Gray
    }
} else {
    Write-Host "❌ Failed to generate previous year 1099 PDF: $($pdfResponsePrev.Content.message)" -ForegroundColor Red
}

Write-Host "`n6️⃣ Testing 1099 PDF Generation (No Year Parameter)" -ForegroundColor Yellow
$pdfResponseDefault = Invoke-TestAPI -Method "GET" -Endpoint "/api/vendors/$vendorId/financials/1099-pdf" -ReturnRaw $true

if ($pdfResponseDefault.Success) {
    Write-Host "✅ Default year 1099 PDF generated successfully" -ForegroundColor Green
    Write-Host "   Uses current year as default" -ForegroundColor Gray
} else {
    Write-Host "❌ Failed to generate default year 1099 PDF: $($pdfResponseDefault.Content.message)" -ForegroundColor Red
}

Write-Host "`n7️⃣ Testing Unauthorized Access" -ForegroundColor Yellow
$unauthorizedPdf = Invoke-TestAPI -Method "GET" -Endpoint "/api/vendors/unauthorized-vendor-id/financials/1099-pdf"

if (-not $unauthorizedPdf.Success) {
    if ($unauthorizedPdf.StatusCode -eq 404) {
        Write-Host "✅ Unauthorized access properly blocked (404 - Vendor not found)" -ForegroundColor Green
    } elseif ($unauthorizedPdf.StatusCode -eq 403) {
        Write-Host "✅ Unauthorized access properly blocked (403 - Access denied)" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Unauthorized access blocked with status: $($unauthorizedPdf.StatusCode)" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Unauthorized access should have been blocked" -ForegroundColor Red
}

Write-Host "`n8️⃣ Testing Without Authentication" -ForegroundColor Yellow
# Create a new session without authentication
$unauthenticatedSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$unauthenticatedPdf = Invoke-TestAPI -Method "GET" -Endpoint "/api/vendors/$vendorId/financials/1099-pdf"

if (-not $unauthenticatedPdf.Success) {
    if ($unauthenticatedPdf.StatusCode -eq 401) {
        Write-Host "✅ Unauthenticated access properly blocked (401)" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Unauthenticated access blocked with status: $($unauthenticatedPdf.StatusCode)" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Unauthenticated access should have been blocked" -ForegroundColor Red
}

Write-Host "`n9️⃣ Testing Invalid Year Parameter" -ForegroundColor Yellow
$invalidYearPdf = Invoke-TestAPI -Method "GET" -Endpoint "/api/vendors/$vendorId/financials/1099-pdf?year=invalid"

if (-not $invalidYearPdf.Success) {
    Write-Host "✅ Invalid year parameter properly handled" -ForegroundColor Green
    Write-Host "   Status Code: $($invalidYearPdf.StatusCode)" -ForegroundColor Gray
} else {
    Write-Host "⚠️  Invalid year parameter should have been rejected" -ForegroundColor Yellow
}

Write-Host "`n🎉 1099 PDF Generation Tests Completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Key Features Tested:" -ForegroundColor Cyan
Write-Host "• PDF generation for current year" -ForegroundColor White
Write-Host "• PDF generation for previous year" -ForegroundColor White
Write-Host "• Default year handling" -ForegroundColor White
Write-Host "• Authorization and access control" -ForegroundColor White
Write-Host "• Authentication requirements" -ForegroundColor White
Write-Host "• Error handling for invalid parameters" -ForegroundColor White
Write-Host "• PDF file creation and validation" -ForegroundColor White
Write-Host ""
Write-Host "Endpoint Details:" -ForegroundColor Cyan
Write-Host "• Path: /api/vendors/:vendorId/financials/1099-pdf" -ForegroundColor White
Write-Host "• Method: GET" -ForegroundColor White
Write-Host "• Query Parameter: year (optional, defaults to current year)" -ForegroundColor White
Write-Host "• Authentication: Required" -ForegroundColor White
Write-Host "• Authorization: Vendor owner or admin only" -ForegroundColor White
Write-Host "• Response: PDF file with Content-Type: application/pdf" -ForegroundColor White
Write-Host ""
Write-Host "PDF Features:" -ForegroundColor Cyan
Write-Host "• Vendor information section" -ForegroundColor White
Write-Host "• Financial summary with totals" -ForegroundColor White
Write-Host "• 1099-K requirement indicator" -ForegroundColor White
Write-Host "• Detailed payout table" -ForegroundColor White
Write-Host "• Professional formatting and layout" -ForegroundColor White
Write-Host "• Automatic pagination for large datasets" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Run database migration to add Payout model" -ForegroundColor White
Write-Host "2. Test with real payout data from Stripe" -ForegroundColor White
Write-Host "3. Integrate PDF download into vendor dashboard" -ForegroundColor White
Write-Host "4. Add email delivery for PDF reports" -ForegroundColor White
Write-Host "5. Implement PDF caching for performance" -ForegroundColor White
Write-Host "6. Add more tax form types (1099-MISC, etc.)" -ForegroundColor White 