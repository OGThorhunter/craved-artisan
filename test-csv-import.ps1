# Test CSV import functionality for financial data
Write-Host "Testing CSV Import Functionality" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan

# Test CSV import endpoint
Write-Host "`nTesting POST /api/vendors/:id/financials/import" -ForegroundColor Yellow
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
    Write-Host "CSV Import Request Successful (Status: $($response.StatusCode))" -ForegroundColor Green
    
    $data = $response.Content | ConvertFrom-Json
    Write-Host "Import Result:" -ForegroundColor Green
    Write-Host "  Message: $($data.message)" -ForegroundColor Green
    Write-Host "  Imported Count: $($data.importedCount)" -ForegroundColor Green
    Write-Host "  Total Rows: $($data.totalRows)" -ForegroundColor Green
    Write-Host "  Mapping: $($data.mapping | ConvertTo-Json -Compress)" -ForegroundColor Green
    
} catch {
    Write-Host "CSV Import Request Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test with non-existent vendor
Write-Host "`nTesting CSV Import with Non-existent Vendor" -ForegroundColor Yellow
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
    
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendors/non-existent/financials/import/test" -Method POST -Body $body -Headers $headers
    Write-Host "Unexpected success with non-existent vendor" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "Correctly returned 404 for non-existent vendor" -ForegroundColor Green
    } else {
        Write-Host "Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test without file upload
Write-Host "`nTesting CSV Import without File Upload" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendors/vendor-1/financials/import/test" -Method POST
    Write-Host "Unexpected success without file upload" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "Correctly returned 400 for missing file upload" -ForegroundColor Green
    } else {
        Write-Host "Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Verify imported data by fetching financials
Write-Host "`nVerifying Imported Data" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendors/vendor-1/financials/test?range=monthly" -Method GET
    Write-Host "Data Fetch Successful (Status: $($response.StatusCode))" -ForegroundColor Green
    
    $data = $response.Content | ConvertFrom-Json
    $importedSnapshots = $data.snapshots | Where-Object { $_.id -like "imported-*" }
    Write-Host "Found $($importedSnapshots.Count) imported snapshots" -ForegroundColor Green
    
    if ($importedSnapshots.Count -gt 0) {
        Write-Host "Sample imported snapshot:" -ForegroundColor Green
        Write-Host "  ID: $($importedSnapshots[0].id)" -ForegroundColor Gray
        Write-Host "  Revenue: $($importedSnapshots[0].revenue)" -ForegroundColor Gray
        Write-Host "  Net Profit: $($importedSnapshots[0].netProfit)" -ForegroundColor Gray
        Write-Host "  Notes: $($importedSnapshots[0].notes)" -ForegroundColor Gray
    }
    
} catch {
    Write-Host "Data Verification Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nCSV Import Test Complete!" -ForegroundColor Cyan 