# Cursor AI Connectivity Diagnostics
# This script helps diagnose Cursor AI connection issues

Write-Host "=== CURSOR AI CONNECTIVITY DIAGNOSTICS ===" -ForegroundColor Cyan
Write-Host "Request ID from error: 51bddc68-5b39-4976-bfc4-9923b359243c" -ForegroundColor Yellow
Write-Host ""

# Check internet connectivity
Write-Host "1. Testing Internet Connectivity" -ForegroundColor Green
try {
    $ping = Test-NetConnection -ComputerName "8.8.8.8" -Port 443 -InformationLevel Quiet
    if ($ping) {
        Write-Host "[OK] Internet connection: WORKING" -ForegroundColor Green
    } else {
        Write-Host "[FAIL] Internet connection: FAILED" -ForegroundColor Red
    }
} catch {
    Write-Host "[ERROR] Internet connection: $($_.Exception.Message)" -ForegroundColor Red
}

# Check OpenAI API accessibility
Write-Host "`n2. Testing OpenAI API Accessibility" -ForegroundColor Green
try {
    $response = Invoke-WebRequest -Uri "https://api.openai.com/v1/models" -Method GET -TimeoutSec 10 -UseBasicParsing
    Write-Host "[OK] OpenAI API reachable (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "[FAIL] OpenAI API unreachable: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Message -like "*SSL*" -or $_.Exception.Message -like "*certificate*") {
        Write-Host "   SUGGESTION: SSL/Certificate issue - check corporate firewall" -ForegroundColor Yellow
    }
    if ($_.Exception.Message -like "*timeout*") {
        Write-Host "   SUGGESTION: Network timeout - check proxy settings" -ForegroundColor Yellow
    }
}

# Check DNS resolution
Write-Host "`n3. Testing DNS Resolution" -ForegroundColor Green
try {
    $dns = Resolve-DnsName -Name "api.openai.com" -ErrorAction Stop
    Write-Host "[OK] DNS resolution for api.openai.com: WORKING" -ForegroundColor Green
    Write-Host "   IP addresses: $($dns.IPAddress -join ', ')" -ForegroundColor Gray
} catch {
    Write-Host "[FAIL] DNS resolution failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   SUGGESTION: Check DNS settings or use public DNS (8.8.8.8)" -ForegroundColor Yellow
}

# Check for proxy settings
Write-Host "`n4. Checking Proxy Configuration" -ForegroundColor Green
$proxySettings = Get-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings" -ErrorAction SilentlyContinue
if ($proxySettings.ProxyEnable -eq 1) {
    Write-Host "[WARN] Proxy enabled: $($proxySettings.ProxyServer)" -ForegroundColor Yellow
    Write-Host "   SUGGESTION: Cursor may need proxy configuration for AI features" -ForegroundColor Yellow
} else {
    Write-Host "[OK] No system proxy detected" -ForegroundColor Green
}

# Check Windows Defender / Firewall
Write-Host "`n5. Checking Windows Security" -ForegroundColor Green
try {
    $firewallProfiles = Get-NetFirewallProfile
    $blockedProfiles = $firewallProfiles | Where-Object { $_.Enabled -eq $true }
    if ($blockedProfiles.Count -gt 0) {
        Write-Host "[WARN] Windows Firewall active on profiles: $($blockedProfiles.Name -join ', ')" -ForegroundColor Yellow
        Write-Host "   SUGGESTION: Cursor.exe may need firewall exception" -ForegroundColor Yellow
    } else {
        Write-Host "[OK] Windows Firewall disabled" -ForegroundColor Green
    }
} catch {
    Write-Host "[ERROR] Cannot check firewall status: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== CURSOR AI ERROR ANALYSIS ===" -ForegroundColor Magenta
Write-Host "Error Type      : ERROR_OPENAI" -ForegroundColor White
Write-Host "Status          : [unavailable] Error" -ForegroundColor White
Write-Host "Request ID      : 51bddc68-5b39-4976-bfc4-9923b359243c" -ForegroundColor White
Write-Host "Provider        : OpenAI" -ForegroundColor White
Write-Host "Issue           : Unable to reach the model provider" -ForegroundColor White

Write-Host "`n=== SUGGESTED SOLUTIONS (in order of likelihood) ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "SOLUTION 1: Temporary OpenAI Service Issue" -ForegroundColor Yellow
Write-Host "   - Wait 5-10 minutes and try again" -ForegroundColor Gray
Write-Host "   - Check OpenAI status: https://status.openai.com" -ForegroundColor Gray
Write-Host ""
Write-Host "SOLUTION 2: Network/Firewall Blocking" -ForegroundColor Yellow
Write-Host "   - Add Cursor.exe to firewall exceptions" -ForegroundColor Gray
Write-Host "   - Configure corporate proxy if behind corporate firewall" -ForegroundColor Gray
Write-Host "   - Try different network (mobile hotspot) to test" -ForegroundColor Gray
Write-Host ""
Write-Host "SOLUTION 3: Cursor Configuration Issue" -ForegroundColor Yellow
Write-Host "   - Restart Cursor completely (close all windows)" -ForegroundColor Gray
Write-Host "   - Check Cursor settings for AI provider configuration" -ForegroundColor Gray
Write-Host "   - Try switching to different AI model in Cursor settings" -ForegroundColor Gray
Write-Host ""
Write-Host "SOLUTION 4: API Key/Authentication Issue" -ForegroundColor Yellow
Write-Host "   - Check if Cursor AI subscription is active" -ForegroundColor Gray
Write-Host "   - Verify Cursor account status" -ForegroundColor Gray
Write-Host "   - Re-authenticate in Cursor if possible" -ForegroundColor Gray

Write-Host "`n=== NEXT STEPS ===" -ForegroundColor Green
Write-Host "1. Check https://status.openai.com for service status" -ForegroundColor White
Write-Host "2. Restart Cursor and try a simple AI query" -ForegroundColor White
Write-Host "3. If still failing, try different network connection" -ForegroundColor White
Write-Host "4. Contact Cursor support with Request ID: 51bddc68-5b39-4976-bfc4-9923b359243c" -ForegroundColor White

Write-Host "`nDiagnostics completed!" -ForegroundColor Green