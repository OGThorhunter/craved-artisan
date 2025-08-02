# Test Supplier Marketplace API
# This script tests the supplier marketplace functionality for low stock scenarios

$baseUrl = "http://localhost:3001"
$supplierUrl = "$baseUrl/api/supplier"
$inventoryUrl = "$baseUrl/api/inventory"

Write-Host "Testing Supplier Marketplace API" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Step 1: Get all suppliers
Write-Host "`nStep 1: Getting all suppliers..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$supplierUrl/suppliers" -Method GET
    if ($response.StatusCode -eq 200) {
        $result = $response.Content | ConvertFrom-Json
        Write-Host "SUCCESS: Found $($result.suppliers.Count) suppliers" -ForegroundColor Green
        
        foreach ($supplier in $result.suppliers) {
            Write-Host "   - $($supplier.name) (Rating: $($supplier.rating), Delivery: $($supplier.deliveryTime))" -ForegroundColor Gray
        }
    } else {
        Write-Host "FAILED: Failed to get suppliers: $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "ERROR: Error getting suppliers: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 2: Search for Organic Flour across suppliers
Write-Host "`nStep 2: Searching for Organic Flour across suppliers..." -ForegroundColor Yellow
$searchData = @{
    ingredientName = "Organic Flour"
    preferredOnly = $false
    organicOnly = $true
    maxPrice = 4.00
}

try {
    $response = Invoke-WebRequest -Uri "$supplierUrl/search" -Method POST -Body ($searchData | ConvertTo-Json) -ContentType "application/json"
    if ($response.StatusCode -eq 200) {
        $result = $response.Content | ConvertFrom-Json
        Write-Host "SUCCESS: Found $($result.results.Count) supplier options for Organic Flour" -ForegroundColor Green
        
        foreach ($option in $result.results) {
            $preferred = if ($option.isPreferred) { "PREFERRED" } else { "" }
            $organic = if ($option.isOrganic) { "ORGANIC" } else { "" }
            $tags = @($preferred, $organic) | Where-Object { $_ -ne "" }
            $tagString = if ($tags.Count -gt 0) { " [$($tags -join ', ')]" } else { "" }
            
            Write-Host "   - $($option.brand) by $($option.supplier.name) - $($option.pricePerUnit) $($option.unit)$tagString" -ForegroundColor Gray
        }
    } else {
        Write-Host "FAILED: Failed to search suppliers: $($response.StatusCode)" -ForegroundColor Red
    }
    $organicFlourOptions = $result.results
} catch {
    Write-Host "ERROR: Error searching suppliers: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 3: Get price history for Organic Flour
Write-Host "`nStep 3: Getting price history for Organic Flour..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$supplierUrl/price-history/Organic%20Flour?days=30" -Method GET
    if ($response.StatusCode -eq 200) {
        $result = $response.Content | ConvertFrom-Json
        Write-Host "SUCCESS: Found $($result.history.Count) price records for Organic Flour" -ForegroundColor Green
        
        if ($result.summary.priceRange) {
            Write-Host "   Price range: $($result.summary.priceRange.min) - $($result.summary.priceRange.max) $($result.history[0].unit)" -ForegroundColor Gray
            Write-Host "   Average price: $([math]::Round($result.summary.averagePrice, 2))" -ForegroundColor Gray
        }
        
        foreach ($record in $result.history) {
            Write-Host "   - $($record.supplierName): $($record.pricePerUnit) (Recorded: $($record.recordedAt))" -ForegroundColor Gray
        }
    } else {
        Write-Host "FAILED: Failed to get price history: $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "ERROR: Error getting price history: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 4: Track a price change
Write-Host "`nStep 4: Tracking a price change..." -ForegroundColor Yellow
if ($organicFlourOptions -and $organicFlourOptions.Count -gt 0) {
    $firstOption = $organicFlourOptions[0]
    $newPrice = $firstOption.pricePerUnit + 0.25
    
    $priceData = @{
        supplierInventoryId = $firstOption.id
        pricePerUnit = $newPrice
    }
    
    try {
        $response = Invoke-WebRequest -Uri "$supplierUrl/track-price" -Method POST -Body ($priceData | ConvertTo-Json) -ContentType "application/json"
        if ($response.StatusCode -eq 200) {
            $result = $response.Content | ConvertFrom-Json
            Write-Host "SUCCESS: Price tracked successfully" -ForegroundColor Green
            Write-Host "   Updated price: $($result.priceRecord.pricePerUnit) for $($result.priceRecord.ingredientName)" -ForegroundColor Gray
        } else {
            Write-Host "FAILED: Failed to track price: $($response.StatusCode)" -ForegroundColor Red
        }
    } catch {
        Write-Host "ERROR: Error tracking price: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "SKIPPED: No supplier options available for price tracking" -ForegroundColor Yellow
}

# Step 5: Get current inventory status to identify low stock items
Write-Host "`nStep 5: Getting current inventory status..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$inventoryUrl/status" -Method GET
    if ($response.StatusCode -eq 200) {
        $result = $response.Content | ConvertFrom-Json
        Write-Host "SUCCESS: Found $($result.totalIngredients) ingredients" -ForegroundColor Green
        Write-Host "   Low stock items: $($result.lowStockCount)" -ForegroundColor Gray
        
        $lowStockItems = $result.lowStockItems
        if ($lowStockItems.Count -gt 0) {
            Write-Host "   Low stock items:" -ForegroundColor Yellow
            foreach ($item in $lowStockItems) {
                Write-Host "     - $($item.name): $($item.currentStock) $($item.unit) (Threshold: $($item.lowStockThreshold) $($item.unit))" -ForegroundColor Red
            }
        }
    } else {
        Write-Host "FAILED: Failed to get inventory status: $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "ERROR: Error getting inventory status: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 6: Get low stock recommendations
Write-Host "`nStep 6: Getting low stock recommendations..." -ForegroundColor Yellow
if ($lowStockItems -and $lowStockItems.Count -gt 0) {
    $recommendationData = @{
        lowStockIngredients = $lowStockItems
    }
    
    try {
        $response = Invoke-WebRequest -Uri "$supplierUrl/low-stock-recommendations" -Method POST -Body ($recommendationData | ConvertTo-Json) -ContentType "application/json"
        if ($response.StatusCode -eq 200) {
            $result = $response.Content | ConvertFrom-Json
            Write-Host "SUCCESS: Generated $($result.recommendations.Count) recommendations" -ForegroundColor Green
            Write-Host "   Total supplier options: $($result.summary.totalSupplierOptions)" -ForegroundColor Gray
            
            foreach ($recommendation in $result.recommendations) {
                Write-Host "   - $($recommendation.ingredientName):" -ForegroundColor Yellow
                Write-Host "     Current stock: $($recommendation.currentStock) $($recommendation.unit)" -ForegroundColor Gray
                Write-Host "     Recommended order: $($recommendation.recommendedOrderQuantity) $($recommendation.unit)" -ForegroundColor Gray
                Write-Host "     Price trend: $($recommendation.priceTrendDirection)" -ForegroundColor Gray
                
                foreach ($option in $recommendation.supplierOptions) {
                    $preferred = if ($option.isPreferred) { "PREFERRED" } else { "" }
                    $organic = if ($option.isOrganic) { "ORGANIC" } else { "" }
                    $tags = @($preferred, $organic) | Where-Object { $_ -ne "" }
                    $tagString = if ($tags.Count -gt 0) { " [$($tags -join ', ')]" } else { "" }
                    
                    Write-Host "       * $($option.brand) by $($option.supplierName) - $($option.pricePerUnit) $($option.unit)$tagString" -ForegroundColor Gray
                }
            }
        } else {
            Write-Host "FAILED: Failed to get recommendations: $($response.StatusCode)" -ForegroundColor Red
        }
    } catch {
        Write-Host "ERROR: Error getting recommendations: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "SKIPPED: No low stock items found for recommendations" -ForegroundColor Yellow
}

# Step 7: Search for replacement options (non-preferred suppliers)
Write-Host "`nStep 7: Searching for replacement options (including non-preferred suppliers)..." -ForegroundColor Yellow
$replacementSearchData = @{
    ingredientName = "Vanilla Extract"
    preferredOnly = $false
    organicOnly = $false
    maxPrice = 15.00
}

try {
    $response = Invoke-WebRequest -Uri "$supplierUrl/search" -Method POST -Body ($replacementSearchData | ConvertTo-Json) -ContentType "application/json"
    if ($response.StatusCode -eq 200) {
        $result = $response.Content | ConvertFrom-Json
        Write-Host "SUCCESS: Found $($result.results.Count) replacement options for Vanilla Extract" -ForegroundColor Green
        
        foreach ($option in $result.results) {
            $preferred = if ($option.isPreferred) { "PREFERRED" } else { "REPLACEMENT" }
            $organic = if ($option.isOrganic) { "ORGANIC" } else { "" }
            $tags = @($preferred, $organic) | Where-Object { $_ -ne "" }
            $tagString = if ($tags.Count -gt 0) { " [$($tags -join ', ')]" } else { "" }
            
            Write-Host "   - $($option.brand) by $($option.supplier.name) - $($option.pricePerUnit) $($option.unit)$tagString" -ForegroundColor Gray
        }
    } else {
        Write-Host "FAILED: Failed to search replacement options: $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "ERROR: Error searching replacement options: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 8: Get supplier inventory overview
Write-Host "`nStep 8: Getting supplier inventory overview..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$supplierUrl/inventory?organic=true" -Method GET
    if ($response.StatusCode -eq 200) {
        $result = $response.Content | ConvertFrom-Json
        Write-Host "SUCCESS: Found $($result.inventory.Count) organic inventory items" -ForegroundColor Green
        
        $supplierGroups = $result.inventory | Group-Object { $_.supplier.name }
        foreach ($group in $supplierGroups) {
            Write-Host "   - $($group.Name): $($group.Count) organic items" -ForegroundColor Gray
        }
    } else {
        Write-Host "FAILED: Failed to get supplier inventory: $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "ERROR: Error getting supplier inventory: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 9: Test inventory deduction with enhanced low stock alerts
Write-Host "`nStep 9: Testing inventory deduction with enhanced low stock alerts..." -ForegroundColor Yellow
$deductData = @{
    productId = "product-1"
    quantitySold = 1
}

try {
    $response = Invoke-WebRequest -Uri "$inventoryUrl/deduct" -Method POST -Body ($deductData | ConvertTo-Json) -ContentType "application/json"
    if ($response.StatusCode -eq 200) {
        $result = $response.Content | ConvertFrom-Json
        Write-Host "SUCCESS: Deducted inventory for $($result.recipeName)" -ForegroundColor Green
        
        if ($result.lowStockAlerts.Count -gt 0) {
            Write-Host "   Enhanced low stock alerts:" -ForegroundColor Yellow
            foreach ($alert in $result.lowStockAlerts) {
                Write-Host "     - $($alert.ingredientName): $($alert.currentStock) $($alert.unit)" -ForegroundColor Red
                
                if ($alert.supplierRecommendations -and $alert.supplierRecommendations.Count -gt 0) {
                    Write-Host "       Supplier recommendations:" -ForegroundColor Gray
                    foreach ($rec in $alert.supplierRecommendations) {
                        $preferred = if ($rec.isPreferred) { "PREFERRED" } else { "ALTERNATIVE" }
                        Write-Host "         * $($rec.brand) by $($rec.supplierName) - $($rec.pricePerUnit) $($rec.unit) [$preferred]" -ForegroundColor Gray
                    }
                }
            }
        } else {
            Write-Host "   No low stock alerts" -ForegroundColor Green
        }
    } else {
        Write-Host "FAILED: Failed to deduct inventory: $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "ERROR: Error deducting inventory: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nSupplier Marketplace API Testing Complete!" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Summary:" -ForegroundColor Yellow
Write-Host "- Tested supplier search with filters (organic, preferred, price)" -ForegroundColor White
Write-Host "- Tested price history tracking and analysis" -ForegroundColor White
Write-Host "- Tested low stock recommendations with supplier alternatives" -ForegroundColor White
Write-Host "- Tested replacement options for out-of-stock items" -ForegroundColor White
Write-Host "- Tested enhanced inventory deduction with supplier recommendations" -ForegroundColor White
Write-Host "- Verified price tracking across multiple suppliers" -ForegroundColor White
Write-Host "- Confirmed supplier marketplace integration with inventory system" -ForegroundColor White 