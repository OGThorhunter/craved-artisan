# Test Recipe Cost Calculator
# This script tests the cost calculator functionality

$baseUrl = "http://localhost:3001"
$vendorRecipesUrl = "$baseUrl/api/vendor/recipes"
$ingredientsUrl = "$baseUrl/api/ingredients"
$productsUrl = "$baseUrl/api/vendor/products"

Write-Host "🧮 Testing Recipe Cost Calculator" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Function to test server connectivity
function Test-ServerConnection {
    Write-Host "Testing server connection..." -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl/health" -Method GET -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Server is running" -ForegroundColor Green
            return $true
        }
    } catch {
        Write-Host "❌ Server is not running or not accessible" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
        return $false
    }
}

# Function to create test ingredients
function Create-TestIngredients {
    Write-Host "Creating test ingredients..." -ForegroundColor Yellow
    
    $ingredients = @(
        @{
            name = "Organic Flour"
            description = "High-quality organic all-purpose flour"
            unit = "kilograms"
            costPerUnit = 3.50
            supplier = "Organic Foods Co"
            isAvailable = $true
        },
        @{
            name = "Granulated Sugar"
            description = "Fine granulated white sugar"
            unit = "kilograms"
            costPerUnit = 2.25
            supplier = "Sweet Supplies"
            isAvailable = $true
        },
        @{
            name = "Butter"
            description = "Unsalted butter, 82% fat"
            unit = "kilograms"
            costPerUnit = 8.75
            supplier = "Dairy Delights"
            isAvailable = $true
        },
        @{
            name = "Eggs"
            description = "Large fresh eggs"
            unit = "dozen"
            costPerUnit = 4.50
            supplier = "Farm Fresh"
            isAvailable = $true
        },
        @{
            name = "Vanilla Extract"
            description = "Pure vanilla extract"
            unit = "milliliters"
            costPerUnit = 0.15
            supplier = "Flavor Masters"
            isAvailable = $true
        }
    )
    
    $createdIngredients = @()
    
    foreach ($ingredient in $ingredients) {
        try {
            $response = Invoke-WebRequest -Uri $ingredientsUrl -Method POST -Body ($ingredient | ConvertTo-Json) -ContentType "application/json"
            if ($response.StatusCode -eq 201) {
                $result = $response.Content | ConvertFrom-Json
                $createdIngredients += $result.ingredient
                Write-Host "✅ Created ingredient: $($ingredient.name)" -ForegroundColor Green
            }
        } catch {
            Write-Host "❌ Failed to create ingredient: $($ingredient.name)" -ForegroundColor Red
            Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
        }
    }
    
    return $createdIngredients
}

# Function to create test products
function Create-TestProducts {
    Write-Host "Creating test products..." -ForegroundColor Yellow
    
    $products = @(
        @{
            name = "Chocolate Chip Cookies"
            description = "Classic homemade chocolate chip cookies"
            price = 12.99
            imageUrl = "https://example.com/cookies.jpg"
            tags = @("cookies", "chocolate", "homemade")
            stock = 50
            isAvailable = $true
        },
        @{
            name = "Premium Chocolate Chip Cookies"
            description = "Premium cookies with organic ingredients"
            price = 18.99
            imageUrl = "https://example.com/premium-cookies.jpg"
            tags = @("cookies", "premium", "organic")
            stock = 25
            isAvailable = $true
        }
    )
    
    $createdProducts = @()
    
    foreach ($product in $products) {
        try {
            $response = Invoke-WebRequest -Uri $productsUrl -Method POST -Body ($product | ConvertTo-Json) -ContentType "application/json"
            if ($response.StatusCode -eq 201) {
                $result = $response.Content | ConvertFrom-Json
                $createdProducts += $result.product
                Write-Host "✅ Created product: $($product.name)" -ForegroundColor Green
            }
        } catch {
            Write-Host "❌ Failed to create product: $($product.name)" -ForegroundColor Red
            Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
        }
    }
    
    return $createdProducts
}

# Function to create test recipe
function Create-TestRecipe {
    param($ingredients, $products)
    
    Write-Host "Creating test recipe..." -ForegroundColor Yellow
    
    $recipeData = @{
        name = "Cost Calculator Test Recipe"
        description = "A test recipe for cost calculator functionality"
        instructions = "1. Mix flour and sugar\n2. Add butter and eggs\n3. Bake at 350°F for 12 minutes"
        yield = 24
        yieldUnit = "cookies"
        prepTime = 15
        cookTime = 12
        difficulty = "Easy"
        isActive = $true
        productId = $products[0].id
    }
    
    try {
        $response = Invoke-WebRequest -Uri $vendorRecipesUrl -Method POST -Body ($recipeData | ConvertTo-Json) -ContentType "application/json"
        if ($response.StatusCode -eq 201) {
            $result = $response.Content | ConvertFrom-Json
            Write-Host "✅ Test recipe created successfully" -ForegroundColor Green
            Write-Host "   Recipe ID: $($result.recipe.id)" -ForegroundColor Gray
            return $result.recipe.id
        }
    } catch {
        Write-Host "❌ Failed to create test recipe" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
        return $null
    }
}

# Function to add ingredients to recipe
function Add-IngredientsToRecipe {
    param($recipeId, $ingredients)
    
    Write-Host "Adding ingredients to recipe..." -ForegroundColor Yellow
    
    $ingredientsData = @{
        ingredients = @(
            @{
                ingredientId = $ingredients[0].id  # Flour
                quantity = 2.5
                unit = "kilograms"
                notes = "All-purpose flour"
            },
            @{
                ingredientId = $ingredients[1].id  # Sugar
                quantity = 1.0
                unit = "kilograms"
                notes = "Granulated sugar"
            },
            @{
                ingredientId = $ingredients[2].id  # Butter
                quantity = 0.5
                unit = "kilograms"
                notes = "Unsalted butter"
            },
            @{
                ingredientId = $ingredients[3].id  # Eggs
                quantity = 2.0
                unit = "dozen"
                notes = "Large eggs"
            },
            @{
                ingredientId = $ingredients[4].id  # Vanilla
                quantity = 30.0
                unit = "milliliters"
                notes = "Vanilla extract"
            }
        )
    }
    
    try {
        $response = Invoke-WebRequest -Uri "$vendorRecipesUrl/$recipeId/ingredients" -Method POST -Body ($ingredientsData | ConvertTo-Json) -ContentType "application/json"
        if ($response.StatusCode -eq 201) {
            $result = $response.Content | ConvertFrom-Json
            Write-Host "✅ Ingredients added successfully" -ForegroundColor Green
            Write-Host "   Added $($result.count) ingredients" -ForegroundColor Gray
            return $true
        }
    } catch {
        Write-Host "❌ Failed to add ingredients" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
        return $false
    }
}

# Function to test cost calculations
function Test-CostCalculations {
    param($recipeId, $ingredients, $products)
    
    Write-Host "Testing cost calculations..." -ForegroundColor Yellow
    
    # Calculate expected costs manually
    $flourCost = 2.5 * 3.50    # 2.5kg * $3.50/kg = $8.75
    $sugarCost = 1.0 * 2.25    # 1.0kg * $2.25/kg = $2.25
    $butterCost = 0.5 * 8.75   # 0.5kg * $8.75/kg = $4.375
    $eggsCost = 2.0 * 4.50     # 2 dozen * $4.50/dozen = $9.00
    $vanillaCost = 30.0 * 0.15 # 30ml * $0.15/ml = $4.50
    
    $totalCost = $flourCost + $sugarCost + $butterCost + $eggsCost + $vanillaCost
    $perUnitCost = $totalCost / 24  # 24 cookies
    $productPrice = $products[0].price
    $margin = $productPrice - $perUnitCost
    $marginPercentage = ($margin / $productPrice) * 100
    
    Write-Host "📊 Expected Cost Breakdown:" -ForegroundColor Cyan
    Write-Host "   Flour: $flourCost" -ForegroundColor Gray
    Write-Host "   Sugar: $sugarCost" -ForegroundColor Gray
    Write-Host "   Butter: $butterCost" -ForegroundColor Gray
    Write-Host "   Eggs: $eggsCost" -ForegroundColor Gray
    Write-Host "   Vanilla: $vanillaCost" -ForegroundColor Gray
    Write-Host "   Total Cost: $totalCost" -ForegroundColor Gray
    Write-Host "   Per Unit Cost: $perUnitCost" -ForegroundColor Gray
    Write-Host "   Product Price: $productPrice" -ForegroundColor Gray
    Write-Host "   Margin: $margin" -ForegroundColor Gray
    Write-Host "   Margin %: $marginPercentage%" -ForegroundColor Gray
    
    # Determine expected margin color
    if ($marginPercentage -lt 20) {
        $expectedColor = "red"
    } elseif ($marginPercentage -lt 35) {
        $expectedColor = "yellow"
    } else {
        $expectedColor = "green"
    }
    Write-Host "   Expected Margin Color: $expectedColor" -ForegroundColor Gray
    
    return @{
        totalCost = $totalCost
        perUnitCost = $perUnitCost
        margin = $margin
        marginPercentage = $marginPercentage
        expectedColor = $expectedColor
    }
}

# Function to test recipe retrieval
function Test-RecipeRetrieval {
    param($recipeId)
    
    Write-Host "Testing recipe retrieval..." -ForegroundColor Yellow
    
    try {
        $response = Invoke-WebRequest -Uri "$vendorRecipesUrl/$recipeId" -Method GET
        if ($response.StatusCode -eq 200) {
            $result = $response.Content | ConvertFrom-Json
            Write-Host "✅ Recipe retrieved successfully" -ForegroundColor Green
            Write-Host "   Name: $($result.recipe.name)" -ForegroundColor Gray
            Write-Host "   Yield: $($result.recipe.yield) $($result.recipe.yieldUnit)" -ForegroundColor Gray
            Write-Host "   Ingredients: $($result.recipe.recipeIngredients.Count)" -ForegroundColor Gray
            Write-Host "   Linked Product: $($result.recipe.product.name)" -ForegroundColor Gray
            return $result.recipe
        }
    } catch {
        Write-Host "❌ Failed to retrieve recipe" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
        return $null
    }
}

# Main test execution
Write-Host "Step 1: Testing server connection..." -ForegroundColor Yellow
if (-not (Test-ServerConnection)) {
    Write-Host "Cannot proceed without server connection. Please start the server first." -ForegroundColor Red
    exit 1
}

Write-Host "`nStep 2: Creating test ingredients..." -ForegroundColor Yellow
$ingredients = Create-TestIngredients

if ($ingredients.Count -eq 0) {
    Write-Host "Failed to create test ingredients. Cannot proceed." -ForegroundColor Red
    exit 1
}

Write-Host "`nStep 3: Creating test products..." -ForegroundColor Yellow
$products = Create-TestProducts

if ($products.Count -eq 0) {
    Write-Host "Failed to create test products. Cannot proceed." -ForegroundColor Red
    exit 1
}

Write-Host "`nStep 4: Creating test recipe..." -ForegroundColor Yellow
$recipeId = Create-TestRecipe -ingredients $ingredients -products $products

if (-not $recipeId) {
    Write-Host "Failed to create test recipe. Cannot proceed." -ForegroundColor Red
    exit 1
}

Write-Host "`nStep 5: Adding ingredients to recipe..." -ForegroundColor Yellow
$ingredientsAdded = Add-IngredientsToRecipe -recipeId $recipeId -ingredients $ingredients

if (-not $ingredientsAdded) {
    Write-Host "Failed to add ingredients. Cannot proceed." -ForegroundColor Red
    exit 1
}

Write-Host "`nStep 6: Testing cost calculations..." -ForegroundColor Yellow
$expectedCosts = Test-CostCalculations -recipeId $recipeId -ingredients $ingredients -products $products

Write-Host "`nStep 7: Testing recipe retrieval..." -ForegroundColor Yellow
$retrievedRecipe = Test-RecipeRetrieval -recipeId $recipeId

Write-Host "`n🎉 Cost Calculator Testing Complete!" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "Summary:" -ForegroundColor Yellow
Write-Host "- Created test ingredients with costs" -ForegroundColor White
Write-Host "- Created test products with prices" -ForegroundColor White
Write-Host "- Created test recipe with ingredients" -ForegroundColor White
Write-Host "- Calculated expected costs and margins" -ForegroundColor White
Write-Host "- Verified recipe data retrieval" -ForegroundColor White

Write-Host "`n📊 Test Results:" -ForegroundColor Yellow
Write-Host "Recipe ID: $recipeId" -ForegroundColor Gray
Write-Host "Total Cost: $($expectedCosts.totalCost)" -ForegroundColor Gray
Write-Host "Per Unit Cost: $($expectedCosts.perUnitCost)" -ForegroundColor Gray
Write-Host "Margin: $($expectedCosts.margin)" -ForegroundColor Gray
Write-Host "Margin %: $($expectedCosts.marginPercentage)%" -ForegroundColor Gray
Write-Host "Expected Color: $($expectedCosts.expectedColor)" -ForegroundColor Gray

Write-Host "`n🔗 Manual Testing Links:" -ForegroundColor Yellow
Write-Host "Recipe Edit Page: http://localhost:5173/dashboard/vendor/recipes/$recipeId/edit" -ForegroundColor Gray
Write-Host "API Recipe Endpoint: $vendorRecipesUrl/$recipeId" -ForegroundColor Gray

Write-Host "`n📝 Manual Testing Steps:" -ForegroundColor Yellow
Write-Host "1. Navigate to the recipe edit page in your browser" -ForegroundColor White
Write-Host "2. Verify cost calculator shows correct calculations" -ForegroundColor White
Write-Host "3. Check margin color coding (red/yellow/green)" -ForegroundColor White
Write-Host "4. Test ingredient cost breakdown" -ForegroundColor White
Write-Host "5. Verify linked product margin analysis" -ForegroundColor White
Write-Host "6. Test responsive design on different screen sizes" -ForegroundColor White 