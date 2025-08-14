#!/bin/bash
# SSH Tunnel Setup Script for MS SQL Server Connection

echo "🔧 Setting up SSH tunnel for MS SQL Server connection..."
echo ""
echo "Your SQL Server Configuration:"
echo "  - Database: piuprod3"
echo "  - Instance: PGOMEZ\\PGOMEZ"
echo "  - User: nawec"
echo "  - Port: 1433"
echo ""

echo "📋 SSH Tunnel Command:"
echo "From Replit Shell, run:"
echo ""
echo "ssh -L 1433:localhost:1433 pgomez@192.168.0.102"
echo ""
echo "Replace YOUR_LOCAL_IP with your actual local machine IP address."
echo ""

echo "🔍 To find your local IP address:"
echo "On Windows: ipconfig"
echo "On Mac/Linux: ifconfig"
echo ""

echo "✅ After tunnel is established, test with:"
echo "python test_tunnel_connection.py"
echo ""

echo "🚀 Then activate MS SQL Server mode:"
echo "export USE_SQL_SERVER=true"
echo "python manage.py migrate"
echo ""

# Check current tunnel status
echo "Current tunnel status:"
timeout 2 bash -c "</dev/tcp/127.0.0.1/1433" 2>/dev/null && echo "✅ Port 1433 accessible" || echo "❌ Port 1433 not accessible - tunnel needed"