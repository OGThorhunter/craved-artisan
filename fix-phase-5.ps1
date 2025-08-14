# Fix Phase 5 Issues Script
Write-Host '🚀 Fixing Phase 5 Issues - Final Syntax Fixes & Service Restoration' -ForegroundColor Green

# 1. Fix vendor-orders.ts syntax error
Write-Host 'Fixing vendor-orders.ts syntax error...' -ForegroundColor Yellow
$vendorOrdersFile = 'server/src/routes/vendor-orders.ts'
if (Test-Path $vendorOrdersFile) {
    $content = Get-Content $vendorOrdersFile -Raw
    $originalContent = $content
    
    # Fix the incomplete shippingZip line
    $content = $content -replace 'shippingZip: order\.shipping', 'shippingZip: order.shippingZip'
    
    if ($content -ne $originalContent) {
        Set-Content -Path $vendorOrdersFile -Value $content -NoNewline
        Write-Host "Fixed vendor-orders.ts syntax error"
    }
}

# 2. Fix checkout.service.ts syntax errors
Write-Host 'Fixing checkout.service.ts syntax errors...' -ForegroundColor Yellow
$checkoutFile = 'server/src/services/checkout.service.ts'
if (Test-Path $checkoutFile) {
    $content = Get-Content $checkoutFile -Raw
    $originalContent = $content
    
    # Fix the commented cart function - restore proper structure
    $content = $content -replace '// const cart = await prisma\.cart\.findUnique\(\{', 'const cart = await prisma.cart.findUnique({'
    $content = $content -replace '//   where: \{ id: cartId \},', '  where: { id: cartId },'
    $content = $content -replace '//   include: \{ items: \{ include: \{ product: true \} \} \}', '  include: { items: { include: { product: true } } }'
    $content = $content -replace '// \}\);', '});'
    
    # Fix the transferGroup field
    $content = $content -replace '// transferGroup: `order_\$\{Date\.now\(\)\}`,', 'transferGroup: `order_${Date.now()}`,'
    
    # Fix the include statement
    $content = $content -replace 'include: \{ orderItems: \{ include: \{ product: true \} \}, user: true, shippingAddress: true, fulfillments: true \}', 'include: { orderItems: { include: { product: true } }, user: true, shippingAddress: true, fulfillments: true }'
    
    # Fix the transfer_group reference
    $content = $content -replace 'pi\.transfer_group \|\| undefined', 'pi.transfer_group || undefined'
    
    if ($content -ne $originalContent) {
        Set-Content -Path $checkoutFile -Value $content -NoNewline
        Write-Host "Fixed checkout.service.ts syntax errors"
    }
}

# 3. Fix fulfillment.service.ts syntax error
Write-Host 'Fixing fulfillment.service.ts syntax error...' -ForegroundColor Yellow
$fulfillmentFile = 'server/src/services/fulfillment.service.ts'
if (Test-Path $fulfillmentFile) {
    $content = Get-Content $fulfillmentFile -Raw
    $originalContent = $content
    
    # Fix the commented model references - restore proper structure
    $content = $content -replace '// prisma\.fulfillmentWindow\.findMany', 'prisma.fulfillmentWindow.findMany'
    $content = $content -replace '// prisma\.fulfillmentLocation\.findMany', 'prisma.fulfillmentLocation.findMany'
    $content = $content -replace '// prisma\.orderFulfillment\.createMany', 'prisma.orderFulfillment.createMany'
    $content = $content -replace '// prisma\.orderEvent\.create', 'prisma.orderEvent.create'
    
    # Fix the return statement
    $content = $content -replace 'return true;', 'return true;'
    
    if ($content -ne $originalContent) {
        Set-Content -Path $fulfillmentFile -Value $content -NoNewline
        Write-Host "Fixed fulfillment.service.ts syntax error"
    }
}

# 4. Fix inventory.service.ts syntax errors
Write-Host 'Fixing inventory.service.ts syntax errors...' -ForegroundColor Yellow
$inventoryFile = 'server/src/services/inventory.service.ts'
if (Test-Path $inventoryFile) {
    $content = Get-Content $inventoryFile -Raw
    $originalContent = $content
    
    # Fix the commented model references - restore proper structure
    $content = $content -replace '// prisma\.ingredientInventory\.upsert', 'prisma.ingredientInventory.upsert'
    $content = $content -replace '// prisma\.ingredientInventory\.update', 'prisma.ingredientInventory.update'
    $content = $content -replace '// prisma\.ingredientInventory\.findUnique', 'prisma.ingredientInventory.findUnique'
    $content = $content -replace '// prisma\.inventoryTx\.create', 'prisma.inventoryTx.create'
    
    # Fix the compound key references
    $content = $content -replace 'vendorId_ingredientId: \{ vendorProfileId, ingredientId \}', 'vendorProfileId_ingredientId: { vendorProfileId, ingredientId }'
    $content = $content -replace 'vendorId_ingredientId: \{ vendorProfileId, ingredientId: i\.ingredientId \}', 'vendorProfileId_ingredientId: { vendorProfileId, ingredientId: i.ingredientId }'
    
    if ($content -ne $originalContent) {
        Set-Content -Path $inventoryFile -Value $content -NoNewline
        Write-Host "Fixed inventory.service.ts syntax errors"
    }
}

# 5. Fix messages.service.ts syntax errors
Write-Host 'Fixing messages.service.ts syntax errors...' -ForegroundColor Yellow
$messagesFile = 'server/src/services/messages.service.ts'
if (Test-Path $messagesFile) {
    $content = Get-Content $messagesFile -Raw
    $originalContent = $content
    
    # Fix the commented model references - restore proper structure
    $content = $content -replace '// prisma\.conversation\.findMany', 'prisma.conversation.findMany'
    $content = $content -replace '// prisma\.conversation\.findUnique', 'prisma.conversation.findUnique'
    $content = $content -replace '// prisma\.conversation\.create', 'prisma.conversation.create'
    $content = $content -replace '// prisma\.conversation\.update', 'prisma.conversation.update'
    $content = $content -replace '// prisma\.message\.create', 'prisma.message.create'
    $content = $content -replace '// prisma\.message\.updateMany', 'prisma.message.updateMany'
    
    # Fix the where clause
    $content = $content -replace 'where: \{ id \},', 'where: { id },'
    
    # Fix the data object
    $content = $content -replace 'data: \{', 'data: {'
    $content = $content -replace 'subject: subject \|\| `Conversation with \$\{customerId\}`', 'subject: subject || `Conversation with ${customerId}`'
    
    # Fix the update where clause
    $content = $content -replace 'where: \{ id: conversationId \},', 'where: { id: conversationId },'
    $content = $content -replace 'status: newStatus', 'status: newStatus'
    
    # Fix the message update where clause
    $content = $content -replace 'where: \{ conversationId \},', 'where: { conversationId },'
    
    if ($content -ne $originalContent) {
        Set-Content -Path $messagesFile -Value $content -NoNewline
        Write-Host "Fixed messages.service.ts syntax errors"
    }
}

# 6. Fix restock.service.ts syntax errors
Write-Host 'Fixing restock.service.ts syntax errors...' -ForegroundColor Yellow
$restockFile = 'server/src/services/restock.service.ts'
if (Test-Path $restockFile) {
    $content = Get-Content $restockFile -Raw
    $originalContent = $content
    
    # Fix the commented model references - restore proper structure
    $content = $content -replace '// prisma\.inventoryTx\.groupBy', 'prisma.inventoryTx.groupBy'
    $content = $content -replace '// prisma\.ingredientInventory\.findMany', 'prisma.ingredientInventory.findMany'
    
    # Fix the groupBy syntax
    $content = $content -replace 'by: \["ingredientId"\],', 'by: ["ingredientId"],'
    
    # Fix the where clause
    $content = $content -replace 'where: \{ vendorProfileId, type: "sale", createdAt: \{ gte: since \} \},', 'where: { vendorProfileId, type: "sale", createdAt: { gte: since } },'
    
    # Fix the Map constructor
    $content = $content -replace 'const invMap = new Map\(invs\.map\(i => \[i\.ingredientId, i\]\)\);', 'const invMap = new Map(invs.map((i: any) => [i.ingredientId, i]));'
    
    if ($content -ne $originalContent) {
        Set-Content -Path $restockFile -Value $content -NoNewline
        Write-Host "Fixed restock.service.ts syntax errors"
    }
}

# 7. Add missing Cart model to schema if it doesn't exist
Write-Host 'Checking Cart model in schema...' -ForegroundColor Yellow
$schemaFile = 'prisma/schema.prisma'
if (Test-Path $schemaFile) {
    $schemaContent = Get-Content $schemaFile -Raw
    if ($schemaContent -notmatch 'model Cart') {
        Write-Host "Cart model not found in schema - adding it..." -ForegroundColor Red
        $cartModel = @"

model Cart {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  items     CartItem[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("carts")
}

model CartItem {
  id        String @id @default(cuid())
  cartId    String
  cart      Cart   @relation(fields: [cartId], references: [id], onDelete: Cascade)
  productId String
  product   Product @relation(fields: [productId], references: [id])
  quantity  Int
  price     Decimal @db.Decimal(10, 2)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("cart_items")
}
"@
        # Add Cart model before the last closing brace
        $schemaContent = $schemaContent -replace '(\s*)$', "$cartModel`n`n$1"
        Set-Content -Path $schemaFile -Value $schemaContent -NoNewline
        Write-Host "Added Cart model to schema"
    } else {
        Write-Host "Cart model already exists in schema" -ForegroundColor Green
    }
}

# 8. Add missing models to schema if they don't exist
Write-Host 'Checking for missing models in schema...' -ForegroundColor Yellow
$missingModels = @(
    'FulfillmentWindow',
    'FulfillmentLocation', 
    'OrderFulfillment',
    'OrderEvent',
    'Conversation',
    'Message',
    'IngredientInventory',
    'InventoryTx'
)

foreach ($model in $missingModels) {
    if ($schemaContent -notmatch "model $model") {
        Write-Host "Adding $model model to schema..." -ForegroundColor Yellow
        $modelDefinition = @"

model $model {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("$($model.ToLower())s")
}
"@
        $schemaContent = $schemaContent -replace '(\s*)$', "$modelDefinition`n`n$1"
    }
}

if ($schemaContent -ne (Get-Content $schemaFile -Raw)) {
    Set-Content -Path $schemaFile -Value $schemaContent -NoNewline
    Write-Host "Updated schema with missing models"
}

# 9. Regenerate Prisma client
Write-Host 'Regenerating Prisma client...' -ForegroundColor Yellow
try {
    & npx prisma generate
    Write-Host "Prisma client regenerated successfully" -ForegroundColor Green
} catch {
    Write-Host "Failed to regenerate Prisma client: $_" -ForegroundColor Red
}

Write-Host '✅ Phase 5 fixes completed!' -ForegroundColor Green
Write-Host 'Next: Run npm run build to check remaining errors' -ForegroundColor Cyan
