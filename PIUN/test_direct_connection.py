#!/usr/bin/env python3
"""
Test direct connection to SQL Server without SSH tunnel
"""

import socket
import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'piu_project.settings')
os.environ['USE_SQL_SERVER'] = 'true'
os.environ['MSSQL_DATABASE'] = 'piuprod3'
os.environ['MSSQL_USER'] = 'nawec'
os.environ['MSSQL_PASSWORD'] = 'password'
os.environ['MSSQL_HOST'] = '192.168.0.102'
os.environ['MSSQL_PORT'] = '1433'

django.setup()

def test_network_connectivity():
    """Test basic network connectivity to SQL Server"""
    print("=== Network Connectivity Test ===\n")
    
    host = '192.168.0.102'
    port = 1433
    timeout = 10
    
    print(f"Testing network connection to {host}:{port}...")
    
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(timeout)
        result = sock.connect_ex((host, port))
        sock.close()
        
        if result == 0:
            print("✅ Network connection successful!")
            print("   SQL Server port 1433 is accessible")
            return True
        else:
            print("❌ Network connection failed")
            print("   SQL Server port 1433 is not accessible")
            print("\n💡 Troubleshooting:")
            print("   1. Enable TCP/IP in SQL Server Configuration Manager")
            print("   2. Set SQL Server port to 1433")
            print("   3. Allow port 1433 through Windows Firewall")
            print("   4. Restart SQL Server service")
            return False
            
    except Exception as e:
        print(f"❌ Connection test error: {e}")
        return False

def test_pymssql_connection():
    """Test PyMSSQL connection directly"""
    print("\n=== PyMSSQL Direct Connection Test ===\n")
    
    try:
        import pymssql
        
        print("Attempting direct connection with PyMSSQL...")
        conn = pymssql.connect(
            server='192.168.0.102',
            port=1433,
            user='nawec',
            password='password',
            database='piuprod3',
            timeout=15
        )
        
        print("✅ PyMSSQL connection successful!")
        
        cursor = conn.cursor()
        cursor.execute("SELECT @@VERSION")
        version = cursor.fetchone()
        print(f"SQL Server Version: {version[0][:80]}...")
        
        cursor.execute("SELECT DB_NAME() as current_database")
        db = cursor.fetchone()
        print(f"Connected to database: {db[0]}")
        
        cursor.execute("SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES")
        table_count = cursor.fetchone()
        print(f"Number of tables: {table_count[0]}")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ PyMSSQL connection failed: {e}")
        
        error_str = str(e)
        if 'timeout' in error_str.lower():
            print("\n💡 Issue: Connection timeout")
            print("   - SQL Server may not be configured for remote connections")
            print("   - Check TCP/IP protocol is enabled")
        elif 'refused' in error_str.lower():
            print("\n💡 Issue: Connection refused")
            print("   - Port 1433 may be blocked by firewall")
            print("   - SQL Server service may not be running")
        elif 'login' in error_str.lower():
            print("\n💡 Issue: Login failed")
            print("   - Check if 'nawec' user exists in SQL Server")
            print("   - Verify password is correct")
            print("   - Ensure SQL Server authentication is enabled")
        
        return False

def test_django_connection():
    """Test Django ORM connection"""
    print("\n=== Django ORM Connection Test ===\n")
    
    try:
        from django.db import connection
        from django.conf import settings
        
        print(f"Django Database Configuration:")
        db_config = settings.DATABASES['default']
        print(f"  Engine: {db_config['ENGINE']}")
        print(f"  Host: {db_config['HOST']}")
        print(f"  Database: {db_config['NAME']}")
        print(f"  User: {db_config['USER']}")
        
        print("\nAttempting Django ORM connection...")
        
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1 as test_result")
            result = cursor.fetchone()
            print("✅ Django ORM connection successful!")
            print(f"Test query result: {result}")
            
            cursor.execute("SELECT @@SERVERNAME, DB_NAME()")
            server_info = cursor.fetchone()
            print(f"Server: {server_info[0]}, Database: {server_info[1]}")
            
        return True
        
    except Exception as e:
        print(f"❌ Django ORM connection failed: {e}")
        
        if 'driver' in str(e).lower():
            print("\n💡 Issue: ODBC driver problem")
            print("   - Using FreeTDS driver as fallback")
        
        return False

def main():
    """Run all connection tests"""
    print("Testing Direct MS SQL Server Connection\n")
    print("Target: 192.168.0.102:1433 (piuprod3 database)\n")
    
    # Test 1: Network connectivity
    network_ok = test_network_connectivity()
    
    if not network_ok:
        print("\n🚨 Network connection failed - SQL Server configuration needed")
        print("\nRequired Windows Configuration:")
        print("1. SQL Server Configuration Manager → Enable TCP/IP")
        print("2. Windows Firewall → Allow port 1433")
        print("3. SQL Server → Mixed authentication mode")
        print("4. Create/verify 'nawec' user")
        print("\nSee: enable_sql_remote_access.md for detailed steps")
        return False
    
    # Test 2: PyMSSQL direct connection
    pymssql_ok = test_pymssql_connection()
    
    # Test 3: Django ORM connection
    django_ok = test_django_connection()
    
    if network_ok and (pymssql_ok or django_ok):
        print("\n🎉 SQL Server connection successful!")
        print("\nNext steps:")
        print("  export USE_SQL_SERVER=true")
        print("  python manage.py migrate")
        print("  python manage.py runserver 0.0.0.0:5000")
        return True
    else:
        print("\n❌ SQL Server connection failed")
        print("Please complete Windows SQL Server configuration")
        return False

if __name__ == "__main__":
    main()