# Fix duplicate return statements
Write-Host "Fixing duplicate return statements..."

# Function to fix duplicate returns in a file
function Fix-DuplicateReturns {
    param($filePath)
    
    if (Test-Path $filePath) {
        $content = Get-Content $filePath
        $originalContent = $content -join "`n"
        
        # Fix duplicate return statements
        $content = $content -replace "return return return", "return"
        $content = $content -replace "return return", "return"
        
        $newContent = $content -join "`n"
        
        if ($originalContent -ne $newContent) {
            $newContent | Set-Content $filePath
            Write-Host "Fixed duplicate returns in $filePath"
        }
    }
}

# Files that need duplicate return fixes
$filesToFix = @(
    "src/controllers/messages.controller.ts",
    "src/routes/financial-mock.ts",
    "src/routes/financial.ts",
    "src/routes/ingredients-mock.ts",
    "src/routes/ingredients.ts",
    "src/routes/inventory-deduction.ts",
    "src/routes/recipes-mock.ts",
    "src/routes/recipes.ts",
    "src/routes/stripe.ts",
    "src/routes/supplier-marketplace.ts",
    "src/routes/vendor-products-mock.ts",
    "src/routes/vendor-products.ts",
    "src/routes/vendor-recipes.ts"
)

foreach ($file in $filesToFix) {
    Fix-DuplicateReturns $file
}

Write-Host "Duplicate return statement fixes completed!"
