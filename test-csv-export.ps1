# Test CSV export functionality for financial data
Write-Host "Testing CSV Export Functionality" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan

# Test CSV export endpoint
Write-Host "`nTesting GET /api/vendors/:id/financials/export.csv" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendors/vendor-1/financials/export.csv/test" -Method GET
    Write-Host "CSV Export Request Successful (Status: $($response.StatusCode))" -ForegroundColor Green
    Write-Host "Content-Type: $($response.Headers.'Content-Type')" -ForegroundColor Green
    Write-Host "Content-Disposition: $($response.Headers.'Content-Disposition')" -ForegroundColor Green
    
    # Save the CSV content to a file
    $csvContent = $response.Content
    $csvContent | Out-File -FilePath "test-financial-export.csv" -Encoding UTF8
    Write-Host "CSV file saved as: test-financial-export.csv" -ForegroundColor Green
    
    # Display first few lines of CSV
    Write-Host "`nFirst few lines of CSV content:" -ForegroundColor Yellow
    $csvLines = $csvContent -split "`n"
    $csvLines[0..5] | ForEach-Object { Write-Host $_ -ForegroundColor Gray }
    
} catch {
    Write-Host "CSV Export Request Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test with non-existent vendor
Write-Host "`nTesting CSV Export with Non-existent Vendor" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendors/non-existent/financials/export.csv/test" -Method GET
    Write-Host "Unexpected success with non-existent vendor" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "Correctly returned 404 for non-existent vendor" -ForegroundColor Green
    } else {
        Write-Host "Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`nCSV Export Test Complete!" -ForegroundColor Cyan 