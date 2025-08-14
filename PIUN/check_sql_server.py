#!/usr/bin/env python3
"""
Quick SQL Server connection checker
"""
import socket
import pymssql
import os

def check_connection():
    print("SQL Server Connection Status Check")
    print("=" * 40)
    
    # Test port
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(3)
        result = sock.connect_ex(('127.0.0.1', 1433))
        sock.close()
        
        if result == 0:
            print("✅ Port 1433 accessible")
            
            # Test pymssql connection
            try:
                conn = pymssql.connect(
                    server='127.0.0.1',
                    port=1433,
                    user='nawec', 
                    password='password',
                    database='piuprod3',
                    timeout=5
                )
                cursor = conn.cursor()
                cursor.execute('SELECT DB_NAME()')
                db = cursor.fetchone()[0]
                conn.close()
                print(f"✅ SQL Server connected - database: {db}")
                print("\nREADY FOR DJANGO MIGRATION!")
                return True
                
            except Exception as e:
                error = str(e)
                if 'Login failed' in error:
                    print("❌ Authentication failed")
                    print("Fix: Enable Mixed Authentication in SSMS")
                else:
                    print(f"❌ Connection error: {error[:60]}")
                    
        else:
            print("❌ Port 1433 blocked")
            print("Required: Restart SQL Server service on Windows")
            
    except Exception as e:
        print(f"❌ Network error: {e}")
        
    return False

if __name__ == "__main__":
    check_connection()