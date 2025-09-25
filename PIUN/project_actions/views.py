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
            components = Component.objects.filter(projectID=project_id).order_by('project_components')
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
def load_contracts(request):
    """Load contracts based on selected project and contract type"""
    project_id = request.GET.get('project')
    contract_type = request.GET.get('type_of_contract')
    
    contracts = []
    
    if project_id and contract_type:
        try:
            if contract_type == 'works_contract':
                # Load works contracts for the selected project
                from .models import Contract_Profiling_works
                works_contracts = Contract_Profiling_works.objects.filter(
                    projectID=project_id
                ).values('contract_refNo', 'name_of_contractor').order_by('contract_refNo')
                
                contracts = [
                    {
                        'ref_no': contract['contract_refNo'],
                        'display_name': f"{contract['contract_refNo']} - {contract['name_of_contractor']}"
                    }
                    for contract in works_contracts
                ]
                
            elif contract_type == 'goods_services':
                # Load goods & services contracts for the selected project
                from .models import Contract_Profiling_goods_services
                gs_contracts = Contract_Profiling_goods_services.objects.filter(
                    projectID=project_id
                ).values('contract_refNo', 'name_of_contractor').order_by('contract_refNo')
                
                contracts = [
                    {
                        'ref_no': contract['contract_refNo'],
                        'display_name': f"{contract['contract_refNo']} - {contract['name_of_contractor']}"
                    }
                    for contract in gs_contracts
                ]
                
        except Exception as e:
            # Log error but don't break the response
            print(f"Error loading contracts: {e}")
    
    return render(request, 'project_actions/htmx/contract_selection_options.html', {
        'contracts': contracts
    })

@login_required
def load_investment_types(request):
    """Load investment types based on selected project and type of monitoring"""
    project_id = request.GET.get('project')
    monitoring_type_id = request.GET.get('type_of_monitoring')
    
    investment_types = []
    
    if project_id and monitoring_type_id:
        try:
            # Import models and get investment types
            from PIU_Financial_mgt.models import KPI_For_Contract
            
            # Get distinct investment types for the project and monitoring type
            # Use correct field names: project, monitoring_type, type_of_investment
            kpis = KPI_For_Contract.objects.filter(
                project=project_id,
                monitoring_type=monitoring_type_id
            ).values_list('type_of_investment', flat=True).distinct()
            
            investment_types = [{'value': inv_type, 'label': inv_type} for inv_type in kpis if inv_type]
            
        except Exception as e:
            print(f"Error loading investment types: {e}")
    
    return render(request, 'project_actions/htmx/investment_types_options.html', {
        'investment_types': investment_types
    })

@login_required  
def load_kpi_descriptions(request):
    """Load KPI descriptions based on selected project, monitoring type, and investment type"""
    project_id = request.GET.get('project')
    monitoring_type_id = request.GET.get('type_of_monitoring')
    investment_type = request.GET.get('Type_of_Investment')
    
    kpi_descriptions = []
    
    if project_id and monitoring_type_id and investment_type:
        try:
            # Import models and get KPI descriptions
            from PIU_Financial_mgt.models import KPI_For_Contract
            
            # Get distinct KPI descriptions for the project, monitoring type, and investment type
            # Use correct field names: project, monitoring_type, type_of_investment, Kpi_description
            kpis = KPI_For_Contract.objects.filter(
                project=project_id,
                monitoring_type=monitoring_type_id,
                type_of_investment=investment_type
            ).values_list('Kpi_description', flat=True).distinct()
            
            kpi_descriptions = [{'value': kpi_desc, 'label': kpi_desc} for kpi_desc in kpis if kpi_desc]
            
        except Exception as e:
            print(f"Error loading KPI descriptions: {e}")
    
    return render(request, 'project_actions/htmx/kpi_descriptions_options.html', {
        'kpi_descriptions': kpi_descriptions
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
        
        # Status statistics - calculate based on contract dates and current date
        from datetime import date
        today = date.today()
        
        # Calculate status for works contracts
        works_active = Contract_Profiling_works.objects.filter(
            contract_start_date__lte=today,
            contract_end_date__gte=today
        ).count()
        
        works_completed = Contract_Profiling_works.objects.filter(
            contract_end_date__lt=today
        ).count()
        
        works_pending = Contract_Profiling_works.objects.filter(
            contract_start_date__gt=today
        ).count()
        
        # Calculate status for goods/services contracts
        goods_active = Contract_Profiling_goods_services.objects.filter(
            contract_start_date__lte=today,
            contract_end_date__gte=today
        ).count()
        
        goods_completed = Contract_Profiling_goods_services.objects.filter(
            contract_end_date__lt=today
        ).count()
        
        goods_pending = Contract_Profiling_goods_services.objects.filter(
            contract_start_date__gt=today
        ).count()
        
        # Combine status counts
        active_contracts = works_active + goods_active
        completed_contracts = works_completed + goods_completed
        pending_contracts = works_pending + goods_pending
        onhold_contracts = 0  # No on-hold logic in current model
        
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

# Contract Profiling Works Views
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
        
        # Test Django ORM database access
        try:
            from PIU_Financial_mgt.models import KPI_For_Contract
            test_count = KPI_For_Contract.objects.count()
            sample_data = list(KPI_For_Contract.objects.values(
                'project__projectID', 'monitoring_type__monitoring_type_code',
                'type_of_investment', 'Kpi_description'
            )[:5])
            
            return JsonResponse({
                'status': 'success',
                'database_info': database_info,
                'connection': 'Database connected successfully',
                'sample_data_count': test_count,
                'sample_data': sample_data,
                'message': f'Found {test_count} KPI records in database'
            })
        except Exception as db_error:
            return JsonResponse({
                'status': 'error',
                'database_info': database_info,
                'connection': 'Database test failed',
                'error': str(db_error)
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
def contract_profiling_works_list(request):
    """Enhanced list view for Contract Profiling Works using Django ORM exclusively"""
    try:
        # Import the filter form
        from .forms import ContractWorksFilterForm
        
        # Base queryset - using Django ORM exclusively for platform independence
        queryset = Contract_Profiling_works.objects.all().select_related(
            'projectID', 'compID', 'subcompID', 'activityID', 'project_Category',
            'funding_source', 'currency'
        ).order_by('-id')
        
        # Initialize the filter form with request data
        filter_form = ContractWorksFilterForm(request.GET or None)
        
        # Apply filters if form is valid
        if filter_form and filter_form.is_valid():
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
        
        # Search functionality using Django ORM
        search_query = request.GET.get('search', '')
        if search_query:
            from django.db.models import Q
            queryset = queryset.filter(
                Q(contract_refNo__icontains=search_query) |
                Q(name_of_contractor__icontains=search_query) |
                Q(name_of_consultant__icontains=search_query) |
                Q(location_of_investment__icontains=search_query) |
                Q(main_intervention_focus_result__icontains=search_query)
            )
        
        # Convert to list for pagination and calculate statistics
        queryset_list = list(queryset)
        total_value = sum(getattr(contract, 'contract_value', 0) or 0 for contract in queryset_list)
        active_contracts = 0  # Simplified for now
        
        # Pagination
        paginator = Paginator(queryset_list, 25)
        page_number = request.GET.get('page')
        page_obj = paginator.get_page(page_number)
        
        context = {
            'page_title': 'Contract Profiling - Works',
            'contracts': page_obj,
            'filter_form': filter_form,
            'search_query': search_query,
            'total_contracts': len(queryset_list),
            'total_value': total_value,
            'active_contracts': active_contracts,
            'sort_by': request.GET.get("sort", "-id"),
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
def contract_profiling_works_create(request):
    """Create new Works contract - Platform independent version"""
    if request.method == 'POST':
        form = ContractProfilingWorksForm(request.POST)
        
        # Debug logging to help diagnose issues
        if not form.is_valid():
            print("🔍 Form validation errors:")
            for field, errors in form.errors.items():
                print(f"🔍   {field}: {errors}")
            if form.non_field_errors():
                print(f"🔍   Non-field errors: {form.non_field_errors()}")
        
        if form.is_valid():
            try:
                # Remove transaction.atomic wrapper to avoid database issues
                contract = form.save(commit=False)
                contract.loginUser = request.user
                contract.save()
                
                messages.success(
                    request, 
                    f"Works contract '{contract.contract_refNo}' created successfully!"
                )
                return redirect('project_actions:contract_profiling_works_list')
                
            except Exception as e:
                print(f"🔍 Error saving contract: {str(e)}")
                messages.error(request, f"Error creating contract: {str(e)}")
        else:
            messages.error(request, "Please correct the errors below.")
            print("🔍 Form data received:")
            for key, value in request.POST.items():
                print(f"🔍   {key}: {value}")
    else:
        form = ContractProfilingWorksForm()
    
    context = {
        'page_title': 'Create Works Contract',
        'form': form,
        'form_action': 'Create',
    }
    
    return render(request, 'project_actions/contract_profiling_works_form.html', context)

@login_required
def contract_profiling_works_update(request, pk):
    """Update existing Works contract - Platform independent version"""
    try:
        contract = get_object_or_404(Contract_Profiling_works, pk=pk)
        
        if request.method == 'POST':
            form = ContractProfilingWorksForm(request.POST, instance=contract)
            # Debug logging for update issues
            if not form.is_valid():
                print("🔍 Update form validation errors:")
                for field, errors in form.errors.items():
                    print(f"🔍   {field}: {errors}")
                if form.non_field_errors():
                    print(f"🔍   Non-field errors: {form.non_field_errors()}")
            
            if form.is_valid():
                try:
                    # Remove transaction.atomic for platform independence
                    form.save()
                    messages.success(
                        request, 
                        f"Works contract '{contract.contract_refNo}' updated successfully!"
                    )
                    return redirect('project_actions:contract_profiling_works_detail', pk=contract.pk)
                    
                except Exception as e:
                    print(f"🔍 Error updating contract: {str(e)}")
                    messages.error(request, f"Error updating contract: {str(e)}")
            else:
                messages.error(request, "Please correct the errors below.")
                print("🔍 Update form data received:")
                for key, value in request.POST.items():
                    print(f"🔍   {key}: {value}")
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
        return redirect('project_actions:contract_profiling_works_list')
    
    return render(request, 'project_actions/contract_profiling_works_form.html', context)

@login_required
def contract_profiling_works_delete(request, pk):
    """Delete Works contract - supports both GET (confirmation) and POST (actual delete)"""
    try:
        contract = get_object_or_404(Contract_Profiling_works, pk=pk)
        
        if request.method == 'POST':
            # Actually delete the contract
            contract_ref = contract.contract_refNo
            contract.delete()
            messages.success(request, f"Works contract '{contract_ref}' deleted successfully!")
            return redirect('project_actions:contract_profiling_works_list')
        else:
            # Show confirmation page
            context = {
                'page_title': f'Delete Contract - {contract.contract_refNo}',
                'contract': contract,
                'object_type': 'Works Contract',
            }
            return render(request, 'project_actions/contract_profiling_works_confirm_delete.html', context)
        
    except Exception as e:
        messages.error(request, f"Error deleting contract: {str(e)}")
        return redirect('project_actions:contract_profiling_works_list')

# Contract Profiling Goods & Services Views
@login_required
def contract_profiling_goods_services_list(request):
    """Enhanced list view for Contract Profiling Goods & Services with dual-mode support"""
    # Platform independent - using Django ORM exclusively
    
    try:
        # Use Django ORM exclusively for platform independence
        queryset = Contract_Profiling_goods_services.objects.all().select_related(
            'projectID', 'compID', 'subcompID', 'activityID', 'project_Category',
            'funding_source', 'currency', 'loginUser'
        ).order_by('-date')
        
        # Apply filtering using existing filter class
        filter_form = ContractProfilingGoodsServicesFilter(request.GET, queryset=Contract_Profiling_goods_services.objects.all())
        queryset = filter_form.qs
        
        # Search functionality using Django ORM
        search_query = request.GET.get('search', '')
        if search_query:
            from django.db.models import Q
            queryset = queryset.filter(
                Q(contract_refNo__icontains=search_query) |
                Q(name_of_Supplier__icontains=search_query) |
                Q(name_of_consultant__icontains=search_query) |
                Q(remarks__icontains=search_query)
            )
        
        # Convert to list for pagination and calculate statistics
        queryset_list = list(queryset)
        total_contracts = len(queryset_list)
        total_value = sum(getattr(contract, 'contract_value', 0) or 0 for contract in queryset_list)
        active_contracts = 0  # Simplified for now
        
        # Pagination
        paginator = Paginator(queryset_list, 5)
        page_number = request.GET.get('page')
        page_obj = paginator.get_page(page_number)
        
        context = {
            'page_title': 'Contract Profiling - Goods & Services',
            'contracts': page_obj,
            'filter_form': filter_form,
            'search_query': search_query,
            'total_contracts': total_contracts,
            'total_value': total_value,
            'active_contracts': active_contracts,
            'sort_by': request.GET.get("sort", "-id"),
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
                return redirect('project_actions:contract_profiling_goods_services_list')
                
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
    # Platform independent - using Django ORM exclusively
    
    try:
        # Use Django ORM exclusively for platform independence - latest monitoring date first
        queryset = Specific_Contract_Monitoring.objects.all().select_related(
            'project', 'quarter', 'type_of_monitoring', 'Type_of_Investment',
            'Kpi_description', 'Contract_implementation_Status', 'loginUser'
        ).order_by('-monitoring_date')
        
        # Apply filtering using Django ORM
        filter_form = SpecificContractMonitoringFilter(request.GET, queryset=Specific_Contract_Monitoring.objects.all())
        queryset = filter_form.qs
        
        # Additional filtering - only for Django ORM mode
        project_filter = request.GET.get('project')
        status_filter = request.GET.get('status')
        search_query = request.GET.get('search', '')
        
        # Apply additional filters using Django ORM
        if project_filter:
            queryset = queryset.filter(project__projectID=project_filter)
        
        if status_filter:
            queryset = queryset.filter(Contract_implementation_Status__id=status_filter)
        
        # Search functionality using Django ORM
        if search_query:
            from django.db.models import Q
            queryset = queryset.filter(
                Q(contract_refNo__icontains=search_query) |
                Q(Target__icontains=search_query) |
                Q(Achieved_status__icontains=search_query) |
                Q(remarks__icontains=search_query)
            )
        
        # Ensure descending order by monitoring date after all filtering
        queryset = queryset.order_by('-monitoring_date')
        
        # Convert to list for pagination and calculate statistics
        queryset_list = list(queryset)
        total_records = len(queryset_list)
        unique_contracts = len(set(record.contract_refNo for record in queryset_list if record.contract_refNo))
        overdue_milestones = 0  # Simplified for now
        
        # Simple pagination for list data - 5 records per page
        from django.core.paginator import Paginator
        paginator = Paginator(queryset_list, 5)
        page_number = request.GET.get('page')
        page_obj = paginator.get_page(page_number)
        
        # Get data for filter dropdowns - show all projects for comprehensive monitoring  
        projects = list(Project.objects.all()) if Project else []
        physical_progress_options = list(Physicalprogress.objects.all()) if Physicalprogress else []
        
        context = {
            'page_title': 'Contract Monitoring',
            'monitoring_records': page_obj,
            'page_obj': page_obj,
            'is_paginated': page_obj.has_other_pages(),
            'filter_form': filter_form,
            'search_query': search_query,
            'total_records': total_records,
            'unique_contracts': unique_contracts,
            'overdue_milestones': overdue_milestones,
            'sort_by': request.GET.get('sort', '-monitoring_date'),
            'projects': projects,
            'physical_progress_options': physical_progress_options,
            'current_filters': '&'.join([f'{key}={value}' for key, value in request.GET.items() if key != 'page']),
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
            # Display specific form errors to help user understand what's wrong
            for field, errors in form.errors.items():
                for error in errors:
                    if field == '__all__':
                        messages.error(request, error, extra_tags='project_actions')
                    else:
                        messages.error(request, f"{field}: {error}", extra_tags='project_actions')
            
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
        
        # Prepare initial values for cascading dropdowns when editing
        initial_investment_kpi_data = None
        if record.type_of_monitoring:
            from PIU_Financial_mgt.models import KPI_For_Contract
            try:
                # Get available options for the current monitoring type
                kpi_records = KPI_For_Contract.objects.filter(
                    monitoring_type_id=record.type_of_monitoring.monitoring_type_code
                ).values('type_of_investment', 'Kpi_description').distinct()
                
                investment_options = []
                kpi_options = []
                
                investment_types_seen = set()
                kpi_descriptions_seen = set()
                
                for kpi_record in kpi_records:
                    if kpi_record['type_of_investment'] and kpi_record['type_of_investment'] not in investment_types_seen:
                        investment_types_seen.add(kpi_record['type_of_investment'])
                        investment_options.append({
                            'value': kpi_record['type_of_investment'],
                            'text': kpi_record['type_of_investment'],
                            'selected': record.Type_of_Investment and record.Type_of_Investment.type_of_investment == kpi_record['type_of_investment']
                        })
                    
                    if kpi_record['Kpi_description'] and kpi_record['Kpi_description'] not in kpi_descriptions_seen:
                        kpi_descriptions_seen.add(kpi_record['Kpi_description'])
                        kpi_options.append({
                            'value': kpi_record['Kpi_description'],
                            'text': kpi_record['Kpi_description'],
                            'selected': record.Kpi_description and record.Kpi_description.Kpi_description == kpi_record['Kpi_description']
                        })
                
                initial_investment_kpi_data = {
                    'investment_options': investment_options,
                    'kpi_options': kpi_options,
                }
            except Exception as e:
                print(f"Error loading initial investment/KPI data: {e}")
        
        context = {
            'page_title': f'Update Monitoring Record - {record.contract_refNo}',
            'form': form,
            'form_action': 'Update',
            'record': record,
            'initial_investment_kpi_data': initial_investment_kpi_data,
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
        return redirect('project_actions:contract_profiling_works_list')

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
def export_monitoring_records_pdf(request):
    """Export monitoring records to PDF with A4 portrait formatting"""
    try:
        queryset = Specific_Contract_Monitoring.objects.all().select_related(
            'project', 'quarter', 'type_of_monitoring', 'Type_of_Investment',
            'Kpi_description', 'Contract_implementation_Status', 'loginUser'
        )
        
        # Apply same filters as list view
        filter_form = SpecificContractMonitoringFilter(request.GET, queryset=queryset)
        queryset = filter_form.qs
        
        from .utils import export_monitoring_records_to_pdf
        return export_monitoring_records_to_pdf(queryset)
        
    except Exception as e:
        messages.error(request, f"Error exporting PDF: {str(e)}")
        return redirect('project_actions:contract_monitoring_list')

@login_required
def export_works_contracts_pdf(request):
    """Export works contracts to PDF with A4 portrait formatting"""
    try:
        queryset = Contract_Profiling_works.objects.all().select_related(
            'projectID', 'compID', 'subcompID', 'activityID', 'project_Category',
            'funding_source', 'currency', 'loginUser'
        )
        
        # Apply same filters as list view
        filter_form = ContractProfilingWorksFilter(request.GET, queryset=queryset)
        queryset = filter_form.qs
        
        from .utils import export_works_contracts_to_pdf
        return export_works_contracts_to_pdf(queryset)
        
    except Exception as e:
        messages.error(request, f"Error exporting PDF: {str(e)}")
        return redirect('project_actions:contract_profiling_works_list')

@login_required
def export_goods_services_contracts_pdf(request):
    """Export goods & services contracts to PDF with A4 portrait formatting"""
    try:
        queryset = Contract_Profiling_goods_services.objects.all().select_related(
            'projectID', 'compID', 'subcompID', 'activityID', 'project_Category',
            'funding_source', 'currency', 'loginUser'
        )
        
        # Apply same filters as list view
        filter_form = ContractProfilingGoodsServicesFilter(request.GET, queryset=queryset)
        queryset = filter_form.qs
        
        from .utils import export_goods_services_contracts_to_pdf
        return export_goods_services_contracts_to_pdf(queryset)
        
    except Exception as e:
        messages.error(request, f"Error exporting PDF: {str(e)}")
        return redirect('project_actions:contract_profiling_goods_services_list')

@login_required
def get_contracts_by_project_and_type_htmx(request):
    """HTMX endpoint to fetch contracts by project and contract type - returns HTML for offline compatibility"""
    import urllib.parse
    from datetime import datetime
    
    project_id = request.GET.get('project_id')
    contract_type = request.GET.get('contract_type')
    
    context = {
        'contracts': [],
        'error': None,
        'contract_type': contract_type,
        'project_id': project_id
    }
    
    if not project_id or not contract_type:
        context['error'] = 'Project ID and contract type are required'
        return render(request, 'project_actions/htmx/contract_selection_modal.html', context)
    
    # Decode URL-encoded project ID
    try:
        project_id = urllib.parse.unquote(project_id)
    except Exception:
        pass
    
    try:
        contracts = []
        
        if contract_type == 'works_contract':
            # Fetch Works contracts using projectID field
            works_contracts = Contract_Profiling_works.objects.filter(
                projectID__projectID=project_id
            ).select_related('projectID', 'project_Category', 'funding_source', 'currency')
            
            for contract in works_contracts:
                # Calculate status
                status = 'unknown'
                if contract.contract_start_date and contract.contract_end_date:
                    today = datetime.now().date()
                    if contract.contract_start_date > today:
                        status = 'pending'
                    elif contract.contract_end_date < today:
                        status = 'completed'
                    else:
                        status = 'active'
                
                contract_data = {
                    'id': contract.id,
                    'contract_refNo': contract.contract_refNo,
                    'contract_value': contract.contract_value or 0,
                    'currency': contract.currency.currency if contract.currency else 'USD',
                    'contractor': contract.name_of_contractor or 'N/A',
                    'consultant': contract.name_of_consultant or 'N/A',
                    'start_date': contract.contract_start_date,
                    'end_date': contract.contract_end_date,
                    'status': status,
                    'detail_url': f"/project_actions/contract-profiling-works/{contract.id}/",
                    'type': 'works_contract'
                }
                contracts.append(contract_data)
                
        elif contract_type == 'goods_services':
            # Fetch Goods & Services contracts using projectID field
            goods_contracts = Contract_Profiling_goods_services.objects.filter(
                projectID__projectID=project_id
            ).select_related('projectID', 'project_Category', 'funding_source', 'currency')
            
            for contract in goods_contracts:
                # Calculate status
                status = 'unknown'
                if contract.contract_start_date and contract.contract_end_date:
                    today = datetime.now().date()
                    if contract.contract_start_date > today:
                        status = 'pending'
                    elif contract.contract_end_date < today:
                        status = 'completed'
                    else:
                        status = 'active'
                
                contract_data = {
                    'id': contract.id,
                    'contract_refNo': contract.contract_refNo,
                    'contract_value': contract.contract_value or 0,
                    'currency': contract.currency.currency if contract.currency else 'USD',
                    'supplier': contract.name_of_Supplier or 'N/A',
                    'consultant': contract.name_of_consultant or 'N/A',
                    'start_date': contract.contract_start_date,
                    'end_date': contract.contract_end_date,
                    'status': status,
                    'detail_url': f"/project_actions/contract-profiling-goods-services/{contract.id}/",
                    'type': 'goods_services'
                }
                contracts.append(contract_data)
        
        context['contracts'] = contracts
        context['total_count'] = len(contracts)
        return render(request, 'project_actions/htmx/contract_selection_modal.html', context)
        
    except Exception as e:
        context['error'] = str(e)
        return render(request, 'project_actions/htmx/contract_selection_modal.html', context)

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

def htmx_load_investment_kpi(request):
    """HTMX endpoint for loading investment types and KPI descriptions based on monitoring type"""
    from PIU_Financial_mgt.models import KPI_For_Contract
    
    monitoring_type_id = request.GET.get('type_of_monitoring')
    
    if not monitoring_type_id:
        return HttpResponse('''
            <div class="col-md-6 mb-3">
                <label for="id_Type_of_Investment" class="form-label" style="color: #2c3e50 !important;">Type of Investment <span class="text-danger">*</span></label>
                <select name="Type_of_Investment" class="form-select" id="id_Type_of_Investment">
                    <option value="">Select Type of Monitoring first</option>
                </select>
            </div>
            <div class="col-md-6 mb-3">
                <label for="id_Kpi_description" class="form-label" style="color: #2c3e50 !important;">KPI Description <span class="text-danger">*</span></label>
                <select name="Kpi_description" class="form-select" id="id_Kpi_description">
                    <option value="">Select Type of Monitoring first</option>
                </select>
            </div>
        ''')
    
    try:
        # Get unique investment types and KPI descriptions for the selected monitoring type
        kpi_records = KPI_For_Contract.objects.filter(
            monitoring_type_id=monitoring_type_id
        ).values('type_of_investment', 'Kpi_description').distinct()
        
        investment_options = []
        kpi_options = []
        
        # Get unique investment types and KPI descriptions with their full records
        investment_types_seen = set()
        kpi_descriptions_seen = set()
        
        for record in kpi_records:
            if record['type_of_investment'] and record['type_of_investment'] not in investment_types_seen:
                investment_types_seen.add(record['type_of_investment'])
                investment_options.append({
                    'value': record['type_of_investment'],
                    'text': record['type_of_investment']
                })
            
            if record['Kpi_description'] and record['Kpi_description'] not in kpi_descriptions_seen:
                kpi_descriptions_seen.add(record['Kpi_description'])
                kpi_options.append({
                    'value': record['Kpi_description'],
                    'text': record['Kpi_description']
                })
        
        context = {
            'investment_options': investment_options,
            'kpi_options': kpi_options
        }
        
        return render(request, 'project_actions/htmx/investment_kpi_options.html', context)
        
    except Exception as e:
        return HttpResponse(f'''
            <div class="col-md-6 mb-3">
                <label for="id_Type_of_Investment" class="form-label" style="color: #2c3e50 !important;">Type of Investment <span class="text-danger">*</span></label>
                <select name="Type_of_Investment" class="form-select" id="id_Type_of_Investment">
                    <option value="">Error loading options</option>
                </select>
            </div>
            <div class="col-md-6 mb-3">
                <label for="id_Kpi_description" class="form-label" style="color: #2c3e50 !important;">KPI Description <span class="text-danger">*</span></label>
                <select name="Kpi_description" class="form-select" id="id_Kpi_description">
                    <option value="">Error loading options</option>
                </select>
            </div>
        ''')
