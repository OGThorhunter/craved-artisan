# Fix requireAuth import issues in settings routes
$files = @(
    "server/src/routes/settings/integrations.ts",
    "server/src/routes/settings/documents.ts", 
    "server/src/routes/settings/danger-zone.ts",
    "server/src/routes/settings/billing.ts",
    "server/src/routes/settings/audit.ts",
    "server/src/routes/settings/social.ts",
    "server/src/routes/settings/security.ts",
    "server/src/routes/settings/notifications.ts",
    "server/src/routes/settings.ts",
    "server/src/routes/settings/team.ts"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Fixing imports in: $file"
        $content = Get-Content $file -Raw
        
        # Replace the problematic import line
        $content = $content -replace "import \{ requireAuth, (.*?) \} from '.*?account-auth';", "import { requireAuth } from '../../middleware/auth';`nimport { `$1 } from '../../middleware/account-auth';"
        
        # Fix the relative path for the main settings.ts file
        $content = $content -replace "from '\.\./middleware/account-auth'", "from '../middleware/auth'"
        $content = $content -replace "import \{ requireAuth \} from '\.\./middleware/auth';", "import { requireAuth } from '../middleware/auth';"
        
        Set-Content $file $content
        Write-Host "Fixed: $file"
    } else {
        Write-Host "File not found: $file"
    }
}

Write-Host "All auth import fixes completed!"






















