# Test Route Optimization Endpoints
Write-Host "🗺️ Testing Route Optimization Endpoints" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Test 1: Get optimization options
Write-Host "`n📋 Test 1: Get Optimization Options" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/route/optimize/options" -Method GET
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Success: Optimization options fetched" -ForegroundColor Green
        $data = $response.Content | ConvertFrom-Json
        Write-Host "   Available methods: $($data.options.Count)" -ForegroundColor Gray
        foreach ($option in $data.options) {
            Write-Host "   - $($option.name): $($option.description)" -ForegroundColor Gray
        }
    } else {
        Write-Host "❌ Failed: Unexpected status code $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "⚠️  Expected: Authentication required" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 2: Optimize route with sample data
Write-Host "`n🚗 Test 2: Optimize Delivery Route" -ForegroundColor Yellow
try {
    $routeData = @{
        origin = "97201"
        stops = @(
            @{
                zip = "97202"
                orderId = "order-1"
                address = "123 Main St, Portland, OR"
                customerName = "John Doe"
            },
            @{
                zip = "97205"
                orderId = "order-2"
                address = "456 Oak Ave, Portland, OR"
                customerName = "Jane Smith"
            },
            @{
                zip = "97209"
                orderId = "order-3"
                address = "789 Pine St, Portland, OR"
                customerName = "Bob Johnson"
            },
            @{
                zip = "97212"
                orderId = "order-4"
                address = "321 Elm Rd, Portland, OR"
                customerName = "Alice Brown"
            }
        )
    } | ConvertTo-Json -Depth 3

    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/route/optimize" -Method POST -Body $routeData -ContentType "application/json"
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Success: Route optimized" -ForegroundColor Green
        $data = $response.Content | ConvertFrom-Json
        Write-Host "   Total Distance: $($data.optimizedRoute.summary.totalDistance) miles" -ForegroundColor Gray
        Write-Host "   Estimated Time: $($data.optimizedRoute.summary.estimatedTimeHours) hours" -ForegroundColor Gray
        Write-Host "   Fuel Cost: $$($data.optimizedRoute.summary.fuelCost)" -ForegroundColor Gray
        Write-Host "   Method: $($data.optimizedRoute.summary.optimizationMethod)" -ForegroundColor Gray
        Write-Host "   Optimized Stops: $($data.optimizedRoute.stops.Count)" -ForegroundColor Gray
        
        # Show optimized order
        Write-Host "   Optimized Route Order:" -ForegroundColor Gray
        for ($i = 0; $i -lt $data.optimizedRoute.stops.Count; $i++) {
            $stop = $data.optimizedRoute.stops[$i]
            Write-Host "     $($i + 1). $($stop.customerName) - $($stop.zip)" -ForegroundColor Gray
        }
    } else {
        Write-Host "❌ Failed: Unexpected status code $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "⚠️  Expected: Authentication required" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 3: Test with invalid data
Write-Host "`n❌ Test 3: Invalid Route Data" -ForegroundColor Yellow
try {
    $invalidData = @{
        origin = ""
        stops = @()
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/route/optimize" -Method POST -Body $invalidData -ContentType "application/json"
    if ($response.StatusCode -eq 400) {
        Write-Host "✅ Success: Properly rejected invalid data" -ForegroundColor Green
        $data = $response.Content | ConvertFrom-Json
        Write-Host "   Error: $($data.error)" -ForegroundColor Gray
    } else {
        Write-Host "❌ Failed: Should have rejected invalid data" -ForegroundColor Red
    }
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "✅ Success: Properly rejected invalid data" -ForegroundColor Green
    } else {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 4: Test with single stop
Write-Host "`n📍 Test 4: Single Stop Route" -ForegroundColor Yellow
try {
    $singleStopData = @{
        origin = "97201"
        stops = @(
            @{
                zip = "97202"
                orderId = "order-single"
                customerName = "Single Customer"
            }
        )
    } | ConvertTo-Json -Depth 3

    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/route/optimize" -Method POST -Body $singleStopData -ContentType "application/json"
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Success: Single stop route optimized" -ForegroundColor Green
        $data = $response.Content | ConvertFrom-Json
        Write-Host "   Total Distance: $($data.optimizedRoute.summary.totalDistance) miles" -ForegroundColor Gray
        Write-Host "   Stops: $($data.optimizedRoute.stops.Count)" -ForegroundColor Gray
    } else {
        Write-Host "❌ Failed: Unexpected status code $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "⚠️  Expected: Authentication required" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n🎯 Route Optimization Testing Complete!" -ForegroundColor Cyan
Write-Host "Note: All endpoints require authentication (401 expected)" -ForegroundColor Yellow 