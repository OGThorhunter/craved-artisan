# Fix comprehensive Role enum usage issues
Write-Host "Fixing comprehensive Role enum usage issues..."

# Function to add Role import if not present
function Add-RoleImport {
    param($filePath)
    
    $content = Get-Content $filePath
    if ($content -notmatch "import.*Role.*from") {
        # Add Role import after existing imports
        $importIndex = -1
        for ($i = 0; $i -lt $content.Length; $i++) {
            if ($content[$i] -match "^import.*from") {
                $importIndex = $i
            }
        }
        
        if ($importIndex -ge 0) {
            $newContent = @()
            $newContent += $content[0..$importIndex]
            $newContent += "import { Role } from '../lib/prisma';"
            $newContent += $content[($importIndex + 1)..($content.Length - 1)]
            $newContent | Set-Content $filePath
            Write-Host "Added Role import to $filePath"
        }
    }
}

# Fix orders.ts - replace string literals with Role enum
$ordersContent = Get-Content "src/routes/orders.ts"
$ordersContent = $ordersContent -replace "requireRole\(\['CUSTOMER'\]\)", "requireRole([Role.CUSTOMER])"
$ordersContent = $ordersContent -replace "requireRole\(\['VENDOR', 'ADMIN'\]\)", "requireRole([Role.VENDOR, Role.ADMIN])"
$ordersContent | Set-Content "src/routes/orders.ts"
Add-RoleImport "src/routes/orders.ts"

# Fix orders-mock.ts - already using Role enum correctly, just need import
Add-RoleImport "src/routes/orders-mock.ts"

# Fix vendor-mock.ts - already using Role enum correctly, just need import
Add-RoleImport "src/routes/vendor-mock.ts"

# Fix vendor-products-mock.ts - already using Role enum correctly, just need import
Add-RoleImport "src/routes/vendor-products-mock.ts"

# Fix other files that might have Role enum usage
$filesWithRoleUsage = @(
    "src/routes/ai-validation.ts",
    "src/routes/analytics.ts", 
    "src/routes/financial.ts",
    "src/routes/financial-mock.ts",
    "src/routes/ingredients.ts",
    "src/routes/margin-management.ts",
    "src/routes/protected-demo.ts",
    "src/routes/payout-reports.ts",
    "src/routes/recipes.ts",
    "src/routes/stripe-controller.ts",
    "src/routes/stripe.ts",
    "src/routes/tax-reports.ts",
    "src/routes/vendor-orders.ts",
    "src/routes/vendor-payouts.ts",
    "src/routes/vendor-orders-mock.ts",
    "src/routes/vendor-products.ts"
)

foreach ($file in $filesWithRoleUsage) {
    if (Test-Path $file) {
        $content = Get-Content $file
        $content = $content -replace "requireRole\(\['CUSTOMER'\]\)", "requireRole([Role.CUSTOMER])"
        $content = $content -replace "requireRole\(\['VENDOR'\]\)", "requireRole([Role.VENDOR])"
        $content = $content -replace "requireRole\(\['ADMIN'\]\)", "requireRole([Role.ADMIN])"
        $content = $content -replace "requireRole\(\['VENDOR', 'ADMIN'\]\)", "requireRole([Role.VENDOR, Role.ADMIN])"
        $content | Set-Content $file
        Add-RoleImport $file
        Write-Host "Fixed Role enum usage in $file"
    }
}

Write-Host "Comprehensive Role enum usage fixes completed!"
