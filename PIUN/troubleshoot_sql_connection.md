# Troubleshoot SQL Server Connection

VS Code port forwarding is active but SQL Server connection is still failing.

## Current Status:
- ✅ VS Code shows port 1433 forwarded
- ❌ Port 1433 not accessible from Replit
- ❌ SQL Server connection refused

## Likely Issue:
The SQL Server on your Windows machine is not configured to accept connections, even locally.

## Required Actions on Windows Machine:

### 1. Check SQL Server Status
```cmd
# Open Command Prompt as Administrator
services.msc
# Look for "SQL Server (MSSQLSERVER)" - should be "Running"
```

### 2. Enable SQL Server TCP/IP
```
1. Run: SQLServerManager15.msc (or your version)
2. SQL Server Network Configuration → Protocols for MSSQLSERVER
3. Right-click "TCP/IP" → Enable
4. Right-click "TCP/IP" → Properties → IP Addresses
5. Find "IPALL" section → Set "TCP Port" to 1433
6. Restart SQL Server service
```

### 3. Test Local Connection on Windows
```cmd
# On your Windows machine, test if SQL Server responds locally:
telnet localhost 1433
# Should connect if SQL Server is properly configured
```

### 4. Check SQL Server Authentication
```
1. Open SQL Server Management Studio
2. Connect to PGOMEZ\PGOMEZ
3. Right-click server → Properties → Security
4. Select "SQL Server and Windows Authentication mode"
5. Restart SQL Server service
```

### 5. Verify User Exists
```sql
-- In SSMS, run these queries:
SELECT name FROM sys.sql_logins WHERE name = 'nawec'
-- If no results, create the user:
CREATE LOGIN nawec WITH PASSWORD = 'password'
USE piuprod3
CREATE USER nawec FOR LOGIN nawec
ALTER ROLE db_owner ADD MEMBER nawec
```

## Quick Test Commands:

**On Windows (Command Prompt):**
```cmd
netstat -an | findstr 1433
# Should show: TCP 0.0.0.0:1433 LISTENING
```

**After Configuration:**
```bash
# In Replit, test again:
python test_after_config.py
```

## Alternative: Use Different Port
If port 1433 is problematic, try:
1. Configure SQL Server to use port 1434
2. Update VS Code port forwarding to 1434
3. Update Django settings to use port 1434

The port forwarding is working, but SQL Server needs to be configured to accept connections.