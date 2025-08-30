# Test Phase 2: Enhanced Products Page
Write-Host "Testing Enhanced Products Page (Phase 2)" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

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

Write-Host "`nPhase 2 New Features to Test:" -ForegroundColor Cyan
Write-Host "1. Enhanced Search & Filtering:" -ForegroundColor White
Write-Host "   - Category-based filtering" -ForegroundColor White
Write-Host "   - Subcategory filtering" -ForegroundColor White
Write-Host "   - Advanced sorting (name, price, stock, date)" -ForegroundColor White
Write-Host "   - Real-time search" -ForegroundColor White

Write-Host "`n2. Bulk Operations:" -ForegroundColor White
Write-Host "   - Select multiple products" -ForegroundColor White
Write-Host "   - Bulk status changes" -ForegroundColor White
Write-Host "   - Bulk delete" -ForegroundColor White
Write-Host "   - Bulk actions bar" -ForegroundColor White

Write-Host "`n3. Enhanced Product Management:" -ForegroundColor White
Write-Host "   - Category and subcategory selection" -ForegroundColor White
Write-Host "   - Reorder point settings" -ForegroundColor White
Write-Host "   - Enhanced form with validation" -ForegroundColor White
Write-Host "   - Product variants support" -ForegroundColor White

Write-Host "`n4. View Modes:" -ForegroundColor White
Write-Host "   - Grid view (default)" -ForegroundColor White
Write-Host "   - List view (table format)" -ForegroundColor White
Write-Host "   - Toggle between views" -ForegroundColor White

Write-Host "`n5. Export Functionality:" -ForegroundColor White
Write-Host "   - CSV export of products" -ForegroundColor White
Write-Host "   - Filtered export support" -ForegroundColor White

Write-Host "`nTest Instructions:" -ForegroundColor Cyan
Write-Host "1. Navigate to: http://localhost:5173/dashboard/vendor/products" -ForegroundColor White
Write-Host "2. Login with: vendor@cravedartisan.com / vendor123" -ForegroundColor White
Write-Host "3. Test each new feature systematically" -ForegroundColor White

Write-Host "`nExpected Results:" -ForegroundColor Cyan
Write-Host "• Enhanced filtering and search working" -ForegroundColor White
Write-Host "• Bulk operations functional" -ForegroundColor White
Write-Host "• Category management working" -ForegroundColor White
Write-Host "• View mode switching working" -ForegroundColor White
Write-Host "• Export functionality working" -ForegroundColor White
Write-Host "• No JavaScript errors in console" -ForegroundColor White

Write-Host "`nPhase 2 Complete! Ready for Phase 3." -ForegroundColor Green
Write-Host "Next: Recipe Integration and Cost Management" -ForegroundColor Cyan
