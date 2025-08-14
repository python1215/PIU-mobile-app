# Enable Remote Access to SQL Server

Since SSH timed out, let's configure SQL Server for direct remote connections.

## Step 1: SQL Server Configuration Manager

1. Open **SQL Server Configuration Manager**
2. Expand **SQL Server Network Configuration**
3. Click **Protocols for MSSQLSERVER** (or your instance name)
4. Right-click **TCP/IP** → **Enable**
5. Right-click **TCP/IP** → **Properties**
6. Go to **IP Addresses** tab
7. Scroll to **IPALL** section
8. Set **TCP Port** to **1433**
9. **Restart SQL Server service**

## Step 2: Windows Firewall

Open Windows Firewall and create inbound rule:
1. **Control Panel** → **System and Security** → **Windows Defender Firewall**
2. Click **Advanced settings**
3. **Inbound Rules** → **New Rule**
4. **Port** → **TCP** → **Specific local ports: 1433**
5. **Allow the connection**
6. Apply to all profiles
7. Name: "SQL Server"

## Step 3: SQL Server Authentication

1. Open **SQL Server Management Studio (SSMS)**
2. Connect to your server (PGOMEZ\PGOMEZ)
3. Right-click server → **Properties**
4. Go to **Security** page
5. Select **SQL Server and Windows Authentication mode**
6. Click **OK** and restart SQL Server

## Step 4: Verify 'nawec' User

In SSMS:
```sql
-- Check if user exists
SELECT name FROM sys.sql_logins WHERE name = 'nawec'

-- If not exists, create user:
CREATE LOGIN nawec WITH PASSWORD = 'password'
USE piuprod3
CREATE USER nawec FOR LOGIN nawec
EXEC sp_addrolemember 'db_owner', 'nawec'
```

## Step 5: Test from Replit

After configuration:
```bash
export USE_SQL_SERVER=true
python test_mssql_connection.py
```

## Alternative: VS Code Port Forwarding

If you have VS Code connected:
1. In VS Code, open Command Palette (Ctrl+Shift+P)
2. Type "Forward a Port"
3. Enter port 1433
4. This creates a secure tunnel without SSH setup
5. Use 127.0.0.1:1433 in Replit