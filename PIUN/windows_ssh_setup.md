# Windows SSH Server Setup

## The Issue
SSH connection to 192.168.0.102 timed out, which means:
- SSH server may not be running on Windows
- Windows Firewall may be blocking SSH (port 22)
- SSH service needs to be enabled

## Option 1: Enable SSH Server on Windows

### Step 1: Install OpenSSH Server
Open PowerShell as Administrator and run:
```powershell
# Install OpenSSH Server
Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0

# Start SSH service
Start-Service sshd

# Set to start automatically
Set-Service -Name sshd -StartupType 'Automatic'
```

### Step 2: Configure Windows Firewall
```powershell
# Allow SSH through firewall
New-NetFirewallRule -Name sshd -DisplayName 'OpenSSH Server (sshd)' -Enabled True -Direction Inbound -Protocol TCP -Action Allow -LocalPort 22
```

### Step 3: Test SSH
From Replit, try again:
```bash
ssh -L 1433:localhost:1433 pgomez@192.168.0.102
```

## Option 2: Direct MS SQL Server Connection (No SSH)

If SSH setup is complex, we can configure direct connection:

### Requirements:
1. SQL Server must allow remote connections
2. Windows Firewall must allow port 1433
3. SQL Server must use SQL Server Authentication

### Setup Steps:
1. **SQL Server Configuration Manager**
   - Enable TCP/IP protocol
   - Set port to 1433
   - Restart SQL Server service

2. **Windows Firewall**
   - Allow inbound connections on port 1433

3. **Update Replit Configuration**
   - Change host from 127.0.0.1 to 192.168.0.102
   - Remove SSH tunnel requirement

## Option 3: Use VS Code Tunnel (Recommended)

Since you mentioned VS Code connection exists, use VS Code's port forwarding:

1. In VS Code on Windows, open terminal
2. Forward port 1433 using VS Code's built-in tunneling
3. This creates a secure connection without SSH setup

Which option would you prefer to try first?