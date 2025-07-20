# Django ORM with MS SQL Server - Complete Guide

## Overview

Yes, **Django ORM works very well with MS SQL Server**! The PIU M&E system is already configured for dual-mode support, allowing seamless switching between SQLite (development) and SQL Server (production).

## Current System Configuration

### ✅ Already Installed Packages
- **Django**: 5.2.1
- **django-mssql-backend**: 2.8.1 (SQL Server adapter)
- **pyodbc**: 5.2.0 (ODBC driver interface)

### ✅ Built-in Features
- Dual-mode database support (SQLite/SQL Server)
- Automatic database mode detection
- Parameter binding conversion (? vs %s)
- Schema-aware table naming ([piuprod3].[dbo].table_name)

## SQL Server Configuration

### 1. Settings Configuration
```python
# piu_project/settings.py
DATABASES = {
    'default': {
        'ENGINE': 'mssql',
        'NAME': 'piuprod3',
        'HOST': 'localhost',  # or IP address
        'PORT': '1433',
        'USER': 'sa',
        'PASSWORD': 'YourPassword123!',
        'OPTIONS': {
            'driver': 'ODBC Driver 17 for SQL Server',
            'extra_params': 'TrustServerCertificate=yes;',
            'collation': 'SQL_Latin1_General_CP1_CI_AS',
            'connection_timeout': 60,
            'query_timeout': 60,
            'autocommit': True,
        },
    }
}

USE_SQL_SERVER = True
DATABASE_MODE = 'sql_server'
```

### 2. Environment Variables
```bash
# .env file
USE_SQL_SERVER=true
SQL_SERVER_HOST=localhost
SQL_SERVER_PORT=1433
SQL_SERVER_DB=piuprod3
SQL_SERVER_USER=sa
SQL_SERVER_PASSWORD=YourPassword123!
```

## Django ORM Advantages with SQL Server

### ✅ Automatic SQL Generation
```python
# Same Python code works with both SQLite and SQL Server
projects = Project.objects.filter(status='Active')
activities = Activities.objects.select_related('project').order_by('-date')

# Django automatically generates optimized SQL for SQL Server
```

### ✅ Full ORM Feature Support
- **Relationships**: ForeignKey, ManyToMany, OneToOne
- **Queries**: filter(), exclude(), order_by(), distinct()
- **Aggregations**: Count(), Sum(), Avg(), Max(), Min()
- **Joins**: select_related(), prefetch_related()
- **Complex Filtering**: Q objects with AND/OR logic
- **Transactions**: atomic() decorator
- **Migrations**: Automatic schema management

### ✅ Performance Features
- Connection pooling
- Query optimization
- Lazy evaluation
- Query caching
- Index usage optimization

## Current Dual-Mode Implementation

The system automatically detects database mode:

```python
from utils.database_utils import is_sql_server_mode

if is_sql_server_mode():
    # Use SQL Server optimized queries
    query = "SELECT * FROM [piuprod3].[dbo].PIU_Financial_mgt_project"
else:
    # Use Django ORM for SQLite
    projects = Project.objects.all()
```

## Migration from SQLite to SQL Server

### Step 1: Install SQL Server
- SQL Server Express (free)
- SQL Server Standard/Enterprise (licensed)
- SQL Server on Linux/Docker

### Step 2: Create Database
```sql
CREATE DATABASE piuprod3;
USE piuprod3;
-- Database is ready for Django
```

### Step 3: Update Configuration
```bash
# Update settings.py with SQL Server configuration
# Set USE_SQL_SERVER = True
```

### Step 4: Run Migrations
```bash
python manage.py migrate
```

### Step 5: Data Migration
```bash
# Export from SQLite
python manage.py dumpdata > data_backup.json

# Import to SQL Server  
python manage.py loaddata data_backup.json
```

## Example ORM Operations

### Basic CRUD Operations
```python
# CREATE - Works identically on both databases
project = Project.objects.create(
    project_name="New Project",
    status="Active",
    funding_amount=1000000
)

# READ - Automatic SQL optimization
projects = Project.objects.select_related('currency', 'donor').filter(
    funding_amount__gte=500000
).order_by('-date')

# UPDATE - Bulk operations supported
Project.objects.filter(status='Pending').update(status='Active')

# DELETE - Cascade handling
project.delete()  # Automatically handles related records
```

### Advanced Queries
```python
from django.db.models import Q, Count, Sum

# Complex filtering with Q objects
complex_query = Project.objects.filter(
    Q(status='Active') & (Q(funding_amount__gte=1000000) | Q(donor__name='WorldBank'))
)

# Aggregations
stats = Project.objects.aggregate(
    total_funding=Sum('funding_amount'),
    project_count=Count('projectID'),
    avg_funding=Avg('funding_amount')
)

# Annotations with calculated fields
projects_with_activity_count = Project.objects.annotate(
    activity_count=Count('activities')
).filter(activity_count__gt=5)
```

## Performance Optimization

### Connection Pooling
```python
DATABASES['default']['CONN_MAX_AGE'] = 600  # 10 minutes
DATABASES['default']['OPTIONS']['conn_health_checks'] = True
```

### Query Optimization
```python
# Use select_related for foreign keys
activities = Activities.objects.select_related('project', 'component')

# Use prefetch_related for reverse foreign keys
projects = Project.objects.prefetch_related('activities', 'components')

# Use only() to fetch specific fields
projects = Project.objects.only('project_name', 'status', 'funding_amount')
```

### Indexing
```python
# Model-level index definitions
class Project(models.Model):
    project_name = models.CharField(max_length=200, db_index=True)
    status = models.CharField(max_length=50, db_index=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['status', 'date']),
            models.Index(fields=['funding_amount', 'currency']),
        ]
```

## Troubleshooting Common Issues

### Connection Issues
```python
# Add connection timeout settings
DATABASES['default']['OPTIONS'].update({
    'connection_timeout': 60,
    'query_timeout': 60,
    'login_timeout': 60,
})
```

### Unicode/Character Encoding
```python
DATABASES['default']['OPTIONS']['charset'] = 'utf8'
DATABASES['default']['OPTIONS']['collation'] = 'SQL_Latin1_General_CP1_CI_AS'
```

### Transaction Issues
```python
from django.db import transaction

@transaction.atomic
def create_project_with_activities(project_data, activities_data):
    project = Project.objects.create(**project_data)
    for activity_data in activities_data:
        Activities.objects.create(project=project, **activity_data)
    return project
```

## Deployment Requirements

### Software Requirements
1. **SQL Server**: Express/Standard/Enterprise
2. **ODBC Driver**: ODBC Driver 17 for SQL Server
3. **Python Packages**: Already installed
   - django-mssql-backend==2.8.1
   - pyodbc==5.2.0

### Network Configuration
- Port 1433 open for SQL Server
- TCP/IP protocol enabled
- SQL Server Authentication enabled
- Firewall rules configured

### Security Configuration
- Strong password policy
- Limited user permissions
- Connection encryption (TrustServerCertificate=yes)
- Regular security updates

## Testing SQL Server Setup

```bash
# Test connection
python manage.py dbshell

# Run migrations
python manage.py migrate

# Test queries
python manage.py shell
>>> from PIU_Financial_mgt.models import Project
>>> Project.objects.count()

# Run development server
python manage.py runserver 0.0.0.0:8000
```

## Conclusion

✅ **Django ORM works excellently with MS SQL Server**
✅ **No code changes needed** for basic operations
✅ **Full ORM feature support** with automatic optimization
✅ **Easy migration path** from SQLite to SQL Server
✅ **Production-ready** with proper configuration

The PIU M&E system is already prepared for SQL Server deployment with dual-mode support, making the transition seamless and maintenance-friendly.