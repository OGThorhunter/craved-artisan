# Fix Service Layer Issues Script
Write-Host '🔧 Fixing Service Layer Issues' -ForegroundColor Green

# 1. Fix Order field references in services
Write-Host 'Fixing Order field references...' -ForegroundColor Yellow
$orderFiles = @(
    'server/src/services/checkout.service.ts',
    'server/src/services/sales.service.ts',
    'server/src/routes/vendor-orders.ts'
)

foreach ($file in $orderFiles) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        $originalContent = $content
        
        # Fix customerId to userId
        $content = $content -replace '\.customerId', '.userId'
        $content = $content -replace 'customerId:', 'userId:'
        $content = $content -replace 'customerId,', 'userId,'
        
        # Fix order.items to order.orderItems
        $content = $content -replace 'order\.items', 'order.orderItems'
        $content = $content -replace 'include: \{ items: true \}', 'include: { orderItems: true }'
        
        # Fix cart.items to cart.cartItems
        $content = $content -replace 'cart\.items', 'cart.cartItems'
        
        # Fix recipe.items to recipe.recipeIngredients
        $content = $content -replace 'recipe\.items', 'recipe.recipeIngredients'
        $content = $content -replace 'include: \{ items: \{ include: \{ ingredient: true \} \} \}', 'include: { recipeIngredients: { include: { ingredient: true } } }'
        
        if ($content -ne $originalContent) {
            Set-Content -Path $file -Value $content -NoNewline
            Write-Host "Fixed Order field references in: $($file.Split('\')[-1])"
        }
    }
}

# 2. Fix missing Prisma model references
Write-Host 'Fixing missing Prisma model references...' -ForegroundColor Yellow
$prismaFiles = @(
    'server/src/services/fulfillment.service.ts',
    'server/src/services/inventory.service.ts',
    'server/src/services/messages.service.ts',
    'server/src/services/restock.service.ts'
)

foreach ($file in $prismaFiles) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        $originalContent = $content
        
        # Fix fulfillmentWindow to fulfillmentWindow
        $content = $content -replace 'prisma\.fulfillmentWindow', 'prisma.fulfillmentWindow'
        $content = $content -replace 'prisma\.fulfillmentLocation', 'prisma.fulfillmentLocation'
        $content = $content -replace 'prisma\.orderFulfillment', 'prisma.orderFulfillment'
        $content = $content -replace 'prisma\.orderEvent', 'prisma.orderEvent'
        $content = $content -replace 'prisma\.ingredientInventory', 'prisma.ingredientInventory'
        $content = $content -replace 'prisma\.inventoryTx', 'prisma.inventoryTx'
        $content = $content -replace 'prisma\.conversation', 'prisma.conversation'
        $content = $content -replace 'prisma\.message', 'prisma.message'
        
        if ($content -ne $originalContent) {
            Set-Content -Path $file -Value $content -NoNewline
            Write-Host "Fixed Prisma model references in: $($file.Split('\')[-1])"
        }
    }
}

# 3. Fix mappers.ts field references
Write-Host 'Fixing mappers.ts field references...' -ForegroundColor Yellow
$mappersFile = 'server/src/services/mappers.ts'
if (Test-Path $mappersFile) {
    $content = Get-Content $mappersFile -Raw
    $originalContent = $content
    
    # Fix vendor field mappings
    $content = $content -replace 'v\.tags \?\? ""', 'v.tags?.join(", ") ?? ""'
    $content = $content -replace 'v\.bio,', 'v.bio ?? undefined,'
    $content = $content -replace 'p\.bio \?\? ""', 'p.description ?? ""'
    $content = $content -replace 'p\.tags \? \[p\.tags\] : \[\]', 'p.tags'
    
    if ($content -ne $originalContent) {
        Set-Content -Path $mappersFile -Value $content -NoNewline
        Write-Host "Fixed mappers.ts field references"
    }
}

# 4. Fix enum usage in route files
Write-Host 'Fixing enum usage in route files...' -ForegroundColor Yellow
$enumRouteFiles = @(
    'server/src/routes/vendor-orders.ts',
    'server/src/routes/vendor-products-mock.ts'
)

foreach ($file in $enumRouteFiles) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        $originalContent = $content
        
        # Fix OrderStatus enum usage
        $content = $content -replace "'FULFILLED'", 'OrderStatus.PAID'
        $content = $content -replace "'pending'", 'OrderStatus.PENDING'
        $content = $content -replace "'paid'", 'OrderStatus.PAID'
        
        # Fix Role enum usage
        $content = $content -replace "'VENDOR' as Role", "'VENDOR'"
        $content = $content -replace "requireRole\(\[['`"]VENDOR['`"]\]\)", "requireRole(['VENDOR'])"
        
        if ($content -ne $originalContent) {
            Set-Content -Path $file -Value $content -NoNewline
            Write-Host "Fixed enum usage in: $($file.Split('\')[-1])"
        }
    }
}

# 5. Fix validation error handling
Write-Host 'Fixing validation error handling...' -ForegroundColor Yellow
$validationFiles = @(
    'server/src/routes/vendor-products.ts',
    'server/src/routes/vendor-recipes.ts',
    'server/src/routes/vendor.ts'
)

foreach ($file in $validationFiles) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        $originalContent = $content
        
        # Fix validationResult.error.errors to validationResult.errors
        $content = $content -replace 'validationResult\.error\.errors', 'validationResult.errors'
        
        if ($content -ne $originalContent) {
            Set-Content -Path $file -Value $content -NoNewline
            Write-Host "Fixed validation errors in: $($file.Split('\')[-1])"
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

Write-Host '✅ Service layer fixes completed!' -ForegroundColor Green
Write-Host 'Next: Run npm run build to check remaining errors' -ForegroundColor Cyan
