#!/bin/bash

# Script to show server URL for Torque Pro configuration
# Usage: ./show-server-url.sh

echo "============================================"
echo "   Torque Dash - Server URL Configuration"
echo "============================================"
echo ""

# Get port from config or default
PORT=3000

# Try to detect public IP
echo "🌐 Detecting server IP addresses..."
echo ""

# Public IP
PUBLIC_IP=$(curl -4 -s ifconfig.me 2>/dev/null || curl -4 -s icanhazip.com 2>/dev/null || echo "Unable to detect")

# Local IP
if command -v hostname &> /dev/null; then
    LOCAL_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "Unable to detect")
else
    LOCAL_IP=$(ip addr show | grep "inet " | grep -v "127.0.0.1" | awk '{print $2}' | cut -d/ -f1 | head -1)
fi

echo "📍 Server IP Addresses:"
echo "   Public IP:  $PUBLIC_IP"
echo "   Local IP:   $LOCAL_IP"
echo ""

echo "============================================"
echo "   Configuration for Torque Pro"
echo "============================================"
echo ""

echo "Open Torque Pro app and go to:"
echo "Settings → Data Logging & Upload"
echo ""

echo "Configure the following:"
echo ""
echo "1️⃣  Email Address:"
echo "    └─ Your registered email in Torque Dash"
echo ""

echo "2️⃣  Webserver URL:"
echo ""

if [ "$PUBLIC_IP" != "Unable to detect" ]; then
    echo "    For INTERNET access (from anywhere):"
    echo "    ┌────────────────────────────────────────────"
    echo "    │ http://$PUBLIC_IP:$PORT/api/upload"
    echo "    └────────────────────────────────────────────"
    echo ""
fi

if [ "$LOCAL_IP" != "Unable to detect" ]; then
    echo "    For LOCAL NETWORK access (same WiFi):"
    echo "    ┌────────────────────────────────────────────"
    echo "    │ http://$LOCAL_IP:$PORT/api/upload"
    echo "    └────────────────────────────────────────────"
    echo ""
fi

echo "============================================"
echo ""

echo "💡 Tips:"
echo "   • Use PUBLIC IP if accessing from mobile data"
echo "   • Use LOCAL IP if on same WiFi network"
echo "   • Make sure port $PORT is open in firewall"
echo ""

# Check if firewall is blocking
if command -v ufw &> /dev/null; then
    UFW_STATUS=$(sudo ufw status 2>/dev/null | grep "$PORT" | head -1)
    if [ -z "$UFW_STATUS" ]; then
        echo "⚠️  WARNING: Port $PORT may not be open in firewall!"
        echo "   Run: sudo ufw allow $PORT/tcp"
        echo ""
    fi
fi

echo "🌐 Test in browser:"
if [ "$LOCAL_IP" != "Unable to detect" ]; then
    echo "   http://$LOCAL_IP:$PORT"
fi
echo ""

echo "✅ After configuration, start your drive and data"
echo "   will automatically upload to your dashboard!"
echo ""

