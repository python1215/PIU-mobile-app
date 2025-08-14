#!/usr/bin/env python3
"""
Test SSH Tunnel Connection to MS SQL Server
"""

import socket
import os
import sys
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'piu_project.settings')
os.environ['USE_SQL_SERVER'] = 'true'
os.environ['MSSQL_DATABASE'] = 'piuprod3'
os.environ['MSSQL_USER'] = 'nawec'
os.environ['MSSQL_PASSWORD'] = 'password'
os.environ['MSSQL_HOST'] = '127.0.0.1'
os.environ['MSSQL_PORT'] = '1433'

django.setup()

def test_port_connection():
    """Test if port 1433 is accessible (SSH tunnel check)"""
    print("=== SSH Tunnel Connection Test ===\n")
    
    host = '127.0.0.1'
    port = 1433
    timeout = 5
    
    print(f"Testing connection to {host}:{port}...")
    
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(timeout)
        result = sock.connect_ex((host, port))
        sock.close()
        
        if result == 0:
            print("✅ Port 1433 is accessible through SSH tunnel!")
            return True
        else:
            print("❌ Port 1433 is not accessible")
            print("   Make sure SSH tunnel is active:")
            print("   ssh -L 1433:localhost:1433 username@your-ip")
            return False
            
    except Exception as e:
        print(f"❌ Connection test failed: {e}")
        return False

def test_sql_server_connection():
    """Test actual SQL Server connection through Django"""
    print("\n=== Django SQL Server Connection Test ===\n")
    
    try:
        from django.db import connection
        from django.conf import settings
        
        print(f"Database Engine: {settings.DATABASES['default']['ENGINE']}")
        print(f"Database Host: {settings.DATABASES['default']['HOST']}")
        print(f"Database Name: {settings.DATABASES['default']['NAME']}")
        
        print("Attempting SQL Server connection...")
        
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1 as test_result")
            result = cursor.fetchone()
            print(f"✅ SQL Server connection successful!")
            print(f"Test query result: {result}")
            
            # Get SQL Server info
            cursor.execute("SELECT @@VERSION")
            version = cursor.fetchone()
            print(f"SQL Server version: {version[0][:100]}...")
            
            # Check database
            cursor.execute("SELECT DB_NAME() as current_db")
            db = cursor.fetchone()
            print(f"Current database: {db[0]}")
            
            return True
            
    except Exception as e:
        print(f"❌ SQL Server connection failed: {e}")
        error_str = str(e)
        
        if 'driver' in error_str.lower():
            print("\n💡 Troubleshooting:")
            print("   - ODBC driver issue detected")
            print("   - Try alternative connection methods")
        elif 'refused' in error_str.lower() or 'timeout' in error_str.lower():
            print("\n💡 Troubleshooting:")
            print("   - Connection refused or timeout")
            print("   - Check SSH tunnel is active")
            print("   - Verify SQL Server is running")
        elif 'login' in error_str.lower() or 'authentication' in error_str.lower():
            print("\n💡 Troubleshooting:")
            print("   - Authentication failed")
            print("   - Check username/password: nawec/password")
            print("   - Verify user exists in SQL Server")
        
        return False

def main():
    """Run all connection tests"""
    print("Testing MS SQL Server connection through SSH tunnel\n")
    
    # Test 1: Port accessibility
    port_ok = test_port_connection()
    
    if not port_ok:
        print("\n🚨 SSH tunnel is not active or not working")
        print("   Please set up SSH tunnel first:")
        print("   ssh -L 1433:localhost:1433 username@your-local-ip")
        return False
    
    # Test 2: SQL Server connection
    sql_ok = test_sql_server_connection()
    
    if sql_ok:
        print("\n🎉 All tests passed! MS SQL Server is ready to use.")
        print("\nNext steps:")
        print("   export USE_SQL_SERVER=true")
        print("   python manage.py migrate")
        print("   python manage.py runserver")
    else:
        print("\n❌ SQL Server connection failed despite tunnel working")
        print("   Check SQL Server configuration and credentials")
    
    return sql_ok

if __name__ == "__main__":
    main()