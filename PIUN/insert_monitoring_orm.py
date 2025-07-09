#!/usr/bin/env python3
"""
Insert monitoring results data using Django ORM
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

from monitoring.models import Results_Oriented_Monitoring

def insert_monitoring_data():
    """Insert monitoring results data using Django ORM with defaults"""
    
    # Sample data (simplified for testing)
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
    
    for record in sample_data:
        try:
            # Check if record already exists
            existing = Results_Oriented_Monitoring.objects.filter(pk=record['id']).first()
            if existing:
                print(f"Record {record['id']} already exists, skipping...")
                continue
            
            # Create the monitoring record with minimal required fields
            monitoring_record = Results_Oriented_Monitoring(
                id=record['id'],
                indicator_description=record['indicator_description'],
                baseline_value=record['baseline_value'],
                achieved_value=record['achieved_value'],
                End_Target_Value=record['End_Target_Value'],
                percentage_achieved_vs_baseline=record['percentage_achieved_vs_baseline'],
                percentage_achieved_vs_end_target=record['percentage_achieved_vs_end_target'],
                remarks=record['remarks'],
                # Set defaults for required foreign keys - we'll use the first available ones
                project_id=1,  # Assuming project ID 1 exists
                pdo_id=1,      # Assuming PDO ID 1 exists
                project_outcome_id=1,  # Assuming project outcome ID 1 exists
                project_result_id=1,   # Assuming project result ID 1 exists
                indicator_type_id=1,   # Assuming indicator type ID 1 exists
                measurement_unit_id=1, # Assuming measurement unit ID 1 exists
                collection_frequency_id=1, # Assuming collection frequency ID 1 exists
                quarter_id=1,  # Assuming quarter ID 1 exists
                year_id=1,     # Assuming year ID 1 exists
                loginUser_id=1 # Assuming user ID 1 exists
            )
            
            monitoring_record.save()
            success_count += 1
            print(f"✓ Successfully inserted record {record['id']}: {record['indicator_description']}")
            
        except Exception as e:
            error_count += 1
            print(f"✗ Error inserting record {record['id']}: {str(e)}")
    
    print(f"\nInsertion complete!")
    print(f"Successfully inserted: {success_count} records")
    print(f"Errors: {error_count} records")
    
    return success_count, error_count

if __name__ == "__main__":
    success, errors = insert_monitoring_data()
    if errors == 0:
        print("All records inserted successfully!")
    else:
        print(f"Completed with {errors} errors")