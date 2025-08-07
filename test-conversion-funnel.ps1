# Test Enhanced Conversion Funnel API
Write-Host "🧪 Testing Enhanced Conversion Funnel API..." -ForegroundColor Green

$baseUrl = "http://localhost:3001"
$testVendorId = "vendor_001"

# Check if server is running
Write-Host "`n📋 Step 1: Checking Server Status..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get -TimeoutSec 5
    Write-Host "✅ Server is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Server is not responding" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`n💡 Please start the server with: cd server && npm run dev" -ForegroundColor Yellow
    exit 1
}

# Test Conversion Funnel API
Write-Host "`n📋 Step 2: Testing Enhanced Conversion Funnel API..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/vendor/$testVendorId/analytics/conversion?range=monthly" -Method Get -TimeoutSec 10
    
    Write-Host "✅ Conversion Funnel API working" -ForegroundColor Green
    Write-Host "   Success: $($response.success)" -ForegroundColor Gray
    Write-Host "   Vendor: $($response.meta.vendorName)" -ForegroundColor Gray
    
    # Test basic funnel metrics
    Write-Host "`n📊 Basic Funnel Metrics:" -ForegroundColor Cyan
    Write-Host "   Views: $($response.data.views)" -ForegroundColor Gray
    Write-Host "   Add to Cart: $($response.data.addToCart)" -ForegroundColor Gray
    Write-Host "   Checkout Started: $($response.data.checkoutStarted)" -ForegroundColor Gray
    Write-Host "   Purchases: $($response.data.purchases)" -ForegroundColor Gray
    
    # Test conversion rates
    Write-Host "`n📈 Conversion Rates:" -ForegroundColor Cyan
    Write-Host "   View to Cart: $($response.data.conversionRates.viewToCart)%" -ForegroundColor Gray
    Write-Host "   Cart to Checkout: $($response.data.conversionRates.cartToCheckout)%" -ForegroundColor Gray
    Write-Host "   Checkout to Purchase: $($response.data.conversionRates.checkoutToPurchase)%" -ForegroundColor Gray
    
    # Test dropoff analysis
    Write-Host "`n📉 Dropoff Analysis:" -ForegroundColor Cyan
    Write-Host "   View to Cart Dropoff: $($response.data.dropoffAnalysis.viewToCart)%" -ForegroundColor Gray
    Write-Host "   Cart to Checkout Dropoff: $($response.data.dropoffAnalysis.cartToCheckout)%" -ForegroundColor Gray
    Write-Host "   Checkout to Purchase Dropoff: $($response.data.dropoffAnalysis.checkoutToPurchase)%" -ForegroundColor Gray
    Write-Host "   Overall Conversion: $($response.data.dropoffAnalysis.overallConversion)%" -ForegroundColor Gray
    
    # Test potential revenue loss
    Write-Host "`n💰 Potential Revenue Loss:" -ForegroundColor Cyan
    Write-Host "   Cart Abandonment: $($response.data.potentialRevenueLoss.cartAbandonment)" -ForegroundColor Gray
    Write-Host "   Checkout Abandonment: $($response.data.potentialRevenueLoss.checkoutAbandonment)" -ForegroundColor Gray
    Write-Host "   Total Potential Loss: $($response.data.potentialRevenueLoss.totalPotentialLoss)" -ForegroundColor Gray
    Write-Host "   Average Order Value: $($response.data.potentialRevenueLoss.avgOrderValue)" -ForegroundColor Gray
    
    # Validate data structure
    Write-Host "`n✅ Data Structure Validation:" -ForegroundColor Green
    $requiredFields = @(
        'views', 'addToCart', 'checkoutStarted', 'purchases',
        'dropoffAnalysis', 'potentialRevenueLoss', 'conversionRates'
    )
    
    foreach ($field in $requiredFields) {
        if ($response.data.$field) {
            Write-Host "   ✅ $field present" -ForegroundColor Green
        } else {
            Write-Host "   ❌ $field missing" -ForegroundColor Red
        }
    }
    
    # Test different ranges
    Write-Host "`n📋 Step 3: Testing Different Ranges..." -ForegroundColor Yellow
    $ranges = @('daily', 'weekly', 'monthly')
    
    foreach ($range in $ranges) {
        try {
            $rangeResponse = Invoke-RestMethod -Uri "$baseUrl/api/vendor/$testVendorId/analytics/conversion?range=$range" -Method Get -TimeoutSec 5
            Write-Host "   ✅ $range range working" -ForegroundColor Green
        } catch {
            Write-Host "   ❌ $range range failed: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
} catch {
    Write-Host "❌ Conversion Funnel API failed" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "   Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
    }
}

Write-Host "`n🎯 Next Steps:" -ForegroundColor Green
Write-Host "1. Start frontend: cd client && npm run dev" -ForegroundColor Cyan
Write-Host "2. Navigate to: http://localhost:5174/dashboard/vendor/analytics?tab=insights" -ForegroundColor Cyan
Write-Host "3. View the enhanced Conversion Funnel component" -ForegroundColor Cyan
Write-Host "4. Test range switching (daily/weekly/monthly)" -ForegroundColor Cyan

Write-Host "`n✅ Enhanced Conversion Funnel API Test Completed!" -ForegroundColor Green 