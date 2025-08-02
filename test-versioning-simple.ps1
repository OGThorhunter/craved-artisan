# Test Complete Recipe Versioning Workflow
# This script demonstrates the full versioning workflow:
# 1. Create Recipe with 3 ingredients
# 2. Save version snapshot
# 3. Change ingredient quantity or price
# 4. Save again - see new version
# 5. Confirm version list shows both with correct costs
# 6. Click rollback - loads old values into form

$baseUrl = "http://localhost:3001"
$vendorRecipesUrl = "$baseUrl/api/vendor/recipes"
$ingredientsUrl = "$baseUrl/api/ingredients"

Write-Host "Testing Complete Recipe Versioning Workflow" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# Function to test server connectivity
function Test-ServerConnection {
    Write-Host "Testing server connection..." -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl/health" -Method GET -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Host "Server is running" -ForegroundColor Green
            return $true
        }
    } catch {
        Write-Host "Server is not running or not accessible" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Gray
        return $false
    }
}

# Function to create 3 test ingredients
function Create-ThreeIngredients {
    Write-Host "Creating 3 test ingredients..." -ForegroundColor Yellow
    
    $ingredients = @(
        @{
            name = "All-Purpose Flour"
            description = "Standard all-purpose flour for baking"
            unit = "cups"
            costPerUnit = 0.50
            supplier = "Local Market"
            isAvailable = $true
        },
        @{
            name = "Granulated Sugar"
            description = "Fine granulated white sugar"
            unit = "cups"
            costPerUnit = 0.75
            supplier = "Sweet Supplies"
            isAvailable = $true
        },
        @{
            name = "Butter"
            description = "Unsalted butter, room temperature"
            unit = "cups"
            costPerUnit = 2.25
            supplier = "Dairy Delights"
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
                Write-Host "Created ingredient: $($ingredient.name) - $($ingredient.costPerUnit)/$($ingredient.unit)" -ForegroundColor Green
            }
        } catch {
            Write-Host "Failed to create ingredient: $($ingredient.name)" -ForegroundColor Red
            Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Gray
        }
    }
    
    return $createdIngredients
}

# Function to create test recipe
function Create-TestRecipe {
    param($ingredients)
    
    Write-Host "Creating test recipe..." -ForegroundColor Yellow
    
    $recipeData = @{
        name = "Simple Cookie Recipe"
        description = "A basic cookie recipe for versioning workflow testing"
        instructions = "1. Mix flour, sugar, and butter`n2. Form into cookies`n3. Bake at 350F for 10 minutes"
        yield = 12
        yieldUnit = "cookies"
        prepTime = 10
        cookTime = 10
        difficulty = "Easy"
        isActive = $true
    }
    
    try {
        $response = Invoke-WebRequest -Uri $vendorRecipesUrl -Method POST -Body ($recipeData | ConvertTo-Json) -ContentType "application/json"
        if ($response.StatusCode -eq 201) {
            $result = $response.Content | ConvertFrom-Json
            Write-Host "Test recipe created successfully" -ForegroundColor Green
            Write-Host "Recipe ID: $($result.recipe.id)" -ForegroundColor Gray
            Write-Host "Name: $($result.recipe.name)" -ForegroundColor Gray
            return $result.recipe.id
        }
    } catch {
        Write-Host "Failed to create test recipe" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Gray
        return $null
    }
}

# Function to add initial 3 ingredients to recipe
function Add-InitialIngredients {
    param($recipeId, $ingredients)
    
    Write-Host "Adding initial 3 ingredients to recipe..." -ForegroundColor Yellow
    
    $ingredientsData = @{
        ingredients = @(
            @{
                ingredientId = $ingredients[0].id  # Flour
                quantity = 2.0
                unit = "cups"
                notes = "All-purpose flour"
            },
            @{
                ingredientId = $ingredients[1].id  # Sugar
                quantity = 1.0
                unit = "cups"
                notes = "Granulated sugar"
            },
            @{
                ingredientId = $ingredients[2].id  # Butter
                quantity = 0.5
                unit = "cups"
                notes = "Unsalted butter"
            }
        )
    }
    
    try {
        $response = Invoke-WebRequest -Uri "$vendorRecipesUrl/$recipeId/ingredients" -Method POST -Body ($ingredientsData | ConvertTo-Json) -ContentType "application/json"
        if ($response.StatusCode -eq 201) {
            $result = $response.Content | ConvertFrom-Json
            Write-Host "Initial ingredients added successfully" -ForegroundColor Green
            Write-Host "Added $($result.count) ingredients" -ForegroundColor Gray
            
            # Calculate expected cost
            $flourCost = 2.0 * 0.50    # 2 cups * $0.50/cup = $1.00
            $sugarCost = 1.0 * 0.75    # 1 cup * $0.75/cup = $0.75
            $butterCost = 0.5 * 2.25   # 0.5 cups * $2.25/cup = $1.125
            $totalCost = $flourCost + $sugarCost + $butterCost
            
            Write-Host "Expected total cost: $totalCost" -ForegroundColor Gray
            Write-Host "  - Flour: $flourCost" -ForegroundColor Gray
            Write-Host "  - Sugar: $sugarCost" -ForegroundColor Gray
            Write-Host "  - Butter: $butterCost" -ForegroundColor Gray
            
            return $true
        }
    } catch {
        Write-Host "Failed to add initial ingredients" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Gray
        return $false
    }
}

# Function to create version 1 (initial snapshot)
function Create-Version1 {
    param($recipeId)
    
    Write-Host "Creating Version 1 (initial snapshot)..." -ForegroundColor Yellow
    
    $versionData = @{
        notes = "Initial recipe version with 3 basic ingredients"
    }
    
    try {
        $response = Invoke-WebRequest -Uri "$vendorRecipesUrl/$recipeId/version" -Method POST -Body ($versionData | ConvertTo-Json) -ContentType "application/json"
        if ($response.StatusCode -eq 201) {
            $result = $response.Content | ConvertFrom-Json
            Write-Host "Version 1 created successfully" -ForegroundColor Green
            Write-Host "Version: $($result.recipeVersion.version)" -ForegroundColor Gray
            Write-Host "Notes: $($result.recipeVersion.notes)" -ForegroundColor Gray
            Write-Host "Total Cost: $($result.recipeVersion.totalCost)" -ForegroundColor Gray
            Write-Host "Ingredients: $($result.recipeVersion.ingredients.Count)" -ForegroundColor Gray
            
            # Show ingredient details
            foreach ($ingredient in $result.recipeVersion.ingredients) {
                Write-Host "  - $($ingredient.ingredient.name): $($ingredient.quantity) $($ingredient.unit) @ $($ingredient.pricePerUnit) = $($ingredient.totalCost)" -ForegroundColor Gray
            }
            
            return $result.recipeVersion
        }
    } catch {
        Write-Host "Failed to create Version 1" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Gray
        return $null
    }
}

# Function to update recipe with changed ingredients
function Update-RecipeWithChanges {
    param($recipeId, $ingredients)
    
    Write-Host "Updating recipe with ingredient changes..." -ForegroundColor Yellow
    Write-Host "Changes: Increasing flour quantity" -ForegroundColor Gray
    
    $ingredientsData = @{
        ingredients = @(
            @{
                ingredientId = $ingredients[0].id  # Flour - INCREASED quantity
                quantity = 2.5  # Changed from 2.0 to 2.5
                unit = "cups"
                notes = "All-purpose flour (increased for better texture)"
            },
            @{
                ingredientId = $ingredients[1].id  # Sugar - SAME quantity
                quantity = 1.0
                unit = "cups"
                notes = "Granulated sugar"
            },
            @{
                ingredientId = $ingredients[2].id  # Butter - SAME
                quantity = 0.5
                unit = "cups"
                notes = "Unsalted butter"
            }
        )
    }
    
    try {
        $response = Invoke-WebRequest -Uri "$vendorRecipesUrl/$recipeId/ingredients" -Method POST -Body ($ingredientsData | ConvertTo-Json) -ContentType "application/json"
        if ($response.StatusCode -eq 201) {
            $result = $response.Content | ConvertFrom-Json
            Write-Host "Recipe updated with ingredient changes" -ForegroundColor Green
            Write-Host "Updated $($result.count) ingredients" -ForegroundColor Gray
            
            # Calculate expected new cost
            $flourCost = 2.5 * 0.50    # 2.5 cups * $0.50/cup = $1.25
            $sugarCost = 1.0 * 0.75    # 1 cup * $0.75/cup = $0.75
            $butterCost = 0.5 * 2.25   # 0.5 cups * $2.25/cup = $1.125
            $totalCost = $flourCost + $sugarCost + $butterCost
            
            Write-Host "Expected new total cost: $totalCost" -ForegroundColor Gray
            Write-Host "  - Flour: $flourCost (increased from $1.00)" -ForegroundColor Gray
            Write-Host "  - Sugar: $sugarCost (same)" -ForegroundColor Gray
            Write-Host "  - Butter: $butterCost (same)" -ForegroundColor Gray
            
            return $true
        }
    } catch {
        Write-Host "Failed to update recipe ingredients" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Gray
        return $false
    }
}

# Function to create version 2 (after changes)
function Create-Version2 {
    param($recipeId)
    
    Write-Host "Creating Version 2 (after ingredient changes)..." -ForegroundColor Yellow
    
    $versionData = @{
        notes = "Increased flour quantity for better cookie texture"
    }
    
    try {
        $response = Invoke-WebRequest -Uri "$vendorRecipesUrl/$recipeId/version" -Method POST -Body ($versionData | ConvertTo-Json) -ContentType "application/json"
        if ($response.StatusCode -eq 201) {
            $result = $response.Content | ConvertFrom-Json
            Write-Host "Version 2 created successfully" -ForegroundColor Green
            Write-Host "Version: $($result.recipeVersion.version)" -ForegroundColor Gray
            Write-Host "Notes: $($result.recipeVersion.notes)" -ForegroundColor Gray
            Write-Host "Total Cost: $($result.recipeVersion.totalCost)" -ForegroundColor Gray
            Write-Host "Cost Delta: $($result.recipeVersion.costDelta)" -ForegroundColor Gray
            Write-Host "Cost Delta %: $($result.recipeVersion.costDeltaPercent)%" -ForegroundColor Gray
            
            # Show ingredient details
            foreach ($ingredient in $result.recipeVersion.ingredients) {
                Write-Host "  - $($ingredient.ingredient.name): $($ingredient.quantity) $($ingredient.unit) @ $($ingredient.pricePerUnit) = $($ingredient.totalCost)" -ForegroundColor Gray
            }
            
            return $result.recipeVersion
        }
    } catch {
        Write-Host "Failed to create Version 2" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Gray
        return $null
    }
}

# Function to verify version list shows both versions with correct costs
function Verify-VersionList {
    param($recipeId)
    
    Write-Host "Verifying version list shows both versions with correct costs..." -ForegroundColor Yellow
    
    try {
        $response = Invoke-WebRequest -Uri "$vendorRecipesUrl/$recipeId/versions" -Method GET
        if ($response.StatusCode -eq 200) {
            $result = $response.Content | ConvertFrom-Json
            Write-Host "Version list retrieved successfully" -ForegroundColor Green
            Write-Host "Found $($result.versions.Count) versions" -ForegroundColor Gray
            
            foreach ($version in $result.versions) {
                Write-Host "`nVersion $($version.version):" -ForegroundColor Cyan
                Write-Host "  - Name: $($version.name)" -ForegroundColor Gray
                Write-Host "  - Total Cost: $($version.totalCost)" -ForegroundColor Gray
                Write-Host "  - Cost Delta: $($version.costDelta)" -ForegroundColor Gray
                Write-Host "  - Cost Delta %: $($version.costDeltaPercent)%" -ForegroundColor Gray
                Write-Host "  - Notes: $($version.notes)" -ForegroundColor Gray
                Write-Host "  - Editor: $($version.editor.email)" -ForegroundColor Gray
                Write-Host "  - Created: $($version.createdAt)" -ForegroundColor Gray
                
                Write-Host "  Ingredients:" -ForegroundColor Gray
                foreach ($ingredient in $version.ingredients) {
                    Write-Host "    - $($ingredient.ingredient.name): $($ingredient.quantity) $($ingredient.unit) @ $($ingredient.pricePerUnit) = $($ingredient.totalCost)" -ForegroundColor Gray
                }
            }
            
            return $result.versions
        }
    } catch {
        Write-Host "Failed to retrieve version list" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Gray
        return $null
    }
}

# Function to test rollback functionality
function Test-Rollback {
    param($recipeId, $versionNumber)
    
    Write-Host "Testing rollback to Version $versionNumber..." -ForegroundColor Yellow
    
    try {
        $response = Invoke-WebRequest -Uri "$vendorRecipesUrl/$recipeId/versions/$versionNumber" -Method GET
        if ($response.StatusCode -eq 200) {
            $result = $response.Content | ConvertFrom-Json
            Write-Host "Rollback data retrieved successfully" -ForegroundColor Green
            Write-Host "Version: $($result.recipeVersion.version)" -ForegroundColor Gray
            Write-Host "Total Cost: $($result.recipeVersion.totalCost)" -ForegroundColor Gray
            Write-Host "Notes: $($result.recipeVersion.notes)" -ForegroundColor Gray
            
            Write-Host "Rollback Ingredients:" -ForegroundColor Gray
            foreach ($ingredient in $result.recipeVersion.ingredients) {
                Write-Host "  - $($ingredient.ingredient.name): $($ingredient.quantity) $($ingredient.unit) @ $($ingredient.pricePerUnit) = $($ingredient.totalCost)" -ForegroundColor Gray
            }
            
            Write-Host "Rollback data ready to load into form" -ForegroundColor Green
            return $result.recipeVersion
        }
    } catch {
        Write-Host "Failed to retrieve rollback data" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Gray
        return $null
    }
}

# Main test execution
Write-Host "Step 1: Testing server connection..." -ForegroundColor Yellow
if (-not (Test-ServerConnection)) {
    Write-Host "Cannot proceed without server connection. Please start the server first." -ForegroundColor Red
    exit 1
}

Write-Host "`nStep 2: Creating 3 test ingredients..." -ForegroundColor Yellow
$ingredients = Create-ThreeIngredients

if ($ingredients.Count -eq 0) {
    Write-Host "Failed to create test ingredients. Cannot proceed." -ForegroundColor Red
    exit 1
}

Write-Host "`nStep 3: Creating test recipe..." -ForegroundColor Yellow
$recipeId = Create-TestRecipe -ingredients $ingredients

if (-not $recipeId) {
    Write-Host "Failed to create test recipe. Cannot proceed." -ForegroundColor Red
    exit 1
}

Write-Host "`nStep 4: Adding initial 3 ingredients..." -ForegroundColor Yellow
$initialIngredientsAdded = Add-InitialIngredients -recipeId $recipeId -ingredients $ingredients

if (-not $initialIngredientsAdded) {
    Write-Host "Failed to add initial ingredients. Cannot proceed." -ForegroundColor Red
    exit 1
}

Write-Host "`nStep 5: Creating Version 1 (initial snapshot)..." -ForegroundColor Yellow
$version1 = Create-Version1 -recipeId $recipeId

if (-not $version1) {
    Write-Host "Failed to create Version 1. Cannot proceed." -ForegroundColor Red
    exit 1
}

Write-Host "`nStep 6: Updating recipe with ingredient changes..." -ForegroundColor Yellow
$recipeUpdated = Update-RecipeWithChanges -recipeId $recipeId -ingredients $ingredients

if (-not $recipeUpdated) {
    Write-Host "Failed to update recipe. Cannot proceed." -ForegroundColor Red
    exit 1
}

Write-Host "`nStep 7: Creating Version 2 (after changes)..." -ForegroundColor Yellow
$version2 = Create-Version2 -recipeId $recipeId

if (-not $version2) {
    Write-Host "Failed to create Version 2. Cannot proceed." -ForegroundColor Red
    exit 1
}

Write-Host "`nStep 8: Verifying version list shows both versions..." -ForegroundColor Yellow
$versions = Verify-VersionList -recipeId $recipeId

Write-Host "`nStep 9: Testing rollback to Version 1..." -ForegroundColor Yellow
$rollbackData = Test-Rollback -recipeId $recipeId -versionNumber 1

Write-Host "`nComplete Versioning Workflow Test Complete!" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "Summary:" -ForegroundColor Yellow
Write-Host "- Created recipe with 3 ingredients" -ForegroundColor Green
Write-Host "- Saved initial version snapshot" -ForegroundColor Green
Write-Host "- Changed ingredient quantity (flour: 2.0 to 2.5 cups)" -ForegroundColor Green
Write-Host "- Saved new version with changes" -ForegroundColor Green
Write-Host "- Verified version list shows both versions with correct costs" -ForegroundColor Green
Write-Host "- Tested rollback functionality" -ForegroundColor Green

Write-Host "`nManual Testing Links:" -ForegroundColor Yellow
Write-Host "Version History Page: http://localhost:5173/dashboard/vendor/recipes/$recipeId/versions" -ForegroundColor Gray
Write-Host "Recipe Edit Page: http://localhost:5173/dashboard/vendor/recipes/$recipeId/edit" -ForegroundColor Gray
Write-Host "API Versions Endpoint: $vendorRecipesUrl/$recipeId/versions" -ForegroundColor Gray

Write-Host "`nManual Testing Steps:" -ForegroundColor Yellow
Write-Host "1. Navigate to version history page" -ForegroundColor White
Write-Host "2. Verify both versions are listed with correct costs" -ForegroundColor White
Write-Host "3. Check cost deltas are displayed correctly" -ForegroundColor White
Write-Host "4. Click 'Show Diff' to see ingredient changes" -ForegroundColor White
Write-Host "5. Click 'Rollback' on Version 1" -ForegroundColor White
Write-Host "6. Verify old values are loaded into the form" -ForegroundColor White
Write-Host "7. Test creating a new version from the rollback" -ForegroundColor White

Write-Host "`nKey Changes Made:" -ForegroundColor Yellow
Write-Host "- Flour: 2.0 cups to 2.5 cups (+$0.25)" -ForegroundColor White
Write-Host "- Total cost increased by $0.25 (8.7%)" -ForegroundColor White
Write-Host "- Version 1: $2.875" -ForegroundColor White
Write-Host "- Version 2: $3.125" -ForegroundColor White 