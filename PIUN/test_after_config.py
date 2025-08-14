#!/usr/bin/env python3
"""Quick test after SQL Server configuration"""

import socket
import os

def quick_test():
    print("Testing SQL Server connection...")
    
    # Test port
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(5)
        result = sock.connect_ex(('192.168.0.102', 1433))
        sock.close()
        
        if result == 0:
            print("✅ Port 1433 is now accessible!")
            
            # Test SQL connection
            try:
                import pymssql
                conn = pymssql.connect(
                    server='192.168.0.102',
                    user='nawec',
                    password='password',
                    database='piuprod3'
                )
                print("✅ SQL Server connection successful!")
                conn.close()
                
                # Set Django environment
                os.environ['USE_SQL_SERVER'] = 'true'
                os.environ['MSSQL_HOST'] = '192.168.0.102'
                
                print("✅ Ready to use SQL Server!")
                print("Run: export USE_SQL_SERVER=true")
                print("Run: python manage.py migrate")
                return True
                
            except Exception as e:
                print(f"❌ SQL connection failed: {e}")
                
        else:
            print("❌ Port 1433 still not accessible")
            print("Complete the Windows SQL Server setup first")
            
    except Exception as e:
        print(f"Error: {e}")
    
    return False

if __name__ == "__main__":
    quick_test()
