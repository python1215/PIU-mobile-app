#!/usr/bin/env python
"""
SQL Server Migration Script for PIUN Project
This script helps migrate from SQLite to SQL Server database
"""

import os
import sys
import django
from django.conf import settings
from django.db import connections

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Configure Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'piu_project.settings')
django.setup()

def test_sql_server_connection():
    """Test SQL Server connection"""
    try:
        from django.db import connection
        
        # Test basic connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            result = cursor.fetchone()
            print(f"✓ SQL Server connection successful: {result}")
        
        # Test KPI table existence
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT COUNT(*) 
                FROM INFORMATION_SCHEMA.TABLES 
                WHERE TABLE_SCHEMA = 'dbo' 
                AND TABLE_NAME = 'PIU_Financial_mgt_kpi_for_contract'
            """)
            table_exists = cursor.fetchone()[0] > 0
            if table_exists:
                print("✓ KPI table exists in SQL Server")
            else:
                print("✗ KPI table not found in SQL Server")
        
        # Test data availability
        with connection.cursor() as cursor:
            cursor.execute("SELECT COUNT(*) FROM [piuprod3].[dbo].[PIU_Financial_mgt_kpi_for_contract]")
            count = cursor.fetchone()[0]
            print(f"✓ Found {count} KPI records in SQL Server")
        
        return True
        
    except Exception as e:
        print(f"✗ SQL Server connection failed: {e}")
        return False

def test_cascading_dropdown_data():
    """Test data availability for cascading dropdowns"""
    try:
        from django.db import connection
        
        with connection.cursor() as cursor:
            # Test project-monitoring combinations
            cursor.execute("""
                SELECT 
                    project_id, 
                    monitoring_type_id, 
                    COUNT(*) as kpi_count
                FROM [piuprod3].[dbo].[PIU_Financial_mgt_kpi_for_contract]
                GROUP BY project_id, monitoring_type_id
                ORDER BY kpi_count DESC
            """)
            combinations = cursor.fetchall()
            
            print(f"✓ Found {len(combinations)} project-monitoring combinations:")
            for project, monitoring, count in combinations[:10]:  # Show top 10
                print(f"  - Project: {project}, Monitoring: {monitoring}, KPIs: {count}")
                
        return True
        
    except Exception as e:
        print(f"✗ Error testing cascading dropdown data: {e}")
        return False

def validate_sql_server_setup():
    """Validate complete SQL Server setup"""
    print("=== SQL Server Setup Validation ===")
    
    # Check database engine
    engine = connections['default'].settings_dict.get('ENGINE', '')
    if 'mssql' in engine.lower():
        print("✓ Django configured for SQL Server")
    else:
        print(f"✗ Django not configured for SQL Server (current: {engine})")
        return False
    
    # Test connection
    if not test_sql_server_connection():
        return False
    
    # Test cascading dropdown data
    if not test_cascading_dropdown_data():
        return False
    
    print("\n✓ SQL Server setup validation completed successfully!")
    return True

def generate_sample_settings():
    """Generate sample settings for SQL Server"""
    sample_settings = '''
# SQL Server Database Configuration
DATABASES = {
    'default': {
        'ENGINE': 'django_mssql_backend',
        'NAME': 'your_database_name',
        'USER': 'your_username',
        'PASSWORD': 'your_password',
        'HOST': 'your_server_name',
        'PORT': '1433',
        'OPTIONS': {
            'driver': 'ODBC Driver 17 for SQL Server',
            'unicode_results': True,
            'autocommit': True,
            'MARS_Connection': True,
            'extra_params': 'TrustServerCertificate=yes'
        }
    }
}

# Required for SQL Server
INSTALLED_APPS = [
    # ... your existing apps ...
    'django_mssql_backend',
]
'''
    
    with open('sql_server_settings_sample.py', 'w') as f:
        f.write(sample_settings)
    
    print("✓ Sample SQL Server settings written to sql_server_settings_sample.py")

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='SQL Server Migration Helper')
    parser.add_argument('--test', action='store_true', help='Test SQL Server connection')
    parser.add_argument('--validate', action='store_true', help='Validate complete setup')
    parser.add_argument('--generate-settings', action='store_true', help='Generate sample settings')
    
    args = parser.parse_args()
    
    if args.test:
        test_sql_server_connection()
    elif args.validate:
        validate_sql_server_setup()
    elif args.generate_settings:
        generate_sample_settings()
    else:
        print("Usage: python migrate_to_sql_server.py [--test|--validate|--generate-settings]")