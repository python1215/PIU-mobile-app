# SSH Tunnel Setup for MS SQL Server

## Your Current Configuration
- **Database**: piuprod3
- **SQL Server Instance**: PGOMEZ\PGOMEZ  
- **Local Port**: 1433
- **User**: nawec
- **Password**: password

## Step 1: Create SSH Tunnel from Replit

From the Replit Shell, run this command to create the tunnel:

```bash
# Replace with your actual local machine details
ssh -L 1433:localhost:1433 your-username@your-local-ip-address

# Example:
# ssh -L 1433:localhost:1433 pgomez@192.168.1.100
```

**Important**: Keep this SSH terminal window open while using the database.

## Step 2: Verify SSH Tunnel is Working

In a new Replit Shell tab, test the tunnel:

```bash
# Test if port 1433 is being forwarded
nc -zv 127.0.0.1 1433
```

You should see: "Connection to 127.0.0.1 port 1433 [tcp/ms-sql-s] succeeded!"

## Step 3: Test SQL Server Connection

```bash
# Set environment and test
export USE_SQL_SERVER=true
python test_mssql_connection.py
```

## Step 4: Run Django with MS SQL Server

```bash
export USE_SQL_SERVER=true
python manage.py check
python manage.py migrate
python manage.py runserver
```

## Troubleshooting

### If SSH connection fails:
1. Ensure SSH server is running on your local machine
2. Check your local IP address: `ipconfig` (Windows) or `ifconfig` (Linux/Mac)
3. Verify Windows firewall allows SSH (port 22)

### If SQL Server connection fails:
1. Ensure SQL Server is running
2. Check TCP/IP is enabled in SQL Server Configuration Manager
3. Verify SQL Server is listening on port 1433
4. Test locally: `sqlcmd -S PGOMEZ\PGOMEZ -U nawec -P password`

### Common SSH Tunnel Commands:
```bash
# Basic tunnel
ssh -L 1433:localhost:1433 username@ip

# With specific SSH key
ssh -i ~/.ssh/your-key -L 1433:localhost:1433 username@ip

# Background tunnel (detached)
ssh -f -N -L 1433:localhost:1433 username@ip

# Check if tunnel is active
ps aux | grep ssh
```

## Next Steps After Tunnel is Active:
1. Export USE_SQL_SERVER=true
2. Run Django migrations if needed
3. Start the Django application