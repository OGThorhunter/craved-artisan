# Test Inventory API Endpoints
# This script tests the CRUD operations for ingredients

$baseUrl = "http://localhost:3001"
$ingredientsUrl = "$baseUrl/api/ingredients"

Write-Host "🧪 Testing Inventory API Endpoints" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Step 1: Get all ingredients
Write-Host "`n📋 Step 1: Getting all ingredients..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri $ingredientsUrl -Method GET -ContentType "application/json"
    if ($response.StatusCode -eq 200) {
        $ingredients = $response.Content | ConvertFrom-Json
        Write-Host "✅ Retrieved $($ingredients.ingredients.Count) ingredients" -ForegroundColor Green
        foreach ($ingredient in $ingredients.ingredients) {
            Write-Host "   - $($ingredient.name): $($ingredient.unit) (`$$($ingredient.costPerUnit))" -ForegroundColor Gray
        }
    } else {
        Write-Host "❌ Failed to get ingredients: $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error getting ingredients: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 2: Create a new ingredient
Write-Host "`n➕ Step 2: Creating a new ingredient..." -ForegroundColor Yellow
$newIngredientData = @{
    name = "Chocolate Chips"
    description = "Semi-sweet chocolate chips for baking"
    unit = "cups"
    costPerUnit = 5.99
    supplier = "Baking Supplies Co."
}

try {
    $response = Invoke-WebRequest -Uri $ingredientsUrl -Method POST -Body ($newIngredientData | ConvertTo-Json) -ContentType "application/json"
    if ($response.StatusCode -eq 201) {
        $result = $response.Content | ConvertFrom-Json
        $newIngredientId = $result.ingredient.id
        Write-Host "✅ Created ingredient: $($result.ingredient.name)" -ForegroundColor Green
        Write-Host "   ID: $newIngredientId" -ForegroundColor Gray
    } else {
        Write-Host "❌ Failed to create ingredient: $($response.StatusCode)" -ForegroundColor Red
        Write-Host "   Response: $($response.Content)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error creating ingredient: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 3: Get the specific ingredient
if ($newIngredientId) {
    Write-Host "`n👁️ Step 3: Getting specific ingredient..." -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest -Uri "$ingredientsUrl/$newIngredientId" -Method GET -ContentType "application/json"
        if ($response.StatusCode -eq 200) {
            $result = $response.Content | ConvertFrom-Json
            Write-Host "✅ Retrieved ingredient: $($result.ingredient.name)" -ForegroundColor Green
            Write-Host "   Cost: $$($result.ingredient.costPerUnit)" -ForegroundColor Gray
            Write-Host "   Supplier: $($result.ingredient.supplier)" -ForegroundColor Gray
        } else {
            Write-Host "❌ Failed to get ingredient: $($response.StatusCode)" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Error getting ingredient: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Step 4: Update the ingredient
if ($newIngredientId) {
    Write-Host "`n✏️ Step 4: Updating ingredient..." -ForegroundColor Yellow
    $updateData = @{
        costPerUnit = 6.49
        supplier = "Premium Baking Supplies"
    }
    
    try {
        $response = Invoke-WebRequest -Uri "$ingredientsUrl/$newIngredientId" -Method PUT -Body ($updateData | ConvertTo-Json) -ContentType "application/json"
        if ($response.StatusCode -eq 200) {
            $result = $response.Content | ConvertFrom-Json
            Write-Host "✅ Updated ingredient: $($result.ingredient.name)" -ForegroundColor Green
            Write-Host "   New cost: $$($result.ingredient.costPerUnit)" -ForegroundColor Gray
            Write-Host "   New supplier: $($result.ingredient.supplier)" -ForegroundColor Gray
        } else {
            Write-Host "❌ Failed to update ingredient: $($response.StatusCode)" -ForegroundColor Red
            Write-Host "   Response: $($response.Content)" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Error updating ingredient: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Step 5: Create another ingredient for testing
Write-Host "`n➕ Step 5: Creating another ingredient..." -ForegroundColor Yellow
$secondIngredientData = @{
    name = "Vanilla Bean"
    description = "Fresh vanilla beans for premium flavoring"
    unit = "pieces"
    costPerUnit = 8.50
    supplier = "Spice World"
}

try {
    $response = Invoke-WebRequest -Uri $ingredientsUrl -Method POST -Body ($secondIngredientData | ConvertTo-Json) -ContentType "application/json"
    if ($response.StatusCode -eq 201) {
        $result = $response.Content | ConvertFrom-Json
        $secondIngredientId = $result.ingredient.id
        Write-Host "✅ Created ingredient: $($result.ingredient.name)" -ForegroundColor Green
        Write-Host "   ID: $secondIngredientId" -ForegroundColor Gray
    } else {
        Write-Host "❌ Failed to create ingredient: $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error creating ingredient: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 6: Get all ingredients again to see the new ones
Write-Host "`n📋 Step 6: Getting all ingredients (updated list)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri $ingredientsUrl -Method GET -ContentType "application/json"
    if ($response.StatusCode -eq 200) {
        $ingredients = $response.Content | ConvertFrom-Json
        Write-Host "✅ Retrieved $($ingredients.ingredients.Count) ingredients" -ForegroundColor Green
        Write-Host "   Available: $($ingredients.ingredients | Where-Object { $_.isAvailable } | Measure-Object | Select-Object -ExpandProperty Count)" -ForegroundColor Gray
        Write-Host "   Low Stock: $($ingredients.ingredients | Where-Object { -not $_.isAvailable } | Measure-Object | Select-Object -ExpandProperty Count)" -ForegroundColor Gray
    } else {
        Write-Host "❌ Failed to get ingredients: $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error getting ingredients: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 7: Test validation - try to create ingredient with missing required fields
Write-Host "`n⚠️ Step 7: Testing validation (missing required fields)..." -ForegroundColor Yellow
$invalidData = @{
    name = ""
    unit = "cups"
    costPerUnit = -5
}

try {
    $response = Invoke-WebRequest -Uri $ingredientsUrl -Method POST -Body ($invalidData | ConvertTo-Json) -ContentType "application/json"
    if ($response.StatusCode -eq 400) {
        Write-Host "✅ Validation working correctly: $($response.StatusCode)" -ForegroundColor Green
        $errorResponse = $response.Content | ConvertFrom-Json
        Write-Host "   Error: $($errorResponse.message)" -ForegroundColor Gray
    } else {
        Write-Host "❌ Validation failed: Expected 400, got $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "✅ Validation working correctly (caught exception)" -ForegroundColor Green
}

# Step 8: Delete the test ingredients
if ($newIngredientId) {
    Write-Host "`n🗑️ Step 8: Deleting test ingredient..." -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest -Uri "$ingredientsUrl/$newIngredientId" -Method DELETE -ContentType "application/json"
        if ($response.StatusCode -eq 200) {
            $result = $response.Content | ConvertFrom-Json
            Write-Host "✅ Deleted ingredient: $($result.ingredient.name)" -ForegroundColor Green
        } else {
            Write-Host "❌ Failed to delete ingredient: $($response.StatusCode)" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Error deleting ingredient: $($_.Exception.Message)" -ForegroundColor Red
    }
}

if ($secondIngredientId) {
    Write-Host "`n🗑️ Step 9: Deleting second test ingredient..." -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest -Uri "$ingredientsUrl/$secondIngredientId" -Method DELETE -ContentType "application/json"
        if ($response.StatusCode -eq 200) {
            $result = $response.Content | ConvertFrom-Json
            Write-Host "✅ Deleted ingredient: $($result.ingredient.name)" -ForegroundColor Green
        } else {
            Write-Host "❌ Failed to delete ingredient: $($response.StatusCode)" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Error deleting ingredient: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Final verification
Write-Host "`n📋 Step 10: Final verification - getting all ingredients..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri $ingredientsUrl -Method GET -ContentType "application/json"
    if ($response.StatusCode -eq 200) {
        $ingredients = $response.Content | ConvertFrom-Json
        Write-Host "✅ Final count: $($ingredients.ingredients.Count) ingredients" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to get ingredients: $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error getting ingredients: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 Inventory API Testing Complete!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Start the frontend: npm run dev" -ForegroundColor Gray
Write-Host "2. Navigate to: http://localhost:5173/dashboard/vendor/inventory" -ForegroundColor Gray
Write-Host "3. Test the UI functionality" -ForegroundColor Gray 