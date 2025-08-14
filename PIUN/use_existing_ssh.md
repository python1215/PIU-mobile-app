# Using Your Existing SSH Connection for SQL Server

I can see you have SSH access already established to your machine. Let's use this existing connection to access SQL Server.

## Option 1: Port Forward Through Existing SSH

Since you're already connected via SSH, run this command in your local terminal (on your Windows machine):

```bash
# Forward SQL Server port through the existing connection
ssh -L 1433:localhost:1433 localhost
```

Or alternatively, modify your existing SSH connection to include port forwarding.

## Option 2: Use VS Code Port Forwarding

If you're using VS Code with Remote SSH:

1. In VS Code, open the Command Palette (Ctrl+Shift+P)
2. Type "Forward a Port"  
3. Enter `1433`
4. Select "Forward Port"
5. This creates a tunnel: localhost:1433 → your-machine:1433

## Option 3: Direct Connection (Simplest)

Since SSH is working, let's configure SQL Server for direct remote access:

### On Your Windows Machine:
1. **SQL Server Configuration Manager**
   - Enable TCP/IP protocol
   - Set port to 1433
   - Restart SQL Server

2. **Windows Firewall** 
   - Allow inbound port 1433

3. **SQL Server Authentication**
   - Enable mixed mode authentication
   - Verify 'nawec' user exists

Then from Replit, we can connect directly to 192.168.0.102:1433

## Test Connection

After setting up any of the above options:
```bash
export USE_SQL_SERVER=true
python test_tunnel_connection.py
```

Which option would you prefer to try first?