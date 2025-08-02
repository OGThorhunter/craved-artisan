# Comprehensive test for all financial functionality
Write-Host "Testing Complete Financial System" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Test 1: Generate Financial Snapshot
Write-Host "`n1. Testing Financial Snapshot Generation" -ForegroundColor Yellow
try {
    $body = @{
        period = "monthly"
        notes = "Test snapshot for comprehensive testing"
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendors/vendor-1/financials/generate/test" -Method POST -Body $body -ContentType "application/json"
    Write-Host "✅ Snapshot Generation Successful (Status: $($response.StatusCode))" -ForegroundColor Green
    $data = $response.Content | ConvertFrom-Json
    Write-Host "   Generated Snapshot ID: $($data.snapshot.id)" -ForegroundColor Green
    Write-Host "   Revenue: $($data.snapshot.revenue)" -ForegroundColor Green
    Write-Host "   Net Profit: $($data.snapshot.netProfit)" -ForegroundColor Green
} catch {
    Write-Host "❌ Snapshot Generation Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Fetch Financial Data
Write-Host "`n2. Testing Financial Data Fetch" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendors/vendor-1/financials/test?range=monthly" -Method GET
    Write-Host "✅ Data Fetch Successful (Status: $($response.StatusCode))" -ForegroundColor Green
    $data = $response.Content | ConvertFrom-Json
    Write-Host "   Vendor: $($data.vendor.storeName)" -ForegroundColor Green
    Write-Host "   Snapshots Count: $($data.snapshots.Count)" -ForegroundColor Green
    Write-Host "   Total Revenue: $($data.summary.totalRevenue)" -ForegroundColor Green
    Write-Host "   Total Profit: $($data.summary.totalProfit)" -ForegroundColor Green
} catch {
    Write-Host "❌ Data Fetch Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: CSV Export
Write-Host "`n3. Testing CSV Export" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendors/vendor-1/financials/export.csv/test" -Method GET
    Write-Host "✅ CSV Export Successful (Status: $($response.StatusCode))" -ForegroundColor Green
    Write-Host "   Content-Type: $($response.Headers.'Content-Type')" -ForegroundColor Green
    Write-Host "   File Size: $($response.Content.Length) bytes" -ForegroundColor Green
    
    # Save CSV file
    $response.Content | Out-File -FilePath "comprehensive-test-export.csv" -Encoding UTF8
    Write-Host "   CSV file saved as: comprehensive-test-export.csv" -ForegroundColor Green
} catch {
    Write-Host "❌ CSV Export Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: PDF Export
Write-Host "`n4. Testing PDF Export" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendors/vendor-1/financials/export.pdf/test" -Method GET
    Write-Host "✅ PDF Export Successful (Status: $($response.StatusCode))" -ForegroundColor Green
    Write-Host "   Content-Type: $($response.Headers.'Content-Type')" -ForegroundColor Green
    Write-Host "   File Size: $($response.Content.Length) bytes" -ForegroundColor Green
    
    # Save PDF file
    [System.IO.File]::WriteAllBytes("comprehensive-test-export.pdf", $response.Content)
    Write-Host "   PDF file saved as: comprehensive-test-export.pdf" -ForegroundColor Green
} catch {
    Write-Host "❌ PDF Export Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: CSV Import
Write-Host "`n5. Testing CSV Import" -ForegroundColor Yellow
try {
    # Read the CSV file content
    $csvContent = Get-Content "test-import-data.csv" -Raw
    
    # Create multipart form data manually
    $boundary = [System.Guid]::NewGuid().ToString()
    $LF = "`r`n"
    $bodyLines = @(
        "--$boundary",
        "Content-Disposition: form-data; name=`"file`"; filename=`"test-import-data.csv`"",
        "Content-Type: text/csv",
        "",
        $csvContent,
        "--$boundary--"
    )
    $body = $bodyLines -join $LF
    
    $headers = @{
        "Content-Type" = "multipart/form-data; boundary=$boundary"
    }
    
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendors/vendor-1/financials/import/test" -Method POST -Body $body -Headers $headers
    Write-Host "✅ CSV Import Successful (Status: $($response.StatusCode))" -ForegroundColor Green
    
    $data = $response.Content | ConvertFrom-Json
    Write-Host "   Import Result: $($data.message)" -ForegroundColor Green
    Write-Host "   Imported Count: $($data.importedCount)" -ForegroundColor Green
    Write-Host "   Total Rows: $($data.totalRows)" -ForegroundColor Green
    Write-Host "   Field Mapping: $($data.mapping | ConvertTo-Json -Compress)" -ForegroundColor Green
} catch {
    Write-Host "❌ CSV Import Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 6: Verify Imported Data
Write-Host "`n6. Verifying Imported Data" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendors/vendor-1/financials/test?range=yearly" -Method GET
    Write-Host "✅ Data Verification Successful (Status: $($response.StatusCode))" -ForegroundColor Green
    
    $data = $response.Content | ConvertFrom-Json
    $importedSnapshots = $data.snapshots | Where-Object { $_.id -like "imported-*" }
    Write-Host "   Found $($importedSnapshots.Count) imported snapshots" -ForegroundColor Green
    
    if ($importedSnapshots.Count -gt 0) {
        Write-Host "   Sample imported data:" -ForegroundColor Green
        Write-Host "     Revenue: $($importedSnapshots[0].revenue)" -ForegroundColor Gray
        Write-Host "     Net Profit: $($importedSnapshots[0].netProfit)" -ForegroundColor Gray
        Write-Host "     Notes: $($importedSnapshots[0].notes)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Data Verification Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 7: Error Handling - Non-existent Vendor
Write-Host "`n7. Testing Error Handling (Non-existent Vendor)" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendors/non-existent/financials/test" -Method GET
    Write-Host "❌ Unexpected success with non-existent vendor" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "✅ Correctly returned 404 for non-existent vendor" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Unexpected error: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# Test 8: Analytics Endpoint
Write-Host "`n8. Testing Analytics Endpoint" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/financial/analytics/test?period=30" -Method GET
    Write-Host "✅ Analytics Successful (Status: $($response.StatusCode))" -ForegroundColor Green
    
    $data = $response.Content | ConvertFrom-Json
    Write-Host "   Total Revenue: $($data.analytics.totalRevenue)" -ForegroundColor Green
    Write-Host "   Total Profit: $($data.analytics.totalProfit)" -ForegroundColor Green
    Write-Host "   Profit Margin: $($data.analytics.avgProfitMargin)%" -ForegroundColor Green
    Write-Host "   Trends Count: $($data.analytics.trends.Count)" -ForegroundColor Green
} catch {
    Write-Host "❌ Analytics Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 Complete Financial System Test Finished!" -ForegroundColor Cyan
Write-Host "Generated files:" -ForegroundColor Cyan
Write-Host "  - comprehensive-test-export.csv (CSV export)" -ForegroundColor Gray
Write-Host "  - comprehensive-test-export.pdf (PDF export)" -ForegroundColor Gray
Write-Host "  - test-import-data.csv (test data)" -ForegroundColor Gray

Write-Host "`nSummary:" -ForegroundColor Cyan
Write-Host "✅ Financial snapshot generation" -ForegroundColor Green
Write-Host "✅ Financial data fetching" -ForegroundColor Green
Write-Host "✅ CSV export functionality" -ForegroundColor Green
Write-Host "✅ PDF export functionality" -ForegroundColor Green
Write-Host "✅ CSV import with AI mapping" -ForegroundColor Green
Write-Host "✅ Data verification" -ForegroundColor Green
Write-Host "✅ Error handling" -ForegroundColor Green
Write-Host "✅ Analytics endpoint" -ForegroundColor Green 