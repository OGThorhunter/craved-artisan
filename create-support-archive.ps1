$excludes = @("node_modules","dist","build",".next",".vite","coverage",".git","*.env*")

Write-Host "Creating support archive..." -ForegroundColor Green
Write-Host "Excluding: $($excludes -join ', ')" -ForegroundColor Yellow

# Get all files and directories, excluding the specified ones
$items = Get-ChildItem -Path . -Exclude $excludes | Where-Object {
    $_.Name -notin $excludes -and 
    $_.Name -notlike "*.env*" -and
    $_.Name -notlike "*.zip"
}

# Create the archive
Compress-Archive -Path $items.FullName `
 -DestinationPath craved-support.zip `
 -CompressionLevel Optimal `
 -Force

if (Test-Path "craved-support.zip") {
    $size = (Get-Item "craved-support.zip").Length
    $sizeMB = [math]::Round($size / 1MB, 2)
    Write-Host "✅ Support archive created successfully!" -ForegroundColor Green
    Write-Host "📁 File: craved-support.zip" -ForegroundColor Cyan
    Write-Host "📊 Size: $sizeMB MB" -ForegroundColor Cyan
} else {
    Write-Host "❌ Failed to create support archive" -ForegroundColor Red
}
