# Fix specific Role enum usage issues
Write-Host "Fixing specific Role enum usage issues..."

# Fix orders.ts - replace string literals with Role enum
$ordersContent = Get-Content "src/routes/orders.ts"
$ordersContent = $ordersContent -replace "requireRole\(\['CUSTOMER'\]\)", "requireRole([Role.CUSTOMER])"
$ordersContent = $ordersContent -replace "requireRole\(\['VENDOR', 'ADMIN'\]\)", "requireRole([Role.VENDOR, Role.ADMIN])"
$ordersContent | Set-Content "src/routes/orders.ts"

# Fix vendor-mock.ts - already using Role enum correctly, just need import
$vendorMockContent = Get-Content "src/routes/vendor-mock.ts"
if ($vendorMockContent -notmatch "import.*Role.*from") {
    # Add Role import after existing imports
    $importIndex = -1
    for ($i = 0; $i -lt $vendorMockContent.Length; $i++) {
        if ($vendorMockContent[$i] -match "^import.*from") {
            $importIndex = $i
        }
    }
    
    if ($importIndex -ge 0) {
        $newContent = @()
        $newContent += $vendorMockContent[0..$importIndex]
        $newContent += "import { Role } from '../lib/prisma';"
        $newContent += $vendorMockContent[($importIndex + 1)..($vendorMockContent.Length - 1)]
        $newContent | Set-Content "src/routes/vendor-mock.ts"
        Write-Host "Added Role import to vendor-mock.ts"
    }
}

# Fix vendor-products-mock.ts - already using Role enum correctly, just need import
$vendorProductsMockContent = Get-Content "src/routes/vendor-products-mock.ts"
if ($vendorProductsMockContent -notmatch "import.*Role.*from") {
    # Add Role import after existing imports
    $importIndex = -1
    for ($i = 0; $i -lt $vendorProductsMockContent.Length; $i++) {
        if ($vendorProductsMockContent[$i] -match "^import.*from") {
            $importIndex = $i
        }
    }
    
    if ($importIndex -ge 0) {
        $newContent = @()
        $newContent += $vendorProductsMockContent[0..$importIndex]
        $newContent += "import { Role } from '../lib/prisma';"
        $newContent += $vendorProductsMockContent[($importIndex + 1)..($vendorProductsMockContent.Length - 1)]
        $newContent | Set-Content "src/routes/vendor-products-mock.ts"
        Write-Host "Added Role import to vendor-products-mock.ts"
    }
}

# Fix orders-mock.ts - already using Role enum correctly, just need import
$ordersMockContent = Get-Content "src/routes/orders-mock.ts"
if ($ordersMockContent -notmatch "import.*Role.*from") {
    # Add Role import after existing imports
    $importIndex = -1
    for ($i = 0; $i -lt $ordersMockContent.Length; $i++) {
        if ($ordersMockContent[$i] -match "^import.*from") {
            $importIndex = $i
        }
    }
    
    if ($importIndex -ge 0) {
        $newContent = @()
        $newContent += $ordersMockContent[0..$importIndex]
        $newContent += "import { Role } from '../lib/prisma';"
        $newContent += $ordersMockContent[($importIndex + 1)..($ordersMockContent.Length - 1)]
        $newContent | Set-Content "src/routes/orders-mock.ts"
        Write-Host "Added Role import to orders-mock.ts"
    }
}

Write-Host "Specific Role enum usage fixes completed!"
