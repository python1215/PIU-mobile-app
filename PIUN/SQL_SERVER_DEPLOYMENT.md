# SQL Server Deployment Guide

## Overview

The PIU M&E System supports dual-mode deployment:
- **Development**: SQLite with Django ORM (full functionality)
- **Production**: SQL Server with raw queries (offline LAN deployment)

## Prerequisites

### SQL Server Requirements
- Microsoft SQL Server (Express/Standard/Enterprise)
- ODBC Driver 17 for SQL Server
- Network connectivity to SQL Server instance

### Python Requirements
```bash
pip install pyodbc django-mssql-backend
```

## Deployment Steps

### 1. Configure Environment

**For SQLite Development:**
```bash
python deploy_sql_server.py sqlite
```

**For SQL Server Production:**
```bash
python deploy_sql_server.py sqlserver
```

### 2. SQL Server Database Setup

1. **Create Database:**
   ```sql
   CREATE DATABASE piuprod3;
   ```

2. **Configure Authentication:**
   ```sql
   -- Enable SQL Server Authentication
   ALTER LOGIN sa ENABLE;
   ALTER LOGIN sa WITH PASSWORD = 'YourStrongPassword';
   ```

3. **Create Schema:**
   ```sql
   USE piuprod3;
   -- Run the comprehensive database script
   -- (Contains 90 tables with 11,468 records)
   ```

### 3. Environment Variables

Create `.env` file with:
```env
USE_SQL_SERVER=true
SQL_SERVER_DB=piuprod3
SQL_SERVER_USER=sa
SQL_SERVER_PASSWORD=YourStrongPassword
SQL_SERVER_HOST=localhost
SQL_SERVER_PORT=1433
DATABASE_MODE=sql_server
```

### 4. Run Migrations

```bash
python manage.py migrate
```

### 5. Start Application

```bash
python manage.py runserver 0.0.0.0:8000
```

## Functionality Comparison

| Feature | SQLite Mode | SQL Server Mode |
|---------|-------------|----------------|
| Data Fetching | ✅ Django ORM | ✅ Raw SQL |
| Data Insertion | ✅ Django ORM | ✅ Raw SQL |
| Data Updates | ✅ Django ORM | ✅ Raw SQL |
| Cascading Dropdowns | ✅ AJAX | ✅ AJAX |
| Form Validation | ✅ Full | ✅ Full |
| File Uploads | ✅ Full | ✅ Full |
| Reporting | ✅ Full | ✅ Full |
| Admin Interface | ✅ Full | ⚠️ Limited |

## Database Schema

### Core Tables
- `setup_*` - Administrative data (regions, districts, settlements)
- `PIU_Financial_mgt_*` - Financial management data
- `social_and_env_*` - Social & environmental monitoring
- `monitoring_*` - Performance monitoring data
- `Issues_Actions_monitoring_*` - Issue tracking

### Table Structure
```sql
-- Example: OHS Monitoring
CREATE TABLE social_and_env_ohs_monitoring (
    ohs_Id int IDENTITY(1,1) PRIMARY KEY,
    project_id nvarchar(50),
    Type_of_Investment_id int,
    year_of_report_id nvarchar(4),
    quarter_id int,
    date date,
    region_id nvarchar(5),
    district_id nvarchar(5),
    settlement_id nvarchar(6),
    male int,
    female int,
    youth_male int,
    youth_female int,
    quality_at_entry_requirement nvarchar(max),
    working_environment nvarchar(max),
    Kpi_description_id int,
    picture nvarchar(100),
    remarks nvarchar(max),
    loginUser_id int
);
```

## Network Configuration

### LAN Deployment
1. **Configure SQL Server for network access:**
   ```sql
   -- Enable TCP/IP protocol
   -- Configure firewall rules for port 1433
   -- Set SQL Server to listen on all IP addresses
   ```

2. **Update connection string:**
   ```env
   SQL_SERVER_HOST=192.168.1.100  # Your SQL Server IP
   SQL_SERVER_PORT=1433
   ```

## Troubleshooting

### Common Issues

1. **Connection Timeout:**
   ```python
   # Add to settings.py
   DATABASES['default']['OPTIONS']['timeout'] = 60
   ```

2. **Unicode Issues:**
   ```python
   # Add to settings.py
   DATABASES['default']['OPTIONS']['charset'] = 'utf8'
   ```

3. **Transaction Issues:**
   ```python
   # Use explicit transactions
   from django.db import transaction
   
   with transaction.atomic():
       # Your database operations
   ```

## Performance Optimization

### SQL Server Optimization
1. **Indexing:**
   ```sql
   -- Create indexes on frequently queried columns
   CREATE INDEX IX_ohs_project_id ON social_and_env_ohs_monitoring(project_id);
   CREATE INDEX IX_ohs_date ON social_and_env_ohs_monitoring(date);
   ```

2. **Query Optimization:**
   ```sql
   -- Use appropriate WHERE clauses
   -- Limit result sets with TOP clause
   -- Use ISNULL for null value handling
   ```

3. **Connection Pooling:**
   ```python
   # Configure connection pooling
   DATABASES['default']['CONN_MAX_AGE'] = 600
   ```

## Security Considerations

### SQL Server Security
1. **Use strong passwords**
2. **Enable SSL/TLS encryption**
3. **Configure firewall rules**
4. **Use Windows Authentication when possible**
5. **Regular security updates**

### Application Security
1. **Parameterized queries (prevents SQL injection)**
2. **Input validation**
3. **CSRF protection**
4. **Session security**

## Monitoring & Maintenance

### Health Checks
```python
# Check SQL Server connection
from django.db import connection

def check_sql_server_health():
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            return True
    except Exception as e:
        return False
```

### Backup Strategy
```sql
-- Regular database backups
BACKUP DATABASE piuprod3 TO DISK = 'C:\Backups\piuprod3.bak'
```

## Support & Contact

For deployment assistance or technical support:
- Review application logs
- Check SQL Server error logs
- Verify network connectivity
- Validate database schema

## Version History

- **v1.0** - Initial SQLite implementation
- **v1.1** - Added SQL Server support
- **v1.2** - Enhanced dual-mode functionality
- **v1.3** - Production deployment optimizations