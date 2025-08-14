# SQL Server Connection Troubleshooting

## Current Status
- **Windows SQL Server**: ✅ Running and accessible (Test-NetConnection successful)
- **VS Code Port Forwarding**: ⚠️ UI shows active but connection failing
- **Replit Connection**: ❌ Error 111 (Connection refused)

## Root Cause Analysis
VS Code port forwarding interface shows port 1433 as forwarded, but traffic is not reaching the Windows machine. This is a common VS Code Remote tunneling issue.

## Solutions (Try in order)

### 1. Refresh VS Code Port Forwarding

**Method A - Remove and Re-add:**
1. VS Code → Ports panel (bottom)
2. Right-click port 1433 → "Remove Port"
3. Click "+" → "Forward a Port" 
4. Enter: `1433`
5. Select: `127.0.0.1:1433`

**Method B - Command Palette:**
1. `Ctrl+Shift+P`
2. Type: `Remote-Tunnels: Forward Port from Active Host`
3. Port: `1433`
4. Address: `127.0.0.1:1433`

### 2. Alternative Port Numbers

Try forwarding a different port:
1. Forward port `14330` to `127.0.0.1:1433`
2. Update Replit connection to use port 14330

### 3. SSH Tunnel Alternative

If VS Code forwarding continues to fail, set up direct SSH:

**Windows (if SSH server enabled):**
```bash
ssh -L 1433:localhost:1433 username@your-windows-ip
```

### 4. Verify SQL Server Configuration

**On Windows, confirm:**
1. **SQL Server Configuration Manager**:
   - SQL Server Services → SQL Server (MSSQLSERVER) → Status: Running
   - SQL Server Network Configuration → Protocols → TCP/IP: Enabled

2. **Test Local Connection**:
   ```cmd
   sqlcmd -S localhost -U nawec -P password -d piuprod3
   ```

3. **Create SQL Login** (if authentication fails):
   ```sql
   CREATE LOGIN nawec WITH PASSWORD = 'password';
   USE piuprod3;
   CREATE USER nawec FOR LOGIN nawec;
   ALTER ROLE db_owner ADD MEMBER nawec;
   ```

## Verification Commands

**From Replit (when working):**
```bash
python test_and_activate_sql.py
```

**Expected Success Output:**
```
✅ Connected to SQL Server database: piuprod3
🎉 SQL Server connection successful!
```

## Current Workaround
Django is running with SQLite (`db.sqlite3`) with full functionality. The system will automatically switch to SQL Server once the connection works.

## Next Steps After Connection Works
1. `python manage.py migrate` - Apply migrations to SQL Server
2. `python manage.py createsuperuser` - Create admin user
3. Import existing data from SQLite if needed

The Django configuration is complete - only the network connection needs to be established.