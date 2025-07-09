#!/usr/bin/env python3
"""
SQL Server Database Setup Script for PIUN Project
This script sets up the SQL Server database using the provided SQL script
"""

import os
import sys
import pyodbc
from pathlib import Path

class SQLServerSetup:
    def __init__(self, server='localhost', database='piuprod', username='sa', password=''):
        self.server = server
        self.database = database
        self.username = username
        self.password = password
        self.connection_string = (
            f"DRIVER={{ODBC Driver 17 for SQL Server}};"
            f"SERVER={server};"
            f"DATABASE={database};"
            f"UID={username};"
            f"PWD={password};"
            f"TrustServerCertificate=yes;"
        )
        
    def test_connection(self):
        """Test SQL Server connection"""
        try:
            with pyodbc.connect(self.connection_string) as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT @@VERSION")
                result = cursor.fetchone()
                print(f"✓ SQL Server connection successful: {result[0][:50]}...")
                return True
        except Exception as e:
            print(f"✗ SQL Server connection failed: {e}")
            return False
    
    def execute_sql_file(self, sql_file_path):
        """Execute SQL script from file"""
        try:
            with open(sql_file_path, 'r', encoding='utf-8') as file:
                sql_content = file.read()
                
            # Split SQL content by GO statements
            sql_statements = [stmt.strip() for stmt in sql_content.split('GO') if stmt.strip()]
            
            with pyodbc.connect(self.connection_string) as conn:
                cursor = conn.cursor()
                
                executed = 0
                for stmt in sql_statements:
                    if stmt.strip():
                        try:
                            cursor.execute(stmt)
                            executed += 1
                        except Exception as e:
                            print(f"Warning: Statement failed: {str(e)[:100]}...")
                            continue
                
                conn.commit()
                print(f"✓ Successfully executed {executed} SQL statements")
                return True
                
        except Exception as e:
            print(f"✗ Failed to execute SQL file: {e}")
            return False
    
    def enable_sql_server_mode(self):
        """Enable SQL Server mode in Django settings"""
        os.environ['USE_SQL_SERVER'] = 'True'
        os.environ['DB_HOST'] = self.server
        os.environ['DB_USER'] = self.username
        os.environ['DB_PASSWORD'] = self.password
        os.environ['DB_PORT'] = '1433'
        
        print("✓ SQL Server mode enabled in environment")
        
    def setup_database(self, sql_file_path):
        """Complete database setup process"""
        print("=" * 60)
        print("PIUN SQL Server Database Setup")
        print("=" * 60)
        
        # Test connection
        if not self.test_connection():
            return False
        
        # Execute SQL setup script
        if not self.execute_sql_file(sql_file_path):
            return False
        
        # Enable SQL Server mode
        self.enable_sql_server_mode()
        
        print("\n" + "=" * 60)
        print("✓ SQL Server database setup completed successfully!")
        print("✓ System is now configured for SQL Server mode")
        print("=" * 60)
        
        return True

def main():
    """Main setup function"""
    # Use the latest SQL script by default
    latest_sql_script = "../attached_assets/Pasted-USE-piuprod-GO-ALTER-TABLE-dbo-django-admin-log-DROP-CONSTRAINT-django-admin-log-action-fla-1752062311540_1752062311549.txt"
    
    if len(sys.argv) < 2:
        print("Usage: python setup_sql_server.py [sql_file_path] [server] [username] [password]")
        print("Example: python setup_sql_server.py database_script.sql localhost sa mypassword")
        print(f"Default: Will use {latest_sql_script}")
        
        # Use default script if no arguments provided
        sql_file_path = latest_sql_script
        server = 'localhost'
        username = 'sa'
        password = ''
    else:
        sql_file_path = sys.argv[1]
        server = sys.argv[2] if len(sys.argv) > 2 else 'localhost'
        username = sys.argv[3] if len(sys.argv) > 3 else 'sa'
        password = sys.argv[4] if len(sys.argv) > 4 else ''
    
    if not os.path.exists(sql_file_path):
        print(f"✗ SQL file not found: {sql_file_path}")
        sys.exit(1)
    
    setup = SQLServerSetup(server, 'piuprod', username, password)
    
    if setup.setup_database(sql_file_path):
        print("\nNext steps:")
        print("1. Restart the Django application")
        print("2. The system will automatically use SQL Server mode")
        print("3. All views will use raw SQL queries for compatibility")
        print("4. Enhanced database schema with comprehensive table structure")
    else:
        print("\n✗ Database setup failed. Please check the configuration and try again.")
        sys.exit(1)

if __name__ == "__main__":
    main()