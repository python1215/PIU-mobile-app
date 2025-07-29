#!/usr/bin/env python
"""
Script to update Quarter table with correct IDs for offline system compatibility
"""
import os
import sys
import django

# Add the project directory to Python path
sys.path.append('/home/runner/workspace/PIUN')

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'PIUN.settings')
django.setup()

from setup.models import Quarter
from django.contrib.auth import get_user_model
from django.db import transaction

def update_quarters():
    User = get_user_model()
    
    # Get admin user or first available user
    try:
        admin_user = User.objects.filter(is_superuser=True).first() or User.objects.first()
        if not admin_user:
            print("No users found in the system!")
            return False
    except Exception as e:
        print(f"Error getting user: {e}")
        return False
    
    print(f"Using user: {admin_user}")
    
    try:
        with transaction.atomic():
            # Delete existing quarters
            Quarter.objects.all().delete()
            
            # Create new quarters with specific IDs
            quarters_data = [
                {'id': 10022, 'quarter': 'Quarter 1', 'loginUser': admin_user},
                {'id': 10023, 'quarter': 'Quarter 2', 'loginUser': admin_user},
                {'id': 10024, 'quarter': 'Quarter 3', 'loginUser': admin_user},
                {'id': 10025, 'quarter': 'Quarter 4', 'loginUser': admin_user},
            ]
            
            # Create quarters one by one
            for data in quarters_data:
                quarter = Quarter(**data)
                quarter.save()
                print(f"Created Quarter: ID={quarter.id}, Quarter={quarter.quarter}")
        
        # Verify creation
        print("\nVerifying quarters:")
        for q in Quarter.objects.all().order_by('id'):
            print(f"ID: {q.id}, Quarter: {q.quarter}, User: {q.loginUser}")
        
        return True
        
    except Exception as e:
        print(f"Error creating quarters: {e}")
        return False

if __name__ == "__main__":
    success = update_quarters()
    if success:
        print("\n✓ Quarter table updated successfully with IDs 10022-10025")
    else:
        print("\n✗ Failed to update quarter table")