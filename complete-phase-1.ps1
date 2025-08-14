# Complete Phase 1 Script
Write-Host '🚀 Completing Phase 1 - Final Fixes' -ForegroundColor Green

# 1. Fix OrderStatus enum values
Write-Host 'Fixing OrderStatus enum values...' -ForegroundColor Yellow
$orderStatusFiles = @(
    'server/src/utils/stripe.ts',
    'server/src/webhooks/stripe.ts',
    'server/src/routes/vendor-orders.ts'
)

foreach ($file in $orderStatusFiles) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        $originalContent = $content
        
        # Fix OrderStatus enum values to match schema
        $content = $content -replace 'OrderStatus\.PAID', 'OrderStatus.CONFIRMED'
        $content = $content -replace "'PAID'", 'OrderStatus.CONFIRMED'
        $content = $content -replace "'paid'", 'OrderStatus.CONFIRMED'
        $content = $content -replace "'FULFILLED'", 'OrderStatus.CONFIRMED'
        
        if ($content -ne $originalContent) {
            Set-Content -Path $file -Value $content -NoNewline
            Write-Host "Fixed OrderStatus enum values in: $($file.Split('\')[-1])"
        }
    }
}

# 2. Fix missing Order fields by updating schema
Write-Host 'Adding missing Order fields to schema...' -ForegroundColor Yellow
$schemaFile = 'prisma/schema.prisma'
if (Test-Path $schemaFile) {
    $content = Get-Content $schemaFile -Raw
    $originalContent = $content
    
    # Add missing fields to Order model
    $orderModelPattern = 'model Order \{[\s\S]*?\n\}'
    $newOrderModel = @'
model Order {
  id              String   @id @default(cuid())
  userId          String   // Changed from customerId to match services
  zip             String?
  status          OrderStatus @default(PENDING)
  paymentIntentId String?  // pi_*
  transferGroup   String?  // order_<id>
  subtotal        Decimal  @db.Decimal(10, 2) @default(0)
  shippingAddressId String? // Add shipping address reference
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relations
  user         User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  orderItems   OrderItem[]
  analyticsEvents AnalyticsEvent[]
  fulfillments OrderFulfillment[]
  events       OrderEvent[]
  shippingAddress ShippingAddress? @relation(fields: [shippingAddressId], references: [id])

  @@index([userId, createdAt])
}
'@
    
    $content = $content -replace $orderModelPattern, $newOrderModel
    
    # Add ShippingAddress model
    $shippingAddressModel = @'

model ShippingAddress {
  id          String   @id @default(cuid())
  firstName   String?
  lastName    String?
  company     String?
  address1    String?
  address2    String?
  city        String?
  state       String?
  postalCode  String?
  country     String?
  phone       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  orders      Order[]

  @@index([postalCode])
}
'@
    
    # Add ShippingAddress model before the enums section
    $content = $content -replace '// Enums', "$shippingAddressModel`n`n// Enums"
    
    if ($content -ne $originalContent) {
        Set-Content -Path $schemaFile -Value $content -NoNewline
        Write-Host "Updated Order model and added ShippingAddress model"
    }
}

# 3. Fix missing Prisma model references
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
        
        # Fix model names to match schema
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
        
        if ($content -ne $originalContent) {
            Set-Content -Path $file -Value $content -NoNewline
            Write-Host "Fixed validation errors in: $($file.Split('\')[-1])"
        }
    }
}

# 5. Fix Role enum usage
Write-Host 'Fixing Role enum usage...' -ForegroundColor Yellow
$roleFiles = @(
    'server/src/routes/vendor-products-mock.ts',
    'server/src/routes/vendor-orders-mock.ts'
)

foreach ($file in $roleFiles) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        $originalContent = $content
        
        # Fix Role enum usage
        $content = $content -replace "requireRole\(\[['`"]VENDOR['`"]\]\)", "requireRole(['VENDOR'])"
        
        if ($content -ne $originalContent) {
            Set-Content -Path $file -Value $content -NoNewline
            Write-Host "Fixed Role enum usage in: $($file.Split('\')[-1])"
        }
    }
}

# 6. Fix missing imports
Write-Host 'Adding missing imports...' -ForegroundColor Yellow
$importFiles = @(
    'server/src/routes/vendor-orders.ts',
    'server/src/routes/vendor-products-mock.ts'
)

foreach ($file in $importFiles) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        $originalContent = $content
        
        # Add OrderStatus import if not present
        if ($content -notmatch 'import.*OrderStatus') {
            $content = $content -replace 'import.*from.*\.\./lib/prisma.*;', "import prisma, { OrderStatus } from '../lib/prisma';"
        }
        
        if ($content -ne $originalContent) {
            Set-Content -Path $file -Value $content -NoNewline
            Write-Host "Added missing imports in: $($file.Split('\')[-1])"
        }
    }
}

# 7. Fix null vs undefined issues
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

Write-Host '✅ Phase 1 completion fixes applied!' -ForegroundColor Green
Write-Host 'Next: Regenerate Prisma client and test build' -ForegroundColor Cyan
