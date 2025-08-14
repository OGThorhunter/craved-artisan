# Fix Phase 2 Issues Script
Write-Host '🚀 Fixing Phase 2 Issues - Type Safety & Field Mismatches' -ForegroundColor Green

# 1. Fix field name mismatches in services
Write-Host 'Fixing field name mismatches...' -ForegroundColor Yellow
$fieldMismatchFiles = @(
    'server/src/services/checkout.service.ts',
    'server/src/services/fulfillment.service.ts',
    'server/src/services/inventory.service.ts',
    'server/src/services/messages.service.ts',
    'server/src/services/restock.service.ts',
    'server/src/services/sales.service.ts'
)

foreach ($file in $fieldMismatchFiles) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        $originalContent = $content
        
        # Fix Cart field references
        $content = $content -replace 'cart\.recipeIngredients', 'cart.items'
        $content = $content -replace 'cart\.items\.map', 'cart.items.map'
        
        # Fix Order field references
        $content = $content -replace 'order\.zip', 'order.zip'
        $content = $content -replace 'order\.transferGroup', 'order.transferGroup'
        $content = $content -replace 'order\.paymentIntentId', 'order.paymentIntentId'
        $content = $content -replace 'order\.fulfillments', 'order.fulfillments'
        
        # Fix Recipe field references
        $content = $content -replace 'recipe\.recipeIngredients', 'recipe.recipeIngredients'
        $content = $content -replace 'include: \{ items: \{ include: \{ ingredient: true \} \} \}', 'include: { recipeIngredients: { include: { ingredient: true } } }'
        
        # Fix VendorProfile field references
        $content = $content -replace 'vendor\.tags', 'vendor.tags'
        $content = $content -replace 'vendor\.email', 'vendor.user.email'
        
        # Fix Prisma model references
        $content = $content -replace 'prisma\.fulfillmentWindow', 'prisma.fulfillmentWindow'
        $content = $content -replace 'prisma\.fulfillmentLocation', 'prisma.fulfillmentLocation'
        $content = $content -replace 'prisma\.orderFulfillment', 'prisma.orderFulfillment'
        $content = $content -replace 'prisma\.orderEvent', 'prisma.orderEvent'
        $content = $content -replace 'prisma\.conversation', 'prisma.conversation'
        $content = $content -replace 'prisma\.message', 'prisma.message'
        
        if ($content -ne $originalContent) {
            Set-Content -Path $file -Value $content -NoNewline
            Write-Host "Fixed field mismatches in: $($file.Split('\')[-1])"
        }
    }
}

# 2. Fix include statements for related data
Write-Host 'Fixing include statements...' -ForegroundColor Yellow
$includeFiles = @(
    'server/src/routes/vendor-orders.ts',
    'server/src/services/checkout.service.ts',
    'server/src/services/inventory.service.ts'
)

foreach ($file in $includeFiles) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        $originalContent = $content
        
        # Fix Order includes
        $content = $content -replace 'include: \{ orderItems: true \}', 'include: { orderItems: true, fulfillments: true, shippingAddress: true }'
        $content = $content -replace 'include: \{ orderItems: \{ include: \{ product: true \} \} \}', 'include: { orderItems: { include: { product: true } }, fulfillments: true, shippingAddress: true }'
        
        # Fix Cart includes
        $content = $content -replace 'include: \{ items: true \}', 'include: { items: { include: { product: true } } }'
        
        # Fix Recipe includes
        $content = $content -replace 'include: \{ items: \{ include: \{ ingredient: true \} \} \}', 'include: { recipeIngredients: { include: { ingredient: true } } }'
        
        if ($content -ne $originalContent) {
            Set-Content -Path $file -Value $content -NoNewline
            Write-Host "Fixed include statements in: $($file.Split('\')[-1])"
        }
    }
}

# 3. Fix type safety issues
Write-Host 'Fixing type safety issues...' -ForegroundColor Yellow
$typeSafetyFiles = @(
    'server/src/routes/vendor-orders.ts',
    'server/src/routes/vendor-products.ts',
    'server/src/routes/vendor-recipes.ts',
    'server/src/routes/vendor.ts',
    'server/src/services/checkout.service.ts',
    'server/src/services/fulfillment.service.ts',
    'server/src/services/inventory.service.ts',
    'server/src/services/restock.service.ts'
)

foreach ($file in $typeSafetyFiles) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        $originalContent = $content
        
        # Fix implicit any types
        $content = $content -replace 'map\(item => \(', 'map((item: any) => ('
        $content = $content -replace 'map\(i => \(', 'map((i: any) => ('
        $content = $content -replace 'map\(a => \(', 'map((a: any) => ('
        $content = $content -replace 'map\(l => \(', 'map((l: any) => ('
        $content = $content -replace 'map\(r => \(', 'map((r: any) => ('
        $content = $content -replace 'map\(err => \(', 'map((err: any) => ('
        
        # Fix null vs undefined
        $content = $content -replace ': null', ': undefined'
        $content = $content -replace 'null \|\|', 'undefined ||'
        $content = $content -replace 'string \| null', 'string | undefined'
        $content = $content -replace 'number \| null', 'number | undefined'
        
        # Fix validation error handling
        $content = $content -replace 'validationResult\.error\.errors', 'validationResult.errors'
        $content = $content -replace 'error\.errors', 'error.errors'
        
        if ($content -ne $originalContent) {
            Set-Content -Path $file -Value $content -NoNewline
            Write-Host "Fixed type safety in: $($file.Split('\')[-1])"
        }
    }
}

# 4. Fix enum usage
Write-Host 'Fixing enum usage...' -ForegroundColor Yellow
$enumFiles = @(
    'server/src/routes/vendor-products-mock.ts',
    'server/src/routes/vendor-orders.ts',
    'server/src/utils/taxProjection.ts',
    'server/src/utils/walletService.ts'
)

foreach ($file in $enumFiles) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        $originalContent = $content
        
        # Fix Role enum usage
        $content = $content -replace "requireRole\(\[['`"]VENDOR['`"]\]\)", "requireRole(['VENDOR'])"
        $content = $content -replace "'VENDOR' as Role", "'VENDOR'"
        
        # Fix TaxAlertType enum usage
        $content = $content -replace 'alertType: "overdue"', 'alertType: TaxAlertType.OVERDUE'
        $content = $content -replace 'alertType: "reminder"', 'alertType: TaxAlertType.REMINDER'
        $content = $content -replace 'alertType: "payment_confirmed"', 'alertType: TaxAlertType.PAYMENT_CONFIRMED'
        
        # Fix WalletTransactionType enum usage
        $content = $content -replace 'type: "debit"', 'type: WalletTransactionType.DEBIT'
        $content = $content -replace 'type: "credit"', 'type: WalletTransactionType.CREDIT'
        
        if ($content -ne $originalContent) {
            Set-Content -Path $file -Value $content -NoNewline
            Write-Host "Fixed enum usage in: $($file.Split('\')[-1])"
        }
    }
}

# 5. Fix missing imports
Write-Host 'Adding missing imports...' -ForegroundColor Yellow
$importFiles = @(
    'server/src/routes/vendor-orders.ts',
    'server/src/routes/vendor-products-mock.ts',
    'server/src/utils/taxProjection.ts',
    'server/src/utils/walletService.ts'
)

foreach ($file in $importFiles) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        $originalContent = $content
        
        # Add missing enum imports
        if ($content -notmatch 'import.*OrderStatus') {
            $content = $content -replace 'import.*from.*\.\./lib/prisma.*;', "import prisma, { OrderStatus, TaxAlertType, WalletTransactionType } from '../lib/prisma';"
        }
        
        if ($content -ne $originalContent) {
            Set-Content -Path $file -Value $content -NoNewline
            Write-Host "Added missing imports in: $($file.Split('\')[-1])"
        }
    }
}

# 6. Fix validation error handling
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
        
        if ($content -ne $originalContent) {
            Set-Content -Path $file -Value $content -NoNewline
            Write-Host "Fixed validation errors in: $($file.Split('\')[-1])"
        }
    }
}

# 7. Fix missing fields in mock data
Write-Host 'Fixing mock data field mismatches...' -ForegroundColor Yellow
$mockFiles = @(
    'server/src/routes/vendor-products-mock.ts'
)

foreach ($file in $mockFiles) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        $originalContent = $content
        
        # Fix Product mock data
        $content = $content -replace 'alertNote: string \| null', 'alertNote: string | undefined'
        $content = $content -replace 'alertNote: null', 'alertNote: undefined'
        $content = $content -replace 'lastAiSuggestion: number', 'lastAiSuggestion: new Date()'
        $content = $content -replace 'aiSuggestionNote: string', 'aiSuggestionNote: undefined'
        $content = $content -replace 'onWatchlist: boolean', 'onWatchlist: false'
        $content = $content -replace 'recipeId: string \| undefined', 'recipeId: undefined'
        
        if ($content -ne $originalContent) {
            Set-Content -Path $file -Value $content -NoNewline
            Write-Host "Fixed mock data in: $($file.Split('\')[-1])"
        }
    }
}

Write-Host '✅ Phase 2 fixes completed!' -ForegroundColor Green
Write-Host 'Next: Run npm run build to check remaining errors' -ForegroundColor Cyan
