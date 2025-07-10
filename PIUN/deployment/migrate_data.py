#!/usr/bin/env python3
"""
PIU M&E System - Data Migration Script
For Offline SQL Server Deployment

This script migrates data from SQLite to SQL Server or between different databases.
"""

import os
import sys
import django
from pathlib import Path
from datetime import datetime

# Add the project root to Python path
sys.path.insert(0, str(Path(__file__).parent.parent))

# Configure Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'deployment.production_settings')
django.setup()

from django.db import connections, transaction
from django.core.management import call_command
from django.apps import apps

class DataMigrator:
    def __init__(self):
        self.source_db = 'default'
        self.target_db = 'default'
        self.migrated_records = {}
        
    def get_all_models(self):
        """Get all Django models for migration"""
        models = []
        for app in apps.get_app_configs():
            if app.name.startswith('PIUN') or app.name in ['accounts', 'setup', 'monitoring']:
                models.extend(app.get_models())
        return models
        
    def migrate_model_data(self, model_class):
        """Migrate data for a specific model"""
        model_name = f"{model_class._meta.app_label}.{model_class._meta.model_name}"
        
        try:
            # Get all records from source
            records = model_class.objects.using(self.source_db).all()
            record_count = records.count()
            
            if record_count == 0:
                print(f"  No records to migrate for {model_name}")
                return 0
            
            # Clear existing records in target (optional)
            # model_class.objects.using(self.target_db).all().delete()
            
            # Migrate records in batches
            batch_size = 1000
            migrated = 0
            
            for i in range(0, record_count, batch_size):
                batch = records[i:i + batch_size]
                batch_records = []
                
                for record in batch:
                    # Create a new instance without primary key
                    new_record = model_class()
                    for field in model_class._meta.fields:
                        if not field.primary_key:
                            setattr(new_record, field.name, getattr(record, field.name))
                    batch_records.append(new_record)
                
                # Bulk create in target database
                model_class.objects.using(self.target_db).bulk_create(
                    batch_records, 
                    ignore_conflicts=True
                )
                
                migrated += len(batch_records)
                print(f"  Migrated {migrated}/{record_count} records for {model_name}")
            
            self.migrated_records[model_name] = migrated
            return migrated
            
        except Exception as e:
            print(f"  ERROR migrating {model_name}: {str(e)}")
            return 0
            
    def migrate_all_data(self):
        """Migrate all data from source to target database"""
        print("PIU M&E System - Data Migration")
        print("=" * 50)
        print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print()
        
        # Get all models
        models = self.get_all_models()
        
        # Sort models by dependency order (rough approximation)
        priority_models = [
            'auth.user',
            'setup.regions',
            'setup.districts',
            'setup.settlements',
            'piu_project.project',
            'setup.year',
            'setup.quarter',
        ]
        
        sorted_models = []
        
        # Add priority models first
        for priority in priority_models:
            for model in models:
                model_name = f"{model._meta.app_label}.{model._meta.model_name}"
                if model_name == priority:
                    sorted_models.append(model)
                    break
        
        # Add remaining models
        for model in models:
            if model not in sorted_models:
                sorted_models.append(model)
        
        total_migrated = 0
        
        # Migrate each model
        for model in sorted_models:
            model_name = f"{model._meta.app_label}.{model._meta.model_name}"
            print(f"Migrating {model_name}...")
            
            try:
                with transaction.atomic(using=self.target_db):
                    count = self.migrate_model_data(model)
                    total_migrated += count
                    
            except Exception as e:
                print(f"  ERROR: {str(e)}")
                continue
        
        # Summary
        print()
        print("=" * 50)
        print("MIGRATION SUMMARY")
        print("=" * 50)
        print(f"Total models processed: {len(sorted_models)}")
        print(f"Total records migrated: {total_migrated}")
        print()
        
        if self.migrated_records:
            print("Records migrated by model:")
            for model_name, count in self.migrated_records.items():
                print(f"  {model_name}: {count}")
        
        print(f"\nCompleted at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
    def export_to_sql(self, output_file):
        """Export data to SQL file for manual import"""
        print(f"Exporting data to SQL file: {output_file}")
        
        try:
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write("-- PIU M&E System Data Export\n")
                f.write(f"-- Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
                
                # Export each model
                models = self.get_all_models()
                for model in models:
                    self.export_model_to_sql(model, f)
                    
            print(f"Data exported successfully to {output_file}")
            
        except Exception as e:
            print(f"ERROR exporting data: {str(e)}")
            
    def export_model_to_sql(self, model_class, file_handle):
        """Export a single model to SQL"""
        model_name = f"{model_class._meta.app_label}.{model_class._meta.model_name}"
        table_name = model_class._meta.db_table
        
        try:
            records = model_class.objects.using(self.source_db).all()
            
            if not records.exists():
                return
                
            file_handle.write(f"-- Data for {model_name}\n")
            file_handle.write(f"-- Table: {table_name}\n\n")
            
            # Get field names
            fields = [f.column for f in model_class._meta.fields]
            
            for record in records:
                values = []
                for field in model_class._meta.fields:
                    value = getattr(record, field.name)
                    if value is None:
                        values.append('NULL')
                    elif isinstance(value, str):
                        values.append(f"'{value.replace("'", "''")}'")
                    elif isinstance(value, (int, float)):
                        values.append(str(value))
                    else:
                        values.append(f"'{str(value)}'")
                
                insert_sql = f"INSERT INTO {table_name} ({', '.join(fields)}) VALUES ({', '.join(values)});\n"
                file_handle.write(insert_sql)
            
            file_handle.write(f"\n")
            
        except Exception as e:
            file_handle.write(f"-- ERROR exporting {model_name}: {str(e)}\n\n")

def main():
    """Main function"""
    import argparse
    
    parser = argparse.ArgumentParser(description='PIU M&E System Data Migration')
    parser.add_argument('--action', choices=['migrate', 'export'], default='migrate',
                       help='Action to perform: migrate or export')
    parser.add_argument('--output', type=str, default='data_export.sql',
                       help='Output file for SQL export')
    
    args = parser.parse_args()
    
    try:
        migrator = DataMigrator()
        
        if args.action == 'migrate':
            migrator.migrate_all_data()
        elif args.action == 'export':
            migrator.export_to_sql(args.output)
        
    except Exception as e:
        print(f"Migration failed with error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()