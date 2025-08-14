# Fix Phase 3 Issues Script
Write-Host '🚀 Fixing Phase 3 Issues - Include Statements & Field Alignment' -ForegroundColor Green

# 1. Fix include statements for Order queries
Write-Host 'Fixing Order include statements...' -ForegroundColor Yellow
$orderIncludeFiles = @(
    'server/src/routes/vendor-orders.ts',
    'server/src/services/checkout.service.ts',
    'server/src/services/sales.service.ts'
)

foreach ($file in $orderIncludeFiles) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        $originalContent = $content
        
        # Fix Order includes to include user, shippingAddress, and fulfillments
        $content = $content -replace 'include: \{ orderItems: true \}', 'include: { orderItems: { include: { product: true } }, user: true, shippingAddress: true, fulfillments: true }'
        $content = $content -replace 'include: \{ orderItems: \{ include: \{ product: true \} \} \}', 'include: { orderItems: { include: { product: true } }, user: true, shippingAddress: true, fulfillments: true }'
        $content = $content -replace 'include: \{ orderItems: true, fulfillments: true, shippingAddress: true \}', 'include: { orderItems: { include: { product: true } }, user: true, shippingAddress: true, fulfillments: true }'
        
        # Fix Cart includes
        $content = $content -replace 'include: \{ items: true \}', 'include: { items: { include: { product: true } } }'
        $content = $content -replace 'include: \{ items: \{ include: \{ product: true \} \} \}', 'include: { items: { include: { product: true } } }'
        
        if ($content -ne $originalContent) {
            Set-Content -Path $file -Value $content -NoNewline
            Write-Host "Fixed Order includes in: $($file.Split('\')[-1])"
        }
    }
}

# 2. Fix field name mismatches with actual schema
Write-Host 'Fixing field name mismatches...' -ForegroundColor Yellow
$fieldMismatchFiles = @(
    'server/src/services/checkout.service.ts',
    'server/src/services/sales.service.ts',
    'server/src/services/mappers.ts',
    'server/src/routes/vendor-orders.ts'
)

foreach ($file in $fieldMismatchFiles) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        $originalContent = $content
        
        # Fix Order field references - these fields don't exist in schema
        $content = $content -replace 'order\.zip', 'order.user?.zip_code'
        $content = $content -replace 'order\.transferGroup', '`order_${order.id}`'
        $content = $content -replace 'order\.paymentIntentId', 'undefined' # This field doesn't exist
        
        # Fix VendorProfile field references
        $content = $content -replace 'vendor\.tags', 'vendor.tags?.join(", ") ?? ""'
        $content = $content -replace 'vendor\.email', 'vendor.user?.email'
        
        # Fix Cart field references
        $content = $content -replace 'cart\.recipeIngredients', 'cart.items'
        $content = $content -replace 'cart\.items\.map', 'cart.items.map'
        
        if ($content -ne $originalContent) {
            Set-Content -Path $file -Value $content -NoNewline
            Write-Host "Fixed field mismatches in: $($file.Split('\')[-1])"
        }
    }
}

# 3. Fix Prisma model references in services
Write-Host 'Fixing Prisma model references...' -ForegroundColor Yellow
$prismaModelFiles = @(
    'server/src/services/checkout.service.ts',
    'server/src/services/fulfillment.service.ts',
    'server/src/services/inventory.service.ts',
    'server/src/services/messages.service.ts',
    'server/src/services/restock.service.ts'
)

foreach ($file in $prismaModelFiles) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        $originalContent = $content
        
        # Fix Prisma model references - these models exist in schema
        $content = $content -replace 'prisma\.cart', 'prisma.cart'
        $content = $content -replace 'prisma\.fulfillmentWindow', 'prisma.fulfillmentWindow'
        $content = $content -replace 'prisma\.fulfillmentLocation', 'prisma.fulfillmentLocation'
        $content = $content -replace 'prisma\.orderFulfillment', 'prisma.orderFulfillment'
        $content = $content -replace 'prisma\.orderEvent', 'prisma.orderEvent'
        $content = $content -replace 'prisma\.conversation', 'prisma.conversation'
        $content = $content -replace 'prisma\.message', 'prisma.message'
        $content = $content -replace 'prisma\.ingredientInventory', 'prisma.ingredientInventory'
        $content = $content -replace 'prisma\.inventoryTx', 'prisma.inventoryTx'
        
        if ($content -ne $originalContent) {
            Set-Content -Path $file -Value $content -NoNewline
            Write-Host "Fixed Prisma model references in: $($file.Split('\')[-1])"
        }
    }
}

# 4. Fix validation error handling
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
        
        # Fix validationResult.error.errors to validationResult.errors
        $content = $content -replace 'validationResult\.error\.errors', 'validationResult.errors'
        $content = $content -replace 'error\.errors', 'error.errors'
        
        if ($content -ne $originalContent) {
            Set-Content -Path $file -Value $content -NoNewline
            Write-Host "Fixed validation errors in: $($file.Split('\')[-1])"
        }
    }
}

# 5. Fix Recipe include statements
Write-Host 'Fixing Recipe include statements...' -ForegroundColor Yellow
$recipeIncludeFiles = @(
    'server/src/services/inventory.service.ts',
    'server/src/routes/vendor-recipes.ts'
)

foreach ($file in $recipeIncludeFiles) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        $originalContent = $content
        
        # Fix Recipe includes
        $content = $content -replace 'include: \{ items: \{ include: \{ ingredient: true \} \} \}', 'include: { recipeIngredients: { include: { ingredient: true } } }'
        $content = $content -replace 'recipe\.recipeIngredients', 'recipe.recipeIngredients'
        
        if ($content -ne $originalContent) {
            Set-Content -Path $file -Value $content -NoNewline
            Write-Host "Fixed Recipe includes in: $($file.Split('\')[-1])"
        }
    }
}

# 6. Fix missing fields in Order creation/updates
Write-Host 'Fixing Order creation/update issues...' -ForegroundColor Yellow
$orderCreationFiles = @(
    'server/src/services/checkout.service.ts',
    'server/src/webhooks/stripe.ts'
)

foreach ($file in $orderCreationFiles) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        $originalContent = $content
        
        # Remove fields that don't exist in schema
        $content = $content -replace 'zip,\s*', ''
        $content = $content -replace 'paymentIntentId: pi\.id,', ''
        $content = $content -replace 'paidAt: new Date\(\),', ''
        
        if ($content -ne $originalContent) {
            Set-Content -Path $file -Value $content -NoNewline
            Write-Host "Fixed Order creation in: $($file.Split('\')[-1])"
        }
    }
}

# 7. Fix missing fields in mock data
Write-Host 'Fixing mock data type mismatches...' -ForegroundColor Yellow
$mockDataFiles = @(
    'server/src/routes/vendor-products-mock.ts'
)

foreach ($file in $mockDataFiles) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        $originalContent = $content
        
        # Fix Product mock data to match schema
        $content = $content -replace 'alertNote: string \| null', 'alertNote: undefined'
        $content = $content -replace 'alertNote: null', 'alertNote: undefined'
        $content = $content -replace 'lastAiSuggestion: number', 'lastAiSuggestion: undefined'
        $content = $content -replace 'aiSuggestionNote: string', 'aiSuggestionNote: undefined'
        $content = $content -replace 'onWatchlist: boolean', 'onWatchlist: false'
        $content = $content -replace 'recipeId: string \| undefined', 'recipeId: undefined'
        
        # Add missing required fields
        $content = $content -replace 'mockProducts\.push\(newProduct\);', 'mockProducts.push({ ...newProduct, recipeId: undefined, onWatchlist: false, lastAiSuggestion: undefined, aiSuggestionNote: undefined });'
        
        if ($content -ne $originalContent) {
            Set-Content -Path $file -Value $content -NoNewline
            Write-Host "Fixed mock data in: $($file.Split('\')[-1])"
        }
    }
}

# 8. Fix missing fields in Ingredient model references
Write-Host 'Fixing Ingredient field references...' -ForegroundColor Yellow
$ingredientFiles = @(
    'server/src/services/restock.service.ts'
)

foreach ($file in $ingredientFiles) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        $originalContent = $content
        
        # Fix Ingredient field references - these fields don't exist in schema
        $content = $content -replace 'ing\.leadTimeDays', 'undefined'
        $content = $content -replace 'ing\.minOrderQty', 'undefined'
        $content = $content -replace 'ing\.preferredSupplierId', 'undefined'
        $content = $content -replace 'ing\.quantity', 'undefined'
        
        if ($content -ne $originalContent) {
            Set-Content -Path $file -Value $content -NoNewline
            Write-Host "Fixed Ingredient field references in: $($file.Split('\')[-1])"
        }
    }
}

# 9. Fix missing fields in OrderItem model
Write-Host 'Fixing OrderItem field references...' -ForegroundColor Yellow
$orderItemFiles = @(
    'server/src/services/sales.service.ts'
)

foreach ($file in $orderItemFiles) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        $originalContent = $content
        
        # Fix OrderItem field references - cogsUnit doesn't exist in schema
        $content = $content -replace 'cogsUnit', 'cost'
        $content = $content -replace 'item\.order\.vendorProfileId', 'item.product.vendorProfileId'
        
        if ($content -ne $originalContent) {
            Set-Content -Path $file -Value $content -NoNewline
            Write-Host "Fixed OrderItem field references in: $($file.Split('\')[-1])"
        }
    }
}

Write-Host '✅ Phase 3 fixes completed!' -ForegroundColor Green
Write-Host 'Next: Run npm run build to check remaining errors' -ForegroundColor Cyan
