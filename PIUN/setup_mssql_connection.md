# MS SQL Server Connection Setup Guide

## Step 1: Configure Your Local SQL Server

### 1.1 Enable TCP/IP Protocol:
- Open **SQL Server Configuration Manager**
- Navigate to **SQL Server Network Configuration** → **Protocols for [Your Instance]**
- Right-click **TCP/IP** → **Enable**
- Right-click **TCP/IP** → **Properties** → **IP Addresses** tab
- Scroll to **IPALL** section at bottom
- Set **TCP Port** to **1433**
- Restart SQL Server service

### 1.2 Configure SQL Server Authentication:
- Open **SQL Server Management Studio (SSMS)**
- Right-click server → **Properties** → **Security**
- Select **SQL Server and Windows Authentication mode**
- Create a new login:
  ```sql
  CREATE LOGIN replit_user WITH PASSWORD = 'YourStrongPassword123!';
  CREATE USER replit_user FOR LOGIN replit_user;
  -- Grant necessary permissions
  ALTER ROLE db_datareader ADD MEMBER replit_user;
  ALTER ROLE db_datawriter ADD MEMBER replit_user;
  ALTER ROLE db_ddladmin ADD MEMBER replit_user;
  ```

### 1.3 Configure Windows Firewall:
- Open **Windows Defender Firewall**
- Click **Advanced settings**
- Click **Inbound Rules** → **New Rule**
- Select **Port** → **TCP** → **Specific local ports: 1433**
- Allow the connection
- Apply to all profiles

## Step 2: Set Up SSH Access on Your Local Machine

### 2.1 Enable OpenSSH Server:
- **Windows 10/11**: Go to **Settings** → **Apps** → **Optional Features** → Add **OpenSSH Server**
- **Or via PowerShell (as Admin)**:
  ```powershell
  Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0
  Start-Service sshd
  Set-Service -Name sshd -StartupType 'Automatic'
  ```

### 2.2 Configure SSH (optional):
- Edit `C:\ProgramData\ssh\sshd_config` if needed
- Restart SSH service: `Restart-Service sshd`

## Step 3: Set Up Environment Variables in Replit

Create a `.env` file or set environment variables:

```bash
USE_SQL_SERVER=true
MSSQL_DATABASE=your_database_name
MSSQL_USER=replit_user
MSSQL_PASSWORD=YourStrongPassword123!
MSSQL_HOST=127.0.0.1
MSSQL_PORT=1433
```

## Step 4: Create SSH Tunnel from Replit

### 4.1 From Replit Shell:
```bash
# Replace with your actual local machine details
ssh -L 1433:localhost:1433 your_windows_user@your.local.ip.address

# Example:
# ssh -L 1433:localhost:1433 john@192.168.1.100
```

### 4.2 Keep tunnel open:
- The SSH connection must remain active while using the database
- Consider using `screen` or `tmux` to keep it running in background

## Step 5: Test the Connection

```bash
# Test from Replit shell
python manage.py dbshell

# Or test connection
python manage.py shell -c "
from django.db import connection
cursor = connection.cursor()
cursor.execute('SELECT 1')
print('Connection successful!')
"
```

## Troubleshooting:

### Common Issues:
1. **Connection timeout**: Check firewall settings and SQL Server is running
2. **Authentication failed**: Verify SQL Server login credentials
3. **SSH connection refused**: Ensure SSH service is running on local machine
4. **Port already in use**: Use different local port: `ssh -L 1434:localhost:1433 ...`

### Commands to diagnose:
```bash
# Test SSH connection
ssh your_user@your_ip

# Check if SQL Server is listening
telnet localhost 1433  # (after SSH tunnel)

# Check Django database connection
python manage.py migrate --dry-run
```

## Security Notes:
- Use strong passwords for SQL Server login
- Consider using SSH key authentication instead of passwords
- Enable SSL/TLS encryption for SQL Server
- Keep your local machine's SSH service updated
- Consider using VPN for additional security layer