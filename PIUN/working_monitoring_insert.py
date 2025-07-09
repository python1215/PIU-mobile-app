#!/usr/bin/env python3
"""
Working script to insert monitoring results data with correct foreign key references
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
    """Insert monitoring results data using existing foreign key IDs"""
    
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
            # Get existing foreign key IDs from the database
            cursor.execute("SELECT id FROM accounts_user ORDER BY id LIMIT 1")
            user_id = cursor.fetchone()[0]
            
            cursor.execute("SELECT projectID FROM PIU_Financial_mgt_project ORDER BY projectID LIMIT 1")
            project_id = cursor.fetchone()[0]
            
            cursor.execute("SELECT id FROM setup_quarter ORDER BY id LIMIT 1")
            quarter_id = cursor.fetchone()[0]
            
            cursor.execute("SELECT id FROM setup_year ORDER BY id LIMIT 1")  
            year_id = cursor.fetchone()[0]
            
            cursor.execute("SELECT id FROM setup_data_collection_frequency ORDER BY id LIMIT 1")
            frequency_id = cursor.fetchone()[0]
            
            cursor.execute("SELECT id FROM setup_indicator_type ORDER BY id LIMIT 1")
            indicator_type_id = cursor.fetchone()[0]
            
            cursor.execute("SELECT id FROM setup_measurement_unit ORDER BY id LIMIT 1")
            measurement_unit_id = cursor.fetchone()[0]
            
            cursor.execute("SELECT id FROM PIU_Financial_mgt_pdo ORDER BY id LIMIT 1")
            pdo_id = cursor.fetchone()[0]
            
            cursor.execute("SELECT id FROM PIU_Financial_mgt_projectoutcome ORDER BY id LIMIT 1")
            outcome_id = cursor.fetchone()[0]
            
            cursor.execute("SELECT id FROM PIU_Financial_mgt_projectresult ORDER BY id LIMIT 1")
            result_id = cursor.fetchone()[0]
            
            print(f"Using existing foreign key IDs:")
            print(f"  User ID: {user_id}")
            print(f"  Project ID: {project_id}")
            print(f"  Quarter ID: {quarter_id}")
            print(f"  Year ID: {year_id}")
            print(f"  Frequency ID: {frequency_id}")
            print(f"  Indicator Type ID: {indicator_type_id}")
            print(f"  Measurement Unit ID: {measurement_unit_id}")
            print(f"  PDO ID: {pdo_id}")
            print(f"  Outcome ID: {outcome_id}")
            print(f"  Result ID: {result_id}")
            print()
            
            # Now insert the monitoring data
            for record in sample_data:
                try:
                    # Check if record already exists
                    cursor.execute("SELECT COUNT(*) FROM monitoring_results_oriented_monitoring WHERE id = ?", [record['id']])
                    if cursor.fetchone()[0] > 0:
                        print(f"Record {record['id']} already exists, skipping...")
                        continue
                    
                    # Insert monitoring record with proper parameter binding
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
                        frequency_id,
                        indicator_type_id,
                        user_id,
                        measurement_unit_id,
                        pdo_id,
                        project_id,
                        outcome_id,
                        result_id,
                        quarter_id,
                        year_id
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
        
        if total_count > 0:
            cursor.execute("SELECT indicator_description, baseline_value, achieved_value FROM monitoring_results_oriented_monitoring ORDER BY id DESC LIMIT 3")
            print("\nRecent monitoring records:")
            for row in cursor.fetchall():
                print(f"  - {row[0][:40]}... (Baseline: {row[1]}, Achieved: {row[2]})")
    
    return success_count, error_count

if __name__ == "__main__":
    success, errors = insert_monitoring_data()
    if errors == 0:
        print("All records inserted successfully!")
    else:
        print(f"Completed with {errors} errors")