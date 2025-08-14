#!/bin/bash
echo "Testing connection to MS SQL Server via SSH tunnel..."

# Set environment
export USE_SQL_SERVER=true
export MSSQL_DATABASE=piuprod3
export MSSQL_USER=nawec
export MSSQL_PASSWORD=password
export MSSQL_HOST=127.0.0.1
export MSSQL_PORT=1433

echo "Environment configured for MS SQL Server"
echo "Host: 192.168.0.102 (via SSH tunnel)"
echo "Database: piuprod3"

# Test tunnel
timeout 3 bash -c "</dev/tcp/127.0.0.1/1433" 2>/dev/null && echo "✅ SSH tunnel active" || echo "❌ SSH tunnel needed"

# Test Django connection
python test_tunnel_connection.py
