# PIUN SQL Server Integration Guide

## Overview
This guide provides complete instructions for integrating the PIUN system with SQL Server using the comprehensive database script provided.

## Database Script Analysis
The updated SQL script contains:
- **236 DROP CONSTRAINT statements** - Removes all foreign key constraints
- **90 DROP TABLE statements** - Cleans existing tables
- **90 CREATE TABLE statements** - Creates complete database schema
- **11,468 INSERT statements** - Populates tables with comprehensive data

## Key Database Tables

### Core Project Management
- `PIU_Financial_mgt_project` - Main project information
- `PIU_Financial_mgt_component` - Project components
- `PIU_Financial_mgt_subcomponent` - Subcomponents
- `PIU_Financial_mgt_activities` - Project activities
- `PIU_Financial_mgt_kpi_for_contract` - KPI tracking

### Social & Environmental Monitoring
- `social_and_env_pap` - Project Affected People
- `social_and_env_ohs_monitoring` - Occupational Health & Safety
- `social_and_env_grieviancemonitoringlog` - Grievance Management
- `social_and_env_esia` - Environmental Impact Assessments
- `social_and_env_communityconsult_engagement` - Community Engagement

### Administrative Geography
- `setup_regions` - Regional structure
- `setup_districts` - District information
- `setup_lga` - Local Government Areas
- `setup_ward` - Ward structure

### Configuration Tables
- `setup_year` - Year configurations
- `setup_quarter` - Quarter settings
- `setup_month` - Month settings
- `setup_type_of_monitoring` - Monitoring types
- `setup_physicalprogress` - Progress tracking
- `setup_vulnerabilitycategory` - Vulnerability categories

## System Integration Features

### Dual-Mode Database Support
The PIUN system automatically detects database type:
```python
# SQLite Mode (Default)
USE_SQL_SERVER = False

# SQL Server Mode
USE_SQL_SERVER = True
```

### Raw SQL Query Support
When in SQL Server mode, all views use raw SQL queries:
```python
if 'mssql' in settings.DATABASES['default']['ENGINE'].lower():
    # Use raw SQL queries for SQL Server
    cursor.execute("SELECT * FROM [piuprod].[dbo].[social_and_env_pap]")
else:
    # Use Django ORM for SQLite
    PAP.objects.all()
```

### Progressive Table Name Detection
The system tries multiple table name formats:
1. `[piuprod].[dbo].[table_name]` (Production)
2. `[piuprod3].[dbo].[table_name]` (Test)
3. `[table_name]` (Fallback)

## Module Compatibility

### ✅ OHS Monitoring
- **List View**: Displays all OHS records with pagination
- **Detail View**: Shows complete worker statistics and safety data
- **Edit View**: Allows modifications with proper validation
- **Action Buttons**: View, Edit, and Photo functionality

### ✅ PAP Management
- **List View**: Shows all Project Affected People
- **Detail View**: Individual PAP information and compensation
- **Field Mapping**: Exact column name matching
- **Search/Filter**: Advanced filtering capabilities

### ✅ Grievance Management
- **List View**: Complete grievance tracking
- **Detail View**: Full case information and resolution
- **CRUD Operations**: Create, Read, Update, Delete
- **Status Tracking**: Open, Closed, In Progress

### ✅ Contract Monitoring
- **Cascading Dropdowns**: Project → Type → Investment → KPI
- **Real-time Updates**: AJAX-based form interactions
- **Progress Tracking**: Milestone monitoring
- **Financial Tracking**: Budget and expenditure

### ✅ Project Financial Management
- **Dashboard**: Comprehensive project overview
- **Reports**: Financial and progress reports
- **Activities**: Project activity tracking
- **Components**: Budget allocation management

## Installation Steps

### 1. Activate SQL Server Mode
```bash
cd PIUN
python activate_sql_server.py
```

### 2. Configure Database Connection
Set environment variables:
```bash
export USE_SQL_SERVER=True
export DB_HOST=localhost
export DB_USER=sa
export DB_PASSWORD=your_password
export DB_PORT=1433
```

### 3. Execute Database Script
```bash
# Option 1: Using setup script
python setup_sql_server.py

# Option 2: Manual execution
sqlcmd -S localhost -U sa -P your_password -i database_script.sql
```

### 4. Restart Django Application
```bash
gunicorn --bind 0.0.0.0:5000 --reuse-port --reload main:app
```

## Features Available in SQL Server Mode

### Complete Data Set
With 11,468 INSERT statements, your database includes:
- Complete administrative geography (regions, districts, LGAs)
- Full project portfolio with financial tracking
- Comprehensive social and environmental monitoring data
- Complete setup and configuration tables
- User management and permissions

### Enhanced Performance
- Raw SQL queries optimized for SQL Server
- Indexed table structures for fast retrieval
- Bulk operations for large datasets
- Connection pooling and optimization

### Offline Capability
- No internet connection required
- Complete local database
- All functionality available offline
- Fast response times

## Troubleshooting

### Common Issues
1. **Connection Errors**: Check ODBC driver installation
2. **Permission Errors**: Verify database user permissions
3. **Table Not Found**: Ensure schema prefix is correct
4. **Data Type Errors**: Check field type compatibility

### Debug Mode
Enable debug mode for detailed logging:
```python
DEBUG = True
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'DEBUG',
    },
}
```

## Production Deployment

### Security Considerations
- Use strong database passwords
- Enable SSL/TLS encryption
- Implement proper user permissions
- Regular security updates

### Performance Optimization
- Index optimization for frequently queried tables
- Connection pooling configuration
- Query optimization for large datasets
- Regular maintenance and cleanup

### Backup Strategy
- Regular database backups
- Transaction log backups
- Point-in-time recovery capability
- Disaster recovery planning

## Support

For issues or questions:
1. Check the debug logs for detailed error information
2. Verify database connectivity and permissions
3. Ensure all required tables exist in the database
4. Review the Django settings for proper configuration

The PIUN system is now fully compatible with SQL Server and provides comprehensive project monitoring and evaluation capabilities.