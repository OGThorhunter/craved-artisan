# Test Recipe API Endpoints
# This script tests the recipe creation and management functionality

$baseUrl = "http://localhost:3001"
$recipesUrl = "$baseUrl/api/recipes"
$ingredientsUrl = "$baseUrl/api/ingredients"

Write-Host "Testing Recipe API Endpoints" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Step 1: Get all recipes
Write-Host "`nStep 1: Getting all recipes..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri $recipesUrl -Method GET
    if ($response.StatusCode -eq 200) {
        $result = $response.Content | ConvertFrom-Json
        Write-Host "SUCCESS: Found $($result.recipes.Count) recipes" -ForegroundColor Green
        foreach ($recipe in $result.recipes) {
            Write-Host "   - $($recipe.name) ($($recipe.yield) $($recipe.yieldUnit))" -ForegroundColor Gray
        }
    } else {
        Write-Host "FAILED: Failed to get recipes: $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "ERROR: Error getting recipes: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 2: Get available ingredients for recipe creation
Write-Host "`nStep 2: Getting available ingredients..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri $ingredientsUrl -Method GET
    if ($response.StatusCode -eq 200) {
        $result = $response.Content | ConvertFrom-Json
        $ingredients = $result.ingredients
        Write-Host "SUCCESS: Found $($ingredients.Count) ingredients" -ForegroundColor Green
    } else {
        Write-Host "FAILED: Failed to get ingredients: $($response.StatusCode)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "ERROR: Error getting ingredients: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 3: Create a new recipe
Write-Host "`nStep 3: Creating a new recipe..." -ForegroundColor Yellow
$newRecipeData = @{
    name = "Test Chocolate Cake"
    description = "A delicious chocolate cake recipe for testing"
    instructions = "1. Preheat oven to 350°F`n2. Mix dry ingredients`n3. Add wet ingredients`n4. Bake for 30 minutes"
    yield = 1
    yieldUnit = "cake"
    prepTime = 20
    cookTime = 30
    difficulty = "Medium"
    ingredients = @(
        @{
            ingredientId = $ingredients[0].id
            quantity = 2.5
            unit = "cups"
            notes = "All-purpose flour"
        },
        @{
            ingredientId = $ingredients[1].id
            quantity = 2
            unit = "pieces"
            notes = "Room temperature"
        }
    )
}

try {
    $response = Invoke-WebRequest -Uri $recipesUrl -Method POST -Body ($newRecipeData | ConvertTo-Json -Depth 3) -ContentType "application/json"
    if ($response.StatusCode -eq 201) {
        $result = $response.Content | ConvertFrom-Json
        $newRecipeId = $result.recipe.id
        Write-Host "SUCCESS: Created recipe: $($result.recipe.name)" -ForegroundColor Green
        Write-Host "   ID: $newRecipeId" -ForegroundColor Gray
        Write-Host "   Yield: $($result.recipe.yield) $($result.recipe.yieldUnit)" -ForegroundColor Gray
        Write-Host "   Ingredients: $($result.recipe.ingredients.Count)" -ForegroundColor Gray
    } else {
        Write-Host "FAILED: Failed to create recipe: $($response.StatusCode)" -ForegroundColor Red
        Write-Host "   Response: $($response.Content)" -ForegroundColor Red
    }
} catch {
    Write-Host "ERROR: Error creating recipe: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 4: Get the specific recipe
Write-Host "`nStep 4: Getting the specific recipe..." -ForegroundColor Yellow
if ($newRecipeId) {
    try {
        $response = Invoke-WebRequest -Uri "$recipesUrl/$newRecipeId" -Method GET
        if ($response.StatusCode -eq 200) {
            $result = $response.Content | ConvertFrom-Json
            Write-Host "SUCCESS: Retrieved recipe: $($result.recipe.name)" -ForegroundColor Green
            Write-Host "   Instructions: $($result.recipe.instructions.Length) characters" -ForegroundColor Gray
            Write-Host "   Difficulty: $($result.recipe.difficulty)" -ForegroundColor Gray
        } else {
            Write-Host "FAILED: Failed to get recipe: $($response.StatusCode)" -ForegroundColor Red
        }
    } catch {
        Write-Host "ERROR: Error getting recipe: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Step 5: Get recipe ingredients
Write-Host "`nStep 5: Getting recipe ingredients..." -ForegroundColor Yellow
if ($newRecipeId) {
    try {
        $response = Invoke-WebRequest -Uri "$recipesUrl/$newRecipeId/ingredients" -Method GET
        if ($response.StatusCode -eq 200) {
            $result = $response.Content | ConvertFrom-Json
            Write-Host "SUCCESS: Found $($result.ingredients.Count) ingredients for recipe" -ForegroundColor Green
            foreach ($ingredient in $result.ingredients) {
                Write-Host "   - $($ingredient.quantity) $($ingredient.unit) (ID: $($ingredient.ingredientId))" -ForegroundColor Gray
            }
        } else {
            Write-Host "FAILED: Failed to get recipe ingredients: $($response.StatusCode)" -ForegroundColor Red
        }
    } catch {
        Write-Host "ERROR: Error getting recipe ingredients: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Step 6: Update the recipe
Write-Host "`nStep 6: Updating the recipe..." -ForegroundColor Yellow
if ($newRecipeId) {
    $updateData = @{
        name = "Updated Chocolate Cake"
        description = "An improved chocolate cake recipe"
        difficulty = "Easy"
    }
    
    try {
        $response = Invoke-WebRequest -Uri "$recipesUrl/$newRecipeId" -Method PUT -Body ($updateData | ConvertTo-Json) -ContentType "application/json"
        if ($response.StatusCode -eq 200) {
            $result = $response.Content | ConvertFrom-Json
            Write-Host "SUCCESS: Updated recipe: $($result.recipe.name)" -ForegroundColor Green
            Write-Host "   New difficulty: $($result.recipe.difficulty)" -ForegroundColor Gray
        } else {
            Write-Host "FAILED: Failed to update recipe: $($response.StatusCode)" -ForegroundColor Red
        }
    } catch {
        Write-Host "ERROR: Error updating recipe: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Step 7: Test validation (missing required fields)
Write-Host "`nStep 7: Testing validation (missing required fields)..." -ForegroundColor Yellow
$invalidRecipeData = @{
    name = ""
    yield = 0
    ingredients = @()
}

try {
    $response = Invoke-WebRequest -Uri $recipesUrl -Method POST -Body ($invalidRecipeData | ConvertTo-Json) -ContentType "application/json"
    Write-Host "FAILED: Validation should have caught errors" -ForegroundColor Red
} catch {
    Write-Host "SUCCESS: Validation working correctly (caught exception)" -ForegroundColor Green
}

# Step 8: Delete the recipe
Write-Host "`nStep 8: Deleting the recipe..." -ForegroundColor Yellow
if ($newRecipeId) {
    try {
        $response = Invoke-WebRequest -Uri "$recipesUrl/$newRecipeId" -Method DELETE
        if ($response.StatusCode -eq 200) {
            $result = $response.Content | ConvertFrom-Json
            Write-Host "SUCCESS: Deleted recipe: $($result.recipe.name)" -ForegroundColor Green
        } else {
            Write-Host "FAILED: Failed to delete recipe: $($response.StatusCode)" -ForegroundColor Red
        }
    } catch {
        Write-Host "ERROR: Error deleting recipe: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Step 9: Final verification - get all recipes
Write-Host "`nStep 9: Final verification - getting all recipes..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri $recipesUrl -Method GET
    if ($response.StatusCode -eq 200) {
        $result = $response.Content | ConvertFrom-Json
        Write-Host "SUCCESS: Found $($result.recipes.Count) recipes (after cleanup)" -ForegroundColor Green
    } else {
        Write-Host "FAILED: Failed to get recipes: $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "ERROR: Error getting recipes: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nRecipe API Testing Complete!" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Start the frontend: npm run dev" -ForegroundColor White
Write-Host "2. Navigate to: http://localhost:5173/dashboard/vendor/inventory" -ForegroundColor White
Write-Host "3. Click 'Create Recipe' to test the UI" -ForegroundColor White
Write-Host "4. Test recipe creation with ingredients" -ForegroundColor White 