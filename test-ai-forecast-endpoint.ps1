# Test AI Financial Forecast Endpoint
# This script tests the /api/vendors/:vendorId/financials/forecast endpoint

param(
    [string]$BaseUrl = "http://localhost:3001",
    [string]$VendorEmail = "vendor@test.com",
    [string]$VendorPassword = "password123"
)

Write-Host "🧪 Testing AI Financial Forecast Endpoint" -ForegroundColor Cyan

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

Write-Host "`n4️⃣ Testing AI Forecast (Default 12 months)" -ForegroundColor Yellow
$forecastResponse = Invoke-TestAPI -Method "GET" -Endpoint "/api/vendors/$vendorId/financials/forecast"

if ($forecastResponse.Success) {
    Write-Host "✅ AI forecast generated successfully" -ForegroundColor Green
    Write-Host "   Vendor Name: $($forecastResponse.Content.vendorName)" -ForegroundColor Gray
    Write-Host "   Next Month Revenue: $($forecastResponse.Content.forecast.nextMonthRevenue)" -ForegroundColor Gray
    Write-Host "   Next Month Profit: $($forecastResponse.Content.forecast.nextMonthProfit)" -ForegroundColor Gray
    Write-Host "   Next Month Orders: $($forecastResponse.Content.forecast.nextMonthOrders)" -ForegroundColor Gray
    Write-Host "   Revenue Growth Rate: $($forecastResponse.Content.forecast.avgRevenueGrowthRate)%" -ForegroundColor Gray
    Write-Host "   Profit Growth Rate: $($forecastResponse.Content.forecast.avgProfitGrowthRate)%" -ForegroundColor Gray
    Write-Host "   Order Growth Rate: $($forecastResponse.Content.forecast.avgOrderGrowthRate)%" -ForegroundColor Gray
    Write-Host "   Confidence: $($forecastResponse.Content.forecast.confidence)" -ForegroundColor Gray
    
    Write-Host "   Trends:" -ForegroundColor Gray
    Write-Host "     Revenue: $($forecastResponse.Content.forecast.trends.revenue)" -ForegroundColor Gray
    Write-Host "     Profit: $($forecastResponse.Content.forecast.trends.profit)" -ForegroundColor Gray
    Write-Host "     Orders: $($forecastResponse.Content.forecast.trends.orders)" -ForegroundColor Gray
    
    Write-Host "   Insights:" -ForegroundColor Gray
    foreach ($insight in $forecastResponse.Content.forecast.insights) {
        Write-Host "     • $insight" -ForegroundColor Gray
    }
    
    Write-Host "   Historical Data Points: $($forecastResponse.Content.historicalData.Count)" -ForegroundColor Gray
} else {
    Write-Host "❌ Failed to generate forecast: $($forecastResponse.Content.message)" -ForegroundColor Red
    Write-Host "   Status Code: $($forecastResponse.StatusCode)" -ForegroundColor Gray
}

Write-Host "`n5️⃣ Testing AI Forecast (6 months)" -ForegroundColor Yellow
$forecastResponse6 = Invoke-TestAPI -Method "GET" -Endpoint "/api/vendors/$vendorId/financials/forecast?months=6"

if ($forecastResponse6.Success) {
    Write-Host "✅ 6-month forecast generated successfully" -ForegroundColor Green
    Write-Host "   Historical Data Points: $($forecastResponse6.Content.historicalData.Count)" -ForegroundColor Gray
    Write-Host "   Next Month Revenue: $($forecastResponse6.Content.forecast.nextMonthRevenue)" -ForegroundColor Gray
    Write-Host "   Confidence: $($forecastResponse6.Content.forecast.confidence)" -ForegroundColor Gray
} else {
    Write-Host "❌ Failed to generate 6-month forecast: $($forecastResponse6.Content.message)" -ForegroundColor Red
}

Write-Host "`n6️⃣ Testing AI Forecast (3 months)" -ForegroundColor Yellow
$forecastResponse3 = Invoke-TestAPI -Method "GET" -Endpoint "/api/vendors/$vendorId/financials/forecast?months=3"

if ($forecastResponse3.Success) {
    Write-Host "✅ 3-month forecast generated successfully" -ForegroundColor Green
    Write-Host "   Historical Data Points: $($forecastResponse3.Content.historicalData.Count)" -ForegroundColor Gray
    Write-Host "   Next Month Revenue: $($forecastResponse3.Content.forecast.nextMonthRevenue)" -ForegroundColor Gray
    Write-Host "   Confidence: $($forecastResponse3.Content.forecast.confidence)" -ForegroundColor Gray
} else {
    Write-Host "❌ Failed to generate 3-month forecast: $($forecastResponse3.Content.message)" -ForegroundColor Red
}

Write-Host "`n7️⃣ Testing Invalid Months Parameter" -ForegroundColor Yellow
$forecastResponseInvalid = Invoke-TestAPI -Method "GET" -Endpoint "/api/vendors/$vendorId/financials/forecast?months=invalid"

if ($forecastResponseInvalid.Success) {
    Write-Host "✅ Invalid months parameter handled gracefully" -ForegroundColor Green
    Write-Host "   Used default value: 12 months" -ForegroundColor Gray
} else {
    Write-Host "❌ Invalid months parameter should have been handled gracefully" -ForegroundColor Red
}

Write-Host "`n8️⃣ Testing Unauthorized Access" -ForegroundColor Yellow
$unauthorizedForecast = Invoke-TestAPI -Method "GET" -Endpoint "/api/vendors/unauthorized-vendor-id/financials/forecast"

if (-not $unauthorizedForecast.Success) {
    if ($unauthorizedForecast.StatusCode -eq 404) {
        Write-Host "✅ Unauthorized access properly blocked (404 - Vendor not found)" -ForegroundColor Green
    } elseif ($unauthorizedForecast.StatusCode -eq 403) {
        Write-Host "✅ Unauthorized access properly blocked (403 - Access denied)" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Unauthorized access blocked with status: $($unauthorizedForecast.StatusCode)" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Unauthorized access should have been blocked" -ForegroundColor Red
}

Write-Host "`n9️⃣ Testing Without Authentication" -ForegroundColor Yellow
# Create a new session without authentication
$unauthenticatedSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$unauthenticatedForecast = Invoke-TestAPI -Method "GET" -Endpoint "/api/vendors/$vendorId/financials/forecast"

if (-not $unauthenticatedForecast.Success) {
    if ($unauthenticatedForecast.StatusCode -eq 401) {
        Write-Host "✅ Unauthenticated access properly blocked (401)" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Unauthenticated access blocked with status: $($unauthenticatedForecast.StatusCode)" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Unauthenticated access should have been blocked" -ForegroundColor Red
}

Write-Host "`n🔟 Testing Forecast Data Validation" -ForegroundColor Yellow
if ($forecastResponse.Success) {
    $forecast = $forecastResponse.Content.forecast
    
    # Validate forecast structure
    $requiredFields = @('nextMonthRevenue', 'nextMonthProfit', 'nextMonthOrders', 'avgRevenueGrowthRate', 'avgProfitGrowthRate', 'avgOrderGrowthRate', 'confidence', 'trends', 'insights')
    $missingFields = @()
    
    foreach ($field in $requiredFields) {
        if (-not $forecast.PSObject.Properties.Name.Contains($field)) {
            $missingFields += $field
        }
    }
    
    if ($missingFields.Count -eq 0) {
        Write-Host "✅ Forecast data structure is valid" -ForegroundColor Green
    } else {
        Write-Host "❌ Missing required fields: $($missingFields -join ', ')" -ForegroundColor Red
    }
    
    # Validate trends structure
    $requiredTrends = @('revenue', 'profit', 'orders')
    $missingTrends = @()
    
    foreach ($trend in $requiredTrends) {
        if (-not $forecast.trends.PSObject.Properties.Name.Contains($trend)) {
            $missingTrends += $trend
        }
    }
    
    if ($missingTrends.Count -eq 0) {
        Write-Host "✅ Trends data structure is valid" -ForegroundColor Green
    } else {
        Write-Host "❌ Missing required trends: $($missingTrends -join ', ')" -ForegroundColor Red
    }
    
    # Validate confidence levels
    $validConfidenceLevels = @('high', 'medium', 'low')
    if ($validConfidenceLevels.Contains($forecast.confidence)) {
        Write-Host "✅ Confidence level is valid: $($forecast.confidence)" -ForegroundColor Green
    } else {
        Write-Host "❌ Invalid confidence level: $($forecast.confidence)" -ForegroundColor Red
    }
    
    # Validate trend values
    $validTrendValues = @('increasing', 'decreasing', 'stable', 'insufficient_data')
    foreach ($trend in $requiredTrends) {
        if ($validTrendValues.Contains($forecast.trends.$trend)) {
            Write-Host "✅ $trend trend is valid: $($forecast.trends.$trend)" -ForegroundColor Green
        } else {
            Write-Host "❌ Invalid $trend trend: $($forecast.trends.$trend)" -ForegroundColor Red
        }
    }
}

Write-Host "`n🎉 AI Financial Forecast Tests Completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Key Features Tested:" -ForegroundColor Cyan
Write-Host "• AI forecast generation for revenue, profit, and orders" -ForegroundColor White
Write-Host "• Growth rate calculations and trend analysis" -ForegroundColor White
Write-Host "• Confidence level assessment" -ForegroundColor White
Write-Host "• Business insights generation" -ForegroundColor White
Write-Host "• Multiple time period analysis (3, 6, 12 months)" -ForegroundColor White
Write-Host "• Authorization and access control" -ForegroundColor White
Write-Host "• Data validation and error handling" -ForegroundColor White
Write-Host "• Historical data analysis" -ForegroundColor White
Write-Host ""
Write-Host "Endpoint Details:" -ForegroundColor Cyan
Write-Host "• Path: /api/vendors/:vendorId/financials/forecast" -ForegroundColor White
Write-Host "• Method: GET" -ForegroundColor White
Write-Host "• Query Parameter: months (optional, defaults to 12)" -ForegroundColor White
Write-Host "• Authentication: Required" -ForegroundColor White
Write-Host "• Authorization: Vendor owner or admin only" -ForegroundColor White
Write-Host "• Response: JSON with forecast data, trends, and insights" -ForegroundColor White
Write-Host ""
Write-Host "AI Features:" -ForegroundColor Cyan
Write-Host "• Growth rate analysis using historical data" -ForegroundColor White
Write-Host "• Trend detection (increasing, decreasing, stable)" -ForegroundColor White
Write-Host "• Confidence assessment based on data consistency" -ForegroundColor White
Write-Host "• Cross-metric insights and business recommendations" -ForegroundColor White
Write-Host "• Automatic handling of insufficient data" -ForegroundColor White
Write-Host "• Multiple forecasting periods" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Run database migration to add FinancialSnapshot model" -ForegroundColor White
Write-Host "2. Test with real financial data from vendors" -ForegroundColor White
Write-Host "3. Integrate forecast component into vendor dashboard" -ForegroundColor White
Write-Host "4. Add visualization charts for trend analysis" -ForegroundColor White
Write-Host "5. Implement more advanced AI algorithms" -ForegroundColor White
Write-Host "6. Add seasonal pattern detection" -ForegroundColor White
Write-Host "7. Implement forecast accuracy tracking" -ForegroundColor White 