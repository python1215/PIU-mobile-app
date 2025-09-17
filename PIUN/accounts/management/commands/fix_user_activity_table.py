from django.core.management.base import BaseCommand
from django.db import connection
from django.conf import settings

class Command(BaseCommand):
    help = 'Fix missing dashboard_user_activity table issue'

    def handle(self, *args, **options):
        self.stdout.write("=== Dashboard User Activity Fix ===")
        
        # Check database backend
        backend = connection.settings_dict['ENGINE']
        self.stdout.write(f"Database backend: {backend}")
        
        # Check if table exists
        table_exists = self.check_table_exists()
        
        if not table_exists:
            self.stdout.write(self.style.WARNING("Table 'dashboard_user_activity' doesn't exist. Creating..."))
            success = self.create_missing_table()
            
            if success:
                self.stdout.write(self.style.SUCCESS("✅ Fix applied successfully!"))
                self.stdout.write("You can now delete users from Django admin.")
            else:
                self.stdout.write(self.style.ERROR("❌ Fix failed."))
        else:
            self.stdout.write(self.style.SUCCESS("✅ Table already exists."))

    def check_table_exists(self):
        """Check if dashboard_user_activity table exists"""
        try:
            with connection.cursor() as cursor:
                backend = connection.settings_dict['ENGINE']
                
                if 'sqlite3' in backend:
                    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='dashboard_user_activity';")
                elif 'mssql' in backend or 'sqlserver' in backend:
                    cursor.execute("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'dashboard_user_activity';")
                else:
                    cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_name = 'dashboard_user_activity';")
                
                result = cursor.fetchone()
                exists = result is not None
                self.stdout.write(f"Table 'dashboard_user_activity' exists: {exists}")
                return exists
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error checking table: {e}"))
            return False

    def create_missing_table(self):
        """Create the missing dashboard_user_activity table"""
        try:
            with connection.cursor() as cursor:
                backend = connection.settings_dict['ENGINE']
                
                if 'sqlite3' in backend:
                    cursor.execute("""
                    CREATE TABLE IF NOT EXISTS dashboard_user_activity (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        user_id INTEGER NOT NULL,
                        activity_type VARCHAR(100),
                        description TEXT,
                        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (user_id) REFERENCES accounts_user (id)
                    );
                    """)
                elif 'mssql' in backend or 'sqlserver' in backend:
                    cursor.execute("""
                    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='dashboard_user_activity' AND xtype='U')
                    CREATE TABLE dashboard_user_activity (
                        id INT IDENTITY(1,1) PRIMARY KEY,
                        user_id INT NOT NULL,
                        activity_type NVARCHAR(100),
                        description NVARCHAR(MAX),
                        timestamp DATETIME2 DEFAULT GETDATE(),
                        FOREIGN KEY (user_id) REFERENCES accounts_user (id)
                    );
                    """)
                else:
                    cursor.execute("""
                    CREATE TABLE IF NOT EXISTS dashboard_user_activity (
                        id SERIAL PRIMARY KEY,
                        user_id INTEGER NOT NULL,
                        activity_type VARCHAR(100),
                        description TEXT,
                        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (user_id) REFERENCES accounts_user (id)
                    );
                    """)
                
                self.stdout.write(self.style.SUCCESS("Created dashboard_user_activity table"))
                return True
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error creating table: {e}"))
            return False