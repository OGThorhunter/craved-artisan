# Test Financial Summary API Endpoint
Write-Host "Testing Financial Summary API Endpoint..." -ForegroundColor Green

# Check if mock server is running
try {
    $healthCheck = Invoke-WebRequest -Uri "http://localhost:3001/health/test" -Method GET -TimeoutSec 5
    Write-Host "Mock server is running" -ForegroundColor Green
} catch {
    Write-Host "Mock server is not running. Starting it..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; .\start-mock-server.ps1"
    Start-Sleep -Seconds 5
}

Write-Host "`n=== Testing Financial Summary API ===" -ForegroundColor Cyan

# Test 1: Get financial summary for vendor-1
Write-Host "`nTest 1: Get financial summary for vendor-1" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendors/vendor-1/financials/summary/test" -Method GET
    $data = $response.Content | ConvertFrom-Json
    
    Write-Host "SUCCESS: Financial summary retrieved" -ForegroundColor Green
    Write-Host "Revenue vs Profit data points: $($data.revenueVsProfit.Count)" -ForegroundColor White
    Write-Host "COGS Trend data points: $($data.cogsTrend.Count)" -ForegroundColor White
    
    if ($data.revenueVsProfit.Count -gt 0) {
        Write-Host "Sample Revenue vs Profit data:" -ForegroundColor Gray
        $data.revenueVsProfit[0] | ConvertTo-Json -Depth 2
    }
    
    if ($data.cogsTrend.Count -gt 0) {
        Write-Host "Sample COGS Trend data:" -ForegroundColor Gray
        $data.cogsTrend[0] | ConvertTo-Json -Depth 2
    }
} catch {
    Write-Host "FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Get financial summary for vendor-2
Write-Host "`nTest 2: Get financial summary for vendor-2" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendors/vendor-2/financials/summary/test" -Method GET
    $data = $response.Content | ConvertFrom-Json
    
    Write-Host "SUCCESS: Financial summary retrieved for vendor-2" -ForegroundColor Green
    Write-Host "Revenue vs Profit data points: $($data.revenueVsProfit.Count)" -ForegroundColor White
    Write-Host "COGS Trend data points: $($data.cogsTrend.Count)" -ForegroundColor White
} catch {
    Write-Host "FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Test non-existent vendor
Write-Host "`nTest 3: Test non-existent vendor" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendors/non-existent/financials/summary/test" -Method GET
    Write-Host "SUCCESS: Response received for non-existent vendor" -ForegroundColor Green
    $data = $response.Content | ConvertFrom-Json
    Write-Host "Response: $($data | ConvertTo-Json)" -ForegroundColor Gray
} catch {
    Write-Host "Expected error for non-existent vendor: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Test 4: Verify data structure
Write-Host "`nTest 4: Verify data structure" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendors/vendor-1/financials/summary/test" -Method GET
    $data = $response.Content | ConvertFrom-Json
    
    $hasRevenueVsProfit = $data.PSObject.Properties.Name -contains "revenueVsProfit"
    $hasCogsTrend = $data.PSObject.Properties.Name -contains "cogsTrend"
    
    if ($hasRevenueVsProfit -and $hasCogsTrend) {
        Write-Host "SUCCESS: Data structure is correct" -ForegroundColor Green
        Write-Host "SUCCESS: Has revenueVsProfit property" -ForegroundColor Green
        Write-Host "SUCCESS: Has cogsTrend property" -ForegroundColor Green
        
        # Check if arrays have the expected structure
        if ($data.revenueVsProfit.Count -gt 0) {
            $sample = $data.revenueVsProfit[0]
            $hasDate = $sample.PSObject.Properties.Name -contains "date"
            $hasRevenue = $sample.PSObject.Properties.Name -contains "revenue"
            $hasProfit = $sample.PSObject.Properties.Name -contains "profit"
            
            if ($hasDate -and $hasRevenue -and $hasProfit) {
                Write-Host "SUCCESS: revenueVsProfit has correct structure (date, revenue, profit)" -ForegroundColor Green
            } else {
                Write-Host "FAILED: revenueVsProfit missing required properties" -ForegroundColor Red
            }
        }
        
        if ($data.cogsTrend.Count -gt 0) {
            $sample = $data.cogsTrend[0]
            $hasDate = $sample.PSObject.Properties.Name -contains "date"
            $hasCogs = $sample.PSObject.Properties.Name -contains "cogs"
            
            if ($hasDate -and $hasCogs) {
                Write-Host "SUCCESS: cogsTrend has correct structure (date, cogs)" -ForegroundColor Green
            } else {
                Write-Host "FAILED: cogsTrend missing required properties" -ForegroundColor Red
            }
        }
    } else {
        Write-Host "FAILED: Missing required properties" -ForegroundColor Red
    }
} catch {
    Write-Host "FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Financial Summary API Test Complete ===" -ForegroundColor Cyan
Write-Host "The Financial Summary component should now display:" -ForegroundColor White
Write-Host "• Revenue vs Profit line chart with purple and green lines" -ForegroundColor Gray
Write-Host "• COGS Trend line chart with red line" -ForegroundColor Gray
Write-Host "• Interactive tooltips and legends" -ForegroundColor Gray
Write-Host "• Responsive design that adapts to screen size" -ForegroundColor Gray 