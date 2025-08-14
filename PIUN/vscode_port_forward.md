# VS Code Port Forwarding for SQL Server

Since you have VS Code connected via SSH, use VS Code's built-in port forwarding:

## Steps in VS Code:

1. **Open Command Palette**: `Ctrl + Shift + P`
2. **Type**: `Forward a Port`
3. **Enter Port**: `1433`
4. **Press Enter**

VS Code will create a secure tunnel from your local machine's SQL Server port 1433 to Replit.

## Alternative Method:

1. **View Menu** → **Terminal** → **New Terminal**
2. **In VS Code Terminal**: `ssh -L 1433:localhost:1433 localhost`
3. **Keep terminal open**

## Test Connection:

After setting up port forwarding in VS Code:
```bash
python test_tunnel_connection.py
```

## Expected Result:
- ✅ Port 1433 accessible through tunnel
- ✅ SQL Server connection successful  
- ✅ Django ORM connection successful

This is the easiest method since VS Code handles all the SSH complexity for you.