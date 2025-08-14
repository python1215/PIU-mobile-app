# Quick Windows SQL Server Setup

## The Problem
- SSH connection timed out (port 22 not available)
- SQL Server port 1433 not accessible from Replit
- Need to configure Windows for remote SQL Server access

## Solution: 5-Minute Setup

### 1. Enable SQL Server TCP/IP (30 seconds)
1. Start → Run → `SQLServerManager15.msc` (or your version)
2. Expand **SQL Server Network Configuration**
3. Click **Protocols for MSSQLSERVER**
4. Right-click **TCP/IP** → **Enable**
5. **Restart SQL Server service**

### 2. Windows Firewall (30 seconds)
1. Windows Key + R → `wf.msc`
2. **Inbound Rules** → **New Rule**
3. **Port** → **TCP** → **1433** → **Allow**
4. **Apply to all profiles** → **Finish**

### 3. SQL Authentication (1 minute)
1. Open **SQL Server Management Studio**
2. Connect to **PGOMEZ\PGOMEZ**
3. Right-click server → **Properties** → **Security**
4. Select **SQL Server and Windows Authentication mode**
5. **OK** → **Restart SQL Server**

### 4. Verify User (1 minute)
In SSMS Query window:
```sql
-- Check if nawec user exists
SELECT name FROM sys.sql_logins WHERE name = 'nawec'

-- If no results, create user:
CREATE LOGIN nawec WITH PASSWORD = 'password'
USE piuprod3
CREATE USER nawec FOR LOGIN nawec
ALTER ROLE db_owner ADD MEMBER nawec
```

### 5. Test Connection (30 seconds)
From Replit:
```bash
python test_direct_connection.py
```

## Expected Result
✅ Network connection successful  
✅ PyMSSQL connection successful  
✅ Django ORM connection successful  

## If Still Not Working
- Check SQL Server service is running
- Verify instance name is PGOMEZ\PGOMEZ
- Ensure database name is exactly 'piuprod3'
- Try disabling Windows Firewall temporarily to test

## Alternative: Use Different Port
If 1433 is blocked:
1. Change SQL Server to use port 1434
2. Update Replit configuration
3. Allow port 1434 in firewall