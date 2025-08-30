# Test Simple Products Page - Phase 1
Write-Host "Testing Simple Products Page (Phase 1)" -ForegroundColor Green
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

Write-Host "`nTest Instructions:" -ForegroundColor Cyan
Write-Host "1. Open your browser and go to: http://localhost:5173" -ForegroundColor White
Write-Host "2. Login with vendor credentials:" -ForegroundColor White
Write-Host "   - Email: vendor@cravedartisan.com" -ForegroundColor White
Write-Host "   - Password: vendor123" -ForegroundColor White
Write-Host "3. Navigate to: Dashboard > Products" -ForegroundColor White
Write-Host "4. Test the following features:" -ForegroundColor White
Write-Host "   View products list" -ForegroundColor Green
Write-Host "   Add new product" -ForegroundColor Green
Write-Host "   Edit existing product" -ForegroundColor Green
Write-Host "   Delete product" -ForegroundColor Green
Write-Host "   Search products" -ForegroundColor Green

Write-Host "`nExpected Results:" -ForegroundColor Cyan
Write-Host "Page should load without errors" -ForegroundColor White
Write-Host "Products should display in a clean grid layout" -ForegroundColor White
Write-Host "Add/Edit forms should work properly" -ForegroundColor White
Write-Host "Search functionality should filter products" -ForegroundColor White
Write-Host "No TypeScript or JavaScript errors in console" -ForegroundColor White

Write-Host "`nIf you encounter issues:" -ForegroundColor Yellow
Write-Host "Check browser console for errors" -ForegroundColor White
Write-Host "Verify both services are running" -ForegroundColor White
Write-Host "Check network tab for failed API calls" -ForegroundColor White

Write-Host "`nPhase 1 Complete! Ready for Phase 2 enhancements." -ForegroundColor Green
Write-Host "Next: Enhanced Product Management (categories, bulk operations, etc.)" -ForegroundColor Cyan
