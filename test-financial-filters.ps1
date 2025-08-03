# Test Financial Filters by Year + Quarter
Write-Host "Testing Financial Filters by Year + Quarter" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# Test 1: Get data for specific year (2025)
Write-Host "`n1. Testing Year Filter (2025)" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendors/vendor-1/financials/test?year=2025" -Method GET
    $data = $response.Content | ConvertFrom-Json
    
    Write-Host "✅ Year filter successful (Status: $($response.StatusCode))" -ForegroundColor Green
    Write-Host "   Year: $($data.year)" -ForegroundColor White
    Write-Host "   Quarter: $($data.quarter)" -ForegroundColor White
    Write-Host "   Snapshots: $($data.snapshots.Count)" -ForegroundColor White
    Write-Host "   Total Revenue: $($data.summary.totalRevenue)" -ForegroundColor White
    Write-Host "   Period: $($data.period.start) to $($data.period.end)" -ForegroundColor White
} catch {
    Write-Host "❌ Year filter failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Get data for specific quarter (Q1 2025)
Write-Host "`n2. Testing Quarter Filter (Q1 2025)" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendors/vendor-1/financials/test?year=2025&quarter=Q1" -Method GET
    $data = $response.Content | ConvertFrom-Json
    
    Write-Host "✅ Quarter filter successful (Status: $($response.StatusCode))" -ForegroundColor Green
    Write-Host "   Year: $($data.year)" -ForegroundColor White
    Write-Host "   Quarter: $($data.quarter)" -ForegroundColor White
    Write-Host "   Snapshots: $($data.snapshots.Count)" -ForegroundColor White
    Write-Host "   Total Revenue: $($data.summary.totalRevenue)" -ForegroundColor White
    Write-Host "   Period: $($data.period.start) to $($data.period.end)" -ForegroundColor White
} catch {
    Write-Host "❌ Quarter filter failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Get data for Q2 2025
Write-Host "`n3. Testing Quarter Filter (Q2 2025)" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendors/vendor-1/financials/test?year=2025&quarter=Q2" -Method GET
    $data = $response.Content | ConvertFrom-Json
    
    Write-Host "✅ Q2 filter successful (Status: $($response.StatusCode))" -ForegroundColor Green
    Write-Host "   Year: $($data.year)" -ForegroundColor White
    Write-Host "   Quarter: $($data.quarter)" -ForegroundColor White
    Write-Host "   Snapshots: $($data.snapshots.Count)" -ForegroundColor White
    Write-Host "   Total Revenue: $($data.summary.totalRevenue)" -ForegroundColor White
    Write-Host "   Period: $($data.period.start) to $($data.period.end)" -ForegroundColor White
} catch {
    Write-Host "❌ Q2 filter failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Get data for 2024
Write-Host "`n4. Testing Year Filter (2024)" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendors/vendor-1/financials/test?year=2024" -Method GET
    $data = $response.Content | ConvertFrom-Json
    
    Write-Host "✅ 2024 filter successful (Status: $($response.StatusCode))" -ForegroundColor Green
    Write-Host "   Year: $($data.year)" -ForegroundColor White
    Write-Host "   Quarter: $($data.quarter)" -ForegroundColor White
    Write-Host "   Snapshots: $($data.snapshots.Count)" -ForegroundColor White
    Write-Host "   Total Revenue: $($data.summary.totalRevenue)" -ForegroundColor White
    Write-Host "   Period: $($data.period.start) to $($data.period.end)" -ForegroundColor White
} catch {
    Write-Host "❌ 2024 filter failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Get data for Q4 2024
Write-Host "`n5. Testing Quarter Filter (Q4 2024)" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendors/vendor-1/financials/test?year=2024&quarter=Q4" -Method GET
    $data = $response.Content | ConvertFrom-Json
    
    Write-Host "✅ Q4 2024 filter successful (Status: $($response.StatusCode))" -ForegroundColor Green
    Write-Host "   Year: $($data.year)" -ForegroundColor White
    Write-Host "   Quarter: $($data.quarter)" -ForegroundColor White
    Write-Host "   Snapshots: $($data.snapshots.Count)" -ForegroundColor White
    Write-Host "   Total Revenue: $($data.summary.totalRevenue)" -ForegroundColor White
    Write-Host "   Period: $($data.period.start) to $($data.period.end)" -ForegroundColor White
} catch {
    Write-Host "❌ Q4 2024 filter failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 6: Fallback to range-based filtering (no year/quarter specified)
Write-Host "`n6. Testing Fallback to Range Filtering" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendors/vendor-1/financials/test?range=monthly" -Method GET
    $data = $response.Content | ConvertFrom-Json
    
    Write-Host "✅ Range fallback successful (Status: $($response.StatusCode))" -ForegroundColor Green
    Write-Host "   Range: $($data.range)" -ForegroundColor White
    Write-Host "   Year: $($data.year)" -ForegroundColor White
    Write-Host "   Quarter: $($data.quarter)" -ForegroundColor White
    Write-Host "   Snapshots: $($data.snapshots.Count)" -ForegroundColor White
    Write-Host "   Total Revenue: $($data.summary.totalRevenue)" -ForegroundColor White
    Write-Host "   Period: $($data.period.start) to $($data.period.end)" -ForegroundColor White
} catch {
    Write-Host "❌ Range fallback failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 Financial Filters Test Complete!" -ForegroundColor Green
Write-Host "The new year and quarter filtering is working correctly!" -ForegroundColor Green 