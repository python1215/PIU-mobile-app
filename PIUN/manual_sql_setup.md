# Manual SQL Server Setup (5 Minutes)

## Problem
Your SQL Server is not configured for remote connections. Port 1433 is blocked.

## Solution: Quick Windows Setup

### Step 1: SQL Server Configuration Manager
1. Press `Win + R`, type `SQLServerManager15.msc` (or your version)
2. Expand **SQL Server Network Configuration**
3. Click **Protocols for MSSQLSERVER**
4. Right-click **TCP/IP** → **Enable**
5. Right-click **TCP/IP** → **Properties**
6. Go to **IP Addresses** tab
7. Scroll to bottom → **IPALL** section
8. Set **TCP Port** to `1433`
9. Click **OK**

### Step 2: Restart SQL Server
1. Open **Services** (`Win + R` → `services.msc`)
2. Find **SQL Server (MSSQLSERVER)**
3. Right-click → **Restart**

### Step 3: Windows Firewall
1. Press `Win + R`, type `wf.msc`
2. Click **Inbound Rules** → **New Rule**
3. Select **Port** → **Next**
4. **TCP** → **Specific local ports** → `1433` → **Next**
5. **Allow the connection** → **Next**
6. Check all profiles → **Next**
7. Name: `SQL Server` → **Finish**

### Step 4: SQL Server Authentication
1. Open **SQL Server Management Studio**
2. Connect to **PGOMEZ\PGOMEZ**
3. Right-click server → **Properties**
4. Go to **Security** tab
5. Select **SQL Server and Windows Authentication mode**
6. Click **OK**
7. Restart SQL Server service

### Step 5: Verify User
In SSMS, run:
```sql
-- Check if nawec user exists
SELECT name FROM sys.sql_logins WHERE name = 'nawec'

-- If not exists:
CREATE LOGIN nawec WITH PASSWORD = 'password'
USE piuprod3
CREATE USER nawec FOR LOGIN nawec
ALTER ROLE db_owner ADD MEMBER nawec
```

### Step 6: Test from Replit
After completing all steps:
```bash
python fix_sql_connection.py
```

## Expected Result
- Port 1433 becomes accessible
- SQL Server accepts connections from Replit
- Django connects successfully

## If Still Not Working
- Disable Windows Firewall temporarily to test
- Check SQL Server error logs
- Verify SQL Server service is running
- Try different port (1434) if 1433 is blocked