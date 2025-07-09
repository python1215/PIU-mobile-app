#!/usr/bin/env python3
"""
Insert monitoring results data into SQLite database with proper foreign key handling
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
from django.contrib.auth.models import User
from PIU_Financial_mgt.models import Project
from setup.models import Quarter, YEAR, Data_Collection_Frequency, Indicator_Type, Measurement_Unit
from PIU_Financial_mgt.models import PDO, ProjectOutCome, ProjectResult

def create_default_records():
    """Create default records for foreign key references if they don't exist"""
    
    # Create default user if not exists
    if not User.objects.filter(pk=1).exists():
        User.objects.create_user(id=1, username='admin', email='admin@example.com', password='admin123')
    
    # Create default project if not exists
    if not Project.objects.filter(pk=1).exists():
        Project.objects.create(
            id=1,
            project='Default Project',
            project_description='Default project for monitoring data',
            project_start_date=datetime.now().date(),
            project_end_date=datetime.now().date(),
            project_budget=0,
            currency_id=1,
            donor_id=1,
            project_status_id=1,
            loginUser_id=1
        )
    
    # Create other default foreign key records with minimal data
    defaults = [
        ('setup_quarter', {'id': 1, 'quarter': 'Q1', 'loginUser_id': 1}),
        ('setup_year', {'id': 1, 'year': 2025, 'loginUser_id': 1}),
        ('setup_data_collection_frequency', {'id': 1, 'data_collection_frequency': 'Monthly', 'loginUser_id': 1}),
        ('setup_indicator_type', {'id': 1, 'indicator_type': 'Output', 'loginUser_id': 1}),
        ('setup_measurement_unit', {'id': 1, 'measurement_unit': 'Number', 'loginUser_id': 1}),
        ('PIU_Financial_mgt_pdo', {'id': 1, 'pdo': 'Default PDO', 'project_id': 1, 'loginUser_id': 1}),
        ('PIU_Financial_mgt_projectoutcome', {'id': 1, 'project_outcome': 'Default Outcome', 'project_id': 1, 'loginUser_id': 1}),
        ('PIU_Financial_mgt_projectresult', {'id': 1, 'project_result': 'Default Result', 'project_id': 1, 'loginUser_id': 1}),
    ]
    
    with connection.cursor() as cursor:
        for table, data in defaults:
            # Check if record exists
            cursor.execute(f"SELECT COUNT(*) FROM {table} WHERE id = ?", [data['id']])
            if cursor.fetchone()[0] == 0:
                # Insert default record
                columns = ', '.join(data.keys())
                placeholders = ', '.join(['?' for _ in data])
                cursor.execute(f"INSERT INTO {table} ({columns}) VALUES ({placeholders})", list(data.values()))
                print(f"✓ Created default record in {table}")

def insert_monitoring_data():
    """Insert monitoring results data into SQLite database"""
    
    print("Creating default foreign key records...")
    create_default_records()
    
    # Sample monitoring data
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
    
    print(f"\nStarting to insert {len(sample_data)} monitoring records...")
    
    with transaction.atomic():
        with connection.cursor() as cursor:
            for record in sample_data:
                try:
                    # Check if record already exists
                    cursor.execute("SELECT COUNT(*) FROM monitoring_results_oriented_monitoring WHERE id = ?", [record['id']])
                    if cursor.fetchone()[0] > 0:
                        print(f"Record {record['id']} already exists, skipping...")
                        continue
                    
                    # Insert with default foreign key values
                    cursor.execute("""
                        INSERT INTO monitoring_results_oriented_monitoring (
                            id, indicator_description, baseline_value, achieved_value, 
                            End_Target_Value, percentage_achieved_vs_baseline, 
                            percentage_achieved_vs_end_target, remarks, date_created,
                            collection_frequency_id, indicator_type_id, loginUser_id,
                            measurement_unit_id, pdo_id, project_id, project_outcome_id,
                            project_result_id, quarter_id, year_id
                        ) VALUES (
                            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
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
    
    # Check total records
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