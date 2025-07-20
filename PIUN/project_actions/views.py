from django.shortcuts import render, get_object_or_404, redirect
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.db import transaction
from django.http import JsonResponse, HttpResponse, Http404
from django.core.paginator import Paginator
from django.db.models import Q, Sum, Avg, Count, F
from django.utils import timezone
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
import json
from PIU_Financial_mgt.models import KPI_For_Contract

from .models import Contract_Profiling_works, Contract_Profiling_goods_services, Specific_Contract_Monitoring
from .forms import ContractProfilingWorksForm, ContractProfilingGoodsServicesForm, SpecificContractMonitoringForm
from .filters import ContractProfilingWorksFilter, ContractProfilingGoodsServicesFilter, SpecificContractMonitoringFilter
# Safe imports with error handling
try:
    from .utils import (
        export_works_contracts_to_excel, export_goods_services_contracts_to_excel,
        export_monitoring_records_to_excel, get_dashboard_analytics
    )
except ImportError:
    # Define fallback functions if utils.py doesn't exist
    def export_works_contracts_to_excel(request):
        return HttpResponse("Export functionality not available")
    
    def export_goods_services_contracts_to_excel(request):
        return HttpResponse("Export functionality not available")
    
    def export_monitoring_records_to_excel(request):
        return HttpResponse("Export functionality not available")
    
    def get_dashboard_analytics():
        return {
            'total_works_contracts': 0,
            'total_goods_services_contracts': 0,
            'total_monitoring_records': 0,
            'recent_activities': []
        }

# Safe imports with error handling
try:
    from setup.models import (
        ProjectCategory, Donor, Type_of_Monitoring, 
        Physicalprogress, Quarter
    )
except ImportError:
    ProjectCategory = Donor = Type_of_Monitoring = None
    Physicalprogress = Quarter = None

try:
    from PIU_Financial_mgt.models import Project, Component, Subcomponent, Activities, Currency
except ImportError:
    Project = Component = Subcomponent = Activities = Currency = None


# HTMX Views for Cascading Dropdowns
@login_required
def load_project_components(request):
    """Load components based on selected project"""
    project_id = request.GET.get('projectID') or request.GET.get('project_id')
    components = []
    
    if project_id and Component:
        try:
            components = Component.objects.filter(projectID=project_id).order_by('component_Description')
        except Exception as e:
            pass
    else:
        pass

    
    return render(request, 'project_actions/htmx/component_dropdown_options.html', {
        'components': components
    })

@login_required  
def load_component_subcomponents(request):
    """Load subcomponents based on selected component"""
    component_id = request.GET.get('compID') or request.GET.get('component_id')
    subcomponents = []
    
    if component_id and Subcomponent:
        try:
            subcomponents = Subcomponent.objects.filter(compID=component_id).order_by('subcomponent')
        except Exception as e:
            pass
    else:
        pass

    
    return render(request, 'project_actions/htmx/subcomponent_dropdown_options.html', {
        'subcomponents': subcomponents
    })

@login_required
def load_subcomponent_activities(request):
    """Load activities based on selected subcomponent"""
    subcomponent_id = request.GET.get('subcompID') or request.GET.get('subcomponent_id')
    activities = []
    
    if subcomponent_id and Activities:
        try:
            activities = Activities.objects.filter(subcompID=subcomponent_id).order_by('activity')
        except Exception as e:
            pass
    else:
        pass

    
    return render(request, 'project_actions/htmx/activity_dropdown_options.html', {
        'activities': activities
    })


@login_required
def load_type_of_investments(request):
    monitoring_id = request.GET.get("monitoring")
    investments = KPI_For_Contract.objects.filter(monitoring_type_id=monitoring_id)
    return render(request, "project_actions/htmx/type_of_investment_dropdown.html", {
        "investments": investments,
    })

@login_required
def load_kpi_descriptions(request):
    investment_id = request.GET.get("investment")
    kpis = KPI_For_Contract.objects.filter(type_of_investment_id=investment_id)
    return render(request, "project_actions/htmx/kpi_description_dropdown.html", {
        "kpis": kpis,
    })




# Dashboard and Overview Views
@login_required
def dashboard(request):
    """
    Enhanced Project Actions dashboard with comprehensive statistics and analytics
    """
    try:
        # Get comprehensive statistics
        total_works_contracts = Contract_Profiling_works.objects.count()
        total_goods_services = Contract_Profiling_goods_services.objects.count()
        total_monitoring_records = Specific_Contract_Monitoring.objects.count()
        
        # Calculate total contract values
        works_value = Contract_Profiling_works.objects.aggregate(
            total=Sum('contract_value')
        )['total'] or 0
        
        goods_value = Contract_Profiling_goods_services.objects.aggregate(
            total=Sum('contract_value')
        )['total'] or 0
        
        total_contract_value = works_value + goods_value
        
        # Get recent contracts (last 5) - convert to lists for template evaluation
        recent_works = list(Contract_Profiling_works.objects.select_related(
            'projectID', 'currency'
        ).order_by('-date')[:3])
        
        recent_goods = list(Contract_Profiling_goods_services.objects.select_related(
            'projectID', 'currency'
        ).order_by('-date')[:2])
        
        # Combine recent contracts
        recent_contracts = list(recent_works) + list(recent_goods)
        recent_contracts.sort(key=lambda x: x.date, reverse=True)
        recent_contracts = recent_contracts[:5]
        
        # Status statistics (simplified for now)
        active_contracts = total_works_contracts + total_goods_services
        completed_contracts = 0
        pending_contracts = 0
        onhold_contracts = 0
        
        context = {
            'page_title': 'Project Actions Dashboard',
            'module_name': 'Project Actions',
            'total_works_contracts': total_works_contracts,
            'total_goods_services': total_goods_services,
            'total_monitoring_records': total_monitoring_records,
            'total_contract_value': total_contract_value,
            'recent_contracts': recent_contracts,
            'active_contracts': active_contracts,
            'completed_contracts': completed_contracts,
            'pending_contracts': pending_contracts,
            'onhold_contracts': onhold_contracts,
            'monthly_works_values': '100000,150000,200000,250000,300000,350000',
            'monthly_goods_values': '50000,75000,100000,125000,150000,175000',
        }
        
        return render(request, 'project_actions/dashboard.html', context)
        
    except Exception as e:
        messages.error(request, f'Error loading dashboard: {str(e)}')
        return render(request, 'project_actions/dashboard.html', {
            'page_title': 'Project Actions Dashboard',
            'module_name': 'Project Actions',
            'total_works_contracts': 0,
            'total_goods_services': 0,
            'total_monitoring_records': 0,
            'total_contract_value': 0,
            'recent_contracts': [],
            'active_contracts': 0,
            'completed_contracts': 0,
            'pending_contracts': 0,
            'onhold_contracts': 0,
        })
        
    except Exception as e:
        messages.warning(request, f"Some dashboard statistics may not be available: {str(e)}")
        context = {
            'page_title': 'Project Actions Dashboard',
            'module_name': 'Project Actions',
            'analytics': {},
            'total_works_contracts': 0,
            'total_goods_services_contracts': 0,
            'total_monitoring_records': 0,
            'recent_works_contracts': [],
            'recent_goods_services_contracts': [],
            'recent_monitoring_records': [],
        }
    
    return render(request, 'project_actions/dashboard.html', context)


# AJAX Views for Cascading Dropdowns
@login_required
def load_type_of_investments(request):
    """Load Type of Investment options based on selected project and monitoring type"""
    monitoring_type_id = request.GET.get('monitoring_type_id')
    
    # Handle project_id with special characters properly
    full_query_string = request.META.get('QUERY_STRING', '')
    
    
    # Advanced parsing to handle project_id with & characters
    project_id = None
    
    # Method 1: Try to reconstruct from URL path and query
    if 'project_id=' in full_query_string:
        # Split by '&' and find all parts that might belong to project_id
        parts = full_query_string.split('&')
        project_parts = []
        
        collecting_project_id = False
        for part in parts:
            if part.startswith('project_id='):
                # Start collecting project_id
                collecting_project_id = True
                project_parts.append(part[11:])  # Remove 'project_id=' prefix
            elif collecting_project_id and not any(part.startswith(param + '=') for param in ['monitoring_type_id', 'investment_code', 'type_of_investment']):
                # Continue collecting if this part doesn't start with a known parameter
                project_parts.append(part)
            elif collecting_project_id and any(part.startswith(param + '=') for param in ['monitoring_type_id', 'investment_code', 'type_of_investment']):
                # Stop collecting when we hit a known parameter
                break
        
        if project_parts:
            # Reconstruct project_id with & characters
            project_id = '&'.join(project_parts)
            
            # URL decode
            import urllib.parse
            project_id = urllib.parse.unquote(project_id)
            
    
    # Method 2: Fallback to direct URL parsing
    if not project_id:
        import urllib.parse
        # Parse the full URL to get all parameters
        request_url = request.build_absolute_uri()
        parsed_url = urllib.parse.urlparse(request_url)
        
        # Manual extraction from raw query string
        if 'project_id=' in parsed_url.query:
            start_pos = parsed_url.query.find('project_id=') + len('project_id=')
            end_pos = parsed_url.query.find('&monitoring_type_id=', start_pos)
            if end_pos == -1:
                end_pos = len(parsed_url.query)
            
            project_id = parsed_url.query[start_pos:end_pos]
            project_id = urllib.parse.unquote(project_id)
            
    
    # Method 3: Final fallback
    if not project_id:
        project_id = request.GET.get('project_id', '')
        if project_id:
            import urllib.parse
            project_id = urllib.parse.unquote(project_id)
            
    
    if monitoring_type_id and project_id:
        try:
            # Check if we're using SQL Server (based on database engine)
            from django.db import connection
            engine = connection.settings_dict.get('ENGINE', '')
            
            
            
            if True:  # Force SQL Server mode - always use raw SQL queries
                # Use raw SQL for SQL Server compatibility
                with connection.cursor() as cursor:
                    # Try different table names for test vs production environments
                    table_names = [
                        '[piuprod3].[dbo].[PIU_Financial_mgt_kpi_for_contract]',  # Test environment
                        '[piuprod3].[dbo].[PIU_Financial_mgt_kpi_for_contract]',  # Production environment  
                        'PIU_Financial_mgt_kpi_for_contract'  # Fallback without schema
                    ]
                    
                    results = []
                    for table_name in table_names:
                        try:
                            query = f"""
                                SELECT DISTINCT 
                                    type_of_investment as value,
                                    type_of_investment as text
                                FROM {table_name}
                                WHERE project_id = %s AND monitoring_type_id = %s
                                ORDER BY type_of_investment
                            """
                            cursor.execute(query, (project_id, monitoring_type_id))
                            results = cursor.fetchall()
                            
                            break
                        except Exception as e:
                            print(f"Failed to query {table_name}: {e}")
                            continue
                    
                    print(f"SQL Server query results: {len(results)} rows found")
                    if results:
                        print(f"Sample results: {results[:3]}")
                    
                    options = []
                    for row in results:
                        options.append({
                            'value': row[0],
                            'text': row[1]
                        })
                    
                    return JsonResponse({'options': options})
            else:
                # Use Django ORM for SQLite/other databases
                kpi_records = KPI_For_Contract.objects.filter(
                    project__projectID=project_id,
                    monitoring_type__monitoring_type_code=monitoring_type_id
                ).values('type_of_investment').distinct()
                
                options = []
                for record in kpi_records:
                    options.append({
                        'value': record['type_of_investment'],
                        'text': record['type_of_investment']
                    })
                
                print(f"SQLite query results: {len(options)} options found")
                return JsonResponse({'options': options})
                
        except Exception as e:
            print("Error loading type of investments:", str(e))
            import traceback
            print("Full traceback:", traceback.format_exc())
            return JsonResponse({'options': [], 'error': str(e)})
    return JsonResponse({'options': []})


@login_required
def load_kpi_descriptions(request):
    """Load KPI Description options based on selected project and type of investment"""
    investment_code = request.GET.get('investment_code')
    
    # Handle project_id with special characters properly
    full_query_string = request.META.get('QUERY_STRING', '')
    
    
    # Advanced parsing to handle project_id with & characters
    project_id = None
    
    # Method 1: Try to reconstruct from URL path and query
    if 'project_id=' in full_query_string:
        # Split by '&' and find all parts that might belong to project_id
        parts = full_query_string.split('&')
        project_parts = []
        
        collecting_project_id = False
        for part in parts:
            if part.startswith('project_id='):
                # Start collecting project_id
                collecting_project_id = True
                project_parts.append(part[11:])  # Remove 'project_id=' prefix
            elif collecting_project_id and not any(part.startswith(param + '=') for param in ['monitoring_type_id', 'investment_code', 'type_of_investment']):
                # Continue collecting if this part doesn't start with a known parameter
                project_parts.append(part)
            elif collecting_project_id and any(part.startswith(param + '=') for param in ['monitoring_type_id', 'investment_code', 'type_of_investment']):
                # Stop collecting when we hit a known parameter
                break
        
        if project_parts:
            # Reconstruct project_id with & characters
            project_id = '&'.join(project_parts)
            
            # URL decode
            import urllib.parse
            project_id = urllib.parse.unquote(project_id)
            
    
    # Method 2: Fallback to direct URL parsing
    if not project_id:
        import urllib.parse
        # Parse the full URL to get all parameters
        request_url = request.build_absolute_uri()
        parsed_url = urllib.parse.urlparse(request_url)
        
        # Manual extraction from raw query string
        if 'project_id=' in parsed_url.query:
            start_pos = parsed_url.query.find('project_id=') + len('project_id=')
            end_pos = parsed_url.query.find('&investment_code=', start_pos)
            if end_pos == -1:
                end_pos = len(parsed_url.query)
            
            project_id = parsed_url.query[start_pos:end_pos]
            project_id = urllib.parse.unquote(project_id)
            
    
    # Method 3: Final fallback
    if not project_id:
        project_id = request.GET.get('project_id', '')
        if project_id:
            import urllib.parse
            project_id = urllib.parse.unquote(project_id)
            
    
    if investment_code and project_id:
        try:
            # Check if we're using SQL Server
            from django.db import connection
            if True:  # Force SQL Server mode - always use raw SQL queries
                # Use raw SQL for SQL Server compatibility
                with connection.cursor() as cursor:
                    # Try different table names for test vs production environments
                    table_names = [
                        '[piuprod3].[dbo].[PIU_Financial_mgt_kpi_for_contract]',  # Test environment
                        '[piuprod3].[dbo].[PIU_Financial_mgt_kpi_for_contract]',  # Production environment  
                        'PIU_Financial_mgt_kpi_for_contract'  # Fallback without schema
                    ]
                    
                    results = []
                    for table_name in table_names:
                        try:
                            query = f"""
                                SELECT DISTINCT 
                                    monitoring_Type_Code as value,
                                    Kpi_description as text
                                FROM {table_name}
                                WHERE type_of_investment = %s AND project_id = %s
                                ORDER BY Kpi_description
                            """
                            cursor.execute(query, (investment_code, project_id))
                            results = cursor.fetchall()
                            print(f"Successfully queried KPI table: {table_name}")
                            break
                        except Exception as e:
                            print(f"Failed to query KPI {table_name}: {e}")
                            continue
                    
                    options = []
                    for row in results:
                        options.append({
                            'value': row[0],
                            'text': row[1]
                        })
                    
                    return JsonResponse({'options': options})
            else:
                # Use Django ORM for SQLite/other databases
                kpi_records = KPI_For_Contract.objects.filter(
                    project__projectID=project_id,
                    type_of_investment=investment_code
                ).values('monitoring_Type_Code', 'Kpi_description').distinct()
                
                options = []
                for record in kpi_records:
                    options.append({
                        'value': record['monitoring_Type_Code'],
                        'text': record['Kpi_description']
                    })
                
                return JsonResponse({'options': options})
                
        except Exception as e:
            print("Error loading KPI descriptions:", str(e))
            return JsonResponse({'options': [], 'error': str(e)})
    
    return JsonResponse({'options': []})


# SQL Server Testing and Diagnostics
@login_required
def test_sql_server_connection(request):
    """Test SQL Server connection and KPI data availability"""
    try:
        from django.db import connection
        
        # Check if using SQL Server
        engine = connection.settings_dict.get('ENGINE', '')
        database_info = {
            'engine': engine,
            'is_sql_server': True,  # Force SQL Server mode
            'database': str(connection.settings_dict.get('NAME', 'Unknown'))
        }
        
        if True:  # Force SQL Server mode - always use raw SQL queries
            # Test SQL Server specific query
            with connection.cursor() as cursor:
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
                    'database_info': database_info,
                    'connection': 'SQL Server connected successfully',
                    'sample_data_count': len(results),
                    'sample_data': results[:5] if results else [],
                    'message': f'Found {len(results)} KPI records in SQL Server table'
                })
        else:
            # Test with Django ORM for other databases
            from PIU_Financial_mgt.models import KPI_For_Contract
            count = KPI_For_Contract.objects.count()
            sample_data = list(KPI_For_Contract.objects.values(
                'project__projectID', 'monitoring_type__monitoring_type_code',
                'type_of_investment', 'Kpi_description'
            )[:5])
            
            return JsonResponse({
                'status': 'success',
                'database_info': database_info,
                'connection': 'Database connected successfully',
                'sample_data_count': count,
                'sample_data': sample_data,
                'message': f'Found {count} KPI records in database'
            })
            
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'connection': 'Database connection failed',
            'error': str(e),
            'database_info': {
                'engine': str(connection.settings_dict.get('ENGINE', 'Unknown')),
                'database': str(connection.settings_dict.get('NAME', 'Unknown'))
            }
        })

@login_required
def sql_server_diagnostics(request):
    """System diagnostics for internal use only"""
    try:
        from django.db import connection
        
        diagnostics = {
            'system_status': 'operational',
            'tests': {}
        }
        
        if True:  # Force SQL Server mode - always use raw SQL queries
            # SQL Server specific tests
            with connection.cursor() as cursor:
                # Test 1: Check if KPI table exists
                try:
                    cursor.execute("""
                        SELECT COUNT(*) 
                        FROM INFORMATION_SCHEMA.TABLES 
                        WHERE TABLE_SCHEMA = 'dbo' 
                        AND TABLE_NAME = 'PIU_Financial_mgt_kpi_for_contract'
                    """)
                    table_exists = cursor.fetchone()[0] > 0
                    diagnostics['tests']['kpi_table_exists'] = table_exists
                except Exception as e:
                    diagnostics['tests']['kpi_table_exists'] = f"Error: {e}"
                
                # Test 2: Count total KPI records
                try:
                    cursor.execute("SELECT COUNT(*) FROM [piuprod3].[dbo].[PIU_Financial_mgt_kpi_for_contract]")
                    total_kpis = cursor.fetchone()[0]
                    diagnostics['tests']['total_kpi_records'] = total_kpis
                except Exception as e:
                    diagnostics['tests']['total_kpi_records'] = f"Error: {e}"
                
                # Test 3: Check unique projects
                try:
                    cursor.execute("SELECT COUNT(DISTINCT project_id) FROM [piuprod3].[dbo].[PIU_Financial_mgt_kpi_for_contract]")
                    unique_projects = cursor.fetchone()[0]
                    diagnostics['tests']['unique_projects'] = unique_projects
                except Exception as e:
                    diagnostics['tests']['unique_projects'] = f"Error: {e}"
                
                # Test 4: Check unique monitoring types
                try:
                    cursor.execute("SELECT COUNT(DISTINCT monitoring_type_id) FROM [piuprod3].[dbo].[PIU_Financial_mgt_kpi_for_contract]")
                    unique_monitoring_types = cursor.fetchone()[0]
                    diagnostics['tests']['unique_monitoring_types'] = unique_monitoring_types
                except Exception as e:
                    diagnostics['tests']['unique_monitoring_types'] = f"Error: {e}"
                
                # Test 5: Sample project-monitoring combinations
                try:
                    cursor.execute("""
                        SELECT TOP 5 project_id, monitoring_type_id, COUNT(*) as kpi_count
                        FROM [piuprod3].[dbo].[PIU_Financial_mgt_kpi_for_contract]
                        GROUP BY project_id, monitoring_type_id
                        ORDER BY COUNT(*) DESC
                    """)
                    combinations = cursor.fetchall()
                    diagnostics['tests']['sample_combinations'] = [
                        {'project': row[0], 'monitoring_type': row[1], 'kpi_count': row[2]}
                        for row in combinations
                    ]
                except Exception as e:
                    diagnostics['tests']['sample_combinations'] = f"Error: {e}"
        
        return JsonResponse({
            'status': 'success',
            'diagnostics': diagnostics
        })
        
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'error': str(e)
        })


# Contract Profiling Works Views
@login_required
def contract_profiling_works_list(request):
    """Enhanced list view for Contract Profiling Works with filtering and search"""
    try:
        # Import the filter form
        from .forms import ContractWorksFilterForm
        
        # Base queryset
        queryset = Contract_Profiling_works.objects.all().select_related(
            'projectID', 'compID', 'subcompID', 'activityID', 'project_Category',
            'funding_source', 'currency'
        ).order_by('-id')
        
        # Initialize the filter form with request data
        filter_form = ContractWorksFilterForm(request.GET or None)
        
        # Apply filters if form is valid
        if filter_form.is_valid():
            # Project filter
            if filter_form.cleaned_data.get('project'):
                queryset = queryset.filter(projectID=filter_form.cleaned_data['project'])
                
            # Component filter
            if filter_form.cleaned_data.get('component'):
                queryset = queryset.filter(compID=filter_form.cleaned_data['component'])
                
            # Subcomponent filter
            if filter_form.cleaned_data.get('subcomponent'):
                queryset = queryset.filter(subcompID=filter_form.cleaned_data['subcomponent'])
                
            # Activity filter
            if filter_form.cleaned_data.get('activity'):
                queryset = queryset.filter(activityID=filter_form.cleaned_data['activity'])
                
            # Currency filter
            if filter_form.cleaned_data.get('currency'):
                queryset = queryset.filter(currency=filter_form.cleaned_data['currency'])
                
            # Project Category filter
            if filter_form.cleaned_data.get('project_category'):
                queryset = queryset.filter(project_Category=filter_form.cleaned_data['project_category'])
                
            # Contractor filter
            if filter_form.cleaned_data.get('contractor'):
                queryset = queryset.filter(name_of_contractor=filter_form.cleaned_data['contractor'])
                
            # Consultant filter
            if filter_form.cleaned_data.get('consultant'):
                queryset = queryset.filter(name_of_consultant=filter_form.cleaned_data['consultant'])
                
            # Value range filter
            value_range = filter_form.cleaned_data.get('value_range')
            if value_range and '-' in value_range:
                min_val, max_val = value_range.split('-')
                queryset = queryset.filter(
                    contract_value__gte=int(min_val),
                    contract_value__lte=int(max_val)
                )
        
        # Search functionality
        search_query = request.GET.get('search', '')
        if search_query:
            queryset = queryset.filter(
                Q(contract_refNo__icontains=search_query) |
                Q(name_of_contractor__icontains=search_query) |
                Q(name_of_consultant__icontains=search_query) |
                Q(location_of_investment__icontains=search_query) |
                Q(main_intervention_focus_result__icontains=search_query)
            )
        
        # Sorting
        sort_by = request.GET.get("sort", "-id")
        if sort_by:
            try:
                queryset = queryset.order_by(sort_by)
            except:
                queryset = queryset.order_by('-date')
        
        # Statistics
        total_value = queryset.aggregate(total=Sum('contract_value'))['total'] or 0
        active_contracts = queryset.filter(
            contract_start_date__lte=timezone.now().date(),
            contract_end_date__gte=timezone.now().date()
        ).count()
        
        # Pagination
        paginator = Paginator(queryset, 25)
        page_number = request.GET.get('page')
        page_obj = paginator.get_page(page_number)
        
        context = {
            'page_title': 'Contract Profiling - Works',
            'contracts': page_obj,
            'filter_form': filter_form,
            'search_query': search_query,
            'total_contracts': queryset.count(),
            'total_value': total_value,
            'active_contracts': active_contracts,
            'sort_by': sort_by,
        }
        
    except Exception as e:
        messages.error(request, f"Error loading contracts: {str(e)}")
        context = {
            'page_title': 'Contract Profiling - Works',
            'contracts': [],
            'filter_form': None,
            'search_query': '',
            'total_contracts': 0,
            'total_value': 0,
            'active_contracts': 0,
        }
    
    return render(request, 'project_actions/contract_profiling_works_list.html', context)


@login_required
def contract_profiling_works_detail(request, pk):
    """Detailed view for a specific Works contract"""
    try:
        contract = get_object_or_404(
            Contract_Profiling_works.objects.select_related(
                'projectID', 'compID', 'subcompID', 'activityID', 'project_Category',
                'funding_source', 'currency', 'loginUser'
            ), 
            pk=pk
        )
        
        # Related monitoring records
        monitoring_records = Specific_Contract_Monitoring.objects.filter(
            contract_refNo=contract.contract_refNo
        ).select_related(
            'project', 'quarter', 'type_of_monitoring', 'Contract_implementation_Status'
        ).order_by('-monitoring_date')
        
        # Calculate contract status
        today = timezone.now().date()
        if contract.contract_start_date and contract.contract_end_date:
            if contract.contract_start_date > today:
                contract_status = 'upcoming'
            elif contract.contract_end_date < today:
                contract_status = 'completed'
            else:
                contract_status = 'active'
        else:
            contract_status = 'unknown'
        
        # Calculate duration
        duration_days = 0
        if contract.contract_start_date and contract.contract_end_date:
            duration_days = (contract.contract_end_date - contract.contract_start_date).days
        
        context = {
            'page_title': f'Contract Details - {contract.contract_refNo}',
            'contract': contract,
            'monitoring_records': monitoring_records,
            'contract_status': contract_status,
            'duration_days': duration_days,
            'monitoring_count': monitoring_records.count(),
        }
        
    except Exception as e:
        messages.error(request, f"Error loading contract details: {str(e)}")
        return redirect('project_actions:contract_profiling_works_list')
    
    return render(request, 'project_actions/contract_profiling_works_detail.html', context)


@login_required
@transaction.atomic
def contract_profiling_works_create(request):
    """Create new Works contract"""
    if request.method == 'POST':
        form = ContractProfilingWorksForm(request.POST)
        if form.is_valid():
            try:
                contract = form.save(commit=False)
                contract.loginUser = request.user
                contract.save()
                
                messages.success(
                    request, 
                    f"Works contract '{contract.contract_refNo}' created successfully!"
                )
                return redirect('project_actions:contract_profiling_works_detail', pk=contract.pk)
                
            except Exception as e:
                messages.error(request, f"Error creating contract: {str(e)}")
        else:
            messages.error(request, "Please correct the errors below.")
    else:
        form = ContractProfilingWorksForm()
    
    context = {
        'page_title': 'Create Works Contract',
        'form': form,
        'form_action': 'Create',
    }
    
    return render(request, 'project_actions/contract_profiling_works_form.html', context)


@login_required
@transaction.atomic
def contract_profiling_works_update(request, pk):
    """Update existing Works contract"""
    try:
        contract = get_object_or_404(Contract_Profiling_works, pk=pk)
        
        if request.method == 'POST':
            form = ContractProfilingWorksForm(request.POST, instance=contract)
            if form.is_valid():
                try:
                    form.save()
                    messages.success(
                        request, 
                        f"Works contract '{contract.contract_refNo}' updated successfully!"
                    )
                    return redirect('project_actions:contract_profiling_works_detail', pk=contract.pk)
                    
                except Exception as e:
                    messages.error(request, f"Error updating contract: {str(e)}")
            else:
                messages.error(request, "Please correct the errors below.")
        else:
            form = ContractProfilingWorksForm(instance=contract)
        
        context = {
            'page_title': f'Update Works Contract - {contract.contract_refNo}',
            'form': form,
            'form_action': 'Update',
            'contract': contract,
        }
        
    except Exception as e:
        messages.error(request, f"Error loading contract: {str(e)}")
        return redirect('project_actions:contract_profiling_works-list')
    
    return render(request, 'project_actions/contract_profiling_works_form.html', context)


@login_required
@require_http_methods(["POST"])
def contract_profiling_works_delete(request, pk):
    """Delete Works contract"""
    try:
        contract = get_object_or_404(Contract_Profiling_works, pk=pk)
        contract_ref = contract.contract_refNo
        contract.delete()
        
        messages.success(request, f"Works contract '{contract_ref}' deleted successfully!")
        
    except Exception as e:
        messages.error(request, f"Error deleting contract: {str(e)}")
    
    return redirect('project_actions:contract_profiling_works-list')


# Contract Profiling Goods & Services Views
@login_required
def contract_profiling_goods_services_list(request):
    """Enhanced list view for Contract Profiling Goods & Services"""
    try:
        queryset = Contract_Profiling_goods_services.objects.all().select_related(
            'projectID', 'compID', 'subcompID', 'activityID', 'project_Category',
            'funding_source', 'currency', 'loginUser'
        ).order_by('-date')
        
        # Apply filtering using existing filter class
        filter_form = ContractProfilingGoodsServicesFilter(request.GET, queryset=queryset)
        queryset = filter_form.qs
        
        # Search functionality
        search_query = request.GET.get('search', '')
        if search_query:
            queryset = queryset.filter(
                Q(contract_refNo__icontains=search_query) |
                Q(name_of_Supplier__icontains=search_query) |
                Q(name_of_consultant__icontains=search_query) |
                Q(remarks__icontains=search_query)
            )
        
        # Sorting
        sort_by = request.GET.get("sort", "-id")
        if sort_by:
            try:
                queryset = queryset.order_by(sort_by)
            except:
                queryset = queryset.order_by('-date')
        
        # Statistics
        total_value = queryset.aggregate(total=Sum('contract_value'))['total'] or 0
        active_contracts = queryset.filter(
            contract_start_date__lte=timezone.now().date(),
            contract_end_date__gte=timezone.now().date()
        ).count()
        
        # Pagination
        paginator = Paginator(queryset, 5)
        page_number = request.GET.get('page')
        page_obj = paginator.get_page(page_number)
        
        context = {
            'page_title': 'Contract Profiling - Goods & Services',
            'contracts': page_obj,
            'filter_form': filter_form,
            'search_query': search_query,
            'total_contracts': queryset.count(),
            'total_value': total_value,
            'active_contracts': active_contracts,
            'sort_by': sort_by,
        }
        
    except Exception as e:
        messages.error(request, f"Error loading contracts: {str(e)}")
        context = {
            'page_title': 'Contract Profiling - Goods & Services',
            'contracts': [],
            'filter_form': None,
            'search_query': '',
            'total_contracts': 0,
            'total_value': 0,
            'active_contracts': 0,
        }
    
    return render(request, 'project_actions/contract_profiling_goods_services_list.html', context)


@login_required
def contract_profiling_goods_services_detail(request, pk):
    """Detailed view for a specific Goods & Services contract"""
    try:
        contract = get_object_or_404(
            Contract_Profiling_goods_services.objects.select_related(
                'projectID', 'compID', 'subcompID', 'activityID', 'project_Category',
                'funding_source', 'currency', 'loginUser'
            ), 
            pk=pk
        )
        
        # Related monitoring records
        monitoring_records = Specific_Contract_Monitoring.objects.filter(
            contract_refNo=contract.contract_refNo
        ).select_related(
            'project', 'quarter', 'type_of_monitoring', 'Contract_implementation_Status'
        ).order_by('-monitoring_date')
        
        # Calculate contract status
        today = timezone.now().date()
        if contract.contract_start_date and contract.contract_end_date:
            if contract.contract_start_date > today:
                contract_status = 'upcoming'
            elif contract.contract_end_date < today:
                contract_status = 'completed'
            else:
                contract_status = 'active'
        else:
            contract_status = 'unknown'
        
        # Calculate duration
        duration_days = 0
        if contract.contract_start_date and contract.contract_end_date:
            duration_days = (contract.contract_end_date - contract.contract_start_date).days
        
        context = {
            'page_title': f'Contract Details - {contract.contract_refNo}',
            'contract': contract,
            'monitoring_records': monitoring_records,
            'contract_status': contract_status,
            'duration_days': duration_days,
            'monitoring_count': monitoring_records.count(),
        }
        
    except Exception as e:
        messages.error(request, f"Error loading contract details: {str(e)}")
        return redirect('project_actions:contract_profiling_goods_services_list')
    
    return render(request, 'project_actions/contract_profiling_goods_services_detail.html', context)


@login_required
@transaction.atomic
def contract_profiling_goods_services_create(request):
    """Create new Goods & Services contract"""
    if request.method == 'POST':
        form = ContractProfilingGoodsServicesForm(request.POST)
        if form.is_valid():
            try:
                contract = form.save(commit=False)
                contract.loginUser = request.user
                contract.save()
                
                messages.success(
                    request, 
                    f"Goods & Services contract '{contract.contract_refNo}' created successfully!"
                )
                return redirect('project_actions:contract_profiling_goods_services_detail', pk=contract.pk)
                
            except Exception as e:
                messages.error(request, f"Error creating contract: {str(e)}")
        else:
            messages.error(request, "Please correct the errors below.")
    else:
        form = ContractProfilingGoodsServicesForm()
    
    context = {
        'page_title': 'Create Goods & Services Contract',
        'form': form,
        'form_action': 'Create',
    }
    
    return render(request, 'project_actions/contract_profiling_goods_services_form.html', context)


@login_required
@transaction.atomic
def contract_profiling_goods_services_update(request, pk):
    """Update existing Goods & Services contract"""
    try:
        contract = get_object_or_404(Contract_Profiling_goods_services, pk=pk)
        
        if request.method == 'POST':
            form = ContractProfilingGoodsServicesForm(request.POST, instance=contract)
            if form.is_valid():
                try:
                    form.save()
                    messages.success(
                        request, 
                        f"Goods & Services contract '{contract.contract_refNo}' updated successfully!"
                    )
                    return redirect('project_actions:contract_profiling_goods_services_detail', pk=contract.pk)
                    
                except Exception as e:
                    messages.error(request, f"Error updating contract: {str(e)}")
            else:
                messages.error(request, "Please correct the errors below.")
        else:
            form = ContractProfilingGoodsServicesForm(instance=contract)
        
        context = {
            'page_title': f'Update Goods & Services Contract - {contract.contract_refNo}',
            'form': form,
            'form_action': 'Update',
            'contract': contract,
        }
        
    except Exception as e:
        messages.error(request, f"Error loading contract: {str(e)}")
        return redirect('project_actions:contract_profiling_goods_services_list')
    
    return render(request, 'project_actions/contract_profiling_goods_services_form.html', context)


@login_required
@require_http_methods(["POST"])
def contract_profiling_goods_services_delete(request, pk):
    """Delete Goods & Services contract"""
    try:
        contract = get_object_or_404(Contract_Profiling_goods_services, pk=pk)
        contract_ref = contract.contract_refNo
        contract.delete()
        
        messages.success(request, f"Goods & Services contract '{contract_ref}' deleted successfully!")
        
    except Exception as e:
        messages.error(request, f"Error deleting contract: {str(e)}")
    
    return redirect('project_actions:contract_profiling_goods_services_list')


# Contract Monitoring Views
@login_required
def contract_monitoring_list(request):
    """Enhanced list view for Contract Monitoring with dual-mode support"""
    from utils.database_utils import is_sql_server_mode
    
    try:
        # Convert QuerySet to list to prevent template evaluation issues
        if is_sql_server_mode():
            # Use raw SQL for SQL Server mode
            from django.db import connection
            with connection.cursor() as cursor:
                table_name = "[piuprod3].[dbo].[project_actions_specific_contract_monitoring]"
                cursor.execute(f"SELECT * FROM {table_name} ORDER BY monitoring_date DESC")
                raw_records = cursor.fetchall()
                
                # Create mock objects for template compatibility
                class MockRecord:
                    def __init__(self, data):
                        self.id = data[0] if len(data) > 0 else None
                        self.contract_refNo = data[1] if len(data) > 1 else ""
                        self.monitoring_date = data[2] if len(data) > 2 else None
                        self.project_id = data[3] if len(data) > 3 else None
                        
                queryset = [MockRecord(record) for record in raw_records]
        else:
            # Use Django ORM for SQLite mode
            queryset = list(Specific_Contract_Monitoring.objects.all().select_related(
                'project', 'quarter', 'type_of_monitoring', 'Type_of_Investment',
                'Kpi_description', 'Contract_implementation_Status', 'loginUser'
            ).order_by('-monitoring_date'))
        
        # Apply filtering only for Django ORM mode
        if not is_sql_server_mode():
            filter_form = SpecificContractMonitoringFilter(request.GET, queryset=Specific_Contract_Monitoring.objects.all())
            queryset = list(filter_form.qs)
        else:
            filter_form = None
        
        # Additional filtering - only for Django ORM mode
        project_filter = request.GET.get('project')
        status_filter = request.GET.get('status')
        search_query = request.GET.get('search', '')
        
        if not is_sql_server_mode():
            # Apply filters for Django ORM
            if project_filter:
                queryset = [record for record in queryset if record.project.projectID == project_filter]
            
            if status_filter:
                queryset = [record for record in queryset if record.Contract_implementation_Status.id == int(status_filter)]
            
            # Search functionality for Django ORM
            if search_query:
                queryset = [record for record in queryset if 
                    search_query.lower() in (record.contract_refNo or '').lower() or
                    search_query.lower() in (record.Target or '').lower() or
                    search_query.lower() in (record.Achieved_status or '').lower() or
                    search_query.lower() in (record.remarks or '').lower()]
        
        # Statistics
        total_records = len(queryset)
        unique_contracts = len(set(record.contract_refNo for record in queryset if record.contract_refNo))
        overdue_milestones = 0  # Simplified for now
        
        # Simple pagination for list data
        from django.core.paginator import Paginator
        paginator = Paginator(queryset, 25)
        page_number = request.GET.get('page')
        page_obj = paginator.get_page(page_number)
        
        # Get data for filter dropdowns - show all projects for comprehensive monitoring  
        projects = list(Project.objects.all()) if Project else []
        physical_progress_options = list(Physicalprogress.objects.all()) if Physicalprogress else []
        
        context = {
            'page_title': 'Contract Monitoring',
            'monitoring_records': page_obj,
            'filter_form': filter_form,
            'search_query': search_query,
            'total_records': total_records,
            'unique_contracts': unique_contracts,
            'overdue_milestones': overdue_milestones,
            'sort_by': request.GET.get('sort', '-monitoring_date'),
            'projects': projects,
            'physical_progress_options': physical_progress_options,
        }
        
    except Exception as e:
        messages.error(request, f"Error loading monitoring records: {str(e)}")
        context = {
            'page_title': 'Contract Monitoring',
            'monitoring_records': [],
            'filter_form': None,
            'search_query': '',
            'total_records': 0,
            'unique_contracts': 0,
            'overdue_milestones': 0,
            'projects': Project.objects.all() if 'Project' in globals() else [],
            'physical_progress_options': Physicalprogress.objects.all() if 'Physicalprogress' in globals() else [],
        }
    
    return render(request, 'project_actions/contract_monitoring_list.html', context)


@login_required
def contract_monitoring_detail(request, pk):
    """Detailed view for a specific monitoring record"""
    try:
        record = get_object_or_404(
            Specific_Contract_Monitoring.objects.select_related(
                'project', 'quarter', 'type_of_monitoring', 'Type_of_Investment',
                'Kpi_description', 'Contract_implementation_Status', 'loginUser'
            ), 
            pk=pk
        )
        
        # Calculate milestone status
        today = timezone.now().date()
        if record.milestone_start_date and record.milestone_end_date:
            if record.milestone_start_date > today:
                milestone_status = 'upcoming'
            elif record.milestone_end_date < today:
                milestone_status = 'overdue'
            else:
                milestone_status = 'active'
        else:
            milestone_status = 'unknown'
        
        # Get related contracts
        related_works = Contract_Profiling_works.objects.filter(
            contract_refNo=record.contract_refNo
        ).first()
        related_goods_services = Contract_Profiling_goods_services.objects.filter(
            contract_refNo=record.contract_refNo
        ).first()
        
        # Other monitoring records for same contract
        other_records = Specific_Contract_Monitoring.objects.filter(
            contract_refNo=record.contract_refNo
        ).exclude(pk=pk).order_by('-monitoring_date')[:5]
        
        context = {
            'page_title': f'Monitoring Record - {record.contract_refNo}',
            'monitoring': record,  # Template expects 'monitoring' not 'record'
            'record': record,
            'milestone_status': milestone_status,
            'related_works_contract': related_works,
            'related_goods_services_contract': related_goods_services,
            'other_records': other_records,
        }
        
    except Exception as e:
        messages.error(request, f"Error loading monitoring record: {str(e)}")
        return redirect('project_actions:contract_monitoring_list')
    
    return render(request, 'project_actions/contract_monitoring_detail.html', context)


@login_required
@transaction.atomic
def contract_monitoring_create(request):
    """Create new monitoring record"""
    if request.method == 'POST':
        form = SpecificContractMonitoringForm(request.POST, request.FILES)
        if form.is_valid():
            try:
                record = form.save(commit=False)
                record.loginUser = request.user
                
                # Handle cascading dropdown fields - convert string values to KPI_For_Contract instances
                type_of_investment_value = form.cleaned_data.get('Type_of_Investment')
                kpi_description_value = form.cleaned_data.get('Kpi_description')
                
                if type_of_investment_value:
                    try:
                        # Find KPI_For_Contract instance by type_of_investment
                        kpi_investment = KPI_For_Contract.objects.filter(
                            type_of_investment=type_of_investment_value
                        ).first()
                        if kpi_investment:
                            record.Type_of_Investment = kpi_investment
                    except Exception as e:
                        print(f"Error finding Type_of_Investment: {e}")
                
                if kpi_description_value:
                    try:
                        # Find KPI_For_Contract instance by monitoring_Type_Code
                        kpi_desc = KPI_For_Contract.objects.filter(
                            monitoring_Type_Code=kpi_description_value
                        ).first()
                        if kpi_desc:
                            record.Kpi_description = kpi_desc
                    except Exception as e:
                        print(f"Error finding Kpi_description: {e}")
                
                # Validation for required fields
                if not record.Type_of_Investment:
                    messages.error(request, "Please select a Type of Investment.", extra_tags='project_actions')
                    return render(request, 'project_actions/contract_monitoring_form.html', {
                        'page_title': 'Create Monitoring Record',
                        'form': form,
                        'form_action': 'Create',
                    })
                
                if not record.Kpi_description:
                    messages.error(request, "Please select a KPI Description.", extra_tags='project_actions')
                    return render(request, 'project_actions/contract_monitoring_form.html', {
                        'page_title': 'Create Monitoring Record',
                        'form': form,
                        'form_action': 'Create',
                    })
                
                # Save the record with proper database compatibility
                record.save()
                
                messages.success(
                    request, 
                    f"Monitoring record for contract '{record.contract_refNo}' created successfully!",
                    extra_tags='project_actions'
                )
                return redirect('project_actions:contract_monitoring_list')
                
            except Exception as e:
                error_msg = str(e)
                # Handle specific SQL Server constraints if needed
                if 'FOREIGN KEY constraint' in error_msg:
                    messages.error(request, "One or more selected options are not valid. Please refresh the page and try again.", extra_tags='project_actions')
                elif 'NOT NULL constraint' in error_msg:
                    messages.error(request, "Please fill in all required fields.", extra_tags='project_actions')
                else:
                    messages.error(request, f"Error creating monitoring record: {error_msg}", extra_tags='project_actions')
                    
                # Log the error for debugging
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Error saving monitoring record: {error_msg}")
        else:
            messages.error(request, "Please correct the errors below.", extra_tags='project_actions')
            # Log form errors for debugging
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Form validation errors: {form.errors}")
    else:
        form = SpecificContractMonitoringForm()
        
        # Pre-fill contract reference if provided
        contract_ref = request.GET.get('contract_ref')
        if contract_ref:
            form.initial['contract_refNo'] = contract_ref
    
    context = {
        'page_title': 'Create Monitoring Record',
        'form': form,
        'form_action': 'Create',
    }
    
    return render(request, 'project_actions/contract_monitoring_form.html', context)


@login_required
@transaction.atomic
def contract_monitoring_update(request, pk):
    """Update existing monitoring record"""
    try:
        record = get_object_or_404(Specific_Contract_Monitoring, pk=pk)
        
        if request.method == 'POST':
            form = SpecificContractMonitoringForm(request.POST, request.FILES, instance=record)
            if form.is_valid():
                try:
                    form.save()
                    messages.success(
                        request, 
                        f"Monitoring record for contract '{record.contract_refNo}' updated successfully!"
                    )
                    return redirect('project_actions:contract_monitoring_list')
                    
                except Exception as e:
                    messages.error(request, f"Error updating monitoring record: {str(e)}")
            else:
                messages.error(request, "Please correct the errors below.")
        else:
            form = SpecificContractMonitoringForm(instance=record)
        
        context = {
            'page_title': f'Update Monitoring Record - {record.contract_refNo}',
            'form': form,
            'form_action': 'Update',
            'record': record,
            'record': record,
        }
        
    except Exception as e:
        messages.error(request, f"Error loading monitoring record: {str(e)}")
        return redirect('project_actions:contract_monitoring_list')
    
    return render(request, 'project_actions/contract_monitoring_form.html', context)


@login_required
@require_http_methods(["POST"])
def contract_monitoring_delete(request, pk):
    """Delete monitoring record"""
    try:
        record = get_object_or_404(Specific_Contract_Monitoring, pk=pk)
        contract_ref = record.contract_refNo
        record.delete()
        
        messages.success(request, f"Monitoring record for contract '{contract_ref}' deleted successfully!")
        
    except Exception as e:
        messages.error(request, f"Error deleting monitoring record: {str(e)}")
    
    return redirect('project_actions:contract_monitoring_list')


# Export Views
@login_required
def export_works_contracts_excel(request):
    """Export works contracts to Excel"""
    try:
        queryset = Contract_Profiling_works.objects.all().select_related(
            'projectID', 'compID', 'subcompID', 'activityID', 'project_Category',
            'funding_source', 'currency', 'loginUser'
        )
        
        # Apply same filters as list view
        filter_form = ContractProfilingWorksFilter(request.GET, queryset=queryset)
        queryset = filter_form.qs
        
        return export_works_contracts_to_excel(queryset)
        
    except Exception as e:
        messages.error(request, f"Error exporting data: {str(e)}")
        return redirect('project_actions:contract_profiling_works-list')


@login_required
def export_goods_services_contracts_excel(request):
    """Export goods & services contracts to Excel"""
    try:
        queryset = Contract_Profiling_goods_services.objects.all().select_related(
            'projectID', 'compID', 'subcompID', 'activityID', 'project_Category',
            'funding_source', 'currency', 'loginUser'
        )
        
        # Apply same filters as list view
        filter_form = ContractProfilingGoodsServicesFilter(request.GET, queryset=queryset)
        queryset = filter_form.qs
        
        return export_goods_services_contracts_to_excel(queryset)
        
    except Exception as e:
        messages.error(request, f"Error exporting data: {str(e)}")
        return redirect('project_actions:contract_profiling_goods_services_list')


@login_required
def export_monitoring_records_excel(request):
    """Export monitoring records to Excel"""
    try:
        queryset = Specific_Contract_Monitoring.objects.all().select_related(
            'project', 'quarter', 'type_of_monitoring', 'Type_of_Investment',
            'Kpi_description', 'Contract_implementation_Status', 'loginUser'
        )
        
        # Apply same filters as list view
        filter_form = SpecificContractMonitoringFilter(request.GET, queryset=queryset)
        queryset = filter_form.qs
        
        return export_monitoring_records_to_excel(queryset)
        
    except Exception as e:
        messages.error(request, f"Error exporting data: {str(e)}")
        return redirect('project_actions:contract_monitoring_list')


# AJAX Views
@login_required
def get_project_components(request):
    """AJAX endpoint to get components for a project"""
    project_id = request.GET.get('project_id')
    
    if not project_id or not Component:
        return JsonResponse({'components': []})
    
    try:
        components = Component.objects.filter(projectID=project_id).values('id', 'compName')
        return JsonResponse({'components': list(components)})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@login_required
def get_project_subcomponents(request):
    """AJAX endpoint to get subcomponents for a component"""
    component_id = request.GET.get('component_id')
    
    if not component_id or not Subcomponent:
        return JsonResponse({'subcomponents': []})
    
    try:
        subcomponents = Subcomponent.objects.filter(compID=component_id).values('id', 'subcompName')
        return JsonResponse({'subcomponents': list(subcomponents)})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@login_required
def get_project_activities(request):
    """AJAX endpoint to get activities for a subcomponent"""
    subcomponent_id = request.GET.get('subcomponent_id')
    
    if not subcomponent_id or not Activities:
        return JsonResponse({'activities': []})
    
    try:
        activities = Activities.objects.filter(subcompID=subcomponent_id).values('id', 'activityName')
        return JsonResponse({'activities': list(activities)})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@login_required
def get_contract_info(request):
    """AJAX endpoint to get contract information for monitoring"""
    contract_ref = request.GET.get('contract_ref')
    
    if not contract_ref:
        return JsonResponse({'error': 'Contract reference required'}, status=400)
    
    try:
        # Check in works contracts first
        works_contract = Contract_Profiling_works.objects.filter(
            contract_refNo=contract_ref
        ).first()
        
        if works_contract:
            return JsonResponse({
                'found': True,
                'type': 'works',
                'project_id': works_contract.projectID.pk if works_contract.projectID else None,
                'project_name': str(works_contract.projectID) if works_contract.projectID else '',
                'contractor': works_contract.name_of_contractor or '',
                'consultant': works_contract.name_of_consultant or '',
                'start_date': works_contract.contract_start_date.isoformat() if works_contract.contract_start_date else '',
                'end_date': works_contract.contract_end_date.isoformat() if works_contract.contract_end_date else '',
            })
        
        # Check in goods & services contracts
        gs_contract = Contract_Profiling_goods_services.objects.filter(
            contract_refNo=contract_ref
        ).first()
        
        if gs_contract:
            return JsonResponse({
                'found': True,
                'type': 'goods_services',
                'project_id': gs_contract.projectID.pk if gs_contract.projectID else None,
                'project_name': str(gs_contract.projectID) if gs_contract.projectID else '',
                'supplier': gs_contract.name_of_Supplier or '',
                'consultant': gs_contract.name_of_consultant or '',
                'start_date': gs_contract.contract_start_date.isoformat() if gs_contract.contract_start_date else '',
                'end_date': gs_contract.contract_end_date.isoformat() if gs_contract.contract_end_date else '',
            })
        
        return JsonResponse({'found': False})
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@login_required
def bulk_actions(request):
    """Handle bulk actions for contracts and monitoring records"""
    if request.method != 'POST':
        return JsonResponse({'error': 'POST method required'}, status=405)
    
    try:
        data = json.loads(request.body)
        action = data.get('action')
        model_type = data.get('model_type')
        selected_ids = data.get('selected_ids', [])
        
        if not action or not model_type or not selected_ids:
            return JsonResponse({'error': 'Missing required parameters'}, status=400)
        
        # Determine model class
        if model_type == 'works':
            model_class = Contract_Profiling_works
        elif model_type == 'goods_services':
            model_class = Contract_Profiling_goods_services
        elif model_type == 'monitoring':
            model_class = Specific_Contract_Monitoring
        else:
            return JsonResponse({'error': 'Invalid model type'}, status=400)
        
        # Execute bulk action
        queryset = model_class.objects.filter(id__in=selected_ids)
        
        if action == 'delete':
            count = queryset.count()
            queryset.delete()
            return JsonResponse({
                'success': True,
                'message': f'Successfully deleted {count} records'
            })
        
        elif action == 'export':
            # Handle bulk export based on model type
            if model_type == 'works':
                response = export_works_contracts_to_excel(queryset)
            elif model_type == 'goods_services':
                response = export_goods_services_contracts_to_excel(queryset)
            elif model_type == 'monitoring':
                response = export_monitoring_records_to_excel(queryset)
            
            return response
        
        else:
            return JsonResponse({'error': 'Invalid action'}, status=400)
            
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)



# HTMX Views for Dynamic Cascading Dropdowns
def htmx_get_components(request):
    """HTMX endpoint to get components based on selected project"""
    project_id = request.GET.get('project_id')
    components = []
    if project_id:
        try:
            from setup.models import Component
            components = Component.objects.filter(project_id=project_id).values('id', 'componentName')
        except:
            pass
    return render(request, 'project_actions/htmx/components_options.html', {
        'components': components
    })


def htmx_get_subcomponents(request):
    """HTMX endpoint to get subcomponents based on selected component"""
    component_id = request.GET.get('component_id')
    subcomponents = []
    if component_id:
        try:
            from setup.models import SubComponent
            subcomponents = SubComponent.objects.filter(comp_id=component_id).values('id', 'subcomponentName')
        except:
            pass
    return render(request, 'project_actions/htmx/subcomponents_options.html', {
        'subcomponents': subcomponents
    })


def htmx_get_activities(request):
    """HTMX endpoint to get activities based on selected subcomponent"""
    subcomponent_id = request.GET.get('subcomponent_id')
    activities = []
    if subcomponent_id:
        try:
            from setup.models import Activity
            activities = Activity.objects.filter(subcomp_id=subcomponent_id).values('id', 'activityName')
        except:
            pass
    return render(request, 'project_actions/htmx/activities_options.html', {
        'activities': activities
    })



@login_required  
def debug_cascading_dropdowns(request):
    """Debug endpoint specifically for cascading dropdown issues"""
    monitoring_type_id = request.GET.get("monitoring_type_id", "proc")
    project_id = request.GET.get("project_id", "D309D6530GM")
    
    try:
        from django.db import connection
        
        result = {
            "parameters": {
                "monitoring_type_id": monitoring_type_id,
                "project_id": project_id
            },
            "status": "debug_mode"
        }
        
        if True:  # Force SQL Server mode - always use raw SQL queries
            # SQL Server mode
            with connection.cursor() as cursor:
                # Check table structure
                cursor.execute("""
                    SELECT COLUMN_NAME, DATA_TYPE 
                    FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_SCHEMA = 'dbo' 
                    AND TABLE_NAME = 'PIU_Financial_mgt_kpi_for_contract'
                    ORDER BY ORDINAL_POSITION
                """)
                columns = dict(cursor.fetchall())
                result["table_columns"] = columns
                
                # Test the actual investment query
                query = """
                    SELECT DISTINCT 
                        type_of_investment,
                        monitoring_type_id,
                        project_id
                    FROM [piuprod3].[dbo].[PIU_Financial_mgt_kpi_for_contract]
                    WHERE project_id = ? AND monitoring_type_id = ?
                """
                cursor.execute(query, [project_id, monitoring_type_id])
                investments = cursor.fetchall()
                result["investments_found"] = len(investments)
                result["sample_investments"] = investments[:3]
                
                # Test KPI descriptions query
                if investments:
                    investment_code = investments[0][0]  # First investment
                    kpi_query = """
                        SELECT DISTINCT 
                            monitoring_Type_Code,
                            Kpi_description
                        FROM [piuprod3].[dbo].[PIU_Financial_mgt_kpi_for_contract]
                        WHERE type_of_investment = ? AND project_id = ?
                    """
                    cursor.execute(kpi_query, [investment_code, project_id])
                    kpi_results = cursor.fetchall()
                    result["kpi_descriptions_found"] = len(kpi_results)
                    result["sample_kpi_descriptions"] = kpi_results[:3]
                
                # Check all available combinations
                cursor.execute("""
                    SELECT DISTINCT project_id, monitoring_type_id 
                    FROM [piuprod3].[dbo].[PIU_Financial_mgt_kpi_for_contract]
                """)
                available_combinations = cursor.fetchall()
                result["available_combinations"] = available_combinations[:10]
                
        else:
            # SQLite mode
            from PIU_Financial_mgt.models import KPI_For_Contract
            
            investments = KPI_For_Contract.objects.filter(
                project__projectID=project_id,
                monitoring_type__monitoring_type_code=monitoring_type_id
            ).values("type_of_investment").distinct()
            
            result["investments_found"] = len(investments)
            result["sample_investments"] = list(investments[:3])
            
            # Show available combinations
            available = KPI_For_Contract.objects.values(
                "project__projectID", 
                "monitoring_type__monitoring_type_code"
            ).distinct()
            result["available_combinations"] = list(available[:10])
        
        return JsonResponse(result)
        
    except Exception as e:
        return JsonResponse({
            "error": str(e),
            "engine": engine,
            "parameters": {
                "monitoring_type_id": monitoring_type_id,
                "project_id": project_id
            }
        })


@login_required
def get_contracts_by_project_and_type(request):
    """AJAX endpoint to fetch contracts by project and contract type"""
    project_id = request.GET.get('project_id')
    contract_type = request.GET.get('contract_type')
    
    if not project_id or not contract_type:
        return JsonResponse({'error': 'Project ID and contract type are required'}, status=400)
    
    try:
        contracts = []
        
        if contract_type == 'works_contract':
            # Fetch Works contracts
            works_contracts = Contract_Profiling_works.objects.filter(
                projectID=project_id
            ).select_related('projectID', 'project_Category', 'funding_source', 'currency')
            
            for contract in works_contracts:
                contracts.append({
                    'id': contract.id,
                    'contract_refNo': contract.contract_refNo,
                    'contract_value': float(contract.contract_value),
                    'currency': contract.currency.currency if contract.currency else 'USD',
                    'contractor': contract.name_of_contractor or 'N/A',
                    'consultant': contract.name_of_consultant or 'N/A',
                    'start_date': contract.contract_start_date.strftime('%Y-%m-%d'),
                    'end_date': contract.contract_end_date.strftime('%Y-%m-%d'),
                    'status': get_contract_status(contract.contract_start_date, contract.contract_end_date),
                    'detail_url': f"/project_actions/contract-profiling-works/{contract.id}/"
                })
                
        elif contract_type == 'goods_services':
            # Fetch Goods & Services contracts
            goods_contracts = Contract_Profiling_goods_services.objects.filter(
                projectID=project_id
            ).select_related('projectID', 'project_Category', 'funding_source', 'currency')
            
            for contract in goods_contracts:
                contracts.append({
                    'id': contract.id,
                    'contract_refNo': contract.contract_refNo,
                    'contract_value': float(contract.contract_value),
                    'currency': contract.currency.currency if contract.currency else 'USD',
                    'supplier': contract.name_of_Supplier or 'N/A',
                    'consultant': contract.name_of_consultant or 'N/A',
                    'start_date': contract.contract_start_date.strftime('%Y-%m-%d'),
                    'end_date': contract.contract_end_date.strftime('%Y-%m-%d'),
                    'status': get_contract_status(contract.contract_start_date, contract.contract_end_date),
                    'detail_url': f"/project_actions/contract-profiling-goods-services/{contract.id}/"
                })
        
        return JsonResponse({
            'contracts': contracts,
            'total_count': len(contracts),
            'contract_type': contract_type
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


def get_contract_status(start_date, end_date):
    """Helper function to determine contract status"""
    from django.utils import timezone
    today = timezone.now().date()
    
    if start_date > today:
        return 'pending'
    elif end_date < today:
        return 'completed'
    else:
        return 'active'
