# Fix Role enum usage issues
Write-Host "Fixing Role enum usage issues..."

# Function to fix Role enum usage in a file
function Fix-RoleEnumUsage {
    param($filePath)
    
    if (Test-Path $filePath) {
        $content = Get-Content $filePath
        $originalContent = $content -join "`n"
        
        # Fix Role enum string literal usage
        $content = $content -replace "'VENDOR'", "Role.VENDOR"
        $content = $content -replace "'CUSTOMER'", "Role.CUSTOMER"
        $content = $content -replace "'ADMIN'", "Role.ADMIN"
        $content = $content -replace "'VENDOR'", "Role.VENDOR"
        $content = $content -replace "'CUSTOMER'", "Role.CUSTOMER"
        $content = $content -replace "'ADMIN'", "Role.ADMIN"
        
        # Fix Role enum comparison patterns
        $content = $content -replace "=== 'VENDOR'", "=== Role.VENDOR"
        $content = $content -replace "=== 'CUSTOMER'", "=== Role.CUSTOMER"
        $content = $content -replace "=== 'ADMIN'", "=== Role.ADMIN"
        $content = $content -replace "!== 'VENDOR'", "!== Role.VENDOR"
        $content = $content -replace "!== 'CUSTOMER'", "!== Role.CUSTOMER"
        $content = $content -replace "!== 'ADMIN'", "!== Role.ADMIN"
        
        # Fix Role enum array patterns
        $content = $content -replace "\[Role\.VENDOR\]", "[Role.VENDOR]"
        $content = $content -replace "\[Role\.CUSTOMER\]", "[Role.CUSTOMER]"
        $content = $content -replace "\[Role\.ADMIN\]", "[Role.ADMIN]"
        
        # Fix Role enum assignment patterns
        $content = $content -replace "role: 'VENDOR'", "role: Role.VENDOR"
        $content = $content -replace "role: 'CUSTOMER'", "role: Role.CUSTOMER"
        $content = $content -replace "role: 'ADMIN'", "role: Role.ADMIN"
        
        # Fix Role enum type patterns
        $content = $content -replace "Role\.VENDOR", "Role.VENDOR"
        $content = $content -replace "Role\.CUSTOMER", "Role.CUSTOMER"
        $content = $content -replace "Role\.ADMIN", "Role.ADMIN"
        
        $newContent = $content -join "`n"
        
        if ($originalContent -ne $newContent) {
            $newContent | Set-Content $filePath
            Write-Host "Fixed Role enum usage in $filePath"
        }
    }
}

# Files that need Role enum usage fixes
$filesToFix = @(
    "src/routes/vendor-mock.ts",
    "src/routes/vendor-products-mock.ts",
    "src/routes/vendor-orders-mock.ts",
    "src/routes/vendor-orders.ts",
    "src/routes/vendor-products.ts",
    "src/routes/vendor-recipes.ts",
    "src/routes/vendor.ts",
    "src/routes/vendor.routes.ts",
    "src/middleware/auth.ts",
    "src/middleware/auth-mock.ts",
    "src/controllers/vendor.controller.ts",
    "src/controllers/vendor-payouts.ts"
)

foreach ($file in $filesToFix) {
    Fix-RoleEnumUsage $file
}

Write-Host "Role enum usage fixes completed!"
