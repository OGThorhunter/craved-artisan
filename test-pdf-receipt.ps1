# Test PDF Receipt Generation
Write-Host "Testing PDF Receipt Generation" -ForegroundColor Cyan

# Test 1: Generate PDF receipt for existing order
Write-Host "`nTest 1: Generate PDF receipt for existing order" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/orders/order-1/receipt/test" -Method GET
    Write-Host "Success: PDF receipt generated" -ForegroundColor Green
    Write-Host "Content-Type: $($response.Headers['Content-Type'])" -ForegroundColor Gray
    Write-Host "Content-Disposition: $($response.Headers['Content-Disposition'])" -ForegroundColor Gray
    Write-Host "Content Length: $($response.Content.Length) bytes" -ForegroundColor Gray
    
    # Save the PDF to a file for inspection
    $pdfPath = "test-receipt.pdf"
    [System.IO.File]::WriteAllBytes($pdfPath, $response.Content)
    Write-Host "PDF saved to: $pdfPath" -ForegroundColor Green
} catch { 
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red 
}

# Test 2: Test with non-existent order
Write-Host "`nTest 2: Test with non-existent order" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/orders/non-existent-order/receipt/test" -Method GET
    Write-Host "Unexpected success for non-existent order" -ForegroundColor Red
} catch {
    Write-Host "Correctly handled non-existent order" -ForegroundColor Green
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Gray
}

Write-Host "`nPDF Receipt Testing Complete!" -ForegroundColor Cyan
Write-Host "Note: Check the generated PDF file for content verification" -ForegroundColor Yellow 