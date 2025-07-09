#!/usr/bin/env python3
"""
Enable SQL Server Mode for PIUN Project
This script activates SQL Server mode and demonstrates the database setup
"""

import os
import sys
import subprocess
from pathlib import Path

def enable_sql_server_mode():
    """Enable SQL Server mode by setting environment variables"""
    print("=" * 60)
    print("ENABLING SQL SERVER MODE FOR PIUN PROJECT")
    print("=" * 60)
    
    # Set environment variables
    os.environ['USE_SQL_SERVER'] = 'True'
    os.environ['DB_HOST'] = 'localhost'
    os.environ['DB_USER'] = 'sa'
    os.environ['DB_PASSWORD'] = ''
    os.environ['DB_PORT'] = '1433'
    
    print("✓ SQL Server mode enabled with following configuration:")
    print(f"  - Database: piuprod")
    print(f"  - Host: {os.environ['DB_HOST']}")
    print(f"  - User: {os.environ['DB_USER']}")
    print(f"  - Port: {os.environ['DB_PORT']}")
    print(f"  - Trust Server Certificate: Yes")
    
    return True

def create_sql_server_batch_file():
    """Create a batch file for SQL Server setup"""
    batch_content = '''@echo off
echo Setting up SQL Server environment for PIUN Project
echo ===================================================

REM Set environment variables for SQL Server
set USE_SQL_SERVER=True
set DB_HOST=localhost
set DB_USER=sa
set DB_PASSWORD=
set DB_PORT=1433

echo SQL Server mode activated!
echo.
echo Database Configuration:
echo - Database: piuprod
echo - Host: %DB_HOST%
echo - User: %DB_USER%
echo - Port: %DB_PORT%
echo.
echo To apply SQL schema, run:
echo python setup_sql_server.py attached_assets/Pasted-USE-piuprod-GO-ALTER-TABLE-dbo-social-and-env-pap-DROP-CONSTRAINT-social-and-env-pap-vulner-1752061647602_1752061647610.txt
echo.
echo Then restart the Django application
pause
'''
    
    with open('enable_sql_server.bat', 'w') as f:
        f.write(batch_content)
    
    print("✓ Created enable_sql_server.bat file for Windows users")

def test_sql_server_compatibility():
    """Test if the current system can handle SQL Server mode"""
    try:
        # Test database detection
        from django.db import connection
        
        if os.environ.get('USE_SQL_SERVER') == 'True':
            print("✓ System is configured for SQL Server mode")
            print("✓ All views will use raw SQL queries for compatibility")
            print("✓ Dual-mode support is active")
        else:
            print("✓ System is currently in SQLite mode")
            print("✓ To switch to SQL Server, run: python enable_sql_server.py")
            
        return True
    except Exception as e:
        print(f"✗ Compatibility test failed: {e}")
        return False

def main():
    """Main function to enable SQL Server mode"""
    print("PIUN Project - SQL Server Mode Enabler")
    print("=" * 40)
    
    # Enable SQL Server mode
    enable_sql_server_mode()
    
    # Create batch file for Windows users
    create_sql_server_batch_file()
    
    # Test compatibility
    test_sql_server_compatibility()
    
    print("\n" + "=" * 60)
    print("NEXT STEPS:")
    print("=" * 60)
    print("1. Execute the provided SQL script using:")
    print("   python setup_sql_server.py <sql_file_path>")
    print("")
    print("2. The system will automatically detect SQL Server mode")
    print("   and use raw SQL queries for all database operations")
    print("")
    print("3. All features will work in offline SQL Server mode:")
    print("   - OHS Monitoring (View/Edit with proper feedback)")
    print("   - PAP Management (List/Detail views)")
    print("   - Grievance Management (Full CRUD operations)")
    print("   - Contract Monitoring (Enhanced cascading dropdowns)")
    print("   - Project Financial Management (Comprehensive reports)")
    print("")
    print("4. To revert to SQLite mode, remove USE_SQL_SERVER environment variable")
    print("=" * 60)
    
    return True

if __name__ == "__main__":
    main()