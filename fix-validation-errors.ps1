# Fix validation error handling issues
Write-Host "Fixing validation error handling issues..."

# Function to fix validation errors in a file
function Fix-ValidationErrors {
    param($filePath)
    
    if (Test-Path $filePath) {
        $content = Get-Content $filePath
        $originalContent = $content -join "`n"
        
        # Fix validationResult.error.errors to validationResult.errors
        $content = $content -replace "validationResult\.error\.errors", "validationResult.errors"
        
        # Fix error.errors to error.error.errors for ZodError cases
        $content = $content -replace "error\.errors", "error.error.errors"
        
        $newContent = $content -join "`n"
        
        if ($originalContent -ne $newContent) {
            $newContent | Set-Content $filePath
            Write-Host "Fixed validation errors in $filePath"
        }
    }
}

# Files that need validation error fixes
$filesToFix = @(
    "src/routes/orders-mock.ts",
    "src/routes/orders.ts",
    "src/routes/ingredients-mock.ts",
    "src/routes/ingredients.ts",
    "src/routes/inventory-deduction.ts",
    "src/routes/recipes-mock.ts",
    "src/routes/recipes.ts",
    "src/routes/route-optimization-mock.ts",
    "src/routes/route-optimization.ts",
    "src/routes/stripe.ts",
    "src/routes/supplier-marketplace.ts",
    "src/routes/vendor-orders.ts",
    "src/routes/vendor-products-mock.ts",
    "src/routes/vendor-products.ts",
    "src/routes/vendor-recipes.ts",
    "src/routes/vendor.ts",
    "src/controllers/messages.controller.ts"
)

foreach ($file in $filesToFix) {
    Fix-ValidationErrors $file
}

Write-Host "Validation error handling fixes completed!"
