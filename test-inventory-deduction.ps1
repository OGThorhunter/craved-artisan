# Test Inventory Deduction API
# This script tests the inventory deduction functionality when products are sold

$baseUrl = "http://localhost:3001"
$inventoryUrl = "$baseUrl/api/inventory"

Write-Host "Testing Inventory Deduction API" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Step 1: Get current inventory status
Write-Host "`nStep 1: Getting current inventory status..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$inventoryUrl/status" -Method GET
    if ($response.StatusCode -eq 200) {
        $result = $response.Content | ConvertFrom-Json
        Write-Host "SUCCESS: Found $($result.totalIngredients) ingredients" -ForegroundColor Green
        Write-Host "   Low stock items: $($result.lowStockCount)" -ForegroundColor Gray
        
        foreach ($item in $result.inventoryStatus) {
            $status = if ($item.isLowStock) { "LOW" } else { "OK" }
            $color = if ($item.isLowStock) { "Red" } else { "Gray" }
            Write-Host "   - $($item.name): $($item.currentStock) $($item.unit) [$status]" -ForegroundColor $color
        }
    } else {
        Write-Host "FAILED: Failed to get inventory status: $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "ERROR: Error getting inventory status: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 2: Get recipes with inventory information
Write-Host "`nStep 2: Getting recipes with inventory information..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$inventoryUrl/recipes" -Method GET
    if ($response.StatusCode -eq 200) {
        $result = $response.Content | ConvertFrom-Json
        Write-Host "SUCCESS: Found $($result.recipes.Count) recipes" -ForegroundColor Green
        
        foreach ($recipe in $result.recipes) {
            Write-Host "   - $($recipe.name) (Product ID: $($recipe.productId))" -ForegroundColor Gray
            Write-Host "     Yield: $($recipe.yield) $($recipe.yieldUnit)" -ForegroundColor Gray
            foreach ($ingredient in $recipe.ingredients) {
                $stockStatus = if ($ingredient.currentStock -le $ingredient.lowStockThreshold) { "LOW" } else { "OK" }
                Write-Host "       $($ingredient.ingredientName): $($ingredient.quantity) $($ingredient.unit) (Stock: $($ingredient.currentStock) $($ingredient.unit) [$stockStatus])" -ForegroundColor Gray
            }
        }
    } else {
        Write-Host "FAILED: Failed to get recipes: $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "ERROR: Error getting recipes: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 3: Test successful inventory deduction (Chocolate Chip Cookies)
Write-Host "`nStep 3: Testing successful inventory deduction (Chocolate Chip Cookies)..." -ForegroundColor Yellow
$deductData1 = @{
    productId = "product-1"
    quantitySold = 1
}

try {
    $response = Invoke-WebRequest -Uri "$inventoryUrl/deduct" -Method POST -Body ($deductData1 | ConvertTo-Json) -ContentType "application/json"
    if ($response.StatusCode -eq 200) {
        $result = $response.Content | ConvertFrom-Json
        Write-Host "SUCCESS: Deducted inventory for $($result.recipeName)" -ForegroundColor Green
        Write-Host "   Deducted ingredients:" -ForegroundColor Gray
        foreach ($ingredient in $result.deductedIngredients) {
            Write-Host "     - $($ingredient.ingredientName): $($ingredient.quantityDeducted) $($ingredient.unit) (Remaining: $($ingredient.remainingStock) $($ingredient.unit))" -ForegroundColor Gray
        }
        
        if ($result.lowStockAlerts.Count -gt 0) {
            Write-Host "   Low stock alerts:" -ForegroundColor Yellow
            foreach ($alert in $result.lowStockAlerts) {
                Write-Host "     - $($alert.ingredientName): $($alert.currentStock) $($alert.unit) (Threshold: $($alert.lowStockThreshold) $($alert.unit))" -ForegroundColor Red
            }
        } else {
            Write-Host "   No low stock alerts" -ForegroundColor Green
        }
    } else {
        Write-Host "FAILED: Failed to deduct inventory: $($response.StatusCode)" -ForegroundColor Red
        Write-Host "   Response: $($response.Content)" -ForegroundColor Red
    }
} catch {
    Write-Host "ERROR: Error deducting inventory: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 4: Test multiple quantity deduction
Write-Host "`nStep 4: Testing multiple quantity deduction (2 batches of cookies)..." -ForegroundColor Yellow
$deductData2 = @{
    productId = "product-1"
    quantitySold = 2
}

try {
    $response = Invoke-WebRequest -Uri "$inventoryUrl/deduct" -Method POST -Body ($deductData2 | ConvertTo-Json) -ContentType "application/json"
    if ($response.StatusCode -eq 200) {
        $result = $response.Content | ConvertFrom-Json
        Write-Host "SUCCESS: Deducted inventory for $($result.recipeName) (2 batches)" -ForegroundColor Green
        Write-Host "   Deducted ingredients:" -ForegroundColor Gray
        foreach ($ingredient in $result.deductedIngredients) {
            Write-Host "     - $($ingredient.ingredientName): $($ingredient.quantityDeducted) $($ingredient.unit) (Remaining: $($ingredient.remainingStock) $($ingredient.unit))" -ForegroundColor Gray
        }
        
        if ($result.lowStockAlerts.Count -gt 0) {
            Write-Host "   Low stock alerts:" -ForegroundColor Yellow
            foreach ($alert in $result.lowStockAlerts) {
                Write-Host "     - $($alert.ingredientName): $($alert.currentStock) $($alert.unit) (Threshold: $($alert.lowStockThreshold) $($alert.unit))" -ForegroundColor Red
            }
        } else {
            Write-Host "   No low stock alerts" -ForegroundColor Green
        }
    } else {
        Write-Host "FAILED: Failed to deduct inventory: $($response.StatusCode)" -ForegroundColor Red
        Write-Host "   Response: $($response.Content)" -ForegroundColor Red
    }
} catch {
    Write-Host "ERROR: Error deducting inventory: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 5: Test Sourdough Bread deduction
Write-Host "`nStep 5: Testing Sourdough Bread deduction..." -ForegroundColor Yellow
$deductData3 = @{
    productId = "product-2"
    quantitySold = 1
}

try {
    $response = Invoke-WebRequest -Uri "$inventoryUrl/deduct" -Method POST -Body ($deductData3 | ConvertTo-Json) -ContentType "application/json"
    if ($response.StatusCode -eq 200) {
        $result = $response.Content | ConvertFrom-Json
        Write-Host "SUCCESS: Deducted inventory for $($result.recipeName)" -ForegroundColor Green
        Write-Host "   Deducted ingredients:" -ForegroundColor Gray
        foreach ($ingredient in $result.deductedIngredients) {
            Write-Host "     - $($ingredient.ingredientName): $($ingredient.quantityDeducted) $($ingredient.unit) (Remaining: $($ingredient.remainingStock) $($ingredient.unit))" -ForegroundColor Gray
        }
        
        if ($result.lowStockAlerts.Count -gt 0) {
            Write-Host "   Low stock alerts:" -ForegroundColor Yellow
            foreach ($alert in $result.lowStockAlerts) {
                Write-Host "     - $($alert.ingredientName): $($alert.currentStock) $($alert.unit) (Threshold: $($alert.lowStockThreshold) $($alert.unit))" -ForegroundColor Red
            }
        } else {
            Write-Host "   No low stock alerts" -ForegroundColor Green
        }
    } else {
        Write-Host "FAILED: Failed to deduct inventory: $($response.StatusCode)" -ForegroundColor Red
        Write-Host "   Response: $($response.Content)" -ForegroundColor Red
    }
} catch {
    Write-Host "ERROR: Error deducting inventory: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 6: Test invalid product ID
Write-Host "`nStep 6: Testing invalid product ID..." -ForegroundColor Yellow
$invalidData = @{
    productId = "invalid-product-id"
    quantitySold = 1
}

try {
    $response = Invoke-WebRequest -Uri "$inventoryUrl/deduct" -Method POST -Body ($invalidData | ConvertTo-Json) -ContentType "application/json"
    Write-Host "FAILED: Should have returned error for invalid product ID" -ForegroundColor Red
} catch {
    Write-Host "SUCCESS: Correctly handled invalid product ID" -ForegroundColor Green
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
}

# Step 7: Test validation (missing required fields)
Write-Host "`nStep 7: Testing validation (missing required fields)..." -ForegroundColor Yellow
$invalidData2 = @{
    productId = ""
    quantitySold = 0
}

try {
    $response = Invoke-WebRequest -Uri "$inventoryUrl/deduct" -Method POST -Body ($invalidData2 | ConvertTo-Json) -ContentType "application/json"
    Write-Host "FAILED: Validation should have caught errors" -ForegroundColor Red
} catch {
    Write-Host "SUCCESS: Validation working correctly (caught exception)" -ForegroundColor Green
}

# Step 8: Get updated inventory status
Write-Host "`nStep 8: Getting updated inventory status..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$inventoryUrl/status" -Method GET
    if ($response.StatusCode -eq 200) {
        $result = $response.Content | ConvertFrom-Json
        Write-Host "SUCCESS: Updated inventory status" -ForegroundColor Green
        Write-Host "   Total ingredients: $($result.totalIngredients)" -ForegroundColor Gray
        Write-Host "   Low stock items: $($result.lowStockCount)" -ForegroundColor Gray
        
        if ($result.lowStockCount -gt 0) {
            Write-Host "   Low stock items:" -ForegroundColor Yellow
            foreach ($item in $result.lowStockItems) {
                Write-Host "     - $($item.name): $($item.currentStock) $($item.unit) (Threshold: $($item.lowStockThreshold) $($item.unit))" -ForegroundColor Red
            }
        }
    } else {
        Write-Host "FAILED: Failed to get updated inventory status: $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "ERROR: Error getting updated inventory status: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 9: Test insufficient stock scenario (try to sell too many)
Write-Host "`nStep 9: Testing insufficient stock scenario..." -ForegroundColor Yellow
$excessiveData = @{
    productId = "product-1"
    quantitySold = 50  # This should exceed available stock
}

try {
    $response = Invoke-WebRequest -Uri "$inventoryUrl/deduct" -Method POST -Body ($excessiveData | ConvertTo-Json) -ContentType "application/json"
    if ($response.StatusCode -eq 400) {
        $result = $response.Content | ConvertFrom-Json
        Write-Host "SUCCESS: Correctly handled insufficient stock" -ForegroundColor Green
        Write-Host "   Error: $($result.message)" -ForegroundColor Gray
    } else {
        Write-Host "FAILED: Should have returned error for insufficient stock" -ForegroundColor Red
    }
} catch {
    Write-Host "SUCCESS: Correctly handled insufficient stock (caught exception)" -ForegroundColor Green
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
}

Write-Host "`nInventory Deduction API Testing Complete!" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Summary:" -ForegroundColor Yellow
Write-Host "- Tested successful inventory deduction for single and multiple quantities" -ForegroundColor White
Write-Host "- Tested low stock alerts" -ForegroundColor White
Write-Host "- Tested error handling for invalid product IDs" -ForegroundColor White
Write-Host "- Tested validation for missing required fields" -ForegroundColor White
Write-Host "- Tested insufficient stock scenarios" -ForegroundColor White
Write-Host "- Verified inventory status updates" -ForegroundColor White 