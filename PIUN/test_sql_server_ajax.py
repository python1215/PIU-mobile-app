#!/usr/bin/env python
"""
Test script for SQL Server AJAX endpoints
This script tests the cascading dropdown functionality for SQL Server compatibility
"""

import os
import sys
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'piu_project.settings')
django.setup()

from django.test import Client
from accounts.models import User
import json

def test_ajax_endpoints():
    """Test the AJAX endpoints for cascading dropdowns"""
    print("=== Testing SQL Server AJAX Endpoints ===\n")
    
    try:
        # Create a test client and login as admin
        client = Client()
        admin_user = User.objects.get(username='admin')
        client.force_login(admin_user)
        
        print("1. Testing Type of Investments endpoint:")
        response = client.get('/project_actions/ajax/load-type-of-investments/', {
            'monitoring_type_id': 'proc',  # Using monitoring type code
            'project_id': 'D309D6530GM'
        })
        
        print(f"   Status: {response.status_code}")
        data = json.loads(response.content.decode())
        print(f"   Options count: {len(data.get('options', []))}")
        
        if data.get('options'):
            print(f"   Sample option: {data['options'][0]}")
            investment_code = data['options'][0]['value']
        else:
            print("   No investment options found!")
            return False
            
        print("\n2. Testing KPI Descriptions endpoint:")
        response2 = client.get('/project_actions/ajax/load-kpi-descriptions/', {
            'investment_code': investment_code,
            'project_id': 'D309D6530GM'
        })
        
        print(f"   Status: {response2.status_code}")
        data2 = json.loads(response2.content.decode())
        print(f"   Options count: {len(data2.get('options', []))}")
        
        if data2.get('options'):
            print(f"   Sample option: {data2['options'][0]}")
        else:
            print("   No KPI descriptions found!")
            
        print("\n3. Database content verification:")
        from PIU_Financial_mgt.models import KPI_For_Contract
        total_kpis = KPI_For_Contract.objects.count()
        project_kpis = KPI_For_Contract.objects.filter(project__projectID='D309D6530GM').count()
        print(f"   Total KPI records: {total_kpis}")
        print(f"   KPIs for project D309D6530GM: {project_kpis}")
        
        # Show available projects and monitoring types
        projects = KPI_For_Contract.objects.values_list('project__projectID', flat=True).distinct()
        monitoring_types = KPI_For_Contract.objects.values_list('monitoring_type__monitoring_type_code', flat=True).distinct()
        
        print(f"   Available projects: {list(projects)[:5]}...")
        print(f"   Available monitoring types: {list(monitoring_types)}")
        
        return True
        
    except Exception as e:
        print(f"   Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_ajax_endpoints()
    sys.exit(0 if success else 1)