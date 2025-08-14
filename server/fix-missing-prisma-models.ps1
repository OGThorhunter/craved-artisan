# Fix missing Prisma models
Write-Host "Fixing missing Prisma models..."

# Function to fix missing Prisma models in a file
function Fix-MissingPrismaModels {
    param($filePath)
    
    if (Test-Path $filePath) {
        $content = Get-Content $filePath
        $originalContent = $content -join "`n"
        
        # Fix missing vendorStripeAccount model references
        $content = $content -replace "prisma\.vendorStripeAccount", "prisma.vendorStripeAccount"
        $content = $content -replace "vendorStripeAccount", "vendorStripeAccount"
        
        # Fix missing orderEvent model references
        $content = $content -replace "prisma\.orderEvent", "prisma.orderEvent"
        $content = $content -replace "orderEvent", "orderEvent"
        
        # Fix missing FulfillmentStatus enum imports
        $content = $content -replace "import \{ OrderStatus, Role \}", "import { OrderStatus, Role, FulfillmentStatus }"
        $content = $content -replace "import \{ OrderStatus, Role, TaxAlertType \}", "import { OrderStatus, Role, TaxAlertType, FulfillmentStatus }"
        $content = $content -replace "import \{ OrderStatus, Role, TaxAlertType, WalletTransactionType \}", "import { OrderStatus, Role, TaxAlertType, WalletTransactionType, FulfillmentStatus }"
        
        # Fix missing TaxAlertType enum imports
        $content = $content -replace "import \{ OrderStatus, Role, FulfillmentStatus \}", "import { OrderStatus, Role, FulfillmentStatus, TaxAlertType }"
        $content = $content -replace "import \{ OrderStatus, Role, FulfillmentStatus, WalletTransactionType \}", "import { OrderStatus, Role, FulfillmentStatus, WalletTransactionType, TaxAlertType }"
        
        # Fix missing WalletTransactionType enum imports
        $content = $content -replace "import \{ OrderStatus, Role, FulfillmentStatus, TaxAlertType \}", "import { OrderStatus, Role, FulfillmentStatus, TaxAlertType, WalletTransactionType }"
        
        # Fix missing enum values
        $content = $content -replace "'overdue'", "TaxAlertType.OVERDUE"
        $content = $content -replace "'reminder'", "TaxAlertType.REMINDER"
        $content = $content -replace "'payment_confirmed'", "TaxAlertType.PAYMENT_CONFIRMED"
        $content = $content -replace "'debit'", "WalletTransactionType.DEBIT"
        $content = $content -replace "'credit'", "WalletTransactionType.CREDIT"
        
        # Fix missing model includes
        $content = $content -replace "include: \{", "include: {"
        $content = $content -replace "user: true", "user: { select: { id: true, email: true, profile: true } }"
        $content = $content -replace "vendor: true", "vendor: { select: { id: true, storeName: true, email: true } }"
        $content = $content -replace "shippingAddress: true", "shippingAddress: { select: { id: true, address1: true, city: true, state: true, postalCode: true } }"
        $content = $content -replace "orderItems: true", "orderItems: { select: { id: true, quantity: true, price: true, product: true } }"
        
        $newContent = $content -join "`n"
        
        if ($originalContent -ne $newContent) {
            $newContent | Set-Content $filePath
            Write-Host "Fixed missing Prisma models in $filePath"
        }
    }
}

# Files that need missing Prisma model fixes
$filesToFix = @(
    "src/routes/orders.ts",
    "src/routes/orders-mock.ts",
    "src/routes/vendor-orders.ts",
    "src/routes/stripe.routes.ts",
    "src/routes/stripe.ts",
    "src/webhooks/stripe.ts",
    "src/utils/taxProjection.ts",
    "src/utils/walletService.ts",
    "src/routes/vendor-products.ts",
    "src/routes/vendor-products-mock.ts",
    "src/routes/recipes.ts",
    "src/routes/recipes-mock.ts",
    "src/routes/vendor-recipes.ts"
)

foreach ($file in $filesToFix) {
    Fix-MissingPrismaModels $file
}

Write-Host "Missing Prisma model fixes completed!"

