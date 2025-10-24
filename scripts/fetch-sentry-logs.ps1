# Sentry Log Fetcher for Craved Artisan (PowerShell)
# 
# This script automatically fetches recent Sentry issues and displays them
# in a developer-friendly format.
# 
# Usage:
#   .\scripts\fetch-sentry-logs.ps1
#   .\scripts\fetch-sentry-logs.ps1 -Limit 5
#   .\scripts\fetch-sentry-logs.ps1 -IssueId "issue-id-here"
#   .\scripts\fetch-sentry-logs.ps1 -SignupErrors

param(
    [int]$Limit = 10,
    [string]$IssueId = "",
    [switch]$SignupErrors,
    [switch]$Help
)

# Configuration
$SENTRY_ORG = "your-sentry-org"  # Replace with your Sentry org
$SENTRY_PROJECT = "craved-artisan-backend"  # Replace with your project
$SENTRY_TOKEN = $env:SENTRY_AUTH_TOKEN  # Set this in your environment

$SENTRY_API_BASE = "https://sentry.io/api/0"

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

function Get-SentryIssues {
    param([int]$Limit = 10)
    
    try {
        Write-ColorOutput "🔍 Fetching recent Sentry issues..." "Blue"
        
        $headers = @{
            "Authorization" = "Bearer $SENTRY_TOKEN"
            "Content-Type" = "application/json"
        }
        
        $url = "$SENTRY_API_BASE/projects/$SENTRY_ORG/$SENTRY_PROJECT/issues/"
        $params = @{
            limit = $Limit
            sort = "-lastSeen"
        }
        
        $response = Invoke-RestMethod -Uri $url -Headers $headers -Method Get -Body $params
        
        Write-ColorOutput "✅ Found $($response.Count) recent issues:" "Green"
        Write-Host ""
        
        for ($i = 0; $i -lt $response.Count; $i++) {
            $issue = $response[$i]
            Write-ColorOutput "$($i + 1). $($issue.title)" "Yellow"
            Write-ColorOutput "   ID: $($issue.id)" "Gray"
            Write-ColorOutput "   Count: $($issue.count)" "Gray"
            Write-ColorOutput "   Last Seen: $((Get-Date $issue.lastSeen).ToString('yyyy-MM-dd HH:mm:ss'))" "Gray"
            Write-ColorOutput "   Level: $($issue.level)" "Gray"
            Write-ColorOutput "   Status: $($issue.status)" "Gray"
            Write-Host ""
        }
        
        return $response
    }
    catch {
        Write-ColorOutput "❌ Error fetching issues: $($_.Exception.Message)" "Red"
        if ($_.Exception.Response) {
            Write-ColorOutput "Response: $($_.Exception.Response)" "Red"
        }
        return @()
    }
}

function Get-SentryIssueDetails {
    param([string]$IssueId)
    
    try {
        Write-ColorOutput "🔍 Fetching details for issue $IssueId..." "Blue"
        
        $headers = @{
            "Authorization" = "Bearer $SENTRY_TOKEN"
            "Content-Type" = "application/json"
        }
        
        $url = "$SENTRY_API_BASE/issues/$IssueId/"
        $response = Invoke-RestMethod -Uri $url -Headers $headers -Method Get
        
        Write-ColorOutput "✅ Issue Details:" "Green"
        Write-ColorOutput "Title: $($response.title)" "Yellow"
        Write-ColorOutput "ID: $($response.id)" "Gray"
        Write-ColorOutput "Count: $($response.count)" "Gray"
        Write-ColorOutput "Level: $($response.level)" "Gray"
        Write-ColorOutput "Status: $($response.status)" "Gray"
        Write-ColorOutput "Last Seen: $((Get-Date $response.lastSeen).ToString('yyyy-MM-dd HH:mm:ss'))" "Gray"
        Write-ColorOutput "First Seen: $((Get-Date $response.firstSeen).ToString('yyyy-MM-dd HH:mm:ss'))" "Gray"
        
        if ($response.culprit) {
            Write-ColorOutput "Culprit: $($response.culprit)" "Gray"
        }
        
        Write-Host ""
        Write-ColorOutput "Stack Trace:" "Blue"
        if ($response.metadata -and $response.metadata.filename) {
            Write-ColorOutput "File: $($response.metadata.filename)" "Gray"
            Write-ColorOutput "Function: $($response.metadata.function)" "Gray"
        }
        
        return $response
    }
    catch {
        Write-ColorOutput "❌ Error fetching issue details: $($_.Exception.Message)" "Red"
        return $null
    }
}

function Get-SentrySignupErrors {
    try {
        Write-ColorOutput "🔍 Fetching signup-related errors..." "Blue"
        
        $headers = @{
            "Authorization" = "Bearer $SENTRY_TOKEN"
            "Content-Type" = "application/json"
        }
        
        $url = "$SENTRY_API_BASE/projects/$SENTRY_ORG/$SENTRY_PROJECT/issues/"
        $params = @{
            query = "endpoint:signup"
            limit = 20
            sort = "-lastSeen"
        }
        
        $response = Invoke-RestMethod -Uri $url -Headers $headers -Method Get -Body $params
        
        Write-ColorOutput "✅ Found $($response.Count) signup-related issues:" "Green"
        Write-Host ""
        
        for ($i = 0; $i -lt $response.Count; $i++) {
            $issue = $response[$i]
            Write-ColorOutput "$($i + 1). $($issue.title)" "Yellow"
            Write-ColorOutput "   ID: $($issue.id)" "Gray"
            Write-ColorOutput "   Count: $($issue.count)" "Gray"
            Write-ColorOutput "   Last Seen: $((Get-Date $issue.lastSeen).ToString('yyyy-MM-dd HH:mm:ss'))" "Gray"
            Write-Host ""
        }
        
        return $response
    }
    catch {
        Write-ColorOutput "❌ Error fetching signup errors: $($_.Exception.Message)" "Red"
        return @()
    }
}

# Main execution
if ($Help) {
    Write-ColorOutput "Sentry Log Fetcher for Craved Artisan" "Blue"
    Write-Host ""
    Write-Host "Usage:"
    Write-Host "  .\scripts\fetch-sentry-logs.ps1                    # Fetch recent issues"
    Write-Host "  .\scripts\fetch-sentry-logs.ps1 -Limit 5           # Fetch 5 recent issues"
    Write-Host "  .\scripts\fetch-sentry-logs.ps1 -IssueId 'id'      # Fetch specific issue"
    Write-Host "  .\scripts\fetch-sentry-logs.ps1 -SignupErrors      # Fetch signup errors"
    Write-Host ""
    exit 0
}

if (-not $SENTRY_TOKEN) {
    Write-ColorOutput "❌ SENTRY_AUTH_TOKEN environment variable is required" "Red"
    Write-ColorOutput "Set it in your environment or .env file:" "Gray"
    Write-ColorOutput '$env:SENTRY_AUTH_TOKEN = "your_token_here"' "Gray"
    exit 1
}

if ($SignupErrors) {
    Get-SentrySignupErrors
    exit 0
}

if ($IssueId) {
    Get-SentryIssueDetails -IssueId $IssueId
    exit 0
}

Get-SentryIssues -Limit $Limit
