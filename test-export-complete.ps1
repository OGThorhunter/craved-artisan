# Comprehensive test for financial export functionality (CSV + PDF)
Write-Host "Testing Complete Financial Export Functionality" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan

# Test 1: CSV Export Endpoint
Write-Host "`n1. Testing CSV Export Endpoint" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendors/vendor-1/financials/export.csv/test" -Method GET
    Write-Host "✅ CSV Export Successful (Status: $($response.StatusCode))" -ForegroundColor Green
    Write-Host "   Content-Type: $($response.Headers.'Content-Type')" -ForegroundColor Green
    Write-Host "   Content-Disposition: $($response.Headers.'Content-Disposition')" -ForegroundColor Green
    Write-Host "   File Size: $($response.Content.Length) bytes" -ForegroundColor Green
    
    # Save CSV file
    $response.Content | Out-File -FilePath "test-csv-export.csv" -Encoding UTF8
    Write-Host "   CSV file saved as: test-csv-export.csv" -ForegroundColor Green
} catch {
    Write-Host "❌ CSV Export Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: PDF Export Endpoint
Write-Host "`n2. Testing PDF Export Endpoint" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendors/vendor-1/financials/export.pdf/test" -Method GET
    Write-Host "✅ PDF Export Successful (Status: $($response.StatusCode))" -ForegroundColor Green
    Write-Host "   Content-Type: $($response.Headers.'Content-Type')" -ForegroundColor Green
    Write-Host "   Content-Disposition: $($response.Headers.'Content-Disposition')" -ForegroundColor Green
    Write-Host "   File Size: $($response.Content.Length) bytes" -ForegroundColor Green
    
    # Save PDF file
    [System.IO.File]::WriteAllBytes("test-pdf-export.pdf", $response.Content)
    Write-Host "   PDF file saved as: test-pdf-export.pdf" -ForegroundColor Green
    
    # Verify PDF header (PDF files start with %PDF)
    $pdfHeader = [System.Text.Encoding]::ASCII.GetString($response.Content[0..3])
    if ($pdfHeader -eq "%PDF") {
        Write-Host "   PDF header verified: $pdfHeader" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️ Unexpected PDF header: $pdfHeader" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ PDF Export Failed: $($_.Exception.Message)" -ForegroundColor Red
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

# Test 4: Export After Generation (CSV)
Write-Host "`n4. Testing CSV Export After New Snapshot" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendors/vendor-1/financials/export.csv/test" -Method GET
    Write-Host "✅ CSV Export After Generation Successful (Status: $($response.StatusCode))" -ForegroundColor Green
    
    # Check if new snapshot is in export
    $csvLines = $response.Content -split "`n"
    $newSnapshotCount = ($csvLines | Select-String "snapshot-").Count
    Write-Host "   Total Snapshots in CSV: $newSnapshotCount" -ForegroundColor Green
    
    # Save updated CSV
    $response.Content | Out-File -FilePath "updated-csv-export.csv" -Encoding UTF8
} catch {
    Write-Host "❌ CSV Export After Generation Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Export After Generation (PDF)
Write-Host "`n5. Testing PDF Export After New Snapshot" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendors/vendor-1/financials/export.pdf/test" -Method GET
    Write-Host "✅ PDF Export After Generation Successful (Status: $($response.StatusCode))" -ForegroundColor Green
    Write-Host "   File Size: $($response.Content.Length) bytes" -ForegroundColor Green
    
    # Save updated PDF
    [System.IO.File]::WriteAllBytes("updated-pdf-export.pdf", $response.Content)
} catch {
    Write-Host "❌ PDF Export After Generation Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 6: Error Handling - Non-existent Vendor
Write-Host "`n6. Testing Error Handling (Non-existent Vendor)" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendors/non-existent/financials/export.csv/test" -Method GET
    Write-Host "❌ Unexpected success with non-existent vendor (CSV)" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "✅ Correctly returned 404 for non-existent vendor (CSV)" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Unexpected error (CSV): $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendors/non-existent/financials/export.pdf/test" -Method GET
    Write-Host "❌ Unexpected success with non-existent vendor (PDF)" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "✅ Correctly returned 404 for non-existent vendor (PDF)" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Unexpected error (PDF): $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Write-Host "`n🎉 Complete Financial Export Test Finished!" -ForegroundColor Cyan
Write-Host "Generated files:" -ForegroundColor Cyan
Write-Host "  - test-csv-export.csv (initial CSV)" -ForegroundColor Gray
Write-Host "  - test-pdf-export.pdf (initial PDF)" -ForegroundColor Gray
Write-Host "  - updated-csv-export.csv (after generation)" -ForegroundColor Gray
Write-Host "  - updated-pdf-export.pdf (after generation)" -ForegroundColor Gray 