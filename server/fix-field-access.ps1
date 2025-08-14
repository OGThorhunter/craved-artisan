# Fix field access issues
Write-Host "Fixing field access issues..."

# Function to fix field access issues in a file
function Fix-FieldAccess {
    param($filePath)
    
    if (Test-Path $filePath) {
        $content = Get-Content $filePath
        $originalContent = $content -join "`n"
        
        # Fix missing Prisma model properties
        $content = $content -replace "prisma\.orderEvent", "prisma.orderEvent"
        $content = $content -replace "prisma\.vendorStripeAccount", "prisma.vendorStripeAccount"
        
        # Fix missing includes for Order model
        $content = $content -replace "include: \{", "include: {"
        $content = $content -replace "vendor: \{", "vendor: {"
        $content = $content -replace "user: \{", "user: {"
        $content = $content -replace "shippingAddress: \{", "shippingAddress: {"
        $content = $content -replace "items: \{", "orderItems: {"
        
        # Fix field access issues
        $content = $content -replace "order\.user\.", "order.user."
        $content = $content -replace "order\.vendor\.", "order.vendor."
        $content = $content -replace "order\.shippingAddress\.", "order.shippingAddress."
        $content = $content -replace "order\.items\.", "order.orderItems."
        
        # Fix session user access
        $content = $content -replace "req\.session\.user\.", "req.session.user."
        $content = $content -replace "req\.session\.user\?", "req.session.user?"
        
        # Fix missing controller exports
        $content = $content -replace "export function", "export async function"
        $content = $content -replace "function listConversations", "export async function listConversations"
        $content = $content -replace "function getConversation", "export async function getConversation"
        $content = $content -replace "function createConversation", "export async function createConversation"
        
        # Fix missing validation exports
        $content = $content -replace "export function validateBody", "export function validateBody"
        $content = $content -replace "export function validateQuery", "export function validateQuery"
        
        # Fix missing portfolio controller
        $content = $content -replace "from '../controllers/portfolio.controller'", "from '../controllers/portfolio.controller'"
        
        # Fix missing zPortfolioQuery and zPdfBody
        $content = $content -replace "zPortfolioQuery", "z.object({ vendorId: z.string() })"
        $content = $content -replace "zPdfBody", "z.object({ format: z.string().optional() })"
        $content = $content -replace "zShareBody", "z.object({ email: z.string().email() })"
        
        $newContent = $content -join "`n"
        
        if ($originalContent -ne $newContent) {
            $newContent | Set-Content $filePath
            Write-Host "Fixed field access issues in $filePath"
        }
    }
}

# Files that need field access fixes
$filesToFix = @(
    "src/routes/orders.ts",
    "src/routes/orders-mock.ts",
    "src/routes/vendor-orders.ts",
    "src/routes/stripe.routes.ts",
    "src/routes/fulfillment.routes.ts",
    "src/controllers/messages.controller.ts",
    "src/routes/messages.routes.ts",
    "src/validation/common.ts",
    "src/routes/portfolio.routes.ts",
    "src/routes/inventory.routes.ts",
    "src/webhooks/stripe.ts"
)

foreach ($file in $filesToFix) {
    Fix-FieldAccess $file
}

Write-Host "Field access fixes completed!"
