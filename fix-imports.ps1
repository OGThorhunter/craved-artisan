# Fix Import Paths Script
Write-Host '🔧 Fixing Import Paths' -ForegroundColor Green

# Find all TypeScript files with incorrect import paths
$files = Get-ChildItem -Path "src" -Recurse -Filter "*.ts" | Where-Object {
    $content = Get-Content $_.FullName -Raw
    $content -match "import.*from '/prisma'"
}

Write-Host "Found $($files.Count) files with incorrect import paths" -ForegroundColor Yellow

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Fix the import path
    $content = $content -replace "import prisma from '/prisma';", "import prisma from '../lib/prisma';"
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Fixed import path in: $($file.Name)" -ForegroundColor Green
    }
}

Write-Host '✅ Import path fixes completed!' -ForegroundColor Green
