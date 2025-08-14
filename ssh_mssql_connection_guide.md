# MS SQL Server Connection via SSH from Replit

## Method 1: SSH Tunnel (Recommended)

### On Your Local Machine:
1. Enable SSH server (OpenSSH)
2. Configure SQL Server for remote connections
3. Note your local IP address

### From Replit Terminal:
```bash
# Create SSH tunnel - replace with your details
ssh -L 1433:localhost:1433 your-username@your-local-ip

# Keep this terminal open while using the database connection
```

### Django Settings Update:
```python
DATABASES = {
    'default': {
        'ENGINE': 'mssql',  # or 'django_mssql'
        'NAME': 'your_database_name',
        'USER': 'your_sql_username',
        'PASSWORD': 'your_sql_password',
        'HOST': '127.0.0.1',  # localhost through tunnel
        'PORT': '1433',
        'OPTIONS': {
            'driver': 'ODBC Driver 17 for SQL Server',
        },
    }
}
```

## Method 2: Direct Connection (if you have public IP)

### Django Settings:
```python
DATABASES = {
    'default': {
        'ENGINE': 'mssql',
        'NAME': 'your_database_name',
        'USER': 'your_sql_username',
        'PASSWORD': 'your_sql_password',
        'HOST': 'your-public-ip-or-domain',
        'PORT': '1433',
        'OPTIONS': {
            'driver': 'ODBC Driver 17 for SQL Server',
        },
    }
}
```

## Required Package Installation
You'll need the MS SQL adapter for Django:
```bash
pip install django-mssql-backend
```

## Security Notes:
- Use environment variables for sensitive data
- Enable SSL/TLS encryption
- Use strong passwords
- Consider VPN for additional security