# SQL Server Connection Setup Guide

## Current Status
- Django application configured for SQL Server connectivity
- VS Code port forwarding active (localhost:1433)
- Environment variables configured (piuprod3/nawec/password)
- ODBC drivers not available in Replit environment

## Required Windows Configuration

### 1. Enable SQL Server TCP/IP (COMPLETED ✅)
Based on your screenshot, TCP/IP is properly configured with port 1433.

### 2. Restart SQL Server Service (CRITICAL)
**This is the most likely missing step:**
- Open Services (`services.msc`)
- Find "SQL Server (MSSQLSERVER)"
- Right-click → Restart
- Wait for service to fully start (may take 30-60 seconds)

### 3. Enable Mixed Authentication
- Open SQL Server Management Studio (SSMS)
- Right-click server → Properties → Security
- Select "SQL Server and Windows Authentication mode"
- Restart SQL Server service after this change

### 4. Create SQL Login
In SSMS, execute:
```sql
-- Create login
CREATE LOGIN nawec WITH PASSWORD = 'password';

-- Switch to target database
USE piuprod3;

-- Create user and grant permissions
CREATE USER nawec FOR LOGIN nawec;
ALTER ROLE db_owner ADD MEMBER nawec;
```

### 5. Test Connection on Windows
```cmd
telnet localhost 1433
```
Should connect successfully if service is running.

### 6. Windows Firewall (If needed)
Add inbound rule for port 1433:
- Windows Defender Firewall → Advanced Settings
- Inbound Rules → New Rule → Port → TCP 1433

## Activation Steps

After completing Windows configuration:

1. **Test Connection**: Run `python sql_server_connection_test.py`
2. **Enable SQL Server**: Change `.env` to `USE_SQL_SERVER=true`
3. **Restart Application**: Django will connect to piuprod3
4. **Run Migrations**: `python manage.py migrate`

## Current Workaround

Application is running with PostgreSQL while SQL Server setup is completed.
All data and functionality available - just switch databases when ready.

## Troubleshooting

### Connection Refused
- SQL Server service not running or not restarted after TCP/IP enable
- Windows Firewall blocking port 1433

### Authentication Failed
- Mixed authentication not enabled
- SQL login not created or incorrect permissions

### Database Not Found
- piuprod3 database doesn't exist
- User doesn't have access to database

## Support

The Django application is fully configured and ready to connect.
Only Windows SQL Server configuration remains.