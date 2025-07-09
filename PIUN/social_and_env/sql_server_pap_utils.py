"""
SQL Server PAP Utilities
Enhanced utilities for handling PAP data with SQL Server null values
"""
from django.db import connection
from .models import PAP

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
                # Build dynamic references based on prefix
                if prefix:
                    project_table = f"{prefix}.[PIU_Financial_mgt_project]"
                    kpi_table = f"{prefix}.[PIU_Financial_mgt_kpi_for_contract]"
                    region_table = f"{prefix}.[setup_regions]"
                    district_table = f"{prefix}.[setup_districts]"
                    settlement_table = f"{prefix}.[setup_settlement]"
                    typeofpap_table = f"{prefix}.[setup_typeofpap]"
                    papcategory_table = f"{prefix}.[setup_papcategory]"
                    vulnerability_table = f"{prefix}.[setup_vulnerabilitycategory]"
                    typeofimpact_table = f"{prefix}.[setup_typeofimpact]"
                    natureofsettlement_table = f"{prefix}.[setup_natureofsettlement]"
                    user_table = f"{prefix}.[auth_user]"
                else:
                    project_table = "PIU_Financial_mgt_project"
                    kpi_table = "PIU_Financial_mgt_kpi_for_contract"
                    region_table = "setup_regions"
                    district_table = "setup_districts"
                    settlement_table = "setup_settlement"
                    typeofpap_table = "setup_typeofpap"
                    papcategory_table = "setup_papcategory"
                    vulnerability_table = "setup_vulnerabilitycategory"
                    typeofimpact_table = "setup_typeofimpact"
                    natureofsettlement_table = "setup_natureofsettlement"
                    user_table = "auth_user"
                
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
                    ISNULL(pr.project, 'Unknown') as project,
                    ISNULL(kpi.type_of_investment, 'Unknown') as type_of_investment,
                    ISNULL(kpi.Kpi_description, 'Unknown') as Kpi_description,
                    ISNULL(r.region, 'Unknown') as region,
                    ISNULL(d.district, 'Unknown') as district,
                    ISNULL(s.settlement, 'Unknown') as settlement,
                    ISNULL(tp.type_of_pap, 'Unknown') as type_of_pap,
                    ISNULL(pc.pap_category, 'Unknown') as pap_category,
                    ISNULL(vc.vulnerability_category, 'Unknown') as vulnerability_category,
                    ISNULL(ti.type_of_impact, 'Unknown') as type_of_impact,
                    ISNULL(ns.nature_of_compensation, 'Unknown') as nature_of_compensation,
                    ISNULL(u.username, 'Unknown') as loginUser
                FROM {table_name} p
                LEFT JOIN {project_table} pr ON p.project_id = pr.projectID
                LEFT JOIN {kpi_table} kpi ON p.type_of_investment_id = kpi.id
                LEFT JOIN {region_table} r ON p.region_id = r.regionID
                LEFT JOIN {district_table} d ON p.district_id = d.districtID
                LEFT JOIN {settlement_table} s ON p.pap_Current_Address_id = s.settlementID
                LEFT JOIN {typeofpap_table} tp ON p.type_of_pap_id = tp.id
                LEFT JOIN {papcategory_table} pc ON p.pap_category_id = pc.id
                LEFT JOIN {vulnerability_table} vc ON p.vulnerability_category_id = vc.id
                LEFT JOIN {typeofimpact_table} ti ON p.type_of_impact_id = ti.id
                LEFT JOIN {natureofsettlement_table} ns ON p.nature_of_compensation_id = ns.id
                LEFT JOIN {user_table} u ON p.loginUser_id = u.id
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