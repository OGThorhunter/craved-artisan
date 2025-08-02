# Test AI Price Suggestion Endpoint
Write-Host "Testing AI Price Suggestion Endpoint" -ForegroundColor Green

# First, let's get a list of products to test with
Write-Host "`n1. Getting vendor products..." -ForegroundColor Yellow
$productsResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/vendor/products" -Method GET -Headers @{
    "Content-Type" = "application/json"
    "Cookie" = "sessionId=test-session-vendor"
} -UseBasicParsing

if ($productsResponse.StatusCode -eq 200) {
    $products = $productsResponse.Content | ConvertFrom-Json
    Write-Host "Found $($products.count) products" -ForegroundColor Green
    
    if ($products.count -gt 0) {
        $firstProduct = $products.products[0]
        Write-Host "Testing with product: $($firstProduct.name) (ID: $($firstProduct.id))" -ForegroundColor Cyan
        
        # Test AI suggestion endpoint
        Write-Host "`n2. Testing AI price suggestion..." -ForegroundColor Yellow
        $aiSuggestionResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/vendor/products/$($firstProduct.id)/ai-suggestion" -Method GET -Headers @{
            "Content-Type" = "application/json"
            "Cookie" = "sessionId=test-session-vendor"
        } -UseBasicParsing
        
        if ($aiSuggestionResponse.StatusCode -eq 200) {
            $aiSuggestion = $aiSuggestionResponse.Content | ConvertFrom-Json
            Write-Host "AI Suggestion generated successfully!" -ForegroundColor Green
            Write-Host "Product: $($aiSuggestion.product.name)" -ForegroundColor White
            Write-Host "Current Price: `$$($aiSuggestion.product.currentPrice)" -ForegroundColor White
            Write-Host "Target Margin: $($aiSuggestion.product.targetMargin)%" -ForegroundColor White
            Write-Host "Unit Cost: `$$($aiSuggestion.costAnalysis.unitCost)" -ForegroundColor White
            Write-Host "Suggested Price: `$$($aiSuggestion.aiSuggestion.suggestedPrice)" -ForegroundColor Cyan
            Write-Host "Price Difference: `$$($aiSuggestion.aiSuggestion.priceDifference)" -ForegroundColor Cyan
            Write-Host "Percentage Change: $($aiSuggestion.aiSuggestion.percentageChange)%" -ForegroundColor Cyan
            Write-Host "Volatility Detected: $($aiSuggestion.aiSuggestion.volatilityDetected)" -ForegroundColor Yellow
            Write-Host "Confidence: $($aiSuggestion.aiSuggestion.confidence)" -ForegroundColor Yellow
            Write-Host "Note: $($aiSuggestion.aiSuggestion.note)" -ForegroundColor Gray
        } else {
            Write-Host "Failed to get AI suggestion. Status: $($aiSuggestionResponse.StatusCode)" -ForegroundColor Red
            Write-Host "Response: $($aiSuggestionResponse.Content)" -ForegroundColor Red
        }
    } else {
        Write-Host "No products found to test with" -ForegroundColor Yellow
    }
} else {
    Write-Host "Failed to get products. Status: $($productsResponse.StatusCode)" -ForegroundColor Red
    Write-Host "Response: $($productsResponse.Content)" -ForegroundColor Red
}

Write-Host "`nTest completed!" -ForegroundColor Green 