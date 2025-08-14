# Fix validation error handling issues - corrected version
Write-Host "Fixing validation error handling issues (corrected)..."

# Function to fix validation errors in a file
function Fix-ValidationErrors {
    param($filePath)
    
    if (Test-Path $filePath) {
        $content = Get-Content $filePath
        $originalContent = $content -join "`n"
        
        # Fix the incorrect patterns that were created
        $content = $content -replace "error\.error\.errors", "error.errors"
        
        # Fix validationResult.error.errors to validationResult.error.errors (keep as is for ZodSafeParseError)
        # The issue is that some files use ZodError and others use ZodSafeParseError
        # For ZodSafeParseError, we need validationResult.error.errors
        # For ZodError, we need error.errors
        
        $newContent = $content -join "`n"
        
        if ($originalContent -ne $newContent) {
            $newContent | Set-Content $filePath
            Write-Host "Fixed validation errors in $filePath"
        }
    }
}

# Files that need validation error fixes
$filesToFix = @(
    "src/routes/ingredients.ts",
    "src/routes/inventory-deduction.ts",
    "src/routes/recipes-mock.ts",
    "src/routes/recipes.ts",
    "src/routes/supplier-marketplace.ts",
    "src/routes/vendor-recipes.ts",
    "src/routes/vendor.ts"
)

foreach ($file in $filesToFix) {
    Fix-ValidationErrors $file
}

Write-Host "Validation error handling fixes (corrected) completed!"
