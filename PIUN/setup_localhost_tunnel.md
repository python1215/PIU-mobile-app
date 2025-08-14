# Setup Localhost SQL Server Connection

Configuration updated to use 127.0.0.1 (localhost) for SQL Server connection.

## Current Configuration:
- **Host**: 127.0.0.1 (localhost)
- **Port**: 1433
- **Database**: piuprod3
- **User**: nawec

## Required: Port Forwarding Setup

Since we're using localhost, you need to forward port 1433 from your machine to Replit.

### Method 1: VS Code Port Forwarding (Easiest)
If using VS Code Remote:
1. **Command Palette**: `Ctrl + Shift + P`
2. **Type**: "Forward a Port"
3. **Enter**: `1433`
4. **Result**: VS Code forwards your local SQL Server to Replit

### Method 2: SSH Tunnel
From your local machine terminal:
```bash
ssh -L 1433:localhost:1433 username@replit-machine
```

### Method 3: Direct SSH (if you have SSH access to the SQL Server machine)
```bash
ssh -L 1433:localhost:1433 pgomez@192.168.0.102
```

## Test Connection:
After setting up port forwarding:
```bash
python test_after_config.py
```

## Expected Result:
- Port 1433 accessible on localhost
- SQL Server connection successful
- Django ORM connects automatically

The localhost configuration is now active and ready for port forwarding.