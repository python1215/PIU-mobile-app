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
    # Check the actual database backend being used
    from django.db import connection
    
    # Check if we're actually connected to SQL Server
    if connection.vendor == 'microsoft':
        return True
    
    # Check environment variable and settings for forced SQL Server mode
    import os
    env_sql_server = os.environ.get('USE_SQL_SERVER', 'false').lower() == 'true'
    settings_sql_server = getattr(settings, 'USE_SQL_SERVER', False)
    
    # For development: allow forced SQL Server mode even with SQLite if explicitly set
    if env_sql_server or settings_sql_server:
        # Check if we have mssql engine configured but currently using SQLite
        engine = connection.settings_dict.get('ENGINE', '')
        if 'mssql' in engine or 'microsoft' in engine:
            return True
    
    # Default to False for SQLite development
    return False

def get_database_mode():
    """Get current database mode"""
    return getattr(settings, 'DATABASE_MODE', 'sql_server')

def get_sql_server_table_name(base_table_name):
    """Get SQL Server table name with proper schema"""
    if is_sql_server_mode():
        # Use piuprod3 schema for SQL Server
        return f"[piuprod3].[dbo].{base_table_name}"
    return base_table_name

def execute_database_query(query, params=None, fetch_all=True):
    """Execute database query with proper mode handling"""
    try:
        with connection.cursor() as cursor:
            if is_sql_server_mode():
                # Use parameterized queries for SQL Server - convert %s to ? for mssql
                if params and '%s' in query:
                    query = query.replace('%s', '?')
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
            query = f"SELECT * FROM {table_name} WHERE {filter_field} = ? ORDER BY {model_class._meta.pk.name}"
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

def get_document_management_data(table_name, document_id=None):
    """Get document management data with dual-mode support"""
    if is_sql_server_mode():
        # Use raw SQL for SQL Server
        sql_table_name = get_sql_server_table_name(table_name)
        
        if document_id:
            query = f"SELECT * FROM {sql_table_name} WHERE document_id = ?"
            return execute_database_query(query, [document_id], fetch_all=False)
        else:
            query = f"SELECT * FROM {sql_table_name} ORDER BY created_date DESC"
            return execute_database_query(query)
    else:
        # For SQLite, return None to use Django ORM
        return None

def insert_document_data(table_name, data_dict):
    """Insert document data with dual-mode support"""
    if is_sql_server_mode():
        # Use raw SQL for SQL Server
        sql_table_name = get_sql_server_table_name(table_name)
        
        # Build insert query
        columns = ', '.join(data_dict.keys())
        placeholders = ', '.join(['?' for _ in data_dict.keys()])
        values = list(data_dict.values())
        
        query = f"INSERT INTO {sql_table_name} ({columns}) VALUES ({placeholders})"
        return execute_database_query(query, values, fetch_all=False)
    else:
        # For SQLite, return None to use Django ORM
        return None

def update_document_data(table_name, document_id, data_dict):
    """Update document data with dual-mode support"""
    if is_sql_server_mode():
        # Use raw SQL for SQL Server
        sql_table_name = get_sql_server_table_name(table_name)
        
        # Build update query
        set_clauses = ', '.join([f"{key} = ?" for key in data_dict.keys()])
        values = list(data_dict.values()) + [document_id]
        
        query = f"UPDATE {sql_table_name} SET {set_clauses} WHERE document_id = ?"
        return execute_database_query(query, values, fetch_all=False)
    else:
        # For SQLite, return None to use Django ORM
        return None

def delete_document_data(table_name, document_id):
    """Delete document data with dual-mode support"""
    if is_sql_server_mode():
        # Use raw SQL for SQL Server
        sql_table_name = get_sql_server_table_name(table_name)
        
        query = f"DELETE FROM {sql_table_name} WHERE document_id = ?"
        return execute_database_query(query, [document_id], fetch_all=False)
    else:
        # For SQLite, return None to use Django ORM
        return None

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

def safe_model_delete(model_class, pk):
    """Delete model instance with proper mode handling"""
    if is_sql_server_mode():
        # Handle SQL Server deletion with raw SQL
        table_name = get_sql_server_table_name(model_class._meta.db_table)
        
        query = f"DELETE FROM {table_name} WHERE {model_class._meta.pk.name} = %s"
        
        try:
            execute_database_query(query, [pk], fetch_all=False)
            return True
        except Exception as e:
            logger.error(f"SQL Server delete error: {e}")
            return False
    else:
        # Use Django ORM for SQLite
        try:
            model_class.objects.filter(pk=pk).delete()
            return True
        except Exception as e:
            logger.error(f"SQLite delete error: {e}")
            return False

def get_model_count(model_class, filters=None):
    """Get model count with proper mode handling"""
    if is_sql_server_mode():
        # Handle SQL Server count with raw SQL
        table_name = get_sql_server_table_name(model_class._meta.db_table)
        
        if filters:
            where_clauses = []
            values = []
            for field, value in filters.items():
                where_clauses.append(f"{field} = %s")
                values.append(value)
            
            query = f"SELECT COUNT(*) FROM {table_name} WHERE {' AND '.join(where_clauses)}"
            result = execute_database_query(query, values, fetch_all=False)
        else:
            query = f"SELECT COUNT(*) FROM {table_name}"
            result = execute_database_query(query, fetch_all=False)
        
        return result[0] if result else 0
    else:
        # Use Django ORM for SQLite
        if filters:
            return model_class.objects.filter(**filters).count()
        else:
            return model_class.objects.count()

def get_paginated_data(model_class, page=1, page_size=10, filters=None, order_by=None):
    """Get paginated data with proper mode handling"""
    if is_sql_server_mode():
        # Handle SQL Server pagination with raw SQL
        table_name = get_sql_server_table_name(model_class._meta.db_table)
        
        # Build WHERE clause
        where_clause = ""
        values = []
        if filters:
            where_clauses = []
            for field, value in filters.items():
                where_clauses.append(f"{field} = %s")
                values.append(value)
            where_clause = f"WHERE {' AND '.join(where_clauses)}"
        
        # Build ORDER BY clause
        order_clause = ""
        if order_by:
            order_clause = f"ORDER BY {order_by}"
        elif hasattr(model_class._meta, 'ordering') and model_class._meta.ordering:
            order_clause = f"ORDER BY {', '.join(model_class._meta.ordering)}"
        else:
            order_clause = f"ORDER BY {model_class._meta.pk.name}"
        
        # Calculate offset
        offset = (page - 1) * page_size
        
        # Get total count
        count_query = f"SELECT COUNT(*) FROM {table_name} {where_clause}"
        total_count = execute_database_query(count_query, values, fetch_all=False)[0]
        
        # Get paginated data
        query = f"""
            SELECT * FROM {table_name}
            {where_clause}
            {order_clause}
            OFFSET {offset} ROWS
            FETCH NEXT {page_size} ROWS ONLY
        """
        
        data = execute_database_query(query, values)
        
        return {
            'data': data,
            'total_count': total_count,
            'page': page,
            'page_size': page_size,
            'total_pages': (total_count + page_size - 1) // page_size
        }
    else:
        # Use Django ORM for SQLite
        queryset = model_class.objects.all()
        
        if filters:
            queryset = queryset.filter(**filters)
        
        if order_by:
            queryset = queryset.order_by(order_by)
        
        from django.core.paginator import Paginator
        paginator = Paginator(queryset, page_size)
        page_obj = paginator.get_page(page)
        
        return {
            'data': page_obj.object_list,
            'total_count': paginator.count,
            'page': page,
            'page_size': page_size,
            'total_pages': paginator.num_pages,
            'page_obj': page_obj
        }

def execute_raw_sql(query, params=None):
    """Execute raw SQL query with proper parameter handling"""
    if is_sql_server_mode():
        # SQL Server specific parameter handling
        query = query.replace('?', '%s')
    
    return execute_database_query(query, params)