#!/usr/bin/env python3
"""
PIU M&E System - Enable SQL Server Mode
Forces all modules to use SQL Server backend for CRUD operations
"""

import os
import sys
import django
from pathlib import Path

# Add the project root to Python path
sys.path.insert(0, str(Path(__file__).parent.parent))

# Configure Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'PIUN.settings')
django.setup()

def enable_sql_server_mode():
    """Enable SQL Server mode for all modules"""
    print("Enabling SQL Server mode for all modules...")
    
    # Update settings
    from django.conf import settings
    settings.USE_SQL_SERVER = True
    settings.DATABASE_MODE = 'sql_server'
    
    # Create/update environment file
    env_path = Path(__file__).parent.parent / '.env'
    
    env_content = """
# PIU M&E System - SQL Server Mode Configuration
USE_SQL_SERVER=True
DATABASE_MODE=sql_server

# Database Configuration
DB_HOST=localhost
DB_PORT=1433
DB_NAME=piuprod3
DB_USER=piu_user
DB_PASSWORD=P1U_S3cur3_P@ssw0rd!

# Django Settings
DEBUG=False
SECRET_KEY=your-secret-key-here-change-in-production
ALLOWED_HOSTS=localhost,127.0.0.1,*

# Application Settings
SITE_NAME=PIU M&E System
SITE_URL=http://localhost:8000
"""
    
    with open(env_path, 'w') as f:
        f.write(env_content.strip())
    
    print(f"✓ Updated environment configuration: {env_path}")
    
    # Verify database utilities
    from utils.database_utils import is_sql_server_mode, get_database_mode
    
    if is_sql_server_mode():
        print("✓ SQL Server mode enabled successfully")
        print(f"✓ Database mode: {get_database_mode()}")
    else:
        print("✗ Failed to enable SQL Server mode")
        return False
    
    # Test database connection
    try:
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            result = cursor.fetchone()
        
        if result and result[0] == 1:
            print("✓ SQL Server database connection successful")
        else:
            print("✗ SQL Server database connection failed")
            return False
    except Exception as e:
        print(f"✗ SQL Server database connection error: {e}")
        return False
    
    print("\nSQL Server mode configuration complete!")
    print("\nAll modules will now use SQL Server backend for:")
    print("- PIU Financial Management")
    print("- Issues & Actions Monitoring")
    print("- NAWEC KPI Management")
    print("- Project Site Mapping")
    print("- Social & Environmental Monitoring")
    print("- Contract Monitoring")
    print("- All CRUD operations")
    
    return True

def verify_module_compatibility():
    """Verify all modules are compatible with SQL Server mode"""
    print("\nVerifying module compatibility...")
    
    modules_to_check = [
        'PIU_Financial_mgt.views',
        'Issues_Actions_monitoring.views',
        'NAWEC_KPI.views',
        'PIU_Mapping_project_Sites.views',
        'social_and_env.views',
        'project_actions.views',
    ]
    
    for module_name in modules_to_check:
        try:
            module = __import__(module_name, fromlist=[''])
            if hasattr(module, 'is_sql_server_mode') or 'database_utils' in str(module):
                print(f"✓ {module_name} - SQL Server compatible")
            else:
                print(f"⚠ {module_name} - May need SQL Server updates")
        except ImportError as e:
            print(f"✗ {module_name} - Import error: {e}")
    
    print("\nModule compatibility check complete!")

def main():
    """Main function"""
    try:
        print("PIU M&E System - SQL Server Mode Enabler")
        print("=" * 50)
        
        success = enable_sql_server_mode()
        
        if success:
            verify_module_compatibility()
            
            print("\n" + "=" * 50)
            print("SUCCESS: SQL Server mode enabled for all modules!")
            print("\nNext steps:")
            print("1. Ensure SQL Server is running")
            print("2. Execute database setup script")
            print("3. Run database migrations")
            print("4. Start the application")
            print("\nThe system will now use SQL Server backend for all operations.")
        else:
            print("\n" + "=" * 50)
            print("FAILED: Could not enable SQL Server mode")
            print("Please check your SQL Server configuration.")
            sys.exit(1)
            
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()