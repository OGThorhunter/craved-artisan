# Test P&L API Endpoint
Write-Host "Testing P&L API Endpoint..." -ForegroundColor Green

$baseUrl = "http://localhost:3001"
$testVendorId = "vendor_001"

# Check if server is running
Write-Host "Step 1: Checking Server Status..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get -TimeoutSec 5
    Write-Host "Server is running" -ForegroundColor Green
} catch {
    Write-Host "Server is not responding" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Please start the server with: cd server && npm run dev" -ForegroundColor Yellow
    exit 1
}

# Test P&L API
Write-Host "Step 2: Testing P&L API..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/vendor/$testVendorId/financials" -Method Get -TimeoutSec 10
    
    Write-Host "P&L API working" -ForegroundColor Green
    Write-Host "Success: $($response.success)" -ForegroundColor Gray
    Write-Host "Vendor: $($response.meta.vendorName)" -ForegroundColor Gray
    
    # Test income data
    Write-Host "Income:" -ForegroundColor Cyan
    Write-Host "  Revenue: $($response.data.income.revenue)" -ForegroundColor Gray
    Write-Host "  Other Income: $($response.data.income.otherIncome)" -ForegroundColor Gray
    
    # Test expenses data
    Write-Host "Expenses:" -ForegroundColor Cyan
    Write-Host "  COGS: $($response.data.expenses.COGS)" -ForegroundColor Gray
    Write-Host "  Labor: $($response.data.expenses.labor)" -ForegroundColor Gray
    Write-Host "  Marketing: $($response.data.expenses.marketing)" -ForegroundColor Gray
    Write-Host "  Other: $($response.data.expenses.other)" -ForegroundColor Gray
    
    # Test net profit
    Write-Host "Net Profit: $($response.data.netProfit)" -ForegroundColor Cyan
    
    # Validate data structure
    Write-Host "Data Structure Validation:" -ForegroundColor Green
    $requiredFields = @(
        'income', 'expenses', 'netProfit'
    )
    
    foreach ($field in $requiredFields) {
        if ($response.data.$field) {
            Write-Host "  $field present" -ForegroundColor Green
        } else {
            Write-Host "  $field missing" -ForegroundColor Red
        }
    }
    
} catch {
    Write-Host "P&L API failed" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
    }
}

Write-Host "Next Steps:" -ForegroundColor Green
Write-Host "1. Start frontend: cd client && npm run dev" -ForegroundColor Cyan
Write-Host "2. Navigate to: http://localhost:5173/dashboard/vendor/analytics?tab=financials" -ForegroundColor Cyan
Write-Host "3. View the enhanced P&L component with live data" -ForegroundColor Cyan

Write-Host "P&L API Test Completed!" -ForegroundColor Green 