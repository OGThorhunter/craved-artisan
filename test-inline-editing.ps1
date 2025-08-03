# Test Inline Editing for Financial Snapshots
Write-Host "Testing Inline Editing for Financial Snapshots..." -ForegroundColor Green

# Start mock server if not running
$serverProcess = Get-Process -Name "node" -ErrorAction SilentlyContinue
if (-not $serverProcess) {
    Write-Host "Starting mock server..." -ForegroundColor Yellow
    .\start-mock-server.ps1
    Start-Sleep -Seconds 3
}

# Test 1: Get current financial data
Write-Host "`nTest 1: Getting current financial data..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendors/vendor-1/financials/test" -Method GET
    $data = $response.Content | ConvertFrom-Json
    Write-Host "✅ Retrieved ${data.snapshots.Count} snapshots" -ForegroundColor Green
    
    if ($data.snapshots.Count -gt 0) {
        $firstSnapshot = $data.snapshots[0]
        Write-Host "First snapshot ID: $($firstSnapshot.id)" -ForegroundColor Cyan
        Write-Host "Current revenue: $($firstSnapshot.revenue)" -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ Failed to get financial data: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: Update a financial snapshot (PATCH)
Write-Host "`nTest 2: Updating financial snapshot..." -ForegroundColor Yellow
try {
    $firstSnapshotId = $data.snapshots[0].id
    $updateData = @{
        revenue = 15000
        notes = "Updated via inline editing test"
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendors/vendor-1/financials/$firstSnapshotId/test" -Method PATCH -Body $updateData -ContentType "application/json"
    $updatedSnapshot = $response.Content | ConvertFrom-Json
    
    Write-Host "✅ Successfully updated snapshot" -ForegroundColor Green
    Write-Host "Updated revenue: $($updatedSnapshot.revenue)" -ForegroundColor Cyan
    Write-Host "Updated notes: $($updatedSnapshot.notes)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Failed to update snapshot: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Verify the update was persisted
Write-Host "`nTest 3: Verifying update persistence..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendors/vendor-1/financials/test" -Method GET
    $data = $response.Content | ConvertFrom-Json
    $updatedSnapshot = $data.snapshots | Where-Object { $_.id -eq $firstSnapshotId }
    
    if ($updatedSnapshot.revenue -eq 15000) {
        Write-Host "✅ Update was successfully persisted" -ForegroundColor Green
    } else {
        Write-Host "❌ Update was not persisted correctly" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Failed to verify update: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Test updating multiple fields
Write-Host "`nTest 4: Testing multiple field updates..." -ForegroundColor Yellow
try {
    $multiUpdateData = @{
        revenue = 18000
        cogs = 8000
        opex = 2000
        cashIn = 18000
        cashOut = 10000
        notes = "Multi-field update test"
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendors/vendor-1/financials/$firstSnapshotId/test" -Method PATCH -Body $multiUpdateData -ContentType "application/json"
    $updatedSnapshot = $response.Content | ConvertFrom-Json
    
    Write-Host "✅ Successfully updated multiple fields" -ForegroundColor Green
    Write-Host "Revenue: $($updatedSnapshot.revenue)" -ForegroundColor Cyan
    Write-Host "COGS: $($updatedSnapshot.cogs)" -ForegroundColor Cyan
    Write-Host "OPEX: $($updatedSnapshot.opex)" -ForegroundColor Cyan
    Write-Host "Net Profit: $($updatedSnapshot.netProfit)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Failed to update multiple fields: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Test invalid snapshot ID
Write-Host "`nTest 5: Testing invalid snapshot ID..." -ForegroundColor Yellow
try {
    $updateData = @{
        revenue = 20000
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/vendors/vendor-1/financials/invalid-id/test" -Method PATCH -Body $updateData -ContentType "application/json"
    Write-Host "❌ Should have failed with invalid ID" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "✅ Correctly returned 404 for invalid snapshot ID" -ForegroundColor Green
    } else {
        Write-Host "❌ Unexpected error for invalid ID: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n🎉 Inline editing tests completed!" -ForegroundColor Green 