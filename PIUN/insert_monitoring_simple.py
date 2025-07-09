#!/usr/bin/env python3
"""
Simplified script to insert monitoring results data directly into SQLite database
"""

import os
import sys
import django
from datetime import datetime

# Add the project directory to the Python path
sys.path.append('/home/runner/workspace/PIUN')

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'piu_project.settings')
django.setup()

from django.db import connection, transaction

def insert_monitoring_data():
    """Insert monitoring results data using direct SQL execution"""
    
    # Sample monitoring data from the TSV file
    sample_data = [
        {
            'id': 193,
            'indicator_description': 'Nationwide transmission & distribution losses',
            'baseline_value': 22.0,
            'achieved_value': 19.0,
            'End_Target_Value': 15.0,
            'percentage_achieved_vs_baseline': 86.36,
            'percentage_achieved_vs_end_target': 126.67,
            'remarks': 'Not yet achieved',
        },
        {
            'id': 194,
            'indicator_description': 'Nationwide transmission & distribution losses',
            'baseline_value': 22.0,
            'achieved_value': 16.0,
            'End_Target_Value': 15.0,
            'percentage_achieved_vs_baseline': 72.73,
            'percentage_achieved_vs_end_target': 106.67,
            'remarks': 'Not yet achieved',
        },
        {
            'id': 195,
            'indicator_description': 'Total System Collapses in the GBA',
            'baseline_value': 45.0,
            'achieved_value': 25.0,
            'End_Target_Value': 15.0,
            'percentage_achieved_vs_baseline': 55.56,
            'percentage_achieved_vs_end_target': 166.67,
            'remarks': 'There is progress towards achieving the final target',
        },
        {
            'id': 196,
            'indicator_description': 'People provided with access to improved water sources',
            'baseline_value': 0.0,
            'achieved_value': 0.0,
            'End_Target_Value': 64000.0,
            'percentage_achieved_vs_baseline': 0.0,
            'percentage_achieved_vs_end_target': 0.0,
            'remarks': 'The investment is still ongoing',
        },
        {
            'id': 197,
            'indicator_description': 'Generation dispatched from variable renewable generation',
            'baseline_value': 0.0,
            'achieved_value': 19.0,
            'End_Target_Value': 26.0,
            'percentage_achieved_vs_baseline': 0.0,
            'percentage_achieved_vs_end_target': 73.08,
            'remarks': 'Great progress but still below target',
        },
    ]
    
    success_count = 0
    error_count = 0
    
    print(f"Starting to insert {len(sample_data)} monitoring records into SQLite database...")
    
    with transaction.atomic():
        with connection.cursor() as cursor:
            # First, create minimal default records for foreign keys if they don't exist
            default_inserts = [
                "INSERT OR IGNORE INTO accounts_user (id, username, email, password, first_name, last_name, is_active, is_staff, is_superuser, date_joined) VALUES (1, 'admin', 'admin@example.com', 'pbkdf2_sha256$260000$abc123', 'Admin', 'User', 1, 1, 1, datetime('now'))",
                "INSERT OR IGNORE INTO setup_quarter (id, quarter, loginUser_id, date_created) VALUES (1, 'Q1', 1, datetime('now'))",
                "INSERT OR IGNORE INTO setup_year (id, year, loginUser_id, date_created) VALUES (1, 2025, 1, datetime('now'))",
                "INSERT OR IGNORE INTO setup_data_collection_frequency (id, data_collection_frequency, loginUser_id, date_created) VALUES (1, 'Monthly', 1, datetime('now'))",
                "INSERT OR IGNORE INTO setup_indicator_type (id, indicator_type, loginUser_id, date_created) VALUES (1, 'Output', 1, datetime('now'))",
                "INSERT OR IGNORE INTO setup_measurement_unit (id, measurement_unit, loginUser_id, date_created) VALUES (1, 'Number', 1, datetime('now'))",
                "INSERT OR IGNORE INTO setup_currency (id, currency, loginUser_id, date_created) VALUES (1, 'USD', 1, datetime('now'))",
                "INSERT OR IGNORE INTO setup_donor (id, donor, loginUser_id, date_created) VALUES (1, 'Default Donor', 1, datetime('now'))",
                "INSERT OR IGNORE INTO setup_project_status (id, project_status, loginUser_id, date_created) VALUES (1, 'Active', 1, datetime('now'))",
                "INSERT OR IGNORE INTO PIU_Financial_mgt_project (id, project, project_description, project_start_date, project_end_date, project_budget, currency_id, donor_id, project_status_id, loginUser_id, date_created) VALUES (1, 'Default Project', 'Default project for monitoring', date('now'), date('now'), 0, 1, 1, 1, 1, datetime('now'))",
                "INSERT OR IGNORE INTO PIU_Financial_mgt_pdo (id, pdo, project_id, loginUser_id, date_created) VALUES (1, 'Default PDO', 1, 1, datetime('now'))",
                "INSERT OR IGNORE INTO PIU_Financial_mgt_projectoutcome (id, project_outcome, project_id, loginUser_id, date_created) VALUES (1, 'Default Outcome', 1, 1, datetime('now'))",
                "INSERT OR IGNORE INTO PIU_Financial_mgt_projectresult (id, project_result, project_id, loginUser_id, date_created) VALUES (1, 'Default Result', 1, 1, datetime('now'))",
            ]
            
            # Execute default inserts
            for insert_sql in default_inserts:
                try:
                    cursor.execute(insert_sql)
                except Exception as e:
                    print(f"Warning: Could not create default record: {e}")
            
            # Now insert the monitoring data
            for record in sample_data:
                try:
                    # Check if record already exists
                    cursor.execute("SELECT COUNT(*) FROM monitoring_results_oriented_monitoring WHERE id = ?", [record['id']])
                    if cursor.fetchone()[0] > 0:
                        print(f"Record {record['id']} already exists, skipping...")
                        continue
                    
                    # Insert monitoring record
                    cursor.execute("""
                        INSERT INTO monitoring_results_oriented_monitoring (
                            id, indicator_description, baseline_value, achieved_value, 
                            End_Target_Value, percentage_achieved_vs_baseline, 
                            percentage_achieved_vs_end_target, remarks, date_created,
                            collection_frequency_id, indicator_type_id, loginUser_id,
                            measurement_unit_id, pdo_id, project_id, project_outcome_id,
                            project_result_id, quarter_id, year_id
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, [
                        record['id'],
                        record['indicator_description'],
                        record['baseline_value'],
                        record['achieved_value'],
                        record['End_Target_Value'],
                        record['percentage_achieved_vs_baseline'],
                        record['percentage_achieved_vs_end_target'],
                        record['remarks'],
                        datetime.now(),
                        1,  # collection_frequency_id
                        1,  # indicator_type_id
                        1,  # loginUser_id
                        1,  # measurement_unit_id
                        1,  # pdo_id
                        1,  # project_id
                        1,  # project_outcome_id
                        1,  # project_result_id
                        1,  # quarter_id
                        1   # year_id
                    ])
                    
                    success_count += 1
                    print(f"✓ Successfully inserted record {record['id']}: {record['indicator_description'][:50]}...")
                    
                except Exception as e:
                    error_count += 1
                    print(f"✗ Error inserting record {record['id']}: {str(e)}")
    
    print(f"\nInsertion complete!")
    print(f"Successfully inserted: {success_count} records")
    print(f"Errors: {error_count} records")
    
    # Check final database state
    with connection.cursor() as cursor:
        cursor.execute("SELECT COUNT(*) FROM monitoring_results_oriented_monitoring")
        total_count = cursor.fetchone()[0]
        print(f"Total monitoring records in database: {total_count}")
    
    return success_count, error_count

if __name__ == "__main__":
    success, errors = insert_monitoring_data()
    if errors == 0:
        print("All records inserted successfully!")
    else:
        print(f"Completed with {errors} errors")