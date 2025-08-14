# Fix Schema Mismatches Script
Write-Host '🔧 Fixing Schema Mismatches' -ForegroundColor Green

# 1. Fix remaining Prisma import
Write-Host 'Fixing remaining Prisma import...' -ForegroundColor Yellow
$vendorOrdersFile = 'server/src/routes/vendor-orders.ts'
if (Test-Path $vendorOrdersFile) {
    $content = Get-Content $vendorOrdersFile -Raw
    $content = $content -replace "import prisma from '/prisma';", "import prisma from '../lib/prisma';"
    Set-Content -Path $vendorOrdersFile -Value $content -NoNewline
    Write-Host 'Fixed Prisma import in vendor-orders.ts'
}

# 2. Fix field name mismatches in services
Write-Host 'Fixing field name mismatches...' -ForegroundColor Yellow

# Fix vendor field mappings
$files = @(
    'server/src/services/mappers.ts',
    'server/src/services/checkout.service.ts',
    'server/src/services/fulfillment.service.ts',
    'server/src/services/inventory.service.ts',
    'server/src/services/messages.service.ts',
    'server/src/services/restock.service.ts',
    'server/src/services/sales.service.ts'
)

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        $originalContent = $content
        
        # Fix vendor field mappings
        $content = $content -replace '\.business_name', '.storeName'
        $content = $content -replace '\.description', '.bio'
        $content = $content -replace '\.vendor_id', '.vendorProfileId'
        $content = $content -replace '\.category', '.tags'
        $content = $content -replace '\.stock_quantity', '.stock'
        $content = $content -replace '\.items', '.recipeIngredients'
        $content = $content -replace '\.yieldQty', '.yield'
        $content = $content -replace '\.subtotal', '.total'
        $content = $content -replace '\.total', '.subtotal'
        
        # Fix vendorId to vendorProfileId
        $content = $content -replace '\bvendorId\b', 'vendorProfileId'
        
        # Fix enum values
        $content = $content -replace '"pending"', 'OrderStatus.PENDING'
        $content = $content -replace '"paid"', 'OrderStatus.PAID'
        $content = $content -replace '"PAID"', 'OrderStatus.PAID'
        
        if ($content -ne $originalContent) {
            Set-Content -Path $file -Value $content -NoNewline
            Write-Host "Fixed field mappings in: $($file.Split('\')[-1])"
        }
    }
}

# 3. Fix validation error handling
Write-Host 'Fixing validation error handling...' -ForegroundColor Yellow
$validationFiles = @(
    'server/src/routes/vendor-products.ts',
    'server/src/routes/vendor-recipes.ts',
    'server/src/routes/vendor.ts',
    'server/src/routes/vendor-orders.ts',
    'server/src/routes/vendor-products-mock.ts'
)

foreach ($file in $validationFiles) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        $originalContent = $content
        
        # Fix validationResult.errors to validationResult.error.errors
        $content = $content -replace 'validationResult\.errors', 'validationResult.error.errors'
        
        if ($content -ne $originalContent) {
            Set-Content -Path $file -Value $content -NoNewline
            Write-Host "Fixed validation errors in: $($file.Split('\')[-1])"
        }
    }
}

# 4. Fix enum type issues
Write-Host 'Fixing enum type issues...' -ForegroundColor Yellow
$enumFiles = @(
    'server/src/routes/vendor-orders-mock.ts',
    'server/src/routes/vendor-products-mock.ts',
    'server/src/utils/stripe.ts',
    'server/src/webhooks/stripe.ts'
)

foreach ($file in $enumFiles) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        $originalContent = $content
        
        # Fix Role enum usage
        $content = $content -replace "requireRole\(\[['`"]VENDOR['`"]\]\)", "requireRole(['VENDOR' as Role])"
        
        # Fix OrderStatus enum usage
        $content = $content -replace "'paid'", 'OrderStatus.PAID'
        $content = $content -replace "'PAID'", 'OrderStatus.PAID'
        
        if ($content -ne $originalContent) {
            Set-Content -Path $file -Value $content -NoNewline
            Write-Host "Fixed enum types in: $($file.Split('\')[-1])"
        }
    }
}

# 5. Add missing imports for enums
Write-Host 'Adding enum imports...' -ForegroundColor Yellow
$filesWithEnums = @(
    'server/src/routes/vendor-orders-mock.ts',
    'server/src/routes/vendor-products-mock.ts',
    'server/src/utils/stripe.ts',
    'server/src/webhooks/stripe.ts',
    'server/src/services/checkout.service.ts'
)

foreach ($file in $filesWithEnums) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        $originalContent = $content
        
        # Add enum imports if not present
        if ($content -notmatch 'import.*OrderStatus') {
            $content = $content -replace 'import.*from.*\.\./lib/prisma.*;', "import prisma, { OrderStatus, Role } from '../lib/prisma';"
        }
        
        if ($content -ne $originalContent) {
            Set-Content -Path $file -Value $content -NoNewline
            Write-Host "Added enum imports in: $($file.Split('\')[-1])"
        }
    }
}

# 6. Fix null vs undefined issues
Write-Host 'Fixing null vs undefined issues...' -ForegroundColor Yellow
$nullFiles = @(
    'server/src/routes/vendor-products.ts',
    'server/src/utils/walletService.ts'
)

foreach ($file in $nullFiles) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        $originalContent = $content
        
        # Fix null to undefined conversions
        $content = $content -replace ': null', ': undefined'
        $content = $content -replace 'null \|\|', 'undefined ||'
        
        if ($content -ne $originalContent) {
            Set-Content -Path $file -Value $content -NoNewline
            Write-Host "Fixed null/undefined in: $($file.Split('\')[-1])"
        }
    }
}

Write-Host '✅ Schema mismatch fixes completed!' -ForegroundColor Green
Write-Host 'Next: Run npm run build to check remaining errors' -ForegroundColor Cyan
