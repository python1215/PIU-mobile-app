#!/usr/bin/env python3
"""
MS SQL Server Environment Setup for Replit
Configures environment variables for MS SQL Server connection
"""

import os

def setup_mssql_environment():
    """Set up environment variables for MS SQL Server connection"""
    
    print("Setting up MS SQL Server environment variables...")
    
    # Set environment variables
    env_vars = {
        'USE_SQL_SERVER': 'true',
        'MSSQL_DATABASE': 'piuprod3', 
        'MSSQL_USER': 'nawec',
        'MSSQL_PASSWORD': 'password',
        'MSSQL_HOST': 'PGOMEZ\\PGOMEZ',
        'MSSQL_PORT': '1433'
    }
    
    for key, value in env_vars.items():
        os.environ[key] = value
        print(f"✅ {key} = {value}")
    
    print("\n✅ MS SQL Server environment configured!")
    print("\nTo connect, you'll need to:")
    print("1. Set up SSH tunnel: ssh -L 1433:localhost:1433 username@your-ip")
    print("2. Run: source setup_mssql_env.py")
    print("3. Test connection: python test_mssql_connection.py")
    
    return True

if __name__ == "__main__":
    setup_mssql_environment()