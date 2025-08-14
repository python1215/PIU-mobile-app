#!/usr/bin/env python3
"""
Fix SQL Server Connection - Comprehensive troubleshooting and setup
"""

import os
import socket
import subprocess
import time
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'piu_project.settings')

def test_network_connectivity():
    """Test basic network connectivity"""
    print("=== Network Connectivity Test ===")
    
    # Test ping to target host
    try:
        result = subprocess.run(['ping', '-c', '1', '192.168.0.102'], 
                              capture_output=True, timeout=5)
        if result.returncode == 0:
            print("✅ Host 192.168.0.102 is reachable")
            return True
        else:
            print("❌ Host 192.168.0.102 is not reachable")
            return False
    except:
        print("❌ Cannot test host connectivity")
        return False

def test_port_access():
    """Test SQL Server port accessibility"""
    print("\n=== Port Accessibility Test ===")
    
    hosts = ['192.168.0.102', '127.0.0.1']
    working_hosts = []
    
    for host in hosts:
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(5)
            result = sock.connect_ex((host, 1433))
            sock.close()
            
            if result == 0:
                print(f"✅ Port 1433 accessible on {host}")
                working_hosts.append(host)
            else:
                print(f"❌ Port 1433 not accessible on {host}")
        except Exception as e:
            print(f"❌ Error testing {host}: {e}")
    
    return working_hosts

def test_sql_server_connection():
    """Test actual SQL Server connection"""
    print("\n=== SQL Server Connection Test ===")
    
    try:
        import pymssql
        
        # Try different hosts
        hosts = ['192.168.0.102', '127.0.0.1', 'PGOMEZ\\PGOMEZ', 'PGOMEZ']
        
        for host in hosts:
            print(f"Trying {host}...")
            try:
                conn = pymssql.connect(
                    server=host,
                    port=1433,
                    user='nawec',
                    password='password',
                    database='piuprod3',
                    timeout=10
                )
                
                print(f"✅ Connected to SQL Server via {host}")
                
                cursor = conn.cursor()
                cursor.execute("SELECT @@VERSION")
                version = cursor.fetchone()
                print(f"Version: {version[0][:50]}...")
                
                cursor.execute("SELECT DB_NAME(), @@SERVERNAME")
                info = cursor.fetchone()
                print(f"Database: {info[0]}, Server: {info[1]}")
                
                conn.close()
                return host
                
            except Exception as e:
                print(f"❌ Failed: {str(e)[:60]}...")
                continue
                
        print("All SQL Server connection attempts failed")
        return None
        
    except ImportError:
        print("❌ pymssql not available")
        return None

def setup_django_connection(working_host):
    """Configure Django for the working host"""
    print(f"\n=== Configuring Django for {working_host} ===")
    
    # Set environment variables
    os.environ['USE_SQL_SERVER'] = 'true'
    os.environ['MSSQL_DATABASE'] = 'piuprod3'
    os.environ['MSSQL_USER'] = 'nawec'
    os.environ['MSSQL_PASSWORD'] = 'password'
    os.environ['MSSQL_HOST'] = working_host
    os.environ['MSSQL_PORT'] = '1433'
    
    # Test Django connection
    try:
        django.setup()
        from django.db import connection
        
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            result = cursor.fetchone()
            print("✅ Django ORM connection successful!")
            return True
            
    except Exception as e:
        print(f"❌ Django connection failed: {e}")
        return False

def create_port_forward():
    """Create SSH port forward if possible"""
    print("\n=== Setting up SSH Port Forward ===")
    
    try:
        # Try to create SSH tunnel
        cmd = ['ssh', '-f', '-N', '-L', '1433:localhost:1433', 
               '-o', 'StrictHostKeyChecking=no', 'pgomez@192.168.0.102']
        
        result = subprocess.run(cmd, capture_output=True, timeout=10)
        
        if result.returncode == 0:
            print("✅ SSH tunnel created")
            time.sleep(2)
            return True
        else:
            print(f"❌ SSH tunnel failed: {result.stderr.decode()}")
            return False
            
    except Exception as e:
        print(f"❌ SSH tunnel error: {e}")
        return False

def main():
    """Main troubleshooting and setup function"""
    print("SQL Server Connection Troubleshooting and Setup\n")
    
    # Step 1: Test network
    if not test_network_connectivity():
        print("\n🚨 Network connectivity issues detected")
        return False
    
    # Step 2: Test ports
    working_hosts = test_port_access()
    
    # Step 3: If no ports accessible, try SSH tunnel
    if not working_hosts:
        print("\n📡 No ports accessible, trying SSH tunnel...")
        if create_port_forward():
            working_hosts = test_port_access()
    
    # Step 4: Test SQL Server connection
    working_host = test_sql_server_connection()
    
    if working_host:
        # Step 5: Configure Django
        if setup_django_connection(working_host):
            print(f"\n🎉 SUCCESS! SQL Server connected via {working_host}")
            print("\nNext steps:")
            print("  export USE_SQL_SERVER=true")
            print("  python manage.py migrate")
            print("  python manage.py runserver")
            return True
    
    print("\n❌ Connection setup failed")
    print("\nTroubleshooting needed:")
    print("1. Enable SQL Server TCP/IP protocol")
    print("2. Configure Windows Firewall for port 1433")
    print("3. Set SQL Server to mixed authentication")
    print("4. Verify 'nawec' user exists and has permissions")
    
    return False

if __name__ == "__main__":
    main()