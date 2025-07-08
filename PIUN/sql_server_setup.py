"""
SQL Server Database Setup for PIUN Project
This script configures the project for SQL Server database connection
"""

# SQL Server specific model configurations
SQL_SERVER_MODEL_CONFIGS = {
    'KPI_For_Contract': {
        'table_name': '[piuprod3].[dbo].[PIU_Financial_mgt_kpi_for_contract]',
        'fields': {
            'id': 'AutoField',
            'project_id': 'CharField',  # For SQL Server compatibility
            'type_of_investment': 'TextField',
            'Kpi_description': 'TextField', 
            'monitoring_Type_Code': 'CharField',
            'monitoring_type_id': 'CharField',  # For SQL Server compatibility
            'date': 'DateTimeField',
            'loginUser_id': 'IntegerField',  # For SQL Server compatibility
        }
    },
    'Project': {
        'table_name': '[piuprod3].[dbo].[PIU_Financial_mgt_project]',
        'fields': {
            'projectID': 'CharField',
            'project': 'CharField',
            'currency_id': 'IntegerField',
            'funding': 'DecimalField',
            'effectiveness_Date': 'DateField',
            'closure_Date': 'DateField',
            'last_date_of_Disbursement': 'DateField',
            'date': 'DateTimeField',
            'loginUser_id': 'IntegerField',
        }
    },
    'Type_of_Monitoring': {
        'table_name': '[piuprod3].[dbo].[setup_type_of_monitoring]',
        'fields': {
            'monitoring_type_code': 'CharField',
            'monitoring_type': 'CharField',
            'date': 'DateTimeField',
            'loginUser_id': 'IntegerField',
        }
    },
    'Physicalprogress': {
        'table_name': '[piuprod3].[dbo].[setup_physicalprogress]',
        'fields': {
            'id': 'AutoField',
            'progress_scale': 'CharField',
            'date': 'DateTimeField',
            'loginUser_id': 'IntegerField',
        }
    }
}

# SQL Server connection settings template
SQL_SERVER_SETTINGS = {
    'ENGINE': 'django_mssql_backend',
    'OPTIONS': {
        'driver': 'ODBC Driver 17 for SQL Server',
        'unicode_results': True,
        'autocommit': True,
        'MARS_Connection': True,
        'extra_params': 'TrustServerCertificate=yes'
    }
}

def get_sql_server_database_config(server, database, username, password):
    """
    Generate SQL Server database configuration
    """
    return {
        'default': {
            'ENGINE': 'django_mssql_backend',
            'NAME': database,
            'USER': username,
            'PASSWORD': password,
            'HOST': server,
            'PORT': '1433',
            'OPTIONS': {
                'driver': 'ODBC Driver 17 for SQL Server',
                'unicode_results': True,
                'autocommit': True,
                'MARS_Connection': True,
                'extra_params': 'TrustServerCertificate=yes'
            }
        }
    }

# Raw SQL queries for data retrieval from SQL Server
SQL_SERVER_QUERIES = {
    'get_kpi_by_project_and_monitoring': """
        SELECT 
            id,
            project_id,
            type_of_investment,
            Kpi_description,
            monitoring_Type_Code,
            monitoring_type_id
        FROM [piuprod3].[dbo].[PIU_Financial_mgt_kpi_for_contract]
        WHERE project_id = %s AND monitoring_type_id = %s
    """,
    
    'get_investment_types': """
        SELECT DISTINCT 
            monitoring_Type_Code as value,
            type_of_investment as text
        FROM [piuprod3].[dbo].[PIU_Financial_mgt_kpi_for_contract]
        WHERE project_id = %s AND monitoring_type_id = %s
    """,
    
    'get_kpi_descriptions': """
        SELECT DISTINCT 
            id as value,
            Kpi_description as text
        FROM [piuprod3].[dbo].[PIU_Financial_mgt_kpi_for_contract]
        WHERE monitoring_Type_Code = %s AND project_id = %s
    """
}