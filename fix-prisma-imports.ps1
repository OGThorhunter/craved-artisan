# Fix Prisma imports in server files
$serverPath = "server/src"
$files = Get-ChildItem -Path $serverPath -Recurse -Filter "*.ts"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Fix import { prisma } from '../lib/prisma'
    $content = $content -replace "import \{ prisma \} from ['`"](\.\.\/)*lib\/prisma['`"];", "import prisma from '$1lib/prisma';"
    
    # Fix import { prisma } from '../db/prisma'
    $content = $content -replace "import \{ prisma \} from ['`"](\.\.\/)*db\/prisma['`"];", "import prisma from '$1db/prisma';"
    
    # Only write if content changed
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Fixed imports in: $($file.FullName)"
    }
}

Write-Host "Prisma import fixes completed!"
