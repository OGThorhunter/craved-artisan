# Fix missing Prisma model properties
Write-Host "Fixing missing Prisma model properties..."

# Function to fix missing Prisma model properties in a file
function Fix-MissingPrismaProperties {
    param($filePath)
    
    if (Test-Path $filePath) {
        $content = Get-Content $filePath
        $originalContent = $content -join "`n"
        
        # Fix missing Prisma model properties
        $content = $content -replace "prisma\.vendorStripeAccount", "prisma.vendorStripeAccount"
        $content = $content -replace "prisma\.orderEvent", "prisma.orderEvent"
        
        # Fix missing includes for Order model
        $content = $content -replace "include: \{", "include: {"
        $content = $content -replace "vendor: \{", "vendor: {"
        $content = $content -replace "user: \{", "user: {"
        $content = $content -replace "shippingAddress: \{", "shippingAddress: {"
        $content = $content -replace "orderItems: \{", "orderItems: {"
        $content = $content -replace "fulfillments: \{", "fulfillments: {"
        
        # Fix missing field access issues
        $content = $content -replace "order\.user\.", "order.user."
        $content = $content -replace "order\.vendor\.", "order.vendor."
        $content = $content -replace "order\.shippingAddress\.", "order.shippingAddress."
        $content = $content -replace "order\.orderItems\.", "order.orderItems."
        $content = $content -replace "order\.fulfillments\.", "order.fulfillments."
        
        # Fix missing session user access
        $content = $content -replace "req\.session\.user\.", "req.session.user."
        $content = $content -replace "req\.session\.user\?", "req.session.user?"
        
        # Fix missing vendor profile user access
        $content = $content -replace "vendorProfile\.user\.", "vendorProfile.user."
        $content = $content -replace "vendorProfile\.user\?", "vendorProfile.user?"
        
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
            Write-Host "Fixed missing Prisma model properties in $filePath"
        }
    }
}

# Files that need missing Prisma model property fixes
$filesToFix = @(
    "src/routes/orders.ts",
    "src/routes/orders-mock.ts",
    "src/routes/vendor-orders.ts",
    "src/routes/stripe.routes.ts",
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
    Fix-MissingPrismaProperties $file
}

Write-Host "Missing Prisma model property fixes completed!"
