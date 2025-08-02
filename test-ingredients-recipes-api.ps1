# Test Ingredients and Recipes API Endpoints
# This script tests all CRUD operations for ingredients and recipes

Write-Host "🧪 Testing Ingredients and Recipes API Endpoints" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green

# Create a session object to maintain cookies
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession

# Base URLs
$baseUrl = "http://localhost:3001"
$authUrl = "$baseUrl/api/auth"
$ingredientsUrl = "$baseUrl/api/ingredients"
$recipesUrl = "$baseUrl/api/recipes"

# Test data
$testIngredient1 = @{
    name = "All-Purpose Flour"
    description = "High-quality all-purpose flour"
    unit = "grams"
    costPerUnit = 0.02
    supplier = "Local Mill Co."
    isAvailable = $true
}

$testIngredient2 = @{
    name = "Granulated Sugar"
    description = "Fine granulated sugar"
    unit = "grams"
    costPerUnit = 0.01
    supplier = "Sugar Co."
    isAvailable = $true
}

$testRecipe = @{
    name = "Classic Chocolate Chip Cookies"
    description = "Traditional chocolate chip cookie recipe"
    instructions = "1. Mix dry ingredients`n2. Cream butter and sugar`n3. Combine wet and dry ingredients`n4. Bake at 350°F for 12 minutes"
    yield = 24
    yieldUnit = "cookies"
    prepTime = 15
    cookTime = 12
    difficulty = "Easy"
    isActive = $true
}

# Variables to store IDs
$ingredient1Id = $null
$ingredient2Id = $null
$recipeId = $null

try {
    # Step 1: Login as vendor
    Write-Host "`n🔐 Step 1: Logging in as vendor..." -ForegroundColor Yellow
    $loginData = @{
        email = "vendor@example.com"
        password = "vendor123"
    }
    
    $loginResponse = Invoke-WebRequest -Uri "$authUrl/login" -Method POST -Body ($loginData | ConvertTo-Json) -ContentType "application/json" -WebSession $session
    
    if ($loginResponse.StatusCode -eq 200) {
        Write-Host "✅ Login successful" -ForegroundColor Green
        $loginResult = $loginResponse.Content | ConvertFrom-Json
        Write-Host "   User: $($loginResult.user.email)" -ForegroundColor Gray
    } else {
        Write-Host "❌ Login failed: $($loginResponse.StatusCode)" -ForegroundColor Red
        exit 1
    }

    # Step 2: Test GET /api/ingredients (should be empty initially)
    Write-Host "`n📋 Step 2: Getting all ingredients (should be empty)..." -ForegroundColor Yellow
    $ingredientsResponse = Invoke-WebRequest -Uri $ingredientsUrl -Method GET -WebSession $session
    
    if ($ingredientsResponse.StatusCode -eq 200) {
        $ingredients = $ingredientsResponse.Content | ConvertFrom-Json
        Write-Host "✅ Got ingredients: $($ingredients.count) found" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to get ingredients: $($ingredientsResponse.StatusCode)" -ForegroundColor Red
    }

    # Step 3: Create first ingredient
    Write-Host "`n➕ Step 3: Creating first ingredient..." -ForegroundColor Yellow
    $createIngredient1Response = Invoke-WebRequest -Uri $ingredientsUrl -Method POST -Body ($testIngredient1 | ConvertTo-Json) -ContentType "application/json" -WebSession $session
    
    if ($createIngredient1Response.StatusCode -eq 201) {
        $ingredient1 = $createIngredient1Response.Content | ConvertFrom-Json
        $ingredient1Id = $ingredient1.ingredient.id
        Write-Host "✅ Created ingredient: $($ingredient1.ingredient.name)" -ForegroundColor Green
        Write-Host "   ID: $ingredient1Id" -ForegroundColor Gray
    } else {
        Write-Host "❌ Failed to create ingredient: $($createIngredient1Response.StatusCode)" -ForegroundColor Red
        Write-Host "   Response: $($createIngredient1Response.Content)" -ForegroundColor Red
    }

    # Step 4: Create second ingredient
    Write-Host "`n➕ Step 4: Creating second ingredient..." -ForegroundColor Yellow
    $createIngredient2Response = Invoke-WebRequest -Uri $ingredientsUrl -Method POST -Body ($testIngredient2 | ConvertTo-Json) -ContentType "application/json" -WebSession $session
    
    if ($createIngredient2Response.StatusCode -eq 201) {
        $ingredient2 = $createIngredient2Response.Content | ConvertFrom-Json
        $ingredient2Id = $ingredient2.ingredient.id
        Write-Host "✅ Created ingredient: $($ingredient2.ingredient.name)" -ForegroundColor Green
        Write-Host "   ID: $ingredient2Id" -ForegroundColor Gray
    } else {
        Write-Host "❌ Failed to create ingredient: $($createIngredient2Response.StatusCode)" -ForegroundColor Red
        Write-Host "   Response: $($createIngredient2Response.Content)" -ForegroundColor Red
    }

    # Step 5: Get all ingredients (should have 2 now)
    Write-Host "`n📋 Step 5: Getting all ingredients (should have 2)..." -ForegroundColor Yellow
    $ingredientsResponse = Invoke-WebRequest -Uri $ingredientsUrl -Method GET -WebSession $session
    
    if ($ingredientsResponse.StatusCode -eq 200) {
        $ingredients = $ingredientsResponse.Content | ConvertFrom-Json
        Write-Host "✅ Got ingredients: $($ingredients.count) found" -ForegroundColor Green
        foreach ($ingredient in $ingredients.ingredients) {
            Write-Host "   - $($ingredient.name) ($($ingredient.unit))" -ForegroundColor Gray
        }
    } else {
        Write-Host "❌ Failed to get ingredients: $($ingredientsResponse.StatusCode)" -ForegroundColor Red
    }

    # Step 6: Get specific ingredient
    Write-Host "`n🔍 Step 6: Getting specific ingredient..." -ForegroundColor Yellow
    $getIngredientResponse = Invoke-WebRequest -Uri "$ingredientsUrl/$ingredient1Id" -Method GET -WebSession $session
    
    if ($getIngredientResponse.StatusCode -eq 200) {
        $ingredient = $getIngredientResponse.Content | ConvertFrom-Json
        Write-Host "✅ Got ingredient: $($ingredient.ingredient.name)" -ForegroundColor Green
        Write-Host "   Cost: $($ingredient.ingredient.costPerUnit) per $($ingredient.ingredient.unit)" -ForegroundColor Gray
    } else {
        Write-Host "❌ Failed to get ingredient: $($getIngredientResponse.StatusCode)" -ForegroundColor Red
    }

    # Step 7: Update ingredient
    Write-Host "`n✏️ Step 7: Updating ingredient..." -ForegroundColor Yellow
    $updateData = @{
        costPerUnit = 0.025
        description = "Updated: High-quality all-purpose flour"
    }
    
    $updateIngredientResponse = Invoke-WebRequest -Uri "$ingredientsUrl/$ingredient1Id" -Method PUT -Body ($updateData | ConvertTo-Json) -ContentType "application/json" -WebSession $session
    
    if ($updateIngredientResponse.StatusCode -eq 200) {
        $updatedIngredient = $updateIngredientResponse.Content | ConvertFrom-Json
        Write-Host "✅ Updated ingredient: $($updatedIngredient.ingredient.name)" -ForegroundColor Green
        Write-Host "   New cost: $($updatedIngredient.ingredient.costPerUnit) per $($updatedIngredient.ingredient.unit)" -ForegroundColor Gray
    } else {
        Write-Host "❌ Failed to update ingredient: $($updateIngredientResponse.StatusCode)" -ForegroundColor Red
    }

    # Step 8: Test GET /api/recipes (should be empty initially)
    Write-Host "`n📝 Step 8: Getting all recipes (should be empty)..." -ForegroundColor Yellow
    $recipesResponse = Invoke-WebRequest -Uri $recipesUrl -Method GET -WebSession $session
    
    if ($recipesResponse.StatusCode -eq 200) {
        $recipes = $recipesResponse.Content | ConvertFrom-Json
        Write-Host "✅ Got recipes: $($recipes.count) found" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to get recipes: $($recipesResponse.StatusCode)" -ForegroundColor Red
    }

    # Step 9: Create recipe
    Write-Host "`n➕ Step 9: Creating recipe..." -ForegroundColor Yellow
    $createRecipeResponse = Invoke-WebRequest -Uri $recipesUrl -Method POST -Body ($testRecipe | ConvertTo-Json) -ContentType "application/json" -WebSession $session
    
    if ($createRecipeResponse.StatusCode -eq 201) {
        $recipe = $createRecipeResponse.Content | ConvertFrom-Json
        $recipeId = $recipe.recipe.id
        Write-Host "✅ Created recipe: $($recipe.recipe.name)" -ForegroundColor Green
        Write-Host "   ID: $recipeId" -ForegroundColor Gray
        Write-Host "   Yield: $($recipe.recipe.yield) $($recipe.recipe.yieldUnit)" -ForegroundColor Gray
    } else {
        Write-Host "❌ Failed to create recipe: $($createRecipeResponse.StatusCode)" -ForegroundColor Red
        Write-Host "   Response: $($createRecipeResponse.Content)" -ForegroundColor Red
    }

    # Step 10: Get all recipes (should have 1 now)
    Write-Host "`n📝 Step 10: Getting all recipes (should have 1)..." -ForegroundColor Yellow
    $recipesResponse = Invoke-WebRequest -Uri $recipesUrl -Method GET -WebSession $session
    
    if ($recipesResponse.StatusCode -eq 200) {
        $recipes = $recipesResponse.Content | ConvertFrom-Json
        Write-Host "✅ Got recipes: $($recipes.count) found" -ForegroundColor Green
        foreach ($recipe in $recipes.recipes) {
            Write-Host "   - $($recipe.name) ($($recipe.yield) $($recipe.yieldUnit))" -ForegroundColor Gray
            Write-Host "     Ingredients: $($recipe._count.recipeIngredients)" -ForegroundColor Gray
        }
    } else {
        Write-Host "❌ Failed to get recipes: $($recipesResponse.StatusCode)" -ForegroundColor Red
    }

    # Step 11: Get recipe ingredients (should be empty initially)
    Write-Host "`n🔍 Step 11: Getting recipe ingredients (should be empty)..." -ForegroundColor Yellow
    $recipeIngredientsResponse = Invoke-WebRequest -Uri "$recipesUrl/$recipeId/ingredients" -Method GET -WebSession $session
    
    if ($recipeIngredientsResponse.StatusCode -eq 200) {
        $recipeIngredients = $recipeIngredientsResponse.Content | ConvertFrom-Json
        Write-Host "✅ Got recipe ingredients: $($recipeIngredients.count) found" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to get recipe ingredients: $($recipeIngredientsResponse.StatusCode)" -ForegroundColor Red
    }

    # Step 12: Batch add ingredients to recipe
    Write-Host "`n➕ Step 12: Batch adding ingredients to recipe..." -ForegroundColor Yellow
    $batchIngredientsData = @{
        ingredients = @(
            @{
                ingredientId = $ingredient1Id
                quantity = 250
                unit = "grams"
                notes = "Sifted"
            },
            @{
                ingredientId = $ingredient2Id
                quantity = 200
                unit = "grams"
                notes = "Room temperature"
            }
        )
    }
    
    $batchAddResponse = Invoke-WebRequest -Uri "$recipesUrl/$recipeId/ingredients" -Method POST -Body ($batchIngredientsData | ConvertTo-Json -Depth 3) -ContentType "application/json" -WebSession $session
    
    if ($batchAddResponse.StatusCode -eq 201) {
        $batchResult = $batchAddResponse.Content | ConvertFrom-Json
        Write-Host "✅ Added ingredients to recipe: $($batchResult.count) ingredients" -ForegroundColor Green
        foreach ($recipeIngredient in $batchResult.recipeIngredients) {
            Write-Host "   - $($recipeIngredient.ingredient.name): $($recipeIngredient.quantity) $($recipeIngredient.unit)" -ForegroundColor Gray
        }
    } else {
        Write-Host "❌ Failed to add ingredients: $($batchAddResponse.StatusCode)" -ForegroundColor Red
        Write-Host "   Response: $($batchAddResponse.Content)" -ForegroundColor Red
    }

    # Step 13: Get recipe ingredients (should have 2 now)
    Write-Host "`n🔍 Step 13: Getting recipe ingredients (should have 2)..." -ForegroundColor Yellow
    $recipeIngredientsResponse = Invoke-WebRequest -Uri "$recipesUrl/$recipeId/ingredients" -Method GET -WebSession $session
    
    if ($recipeIngredientsResponse.StatusCode -eq 200) {
        $recipeIngredients = $recipeIngredientsResponse.Content | ConvertFrom-Json
        Write-Host "✅ Got recipe ingredients: $($recipeIngredients.count) found" -ForegroundColor Green
        foreach ($recipeIngredient in $recipeIngredients.recipeIngredients) {
            Write-Host "   - $($recipeIngredient.ingredient.name): $($recipeIngredient.quantity) $($recipeIngredient.unit)" -ForegroundColor Gray
            if ($recipeIngredient.notes) {
                Write-Host "     Notes: $($recipeIngredient.notes)" -ForegroundColor Gray
            }
        }
    } else {
        Write-Host "❌ Failed to get recipe ingredients: $($recipeIngredientsResponse.StatusCode)" -ForegroundColor Red
    }

    # Step 14: Update recipe
    Write-Host "`n✏️ Step 14: Updating recipe..." -ForegroundColor Yellow
    $updateRecipeData = @{
        yield = 30
        difficulty = "Medium"
        description = "Updated: Traditional chocolate chip cookie recipe"
    }
    
    $updateRecipeResponse = Invoke-WebRequest -Uri "$recipesUrl/$recipeId" -Method PUT -Body ($updateRecipeData | ConvertTo-Json) -ContentType "application/json" -WebSession $session
    
    if ($updateRecipeResponse.StatusCode -eq 200) {
        $updatedRecipe = $updateRecipeResponse.Content | ConvertFrom-Json
        Write-Host "✅ Updated recipe: $($updatedRecipe.recipe.name)" -ForegroundColor Green
        Write-Host "   New yield: $($updatedRecipe.recipe.yield) $($updatedRecipe.recipe.yieldUnit)" -ForegroundColor Gray
        Write-Host "   New difficulty: $($updatedRecipe.recipe.difficulty)" -ForegroundColor Gray
    } else {
        Write-Host "❌ Failed to update recipe: $($updateRecipeResponse.StatusCode)" -ForegroundColor Red
    }

    # Step 15: Remove ingredient from recipe
    Write-Host "`n➖ Step 15: Removing ingredient from recipe..." -ForegroundColor Yellow
    $removeIngredientResponse = Invoke-WebRequest -Uri "$recipesUrl/$recipeId/ingredients/$ingredient2Id" -Method DELETE -WebSession $session
    
    if ($removeIngredientResponse.StatusCode -eq 200) {
        Write-Host "✅ Removed ingredient from recipe" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to remove ingredient: $($removeIngredientResponse.StatusCode)" -ForegroundColor Red
    }

    # Step 16: Verify ingredient was removed
    Write-Host "`n🔍 Step 16: Verifying ingredient was removed..." -ForegroundColor Yellow
    $recipeIngredientsResponse = Invoke-WebRequest -Uri "$recipesUrl/$recipeId/ingredients" -Method GET -WebSession $session
    
    if ($recipeIngredientsResponse.StatusCode -eq 200) {
        $recipeIngredients = $recipeIngredientsResponse.Content | ConvertFrom-Json
        Write-Host "✅ Got recipe ingredients: $($recipeIngredients.count) found" -ForegroundColor Green
        foreach ($recipeIngredient in $recipeIngredients.recipeIngredients) {
            Write-Host "   - $($recipeIngredient.ingredient.name): $($recipeIngredient.quantity) $($recipeIngredient.unit)" -ForegroundColor Gray
        }
    } else {
        Write-Host "❌ Failed to get recipe ingredients: $($recipeIngredientsResponse.StatusCode)" -ForegroundColor Red
    }

    # Step 17: Test ingredient deletion protection
    Write-Host "`n🛡️ Step 17: Testing ingredient deletion protection..." -ForegroundColor Yellow
    $deleteIngredientResponse = Invoke-WebRequest -Uri "$ingredientsUrl/$ingredient1Id" -Method DELETE -WebSession $session
    
    if ($deleteIngredientResponse.StatusCode -eq 400) {
        $errorResponse = $deleteIngredientResponse.Content | ConvertFrom-Json
        Write-Host "✅ Ingredient deletion properly blocked: $($errorResponse.message)" -ForegroundColor Green
    } else {
        Write-Host "❌ Ingredient deletion should have been blocked: $($deleteIngredientResponse.StatusCode)" -ForegroundColor Red
    }

    # Step 18: Delete recipe (should also delete recipe ingredients)
    Write-Host "`n🗑️ Step 18: Deleting recipe..." -ForegroundColor Yellow
    $deleteRecipeResponse = Invoke-WebRequest -Uri "$recipesUrl/$recipeId" -Method DELETE -WebSession $session
    
    if ($deleteRecipeResponse.StatusCode -eq 200) {
        Write-Host "✅ Deleted recipe" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to delete recipe: $($deleteRecipeResponse.StatusCode)" -ForegroundColor Red
    }

    # Step 19: Verify recipe was deleted
    Write-Host "`n🔍 Step 19: Verifying recipe was deleted..." -ForegroundColor Yellow
    $recipesResponse = Invoke-WebRequest -Uri $recipesUrl -Method GET -WebSession $session
    
    if ($recipesResponse.StatusCode -eq 200) {
        $recipes = $recipesResponse.Content | ConvertFrom-Json
        Write-Host "✅ Got recipes: $($recipes.count) found" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to get recipes: $($recipesResponse.StatusCode)" -ForegroundColor Red
    }

    # Step 20: Now delete ingredient (should work since recipe is deleted)
    Write-Host "`n🗑️ Step 20: Deleting ingredient (should work now)..." -ForegroundColor Yellow
    $deleteIngredientResponse = Invoke-WebRequest -Uri "$ingredientsUrl/$ingredient1Id" -Method DELETE -WebSession $session
    
    if ($deleteIngredientResponse.StatusCode -eq 200) {
        Write-Host "✅ Deleted ingredient" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to delete ingredient: $($deleteIngredientResponse.StatusCode)" -ForegroundColor Red
    }

    # Step 21: Delete second ingredient
    Write-Host "`n🗑️ Step 21: Deleting second ingredient..." -ForegroundColor Yellow
    $deleteIngredient2Response = Invoke-WebRequest -Uri "$ingredientsUrl/$ingredient2Id" -Method DELETE -WebSession $session
    
    if ($deleteIngredient2Response.StatusCode -eq 200) {
        Write-Host "✅ Deleted second ingredient" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to delete second ingredient: $($deleteIngredient2Response.StatusCode)" -ForegroundColor Red
    }

    # Step 22: Verify all ingredients are deleted
    Write-Host "`n🔍 Step 22: Verifying all ingredients are deleted..." -ForegroundColor Yellow
    $ingredientsResponse = Invoke-WebRequest -Uri $ingredientsUrl -Method GET -WebSession $session
    
    if ($ingredientsResponse.StatusCode -eq 200) {
        $ingredients = $ingredientsResponse.Content | ConvertFrom-Json
        Write-Host "✅ Got ingredients: $($ingredients.count) found" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to get ingredients: $($ingredientsResponse.StatusCode)" -ForegroundColor Red
    }

    Write-Host "`n🎉 All tests completed successfully!" -ForegroundColor Green
    Write-Host "=================================================" -ForegroundColor Green

} catch {
    Write-Host "`n❌ Test failed with error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Stack trace: $($_.ScriptStackTrace)" -ForegroundColor Red
} 