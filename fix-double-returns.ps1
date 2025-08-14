# Fix double return statements
$serverPath = "server/src/routes"
$files = Get-ChildItem -Path $serverPath -Recurse -Filter "*.ts"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Fix double return statements
    $content = $content -replace "return return", "return"
    
    # Only write if content changed
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Fixed double returns in: $($file.FullName)"
    }
}

Write-Host "Double return fixes completed!"
