"""
SQL Server PAP Utilities
Enhanced utilities for handling PAP data with SQL Server null values
"""
from django.db import connection
from .models import PAP

def get_table_columns(table_name):
    """Get actual column names from a SQL Server table"""
    try:
        with connection.cursor() as cursor:
            cursor.execute(f"SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '{table_name.split('.')[-1].strip('[]')}'")
            columns = [row[0] for row in cursor.fetchall()]
            return columns
    except Exception as e:
        print(f"Could not get columns for {table_name}: {e}")
        return []

def get_pap_data_sql_server():
    """
    Get all PAP data from SQL Server handling null values properly
    Uses multiple table name variations for different SQL Server environments
    """
    # Try multiple database/table combinations for offline SQL Server
    database_table_variations = [
        # Standard schema with different databases
        ('[piuprod3].[dbo].[social_and_env_pap]', '[piuprod3].[dbo]'),
        ('[piuprod].[dbo].[social_and_env_pap]', '[piuprod].[dbo]'),
        
        # Simple table names for offline deployments
        ('social_and_env_pap', 'dbo'),
        ('social_and_env_pap', ''),
        
        # Additional variations for different environments
        ('[dbo].[social_and_env_pap]', '[dbo]'),
    ]
    
    for table_name, prefix in database_table_variations:
        try:
            with connection.cursor() as cursor:
                # First, try a simple query to get basic PAP data without joins
                # This will help us understand the actual table structure
                simple_query = f"""
                SELECT TOP 100
                    p.pap_identification_number,
                    ISNULL(p.pap_name, '') as pap_name,
                    ISNULL(p.sex, '') as sex,
                    ISNULL(p.location_of_impact, '') as location_of_impact,
                    ISNULL(p.amount, 0) as amount,
                    ISNULL(p.area, '') as area,
                    ISNULL(p.pap_compensated, 'N') as pap_compensated,
                    p.compensation_date,
                    ISNULL(p.compensation_RefNo, '') as compensation_RefNo,
                    ISNULL(p.pre_project_situation, '') as pre_project_situation,
                    ISNULL(p.remarks, '') as remarks,
                    p.date_created,
                    ISNULL(CAST(p.project_id AS VARCHAR), 'Unknown') as project,
                    'Unknown' as type_of_investment,
                    'Unknown' as Kpi_description,
                    'Unknown' as region,
                    'Unknown' as district,
                    'Unknown' as settlement,
                    'Unknown' as type_of_pap,
                    'Unknown' as pap_category,
                    'Unknown' as vulnerability_category,
                    'Unknown' as type_of_impact,
                    'Unknown' as nature_of_compensation,
                    'Unknown' as loginUser
                FROM {table_name} p
                WHERE p.pap_identification_number IS NOT NULL
                ORDER BY p.date_created DESC
                """
                
                cursor.execute(simple_query)
                results = cursor.fetchall()
                
                if results:
                    print(f"Successfully loaded {len(results)} PAP records from {table_name} (simple query)")
                    return results
                    
        except Exception as e:
            print(f"Failed to query {table_name}: {str(e)}")
            continue
    
    # If all attempts fail, return empty list
    print("No PAP data found in any table variation")
    return []

def convert_sql_results_to_pap_objects(raw_results):
    """
    Convert raw SQL Server results to PAP objects for template compatibility
    """
    pap_list = []
    
    for row in raw_results:
        pap = PAP()
        pap.pap_identification_number = row[0] or ''
        pap.pap_name = row[1] or ''
        pap.sex = row[2] or ''
        pap.location_of_impact = row[3] or ''
        pap.amount = row[4] or 0
        pap.area = row[5] or ''
        pap.pap_compensated = row[6] or 'N'
        pap.compensation_date = row[7]
        pap.compensation_RefNo = row[8] or ''
        pap.pre_project_situation = row[9] or ''
        pap.remarks = row[10] or ''
        pap.date_created = row[11]
        
        # Create mock objects for related fields
        class MockProject:
            def __init__(self, project_name):
                self.project = project_name or 'Unknown'
        
        class MockKPI:
            def __init__(self, investment_type, description):
                self.type_of_investment = investment_type or 'Unknown'
                self.Kpi_description = description or 'Unknown'
        
        class MockRegion:
            def __init__(self, region_name):
                self.region = region_name or 'Unknown'
        
        class MockDistrict:
            def __init__(self, district_name):
                self.district = district_name or 'Unknown'
        
        class MockSettlement:
            def __init__(self, settlement_name):
                self.settlement = settlement_name or 'Unknown'
        
        class MockCategory:
            def __init__(self, category_name):
                self.name = category_name or 'Unknown'
        
        class MockUser:
            def __init__(self, username):
                self.username = username or 'Unknown'
        
        pap.project = MockProject(row[12])
        pap.type_of_investment = MockKPI(row[13], row[14])
        pap.region = MockRegion(row[15])
        pap.district = MockDistrict(row[16])
        pap.pap_Current_Address = MockSettlement(row[17])
        pap.type_of_pap = MockCategory(row[18])
        pap.pap_category = MockCategory(row[19])
        pap.vulnerability_category = MockCategory(row[20])
        pap.type_of_impact = MockCategory(row[21])
        pap.nature_of_compensation = MockCategory(row[22])
        pap.loginUser = MockUser(row[23])
        
        pap_list.append(pap)
    
    return pap_list