# SSH Tunnel Setup for MS SQL Server Connection

## Your Configuration
- **Database**: piuprod3
- **User**: nawec  
- **Password**: password
- **Host**: PGOMEZ\PGOMEZ (SQL Server instance)
- **Port**: 1433

## Steps to Connect from Replit

### Step 1: Create SSH Tunnel
From Replit Shell, run:
```bash
# Replace 'your-username' and 'your-local-ip' with your actual values
ssh -L 1433:localhost:1433 your-username@your-local-ip

# Example:
# ssh -L 1433:localhost:1433 pgomez@192.168.1.100
```

**Important**: Keep this SSH terminal open while using the database.

### Step 2: Set Environment Variables
Set these in Replit secrets or export them:
```bash
export USE_SQL_SERVER=true
export MSSQL_DATABASE=piuprod3
export MSSQL_USER=nawec
export MSSQL_PASSWORD=password
export MSSQL_HOST="PGOMEZ\\PGOMEZ"
export MSSQL_PORT=1433
```

### Step 3: Test Connection
```bash
python test_mssql_connection.py
```

### Step 4: Run Migrations (if needed)
```bash
python manage.py migrate
```

## Troubleshooting

### Common Issues:
1. **SSH Connection Refused**: Ensure SSH service is running on your local machine
2. **SQL Server Connection Failed**: Check if SQL Server is running and TCP/IP is enabled
3. **Authentication Failed**: Verify nawec user credentials in SQL Server
4. **Port Already in Use**: Use a different local port: `ssh -L 1434:localhost:1433 ...`

### Local Machine Setup Checklist:
- ✅ SQL Server is running
- ✅ TCP/IP protocol enabled (port 1433)
- ✅ User 'nawec' exists with proper permissions
- ✅ Windows Firewall allows port 1433
- ✅ SSH server is installed and running
- ✅ Network connectivity between Replit and your machine

## Testing the Setup

1. **Test SSH**: `ssh your-username@your-local-ip`
2. **Test SQL Server locally**: Connect via SSMS with nawec user
3. **Test from Replit**: Use the test script after setting up the tunnel