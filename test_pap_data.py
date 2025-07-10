#!/usr/bin/env python3
"""
Test script to verify PAP data loading from SQL Server
"""
import os
import sys
import django

# Add the project directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'PIUN'))

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'piu_project.settings')
os.environ['USE_SQL_SERVER'] = 'true'
django.setup()

from django.db import connection
from utils.database_utils import is_sql_server_mode, get_sql_server_table_name

def test_pap_data_loading():
    """Test PAP data loading from SQL Server"""
    print("=== PAP Data Loading Test ===")
    print(f"SQL Server mode: {is_sql_server_mode()}")
    
    if not is_sql_server_mode():
        print("ERROR: Not in SQL Server mode!")
        return False
    
    try:
        # Test connection
        table_name = get_sql_server_table_name('[social_and_env_pap]')
        print(f"Testing table: {table_name}")
        
        # Test count query
        count_query = f"SELECT COUNT(*) FROM {table_name}"
        with connection.cursor() as cursor:
            cursor.execute(count_query)
            total_count = cursor.fetchone()[0]
            print(f"Total PAP records: {total_count}")
        
        # Test data retrieval
        if total_count > 0:
            data_query = f"""
                SELECT TOP 3
                    ISNULL([pap_identification_number], '') as pap_identification_number,
                    ISNULL([name], '') as name,
                    ISNULL([sex], '') as sex,
                    ISNULL([amount], 0) as amount,
                    ISNULL([pap_compensated], 'N') as pap_compensated
                FROM {table_name}
                ORDER BY [pap_identification_number]
            """
            
            with connection.cursor() as cursor:
                cursor.execute(data_query)
                sample_records = cursor.fetchall()
                
                print(f"Sample records ({len(sample_records)}):")
                for i, record in enumerate(sample_records, 1):
                    print(f"  {i}. ID: {record[0]}, Name: {record[1]}, Sex: {record[2]}, Amount: {record[3]}, Compensated: {record[4]}")
        
        print("✅ PAP data loading test PASSED")
        return True
        
    except Exception as e:
        print(f"❌ PAP data loading test FAILED: {e}")
        return False

if __name__ == "__main__":
    success = test_pap_data_loading()
    sys.exit(0 if success else 1)