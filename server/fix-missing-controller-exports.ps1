# Fix missing controller exports
Write-Host "Fixing missing controller exports..."

# Function to fix missing controller exports in a file
function Fix-MissingControllerExports {
    param($filePath)
    
    if (Test-Path $filePath) {
        $content = Get-Content $filePath
        $originalContent = $content -join "`n"
        
        # Fix missing controller exports
        $content = $content -replace "function listConversations", "export async function listConversations"
        $content = $content -replace "function getConversation", "export async function getConversation"
        $content = $content -replace "function createConversation", "export async function createConversation"
        $content = $content -replace "function addMessage", "export async function addMessage"
        $content = $content -replace "function markRead", "export async function markRead"
        
        # Fix missing validation exports
        $content = $content -replace "function validateBody", "export function validateBody"
        $content = $content -replace "function validateQuery", "export function validateQuery"
        $content = $content -replace "function validateParams", "export function validateParams"
        
        # Fix missing portfolio controller
        $content = $content -replace "from '../controllers/portfolio.controller'", "from '../controllers/portfolio.controller'"
        
        # Fix missing z imports
        $content = $content -replace "import \{ z \}", "import { z } from 'zod'"
        $content = $content -replace "import z", "import { z } from 'zod'"
        
        # Fix missing validation imports
        $content = $content -replace "import \{ validateBody \}", "import { validateBody, validateQuery, validateParams } from '../validation/common'"
        $content = $content -replace "import \{ validateQuery \}", "import { validateBody, validateQuery, validateParams } from '../validation/common'"
        $content = $content -replace "import \{ validateParams \}", "import { validateBody, validateQuery, validateParams } from '../validation/common'"
        
        # Fix missing controller imports
        $content = $content -replace "import \{ getVendorPortfolioSummary \}", "import { getVendorPortfolioSummary, generatePortfolioPDF, createPortfolioShare } from '../controllers/portfolio.controller'"
        $content = $content -replace "import \{ generatePortfolioPDF \}", "import { getVendorPortfolioSummary, generatePortfolioPDF, createPortfolioShare } from '../controllers/portfolio.controller'"
        $content = $content -replace "import \{ createPortfolioShare \}", "import { getVendorPortfolioSummary, generatePortfolioPDF, createPortfolioShare } from '../controllers/portfolio.controller'"
        
        $newContent = $content -join "`n"
        
        if ($originalContent -ne $newContent) {
            $newContent | Set-Content $filePath
            Write-Host "Fixed missing controller exports in $filePath"
        }
    }
}

# Files that need missing controller export fixes
$filesToFix = @(
    "src/controllers/messages.controller.ts",
    "src/routes/messages.routes.ts",
    "src/validation/common.ts",
    "src/routes/portfolio.routes.ts",
    "src/routes/product-analytics.routes.ts",
    "src/routes/product.routes.ts",
    "src/routes/vendor.routes.ts"
)

foreach ($file in $filesToFix) {
    Fix-MissingControllerExports $file
}

Write-Host "Missing controller export fixes completed!"
