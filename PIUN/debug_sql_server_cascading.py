#!/usr/bin/env python
"""
Comprehensive SQL Server Cascading Dropdown Debugging Script
This script tests the exact SQL Server table structure and data availability
"""

import os
import sys
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'piu_project.settings')
django.setup()

from django.db import connection
from django.test import Client
from accounts.models import User
import json

def test_sql_server_table_structure():
    """Test the actual SQL Server table structure"""
    print("=== SQL Server Table Structure Test ===\n")
    
    try:
        with connection.cursor() as cursor:
            # Check if we're using SQL Server
            engine = connection.settings_dict.get('ENGINE', '')
            print(f"Database Engine: {engine}")
            
            if 'mssql' not in engine.lower():
                print("⚠️  Not using SQL Server - using SQLite mode")
                return test_sqlite_mode()
            
            print("✓ Using SQL Server mode")
            
            # Test 1: Check if table exists
            print("\n1. Checking if table exists...")
            try:
                cursor.execute("""
                    SELECT COUNT(*) 
                    FROM INFORMATION_SCHEMA.TABLES 
                    WHERE TABLE_SCHEMA = 'dbo' 
                    AND TABLE_NAME = 'PIU_Financial_mgt_kpi_for_contract'
                """)
                table_exists = cursor.fetchone()[0] > 0
                print(f"   Table exists: {table_exists}")
            except Exception as e:
                print(f"   Error checking table: {e}")
                return False
            
            # Test 2: Check table columns
            print("\n2. Checking table columns...")
            try:
                cursor.execute("""
                    SELECT COLUMN_NAME, DATA_TYPE 
                    FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_SCHEMA = 'dbo' 
                    AND TABLE_NAME = 'PIU_Financial_mgt_kpi_for_contract'
                    ORDER BY ORDINAL_POSITION
                """)
                columns = cursor.fetchall()
                print("   Available columns:")
                for col_name, data_type in columns:
                    print(f"     - {col_name} ({data_type})")
            except Exception as e:
                print(f"   Error getting columns: {e}")
                return False
            
            # Test 3: Check data availability
            print("\n3. Checking data availability...")
            try:
                cursor.execute("""
                    SELECT COUNT(*) 
                    FROM [piuprod3].[dbo].[PIU_Financial_mgt_kpi_for_contract]
                """)
                total_records = cursor.fetchone()[0]
                print(f"   Total records: {total_records}")
                
                # Check specific project data
                cursor.execute("""
                    SELECT COUNT(*) 
                    FROM [piuprod3].[dbo].[PIU_Financial_mgt_kpi_for_contract]
                    WHERE project_id = ?
                """, ['D309D6530GM'])
                project_records = cursor.fetchone()[0]
                print(f"   Records for project D309D6530GM: {project_records}")
                
                # Check monitoring types
                cursor.execute("""
                    SELECT DISTINCT monitoring_type_id 
                    FROM [piuprod3].[dbo].[PIU_Financial_mgt_kpi_for_contract]
                    WHERE project_id = ?
                """, ['D309D6530GM'])
                monitoring_types = [row[0] for row in cursor.fetchall()]
                print(f"   Available monitoring types: {monitoring_types}")
                
            except Exception as e:
                print(f"   Error checking data: {e}")
                return False
            
            # Test 4: Test actual AJAX query
            print("\n4. Testing actual AJAX query...")
            try:
                query = """
                    SELECT DISTINCT 
                        type_of_investment as value,
                        type_of_investment as text
                    FROM [piuprod3].[dbo].[PIU_Financial_mgt_kpi_for_contract]
                    WHERE project_id = ? AND monitoring_type_id = ?
                    ORDER BY type_of_investment
                """
                cursor.execute(query, ['D309D6530GM', 'proc'])
                results = cursor.fetchall()
                print(f"   Query results: {len(results)} investments found")
                for i, (value, text) in enumerate(results[:3]):
                    print(f"     {i+1}. {value}")
                    
            except Exception as e:
                print(f"   Error executing AJAX query: {e}")
                return False
            
            return True
            
    except Exception as e:
        print(f"Database connection error: {e}")
        return False

def test_sqlite_mode():
    """Test SQLite mode for comparison"""
    print("=== SQLite Mode Test ===\n")
    
    try:
        from PIU_Financial_mgt.models import KPI_For_Contract
        
        total_records = KPI_For_Contract.objects.count()
        project_records = KPI_For_Contract.objects.filter(project__projectID='D309D6530GM').count()
        
        print(f"Total KPI records: {total_records}")
        print(f"Records for project D309D6530GM: {project_records}")
        
        # Test the actual query used in SQLite mode
        kpi_records = KPI_For_Contract.objects.filter(
            project__projectID='D309D6530GM',
            monitoring_type__monitoring_type_code='proc'
        ).values('type_of_investment').distinct()
        
        print(f"Investment options for monitoring type 'proc': {len(kpi_records)}")
        for i, record in enumerate(list(kpi_records)[:3]):
            print(f"  {i+1}. {record['type_of_investment']}")
            
        return True
        
    except Exception as e:
        print(f"SQLite test error: {e}")
        return False

def test_ajax_endpoints_directly():
    """Test the AJAX endpoints directly"""
    print("\n=== Direct AJAX Endpoint Test ===\n")
    
    try:
        client = Client()
        admin_user = User.objects.get(username='admin')
        client.force_login(admin_user)
        
        # Test with different monitoring type values
        test_cases = [
            {'monitoring_type_id': 'proc', 'project_id': 'D309D6530GM'},
            {'monitoring_type_id': '1', 'project_id': 'D309D6530GM'},
            {'monitoring_type_id': 'Tec', 'project_id': 'D309D6530GM'},
        ]
        
        for i, params in enumerate(test_cases, 1):
            print(f"{i}. Testing with monitoring_type_id='{params['monitoring_type_id']}'")
            response = client.get('/project_actions/ajax/load-type-of-investments/', params)
            data = json.loads(response.content.decode())
            print(f"   Status: {response.status_code}")
            print(f"   Options: {len(data.get('options', []))}")
            if data.get('error'):
                print(f"   Error: {data['error']}")
            elif data.get('options'):
                print(f"   Sample: {data['options'][0]['text'][:50]}...")
            print()
        
        return True
        
    except Exception as e:
        print(f"AJAX test error: {e}")
        return False

if __name__ == "__main__":
    print("🔍 SQL Server Cascading Dropdown Diagnostic Tool\n")
    
    success = True
    success &= test_sql_server_table_structure()
    success &= test_ajax_endpoints_directly()
    
    if success:
        print("✅ All tests passed - system should work correctly")
    else:
        print("❌ Some tests failed - check the output above for issues")
    
    sys.exit(0 if success else 1)