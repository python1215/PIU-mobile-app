"""
Database utilities for dual-mode support (SQLite/SQL Server)
Provides seamless switching between development and production databases
"""

from django.conf import settings
from django.db import connection
import logging

logger = logging.getLogger(__name__)

def is_sql_server_mode():
    """Check if system is running in SQL Server mode"""
    return getattr(settings, 'USE_SQL_SERVER', False)

def get_database_mode():
    """Get current database mode"""
    return getattr(settings, 'DATABASE_MODE', 'sqlite')

def get_sql_server_table_name(base_table_name):
    """Get SQL Server table name with proper schema"""
    if is_sql_server_mode():
        # Try different schema variations for SQL Server
        schemas = ['[piuprod].[dbo]', '[piuprod3].[dbo]', 'dbo']
        return f"{schemas[0]}.{base_table_name}"
    return base_table_name

def execute_database_query(query, params=None, fetch_all=True):
    """Execute database query with proper mode handling"""
    try:
        with connection.cursor() as cursor:
            if is_sql_server_mode():
                # Use parameterized queries for SQL Server
                cursor.execute(query, params or [])
            else:
                # Use Django ORM style for SQLite
                cursor.execute(query, params or [])
            
            if fetch_all:
                return cursor.fetchall()
            else:
                return cursor.fetchone()
    except Exception as e:
        logger.error(f"Database query error: {e}")
        return []

def get_cascading_dropdown_data(model_class, filter_field=None, filter_value=None):
    """Get cascading dropdown data with dual-mode support"""
    if is_sql_server_mode():
        # Use raw SQL for SQL Server
        table_name = get_sql_server_table_name(model_class._meta.db_table)
        
        if filter_field and filter_value:
            query = f"SELECT * FROM {table_name} WHERE {filter_field} = %s ORDER BY {model_class._meta.pk.name}"
            return execute_database_query(query, [filter_value])
        else:
            query = f"SELECT * FROM {table_name} ORDER BY {model_class._meta.pk.name}"
            return execute_database_query(query)
    else:
        # Use Django ORM for SQLite
        if filter_field and filter_value:
            filter_kwargs = {filter_field: filter_value}
            return model_class.objects.filter(**filter_kwargs).values()
        else:
            return model_class.objects.all().values()

def safe_model_save(model_instance, using_raw_sql=False):
    """Save model instance with proper mode handling"""
    if is_sql_server_mode() and using_raw_sql:
        # Handle SQL Server insertion with raw SQL
        table_name = get_sql_server_table_name(model_instance._meta.db_table)
        
        # Get field values
        fields = []
        values = []
        placeholders = []
        
        for field in model_instance._meta.fields:
            if field.name != 'id':  # Skip auto-increment fields
                fields.append(field.column)
                values.append(getattr(model_instance, field.name))
                placeholders.append('%s')
        
        query = f"""
            INSERT INTO {table_name} ({', '.join(fields)})
            VALUES ({', '.join(placeholders)})
        """
        
        try:
            execute_database_query(query, values, fetch_all=False)
            return True
        except Exception as e:
            logger.error(f"SQL Server save error: {e}")
            return False
    else:
        # Use Django ORM for SQLite
        try:
            model_instance.save()
            return True
        except Exception as e:
            logger.error(f"SQLite save error: {e}")
            return False

def safe_model_update(model_class, pk, update_fields):
    """Update model with proper mode handling"""
    if is_sql_server_mode():
        # Handle SQL Server update with raw SQL
        table_name = get_sql_server_table_name(model_class._meta.db_table)
        
        set_clauses = []
        values = []
        
        for field_name, value in update_fields.items():
            set_clauses.append(f"{field_name} = %s")
            values.append(value)
        
        values.append(pk)
        
        query = f"""
            UPDATE {table_name}
            SET {', '.join(set_clauses)}
            WHERE {model_class._meta.pk.name} = %s
        """
        
        try:
            execute_database_query(query, values, fetch_all=False)
            return True
        except Exception as e:
            logger.error(f"SQL Server update error: {e}")
            return False
    else:
        # Use Django ORM for SQLite
        try:
            model_class.objects.filter(pk=pk).update(**update_fields)
            return True
        except Exception as e:
            logger.error(f"SQLite update error: {e}")
            return False

def get_model_data(model_class, pk=None, filters=None):
    """Get model data with proper mode handling"""
    if is_sql_server_mode():
        # Handle SQL Server queries with raw SQL
        table_name = get_sql_server_table_name(model_class._meta.db_table)
        
        if pk:
            query = f"SELECT * FROM {table_name} WHERE {model_class._meta.pk.name} = %s"
            return execute_database_query(query, [pk], fetch_all=False)
        elif filters:
            where_clauses = []
            values = []
            for field, value in filters.items():
                where_clauses.append(f"{field} = %s")
                values.append(value)
            
            query = f"SELECT * FROM {table_name} WHERE {' AND '.join(where_clauses)}"
            return execute_database_query(query, values)
        else:
            query = f"SELECT * FROM {table_name}"
            return execute_database_query(query)
    else:
        # Use Django ORM for SQLite
        if pk:
            try:
                return model_class.objects.get(pk=pk)
            except model_class.DoesNotExist:
                return None
        elif filters:
            return model_class.objects.filter(**filters)
        else:
            return model_class.objects.all()