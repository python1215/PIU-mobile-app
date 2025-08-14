#!/usr/bin/env python
"""
Test script to verify MS SQL Server connection setup
Run this after:
1. Setting up SSH tunnel: ssh -L 1433:localhost:1433 username@your-local-ip
2. Setting environment variables for your SQL Server credentials
"""

import os
import sys
import django
from pathlib import Path

# Add the project directory to Python path
sys.path.append(str(Path(__file__).parent))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'piu_project.settings')
django.setup()

from django.conf import settings
from django.db import connection

def test_connection():
    print("=== MS SQL Server Connection Test ===\n")
    
    # Check environment variables
    print("Environment Variables:")
    print(f"USE_SQL_SERVER: {os.environ.get('USE_SQL_SERVER', 'Not set')}")
    print(f"MSSQL_DATABASE: {os.environ.get('MSSQL_DATABASE', 'Not set')}")
    print(f"MSSQL_USER: {os.environ.get('MSSQL_USER', 'Not set')}")
    print(f"MSSQL_HOST: {os.environ.get('MSSQL_HOST', 'Not set')}")
    print(f"MSSQL_PORT: {os.environ.get('MSSQL_PORT', 'Not set')}")
    
    print("\nDjango Database Configuration:")
    print(f"Database Engine: {settings.DATABASES['default']['ENGINE']}")
    print(f"Database Host: {settings.DATABASES['default'].get('HOST', 'Not set')}")
    print(f"Database Name: {settings.DATABASES['default'].get('NAME', 'Not set')}")
    print(f"Database User: {settings.DATABASES['default'].get('USER', 'Not set')}")
    print(f"Database Mode: {getattr(settings, 'DATABASE_MODE', 'Not set')}")
    
    # Test connection
    print("\nTesting Database Connection...")
    try:
        cursor = connection.cursor()
        cursor.execute("SELECT 1 as test_column")
        result = cursor.fetchone()
        print(f"✅ Connection successful! Test query result: {result}")
        
        # Test getting server info
        cursor.execute("SELECT @@VERSION as server_version")
        version = cursor.fetchone()
        print(f"📋 SQL Server Version: {version[0] if version else 'Unknown'}")
        
        cursor.close()
    except Exception as e:
        print(f"❌ Connection failed: {str(e)}")
        print("\nTroubleshooting steps:")
        print("1. Ensure SSH tunnel is active: ssh -L 1433:localhost:1433 username@your-ip")
        print("2. Check SQL Server is running and TCP/IP enabled")
        print("3. Verify firewall allows port 1433")
        print("4. Confirm database credentials are correct")
        
    print("\n" + "="*50)

if __name__ == "__main__":
    test_connection()