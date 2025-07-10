#!/usr/bin/env python
"""
SQL Server Deployment Script
Configures the system for SQL Server deployment in offline LAN environment
"""

import os
import sys
import subprocess
from pathlib import Path

def setup_sql_server_environment():
    """Configure environment for SQL Server deployment"""
    print("🚀 Setting up SQL Server deployment environment...")
    
    # Set environment variables for SQL Server
    env_vars = {
        'USE_SQL_SERVER': 'true',
        'SQL_SERVER_DB': 'piuprod',
        'SQL_SERVER_USER': 'sa',
        'SQL_SERVER_HOST': 'localhost',
        'SQL_SERVER_PORT': '1433',
        'DATABASE_MODE': 'sql_server'
    }
    
    # Create .env file for production
    env_file = Path('.env')
    with open(env_file, 'w') as f:
        for key, value in env_vars.items():
            f.write(f"{key}={value}\n")
    
    print("✅ Environment variables configured for SQL Server")
    print("📋 Configuration:")
    for key, value in env_vars.items():
        if 'PASSWORD' not in key:
            print(f"   {key}: {value}")
    
    print("\n🔧 Installation Requirements:")
    print("   - Microsoft SQL Server (Express/Standard/Enterprise)")
    print("   - ODBC Driver 17 for SQL Server")
    print("   - pyodbc package")
    print("   - django-mssql-backend package")
    
    print("\n📊 Database Setup:")
    print("   1. Create database 'piuprod' in SQL Server")
    print("   2. Configure SQL Server Authentication")
    print("   3. Run Django migrations: python manage.py migrate")
    print("   4. Import data using provided SQL scripts")
    
    print("\n🚀 To start the application:")
    print("   python manage.py runserver 0.0.0.0:8000")
    
    return True

def setup_sqlite_environment():
    """Configure environment for SQLite development"""
    print("🔧 Setting up SQLite development environment...")
    
    # Remove SQL Server environment variables
    env_file = Path('.env')
    if env_file.exists():
        env_file.unlink()
    
    # Create .env file for development
    with open(env_file, 'w') as f:
        f.write("USE_SQL_SERVER=false\n")
        f.write("DATABASE_MODE=sqlite\n")
    
    print("✅ Environment configured for SQLite")
    print("📋 Configuration:")
    print("   USE_SQL_SERVER: false")
    print("   DATABASE_MODE: sqlite")
    
    print("\n🚀 To start the application:")
    print("   python manage.py runserver 0.0.0.0:8000")
    
    return True

def main():
    """Main deployment configuration"""
    print("PIU M&E System - Database Configuration")
    print("=" * 50)
    
    if len(sys.argv) < 2:
        print("Usage: python deploy_sql_server.py [sqlite|sqlserver]")
        print("  sqlite    - Configure for SQLite development")
        print("  sqlserver - Configure for SQL Server production")
        sys.exit(1)
    
    mode = sys.argv[1].lower()
    
    if mode == 'sqlite':
        setup_sqlite_environment()
    elif mode == 'sqlserver':
        setup_sql_server_environment()
    else:
        print("Invalid mode. Use 'sqlite' or 'sqlserver'")
        sys.exit(1)
    
    print("\n✅ Configuration complete!")
    print("🔄 Restart the application to apply changes.")

if __name__ == "__main__":
    main()