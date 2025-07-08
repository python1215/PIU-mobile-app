"""
SQL Server specific views for contract monitoring
These views handle database operations with raw SQL for better SQL Server compatibility
"""
from django.db import connection
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
import logging

logger = logging.getLogger(__name__)

@login_required
def load_type_of_investments_sql(request):
    """Load Type of Investment options using raw SQL for SQL Server compatibility"""
    monitoring_type_id = request.GET.get('monitoring_type_id')
    project_id = request.GET.get('project_id')
    
    if not monitoring_type_id or not project_id:
        return JsonResponse({'options': []})
    
    try:
        with connection.cursor() as cursor:
            # Raw SQL query for SQL Server
            query = """
                SELECT DISTINCT 
                    monitoring_Type_Code as value,
                    type_of_investment as text
                FROM [piuprod3].[dbo].[PIU_Financial_mgt_kpi_for_contract]
                WHERE project_id = %s AND monitoring_type_id = %s
                ORDER BY type_of_investment
            """
            cursor.execute(query, [project_id, monitoring_type_id])
            results = cursor.fetchall()
            
            options = []
            for row in results:
                options.append({
                    'value': row[0],
                    'text': row[1]
                })
            
            return JsonResponse({'options': options})
            
    except Exception as e:
        logger.error(f"SQL Server error loading investment types: {e}")
        return JsonResponse({'options': [], 'error': str(e)})

@login_required 
def load_kpi_descriptions_sql(request):
    """Load KPI Description options using raw SQL for SQL Server compatibility"""
    investment_code = request.GET.get('investment_code')
    project_id = request.GET.get('project_id')
    
    if not investment_code or not project_id:
        return JsonResponse({'options': []})
    
    try:
        with connection.cursor() as cursor:
            # Raw SQL query for SQL Server
            query = """
                SELECT DISTINCT 
                    id as value,
                    Kpi_description as text
                FROM [piuprod3].[dbo].[PIU_Financial_mgt_kpi_for_contract]
                WHERE monitoring_Type_Code = %s AND project_id = %s
                ORDER BY Kpi_description
            """
            cursor.execute(query, [investment_code, project_id])
            results = cursor.fetchall()
            
            options = []
            for row in results:
                options.append({
                    'value': row[0],
                    'text': row[1]
                })
            
            return JsonResponse({'options': options})
            
    except Exception as e:
        logger.error(f"SQL Server error loading KPI descriptions: {e}")
        return JsonResponse({'options': [], 'error': str(e)})

def test_sql_server_connection(request):
    """Test SQL Server connection and KPI data availability"""
    try:
        with connection.cursor() as cursor:
            # Test query to check KPI table
            cursor.execute("""
                SELECT TOP 10 
                    project_id,
                    monitoring_type_id,
                    type_of_investment,
                    Kpi_description
                FROM [piuprod3].[dbo].[PIU_Financial_mgt_kpi_for_contract]
            """)
            results = cursor.fetchall()
            
            return JsonResponse({
                'status': 'success',
                'connection': 'SQL Server connected',
                'sample_data': len(results),
                'data': results[:5] if results else []
            })
            
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'connection': 'SQL Server connection failed',
            'error': str(e)
        })

def get_sql_server_statistics(request):
    """Get statistics from SQL Server database"""
    try:
        with connection.cursor() as cursor:
            # Count total KPI records
            cursor.execute("""
                SELECT COUNT(*) FROM [piuprod3].[dbo].[PIU_Financial_mgt_kpi_for_contract]
            """)
            total_kpis = cursor.fetchone()[0]
            
            # Count unique projects
            cursor.execute("""
                SELECT COUNT(DISTINCT project_id) FROM [piuprod3].[dbo].[PIU_Financial_mgt_kpi_for_contract]
            """)
            unique_projects = cursor.fetchone()[0]
            
            # Count unique monitoring types
            cursor.execute("""
                SELECT COUNT(DISTINCT monitoring_type_id) FROM [piuprod3].[dbo].[PIU_Financial_mgt_kpi_for_contract]
            """)
            unique_monitoring_types = cursor.fetchone()[0]
            
            return JsonResponse({
                'total_kpis': total_kpis,
                'unique_projects': unique_projects,
                'unique_monitoring_types': unique_monitoring_types
            })
            
    except Exception as e:
        return JsonResponse({
            'error': str(e),
            'total_kpis': 0,
            'unique_projects': 0,
            'unique_monitoring_types': 0
        })