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
                # Query using the exact column structure provided
                sql_query = f"""
                SELECT 
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
                    p.district_id,
                    p.loginUser_id,
                    p.nature_of_compensation_id,
                    p.pap_Current_Address_id,
                    p.pap_category_id,
                    p.project_id,
                    p.region_id,
                    p.type_of_impact_id,
                    p.type_of_investment_id,
                    p.type_of_pap_id,
                    p.vulnerability_category_id
                FROM {table_name} p
                WHERE p.pap_identification_number IS NOT NULL
                ORDER BY p.date_created DESC
                """
                
                cursor.execute(sql_query)
                results = cursor.fetchall()
                
                if results:
                    print(f"Successfully loaded {len(results)} PAP records from {table_name}")
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
    Using the exact column structure provided
    """
    pap_list = []
    
    for row in raw_results:
        pap = PAP()
        # Map columns according to the exact structure provided
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
        
        # Foreign key IDs from the actual table structure
        pap.district_id = row[12]
        pap.loginUser_id = row[13]
        pap.nature_of_compensation_id = row[14]
        pap.pap_Current_Address_id = row[15]
        pap.pap_category_id = row[16]
        pap.project_id = row[17]
        pap.region_id = row[18]
        pap.type_of_impact_id = row[19]
        pap.type_of_investment_id = row[20]
        pap.type_of_pap_id = row[21]
        pap.vulnerability_category_id = row[22]
        
        # Create mock objects for related fields using the IDs
        class MockProject:
            def __init__(self, project_id):
                self.project = f'Project-{project_id}' if project_id else 'Unknown'
                self.project_name = f'Project-{project_id}' if project_id else 'Unknown'
        
        class MockKPI:
            def __init__(self, investment_id):
                self.type_of_investment = f'Investment-{investment_id}' if investment_id else 'Unknown'
                self.Kpi_description = f'KPI-{investment_id}' if investment_id else 'Unknown'
        
        class MockRegion:
            def __init__(self, region_id):
                self.region = f'Region-{region_id}' if region_id else 'Unknown'
                self.region_name = f'Region-{region_id}' if region_id else 'Unknown'
        
        class MockDistrict:
            def __init__(self, district_id):
                self.district = f'District-{district_id}' if district_id else 'Unknown'
                self.district_name = f'District-{district_id}' if district_id else 'Unknown'
        
        class MockSettlement:
            def __init__(self, settlement_id):
                self.settlement = f'Settlement-{settlement_id}' if settlement_id else 'Unknown'
                self.settlement_name = f'Settlement-{settlement_id}' if settlement_id else 'Unknown'
        
        class MockCategory:
            def __init__(self, category_id, category_type):
                self.name = f'{category_type}-{category_id}' if category_id else 'Unknown'
                # Add different attribute names based on category type
                if category_type == 'PAP':
                    self.type_of_pap = f'{category_type}-{category_id}' if category_id else 'Unknown'
                elif category_type == 'Category':
                    self.pap_category = f'{category_type}-{category_id}' if category_id else 'Unknown'
                elif category_type == 'Vulnerability':
                    self.vulnerability_category = f'{category_type}-{category_id}' if category_id else 'Unknown'
                elif category_type == 'Impact':
                    self.type_of_impact = f'{category_type}-{category_id}' if category_id else 'Unknown'
                elif category_type == 'Nature':
                    self.nature_of_compensation = f'{category_type}-{category_id}' if category_id else 'Unknown'
        
        class MockUser:
            def __init__(self, user_id):
                self.username = f'User-{user_id}' if user_id else 'Unknown'
        
        # Assign mock objects using the foreign key IDs
        pap.project = MockProject(pap.project_id)
        pap.type_of_investment = MockKPI(pap.type_of_investment_id)
        pap.region = MockRegion(pap.region_id)
        pap.district = MockDistrict(pap.district_id)
        pap.pap_Current_Address = MockSettlement(pap.pap_Current_Address_id)
        pap.type_of_pap = MockCategory(pap.type_of_pap_id, 'PAP')
        pap.pap_category = MockCategory(pap.pap_category_id, 'Category')
        pap.vulnerability_category = MockCategory(pap.vulnerability_category_id, 'Vulnerability')
        pap.type_of_impact = MockCategory(pap.type_of_impact_id, 'Impact')
        pap.nature_of_compensation = MockCategory(pap.nature_of_compensation_id, 'Nature')
        pap.loginUser = MockUser(pap.loginUser_id)
        
        pap_list.append(pap)
    
    return pap_list