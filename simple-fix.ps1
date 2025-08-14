Write-Host "🔧 Simple Build Fix Script" -ForegroundColor Green

# Fix $2 placeholders
Write-Host "Fixing $2 placeholders..." -ForegroundColor Yellow
$serverPath = "server/src/routes"
$files = Get-ChildItem -Path $serverPath -Recurse -Filter "*.ts"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Fix $2 placeholders
    $content = $content -replace "res\.status\(\$2\)", "res.status(400)"
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Fixed $2 placeholders in: $($file.Name)"
    }
}

# Fix Prisma imports
Write-Host "Fixing Prisma imports..." -ForegroundColor Yellow

$prismaFiles = @(
    "server/src/routes/vendor-recipes.ts",
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

foreach ($file in $prismaFiles) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        $content = $content -replace "import prisma from '/prisma';", "import prisma from '../lib/prisma';"
        Set-Content -Path $file -Value $content -NoNewline
        Write-Host "Fixed Prisma import in: $($file.Split('\')[-1])"
    }
}

# Create types directory and file
Write-Host "Creating type definitions..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "server/src/types" | Out-Null

$typesContent = "declare module 'nodemailer' { const nodemailer: any; export default nodemailer; }"
Set-Content -Path "server/src/types/global.d.ts" -Value $typesContent

Write-Host "✅ Simple build fixes completed!" -ForegroundColor Green
