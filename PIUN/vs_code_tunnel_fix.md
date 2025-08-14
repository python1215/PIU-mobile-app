# VS Code Port Forwarding Fix Guide

## Problem
VS Code UI shows port 1433 as forwarded, but Replit gets "connection refused" error 111.

## Root Cause  
VS Code Remote Tunnels sometimes shows ports as active in the UI while the actual tunnel isn't working.

## Solutions (Try in Order)

### 1. Refresh Port Forwarding (Most Common Fix)

**Remove existing forward:**
1. VS Code → View → Terminal → Ports tab (bottom panel)
2. Find port 1433 in the list
3. Right-click → "Remove Port"
4. Wait 10 seconds for cleanup

**Add fresh forward:**
1. Click "+" (Forward a Port)
2. Enter: `1433`
3. Select: `localhost:1433` (not 127.0.0.1)
4. Verify status shows "Running" (not "Not Found")

### 2. Try Different Port

**If port 1433 continues to fail:**
1. Forward port `14330` → `localhost:1433`
2. Update `.env`: `MSSQL_PORT=14330`
3. Test connection

### 3. Restart VS Code Tunnel

**Complete restart:**
1. Command Palette (`Ctrl+Shift+P`)
2. Type: "Remote-Tunnels: Close Tunnel"
3. Close VS Code completely
4. Restart VS Code
5. Reconnect to tunnel
6. Forward port 1433 again

### 4. Use Different Host Format

Try forwarding to different addresses:
- `localhost:1433` (preferred)
- `127.0.0.1:1433`
- `0.0.0.0:1433`

### 5. Alternative - ngrok

**If VS Code tunneling continues to fail:**
1. Download ngrok for Windows
2. Run: `ngrok tcp 1433`
3. Use ngrok tunnel URL in Django settings

## Testing Commands

**After each fix attempt, test from Replit:**
```bash
python test_and_activate_sql.py
```

**Or manual test:**
```bash
python -c "import socket; sock = socket.create_connection(('127.0.0.1', 1433), 5); print('Connected!')"
```

## Success Indicators

When working properly, you'll see:
- VS Code Ports panel: Status = "Running"
- Replit test: "✅ Connected to SQL Server database: piuprod3"
- Socket test: No connection refused errors

## Current Workaround

Django is running with SQLite and full functionality. The system will automatically switch to SQL Server once the tunnel works.