# PowerShell script to show server URL for Torque Pro configuration
# Usage: .\show-server-url.ps1

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   Torque Dash - Server URL Configuration" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Get port from config or default
$PORT = 3000

# Try to detect public IP
Write-Host "🌐 Detecting server IP addresses..." -ForegroundColor Yellow
Write-Host ""

# Public IP
try {
    $PUBLIC_IP = (Invoke-WebRequest -Uri "https://ifconfig.me/ip" -UseBasicParsing -TimeoutSec 5).Content.Trim()
} catch {
    $PUBLIC_IP = "Unable to detect"
}

# Local IP
try {
    $LOCAL_IP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -notlike "*Loopback*" -and $_.IPAddress -notlike "169.254.*"})[0].IPAddress
} catch {
    $LOCAL_IP = "Unable to detect"
}

Write-Host "📍 Server IP Addresses:" -ForegroundColor Green
Write-Host "   Public IP:  $PUBLIC_IP"
Write-Host "   Local IP:   $LOCAL_IP"
Write-Host ""

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   Configuration for Torque Pro" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Open Torque Pro app and go to:" -ForegroundColor Yellow
Write-Host "Settings → Data Logging & Upload"
Write-Host ""

Write-Host "Configure the following:"
Write-Host ""
Write-Host "1️⃣  Email Address:" -ForegroundColor Green
Write-Host "    └─ Your registered email in Torque Dash"
Write-Host ""

Write-Host "2️⃣  Webserver URL:" -ForegroundColor Green
Write-Host ""

if ($PUBLIC_IP -ne "Unable to detect") {
    Write-Host "    For INTERNET access (from anywhere):" -ForegroundColor Yellow
    Write-Host "    ┌────────────────────────────────────────────" -ForegroundColor DarkGray
    Write-Host "    │ http://$PUBLIC_IP`:$PORT/api/upload" -ForegroundColor White
    Write-Host "    └────────────────────────────────────────────" -ForegroundColor DarkGray
    Write-Host ""
}

if ($LOCAL_IP -ne "Unable to detect") {
    Write-Host "    For LOCAL NETWORK access (same WiFi):" -ForegroundColor Yellow
    Write-Host "    ┌────────────────────────────────────────────" -ForegroundColor DarkGray
    Write-Host "    │ http://$LOCAL_IP`:$PORT/api/upload" -ForegroundColor White
    Write-Host "    └────────────────────────────────────────────" -ForegroundColor DarkGray
    Write-Host ""
}

Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "💡 Tips:" -ForegroundColor Yellow
Write-Host "   • Use PUBLIC IP if accessing from mobile data"
Write-Host "   • Use LOCAL IP if on same WiFi network"
Write-Host "   • Make sure port $PORT is open in firewall"
Write-Host ""

# Check if firewall rule exists
$firewallRule = Get-NetFirewallRule -DisplayName "Torque Dash*" -ErrorAction SilentlyContinue
if (-not $firewallRule) {
    Write-Host "⚠️  WARNING: Firewall rule may not be configured!" -ForegroundColor Red
    Write-Host "   Run as Administrator:" -ForegroundColor Yellow
    Write-Host "   New-NetFirewallRule -DisplayName 'Torque Dash' -Direction Inbound -LocalPort $PORT -Protocol TCP -Action Allow"
    Write-Host ""
}

Write-Host "🌐 Test in browser:" -ForegroundColor Yellow
if ($LOCAL_IP -ne "Unable to detect") {
    Write-Host "   http://$LOCAL_IP`:$PORT"
}
Write-Host ""

Write-Host "✅ After configuration, start your drive and data" -ForegroundColor Green
Write-Host "   will automatically upload to your dashboard!" -ForegroundColor Green
Write-Host ""

