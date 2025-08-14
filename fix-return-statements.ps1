# Fix missing return statements in route handlers
$serverPath = "server/src/routes"
$files = Get-ChildItem -Path $serverPath -Recurse -Filter "*.ts"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Fix res.json() without return
    $content = $content -replace "(\s+)res\.json\(", "`$1return res.json("
    
    # Fix res.status().json() without return
    $content = $content -replace "(\s+)res\.status\([^)]*\)\.json\(", "`$1return res.status(`$2).json("
    
    # Fix res.send() without return
    $content = $content -replace "(\s+)res\.send\(", "`$1return res.send("
    
    # Fix res.status().send() without return
    $content = $content -replace "(\s+)res\.status\([^)]*\)\.send\(", "`$1return res.status(`$2).send("
    
    # Only write if content changed
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Fixed return statements in: $($file.FullName)"
    }
}

Write-Host "Return statement fixes completed!"
