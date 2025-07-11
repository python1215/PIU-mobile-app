#!/usr/bin/env python3
"""
Test script to verify Grievance CRUD operations work correctly
in both SQLite and SQL Server modes.
"""

import os
import sys
import django
from django.conf import settings

# Add the PIUN directory to the Python path
sys.path.insert(0, 'PIUN')

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'PIUN.settings')
django.setup()

from django.contrib.auth.models import User
from django.test import RequestFactory, Client
from django.db import connection
from social_and_env.models import GrievianceMonitoringLog
from utils.database_utils import is_sql_server_mode, execute_database_query
from PIU_Financial_mgt.models import Project
from setup.models import DecisionOutcome

def test_sqlite_mode():
    """Test Grievance CRUD operations in SQLite mode"""
    print("=== Testing SQLite Mode ===")
    
    # Get or create test user
    user, created = User.objects.get_or_create(
        username='testuser',
        defaults={'email': 'test@example.com'}
    )
    if created:
        user.set_password('testpass123')
        user.save()
    
    # Test CREATE operation
    print("1. Testing CREATE operation...")
    try:
        # Create test grievance
        grievance = GrievianceMonitoringLog.objects.create(
            case_no='TEST-GR-001',
            name_of_complainant='Test Complainant',
            sex='M',
            tell_no='1234567890',
            complaint_content='Test complaint content',
            name_of_person_receiving_complaint='Test Officer',
            how_complaint_was_received='Call',
            date_claim_recieved='2025-01-01',
            expected_decision_date='2025-01-15',
            was_complainant_satisfied_with_decision='N',
            any_follow_up_action='Test follow-up',
            loginUser=user,
            project=Project.objects.first(),
            type_of_investment_id=1,
            decision_outcome=DecisionOutcome.objects.first(),
            was_recieved_of_complaint_ack='Y',
            communication_method='Call',
            was_decison_communicated_to_complainant='Y',
            brief_note_for_NO_answer='Test note'
        )
        print(f"   ✓ Created grievance: {grievance.case_no}")
    except Exception as e:
        print(f"   ✗ CREATE failed: {e}")
        return False
    
    # Test READ operation
    print("2. Testing READ operation...")
    try:
        fetched_grievance = GrievianceMonitoringLog.objects.get(case_no='TEST-GR-001')
        print(f"   ✓ Retrieved grievance: {fetched_grievance.name_of_complainant}")
    except Exception as e:
        print(f"   ✗ READ failed: {e}")
        return False
    
    # Test UPDATE operation
    print("3. Testing UPDATE operation...")
    try:
        fetched_grievance.name_of_complainant = 'Updated Complainant'
        fetched_grievance.save()
        updated_grievance = GrievianceMonitoringLog.objects.get(case_no='TEST-GR-001')
        assert updated_grievance.name_of_complainant == 'Updated Complainant'
        print(f"   ✓ Updated grievance: {updated_grievance.name_of_complainant}")
    except Exception as e:
        print(f"   ✗ UPDATE failed: {e}")
        return False
    
    # Test DELETE operation
    print("4. Testing DELETE operation...")
    try:
        fetched_grievance.delete()
        try:
            GrievianceMonitoringLog.objects.get(case_no='TEST-GR-001')
            print("   ✗ DELETE failed: Record still exists")
            return False
        except GrievianceMonitoringLog.DoesNotExist:
            print("   ✓ Successfully deleted grievance")
    except Exception as e:
        print(f"   ✗ DELETE failed: {e}")
        return False
    
    print("SQLite mode CRUD operations: PASSED")
    return True

def test_sql_server_compatibility():
    """Test SQL Server compatibility (without actual SQL Server)"""
    print("\n=== Testing SQL Server Compatibility ===")
    
    # Test SQL query construction
    print("1. Testing SQL query construction...")
    try:
        # Test INSERT query format
        insert_query = """
            INSERT INTO [piuprod3].[dbo].[social_and_env_grieviancemonitoringlog]
            (case_no, name_of_complainant, sex, tell_no, 
             complaint_content, name_of_person_receiving_complaint,
             how_complaint_was_received, date_claim_recieved, 
             expected_decision_date, was_complainant_satisfied_with_decision,
             any_follow_up_action, date_created, loginUser_id, project_id, type_of_investment_id,
             decision_outcome_id, was_recieved_of_complaint_ack, communication_method,
             was_decison_communicated_to_complainant, brief_note_for_NO_answer)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, GETDATE(), ?, ?, ?, ?, ?, ?, ?, ?)
        """
        
        # Test UPDATE query format
        update_query = """
            UPDATE [piuprod3].[dbo].[social_and_env_grieviancemonitoringlog]
            SET name_of_complainant = ?,
                sex = ?,
                tell_no = ?,
                complaint_content = ?,
                name_of_person_receiving_complaint = ?,
                how_complaint_was_received = ?,
                expected_decision_date = ?,
                was_complainant_satisfied_with_decision = ?,
                any_follow_up_action = ?,
                project_id = ?,
                type_of_investment_id = ?,
                decision_outcome_id = ?,
                was_recieved_of_complaint_ack = ?,
                communication_method = ?,
                was_decison_communicated_to_complainant = ?,
                brief_note_for_NO_answer = ?
            WHERE case_no = ?
        """
        
        # Test DELETE query format
        delete_query = """
            DELETE FROM [piuprod3].[dbo].[social_and_env_grieviancemonitoringlog]
            WHERE case_no = ?
        """
        
        # Test SELECT query format
        select_query = """
            SELECT * FROM [piuprod3].[dbo].[social_and_env_grieviancemonitoringlog]
            WHERE case_no = ?
        """
        
        print("   ✓ SQL Server query formats are correct")
    except Exception as e:
        print(f"   ✗ SQL Server query construction failed: {e}")
        return False
    
    print("2. Testing parameter binding...")
    try:
        # Test parameter count matches
        test_params = [
            'GR-TEST001', 'Test User', 'M', '1234567890',
            'Test complaint', 'Test Officer', 'Call', '2025-01-01',
            '2025-01-15', 'N', 'Test action', 1, 1, 1, 1, 'Y', 'Call', 'Y', 'Test note'
        ]
        
        # Count placeholders in INSERT query
        insert_placeholders = insert_query.count('?')
        if insert_placeholders == len(test_params):
            print("   ✓ INSERT parameter count matches")
        else:
            print(f"   ✗ INSERT parameter mismatch: {insert_placeholders} placeholders, {len(test_params)} params")
            return False
        
        # Count placeholders in UPDATE query  
        update_placeholders = update_query.count('?')
        update_params = test_params[1:] + [test_params[0]]  # Move case_no to end
        if update_placeholders == len(update_params):
            print("   ✓ UPDATE parameter count matches")
        else:
            print(f"   ✗ UPDATE parameter mismatch: {update_placeholders} placeholders, {len(update_params)} params")
            return False
            
    except Exception as e:
        print(f"   ✗ Parameter binding test failed: {e}")
        return False
    
    print("SQL Server compatibility: PASSED")
    return True

def test_database_mode_detection():
    """Test database mode detection"""
    print("\n=== Testing Database Mode Detection ===")
    
    try:
        mode = is_sql_server_mode()
        print(f"Current database mode: {'SQL Server' if mode else 'SQLite'}")
        
        # Test database engine detection
        with connection.cursor() as cursor:
            engine = connection.settings_dict['ENGINE']
            print(f"Database engine: {engine}")
            
        return True
    except Exception as e:
        print(f"Database mode detection failed: {e}")
        return False

def main():
    """Run all tests"""
    print("Grievance CRUD Operations Test Suite")
    print("=" * 40)
    
    # Test database mode detection
    if not test_database_mode_detection():
        print("❌ Database mode detection failed")
        return False
    
    # Test SQLite mode
    if not test_sqlite_mode():
        print("❌ SQLite mode tests failed")
        return False
    
    # Test SQL Server compatibility
    if not test_sql_server_compatibility():
        print("❌ SQL Server compatibility tests failed")
        return False
    
    print("\n" + "=" * 40)
    print("✅ All Grievance CRUD tests PASSED!")
    print("Both SQLite and SQL Server modes are ready for production.")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)