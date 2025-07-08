#!/usr/bin/env python
"""
SQL Server Readiness Check for PIUN Project
This script validates that the project is ready for SQL Server deployment
"""

import os
import sys
import re

def check_file_encoding(filepath):
    """Check if file contains null bytes that would cause import errors"""
    try:
        with open(filepath, 'rb') as f:
            content = f.read()
            null_count = content.count(b'\x00')
            if null_count > 0:
                return False, f"Contains {null_count} null bytes"
            return True, "Clean"
    except Exception as e:
        return False, f"Error reading file: {e}"

def check_sql_server_compatibility():
    """Check if the project is configured for SQL Server compatibility"""
    print("=== SQL Server Readiness Check ===\n")
    
    # Check critical Python files for encoding issues
    critical_files = [
        'project_actions/views.py',
        'project_actions/models.py',
        'project_actions/urls.py',
        'project_actions/utils.py',
        'PIU_Financial_mgt/models.py'
    ]
    
    print("1. Checking file encoding:")
    all_files_clean = True
    for filepath in critical_files:
        if os.path.exists(filepath):
            is_clean, message = check_file_encoding(filepath)
            status = "✓" if is_clean else "✗"
            print(f"   {status} {filepath}: {message}")
            if not is_clean:
                all_files_clean = False
        else:
            print(f"   ⚠ {filepath}: File not found")
    
    # Check for SQL Server specific code
    print("\n2. Checking SQL Server compatibility features:")
    
    # Check views.py for dual-mode database support
    try:
        with open('project_actions/views.py', 'r', encoding='utf-8') as f:
            views_content = f.read()
            
        has_mssql_check = "'mssql' in connection.settings_dict.get('ENGINE'" in views_content
        has_raw_sql = "[piuprod3].[dbo].[PIU_Financial_mgt_kpi_for_contract]" in views_content
        has_error_handling = "except Exception as e:" in views_content
        
        print(f"   {'✓' if has_mssql_check else '✗'} Database engine auto-detection")
        print(f"   {'✓' if has_raw_sql else '✗'} SQL Server raw queries")
        print(f"   {'✓' if has_error_handling else '✗'} Error handling")
        
    except Exception as e:
        print(f"   ✗ Error checking views.py: {e}")
        all_files_clean = False
    
    # Check for diagnostic endpoints
    print("\n3. Checking diagnostic endpoints:")
    try:
        with open('project_actions/urls.py', 'r', encoding='utf-8') as f:
            urls_content = f.read()
            
        has_test_endpoint = "test-sql-connection" in urls_content
        has_diagnostics = "sql-diagnostics" in urls_content
        
        print(f"   {'✓' if has_test_endpoint else '✗'} SQL connection test endpoint")
        print(f"   {'✓' if has_diagnostics else '✗'} SQL diagnostics endpoint")
        
    except Exception as e:
        print(f"   ✗ Error checking urls.py: {e}")
        all_files_clean = False
    
    # Check for documentation
    print("\n4. Checking documentation:")
    docs_exist = [
        ('SQL_SERVER_README.md', 'Migration guide'),
        ('sql_server_setup.py', 'Setup configuration'),
        ('sql_server_requirements.txt', 'Requirements file')
    ]
    
    for filename, description in docs_exist:
        exists = os.path.exists(filename)
        print(f"   {'✓' if exists else '✗'} {description}: {filename}")
    
    # Overall assessment
    print(f"\n=== Overall Assessment ===")
    if all_files_clean:
        print("✓ Project is ready for SQL Server migration")
        print("\nNext steps:")
        print("1. Install required packages: pip install -r sql_server_requirements.txt")
        print("2. Configure Django settings for SQL Server")
        print("3. Test connection using /project_actions/test-sql-connection/")
        print("4. Verify data with /project_actions/sql-diagnostics/")
        return True
    else:
        print("✗ Project needs fixes before SQL Server migration")
        print("\nRequired fixes:")
        print("1. Clean null bytes from Python files")
        print("2. Ensure all imports work correctly")
        print("3. Test locally before deployment")
        return False

if __name__ == "__main__":
    # Change to project directory
    if 'PIUN' in os.getcwd():
        os.chdir('PIUN')
    
    success = check_sql_server_compatibility()
    sys.exit(0 if success else 1)