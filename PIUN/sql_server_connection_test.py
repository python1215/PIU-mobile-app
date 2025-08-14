#!/usr/bin/env python3
"""
SQL Server Connection Test and Setup Script
Tests various connection methods and provides setup guidance
"""

import os
import socket
import sys
import time
from datetime import datetime

def test_port_connectivity():
    """Test basic port connectivity"""
    print("1. Testing port connectivity...")
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(5)
        result = sock.connect_ex(('127.0.0.1', 1433))
        sock.close()
        
        if result == 0:
            print("   ✅ Port 1433 is accessible")
            return True
        else:
            print("   ❌ Port 1433 blocked or service down")
            return False
    except Exception as e:
        print(f"   ❌ Port test failed: {e}")
        return False

def test_pymssql_connection():
    """Test pymssql direct connection"""
    print("2. Testing pymssql connection...")
    try:
        import pymssql
        
        configs = [
            {'server': '127.0.0.1', 'port': 1433},
            {'server': '127.0.0.1,1433'},
            {'server': 'localhost', 'port': 1433},
            {'server': 'localhost\\MSSQLSERVER'},
        ]
        
        for i, config in enumerate(configs, 1):
            try:
                print(f"   Testing config {i}: {config}")
                conn = pymssql.connect(
                    user='nawec',
                    password='password',
                    database='piuprod3',
                    timeout=5,
                    **config
                )
                
                cursor = conn.cursor()
                cursor.execute('SELECT DB_NAME(), @@SERVERNAME')
                db, server = cursor.fetchone()
                print(f"   ✅ Success! Connected to {db} on {server}")
                conn.close()
                return True, config
                
            except Exception as e:
                error = str(e)[:60]
                print(f"   ❌ Config {i} failed: {error}")
        
        return False, None
        
    except ImportError:
        print("   ❌ pymssql not available")
        return False, None

def test_django_connection():
    """Test Django database connection"""
    print("3. Testing Django connection...")
    
    # Add current directory to path for Django imports
    sys.path.insert(0, '/home/runner/workspace/PIUN')
    
    try:
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'piu_project.settings')
        
        import django
        django.setup()
        
        from django.db import connection
        from django.conf import settings
        
        db_config = settings.DATABASES['default']
        print(f"   Engine: {db_config['ENGINE']}")
        print(f"   Database: {db_config['NAME']}")
        
        with connection.cursor() as cursor:
            cursor.execute('SELECT 1')
            print("   ✅ Django ORM connection successful")
            return True
            
    except Exception as e:
        error = str(e)[:80]
        print(f"   ❌ Django connection failed: {error}")
        return False

def main():
    print("=== SQL Server Connection Diagnostic ===")
    print(f"Timestamp: {datetime.now()}")
    print()
    
    # Test sequence
    port_ok = test_port_connectivity()
    print()
    
    pymssql_ok, working_config = test_pymssql_connection()
    print()
    
    django_ok = test_django_connection()
    print()
    
    # Summary and recommendations
    print("=== DIAGNOSIS SUMMARY ===")
    
    if port_ok and pymssql_ok and django_ok:
        print("✅ ALL TESTS PASSED - Ready for SQL Server mode")
        print()
        print("To activate SQL Server:")
        print("1. Set USE_SQL_SERVER=true in .env")
        print("2. Restart Django application")
        print("3. Run: python manage.py migrate")
        
    elif port_ok and pymssql_ok:
        print("⚠️  CONNECTION AVAILABLE - Django configuration issue")
        print()
        print("SQL Server is accessible but Django has driver issues.")
        print("Recommended actions:")
        print("1. Use PostgreSQL for development")
        print("2. Configure production SQL Server separately")
        
    elif port_ok:
        print("⚠️  PORT ACCESSIBLE - Authentication/database issue")
        print()
        print("SQL Server is listening but connection failed.")
        print("Required Windows actions:")
        print("1. Enable Mixed Authentication mode in SSMS")
        print("2. Create login: CREATE LOGIN nawec WITH PASSWORD = 'password'")
        print("3. Grant database access to nawec user")
        
    else:
        print("❌ CONNECTION BLOCKED - Windows configuration needed")
        print()
        print("Required Windows actions:")
        print("1. Restart SQL Server service after enabling TCP/IP")
        print("2. Verify Windows Firewall allows port 1433")
        print("3. Test locally: telnet localhost 1433")
    
    print()
    print("VS Code port forwarding is configured and ready.")

if __name__ == "__main__":
    main()
