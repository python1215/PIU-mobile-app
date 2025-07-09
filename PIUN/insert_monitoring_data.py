#!/usr/bin/env python3
"""
Script to insert monitoring results data into the database
"""

import os
import sys
import django
from datetime import datetime
from decimal import Decimal

# Add the project directory to the Python path
sys.path.append('/home/runner/workspace/PIUN')

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'piu_project.settings')
django.setup()

from django.db import connection
from monitoring.models import Results_Oriented_Monitoring
from PIU_Financial_mgt.models import Project
from setup.models import Quarter, YEAR, Data_Collection_Frequency, Indicator_Type, Measurement_Unit
from PIU_Financial_mgt.models import PDO, ProjectOutCome, ProjectResult
from django.contrib.auth.models import User

def insert_monitoring_data():
    """Insert monitoring results data using raw SQL for SQL Server compatibility"""
    
    # Read the TSV file data
    file_path = '/home/runner/workspace/attached_assets/Pasted-id-indicator-description-baseline-value-achieved-value-End-Target-Value-percentage-achieved-vs-basel-1752065944508_1752065944509.txt'
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except FileNotFoundError:
        print(f"Error: File not found at {file_path}")
        return 0, 1
    
    # Parse the data
    monitoring_data = []
    lines = content.strip().split('\n')
    
    # Skip header line
    for line in lines[1:]:  # Skip the header
        if line.strip():
            fields = line.split('\t')
            if len(fields) >= 19:
                try:
                    monitoring_data.append({
                        'id': int(fields[0]),
                        'indicator_description': fields[1],
                        'baseline_value': float(fields[2]),
                        'achieved_value': float(fields[3]),
                        'End_Target_Value': float(fields[4]),
                        'percentage_achieved_vs_baseline': float(fields[5]),
                        'percentage_achieved_vs_end_target': float(fields[6]),
                        'remarks': fields[7],
                        'date_created': fields[8],
                        'collection_frequency_id': int(fields[9]),
                        'indicator_type_id': int(fields[10]),
                        'loginUser_id': int(fields[11]),
                        'measurement_unit_id': int(fields[12]),
                        'pdo_id': int(fields[13]),
                        'project_id': fields[14],
                        'project_outcome_id': int(fields[15]),
                        'project_result_id': int(fields[16]),
                        'quarter_id': int(fields[17]),
                        'year_id': int(fields[18])
                    })
                except (ValueError, IndexError) as e:
                    print(f"Error parsing line: {line[:100]}... - {e}")
                    continue
    
    # Continue with additional records (truncated for brevity)
    # Add more records as needed...
    
    print(f"Starting to insert {len(monitoring_data)} monitoring records...")
    
    success_count = 0
    error_count = 0
    
    # Use raw SQL for SQL Server compatibility
    for record in monitoring_data:
        try:
            # Convert date string to datetime
            date_str = record['date_created'].strip()
            if '+00:00' in date_str:
                date_str = date_str.replace('+00:00', '')
            # Remove microseconds precision beyond 6 digits
            if '.' in date_str:
                date_part, microsec_part = date_str.split('.')
                microsec_part = microsec_part[:6]  # Keep only 6 digits
                date_str = f"{date_part}.{microsec_part}"
            date_created = datetime.fromisoformat(date_str)
            
            # Use raw SQL to insert
            with connection.cursor() as cursor:
                # Try different table names for SQL Server compatibility
                table_names = [
                    'monitoring_results_oriented_monitoring'
                ]
                
                insert_sql = """
                INSERT INTO {table_name} (
                    id, indicator_description, baseline_value, achieved_value, 
                    End_Target_Value, percentage_achieved_vs_baseline, 
                    percentage_achieved_vs_end_target, remarks, date_created,
                    collection_frequency_id, indicator_type_id, loginUser_id,
                    measurement_unit_id, pdo_id, project_id, project_outcome_id,
                    project_result_id, quarter_id, year_id
                ) VALUES (
                    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
                )
                """
                
                # Check if record already exists
                for table_name in table_names:
                    try:
                        cursor.execute(f"SELECT COUNT(*) FROM {table_name} WHERE id = ?", [record['id']])
                        if cursor.fetchone()[0] > 0:
                            print(f"Record {record['id']} already exists, skipping...")
                            break
                    except:
                        continue
                else:
                    # Insert the record
                    insert_successful = False
                    for table_name in table_names:
                        try:
                            cursor.execute(insert_sql.format(table_name=table_name), [
                                record['id'],
                                record['indicator_description'],
                                record['baseline_value'],
                                record['achieved_value'],
                                record['End_Target_Value'],
                                record['percentage_achieved_vs_baseline'],
                                record['percentage_achieved_vs_end_target'],
                                record['remarks'],
                                date_created,
                                record['collection_frequency_id'],
                                record['indicator_type_id'],
                                record['loginUser_id'],
                                record['measurement_unit_id'],
                                record['pdo_id'],
                                record['project_id'],
                                record['project_outcome_id'],
                                record['project_result_id'],
                                record['quarter_id'],
                                record['year_id']
                            ])
                            insert_successful = True
                            break
                        except Exception as e:
                            if "does not exist" in str(e).lower():
                                continue
                            else:
                                print(f"✗ Error inserting record {record['id']}: {str(e)}")
                                break
                    
                    if insert_successful:
                        success_count += 1
                        print(f"✓ Successfully inserted record {record['id']}: {record['indicator_description']}")
                    else:
                        error_count += 1
            
        except Exception as e:
            error_count += 1
            print(f"✗ Error processing record {record['id']}: {str(e)}")
    
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