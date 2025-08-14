# Fix import syntax errors
Write-Host "Fixing import syntax errors..."

# Function to fix import syntax errors in a file
function Fix-ImportSyntaxErrors {
    param($filePath)
    
    if (Test-Path $filePath) {
        $content = Get-Content $filePath
        $originalContent = $content -join "`n"
        
        # Fix duplicate import statements
        $content = $content -replace "import \{ z \} from 'zod' from `"zod`";", "import { z } from 'zod';"
        $content = $content -replace "import \{ validateBody, validateQuery, validateParams \} from '../validation/common' from `"../validation/common`";", "import { validateBody, validateQuery, validateParams } from '../validation/common';"
        
        # Fix other duplicate patterns
        $content = $content -replace "from 'zod' from `"zod`"", "from 'zod'"
        $content = $content -replace "from '../validation/common' from `"../validation/common`"", "from '../validation/common'"
        
        $newContent = $content -join "`n"
        
        if ($originalContent -ne $newContent) {
            $newContent | Set-Content $filePath
            Write-Host "Fixed import syntax errors in $filePath"
        }
    }
}

# Files that need import syntax error fixes
$filesToFix = @(
    "src/routes/portfolio.routes.ts",
    "src/routes/product-analytics.routes.ts",
    "src/validation/common.ts"
)

foreach ($file in $filesToFix) {
    Fix-ImportSyntaxErrors $file
}

Write-Host "Import syntax error fixes completed!"
