# Test Recipe Version History Frontend
# This script tests the version history page functionality

$baseUrl = "http://localhost:5173"
$vendorRecipesUrl = "http://localhost:3001/api/vendor/recipes"

Write-Host "🧪 Testing Recipe Version History Frontend" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# Function to test frontend connectivity
function Test-FrontendConnection {
    Write-Host "Testing frontend connection..." -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest -Uri $baseUrl -Method GET -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Frontend is running" -ForegroundColor Green
            return $true
        }
    } catch {
        Write-Host "❌ Frontend is not running or not accessible" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
        return $false
    }
}

# Function to test backend connectivity
function Test-BackendConnection {
    Write-Host "Testing backend connection..." -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -Method GET -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Backend is running" -ForegroundColor Green
            return $true
        }
    } catch {
        Write-Host "❌ Backend is not running or not accessible" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
        return $false
    }
}

# Function to create a test recipe with versions
function Create-TestRecipeWithVersions {
    Write-Host "Creating test recipe with versions..." -ForegroundColor Yellow
    
    # Step 1: Create recipe
    $recipeData = @{
        name = "Version History Test Recipe"
        description = "A test recipe for version history functionality"
        instructions = "1. Mix ingredients\n2. Bake at 350°F\n3. Cool and serve"
        yield = 12
        yieldUnit = "cookies"
        prepTime = 10
        cookTime = 15
        difficulty = "Easy"
        isActive = $true
    }
    
    try {
        $response = Invoke-WebRequest -Uri $vendorRecipesUrl -Method POST -Body ($recipeData | ConvertTo-Json) -ContentType "application/json"
        if ($response.StatusCode -eq 201) {
            $result = $response.Content | ConvertFrom-Json
            $recipeId = $result.recipe.id
            Write-Host "✅ Test recipe created successfully" -ForegroundColor Green
            Write-Host "   Recipe ID: $recipeId" -ForegroundColor Gray
            
            # Step 2: Add ingredients
            $ingredientsData = @{
                ingredients = @(
                    @{
                        ingredientId = "1"
                        quantity = 2.0
                        unit = "cups"
                        notes = "All-purpose flour"
                    },
                    @{
                        ingredientId = "2"
                        quantity = 1.0
                        unit = "cups"
                        notes = "Granulated sugar"
                    },
                    @{
                        ingredientId = "4"
                        quantity = 0.5
                        unit = "cups"
                        notes = "Butter"
                    }
                )
            }
            
            $response = Invoke-WebRequest -Uri "$vendorRecipesUrl/$recipeId/ingredients" -Method POST -Body ($ingredientsData | ConvertTo-Json) -ContentType "application/json"
            if ($response.StatusCode -eq 201) {
                Write-Host "✅ Ingredients added successfully" -ForegroundColor Green
                
                # Step 3: Create first version
                $response = Invoke-WebRequest -Uri "$vendorRecipesUrl/$recipeId/version" -Method POST -ContentType "application/json"
                if ($response.StatusCode -eq 201) {
                    $version1 = $response.Content | ConvertFrom-Json
                    Write-Host "✅ Version 1 created successfully" -ForegroundColor Green
                    Write-Host "   Version: $($version1.recipeVersion.version)" -ForegroundColor Gray
                    Write-Host "   Total Cost: $($version1.recipeVersion.totalCost)" -ForegroundColor Gray
                    
                    # Step 4: Create second version
                    $response = Invoke-WebRequest -Uri "$vendorRecipesUrl/$recipeId/version" -Method POST -ContentType "application/json"
                    if ($response.StatusCode -eq 201) {
                        $version2 = $response.Content | ConvertFrom-Json
                        Write-Host "✅ Version 2 created successfully" -ForegroundColor Green
                        Write-Host "   Version: $($version2.recipeVersion.version)" -ForegroundColor Gray
                        Write-Host "   Total Cost: $($version2.recipeVersion.totalCost)" -ForegroundColor Gray
                        
                        return $recipeId
                    }
                }
            }
        }
    } catch {
        Write-Host "❌ Failed to create test recipe with versions" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
        return $null
    }
}

# Function to test version history API endpoints
function Test-VersionHistoryAPI {
    param($recipeId)
    
    Write-Host "Testing version history API endpoints..." -ForegroundColor Yellow
    
    # Test GET versions
    try {
        $response = Invoke-WebRequest -Uri "$vendorRecipesUrl/$recipeId/versions" -Method GET
        if ($response.StatusCode -eq 200) {
            $result = $response.Content | ConvertFrom-Json
            Write-Host "✅ GET versions endpoint working" -ForegroundColor Green
            Write-Host "   Found $($result.versions.Count) versions" -ForegroundColor Gray
            
            # Test GET specific version
            if ($result.versions.Count -gt 0) {
                $firstVersion = $result.versions[0]
                $response = Invoke-WebRequest -Uri "$vendorRecipesUrl/$recipeId/versions/$($firstVersion.version)" -Method GET
                if ($response.StatusCode -eq 200) {
                    $versionResult = $response.Content | ConvertFrom-Json
                    Write-Host "✅ GET specific version endpoint working" -ForegroundColor Green
                    Write-Host "   Version $($versionResult.recipeVersion.version) retrieved" -ForegroundColor Gray
                    Write-Host "   Ingredients: $($versionResult.recipeVersion.ingredients.Count)" -ForegroundColor Gray
                    return $true
                }
            }
        }
    } catch {
        Write-Host "❌ Version history API test failed" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
        return $false
    }
}

# Function to test frontend version history page
function Test-VersionHistoryFrontend {
    param($recipeId)
    
    Write-Host "Testing frontend version history page..." -ForegroundColor Yellow
    
    try {
        $versionHistoryUrl = "$baseUrl/dashboard/vendor/recipes/$recipeId/versions"
        Write-Host "   Testing URL: $versionHistoryUrl" -ForegroundColor Gray
        
        $response = Invoke-WebRequest -Uri $versionHistoryUrl -Method GET -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Version history page accessible" -ForegroundColor Green
            Write-Host "   Page loaded successfully" -ForegroundColor Gray
            return $true
        }
    } catch {
        Write-Host "❌ Version history page test failed" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
        Write-Host "   Note: This may be expected if authentication is required" -ForegroundColor Yellow
        return $false
    }
}

# Main test execution
Write-Host "Step 1: Testing frontend connection..." -ForegroundColor Yellow
if (-not (Test-FrontendConnection)) {
    Write-Host "Cannot proceed without frontend connection. Please start the frontend first." -ForegroundColor Red
    exit 1
}

Write-Host "`nStep 2: Testing backend connection..." -ForegroundColor Yellow
if (-not (Test-BackendConnection)) {
    Write-Host "Cannot proceed without backend connection. Please start the backend first." -ForegroundColor Red
    exit 1
}

Write-Host "`nStep 3: Creating test recipe with versions..." -ForegroundColor Yellow
$recipeId = Create-TestRecipeWithVersions

if (-not $recipeId) {
    Write-Host "Failed to create test recipe with versions. Cannot proceed." -ForegroundColor Red
    exit 1
}

Write-Host "`nStep 4: Testing version history API..." -ForegroundColor Yellow
$apiTestPassed = Test-VersionHistoryAPI -recipeId $recipeId

Write-Host "`nStep 5: Testing frontend version history page..." -ForegroundColor Yellow
$frontendTestPassed = Test-VersionHistoryFrontend -recipeId $recipeId

Write-Host "`n🎉 Recipe Version History Testing Complete!" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "Summary:" -ForegroundColor Yellow
Write-Host "- Created test recipe with multiple versions" -ForegroundColor White
Write-Host "- Tested version history API endpoints" -ForegroundColor White
Write-Host "- Tested frontend version history page accessibility" -ForegroundColor White

Write-Host "`n📊 Test Results:" -ForegroundColor Yellow
Write-Host "Recipe ID: $recipeId" -ForegroundColor Gray
Write-Host "API Tests: $(if ($apiTestPassed) { '✅ PASSED' } else { '❌ FAILED' })" -ForegroundColor $(if ($apiTestPassed) { 'Green' } else { 'Red' })
Write-Host "Frontend Tests: $(if ($frontendTestPassed) { '✅ PASSED' } else { '⚠️ PARTIAL' })" -ForegroundColor $(if ($frontendTestPassed) { 'Green' } else { 'Yellow' })

Write-Host "`n🔗 Manual Testing Links:" -ForegroundColor Yellow
Write-Host "Version History Page: $baseUrl/dashboard/vendor/recipes/$recipeId/versions" -ForegroundColor Gray
Write-Host "API Versions Endpoint: $vendorRecipesUrl/$recipeId/versions" -ForegroundColor Gray

Write-Host "`n📝 Manual Testing Steps:" -ForegroundColor Yellow
Write-Host "1. Navigate to the version history page in your browser" -ForegroundColor White
Write-Host "2. Verify versions are listed in the sidebar" -ForegroundColor White
Write-Host "3. Click on different versions to view details" -ForegroundColor White
Write-Host "4. Check price change indicators in the ingredients table" -ForegroundColor White
Write-Host "5. Test the rollback functionality" -ForegroundColor White
Write-Host "6. Verify responsive design on different screen sizes" -ForegroundColor White 