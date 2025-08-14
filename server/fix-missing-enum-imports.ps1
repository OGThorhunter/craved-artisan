# Fix missing enum imports
Write-Host "Fixing missing enum imports..."

# Function to fix missing enum imports in a file
function Fix-MissingEnumImports {
    param($filePath)
    
    if (Test-Path $filePath) {
        $content = Get-Content $filePath
        $originalContent = $content -join "`n"
        
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
        $content = $content -replace "'DELIVERED'", "FulfillmentStatus.DELIVERED"
        $content = $content -replace "'PENDING'", "FulfillmentStatus.PENDING"
        $content = $content -replace "'IN_PROGRESS'", "FulfillmentStatus.IN_PROGRESS"
        $content = $content -replace "'COMPLETED'", "FulfillmentStatus.COMPLETED"
        $content = $content -replace "'FAILED'", "FulfillmentStatus.FAILED"
        
        # Fix missing enum references
        $content = $content -replace "FulfillmentStatus\.PENDING", "FulfillmentStatus.PENDING"
        $content = $content -replace "FulfillmentStatus\.IN_PROGRESS", "FulfillmentStatus.IN_PROGRESS"
        $content = $content -replace "FulfillmentStatus\.COMPLETED", "FulfillmentStatus.COMPLETED"
        $content = $content -replace "FulfillmentStatus\.FAILED", "FulfillmentStatus.FAILED"
        $content = $content -replace "TaxAlertType\.OVERDUE", "TaxAlertType.OVERDUE"
        $content = $content -replace "TaxAlertType\.REMINDER", "TaxAlertType.REMINDER"
        $content = $content -replace "TaxAlertType\.PAYMENT_CONFIRMED", "TaxAlertType.PAYMENT_CONFIRMED"
        $content = $content -replace "WalletTransactionType\.DEBIT", "WalletTransactionType.DEBIT"
        $content = $content -replace "WalletTransactionType\.CREDIT", "WalletTransactionType.CREDIT"
        
        $newContent = $content -join "`n"
        
        if ($originalContent -ne $newContent) {
            $newContent | Set-Content $filePath
            Write-Host "Fixed missing enum imports in $filePath"
        }
    }
}

# Files that need missing enum import fixes
$filesToFix = @(
    "src/routes/orders.ts",
    "src/routes/orders-mock.ts",
    "src/routes/vendor-orders.ts",
    "src/routes/stripe.ts",
    "src/webhooks/stripe.ts",
    "src/utils/taxProjection.ts",
    "src/utils/walletService.ts",
    "src/routes/vendor-products.ts",
    "src/routes/vendor-products-mock.ts",
    "src/routes/recipes.ts",
    "src/routes/recipes-mock.ts",
    "src/routes/vendor-recipes.ts",
    "src/routes/tax.routes.ts",
    "src/routes/vendor-mock.ts",
    "src/routes/vendor-orders-mock.ts"
)

foreach ($file in $filesToFix) {
    Fix-MissingEnumImports $file
}

Write-Host "Missing enum import fixes completed!"

