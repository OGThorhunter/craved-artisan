# Fix missing Order model includes
Write-Host "Fixing missing Order model includes..."

# Function to fix missing Order model includes in a file
function Fix-MissingOrderIncludes {
    param($filePath)
    
    if (Test-Path $filePath) {
        $content = Get-Content $filePath
        $originalContent = $content -join "`n"
        
        # Fix missing includes for Order model
        $content = $content -replace "include: \{", "include: {"
        $content = $content -replace "user: true", "user: { select: { id: true, email: true, profile: { select: { firstName: true, lastName: true, phone: true } } } }"
        $content = $content -replace "vendor: true", "vendor: { select: { id: true, storeName: true, email: true } }"
        $content = $content -replace "shippingAddress: true", "shippingAddress: { select: { id: true, address1: true, address2: true, city: true, state: true, postalCode: true, country: true, phone: true, firstName: true, lastName: true, company: true } }"
        $content = $content -replace "orderItems: true", "orderItems: { select: { id: true, quantity: true, price: true, product: { select: { id: true, name: true, description: true, imageUrl: true } } } }"
        $content = $content -replace "fulfillments: true", "fulfillments: { select: { id: true, status: true, trackingNumber: true, carrier: true, estimatedDelivery: true, actualDelivery: true, notes: true } }"
        
        # Fix missing field access patterns
        $content = $content -replace "order\.user\.", "order.user."
        $content = $content -replace "order\.vendor\.", "order.vendor."
        $content = $content -replace "order\.shippingAddress\.", "order.shippingAddress."
        $content = $content -replace "order\.orderItems\.", "order.orderItems."
        $content = $content -replace "order\.fulfillments\.", "order.fulfillments."
        
        # Fix missing field names in includes
        $content = $content -replace "orderorderItems", "orderItems"
        $content = $content -replace "orderorderItems:", "orderItems:"
        $content = $content -replace "orderorderItems\?", "orderItems?"
        $content = $content -replace "orderorderItems\.", "orderItems."
        
        # Fix missing field names in selects
        $content = $content -replace "street: true", "address1: true"
        $content = $content -replace "zipCode", "postalCode"
        
        # Fix missing enum values
        $content = $content -replace "'DELIVERED'", "FulfillmentStatus.DELIVERED"
        $content = $content -replace "'PENDING'", "FulfillmentStatus.PENDING"
        $content = $content -replace "'IN_PROGRESS'", "FulfillmentStatus.IN_PROGRESS"
        $content = $content -replace "'COMPLETED'", "FulfillmentStatus.COMPLETED"
        $content = $content -replace "'FAILED'", "FulfillmentStatus.FAILED"
        
        # Fix missing required fields
        $content = $content -replace "editorId: (\w+)", "editorId: $1 || 'default-editor'"
        
        $newContent = $content -join "`n"
        
        if ($originalContent -ne $newContent) {
            $newContent | Set-Content $filePath
            Write-Host "Fixed missing Order model includes in $filePath"
        }
    }
}

# Files that need missing Order model include fixes
$filesToFix = @(
    "src/routes/orders.ts",
    "src/routes/orders-mock.ts",
    "src/routes/vendor-orders.ts",
    "src/routes/stripe.ts",
    "src/webhooks/stripe.ts",
    "src/routes/recipes.ts",
    "src/routes/recipes-mock.ts",
    "src/routes/vendor-recipes.ts",
    "src/routes/tax.routes.ts",
    "src/utils/taxProjection.ts",
    "src/utils/walletService.ts"
)

foreach ($file in $filesToFix) {
    Fix-MissingOrderIncludes $file
}

Write-Host "Missing Order model include fixes completed!"

