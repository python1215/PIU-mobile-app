# SQL Server Configuration for PIUN Project

## Overview
This document provides configuration steps to deploy the PIUN project with SQL Server database instead of SQLite.

## Prerequisites
1. SQL Server database with the table `[piuprod3].[dbo].[PIU_Financial_mgt_kpi_for_contract]`
2. django-mssql-backend package installed
3. ODBC Driver 17 for SQL Server

## Installation Steps

### 1. Install Required Packages
```bash
pip install django-mssql-backend
pip install pyodbc
```

### 2. Update Django Settings
Update your `settings.py` file:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django_mssql_backend',
        'NAME': 'your_database_name',
        'USER': 'your_username',
        'PASSWORD': 'your_password',
        'HOST': 'your_server_name',
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
```

### 3. Expected SQL Server Table Structure

The KPI table should have the following structure:
```sql
CREATE TABLE [piuprod3].[dbo].[PIU_Financial_mgt_kpi_for_contract] (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    project_id NVARCHAR(15) NOT NULL,
    type_of_investment NTEXT,
    Kpi_description NTEXT,
    monitoring_Type_Code NVARCHAR(15) NOT NULL,
    monitoring_type_id NVARCHAR(10) NOT NULL,
    date DATETIME2 DEFAULT GETDATE(),
    loginUser_id INT NOT NULL
);
```

### 4. Sample Data
Ensure your SQL Server table has data with the following format:
- `project_id`: Project identifier (e.g., 'D309D6530GM', 'ECOREAPP164044')
- `monitoring_type_id`: Monitoring type code (e.g., 'Tech', 'ESS', 'proc')
- `type_of_investment`: Description of investment type
- `Kpi_description`: KPI description text
- `monitoring_Type_Code`: Unique monitoring code

### 5. Test Connection
Use the built-in test endpoint to verify connection:
```
GET /project_actions/test-sql-connection/
```

## Features

### Auto-Detection
The system automatically detects if you're using SQL Server and switches to raw SQL queries for better compatibility.

### Cascading Dropdowns
The contract monitoring form will work with SQL Server data:
1. Project selection loads from Project table
2. Monitoring type selection triggers Type of Investment loading
3. Investment type selection triggers KPI Description loading

### Error Handling
- Connection errors are logged and returned as JSON responses
- Fallback to empty options if queries fail
- Detailed error messages for debugging

## Troubleshooting

### "No investment available" Error
This typically means:
1. No data in the KPI table for the selected project/monitoring type combination
2. Database connection issues
3. Table name or column name mismatches

### Resolution Steps:
1. Check database connection
2. Verify table exists: `[piuprod3].[dbo].[PIU_Financial_mgt_kpi_for_contract]`
3. Verify data exists for your project and monitoring type combinations
4. Check column names match exactly

### SQL Server Specific Queries
The system uses these optimized queries for SQL Server:

**Type of Investment:**
```sql
SELECT DISTINCT 
    monitoring_Type_Code as value,
    type_of_investment as text
FROM [piuprod3].[dbo].[PIU_Financial_mgt_kpi_for_contract]
WHERE project_id = ? AND monitoring_type_id = ?
ORDER BY type_of_investment
```

**KPI Descriptions:**
```sql
SELECT DISTINCT 
    id as value,
    Kpi_description as text
FROM [piuprod3].[dbo].[PIU_Financial_mgt_kpi_for_contract]
WHERE monitoring_Type_Code = ? AND project_id = ?
ORDER BY Kpi_description
```

## Migration from SQLite
If migrating from SQLite:
1. Export data from SQLite
2. Transform data to match SQL Server table structure
3. Import to SQL Server
4. Update Django settings
5. Test all functionality

## Performance Optimization
- Added DISTINCT clauses to prevent duplicates
- Added ORDER BY clauses for consistent sorting
- Used parameterized queries to prevent SQL injection
- Optimized indexes on commonly queried columns