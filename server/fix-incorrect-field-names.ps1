# Fix incorrect field names
Write-Host "Fixing incorrect field names..."

# Function to fix incorrect field names in a file
function Fix-IncorrectFieldNames {
    param($filePath)
    
    if (Test-Path $filePath) {
        $content = Get-Content $filePath
        $originalContent = $content -join "`n"
        
        # Fix incorrect field names created by previous script
        $content = $content -replace "orderorderItems", "orderItems"
        $content = $content -replace "orderorderItems:", "orderItems:"
        $content = $content -replace "orderorderItems\?", "orderItems?"
        $content = $content -replace "orderorderItems\.", "orderItems."
        
        # Fix other potential incorrect field names
        $content = $content -replace "orderuser", "order.user"
        $content = $content -replace "ordervendor", "order.vendor"
        $content = $content -replace "ordershippingAddress", "order.shippingAddress"
        
        # Fix incorrect include patterns
        $content = $content -replace "include: \{", "include: {"
        $content = $content -replace "vendor: \{", "vendor: {"
        $content = $content -replace "user: \{", "user: {"
        $content = $content -replace "shippingAddress: \{", "shippingAddress: {"
        
        $newContent = $content -join "`n"
        
        if ($originalContent -ne $newContent) {
            $newContent | Set-Content $filePath
            Write-Host "Fixed incorrect field names in $filePath"
        }
    }
}

# Files that need incorrect field name fixes
$filesToFix = @(
    "src/routes/orders.ts",
    "src/routes/orders-mock.ts",
    "src/routes/vendor-orders.ts",
    "src/routes/stripe.routes.ts",
    "src/routes/fulfillment.routes.ts",
    "src/webhooks/stripe.ts"
)

foreach ($file in $filesToFix) {
    Fix-IncorrectFieldNames $file
}

Write-Host "Incorrect field name fixes completed!"
