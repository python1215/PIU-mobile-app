from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse, HttpResponse, Http404
from django.contrib import messages
from django.conf import settings
from django.core.paginator import Paginator
from django.db.models import Q, Count, Sum, Avg
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils import timezone
from datetime import datetime
import openpyxl
from openpyxl.styles import Font, Alignment, PatternFill, Border, Side
from openpyxl.utils import get_column_letter

from .models import ESIA, PAP, GrievianceMonitoringLog, OHS_Monitoring, CommunityConsult_Engagement
from .forms import (ESIAForm, ESIAUpdateForm, PAPForm, PAPUpdateForm,
                    GrievianceMonitoringLogForm, GrievianceUpdateForm,
                    OHSMonitoringForm, OHSUpdateForm, CommunityEngagementForm)
from .filters import (ESIAFilter, PAPFilter, GrievianceMonitoringLogFilter,
                      OHSMonitoringFilter, CommunityEngagementFilter)
from setup.models import Districts, Settlement
from PIU_Financial_mgt.models import KPI_For_Contract
from PIU_Financial_mgt.models import ProjectOutCome, PDO, ProjectResult
from monitoring.models import Indicator_Description


# ======================== ESIA Views ========================
@login_required
def esia_list(request):
    """Enhanced ESIA list view with filtering and pagination"""
    esia_list = ESIA.objects.select_related('project_name',
                                            'type_of_investment',
                                            'loginUser').all()

    # Apply filters
    esia_filter = ESIAFilter(request.GET, queryset=esia_list)
    filtered_esia = esia_filter.qs

    # Pagination
    paginator = Paginator(filtered_esia, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    # Statistics
    stats = {
        'total_esia':
        esia_list.count(),
        'filtered_count':
        filtered_esia.count(),
        'avg_duration':
        esia_list.aggregate(Avg('project_duration'))['project_duration__avg']
        or 0,
        'total_communities':
        esia_list.aggregate(
            Sum('number_of_communities'))['number_of_communities__sum'] or 0,
    }

    context = {
        'page_obj': page_obj,
        'filter': esia_filter,
        'stats': stats,
        'is_filtered': bool(request.GET),
    }

    return render(request, 'social_and_env/esia/esia_list.html', context)


@login_required
def esia_detail(request, pk):
    """ESIA detail view"""
    esia = get_object_or_404(ESIA.objects.select_related(
        'project_name', 'type_of_investment', 'loginUser'),
                             pk=pk)

    context = {'esia': esia}
    return render(request, 'social_and_env/esia/esia_detail.html', context)


@login_required
def esia_add(request):
    """Add new ESIA record"""
    if request.method == 'POST':
        form = ESIAForm(request.POST)
        if form.is_valid():
            esia = form.save(commit=False)
            esia.loginUser = request.user
            esia.save()
            messages.success(request, 'ESIA record created successfully!')
            return redirect('esia_list')
        else:
            messages.error(request, 'Please correct the errors below.')
    else:
        form = ESIAForm()

    context = {'form': form, 'title': 'Add ESIA Record'}
    return render(request, 'social_and_env/esia/esia_form.html', context)


@login_required
def esia_edit(request, pk):
    """Edit ESIA record"""
    esia = get_object_or_404(ESIA, pk=pk)

    if request.method == 'POST':
        form = ESIAUpdateForm(request.POST, instance=esia)
        if form.is_valid():
            form.save()
            messages.success(request, 'ESIA record updated successfully!')
            return redirect('esia_detail', pk=esia.pk)
        else:
            messages.error(request, 'Please correct the errors below.')
    else:
        form = ESIAUpdateForm(instance=esia)

    context = {'form': form, 'esia': esia, 'title': 'Edit ESIA Record'}
    return render(request, 'social_and_env/esia/esia_form.html', context)


@login_required
@require_http_methods(["DELETE"])
def esia_delete(request, pk):
    """Delete ESIA record"""
    esia = get_object_or_404(ESIA, pk=pk)
    esia.delete()
    messages.success(request, 'ESIA record deleted successfully!')
    return JsonResponse({'success': True})


@login_required
def esia_export_excel(request):
    """Export ESIA data to Excel"""
    # Apply same filters as list view
    esia_list = ESIA.objects.select_related('project_name',
                                            'type_of_investment',
                                            'loginUser').all()

    esia_filter = ESIAFilter(request.GET, queryset=esia_list)
    filtered_esia = esia_filter.qs

    # Create workbook
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "ESIA Records"

    # Define headers
    headers = [
        'ESIA ID', 'Project Name', 'Investment Type',
        'Project Duration (Months)', 'Project Phase', 'Project Locations',
        'Number of Communities', 'ESIA Findings', 'Date Created', 'Created By'
    ]

    # Style headers
    header_font = Font(bold=True, color="FFFFFF")
    header_fill = PatternFill(start_color="366092",
                              end_color="366092",
                              fill_type="solid")
    header_alignment = Alignment(horizontal="center", vertical="center")

    for col, header in enumerate(headers, 1):
        cell = ws.cell(row=1, column=col, value=header)
        cell.font = header_font
        cell.fill = header_fill
        cell.alignment = header_alignment

    # Add data
    for row, esia in enumerate(filtered_esia, 2):
        ws.cell(row=row, column=1, value=esia.esiaID)
        ws.cell(row=row, column=2, value=str(esia.project_name))
        ws.cell(row=row, column=3, value=str(esia.type_of_investment))
        ws.cell(row=row, column=4, value=esia.project_duration)
        ws.cell(row=row, column=5, value=esia.project_phase)
        ws.cell(row=row, column=6, value=esia.project_locations)
        ws.cell(row=row, column=7, value=esia.number_of_communities)
        ws.cell(row=row, column=8, value=esia.esia_findings)
        ws.cell(row=row,
                column=9,
                value=esia.date_created.strftime('%Y-%m-%d %H:%M'))
        ws.cell(row=row, column=10, value=str(esia.loginUser))

    # Auto-adjust column widths
    for col in range(1, len(headers) + 1):
        ws.column_dimensions[get_column_letter(col)].width = 15

    # Create response
    response = HttpResponse(
        content_type=
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    response[
        'Content-Disposition'] = f'attachment; filename=esia_records_{datetime.now().strftime("%Y%m%d_%H%M")}.xlsx'

    wb.save(response)
    return response


# ======================== PAP Views ========================
@login_required
def pap_list(request):
    """Enhanced PAP list view with filtering and pagination - SQL Server compatible"""
    from django.db import connection
    from django.core.paginator import Paginator
    from django.db.models import Sum
    
    # Check if we're using SQL Server
    is_sql_server = True  # Force SQL Server mode for all queries
    
    try:
        if is_sql_server:
            # Try to import and use SQL Server utility function
            try:
                from .sql_server_pap_utils import get_pap_data_sql_server, convert_sql_results_to_pap_objects
                raw_results = get_pap_data_sql_server()
                pap_list = convert_sql_results_to_pap_objects(raw_results)
            except Exception as e:
                # If SQL Server utils fail, fall back to basic ORM
                
                pap_list = PAP.objects.all()
        else:
            # Use Django ORM for SQLite with proper null handling
            pap_list = PAP.objects.select_related(
                'project', 'type_of_investment', 'region', 'district',
                'pap_Current_Address', 'type_of_pap', 'pap_category',
                'vulnerability_category', 'type_of_impact', 'loginUser'
            ).all()

        # Apply filters (only for SQLite, SQL Server uses raw query)
        if not is_sql_server:
            pap_filter = PAPFilter(request.GET, queryset=pap_list)
            filtered_pap = pap_filter.qs
        else:
            # For SQL Server, we'll implement basic filtering manually
            filtered_pap = pap_list
            
            # Apply basic filters if provided
            project_filter = request.GET.get('project')
            if project_filter:
                filtered_pap = [pap for pap in filtered_pap if hasattr(pap, 'project') and hasattr(pap.project, 'project') and pap.project.project == project_filter]
                
            compensated_filter = request.GET.get('pap_compensated')
            if compensated_filter:
                filtered_pap = [pap for pap in filtered_pap if pap.pap_compensated == compensated_filter]
                
            sex_filter = request.GET.get('sex')
            if sex_filter:
                filtered_pap = [pap for pap in filtered_pap if pap.sex == sex_filter]

        # Pagination with configurable page size
        page_size = request.GET.get('page_size', 10)
        try:
            page_size = int(page_size)
            if page_size not in [10, 15, 25, 50, 100]:
                page_size = 10
        except (ValueError, TypeError):
            page_size = 10

        paginator = Paginator(filtered_pap, page_size)
        page_number = request.GET.get('page')
        page_obj = paginator.get_page(page_number)

        # Statistics
        if not is_sql_server:
            stats = {
                'total_pap': pap_list.count(),
                'filtered_count': filtered_pap.count(),
                'compensated': pap_list.filter(pap_compensated='Y').count(),
                'not_compensated': pap_list.filter(pap_compensated='N').count(),
                'total_compensation': pap_list.aggregate(Sum('amount'))['amount__sum'] or 0,
                'male_count': pap_list.filter(sex='M').count(),
                'female_count': pap_list.filter(sex='F').count(),
            }
        else:
            # Manual statistics for SQL Server
            total_compensation = sum(getattr(pap, 'amount', 0) or 0 for pap in pap_list)
            male_count = len([pap for pap in pap_list if getattr(pap, 'sex', '') == 'M'])
            female_count = len([pap for pap in pap_list if getattr(pap, 'sex', '') == 'F'])
            
            stats = {
                'total_pap': len(pap_list),
                'filtered_count': len(filtered_pap),
                'compensated': len([pap for pap in pap_list if getattr(pap, 'pap_compensated', '') == 'Y']),
                'not_compensated': len([pap for pap in pap_list if getattr(pap, 'pap_compensated', '') == 'N']),
                'total_compensation': total_compensation,
                'male_count': male_count,
                'female_count': female_count,
            }

        context = {
            'page_obj': page_obj,
            'filter': pap_filter if not is_sql_server else None,
            'stats': stats,
            'is_filtered': bool(request.GET),
            'is_sql_server': is_sql_server,
        }

        return render(request, 'social_and_env/pap/pap_list.html', context)
        
    except Exception as e:
        # Emergency fallback: Show empty list with error message
        from django.contrib import messages
        messages.error(request, f'Error loading PAP data: {str(e)}. Please check your database connection.')
        
        context = {
            'page_obj': None,
            'filter': None,
            'stats': {
                'total_pap': 0,
                'filtered_count': 0,
                'compensated': 0,
                'not_compensated': 0,
                'total_compensation': 0,
                'male_count': 0,
                'female_count': 0,
            },
            'is_filtered': False,
            'is_sql_server': is_sql_server,
            'error': str(e),
        }
        
        return render(request, 'social_and_env/pap/pap_list.html', context)


@login_required
def pap_detail(request, pk):
    """PAP detail view"""
    pap = get_object_or_404(PAP.objects.select_related(
        'project', 'type_of_investment', 'region', 'district',
        'pap_Current_Address', 'type_of_pap', 'pap_category',
        'vulnerability_category', 'type_of_impact', 'nature_of_compensation'),
                            pk=pk)

    context = {'pap': pap}
    return render(request, 'social_and_env/pap/pap_detail.html', context)


@login_required
def pap_add(request):
    """Add new PAP record"""
    if request.method == 'POST':
        form = PAPForm(request.POST)
        if form.is_valid():
            pap = form.save(commit=False)
            pap.loginUser = request.user
            pap.save()
            messages.success(request, 'PAP record created successfully!')
            return redirect('pap_list')
        else:
            messages.error(request, 'Please correct the errors below.')
    else:
        form = PAPForm()

    context = {'form': form, 'title': 'Add PAP Record'}
    return render(request, 'social_and_env/pap/pap_form.html', context)


@login_required
def pap_edit(request, pk):
    """Edit PAP record"""
    pap = get_object_or_404(PAP, pk=pk)

    if request.method == 'POST':
        form = PAPUpdateForm(request.POST, instance=pap)
        if form.is_valid():
            form.save()
            messages.success(request, 'PAP record updated successfully!')
            return redirect('pap_detail', pk=pap.pk)
        else:
            messages.error(request, 'Please correct the errors below.')
    else:
        form = PAPUpdateForm(instance=pap)

    context = {'form': form, 'pap': pap, 'title': 'Edit PAP Record'}
    return render(request, 'social_and_env/pap/pap_form.html', context)


@login_required
@require_http_methods(["DELETE"])
def pap_delete(request, pk):
    """Delete PAP record"""
    pap = get_object_or_404(PAP, pk=pk)
    pap.delete()
    messages.success(request, 'PAP record deleted successfully!')
    return JsonResponse({'success': True})


# ======================== Grievance Views ========================
@login_required
def grievance_list(request):
    """Enhanced Grievance list view with filtering and pagination"""
    grievance_list = GrievianceMonitoringLog.objects.select_related(
        'project', 'type_of_investment', 'decision_outcome',
        'loginUser').all()

    # Apply filters
    grievance_filter = GrievianceMonitoringLogFilter(request.GET,
                                                     queryset=grievance_list)
    filtered_grievance = grievance_filter.qs

    # Pagination with configurable page size
    page_size = request.GET.get('page_size', 10)
    try:
        page_size = int(page_size)
        if page_size not in [10, 15, 25, 50, 100]:
            page_size = 10
    except (ValueError, TypeError):
        page_size = 10
    
    paginator = Paginator(filtered_grievance, page_size)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    # Statistics
    stats = {
        'total_cases':
        grievance_list.count(),
        'filtered_count':
        filtered_grievance.count(),
        'satisfied':
        grievance_list.filter(
            was_complainant_satisfied_with_decision='Y').count(),
        'not_satisfied':
        grievance_list.filter(
            was_complainant_satisfied_with_decision='N').count(),
        'pending':
        grievance_list.filter(
            expected_decision_date__gt=timezone.now().date()).count(),
    }

    context = {
        'page_obj': page_obj,
        'filter': grievance_filter,
        'stats': stats,
        'is_filtered': bool(request.GET),
    }

    return render(request, 'social_and_env/grievance/grievance_list.html',
                  context)


@login_required
def grievance_detail(request, pk):
    """Grievance detail view"""
    grievance = get_object_or_404(
        GrievianceMonitoringLog.objects.select_related('project',
                                                       'type_of_investment',
                                                       'decision_outcome',
                                                       'loginUser'),
        pk=pk)

    context = {'grievance': grievance}
    return render(request, 'social_and_env/grievance/grievance_detail.html',
                  context)


@login_required
def grievance_add(request):
    """Add new Grievance record"""
    if request.method == 'POST':
        form = GrievianceMonitoringLogForm(request.POST)
        if form.is_valid():
            grievance = form.save(commit=False)
            grievance.loginUser = request.user
            grievance.save()
            messages.success(request, 'Grievance case created successfully!')
            return redirect('grievance_list')
        else:
            messages.error(request, 'Please correct the errors below.')
    else:
        form = GrievianceMonitoringLogForm()

    context = {'form': form, 'title': 'Add Grievance Case'}
    return render(request, 'social_and_env/grievance/grievance_form.html',
                  context)


@login_required
def grievance_edit(request, pk):
    """Edit Grievance record"""
    grievance = get_object_or_404(GrievianceMonitoringLog, pk=pk)

    if request.method == 'POST':
        form = GrievianceUpdateForm(request.POST, instance=grievance)
        if form.is_valid():
            form.save()
            messages.success(request, 'Grievance case updated successfully!')
            return redirect('grievance_detail', pk=grievance.pk)
        else:
            messages.error(request, 'Please correct the errors below.')
    else:
        form = GrievianceUpdateForm(instance=grievance)

    context = {
        'form': form,
        'grievance': grievance,
        'title': 'Edit Grievance Case'
    }
    return render(request, 'social_and_env/grievance/grievance_form.html',
                  context)


# ======================== OHS Views ========================
@login_required
def ohs_list(request):
    """Enhanced OHS list view with filtering and pagination - SQL Server compatible"""
    from django.db import connection
    
    # Force SQL Server mode - always use raw SQL queries  
    if True:  # Always use SQL Server compatible queries
        from .sql_server_pap_utils import get_sql_server_ohs_data
        ohs_data = get_sql_server_ohs_data()
        
        # Create mock objects for pagination and filtering
        class MockOHSQuerySet:
            def __init__(self, records):
                self.records = records
                self._count = len(records)
            
            def count(self):
                return self._count
            
            def __iter__(self):
                return iter(self.records)
            
            def __getitem__(self, key):
                return self.records[key]
            
            def __len__(self):
                return len(self.records)
        
        ohs_list = MockOHSQuerySet(ohs_data['ohs_records'])
        
        # Pagination with configurable page size
        page_size = request.GET.get('page_size', 10)
        try:
            page_size = int(page_size)
            if page_size not in [10, 15, 25, 50, 100]:
                page_size = 10
        except (ValueError, TypeError):
            page_size = 10
        
        paginator = Paginator(ohs_list.records, page_size)
        page_number = request.GET.get('page')
        page_obj = paginator.get_page(page_number)

        # Statistics from SQL Server data
        stats = {
            'total_reports': ohs_data['ohs_count'],
            'filtered_count': ohs_data['ohs_count'],
            'total_workers': sum(record.get('male', 0) + record.get('female', 0) for record in ohs_data['ohs_records']),
            'total_youth': sum(record.get('youth_male', 0) + record.get('youth_female', 0) for record in ohs_data['ohs_records']),
        }

        context = {
            'page_obj': page_obj,
            'filter': None,  # Filters not implemented for SQL Server mode yet
            'stats': stats,
            'is_filtered': False,
        }
        
    else:
        # SQLite - use Django ORM
        ohs_list = OHS_Monitoring.objects.select_related(
            'project', 'Type_of_Investment', 'year_of_report', 'quarter', 'region',
            'district', 'settlement', 'loginUser').all()

        # Apply filters
        ohs_filter = OHSMonitoringFilter(request.GET, queryset=ohs_list)
        filtered_ohs = ohs_filter.qs

        # Pagination with configurable page size
        page_size = request.GET.get('page_size', 10)
        try:
            page_size = int(page_size)
            if page_size not in [10, 15, 25, 50, 100]:
                page_size = 10
        except (ValueError, TypeError):
            page_size = 10
        
        paginator = Paginator(filtered_ohs, page_size)
        page_number = request.GET.get('page')
        page_obj = paginator.get_page(page_number)

        # Statistics
        stats = {
            'total_reports':
            ohs_list.count(),
            'filtered_count':
            filtered_ohs.count(),
            'total_workers':
            ohs_list.aggregate(total=Sum('male') + Sum('female'))['total'] or 0,
            'total_youth':
            ohs_list.aggregate(total=Sum('youth_male') +
                               Sum('youth_female'))['total'] or 0,
        }

        context = {
            'page_obj': page_obj,
            'filter': ohs_filter,
            'stats': stats,
            'is_filtered': bool(request.GET),
        }

    return render(request, 'social_and_env/ohs/ohs_list.html', context)


@login_required
def ohs_add(request):
    """Add new OHS record"""
    if request.method == 'POST':
        form = OHSMonitoringForm(request.POST, request.FILES)
        if form.is_valid():
            ohs = form.save(commit=False)
            ohs.loginUser = request.user
            ohs.save()
            messages.success(request,
                             'OHS monitoring record created successfully!')
            return redirect('ohs_list')
        else:
            messages.error(request, 'Please correct the errors below.')
    else:
        form = OHSMonitoringForm()

    context = {'form': form, 'title': 'Add OHS Monitoring Record'}
    return render(request, 'social_and_env/ohs/ohs_form.html', context)


@login_required
def ohs_detail(request, pk):
    """Detail view for OHS monitoring record - SQL Server compatible"""
    from django.db import connection
    
    # Force SQL Server mode - always use raw SQL queries
    if True:  # Always use SQL Server compatible queries
        from .sql_server_pap_utils import get_sql_server_ohs_record_by_id
        ohs_data = get_sql_server_ohs_record_by_id(pk)
        
        if not ohs_data:
            from django.http import Http404
            raise Http404("OHS record not found")
        
        # Create mock object for template compatibility
        class MockOHSRecord:
            def __init__(self, data):
                for key, value in data.items():
                    setattr(self, key, value)
                self.pk = data.get('ohs_Id', pk)
        
        ohs = MockOHSRecord(ohs_data)
        
        context = {
            'ohs': ohs,
            'title': f'OHS Monitoring - {ohs_data.get("project_name", "Unknown")}'
        }
        
    else:
        # SQLite - use Django ORM
        ohs = get_object_or_404(OHS_Monitoring, pk=pk)
        context = {
            'ohs': ohs,
            'title': f'OHS Monitoring - {ohs.project.project if ohs.project else "Unknown"}'
        }
    
    return render(request, 'social_and_env/ohs/ohs_detail.html', context)


@login_required
def ohs_edit(request, pk):
    """Edit OHS monitoring record - SQL Server compatible"""
    from django.db import connection
    
    # Force SQL Server mode - always use raw SQL queries
    if True:  # Always use SQL Server compatible queries
        # For SQL Server, editing is complex since it would require raw SQL updates
        # For now, redirect to add new record with a message
        messages.warning(request, 'OHS record editing is not supported in offline SQL Server mode. Please add a new record.')
        return redirect('ohs_add')
    else:
        # SQLite - use Django ORM
        ohs = get_object_or_404(OHS_Monitoring, pk=pk)
        
        if request.method == 'POST':
            form = OHSMonitoringForm(request.POST, request.FILES, instance=ohs)
            if form.is_valid():
                form.save()
                messages.success(request, 'OHS monitoring record updated successfully!')
                return redirect('ohs_detail', pk=ohs.pk)
            else:
                messages.error(request, 'Please correct the errors below.')
        else:
            form = OHSMonitoringForm(instance=ohs)

        context = {
            'form': form,
            'ohs': ohs,
            'title': f'Edit OHS Monitoring - {ohs.project.project if ohs.project else "Unknown"}'
        }
        return render(request, 'social_and_env/ohs/ohs_form.html', context)


# ======================== Community Engagement Views ========================
@login_required
def community_list(request):
    """Enhanced Community Engagement list view with filtering and pagination"""
    community_list = CommunityConsult_Engagement.objects.select_related(
        'project_name', 'year', 'stake_holder_engagement_Types',
        'loginUser').all()

    # Apply filters
    community_filter = CommunityEngagementFilter(request.GET,
                                                 queryset=community_list)
    filtered_community = community_filter.qs

    # Pagination with configurable page size
    page_size = request.GET.get('page_size', 10)
    try:
        page_size = int(page_size)
        if page_size not in [10, 15, 25, 50, 100]:
            page_size = 10
    except (ValueError, TypeError):
        page_size = 10
    
    paginator = Paginator(filtered_community, page_size)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    # Statistics
    stats = {
        'total_engagements':
        community_list.count(),
        'filtered_count':
        filtered_community.count(),
        'total_participants':
        community_list.aggregate(
            Sum('total_participants'))['total_participants__sum'] or 0,
        'total_male':
        community_list.aggregate(Sum('male'))['male__sum'] or 0,
        'total_female':
        community_list.aggregate(Sum('female'))['female__sum'] or 0,
    }

    context = {
        'page_obj': page_obj,
        'filter': community_filter,
        'stats': stats,
        'is_filtered': bool(request.GET),
    }

    return render(request, 'social_and_env/community/community_list.html',
                  context)


@login_required
def community_add(request):
    """Add new Community Engagement record"""
    if request.method == 'POST':
        form = CommunityEngagementForm(request.POST, request.FILES)
        if form.is_valid():
            engagement = form.save(commit=False)
            engagement.loginUser = request.user
            engagement.save()
            messages.success(
                request, 'Community engagement record created successfully!')
            return redirect('community_list')
        else:
            messages.error(request, 'Please correct the errors below.')
    else:
        form = CommunityEngagementForm()

    context = {'form': form, 'title': 'Add Community Engagement Record'}
    return render(request, 'social_and_env/community/community_form.html',
                  context)


@login_required
def community_detail(request, pk):
    """Community Engagement detail view"""
    # Check if we're in SQL Server mode
    if hasattr(settings, 'USE_SQL_SERVER') and settings.USE_SQL_SERVER:
        # Use raw SQL for SQL Server compatibility
        from django.db import connection
        
        with connection.cursor() as cursor:
            # Try different table name variations for SQL Server
            tables_to_try = [
                '[piuprod].[dbo].[social_and_env_communityconsult_engagement]',
                '[piuprod3].[dbo].[social_and_env_communityconsult_engagement]',
                'social_and_env_communityconsult_engagement'
            ]
            
            engagement = None
            for table_name in tables_to_try:
                try:
                    cursor.execute(f"""
                        SELECT * FROM {table_name} 
                        WHERE reference_number = %s
                    """, [pk])
                    
                    row = cursor.fetchone()
                    if row:
                        columns = [col[0] for col in cursor.description]
                        engagement_data = dict(zip(columns, row))
                        
                        # Create a mock object with the data
                        class MockEngagement:
                            def __init__(self, data):
                                for key, value in data.items():
                                    setattr(self, key, value)
                                # Set default values for missing fields
                                self.pk = pk
                                self.project_name = getattr(self, 'project_name', 'Unknown')
                                self.year = getattr(self, 'year', 'Unknown')
                                self.stake_holder_engagement_Types = getattr(self, 'stake_holder_engagement_Types', 'Unknown')
                        
                        engagement = MockEngagement(engagement_data)
                        break
                except Exception as e:
                    continue
            
            if not engagement:
                raise Http404("Community engagement not found")
    else:
        # Use Django ORM for SQLite
        engagement = get_object_or_404(CommunityConsult_Engagement.objects.select_related(
            'project_name', 'year', 'stake_holder_engagement_Types', 'loginUser'),
                                     pk=pk)
    
    context = {'engagement': engagement}
    return render(request, 'social_and_env/community/community_detail.html', context)


@login_required
def community_edit(request, pk):
    """Edit Community Engagement record"""
    # Check if we're in SQL Server mode
    if hasattr(settings, 'USE_SQL_SERVER') and settings.USE_SQL_SERVER:
        # For SQL Server mode, show informational message
        messages.info(request, 'Editing is not available in SQL Server mode. Please use the Django admin interface or switch to SQLite mode.')
        return redirect('community_detail', pk=pk)
    else:
        # Use Django ORM for SQLite
        engagement = get_object_or_404(CommunityConsult_Engagement, pk=pk)
        
        if request.method == 'POST':
            form = CommunityEngagementForm(request.POST, request.FILES, instance=engagement)
            if form.is_valid():
                form.save()
                messages.success(request, 'Community engagement record updated successfully!')
                return redirect('community_detail', pk=pk)
            else:
                messages.error(request, 'Please correct the errors below.')
        else:
            form = CommunityEngagementForm(instance=engagement)
        
        context = {
            'form': form,
            'engagement': engagement,
            'title': 'Edit Community Engagement Record'
        }
        return render(request, 'social_and_env/community/community_form.html', context)


# ======================== HTMX Dynamic Loading Views ========================
@login_required
def load_investment_types_esia(request):
    """Load investment types for ESIA based on project selection"""
    project_id = request.GET.get('project_name')
    investment_types = KPI_For_Contract.objects.none()

    if project_id:
        investment_types = KPI_For_Contract.objects.filter(
            project_id=project_id, monitoring_type_id='ESS').distinct()

    return render(request, 'social_and_env/partials/investment_types.html',
                  {'investment_types': investment_types})


@login_required
def load_investment_types_pap(request):
    """Load investment types for PAP based on project selection"""
    project_id = request.GET.get('project')
    investment_types = KPI_For_Contract.objects.none()

    if project_id:
        investment_types = KPI_For_Contract.objects.filter(
            project_id=project_id).distinct()

    return render(request, 'social_and_env/partials/investment_types.html',
                  {'investment_types': investment_types})


@login_required
def load_districts(request):
    """Load districts based on region selection"""
    region_id = request.GET.get('region')
    districts = Districts.objects.none()

    if region_id:
        districts = Districts.objects.filter(region_id=region_id)

    return render(request, 'social_and_env/partials/districts.html',
                  {'districts': districts})


@login_required
def load_settlements(request):
    """Load settlements based on district selection"""
    district_id = request.GET.get('district')
    settlements = Settlement.objects.none()

    if district_id:
        settlements = Settlement.objects.filter(district_id=district_id)

    return render(request, 'social_and_env/partials/settlements.html',
                  {'settlements': settlements})


@login_required
def load_investment_types_grievance(request):
    """Load investment types for Grievance based on project selection"""
    project_id = request.GET.get('project')
    investment_types = KPI_For_Contract.objects.none()

    if project_id:
        investment_types = KPI_For_Contract.objects.filter(
            project_id=project_id).distinct()

    return render(request, 'social_and_env/partials/investment_types.html',
                  {'investment_types': investment_types})


@login_required
def load_investment_types_ohs(request):
    """Load investment types for OHS based on project selection"""
    project_id = request.GET.get('project')
    investment_types = KPI_For_Contract.objects.none()

    if project_id:
        investment_types = KPI_For_Contract.objects.filter(
            project_id=project_id).distinct()

    return render(request, 'social_and_env/partials/investment_types.html',
                  {'investment_types': investment_types})


@login_required
def load_districts_ohs(request):
    """Load districts for OHS based on region selection"""
    region_id = request.GET.get('region')
    districts = Districts.objects.none()

    if region_id:
        districts = Districts.objects.filter(region_id=region_id)

    return render(request, 'social_and_env/partials/districts.html',
                  {'districts': districts})


@login_required
def load_settlements_ohs(request):
    """Load settlements for OHS based on district selection"""
    district_id = request.GET.get('district')
    settlements = Settlement.objects.none()

    if district_id:
        settlements = Settlement.objects.filter(district_id=district_id)

    return render(request, 'social_and_env/partials/settlements.html',
                  {'settlements': settlements})


# ======================== Dashboard View ========================
@login_required
def social_env_dashboard(request):
    """Dashboard with overview statistics"""
    context = {
        'esia_count':
        ESIA.objects.count(),
        'pap_count':
        PAP.objects.count(),
        'grievance_count':
        GrievianceMonitoringLog.objects.count(),
        'ohs_count':
        OHS_Monitoring.objects.count(),
        'community_count':
        CommunityConsult_Engagement.objects.count(),

        # Recent records
        'recent_esia':
        ESIA.objects.select_related('project_name').order_by('-date_created')
        [:5],
        'recent_pap':
        PAP.objects.select_related('project').order_by('-date_created')[:5],
        'recent_grievances':
        GrievianceMonitoringLog.objects.select_related('project').order_by(
            '-date_created')[:5],

        # Statistics
        'total_compensation':
        PAP.objects.aggregate(Sum('amount'))['amount__sum'] or 0,
        'compensated_pap':
        PAP.objects.filter(pap_compensated='Y').count(),
        'pending_grievances':
        GrievianceMonitoringLog.objects.filter(
            expected_decision_date__gt=timezone.now().date()).count(),
    }

    return render(request, 'social_and_env/s_and_e_dashboard.html', context)
