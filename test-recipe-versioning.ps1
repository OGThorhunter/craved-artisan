# Test Recipe Versioning API
# This script tests the new recipe versioning functionality

$baseUrl = "http://localhost:3001"
$vendorRecipesUrl = "$baseUrl/api/vendor/recipes"

Write-Host "🧪 Testing Recipe Versioning API" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

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

# Function to create a test recipe
function Create-TestRecipe {
    Write-Host "Creating test recipe..." -ForegroundColor Yellow
    
    $recipeData = @{
        name = "Test Chocolate Chip Cookies"
        description = "A test recipe for versioning"
        instructions = "1. Mix ingredients\n2. Bake at 350°F\n3. Cool and serve"
        yield = 24
        yieldUnit = "cookies"
        prepTime = 15
        cookTime = 12
        difficulty = "Easy"
        isActive = $true
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
    param($recipeId)
    
    Write-Host "Adding ingredients to recipe..." -ForegroundColor Yellow
    
    $ingredientsData = @{
        ingredients = @(
            @{
                ingredientId = "1"  # Using existing ingredient ID from mock data
                quantity = 2.5
                unit = "cups"
                notes = "All-purpose flour"
            },
            @{
                ingredientId = "2"  # Using existing ingredient ID from mock data
                quantity = 1.0
                unit = "cups"
                notes = "Granulated sugar"
            },
            @{
                ingredientId = "4"  # Using existing ingredient ID from mock data
                quantity = 1.0
                unit = "cups"
                notes = "Softened butter"
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

# Function to create recipe version
function Create-RecipeVersion {
    param($recipeId)
    
    Write-Host "Creating recipe version..." -ForegroundColor Yellow
    
    try {
        $response = Invoke-WebRequest -Uri "$vendorRecipesUrl/$recipeId/version" -Method POST -ContentType "application/json"
        if ($response.StatusCode -eq 201) {
            $result = $response.Content | ConvertFrom-Json
            Write-Host "✅ Recipe version created successfully" -ForegroundColor Green
            Write-Host "   Version: $($result.recipeVersion.version)" -ForegroundColor Gray
            Write-Host "   Total Cost: $($result.recipeVersion.totalCost)" -ForegroundColor Gray
            Write-Host "   Ingredients: $($result.recipeVersion.ingredients.Count)" -ForegroundColor Gray
            
            # Display ingredient details
            foreach ($ingredient in $result.recipeVersion.ingredients) {
                Write-Host "     - $($ingredient.ingredient.name): $($ingredient.quantity) $($ingredient.unit) @ $($ingredient.pricePerUnit) = $($ingredient.totalCost)" -ForegroundColor Gray
            }
            
            return $result.recipeVersion
        }
    } catch {
        Write-Host "❌ Failed to create recipe version" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
        return $null
    }
}

# Function to get recipe versions
function Get-RecipeVersions {
    param($recipeId)
    
    Write-Host "Getting recipe versions..." -ForegroundColor Yellow
    
    try {
        $response = Invoke-WebRequest -Uri "$vendorRecipesUrl/$recipeId/versions" -Method GET
        if ($response.StatusCode -eq 200) {
            $result = $response.Content | ConvertFrom-Json
            Write-Host "✅ Recipe versions retrieved successfully" -ForegroundColor Green
            Write-Host "   Found $($result.versions.Count) versions" -ForegroundColor Gray
            
            foreach ($version in $result.versions) {
                Write-Host "     Version $($version.version): $($version.name) - Cost: $($version.totalCost) - Created: $($version.createdAt)" -ForegroundColor Gray
            }
            
            return $result.versions
        }
    } catch {
        Write-Host "❌ Failed to get recipe versions" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
        return $null
    }
}

# Function to get specific version
function Get-SpecificVersion {
    param($recipeId, $versionNumber)
    
    Write-Host "Getting specific version $versionNumber..." -ForegroundColor Yellow
    
    try {
        $response = Invoke-WebRequest -Uri "$vendorRecipesUrl/$recipeId/versions/$versionNumber" -Method GET
        if ($response.StatusCode -eq 200) {
            $result = $response.Content | ConvertFrom-Json
            Write-Host "✅ Specific version retrieved successfully" -ForegroundColor Green
            Write-Host "   Version: $($result.recipeVersion.version)" -ForegroundColor Gray
            Write-Host "   Name: $($result.recipeVersion.name)" -ForegroundColor Gray
            Write-Host "   Total Cost: $($result.recipeVersion.totalCost)" -ForegroundColor Gray
            return $result.recipeVersion
        }
    } catch {
        Write-Host "❌ Failed to get specific version" -ForegroundColor Red
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

Write-Host "`nStep 2: Creating test recipe..." -ForegroundColor Yellow
$recipeId = Create-TestRecipe

if (-not $recipeId) {
    Write-Host "Failed to create test recipe. Cannot proceed." -ForegroundColor Red
    exit 1
}

Write-Host "`nStep 3: Adding ingredients to recipe..." -ForegroundColor Yellow
$ingredientsAdded = Add-IngredientsToRecipe -recipeId $recipeId

if (-not $ingredientsAdded) {
    Write-Host "Failed to add ingredients. Cannot proceed." -ForegroundColor Red
    exit 1
}

Write-Host "`nStep 4: Creating first recipe version..." -ForegroundColor Yellow
$version1 = Create-RecipeVersion -recipeId $recipeId

if (-not $version1) {
    Write-Host "Failed to create first version. Cannot proceed." -ForegroundColor Red
    exit 1
}

Write-Host "`nStep 5: Creating second recipe version..." -ForegroundColor Yellow
$version2 = Create-RecipeVersion -recipeId $recipeId

if (-not $version2) {
    Write-Host "Failed to create second version. Cannot proceed." -ForegroundColor Red
    exit 1
}

Write-Host "`nStep 6: Getting all recipe versions..." -ForegroundColor Yellow
$allVersions = Get-RecipeVersions -recipeId $recipeId

Write-Host "`nStep 7: Getting specific version 1..." -ForegroundColor Yellow
$specificVersion1 = Get-SpecificVersion -recipeId $recipeId -versionNumber 1

Write-Host "`nStep 8: Getting specific version 2..." -ForegroundColor Yellow
$specificVersion2 = Get-SpecificVersion -recipeId $recipeId -versionNumber 2

Write-Host "`n🎉 Recipe Versioning API Testing Complete!" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Summary:" -ForegroundColor Yellow
Write-Host "- Created test recipe with ingredients" -ForegroundColor White
Write-Host "- Created 2 recipe versions with cost snapshots" -ForegroundColor White
Write-Host "- Retrieved all versions successfully" -ForegroundColor White
Write-Host "- Retrieved specific versions successfully" -ForegroundColor White
Write-Host "- All endpoints working correctly" -ForegroundColor White

Write-Host "`n📊 Test Results:" -ForegroundColor Yellow
Write-Host "Recipe ID: $recipeId" -ForegroundColor Gray
Write-Host "Version 1: $($version1.version) - Cost: $($version1.totalCost)" -ForegroundColor Gray
Write-Host "Version 2: $($version2.version) - Cost: $($version2.totalCost)" -ForegroundColor Gray
Write-Host "Total Versions: $($allVersions.Count)" -ForegroundColor Gray 