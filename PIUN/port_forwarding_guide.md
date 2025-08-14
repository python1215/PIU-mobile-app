# VS Code Port Forwarding Troubleshooting Guide

## Current Issue
- **Windows**: SQL Server running and accessible on port 1433 ✅
- **VS Code**: Port forwarding not reaching Replit ❌
- **Result**: Connection refused from Replit to 127.0.0.1:1433

## Solution Steps

### 1. Refresh Port Forwarding (Primary Solution)

**In VS Code on Windows:**
1. Open Command Palette: `Ctrl+Shift+P`
2. Type: `Remote-Tunnels: Forward Port from Active Host`
3. Enter port: `1433`
4. Select forward to: `127.0.0.1:1433`

**Alternative method:**
1. View → Command Palette
2. Type: `Ports: Focus on Ports View`
3. Check if port 1433 is listed
4. Right-click existing 1433 → Remove → Re-add

### 2. Verify Forwarding Status

**Check Ports Panel:**
- Bottom panel in VS Code → "Ports" tab
- Port 1433 should show:
  - Status: "Running" (not "Not Found")
  - Local Address: 127.0.0.1:1433
  - Forward to: Should match Replit environment

### 3. Test Forwarding

**From Windows Command Prompt:**
```cmd
# This should work (local connection)
Test-NetConnection -ComputerName localhost -Port 1433
```

**From Replit (after fixing forwarding):**
```bash
python check_sql_server.py
```

### 4. Alternative SSH Tunnel (If VS Code fails)

**Direct SSH tunnel setup:**
```bash
# From terminal with SSH access to Windows machine
ssh -L 1433:localhost:1433 user@windows-machine
```

### 5. Firewall Check (If needed)

**Windows Firewall:**
- Windows Security → Firewall → Advanced Settings
- Inbound Rules → New Rule
- Port → TCP → 1433 → Allow

## Verification

Once port forwarding is fixed:
1. `python check_sql_server.py` should show success
2. Django application will automatically connect to piuprod3
3. Can run database migrations

## Current Django Status

- Application running with SQLite fallback
- `USE_SQL_SERVER=true` configured
- Ready to switch to SQL Server once forwarding works

The issue is purely VS Code port forwarding - all other configuration is correct.