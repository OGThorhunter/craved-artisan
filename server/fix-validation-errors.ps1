# Fix validation error handling issues
Write-Host "Fixing validation error handling issues..."

# Function to fix validation error handling in a file
function Fix-ValidationErrors {
    param($filePath)
    
    if (Test-Path $filePath) {
        $content = Get-Content $filePath
        $originalContent = $content -join "`n"
        
        # Fix ZodSafeParseError patterns
        $content = $content -replace "validationResult\.errors", "validationResult.error.errors"
        $content = $content -replace "error\.errors", "error.error.errors"
        
        # Fix ZodError patterns (when not using safeParse)
        $content = $content -replace "error\.error\.errors", "error.errors"
        
        # Fix specific validation error patterns
        $content = $content -replace "details: validationResult\.errors", "details: validationResult.error.errors"
        $content = $content -replace "details: error\.errors", "details: error.error.errors"
        
        # Fix error mapping patterns
        $content = $content -replace "errors: error\.errors", "errors: error.error.errors"
        $content = $content -replace "errors: validationResult\.errors", "errors: validationResult.error.errors"
        
        $newContent = $content -join "`n"
        
        if ($originalContent -ne $newContent) {
            $newContent | Set-Content $filePath
            Write-Host "Fixed validation error handling in $filePath"
        }
    }
}

# Files that need validation error handling fixes
$filesToFix = @(
    "src/routes/vendor-orders.ts",
    "src/routes/vendor-products-mock.ts",
    "src/routes/vendor-products.ts",
    "src/routes/stripe.ts",
    "src/routes/route-optimization-mock.ts",
    "src/routes/route-optimization.ts",
    "src/routes/recipes-mock.ts",
    "src/routes/recipes.ts",
    "src/routes/vendor-recipes.ts",
    "src/routes/vendor.ts",
    "src/routes/supplier-marketplace.ts"
)

foreach ($file in $filesToFix) {
    Fix-ValidationErrors $file
}

Write-Host "Validation error handling fixes completed!"
