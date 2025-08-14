# Fix duplicate Role imports
Write-Host "Fixing duplicate Role imports..."

# Function to remove duplicate Role imports
function Remove-DuplicateRoleImports {
    param($filePath)
    
    if (Test-Path $filePath) {
        $content = Get-Content $filePath
        $roleImportLines = @()
        
        # Find all Role import lines
        for ($i = 0; $i -lt $content.Length; $i++) {
            if ($content[$i] -match "import.*Role.*from.*prisma") {
                $roleImportLines += $i
            }
        }
        
        # If there are multiple Role imports, keep only the first one
        if ($roleImportLines.Count -gt 1) {
            $newContent = @()
            for ($i = 0; $i -lt $content.Length; $i++) {
                if ($roleImportLines.Contains($i)) {
                    # Only add the first Role import
                    if ($i -eq $roleImportLines[0]) {
                        $newContent += $content[$i]
                    }
                    # Skip the rest
                } else {
                    $newContent += $content[$i]
                }
            }
            $newContent | Set-Content $filePath
            Write-Host "Removed duplicate Role imports from $filePath"
        }
    }
}

# Fix files with duplicate imports
$filesWithDuplicates = @(
    "src/routes/orders-mock.ts",
    "src/routes/vendor-mock.ts",
    "src/routes/vendor-products-mock.ts"
)

foreach ($file in $filesWithDuplicates) {
    Remove-DuplicateRoleImports $file
}

Write-Host "Duplicate Role import fixes completed!"
