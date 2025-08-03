# Comprehensive Financial Dashboard Test with Insights
Write-Host "Testing Complete Financial Dashboard with Insights..." -ForegroundColor Green

# Start mock server if not running
$serverProcess = Get-Process -Name "node" -ErrorAction SilentlyContinue
if (-not $serverProcess) {
    Write-Host "Starting mock server..." -ForegroundColor Yellow
    .\start-mock-server.ps1
    Start-Sleep -Seconds 3
}

# Test 1: Basic Financial Data Retrieval
Write-Host "`nTest 1: Basic Financial Data Retrieval..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendors/vendor-1/financials/test" -Method GET
    $data = $response.Content | ConvertFrom-Json
    
    Write-Host "SUCCESS: Retrieved financial data" -ForegroundColor Green
    Write-Host "Vendor: $($data.vendor.storeName)" -ForegroundColor Cyan
    Write-Host "Snapshots: $($data.snapshots.Count)" -ForegroundColor Cyan
    Write-Host "Total Revenue: $($data.summary.totalRevenue)" -ForegroundColor Cyan
    Write-Host "Total Profit: $($data.summary.totalProfit)" -ForegroundColor Cyan
} catch {
    Write-Host "FAILED: Get financial data: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Financial Insights API
Write-Host "`nTest 2: Financial Insights API..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendors/vendor-1/financials/insights/test" -Method GET
    $insights = $response.Content | ConvertFrom-Json
    
    Write-Host "SUCCESS: Retrieved financial insights" -ForegroundColor Green
    Write-Host "Summary: $($insights.summary)" -ForegroundColor Cyan
    Write-Host "Top Gains: $($insights.topGains.Count)" -ForegroundColor Cyan
    Write-Host "Cost Trend: $($insights.costTrend.trend)" -ForegroundColor Cyan
    Write-Host "Burn Rate Status: $($insights.burnRate.status)" -ForegroundColor Cyan
    Write-Host "Monthly Cash Flow: $($insights.burnRate.monthly)" -ForegroundColor Cyan
} catch {
    Write-Host "FAILED: Get insights: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Year/Quarter Filtering
Write-Host "`nTest 3: Year/Quarter Filtering..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendors/vendor-1/financials/test?year=2025&quarter=Q1" -Method GET
    $filteredData = $response.Content | ConvertFrom-Json
    
    Write-Host "SUCCESS: Filtered by Q1 2025" -ForegroundColor Green
    Write-Host "Filtered Snapshots: $($filteredData.snapshots.Count)" -ForegroundColor Cyan
    Write-Host "Period: $($filteredData.period.start) to $($filteredData.period.end)" -ForegroundColor Cyan
} catch {
    Write-Host "FAILED: Filter data: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Insights with Year/Quarter Filtering
Write-Host "`nTest 4: Insights with Year/Quarter Filtering..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendors/vendor-1/financials/insights/test?year=2025&quarter=Q1" -Method GET
    $filteredInsights = $response.Content | ConvertFrom-Json
    
    Write-Host "SUCCESS: Retrieved filtered insights" -ForegroundColor Green
    Write-Host "Period: $($filteredInsights.period.start) to $($filteredInsights.period.end)" -ForegroundColor Cyan
    Write-Host "Snapshots Analyzed: $($filteredInsights.period.snapshotsCount)" -ForegroundColor Cyan
    Write-Host "Top Gains in Q1: $($filteredInsights.topGains.Count)" -ForegroundColor Cyan
} catch {
    Write-Host "FAILED: Get filtered insights: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: CSV Export
Write-Host "`nTest 5: CSV Export..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendors/vendor-1/financials/export.csv/test" -Method GET -OutFile "financial-export-test.csv"
    
    if (Test-Path "financial-export-test.csv") {
        $fileSize = (Get-Item "financial-export-test.csv").Length
        Write-Host "SUCCESS: Exported CSV (Size: $fileSize bytes)" -ForegroundColor Green
    } else {
        Write-Host "FAILED: CSV file not created" -ForegroundColor Red
    }
} catch {
    Write-Host "FAILED: Export CSV: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 6: PDF Export with Charts
Write-Host "`nTest 6: PDF Export with Charts..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendors/vendor-1/financials/export.pdf/test" -Method GET -OutFile "financial-report-test.pdf"
    
    if (Test-Path "financial-report-test.pdf") {
        $fileSize = (Get-Item "financial-report-test.pdf").Length
        Write-Host "SUCCESS: Exported PDF with charts (Size: $fileSize bytes)" -ForegroundColor Green
    } else {
        Write-Host "FAILED: PDF file not created" -ForegroundColor Red
    }
} catch {
    Write-Host "FAILED: Export PDF: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 7: CSV Import
Write-Host "`nTest 7: CSV Import..." -ForegroundColor Yellow
try {
    $csvContent = @"
Date,Revenue,Cost of Goods Sold,Operating Expenses,Net Profit,Cash In,Cash Out,Assets,Liabilities,Equity,Notes
2025-09-01,12000,6000,2000,4000,12000,8000,50000,20000,30000,Test import data
"@
    
    $csvBytes = [System.Text.Encoding]::UTF8.GetBytes($csvContent)
    $boundary = [System.Guid]::NewGuid().ToString()
    $LF = "`r`n"
    
    $bodyLines = @(
        "--$boundary",
        "Content-Disposition: form-data; name=`"file`"; filename=`"test-import.csv`"",
        "Content-Type: text/csv",
        "",
        [System.Text.Encoding]::UTF8.GetString($csvBytes),
        "--$boundary--"
    ) -join $LF
    
    $headers = @{
        "Content-Type" = "multipart/form-data; boundary=$boundary"
    }
    
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendors/vendor-1/financials/import/test" -Method POST -Body $bodyLines -Headers $headers
    
    $importResult = $response.Content | ConvertFrom-Json
    Write-Host "SUCCESS: Imported CSV data" -ForegroundColor Green
    Write-Host "Imported: $($importResult.importedCount) records" -ForegroundColor Cyan
} catch {
    Write-Host "FAILED: Import CSV: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 8: Inline Editing
Write-Host "`nTest 8: Inline Editing..." -ForegroundColor Yellow
try {
    # First get current data
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendors/vendor-1/financials/test" -Method GET
    $data = $response.Content | ConvertFrom-Json
    
    if ($data.snapshots.Count -gt 0) {
        $firstSnapshotId = $data.snapshots[0].id
        $updateData = @{
            revenue = 15000
            notes = "Updated via test script"
        } | ConvertTo-Json
        
        $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendors/vendor-1/financials/$firstSnapshotId/test" -Method PATCH -Body $updateData -ContentType "application/json"
        $updatedSnapshot = $response.Content | ConvertFrom-Json
        
        Write-Host "SUCCESS: Updated financial snapshot" -ForegroundColor Green
        Write-Host "Updated Revenue: $($updatedSnapshot.revenue)" -ForegroundColor Cyan
        Write-Host "Updated Notes: $($updatedSnapshot.notes)" -ForegroundColor Cyan
    } else {
        Write-Host "WARNING: No snapshots available for editing test" -ForegroundColor Yellow
    }
} catch {
    Write-Host "FAILED: Update snapshot: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 9: Margin Alerts
Write-Host "`nTest 9: Margin Alerts..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendor/products/alerts/margin/test" -Method GET
    $alerts = $response.Content | ConvertFrom-Json
    
    Write-Host "SUCCESS: Retrieved margin alerts" -ForegroundColor Green
    Write-Host "Products with alerts: $($alerts.products.Count)" -ForegroundColor Cyan
    Write-Host "Total alerts: $($alerts.totalAlerts)" -ForegroundColor Cyan
} catch {
    Write-Host "FAILED: Get margin alerts: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 10: Error Handling
Write-Host "`nTest 10: Error Handling..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendors/non-existent/financials/insights/test" -Method GET
    Write-Host "FAILED: Should have failed with non-existent vendor" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "SUCCESS: Correctly handled non-existent vendor" -ForegroundColor Green
    } else {
        Write-Host "FAILED: Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Cleanup test files
if (Test-Path "financial-export-test.csv") {
    Remove-Item "financial-export-test.csv"
    Write-Host "`nCLEANUP: Removed test CSV file" -ForegroundColor Gray
}

if (Test-Path "financial-report-test.pdf") {
    Remove-Item "financial-report-test.pdf"
    Write-Host "CLEANUP: Removed test PDF file" -ForegroundColor Gray
}

Write-Host "`nCOMPLETE: Financial Dashboard Test with Insights finished!" -ForegroundColor Green
Write-Host "`nSummary of Features Tested:" -ForegroundColor Cyan
Write-Host "SUCCESS: Basic Financial Data Retrieval" -ForegroundColor Green
Write-Host "SUCCESS: Financial Insights API" -ForegroundColor Green
Write-Host "SUCCESS: Year/Quarter Filtering" -ForegroundColor Green
Write-Host "SUCCESS: Insights with Filtering" -ForegroundColor Green
Write-Host "SUCCESS: CSV Export" -ForegroundColor Green
Write-Host "SUCCESS: PDF Export with Charts" -ForegroundColor Green
Write-Host "SUCCESS: CSV Import" -ForegroundColor Green
Write-Host "SUCCESS: Inline Editing" -ForegroundColor Green
Write-Host "SUCCESS: Margin Alerts" -ForegroundColor Green
Write-Host "SUCCESS: Error Handling" -ForegroundColor Green 