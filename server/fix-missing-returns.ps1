# Fix missing return statements in middleware and route handlers
Write-Host "Fixing missing return statements..."

# Function to fix missing returns in a file
function Fix-MissingReturns {
    param($filePath)
    
    if (Test-Path $filePath) {
        $content = Get-Content $filePath
        $originalContent = $content -join "`n"
        
        # Fix middleware functions that don't return
        # Pattern: function name(...) { ... res.status(...).json(...) }
        # Add return before res.status calls in middleware
        
        # Fix route handlers that don't return
        # Pattern: app.get/post/put/delete(..., (req, res) => { ... res.json(...) })
        # Add return before res.json calls
        
        # Common patterns to fix
        $content = $content -replace "(\s+)(res\.status\(\d+\)\.json\([^)]*\));", "`$1return `$2;"
        $content = $content -replace "(\s+)(res\.json\([^)]*\));", "`$1return `$2;"
        $content = $content -replace "(\s+)(res\.send\([^)]*\));", "`$1return `$2;"
        $content = $content -replace "(\s+)(res\.status\(\d+\)\.send\([^)]*\));", "`$1return `$2;"
        
        # Fix next() calls in middleware
        $content = $content -replace "(\s+)(next\(\));", "`$1return `$2;"
        
        # Fix error responses
        $content = $content -replace "(\s+)(res\.status\(\d+\)\.json\(\{[^}]*error[^}]*\}\));", "`$1return `$2;"
        
        $newContent = $content -join "`n"
        
        if ($originalContent -ne $newContent) {
            $newContent | Set-Content $filePath
            Write-Host "Fixed missing returns in $filePath"
        }
    }
}

# Files that need missing return fixes
$filesToFix = @(
    "src/routes/orders.ts",
    "src/routes/orders-mock.ts",
    "src/routes/vendor-orders.ts",
    "src/routes/vendor-products.ts",
    "src/routes/vendor-products-mock.ts",
    "src/routes/vendor-recipes.ts",
    "src/routes/recipes.ts",
    "src/routes/recipes-mock.ts",
    "src/routes/ingredients.ts",
    "src/routes/ingredients-mock.ts",
    "src/routes/inventory-deduction.ts",
    "src/routes/stripe.ts",
    "src/routes/stripe-controller.ts",
    "src/routes/supplier-marketplace.ts",
    "src/routes/route-optimization.ts",
    "src/routes/route-optimization-mock.ts",
    "src/routes/tax-reports.ts",
    "src/routes/payout-reports.ts",
    "src/routes/margin-management.ts",
    "src/routes/financial.ts",
    "src/routes/financial-mock.ts",
    "src/routes/analytics.ts",
    "src/routes/ai-validation.ts",
    "src/middleware/auth.ts",
    "src/middleware/auth-mock.ts",
    "src/controllers/messages.controller.ts"
)

foreach ($file in $filesToFix) {
    Fix-MissingReturns $file
}

Write-Host "Missing return statement fixes completed!"
