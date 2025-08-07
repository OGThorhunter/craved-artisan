# Comprehensive Analytics System Test
Write-Host "🧪 Testing Complete Analytics System..." -ForegroundColor Green

$baseUrl = "http://localhost:3001"
$testVendorId = "vendor_001"

# Step 1: Check if server is running
Write-Host "`n📋 Step 1: Checking Server Status..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get -TimeoutSec 5
    Write-Host "✅ Server is running" -ForegroundColor Green
    Write-Host "   Status: $($response.status)" -ForegroundColor Cyan
    Write-Host "   Service: $($response.service)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Server is not responding" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`n💡 Please start the server with: cd server && npm run dev" -ForegroundColor Yellow
    exit 1
}

# Step 2: Test all analytics endpoints
Write-Host "`n📋 Step 2: Testing All Analytics Endpoints..." -ForegroundColor Yellow

# Test trends endpoints
Write-Host "   Testing trends endpoints..." -ForegroundColor Cyan
$trendRanges = @('daily', 'weekly', 'monthly')
foreach ($range in $trendRanges) {
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/vendor/$testVendorId/analytics/trends?range=$range" -Method Get -TimeoutSec 10
        Write-Host "   ✅ $range trends working" -ForegroundColor Green
        Write-Host "      Data points: $($response.data.Count)" -ForegroundColor Gray
    } catch {
        Write-Host "   ❌ $range trends failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test analytics summary
Write-Host "   Testing analytics summary..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/vendor/$testVendorId/analytics/summary" -Method Get -TimeoutSec 10
    Write-Host "   ✅ Analytics summary working" -ForegroundColor Green
    Write-Host "      Vendor: $($response.data.vendorName)" -ForegroundColor Gray
    Write-Host "      Total Revenue: $($response.data.totalRevenue)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Analytics summary failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test conversion funnel
Write-Host "   Testing conversion funnel..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/vendor/$testVendorId/analytics/conversion?range=monthly" -Method Get -TimeoutSec 10
    Write-Host "   ✅ Conversion funnel working" -ForegroundColor Green
    Write-Host "      Views: $($response.data.views)" -ForegroundColor Gray
    Write-Host "      Purchases: $($response.data.purchases)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Conversion funnel failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test best sellers
Write-Host "   Testing best sellers..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/vendor/$testVendorId/analytics/bestsellers?range=monthly&limit=5" -Method Get -TimeoutSec 10
    Write-Host "   ✅ Best sellers working" -ForegroundColor Green
    Write-Host "      Products returned: $($response.data.Count)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Best sellers failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test profit & loss
Write-Host "   Testing profit & loss..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/vendor/$testVendorId/financials/profit-loss?range=monthly" -Method Get -TimeoutSec 10
    Write-Host "   ✅ Profit & loss working" -ForegroundColor Green
    Write-Host "      Revenue: $($response.data.income.revenue)" -ForegroundColor Gray
    Write-Host "      Net Profit: $($response.data.netProfit)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Profit & loss failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test portfolio builder
Write-Host "   Testing portfolio builder..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/vendor/$testVendorId/analytics/portfolio" -Method Get -TimeoutSec 10
    Write-Host "   ✅ Portfolio builder working" -ForegroundColor Green
    Write-Host "      Categories: $($response.data.Count)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Portfolio builder failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test customer insights
Write-Host "   Testing customer insights..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/vendor/$testVendorId/analytics/customers/by-zip?range=monthly" -Method Get -TimeoutSec 10
    Write-Host "   ✅ Customer insights working" -ForegroundColor Green
    Write-Host "      ZIP codes: $($response.data.Count)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Customer insights failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 3: Test error handling
Write-Host "`n📋 Step 3: Testing Error Handling..." -ForegroundColor Yellow

# Test invalid vendor ID
Write-Host "   Testing invalid vendor ID..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/vendor/invalid-vendor/analytics/trends?range=daily" -Method Get -TimeoutSec 10
    Write-Host "   ❌ Should have failed with 404" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "   ✅ Invalid vendor correctly returns 404" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Unexpected error: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}

# Test invalid range parameter
Write-Host "   Testing invalid range parameter..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/vendor/$testVendorId/analytics/trends?range=invalid" -Method Get -TimeoutSec 10
    Write-Host "   ❌ Should have failed with 400" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "   ✅ Invalid range correctly returns 400" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Unexpected error: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}

# Step 4: Check frontend integration
Write-Host "`n📋 Step 4: Checking Frontend Integration..." -ForegroundColor Yellow

# Check if frontend is running
try {
    $frontendResponse = Invoke-RestMethod -Uri "http://localhost:5175" -Method Get -TimeoutSec 5
    Write-Host "   ✅ Frontend is running on port 5175" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️  Frontend not running on port 5175" -ForegroundColor Yellow
    Write-Host "      Start with: cd client && npm run dev" -ForegroundColor Gray
}

# Step 5: Summary and next steps
Write-Host "`n📋 Step 5: Summary and Next Steps..." -ForegroundColor Yellow

Write-Host "`n🎯 Next Steps to Complete Testing:" -ForegroundColor Green
Write-Host "1. Start frontend: cd client && npm run dev" -ForegroundColor Cyan
Write-Host "2. Navigate to: http://localhost:5175/dashboard/vendor/analytics" -ForegroundColor Cyan
Write-Host "3. Test all analytics components with real data" -ForegroundColor Cyan
Write-Host "4. Verify charts display correctly" -ForegroundColor Cyan
Write-Host "5. Test range switching across all components" -ForegroundColor Cyan

Write-Host "`n🔧 If you need to add real vendor data:" -ForegroundColor Yellow
Write-Host "1. Check database for existing vendors: npx prisma studio" -ForegroundColor Gray
Write-Host "2. Add test orders for a vendor" -ForegroundColor Gray
Write-Host "3. Update vendor ID in test scripts" -ForegroundColor Gray

Write-Host "`n📊 Available Analytics Endpoints:" -ForegroundColor Green
Write-Host "✅ GET /api/vendor/:id/analytics/trends?range=daily|weekly|monthly" -ForegroundColor Cyan
Write-Host "✅ GET /api/vendor/:id/analytics/summary" -ForegroundColor Cyan
Write-Host "✅ GET /api/vendor/:id/analytics/conversion?range=daily|weekly|monthly" -ForegroundColor Cyan
Write-Host "✅ GET /api/vendor/:id/analytics/bestsellers?range=weekly|monthly|quarterly&limit=10" -ForegroundColor Cyan
Write-Host "✅ GET /api/vendor/:id/financials/profit-loss?range=monthly|quarterly|yearly" -ForegroundColor Cyan
Write-Host "✅ GET /api/vendor/:id/analytics/portfolio" -ForegroundColor Cyan
Write-Host "✅ GET /api/vendor/:id/analytics/customers/by-zip?range=monthly|quarterly|yearly" -ForegroundColor Cyan

Write-Host "`n✅ Complete Analytics System Test Completed!" -ForegroundColor Green 