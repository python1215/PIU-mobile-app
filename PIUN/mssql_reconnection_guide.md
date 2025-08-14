# MS SQL Server Connection Guide

## Current Status: CONNECTION FAILED
**Date:** $(date)
**Issue:** VS Code port forwarding to localhost:14330 is not active

## Connection Requirements

### 1. Windows Machine Setup
- SQL Server instance running on `PGOMEZ\PGOMEZ`
- Database: `piuprod3`
- User: `nawec` 
- Password: `password`
- SQL Server listening on port 1433

### 2. VS Code Port Forwarding
The connection relies on VS Code Remote Tunnels to forward:
```
Windows: PGOMEZ\PGOMEZ:1433 → Replit: localhost:14330
```

## Troubleshooting Steps

### Step 1: Verify Windows SQL Server
```sql
-- On Windows machine, run in SQL Server Management Studio:
SELECT @@SERVERNAME, @@VERSION
SELECT name FROM sys.databases WHERE name = 'piuprod3'
```

### Step 2: Check VS Code Port Forwarding
1. Open VS Code on Windows machine
2. Open Remote Explorer (Ctrl+Shift+P → "Remote Explorer")
3. Check "Forwarded Ports" section
4. Verify port 1433 is forwarded to localhost:14330
5. If not present, add forward:
   - Click "Forward a Port"
   - Enter: 1433
   - Set local address: 127.0.0.1:14330

### Step 3: Test Connection from Replit
```bash
# In Replit terminal:
cd PIUN
python test_mssql_connection.py
```

## Environment Configuration

### Current Settings (.env):
```
USE_SQL_SERVER=false
MSSQL_DATABASE=piuprod3
MSSQL_USER=nawec
MSSQL_PASSWORD=password
MSSQL_HOST=127.0.0.1
MSSQL_PORT=14330
```

### To Enable SQL Server Mode:
```bash
# Set environment variable
export USE_SQL_SERVER=true

# Or update .env file
echo "USE_SQL_SERVER=true" > .env
```

## Connection Test Commands

### Test Network Connectivity:
```python
import socket
sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
result = sock.connect_ex(('127.0.0.1', 14330))
print("Connected" if result == 0 else f"Failed: {result}")
```

### Test ODBC Connection:
```python
import pyodbc
conn_str = "DRIVER={FreeTDS};SERVER=127.0.0.1,14330;DATABASE=piuprod3;UID=nawec;PWD=password;TDS_Version=8.0;"
conn = pyodbc.connect(conn_str)
cursor = conn.cursor()
cursor.execute("SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES")
print(f"Tables found: {cursor.fetchone()[0]}")
```

## Next Steps

1. **Immediate:** Check VS Code port forwarding status on Windows
2. **Verify:** SQL Server is running and accessible
3. **Test:** Run connection test script again
4. **Enable:** Set USE_SQL_SERVER=true when connection works

## Success Indicators
- ✅ Port 14330 responds to connections
- ✅ ODBC drivers available (FreeTDS preferred) 
- ✅ Raw pyodbc connection successful
- ✅ Django can connect to SQL Server
- ✅ NAWEC KPI data accessible from SQL Server

## Current Database Mode
The system is currently running in **SQLite mode** with local database at:
`/home/runner/workspace/PIUN/db.sqlite3`

KPI functionality is working with SQLite backend:
- 24 KPI Indicators
- Multiple calculation models (ROA, NPM, DSCR, etc.)
- Full dashboard functionality