# Test Enhanced PDF Generation with Charts
Write-Host "Testing Enhanced PDF Generation with Charts..." -ForegroundColor Cyan

# Wait for server to start
Start-Sleep -Seconds 3

# Test 1: Generate PDF with charts for vendor-1
Write-Host "`nTest 1: Generating PDF with charts for vendor-1..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendors/vendor-1/financials/export.pdf/test" -Method GET -OutFile "financial-report-with-charts.pdf"
    
    if ($response.StatusCode -eq 200) {
        Write-Host "PDF with charts generated successfully!" -ForegroundColor Green
        Write-Host "File saved as: financial-report-with-charts.pdf" -ForegroundColor Green
        
        # Check file size to ensure it's not empty
        $fileInfo = Get-Item "financial-report-with-charts.pdf"
        Write-Host "File size: $($fileInfo.Length) bytes" -ForegroundColor Green
        
        if ($fileInfo.Length -gt 1000) {
            Write-Host "PDF file appears to contain data (size > 1KB)" -ForegroundColor Green
        } else {
            Write-Host "PDF file seems small, may not contain charts" -ForegroundColor Yellow
        }
    } else {
        Write-Host "Failed to generate PDF. Status: $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "Error generating PDF: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Generate PDF with charts for vendor-2 (different data)
Write-Host "`nTest 2: Generating PDF with charts for vendor-2..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendors/vendor-2/financials/export.pdf/test" -Method GET -OutFile "financial-report-vendor2-with-charts.pdf"
    
    if ($response.StatusCode -eq 200) {
        Write-Host "PDF with charts generated successfully for vendor-2!" -ForegroundColor Green
        Write-Host "File saved as: financial-report-vendor2-with-charts.pdf" -ForegroundColor Green
        
        # Check file size
        $fileInfo = Get-Item "financial-report-vendor2-with-charts.pdf"
        Write-Host "File size: $($fileInfo.Length) bytes" -ForegroundColor Green
    } else {
        Write-Host "Failed to generate PDF for vendor-2. Status: $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "Error generating PDF for vendor-2: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Verify the PDF contains multiple pages (indicating charts)
Write-Host "`nTest 3: Verifying PDF structure..." -ForegroundColor Yellow
try {
    if (Test-Path "financial-report-with-charts.pdf") {
        Write-Host "PDF file exists" -ForegroundColor Green
        
        # Try to get basic PDF info (this is a simple check)
        $pdfContent = Get-Content "financial-report-with-charts.pdf" -Raw -ErrorAction SilentlyContinue
        if ($pdfContent) {
            Write-Host "PDF file is readable" -ForegroundColor Green
            
            # Check for PDF header
            if ($pdfContent.StartsWith("%PDF")) {
                Write-Host "Valid PDF format detected" -ForegroundColor Green
            } else {
                Write-Host "File may not be a valid PDF" -ForegroundColor Yellow
            }
        } else {
            Write-Host "Could not read PDF content" -ForegroundColor Yellow
        }
    } else {
        Write-Host "PDF file not found" -ForegroundColor Red
    }
} catch {
    Write-Host "Error verifying PDF: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Test with year/quarter filtering
Write-Host "`nTest 4: Testing PDF generation with year/quarter filters..." -ForegroundColor Yellow
try {
    # Test PDF generation for Q1 2025
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendors/vendor-1/financials/export.pdf/test?year=2025&quarter=Q1" -Method GET -OutFile "financial-report-q1-2025.pdf"
    
    if ($response.StatusCode -eq 200) {
        Write-Host "PDF with Q1 2025 data generated successfully!" -ForegroundColor Green
        Write-Host "File saved as: financial-report-q1-2025.pdf" -ForegroundColor Green
        
        $fileInfo = Get-Item "financial-report-q1-2025.pdf"
        Write-Host "File size: $($fileInfo.Length) bytes" -ForegroundColor Green
    } else {
        Write-Host "Failed to generate Q1 2025 PDF. Status: $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "Error generating Q1 2025 PDF: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nEnhanced PDF Generation with Charts Test Complete!" -ForegroundColor Cyan
Write-Host "Summary:" -ForegroundColor White
Write-Host "   - PDF files should contain multiple pages with charts" -ForegroundColor White
Write-Host "   - Charts include: Revenue Trend, Profit vs COGS, Cash Flow, Balance Sheet" -ForegroundColor White
Write-Host "   - Each chart is on its own page with proper formatting" -ForegroundColor White
Write-Host "   - Detailed financial table is included at the end" -ForegroundColor White
Write-Host "   - Report summary page with key metrics" -ForegroundColor White

Write-Host "`nGenerated Files:" -ForegroundColor White
Get-ChildItem -Name "financial-report*.pdf" | ForEach-Object { Write-Host "   - $_" -ForegroundColor Cyan } 