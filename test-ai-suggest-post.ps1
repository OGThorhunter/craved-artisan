# Test POST AI Price Suggestion Endpoint
Write-Host "Testing POST AI Price Suggestion Endpoint" -ForegroundColor Green

# Test with a known mock product ID
$productId = "mock-product-1"

Write-Host "`nTesting POST AI price suggestion for product: $productId" -ForegroundColor Yellow

# Test POST AI suggestion endpoint
$postResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/vendor/products/$productId/ai-suggest" -Method POST -Headers @{
    "Content-Type" = "application/json"
    "Cookie" = "sessionId=test-session-vendor"
} -UseBasicParsing

if ($postResponse.StatusCode -eq 200) {
    $result = $postResponse.Content | ConvertFrom-Json
    Write-Host "POST AI Suggestion applied successfully!" -ForegroundColor Green
    Write-Host "Message: $($result.message)" -ForegroundColor White
    Write-Host "Product: $($result.product.name)" -ForegroundColor White
    Write-Host "Current Price: `$$($result.product.currentPrice)" -ForegroundColor White
    Write-Host "Target Margin: $($result.product.targetMargin)%" -ForegroundColor White
    Write-Host "On Watchlist: $($result.product.onWatchlist)" -ForegroundColor Cyan
    Write-Host "Unit Cost: `$$($result.costAnalysis.unitCost)" -ForegroundColor White
    Write-Host "Suggested Price: `$$($result.aiSuggestion.suggestedPrice)" -ForegroundColor Cyan
    Write-Host "Price Difference: `$$($result.aiSuggestion.priceDifference)" -ForegroundColor Cyan
    Write-Host "Percentage Change: $($result.aiSuggestion.percentageChange)%" -ForegroundColor Cyan
    Write-Host "Volatility Detected: $($result.aiSuggestion.volatilityDetected)" -ForegroundColor Yellow
    Write-Host "Confidence: $($result.aiSuggestion.confidence)" -ForegroundColor Yellow
    Write-Host "Note: $($result.aiSuggestion.note)" -ForegroundColor Gray
    Write-Host "Watchlist Update:" -ForegroundColor Magenta
    Write-Host "  Added to Watchlist: $($result.watchlistUpdate.addedToWatchlist)" -ForegroundColor Magenta
    Write-Host "  Reason: $($result.watchlistUpdate.reason)" -ForegroundColor Magenta
} else {
    Write-Host "Failed to apply AI suggestion. Status: $($postResponse.StatusCode)" -ForegroundColor Red
    Write-Host "Response: $($postResponse.Content)" -ForegroundColor Red
}

Write-Host "`nTest completed!" -ForegroundColor Green 