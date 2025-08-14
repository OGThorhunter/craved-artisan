# Quick build fix script - fixes the most critical issues
Write-Host "🔧 Quick Build Fix Script" -ForegroundColor Green

# 1. Fix the $2 placeholder issues in route handlers
Write-Host "Fixing $2 placeholder issues..." -ForegroundColor Yellow
$serverPath = "server/src/routes"
$files = Get-ChildItem -Path $serverPath -Recurse -Filter "*.ts"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Fix $2 placeholders with proper status codes
    $content = $content -replace "res\.status\(\$2\)", "res.status(400)"
    $content = $content -replace "res\.status\(\$2\)", "res.status(404)"
    $content = $content -replace "res\.status\(\$2\)", "res.status(500)"
    
    # Only write if content changed
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Fixed $2 placeholders in: $($file.Name)"
    }
}

# 2. Fix Prisma import issues that weren't caught
Write-Host "Fixing remaining Prisma imports..." -ForegroundColor Yellow
$content = Get-Content "server/src/routes/vendor-recipes.ts" -Raw
$content = $content -replace "import prisma from '/prisma';", "import prisma from '../lib/prisma';"
Set-Content -Path "server/src/routes/vendor-recipes.ts" -Value $content -NoNewline

# Fix other Prisma imports
$serviceFiles = @(
    "server/src/services/analytics.service.ts",
    "server/src/services/checkout.service.ts", 
    "server/src/services/financials.service.ts",
    "server/src/services/fulfillment.service.ts",
    "server/src/services/inventory.service.ts",
    "server/src/services/messages.service.ts",
    "server/src/services/product-analytics.service.ts",
    "server/src/services/restock.service.ts",
    "server/src/services/sales.service.ts",
    "server/src/services/taxReminderCron.ts",
    "server/src/utils/stripe.ts",
    "server/src/utils/walletService.ts",
    "server/src/webhooks/stripe.ts"
)

foreach ($file in $serviceFiles) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        $content = $content -replace "import prisma from '/prisma';", "import prisma from '../lib/prisma';"
        Set-Content -Path $file -Value $content -NoNewline
        Write-Host "Fixed Prisma import in: $($file.Split('\')[-1])"
    }
}

# 3. Add missing type definitions
Write-Host "Adding basic type definitions..." -ForegroundColor Yellow

# Create a basic types file
$typesContent = @"
// Basic type definitions to fix immediate build issues
declare module 'nodemailer' {
  const nodemailer: any;
  export default nodemailer;
}

// Add any other missing type declarations here
"@

New-Item -ItemType Directory -Force -Path "server/src/types"
Set-Content -Path "server/src/types/global.d.ts" -Value $typesContent

Write-Host "✅ Quick build fixes completed!" -ForegroundColor Green
Write-Host "Next: Run 'npm run build' in both client and server directories" -ForegroundColor Cyan
