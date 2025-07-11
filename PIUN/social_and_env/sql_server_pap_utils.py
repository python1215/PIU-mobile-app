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
            table_simple_name = table_name.split('.')[-1].strip('[]')
            cursor.execute("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = ?", [table_simple_name])
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

def get_sql_server_ohs_data():
    """
    Get OHS monitoring data from SQL Server using exact table structure
    Returns comprehensive OHS data for list view
    """
    ohs_data = {
        'ohs_records': [],
        'ohs_count': 0,
    }
    
    # Database table variations to try
    database_variations = [
        '[piuprod].[dbo]',
        '[piuprod3].[dbo]',
        '[dbo]',
        ''
    ]
    
    try:
        with connection.cursor() as cursor:
            # Try to get OHS data
            for prefix in database_variations:
                try:
                    table_name = f"{prefix}.[social_and_env_ohs_monitoring]" if prefix else "social_and_env_ohs_monitoring"
                    
                    # Count OHS records
                    count_query = f"SELECT COUNT(*) FROM {table_name}"
                    cursor.execute(count_query)
                    ohs_count = cursor.fetchone()[0]
                    ohs_data['ohs_count'] = ohs_count
                    
                    # Get OHS records with all necessary fields
                    ohs_query = f"""
                    SELECT 
                        ohs_Id,
                        ISNULL(date, '') as date,
                        ISNULL(quality_at_entry_requirement, '') as quality_at_entry_requirement,
                        ISNULL(working_environment, '') as working_environment,
                        ISNULL(remarks, '') as remarks,
                        ISNULL(male, 0) as male,
                        ISNULL(female, 0) as female,
                        ISNULL(youth_male, 0) as youth_male,
                        ISNULL(youth_female, 0) as youth_female,
                        ISNULL(project_id, '') as project_id,
                        ISNULL(Type_of_Investment_id, '') as Type_of_Investment_id,
                        ISNULL(year_of_report_id, '') as year_of_report_id,
                        ISNULL(quarter_id, '') as quarter_id,
                        ISNULL(region_id, '') as region_id,
                        ISNULL(district_id, '') as district_id,
                        ISNULL(settlement_id, '') as settlement_id,
                        date_created,
                        ISNULL(loginUser_id, '') as loginUser_id
                    FROM {table_name}
                    ORDER BY date_created DESC
                    """
                    cursor.execute(ohs_query)
                    ohs_results = cursor.fetchall()
                    
                    # Convert to dict format
                    ohs_data['ohs_records'] = [
                        {
                            'ohs_Id': row[0],
                            'date': row[1],
                            'quality_at_entry_requirement': row[2],
                            'working_environment': row[3],
                            'remarks': row[4],
                            'male': row[5],
                            'female': row[6],
                            'youth_male': row[7],
                            'youth_female': row[8],
                            'project_id': row[9],
                            'Type_of_Investment_id': row[10],
                            'year_of_report_id': row[11],
                            'quarter_id': row[12],
                            'region_id': row[13],
                            'district_id': row[14],
                            'settlement_id': row[15],
                            'date_created': row[16],
                            'loginUser_id': row[17],
                            'pk': row[0],  # Use ohs_Id as pk for template compatibility
                            'project': f'Project {row[9]}',  # Mock project name
                            'settlement': f'Settlement {row[15]}',  # Mock settlement name
                            'region': f'Region {row[13]}',  # Mock region name
                            'district': f'District {row[14]}',  # Mock district name
                            'year_of_report': f'Year {row[11]}',  # Mock year
                            'quarter': f'Q{row[12]}',  # Mock quarter
                            'total_workers': row[5] + row[6] if row[5] and row[6] else 0,
                            'total_youth': row[7] + row[8] if row[7] and row[8] else 0,
                            'picture': None,  # No picture support in SQL Server mode
                        }
                        for row in ohs_results
                    ]
                    
                    print(f"Successfully loaded {ohs_count} OHS records from {table_name}")
                    break
                except Exception as e:
                    print(f"Failed to query OHS table {table_name}: {e}")
                    continue
                    
    except Exception as e:
        print(f"Error in get_sql_server_ohs_data: {e}")
    
    return ohs_data

def get_sql_server_ohs_record_by_id(ohs_id):
    """
    Get single OHS monitoring record by ID from SQL Server
    """
    # Database table variations to try
    database_variations = [
        '[piuprod].[dbo]',
        '[piuprod3].[dbo]',
        '[dbo]',
        ''
    ]
    
    try:
        with connection.cursor() as cursor:
            # Try to get OHS record
            for prefix in database_variations:
                try:
                    table_name = f"{prefix}.[social_and_env_ohs_monitoring]" if prefix else "social_and_env_ohs_monitoring"
                    
                    # Get single OHS record
                    ohs_query = f"""
                    SELECT 
                        ohs_Id,
                        ISNULL(date, '') as date,
                        ISNULL(quality_at_entry_requirement, '') as quality_at_entry_requirement,
                        ISNULL(working_environment, '') as working_environment,
                        ISNULL(remarks, '') as remarks,
                        ISNULL(male, 0) as male,
                        ISNULL(female, 0) as female,
                        ISNULL(youth_male, 0) as youth_male,
                        ISNULL(youth_female, 0) as youth_female,
                        ISNULL(project_id, '') as project_id,
                        ISNULL(Type_of_Investment_id, '') as Type_of_Investment_id,
                        ISNULL(year_of_report_id, '') as year_of_report_id,
                        ISNULL(quarter_id, '') as quarter_id,
                        ISNULL(region_id, '') as region_id,
                        ISNULL(district_id, '') as district_id,
                        ISNULL(settlement_id, '') as settlement_id,
                        date_created,
                        ISNULL(loginUser_id, '') as loginUser_id
                    FROM {table_name}
                    WHERE ohs_Id = ?
                    """
                    cursor.execute(ohs_query, [ohs_id])
                    ohs_result = cursor.fetchone()
                    
                    if ohs_result:
                        return {
                            'ohs_Id': ohs_result[0],
                            'date': ohs_result[1],
                            'quality_at_entry_requirement': ohs_result[2],
                            'working_environment': ohs_result[3],
                            'remarks': ohs_result[4],
                            'male': ohs_result[5],
                            'female': ohs_result[6],
                            'youth_male': ohs_result[7],
                            'youth_female': ohs_result[8],
                            'project_id': ohs_result[9],
                            'Type_of_Investment_id': ohs_result[10],
                            'year_of_report_id': ohs_result[11],
                            'quarter_id': ohs_result[12],
                            'region_id': ohs_result[13],
                            'district_id': ohs_result[14],
                            'settlement_id': ohs_result[15],
                            'date_created': ohs_result[16],
                            'loginUser_id': ohs_result[17],
                            'project_name': f'Project {ohs_result[9]}',  # Mock project name
                        }
                    
                    print(f"Successfully queried OHS record {ohs_id} from {table_name}")
                    break
                except Exception as e:
                    print(f"Failed to query OHS record {ohs_id} from {table_name}: {e}")
                    continue
                    
    except Exception as e:
        print(f"Error in get_sql_server_ohs_record_by_id: {e}")
    
    return None