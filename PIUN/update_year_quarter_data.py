#!/usr/bin/env python
import os
import sys
import django
from django.contrib.auth import get_user_model

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'piu_project.settings')
django.setup()

from setup.models import YEAR, Quarter

User = get_user_model()

def update_year_data():
    """Update YEAR table to match offline deployment data"""
    print("Updating YEAR table...")
    
    # Get or create admin user (assuming loginUser_id 5 corresponds to admin)
    admin_user, created = User.objects.get_or_create(
        username='admin',
        defaults={'email': 'admin@example.com'}
    )
    
    # Clear existing year data
    YEAR.objects.all().delete()
    
    # Add years 2019-2030 to match offline deployment
    years_data = [
        {'profile_year': '2019'},
        {'profile_year': '2020'},
        {'profile_year': '2021'},
        {'profile_year': '2022'},
        {'profile_year': '2023'},
        {'profile_year': '2024'},
        {'profile_year': '2025'},
        {'profile_year': '2026'},
        {'profile_year': '2027'},
        {'profile_year': '2028'},
        {'profile_year': '2029'},
        {'profile_year': '2030'},
    ]
    
    for year_data in years_data:
        YEAR.objects.create(
            profile_year=year_data['profile_year'],
            loginUser=admin_user
        )
    
    print(f"Created {len(years_data)} year records (2019-2030)")

def update_quarter_data():
    """Update Quarter table to match offline deployment data"""
    print("Updating Quarter table...")
    
    # Get admin user
    admin_user = User.objects.filter(username='admin').first()
    if not admin_user:
        admin_user = User.objects.first()  # Fallback to first user
    
    # Clear existing quarter data
    Quarter.objects.all().delete()
    
    # Add quarters to match offline deployment
    quarters_data = [
        {'quarter': 'Weekly'},
        {'quarter': 'Monthly'},
        {'quarter': 'Quarterly'},
        {'quarter': 'Annually'},
        {'quarter': 'Quarter 1'},
        {'quarter': 'Quarter 2'},
        {'quarter': 'Quarter 3'},
        {'quarter': 'Quarter 4'},
    ]
    
    for quarter_data in quarters_data:
        Quarter.objects.create(
            quarter=quarter_data['quarter'],
            loginUser=admin_user
        )
    
    print(f"Created {len(quarters_data)} quarter records")

def verify_data():
    """Verify the updated data"""
    print("\nVerifying updated data:")
    print(f"YEAR records: {YEAR.objects.count()}")
    for year in YEAR.objects.all().order_by('profile_year'):
        print(f"  ID: {year.id}, Year: {year.profile_year}")
    
    print(f"\nQuarter records: {Quarter.objects.count()}")
    for quarter in Quarter.objects.all():
        print(f"  ID: {quarter.id}, Quarter: {quarter.quarter}")

if __name__ == "__main__":
    print("Starting data update process...")
    try:
        update_year_data()
        update_quarter_data()
        verify_data()
        print("\nData update completed successfully!")
    except Exception as e:
        print(f"Error updating data: {e}")
        import traceback
        traceback.print_exc()