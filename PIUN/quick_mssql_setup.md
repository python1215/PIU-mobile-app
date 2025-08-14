# Quick MS SQL Server Setup Guide

## Step 1: Get Your Local IP Address
On your Windows machine where SQL Server is running:
```cmd
ipconfig
```
Look for your IPv4 Address (e.g., 192.168.1.100)

## Step 2: Create SSH Tunnel
From Replit Shell:
```bash
ssh -L 1433:localhost:1433 pgomez@192.168.0.102
```
Example:
```bash
ssh -L 1433:localhost:1433 pgomez@192.168.1.100
```

**Keep this terminal open!**

## Step 3: Test Connection
In a new Replit Shell tab:
```bash
python test_tunnel_connection.py
```

## Step 4: Activate MS SQL Server
```bash
export USE_SQL_SERVER=true
python manage.py check
python manage.py migrate
```

## Step 5: Start Application
The Django app will now use MS SQL Server:
```bash
python manage.py runserver 0.0.0.0:5000
```

## Troubleshooting
- **SSH fails**: Check Windows SSH server is running
- **Port 1433 not accessible**: Verify tunnel command is correct
- **SQL connection fails**: Check SQL Server is running on Windows
- **Login fails**: Verify nawec user exists in SQL Server

## Your Configuration Summary
- **Database**: piuprod3
- **SQL Server**: PGOMEZ\\PGOMEZ
- **User**: nawec / password
- **Through tunnel**: 127.0.0.1:1433