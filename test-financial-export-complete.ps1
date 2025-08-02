# Comprehensive test for financial export functionality
Write-Host "Testing Complete Financial Export Functionality" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan

# Test 1: API CSV Export Endpoint
Write-Host "`n1. Testing API CSV Export Endpoint" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendors/vendor-1/financials/export.csv/test" -Method GET
    Write-Host "✅ API CSV Export Successful (Status: $($response.StatusCode))" -ForegroundColor Green
    Write-Host "   Content-Type: $($response.Headers.'Content-Type')" -ForegroundColor Green
    Write-Host "   Content-Disposition: $($response.Headers.'Content-Disposition')" -ForegroundColor Green
    Write-Host "   File Size: $($response.Content.Length) bytes" -ForegroundColor Green
    
    # Save and verify CSV content
    $response.Content | Out-File -FilePath "api-export-test.csv" -Encoding UTF8
    $csvLines = $response.Content -split "`n"
    Write-Host "   CSV Rows: $($csvLines.Count)" -ForegroundColor Green
    Write-Host "   Headers: $($csvLines[0])" -ForegroundColor Green
} catch {
    Write-Host "❌ API CSV Export Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Financial Data Retrieval
Write-Host "`n2. Testing Financial Data Retrieval" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendors/vendor-1/financials/test?range=monthly" -Method GET
    Write-Host "✅ Financial Data Retrieval Successful (Status: $($response.StatusCode))" -ForegroundColor Green
    $data = $response.Content | ConvertFrom-Json
    Write-Host "   Vendor: $($data.vendor.storeName)" -ForegroundColor Green
    Write-Host "   Snapshots: $($data.snapshots.Count)" -ForegroundColor Green
    Write-Host "   Total Revenue: $($data.summary.totalRevenue)" -ForegroundColor Green
    Write-Host "   Total Profit: $($data.summary.totalProfit)" -ForegroundColor Green
} catch {
    Write-Host "❌ Financial Data Retrieval Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Generate New Financial Snapshot
Write-Host "`n3. Testing Financial Snapshot Generation" -ForegroundColor Yellow
try {
    $body = @{
        period = "monthly"
        notes = "Test snapshot for export functionality"
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

# Test 4: Export After Generation
Write-Host "`n4. Testing Export After New Snapshot" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendors/vendor-1/financials/export.csv/test" -Method GET
    Write-Host "✅ Export After Generation Successful (Status: $($response.StatusCode))" -ForegroundColor Green
    
    # Check if new snapshot is in export
    $csvLines = $response.Content -split "`n"
    $newSnapshotCount = ($csvLines | Select-String "snapshot-").Count
    Write-Host "   Total Snapshots in Export: $newSnapshotCount" -ForegroundColor Green
    
    # Save updated export
    $response.Content | Out-File -FilePath "updated-export-test.csv" -Encoding UTF8
} catch {
    Write-Host "❌ Export After Generation Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Error Handling
Write-Host "`n5. Testing Error Handling" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendors/non-existent/financials/export.csv/test" -Method GET
    Write-Host "❌ Unexpected success with non-existent vendor" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "✅ Correctly returned 404 for non-existent vendor" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Unexpected error: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Write-Host "`n🎉 Complete Financial Export Test Finished!" -ForegroundColor Cyan
Write-Host "Generated files:" -ForegroundColor Cyan
Write-Host "  - api-export-test.csv (initial export)" -ForegroundColor Gray
Write-Host "  - updated-export-test.csv (after generation)" -ForegroundColor Gray
Write-Host "  - test-financial-export.csv (from previous test)" -ForegroundColor Gray 