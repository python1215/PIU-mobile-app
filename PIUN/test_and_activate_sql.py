#!/usr/bin/env python3
"""
Test SQL Server connection and auto-activate when available
"""
import socket
import pymssql
import os
import subprocess
import time

def test_connection():
    """Test if SQL Server is accessible"""
    try:
        # Quick socket test
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM) 
        sock.settimeout(2)
        result = sock.connect_ex(('127.0.0.1', 1433))
        sock.close()
        
        if result != 0:
            return False
            
        # Test actual SQL connection
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
        
        print(f"✅ Connected to SQL Server database: {db}")
        return True
        
    except Exception:
        return False

def main():
    print("Testing SQL Server connection...")
    
    if test_connection():
        print("🎉 SQL Server connection successful!")
        print("Django is configured and ready for migrations.")
        print("\nNext steps:")
        print("1. python manage.py migrate")
        print("2. python manage.py createsuperuser")
        print("3. Django will use piuprod3 database")
        return True
    else:
        print("❌ SQL Server not accessible from Replit")
        print("\nRequired: Fix VS Code port forwarding")
        print("- VS Code → Command Palette → Forward Port → 1433")
        print("- Or refresh existing port forwarding")
        print("\nDjango running with SQLite until SQL Server accessible")
        return False

if __name__ == "__main__":
    main()
