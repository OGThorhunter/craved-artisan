# Test Phase 3: Recipe Integration & Cost Management
Write-Host "Testing Recipe Integration & Cost Management (Phase 3)" -ForegroundColor Green
Write-Host "=========================================================" -ForegroundColor Green

# Check if services are running
Write-Host "`nChecking service status..." -ForegroundColor Yellow

try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:5173" -UseBasicParsing -TimeoutSec 10
    Write-Host "Frontend (localhost:5173): Running" -ForegroundColor Green
} catch {
    Write-Host "Frontend (localhost:5173): Not responding" -ForegroundColor Red
}

try {
    $backendResponse = Invoke-WebRequest -Uri "http://localhost:3001/health" -UseBasicParsing -TimeoutSec 10
    Write-Host "Backend (localhost:3001): Running" -ForegroundColor Green
} catch {
    Write-Host "Backend (localhost:3001): Not responding" -ForegroundColor Red
}

Write-Host "`nPhase 3 New Features to Test:" -ForegroundColor Cyan
Write-Host "1. Recipe Management System:" -ForegroundColor White
Write-Host "   - Recipe creation and management" -ForegroundColor White
Write-Host "   - Ingredient tracking" -ForegroundColor White
Write-Host "   - Recipe versioning" -ForegroundColor White
Write-Host "   - Recipe templates" -ForegroundColor White

Write-Host "`n2. Cost Management:" -ForegroundColor White
Write-Host "   - Ingredient cost tracking" -ForegroundColor White
Write-Host "   - Recipe cost calculation" -ForegroundColor White
Write-Host "   - Margin analysis" -ForegroundColor White
Write-Host "   - Cost breakdown per product" -ForegroundColor White

Write-Host "`n3. Production Planning:" -ForegroundColor White
Write-Host "   - Batch size optimization" -ForegroundColor White
Write-Host "   - Ingredient requirements planning" -ForegroundColor White
Write-Host "   - Production scheduling" -ForegroundColor White
Write-Host "   - Yield calculations" -ForegroundColor White

Write-Host "`n4. Enhanced Product Forms:" -ForegroundColor White
Write-Host "   - Recipe selection in products" -ForegroundColor White
Write-Host "   - Cost preview before saving" -ForegroundColor White
Write-Host "   - Margin settings" -ForegroundColor White
Write-Host "   - Production notes" -ForegroundColor White

Write-Host "`nTest Instructions:" -ForegroundColor Cyan
Write-Host "1. Navigate to: http://localhost:5173/dashboard/vendor/recipes" -ForegroundColor White
Write-Host "2. Login with: vendor@cravedartisan.com / vendor123" -ForegroundColor White
Write-Host "3. Test recipe management features" -ForegroundColor White
Write-Host "4. Navigate to products and test recipe linking" -ForegroundColor White

Write-Host "`nExpected Results:" -ForegroundColor Cyan
Write-Host "• Recipe management page loads without errors" -ForegroundColor White
Write-Host "• Recipe creation and editing works" -ForegroundColor White
Write-Host "• Cost calculations are accurate" -ForegroundColor White
Write-Host "• Products can be linked to recipes" -ForegroundColor White
Write-Host "• No JavaScript errors in console" -ForegroundColor White

Write-Host "`nPhase 3 Foundation Complete! Ready for Cost Management." -ForegroundColor Green
Write-Host "Next: Implement cost calculation engine and margin analysis" -ForegroundColor Cyan
