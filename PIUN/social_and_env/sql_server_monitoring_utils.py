"""
SQL Server Monitoring Utilities
Enhanced utilities for handling monitoring data with SQL Server compatibility
"""
from django.db import connection
from .models import PAP, GrievianceMonitoringLog, OHS_Monitoring, ESIA, CommunityConsult_Engagement

def get_sql_server_monitoring_data():
    """
    Get monitoring data from SQL Server using exact table structures
    Returns comprehensive monitoring statistics for dashboard
    """
    monitoring_data = {
        'pap_records': [],
        'pap_count': 0,
        'grievance_records': [],
        'grievance_count': 0,
        'ohs_records': [],
        'ohs_count': 0,
        'esia_records': [],
        'esia_count': 0,
        'community_records': [],
        'community_count': 0,
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
            # Try to get PAP data
            for prefix in database_variations:
                try:
                    table_name = f"{prefix}.[social_and_env_pap]" if prefix else "social_and_env_pap"
                    
                    # Count PAP records
                    count_query = f"SELECT COUNT(*) FROM {table_name}"
                    cursor.execute(count_query)
                    pap_count = cursor.fetchone()[0]
                    monitoring_data['pap_count'] = pap_count
                    
                    # Get recent PAP records
                    recent_pap_query = f"""
                    SELECT TOP 10
                        pap_identification_number,
                        ISNULL(pap_name, '') as pap_name,
                        ISNULL(sex, '') as sex,
                        ISNULL(pap_compensated, 'N') as pap_compensated,
                        ISNULL(amount, 0) as amount,
                        date_created
                    FROM {table_name}
                    ORDER BY date_created DESC
                    """
                    cursor.execute(recent_pap_query)
                    pap_results = cursor.fetchall()
                    
                    # Convert to dict format
                    monitoring_data['pap_records'] = [
                        {
                            'pap_identification_number': row[0],
                            'pap_name': row[1],
                            'sex': row[2],
                            'pap_compensated': row[3],
                            'amount': row[4],
                            'date_created': row[5]
                        }
                        for row in pap_results
                    ]
                    
                    print(f"Successfully loaded {pap_count} PAP records from {table_name}")
                    break
                except Exception as e:
                    print(f"Failed to query PAP table {table_name}: {e}")
                    continue
            
            # Try to get Grievance data
            for prefix in database_variations:
                try:
                    table_name = f"{prefix}.[social_and_env_grieviancemonitoringlog]" if prefix else "social_and_env_grieviancemonitoringlog"
                    
                    # Count Grievance records
                    count_query = f"SELECT COUNT(*) FROM {table_name}"
                    cursor.execute(count_query)
                    grievance_count = cursor.fetchone()[0]
                    monitoring_data['grievance_count'] = grievance_count
                    
                    # Get recent Grievance records
                    recent_grievance_query = f"""
                    SELECT TOP 10
                        ISNULL(case_no, '') as case_no,
                        ISNULL(name_of_person_receiving_complaint, '') as receiver_name,
                        ISNULL(sex, '') as sex,
                        ISNULL(complaint_investigation_outcome, '') as outcome,
                        date_claim_recieved
                    FROM {table_name}
                    ORDER BY date_claim_recieved DESC
                    """
                    cursor.execute(recent_grievance_query)
                    grievance_results = cursor.fetchall()
                    
                    # Convert to dict format
                    monitoring_data['grievance_records'] = [
                        {
                            'case_no': row[0],
                            'receiver_name': row[1],
                            'sex': row[2],
                            'outcome': row[3],
                            'date_claim_recieved': row[4]
                        }
                        for row in grievance_results
                    ]
                    
                    print(f"Successfully loaded {grievance_count} Grievance records from {table_name}")
                    break
                except Exception as e:
                    print(f"Failed to query Grievance table {table_name}: {e}")
                    continue
            
            # Try to get OHS data
            for prefix in database_variations:
                try:
                    table_name = f"{prefix}.[social_and_env_ohs_monitoring]" if prefix else "social_and_env_ohs_monitoring"
                    
                    # Count OHS records
                    count_query = f"SELECT COUNT(*) FROM {table_name}"
                    cursor.execute(count_query)
                    ohs_count = cursor.fetchone()[0]
                    monitoring_data['ohs_count'] = ohs_count
                    
                    # Get recent OHS records
                    recent_ohs_query = f"""
                    SELECT TOP 10
                        ISNULL(date, '') as date,
                        ISNULL(quality_at_entry_requirement, '') as quality_requirement,
                        ISNULL(working_environment, '') as working_environment,
                        ISNULL(male, 0) as male,
                        ISNULL(female, 0) as female
                    FROM {table_name}
                    ORDER BY date DESC
                    """
                    cursor.execute(recent_ohs_query)
                    ohs_results = cursor.fetchall()
                    
                    # Convert to dict format
                    monitoring_data['ohs_records'] = [
                        {
                            'date': row[0],
                            'quality_requirement': row[1],
                            'working_environment': row[2],
                            'male': row[3],
                            'female': row[4]
                        }
                        for row in ohs_results
                    ]
                    
                    print(f"Successfully loaded {ohs_count} OHS records from {table_name}")
                    break
                except Exception as e:
                    print(f"Failed to query OHS table {table_name}: {e}")
                    continue
            
            # Try to get ESIA data
            for prefix in database_variations:
                try:
                    table_name = f"{prefix}.[social_and_env_esia]" if prefix else "social_and_env_esia"
                    
                    # Count ESIA records
                    count_query = f"SELECT COUNT(*) FROM {table_name}"
                    cursor.execute(count_query)
                    esia_count = cursor.fetchone()[0]
                    monitoring_data['esia_count'] = esia_count
                    
                    # Get recent ESIA records
                    recent_esia_query = f"""
                    SELECT TOP 10
                        ISNULL(project_duration, 0) as project_duration,
                        ISNULL(project_phase, '') as project_phase,
                        ISNULL(project_locations, '') as project_locations,
                        ISNULL(number_of_communities, 0) as number_of_communities,
                        date_created
                    FROM {table_name}
                    ORDER BY date_created DESC
                    """
                    cursor.execute(recent_esia_query)
                    esia_results = cursor.fetchall()
                    
                    # Convert to dict format
                    monitoring_data['esia_records'] = [
                        {
                            'project_duration': row[0],
                            'project_phase': row[1],
                            'project_locations': row[2],
                            'number_of_communities': row[3],
                            'date_created': row[4]
                        }
                        for row in esia_results
                    ]
                    
                    print(f"Successfully loaded {esia_count} ESIA records from {table_name}")
                    break
                except Exception as e:
                    print(f"Failed to query ESIA table {table_name}: {e}")
                    continue
            
            # Try to get Community Engagement data
            for prefix in database_variations:
                try:
                    table_name = f"{prefix}.[social_and_env_communityconsult_engagement]" if prefix else "social_and_env_communityconsult_engagement"
                    
                    # Count Community records
                    count_query = f"SELECT COUNT(*) FROM {table_name}"
                    cursor.execute(count_query)
                    community_count = cursor.fetchone()[0]
                    monitoring_data['community_count'] = community_count
                    
                    # Get recent Community records
                    recent_community_query = f"""
                    SELECT TOP 10
                        ISNULL(consultation_date, '') as consultation_date,
                        ISNULL(male, 0) as male,
                        ISNULL(female, 0) as female,
                        ISNULL(key_issues_discussed, '') as key_issues,
                        ISNULL(engagement_type, '') as engagement_type
                    FROM {table_name}
                    ORDER BY consultation_date DESC
                    """
                    cursor.execute(recent_community_query)
                    community_results = cursor.fetchall()
                    
                    # Convert to dict format
                    monitoring_data['community_records'] = [
                        {
                            'consultation_date': row[0],
                            'male': row[1],
                            'female': row[2],
                            'key_issues': row[3],
                            'engagement_type': row[4]
                        }
                        for row in community_results
                    ]
                    
                    print(f"Successfully loaded {community_count} Community records from {table_name}")
                    break
                except Exception as e:
                    print(f"Failed to query Community table {table_name}: {e}")
                    continue
                    
    except Exception as e:
        print(f"Error in get_sql_server_monitoring_data: {e}")
    
    return monitoring_data

def get_sql_server_monitoring_statistics():
    """
    Get monitoring statistics for dashboard summary cards
    """
    stats = {
        'total_monitoring_records': 0,
        'active_cases': 0,
        'resolved_cases': 0,
        'pending_actions': 0,
        'compensation_paid': 0,
        'total_beneficiaries': 0,
    }
    
    try:
        with connection.cursor() as cursor:
            # Database table variations to try
            database_variations = [
                '[piuprod].[dbo]',
                '[piuprod3].[dbo]',
                '[dbo]',
                ''
            ]
            
            for prefix in database_variations:
                try:
                    # Get PAP compensation statistics
                    pap_table = f"{prefix}.[social_and_env_pap]" if prefix else "social_and_env_pap"
                    
                    # Total PAP records
                    cursor.execute(f"SELECT COUNT(*) FROM {pap_table}")
                    stats['total_monitoring_records'] += cursor.fetchone()[0]
                    
                    # Compensation paid
                    cursor.execute(f"SELECT ISNULL(SUM(amount), 0) FROM {pap_table} WHERE pap_compensated = 'Y'")
                    stats['compensation_paid'] = cursor.fetchone()[0]
                    
                    # Get Grievance statistics
                    grievance_table = f"{prefix}.[social_and_env_grieviancemonitoringlog]" if prefix else "social_and_env_grieviancemonitoringlog"
                    
                    # Total grievance records
                    cursor.execute(f"SELECT COUNT(*) FROM {grievance_table}")
                    stats['total_monitoring_records'] += cursor.fetchone()[0]
                    
                    # Active cases (not closed)
                    cursor.execute(f"SELECT COUNT(*) FROM {grievance_table} WHERE complaint_investigation_outcome != 'Closed'")
                    stats['active_cases'] = cursor.fetchone()[0]
                    
                    # Resolved cases
                    cursor.execute(f"SELECT COUNT(*) FROM {grievance_table} WHERE complaint_investigation_outcome = 'Closed'")
                    stats['resolved_cases'] = cursor.fetchone()[0]
                    
                    # Get Community Engagement statistics
                    community_table = f"{prefix}.[social_and_env_communityconsult_engagement]" if prefix else "social_and_env_communityconsult_engagement"
                    
                    # Total beneficiaries
                    cursor.execute(f"SELECT ISNULL(SUM(male), 0) + ISNULL(SUM(female), 0) FROM {community_table}")
                    stats['total_beneficiaries'] = cursor.fetchone()[0]
                    
                    print(f"Successfully loaded monitoring statistics from {prefix}")
                    break
                    
                except Exception as e:
                    print(f"Failed to get statistics from {prefix}: {e}")
                    continue
                    
    except Exception as e:
        print(f"Error in get_sql_server_monitoring_statistics: {e}")
    
    return stats