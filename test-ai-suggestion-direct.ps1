# Test AI Price Suggestion Endpoint Directly
Write-Host "Testing AI Price Suggestion Endpoint Directly" -ForegroundColor Green

# Test with a known mock product ID
$productId = "mock-product-1"

Write-Host "`nTesting AI price suggestion for product: $productId" -ForegroundColor Yellow

# Test AI suggestion endpoint directly
$aiSuggestionResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/vendor/products/$productId/ai-suggestion" -Method GET -Headers @{
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

Write-Host "`nTest completed!" -ForegroundColor Green 