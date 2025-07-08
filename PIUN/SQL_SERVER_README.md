# SQL Server Configuration for PIUN Project

## Overview
This document provides configuration steps to deploy the PIUN project with SQL Server database instead of SQLite.

## Prerequisites
1. SQL Server database with the table `[piuprod3].[dbo].[PIU_Financial_mgt_kpi_for_contract]`
2. django-mssql-backend package installed
3. ODBC Driver 17 for SQL Server
4. Python 3.8+ with pip

## Installation Steps

### 1. Install Required Packages
```bash
# In your virtual environment
pip install django-mssql-backend
pip install pyodbc

# Add to requirements.txt
echo "django-mssql-backend" >> requirements.txt
echo "pyodbc" >> requirements.txt
```

### 2. Install ODBC Driver (Windows)
Download and install "ODBC Driver 17 for SQL Server" from Microsoft:
https://docs.microsoft.com/en-us/sql/connect/odbc/download-odbc-driver-for-sql-server

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
4. File encoding issues (null bytes in Python files)

### Resolution Steps:
1. **Test Database Connection**: Visit `/project_actions/test-sql-connection/` to verify connectivity
2. **Check File Encoding**: Ensure no null bytes in Python files, especially `views.py` and `utils.py`
3. **Verify Table Structure**: Confirm table exists: `[piuprod3].[dbo].[PIU_Financial_mgt_kpi_for_contract]`
4. **Test AJAX Endpoints**: Run `python test_sql_server_ajax.py` to verify cascading dropdown functionality
5. **Validate Data**: Check data exists for your project and monitoring type combinations
6. **Column Mapping**: Ensure column names match exactly (case-sensitive)

### SQL Server Column Requirements:
The system expects these columns in `[piuprod3].[dbo].[PIU_Financial_mgt_kpi_for_contract]`:
- `project_id` - Project identifier (e.g., 'D309D6530GM')
- `monitoring_type_id` - Monitoring type code (e.g., 'proc', 'Tec', 'ESS')
- `type_of_investment` - Investment description
- `Kpi_description` - KPI description text
- `id` - Primary key for records

### Common Issues and Fixes:

#### 1. File Encoding Issues (SyntaxError: source code string cannot contain null bytes)
```python
# Check for null bytes in files
with open('project_actions/views.py', 'rb') as f:
    content = f.read()
    if b'\x00' in content:
        # Clean the file
        cleaned = content.replace(b'\x00', b'')
        with open('project_actions/views.py', 'wb') as clean_f:
            clean_f.write(cleaned)
```

#### 2. Import Errors
Ensure all required apps are in INSTALLED_APPS:
```python
INSTALLED_APPS = [
    # ... existing apps ...
    'project_actions',
    'PIU_Financial_mgt',
    'setup',
]
```

#### 3. Testing SQL Server Functionality
Use the provided test script to verify AJAX endpoints:
```bash
python test_sql_server_ajax.py
```

Expected output for working system:
- Type of Investments endpoint: Status 200 with options
- KPI Descriptions endpoint: Status 200 with options  
- Database verification: Shows available projects and monitoring types

#### 4. SQL Server Parameter Binding
Ensure your SQL Server queries use `?` parameters instead of `%s`:
```sql
-- Correct for SQL Server
WHERE project_id = ? AND monitoring_type_id = ?

-- Incorrect (PostgreSQL/MySQL style)
WHERE project_id = %s AND monitoring_type_id = %s
```

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