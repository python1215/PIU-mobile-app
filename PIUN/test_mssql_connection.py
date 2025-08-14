#!/usr/bin/env python3
"""
MS SQL Server Connection Test Script
Tests connection to piuprod3 database via VS Code port forwarding
"""
import os
import sys
import django
from datetime import datetime

# Add the project directory to Python path
sys.path.append('/home/runner/workspace/PIUN')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'piu_project.settings')

def test_basic_connectivity():
    """Test basic network connectivity to SQL Server"""
    import socket
    from contextlib import closing
    
    host = '127.0.0.1'
    port = 14330  # VS Code forwarded port
    
    print(f"=== Testing Network Connectivity ===")
    print(f"Target: {host}:{port}")
    
    try:
        with closing(socket.socket(socket.AF_INET, socket.SOCK_STREAM)) as sock:
            sock.settimeout(5)  # 5 second timeout
            result = sock.connect_ex((host, port))
            if result == 0:
                print(f"✅ Port {port} is open and reachable")
                return True
            else:
                print(f"❌ Cannot connect to port {port} (Error: {result})")
                return False
    except Exception as e:
        print(f"❌ Network connection failed: {e}")
        return False

def test_odbc_drivers():
    """Test available ODBC drivers"""
    print(f"\n=== Testing ODBC Drivers ===")
    
    try:
        import pyodbc
        drivers = pyodbc.drivers()
        print(f"Available ODBC drivers:")
        for driver in drivers:
            print(f"  - {driver}")
            
        # Check for SQL Server specific drivers
        sql_drivers = [d for d in drivers if 'SQL Server' in d or 'FreeTDS' in d or 'TDS' in d]
        if sql_drivers:
            print(f"✅ SQL Server compatible drivers found: {sql_drivers}")
            return sql_drivers
        else:
            print(f"⚠️  No SQL Server specific drivers found")
            return drivers
            
    except ImportError:
        print("❌ pyodbc not available")
        return []
    except Exception as e:
        print(f"❌ ODBC driver test failed: {e}")
        return []

def test_raw_connection():
    """Test raw pyodbc connection to SQL Server"""
    print(f"\n=== Testing Raw ODBC Connection ===")
    
    try:
        import pyodbc
        
        # Connection parameters from .env
        server = '127.0.0.1,14330'  # Include port in server string
        database = 'piuprod3'
        username = 'nawec' 
        password = 'password'
        
        # Try different connection strings
        connection_strings = [
            f"DRIVER={{FreeTDS}};SERVER={server};DATABASE={database};UID={username};PWD={password};TDS_Version=8.0;",
            f"DRIVER={{ODBC Driver 17 for SQL Server}};SERVER={server};DATABASE={database};UID={username};PWD={password};",
            f"DRIVER={{SQL Server}};SERVER={server};DATABASE={database};UID={username};PWD={password};",
        ]
        
        for i, conn_str in enumerate(connection_strings, 1):
            try:
                print(f"Attempt {i}: {conn_str.split(';')[0]}")
                conn = pyodbc.connect(conn_str, timeout=10)
                cursor = conn.cursor()
                
                # Test basic query
                cursor.execute("SELECT @@VERSION")
                version = cursor.fetchone()[0]
                print(f"✅ Connection successful!")
                print(f"   SQL Server Version: {version[:100]}...")
                
                # Test database access
                cursor.execute("SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES")
                table_count = cursor.fetchone()[0]
                print(f"   Database '{database}' has {table_count} tables")
                
                cursor.close()
                conn.close()
                return True
                
            except pyodbc.Error as e:
                print(f"❌ Connection failed: {e}")
                continue
            except Exception as e:
                print(f"❌ Unexpected error: {e}")
                continue
                
        print("❌ All connection attempts failed")
        return False
        
    except ImportError:
        print("❌ pyodbc not available")
        return False

def test_django_connection():
    """Test Django database connection with SQL Server"""
    print(f"\n=== Testing Django Database Connection ===")
    
    try:
        # Set environment to use SQL Server
        os.environ['USE_SQL_SERVER'] = 'true'
        os.environ['MSSQL_DATABASE'] = 'piuprod3'
        os.environ['MSSQL_USER'] = 'nawec'
        os.environ['MSSQL_PASSWORD'] = 'password'
        os.environ['MSSQL_HOST'] = '127.0.0.1'
        os.environ['MSSQL_PORT'] = '14330'
        
        # Reload Django settings
        from django.conf import settings
        from importlib import reload
        import piu_project.settings
        reload(piu_project.settings)
        
        django.setup()
        
        from django.db import connection
        from django.core.management import execute_from_command_line
        
        print(f"Database backend: {settings.DATABASES['default']['ENGINE']}")
        print(f"Database name: {settings.DATABASES['default']['NAME']}")
        print(f"Database host: {settings.DATABASES['default']['HOST']}")
        print(f"Database port: {settings.DATABASES['default']['PORT']}")
        
        # Test connection
        cursor = connection.cursor()
        cursor.execute("SELECT @@VERSION")
        version = cursor.fetchone()[0]
        print(f"✅ Django connection successful!")
        print(f"   SQL Server: {version[:100]}...")
        
        # Test table access
        cursor.execute("""
            SELECT COUNT(*) 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_TYPE = 'BASE TABLE'
        """)
        table_count = cursor.fetchone()[0]
        print(f"   Found {table_count} tables in database")
        
        return True
        
    except Exception as e:
        print(f"❌ Django connection failed: {e}")
        return False

def main():
    """Main test function"""
    print(f"🔍 MS SQL Server Connection Test")
    print(f"📅 Started: {datetime.now()}")
    print("=" * 60)
    
    # Test 1: Network connectivity
    network_ok = test_basic_connectivity()
    
    # Test 2: ODBC drivers
    drivers = test_odbc_drivers()
    
    # Test 3: Raw connection
    if network_ok and drivers:
        raw_ok = test_raw_connection()
    else:
        print("\n⚠️  Skipping raw connection test due to prerequisites")
        raw_ok = False
    
    # Test 4: Django connection
    if raw_ok:
        django_ok = test_django_connection()
    else:
        print("\n⚠️  Skipping Django test due to connection issues")
        django_ok = False
    
    print("\n" + "=" * 60)
    print("📊 SUMMARY")
    print(f"Network Connectivity: {'✅ PASS' if network_ok else '❌ FAIL'}")
    print(f"ODBC Drivers: {'✅ AVAILABLE' if drivers else '❌ MISSING'}")
    print(f"Raw Connection: {'✅ SUCCESS' if raw_ok else '❌ FAILED'}")
    print(f"Django Integration: {'✅ SUCCESS' if django_ok else '❌ FAILED'}")
    
    if not network_ok:
        print("\n🔧 TROUBLESHOOTING:")
        print("1. Check VS Code port forwarding is active")
        print("2. Verify SQL Server is running on Windows machine")
        print("3. Confirm port 1433 is forwarded to localhost:14330")
        
    return django_ok

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)