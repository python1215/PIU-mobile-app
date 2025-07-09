#!/usr/bin/env python3
"""
Final script to insert monitoring results data
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
    """Insert monitoring results data using direct SQL"""
    
    # Simplified sample data for testing
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
    ]
    
    success_count = 0
    error_count = 0
    
    with transaction.atomic():
        with connection.cursor() as cursor:
            for record in sample_data:
                try:
                    # Check if record already exists
                    cursor.execute("SELECT COUNT(*) FROM monitoring_results_oriented_monitoring WHERE id = %s", [record['id']])
                    if cursor.fetchone()[0] > 0:
                        print(f"Record {record['id']} already exists, skipping...")
                        continue
                    
                    # First, let's create minimal required records if they don't exist
                    # This is a simplified approach - in production, proper foreign key data should be provided
                    
                    # Insert with minimal fields first
                    cursor.execute("""
                        INSERT INTO monitoring_results_oriented_monitoring (
                            id, indicator_description, baseline_value, achieved_value, 
                            End_Target_Value, percentage_achieved_vs_baseline, 
                            percentage_achieved_vs_end_target, remarks, date_created
                        ) VALUES (
                            %s, %s, %s, %s, %s, %s, %s, %s, %s
                        )
                    """, [
                        record['id'],
                        record['indicator_description'],
                        record['baseline_value'],
                        record['achieved_value'],
                        record['End_Target_Value'],
                        record['percentage_achieved_vs_baseline'],
                        record['percentage_achieved_vs_end_target'],
                        record['remarks'],
                        datetime.now()
                    ])
                    
                    success_count += 1
                    print(f"✓ Successfully inserted record {record['id']}: {record['indicator_description']}")
                    
                except Exception as e:
                    error_count += 1
                    print(f"✗ Error inserting record {record['id']}: {str(e)}")
    
    print(f"\nInsertion complete!")
    print(f"Successfully inserted: {success_count} records")
    print(f"Errors: {error_count} records")
    
    # Now let's check the current monitoring dashboard to see the data
    print("\nChecking current monitoring records...")
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