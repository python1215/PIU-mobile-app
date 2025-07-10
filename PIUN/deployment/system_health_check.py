#!/usr/bin/env python3
"""
PIU M&E System - System Health Check Script
For Offline SQL Server Deployment

This script performs comprehensive health checks on the PIU M&E System
including database connectivity, application functionality, and system resources.
"""

import os
import sys
import time
import psutil
import django
from datetime import datetime
from pathlib import Path

# Add the project root to Python path
sys.path.insert(0, str(Path(__file__).parent.parent))

# Configure Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'deployment.production_settings')
django.setup()

from django.db import connection
from django.core.management import execute_from_command_line
from django.contrib.auth.models import User
from django.test import Client

class HealthChecker:
    def __init__(self):
        self.results = []
        self.client = Client()
        
    def log_result(self, check_name, status, message, details=None):
        """Log health check result"""
        result = {
            'check': check_name,
            'status': status,
            'message': message,
            'timestamp': datetime.now().isoformat(),
            'details': details or {}
        }
        self.results.append(result)
        
        # Print to console
        status_symbol = "✓" if status == "PASS" else "✗" if status == "FAIL" else "⚠"
        print(f"{status_symbol} {check_name}: {message}")
        if details:
            for key, value in details.items():
                print(f"  {key}: {value}")
        print()
        
    def check_system_resources(self):
        """Check system resources (CPU, Memory, Disk)"""
        try:
            # CPU usage
            cpu_percent = psutil.cpu_percent(interval=1)
            
            # Memory usage
            memory = psutil.virtual_memory()
            memory_percent = memory.percent
            memory_available_gb = memory.available / (1024**3)
            
            # Disk usage
            disk = psutil.disk_usage('/')
            disk_percent = disk.percent
            disk_free_gb = disk.free / (1024**3)
            
            details = {
                'CPU Usage': f"{cpu_percent}%",
                'Memory Usage': f"{memory_percent}% ({memory_available_gb:.1f}GB available)",
                'Disk Usage': f"{disk_percent}% ({disk_free_gb:.1f}GB free)"
            }
            
            # Determine status
            if cpu_percent > 90 or memory_percent > 90 or disk_percent > 90:
                status = "FAIL"
                message = "System resources critically low"
            elif cpu_percent > 70 or memory_percent > 70 or disk_percent > 80:
                status = "WARN"
                message = "System resources getting high"
            else:
                status = "PASS"
                message = "System resources OK"
                
            self.log_result("System Resources", status, message, details)
            
        except Exception as e:
            self.log_result("System Resources", "FAIL", f"Error checking system resources: {str(e)}")
            
    def check_database_connectivity(self):
        """Check database connectivity and basic operations"""
        try:
            # Test database connection
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                result = cursor.fetchone()
                
            if result and result[0] == 1:
                self.log_result("Database Connectivity", "PASS", "Database connection successful")
                
                # Test database operations
                self.check_database_operations()
            else:
                self.log_result("Database Connectivity", "FAIL", "Database connection failed")
                
        except Exception as e:
            self.log_result("Database Connectivity", "FAIL", f"Database error: {str(e)}")
            
    def check_database_operations(self):
        """Check basic database operations"""
        try:
            with connection.cursor() as cursor:
                # Check if main tables exist
                cursor.execute("""
                    SELECT COUNT(*) FROM information_schema.tables 
                    WHERE table_schema = 'dbo' AND table_name LIKE 'social_and_env_%'
                """)
                table_count = cursor.fetchone()[0]
                
                # Check record counts
                cursor.execute("SELECT COUNT(*) FROM social_and_env_pap")
                pap_count = cursor.fetchone()[0]
                
                cursor.execute("SELECT COUNT(*) FROM social_and_env_grieviancemonitoringlog")
                grievance_count = cursor.fetchone()[0]
                
                details = {
                    'Social & Environmental tables': table_count,
                    'PAP records': pap_count,
                    'Grievance records': grievance_count
                }
                
                if table_count > 0:
                    self.log_result("Database Operations", "PASS", "Database operations OK", details)
                else:
                    self.log_result("Database Operations", "FAIL", "Database tables missing", details)
                    
        except Exception as e:
            self.log_result("Database Operations", "FAIL", f"Database operation error: {str(e)}")
            
    def check_application_functionality(self):
        """Check application functionality"""
        try:
            # Test main dashboard
            response = self.client.get('/')
            
            if response.status_code == 200:
                self.log_result("Application Dashboard", "PASS", "Main dashboard accessible")
            elif response.status_code == 302:
                self.log_result("Application Dashboard", "PASS", "Dashboard redirects to login (expected)")
            else:
                self.log_result("Application Dashboard", "FAIL", f"Dashboard returned status {response.status_code}")
                
            # Test key modules
            self.check_module_functionality()
            
        except Exception as e:
            self.log_result("Application Functionality", "FAIL", f"Application error: {str(e)}")
            
    def check_module_functionality(self):
        """Check individual module functionality"""
        modules = [
            ('social_and_env/pap/', 'PAP Management'),
            ('social_and_env/grievance/', 'Grievance Management'),
            ('social_and_env/ohs/', 'OHS Monitoring'),
            ('Issues_Actions_monitoring/', 'Issues & Actions'),
            ('PIU_Financial_mgt/', 'Financial Management'),
        ]
        
        for url, module_name in modules:
            try:
                response = self.client.get(f'/{url}')
                
                if response.status_code in [200, 302]:
                    self.log_result(f"Module - {module_name}", "PASS", "Module accessible")
                else:
                    self.log_result(f"Module - {module_name}", "FAIL", f"Module returned status {response.status_code}")
                    
            except Exception as e:
                self.log_result(f"Module - {module_name}", "FAIL", f"Module error: {str(e)}")
                
    def check_user_authentication(self):
        """Check user authentication system"""
        try:
            # Check if superuser exists
            superuser_count = User.objects.filter(is_superuser=True).count()
            
            if superuser_count > 0:
                self.log_result("User Authentication", "PASS", f"Superuser accounts: {superuser_count}")
            else:
                self.log_result("User Authentication", "WARN", "No superuser accounts found")
                
            # Check total user count
            total_users = User.objects.count()
            details = {
                'Total users': total_users,
                'Superusers': superuser_count
            }
            
            self.log_result("User Accounts", "PASS", "User system OK", details)
            
        except Exception as e:
            self.log_result("User Authentication", "FAIL", f"Authentication error: {str(e)}")
            
    def check_file_permissions(self):
        """Check file and directory permissions"""
        try:
            base_dir = Path(__file__).parent.parent
            
            # Check critical directories
            critical_dirs = [
                'logs',
                'media',
                'static',
                'staticfiles'
            ]
            
            permissions_ok = True
            for dir_name in critical_dirs:
                dir_path = base_dir / dir_name
                if dir_path.exists():
                    if not os.access(dir_path, os.W_OK):
                        permissions_ok = False
                        break
                else:
                    # Try to create directory
                    try:
                        dir_path.mkdir(exist_ok=True)
                    except:
                        permissions_ok = False
                        break
            
            if permissions_ok:
                self.log_result("File Permissions", "PASS", "File permissions OK")
            else:
                self.log_result("File Permissions", "FAIL", "File permission issues detected")
                
        except Exception as e:
            self.log_result("File Permissions", "FAIL", f"Permission check error: {str(e)}")
            
    def run_all_checks(self):
        """Run all health checks"""
        print("PIU M&E System Health Check")
        print("=" * 50)
        print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print()
        
        # Run all checks
        self.check_system_resources()
        self.check_database_connectivity()
        self.check_application_functionality()
        self.check_user_authentication()
        self.check_file_permissions()
        
        # Summary
        print("=" * 50)
        print("HEALTH CHECK SUMMARY")
        print("=" * 50)
        
        pass_count = sum(1 for r in self.results if r['status'] == 'PASS')
        warn_count = sum(1 for r in self.results if r['status'] == 'WARN')
        fail_count = sum(1 for r in self.results if r['status'] == 'FAIL')
        
        print(f"Total checks: {len(self.results)}")
        print(f"Passed: {pass_count}")
        print(f"Warnings: {warn_count}")
        print(f"Failed: {fail_count}")
        
        if fail_count > 0:
            print("\nFAILED CHECKS:")
            for result in self.results:
                if result['status'] == 'FAIL':
                    print(f"- {result['check']}: {result['message']}")
        
        if warn_count > 0:
            print("\nWARNING CHECKS:")
            for result in self.results:
                if result['status'] == 'WARN':
                    print(f"- {result['check']}: {result['message']}")
        
        print(f"\nCompleted at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Return overall status
        if fail_count > 0:
            return False
        else:
            return True

def main():
    """Main function"""
    try:
        checker = HealthChecker()
        success = checker.run_all_checks()
        
        # Exit with appropriate code
        sys.exit(0 if success else 1)
        
    except Exception as e:
        print(f"Health check failed with error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()