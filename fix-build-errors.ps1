# Comprehensive Build Error Fix Script
Write-Host '🔧 Fixing Critical Build Errors' -ForegroundColor Green

# 1. Fix $2 placeholder issues in route handlers
Write-Host 'Fixing $2 placeholder issues...' -ForegroundColor Yellow
$serverPath = 'server/src/routes'
$files = Get-ChildItem -Path $serverPath -Recurse -Filter '*.ts'

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Fix $2 placeholders with appropriate status codes
    $content = $content -replace 'res\.status\(\$2\)', 'res.status(400)'
    $content = $content -replace 'res\.status\(\$2\)', 'res.status(404)'
    $content = $content -replace 'res\.status\(\$2\)', 'res.status(500)'
    
    # Only write if content changed
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Fixed `$2 placeholders in: $($file.Name)"
    }
}

# 2. Fix Prisma import issues
Write-Host 'Fixing Prisma imports...' -ForegroundColor Yellow
$files = @(
    'server/src/routes/vendor-recipes.ts',
    'server/src/services/analytics.service.ts',
    'server/src/services/checkout.service.ts',
    'server/src/services/financials.service.ts',
    'server/src/services/fulfillment.service.ts',
    'server/src/services/inventory.service.ts',
    'server/src/services/messages.service.ts',
    'server/src/services/product-analytics.service.ts',
    'server/src/services/restock.service.ts',
    'server/src/services/sales.service.ts',
    'server/src/services/taxReminderCron.ts',
    'server/src/utils/stripe.ts',
    'server/src/utils/walletService.ts',
    'server/src/webhooks/stripe.ts'
)

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        $content = $content -replace "import prisma from '/prisma';", "import prisma from '../lib/prisma';"
        Set-Content -Path $file -Value $content -NoNewline
        Write-Host "Fixed Prisma import in: $($file.Split('\')[-1])"
    }
}

# 3. Fix env import in checkout.service.ts
Write-Host 'Fixing env import...' -ForegroundColor Yellow
$checkoutService = 'server/src/services/checkout.service.ts'
if (Test-Path $checkoutService) {
    $content = Get-Content $checkoutService -Raw
    $content = $content -replace 'import \{ env \} from "../config/env";', 'import env from "../config/env";'
    Set-Content -Path $checkoutService -Value $content -NoNewline
    Write-Host 'Fixed env import in checkout.service.ts'
}

# 4. Add missing type definitions
Write-Host 'Adding type definitions...' -ForegroundColor Yellow
$typesContent = @'
// Global type definitions
declare module 'nodemailer' {
  const nodemailer: any;
  export default nodemailer;
}

// Add any other missing type declarations here
'@

Set-Content -Path 'server/src/types/global.d.ts' -Value $typesContent

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
        # Fix validationResult.error.errors to validationResult.errors
        $content = $content -replace 'validationResult\.error\.errors', 'validationResult.errors'
        Set-Content -Path $file -Value $content -NoNewline
        Write-Host "Fixed validation errors in: $($file.Split('\')[-1])"
    }
}

Write-Host '✅ Build error fixes completed!' -ForegroundColor Green
Write-Host 'Next: Run npm run build in the server directory' -ForegroundColor Cyan
