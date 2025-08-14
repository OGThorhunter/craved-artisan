# Fix Role enum usage issues
Write-Host "Fixing Role enum usage issues..."

# Fix Role enum usage in orders-mock.ts
(Get-Content "src/routes/orders-mock.ts") -replace 
    'requireRole\(\[''CUSTOMER''\]\)', 
    'requireRole([Role.CUSTOMER])' | 
    Set-Content "src/routes/orders-mock.ts"

(Get-Content "src/routes/orders-mock.ts") -replace 
    'requireRole\(\[''VENDOR'', ''ADMIN''\]\)', 
    'requireRole([Role.VENDOR, Role.ADMIN])' | 
    Set-Content "src/routes/orders-mock.ts"

# Fix Role enum usage in vendor-mock.ts
(Get-Content "src/routes/vendor-mock.ts") -replace 
    'requireRole\(\[''VENDOR''\]\)', 
    'requireRole([Role.VENDOR])' | 
    Set-Content "src/routes/vendor-mock.ts"

# Fix Role enum usage in vendor-products-mock.ts
(Get-Content "src/routes/vendor-products-mock.ts") -replace 
    'requireRole\(\[''VENDOR''\]\)', 
    'requireRole([Role.VENDOR])' | 
    Set-Content "src/routes/vendor-products-mock.ts"

# Add Role import to files that need it
$filesToUpdate = @(
    "src/routes/orders-mock.ts",
    "src/routes/vendor-mock.ts", 
    "src/routes/vendor-products-mock.ts"
)

foreach ($file in $filesToUpdate) {
    $content = Get-Content $file
    if ($content -match "import.*Role.*from" -or $content -match "import.*\{.*Role.*\}.*from") {
        Write-Host "Role import already exists in $file"
    } else {
        # Add Role import after existing imports
        $importIndex = -1
        for ($i = 0; $i -lt $content.Length; $i++) {
            if ($content[$i] -match "^import.*from") {
                $importIndex = $i
            }
        }
        
        if ($importIndex -ge 0) {
            $newContent = @()
            $newContent += $content[0..$importIndex]
            $newContent += "import { Role } from '../lib/prisma';"
            $newContent += $content[($importIndex + 1)..($content.Length - 1)]
            $newContent | Set-Content $file
            Write-Host "Added Role import to $file"
        }
    }
}

Write-Host "Role enum usage fixes completed!"
