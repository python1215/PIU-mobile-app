from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse, HttpResponse, Http404
from django.contrib import messages
from django.conf import settings
from django.core.paginator import Paginator
from django.db.models import Q, Count, Sum, Avg
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils.decorators import method_decorator
from django.views.decorators.cache import never_cache
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
from utils.database_utils import (is_sql_server_mode, get_cascading_dropdown_data, 
                                 safe_model_save, safe_model_update, get_model_data)


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
    from utils.database_utils import is_sql_server_mode, get_sql_server_table_name
    
    # Check if we're in SQL Server mode
    is_sql_server = is_sql_server_mode()
    
    try:
        if is_sql_server:
            # Use SQL Server with raw queries
            table_name = get_sql_server_table_name('[social_and_env_pap]')
            
            # Get total count
            count_query = f"SELECT COUNT(*) FROM {table_name}"
            with connection.cursor() as cursor:
                cursor.execute(count_query)
                total_count = cursor.fetchone()[0]
            
            # Get PAP data with pagination
            page_size = request.GET.get('page_size', 10)
            try:
                page_size = int(page_size)
                if page_size not in [10, 15, 25, 50, 100]:
                    page_size = 10
            except (ValueError, TypeError):
                page_size = 10
            
            page_number = request.GET.get('page', 1)
            try:
                page_number = int(page_number)
            except (ValueError, TypeError):
                page_number = 1
            
            offset = (page_number - 1) * page_size
            
            # Main query with pagination
            pap_query = f"""
                SELECT 
                    ISNULL([pap_identification_number], '') as pap_identification_number,
                    ISNULL([name], '') as name,
                    ISNULL([sex], '') as sex,
                    ISNULL([amount], 0) as amount,
                    ISNULL([pap_compensated], 'N') as pap_compensated,
                    ISNULL([project_id], '') as project_id,
                    ISNULL([type_of_investment_id], '') as type_of_investment_id,
                    ISNULL([region_code_id], '') as region_code_id,
                    ISNULL([district_code_id], '') as district_code_id
                FROM {table_name}
                ORDER BY [pap_identification_number]
                OFFSET ? ROWS FETCH NEXT ? ROWS ONLY
            """
            
            with connection.cursor() as cursor:
                cursor.execute(pap_query, [offset, page_size])
                pap_records = cursor.fetchall()
            
            # Create mock objects for template compatibility
            class MockPAP:
                def __init__(self, row):
                    self.pap_identification_number = row[0] or ''
                    self.name = row[1] or ''
                    self.sex = row[2] or ''
                    self.amount = row[3] or 0
                    self.pap_compensated = row[4] or 'N'
                    self.project_id = row[5] or ''
                    self.type_of_investment_id = row[6] or ''
                    self.region_code_id = row[7] or ''
                    self.district_code_id = row[8] or ''
            
            # Convert to mock objects
            pap_list = [MockPAP(row) for row in pap_records]
            
            # Calculate statistics
            stats_query = f"""
                SELECT 
                    COUNT(*) as total_pap,
                    SUM(CASE WHEN [pap_compensated] = 'Y' THEN 1 ELSE 0 END) as compensated,
                    SUM(CASE WHEN [pap_compensated] = 'N' THEN 1 ELSE 0 END) as not_compensated,
                    SUM(ISNULL([amount], 0)) as total_compensation,
                    SUM(CASE WHEN [sex] = 'M' THEN 1 ELSE 0 END) as male_count,
                    SUM(CASE WHEN [sex] = 'F' THEN 1 ELSE 0 END) as female_count
                FROM {table_name}
            """
            
            with connection.cursor() as cursor:
                cursor.execute(stats_query)
                stats_row = cursor.fetchone()
                
                stats = {
                    'total_pap': stats_row[0] or 0,
                    'filtered_count': total_count,
                    'compensated': stats_row[1] or 0,
                    'not_compensated': stats_row[2] or 0,
                    'total_compensation': stats_row[3] or 0,
                    'male_count': stats_row[4] or 0,
                    'female_count': stats_row[5] or 0,
                }
            
            # Create mock paginator
            from math import ceil
            total_pages = ceil(total_count / page_size)
            
            class MockPaginator:
                def __init__(self, count, per_page):
                    self.count = count
                    self.per_page = per_page
                    self.num_pages = ceil(count / per_page)
                
                def get_page(self, page_number):
                    return MockPage(page_number, self, pap_list)
            
            class MockPage:
                def __init__(self, number, paginator, object_list):
                    self.number = number
                    self.paginator = paginator
                    self.object_list = object_list
                    self.has_previous = number > 1
                    self.has_next = number < paginator.num_pages
                    self.previous_page_number = number - 1 if self.has_previous else None
                    self.next_page_number = number + 1 if self.has_next else None
            
            page_obj = MockPaginator(total_count, page_size).get_page(page_number)
            
            context = {
                'page_obj': page_obj,
                'filter': None,  # No filter for SQL Server mode
                'stats': stats,
                'is_filtered': False,
                'is_sql_server': True,
            }
            
            return render(request, 'social_and_env/pap/pap_list.html', context)
        
        else:
            # Use Django ORM for SQLite
            pap_list = PAP.objects.select_related(
                'project', 'type_of_investment', 'region', 'district',
                'pap_Current_Address', 'type_of_pap', 'pap_category',
                'vulnerability_category', 'type_of_impact', 'loginUser'
            ).all()

            # Apply filters using Django ORM
            pap_filter = PAPFilter(request.GET, queryset=pap_list)
            filtered_pap = pap_filter.qs

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

            # Statistics using Django ORM
            stats = {
                'total_pap': pap_list.count(),
                'filtered_count': filtered_pap.count(),
                'compensated': pap_list.filter(pap_compensated='Y').count(),
                'not_compensated': pap_list.filter(pap_compensated='N').count(),
                'total_compensation': pap_list.aggregate(Sum('amount'))['amount__sum'] or 0,
                'male_count': pap_list.filter(sex='M').count(),
                'female_count': pap_list.filter(sex='F').count(),
            }

            context = {
                'page_obj': page_obj,
                'filter': pap_filter,
                'stats': stats,
                'is_filtered': bool(request.GET),
                'is_sql_server': False,
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
                            pap_identification_number=pk)

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
    pap = get_object_or_404(PAP, pap_identification_number=pk)
    
    if request.method == 'POST':
        form = PAPUpdateForm(request.POST, instance=pap)
        if form.is_valid():
            form.save()
            messages.success(request, 'PAP record updated successfully!')
            return redirect('pap_detail', pk=pap.pap_identification_number)
        else:
            messages.error(request, 'Please correct the errors below.')
    else:
        form = PAPUpdateForm(instance=pap)
    
    context = {'form': form, 'pap': pap, 'title': 'Edit PAP Record'}
    return render(request, 'social_and_env/pap/pap_form.html', context)


@login_required
def pap_delete(request, pk):
    """Delete PAP record"""
    pap = get_object_or_404(PAP, pap_identification_number=pk)
    
    if request.method == 'POST':
        pap.delete()
        messages.success(request, 'PAP record deleted successfully!')
        return redirect('pap_list')
    
    context = {
        'object': pap,
        'object_name': f'PAP Record - {pap.pap_name}',
        'cancel_url': 'pap_detail',
        'cancel_pk': pk,
    }
    return render(request, 'social_and_env/confirm_delete.html', context)


@login_required
def export_pap_excel(request):
    """Export PAP data to Excel format"""
    import openpyxl
    from django.http import HttpResponse
    from openpyxl.styles import Font, Alignment
    
    # Create workbook and worksheet
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "PAP Data Export"
    
    # Headers
    headers = [
        'PAP ID', 'Project', 'Year', 'Quarter', 'Region', 'District', 'Settlement',
        'Name', 'Location', 'Compensation Amount', 'Plot Reference', 'Completion Status',
        'Date Created', 'Created By'
    ]
    
    for col, header in enumerate(headers, 1):
        cell = ws.cell(row=1, column=col, value=header)
        cell.font = Font(bold=True)
        cell.alignment = Alignment(horizontal='center')
    
    # Get PAP data
    if is_sql_server_mode():
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT * FROM [piuprod3].[dbo].[social_and_env_pap]
                ORDER BY date_created DESC
            """)
            pap_data = cursor.fetchall()
            
            for row_num, pap in enumerate(pap_data, 2):
                ws.cell(row=row_num, column=1, value=pap[0])  # pap_Id
                ws.cell(row=row_num, column=2, value=pap[1])  # project_id
                ws.cell(row=row_num, column=3, value=pap[2])  # year_id
                ws.cell(row=row_num, column=4, value=pap[3])  # quarter_id
                ws.cell(row=row_num, column=5, value=pap[4])  # region_id
                ws.cell(row=row_num, column=6, value=pap[5])  # district_id
                ws.cell(row=row_num, column=7, value=pap[6])  # settlement_id
                ws.cell(row=row_num, column=8, value=pap[7])  # name
                ws.cell(row=row_num, column=9, value=pap[8])  # location
                ws.cell(row=row_num, column=10, value=pap[9])  # compensation_amount
                ws.cell(row=row_num, column=11, value=pap[10])  # plot_reference
                ws.cell(row=row_num, column=12, value=pap[11])  # completion_status
                ws.cell(row=row_num, column=13, value=pap[12])  # date_created
                ws.cell(row=row_num, column=14, value=pap[13])  # loginUser_id
    else:
        pap_list = PAP.objects.select_related('project', 'year', 'quarter', 'region', 'district', 'settlement').all()
        
        for row_num, pap in enumerate(pap_list, 2):
            ws.cell(row=row_num, column=1, value=pap.pap_Id)
            ws.cell(row=row_num, column=2, value=str(pap.project) if pap.project else '')
            ws.cell(row=row_num, column=3, value=str(pap.year) if pap.year else '')
            ws.cell(row=row_num, column=4, value=str(pap.quarter) if pap.quarter else '')
            ws.cell(row=row_num, column=5, value=str(pap.region) if pap.region else '')
            ws.cell(row=row_num, column=6, value=str(pap.district) if pap.district else '')
            ws.cell(row=row_num, column=7, value=str(pap.settlement) if pap.settlement else '')
            ws.cell(row=row_num, column=8, value=pap.name or '')
            ws.cell(row=row_num, column=9, value=pap.location or '')
            ws.cell(row=row_num, column=10, value=pap.compensation_amount or '')
            ws.cell(row=row_num, column=11, value=pap.plot_reference or '')
            ws.cell(row=row_num, column=12, value=pap.completion_status or '')
            ws.cell(row=row_num, column=13, value=pap.date_created.strftime('%Y-%m-%d') if pap.date_created else '')
            ws.cell(row=row_num, column=14, value=str(pap.loginUser) if pap.loginUser else '')
    
    # Create response
    response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    response['Content-Disposition'] = 'attachment; filename="pap_data_export.xlsx"'
    
    wb.save(response)
    return response


@login_required
def pap_edit(request, pk):
    """Edit PAP record - Dual Mode Support"""
    from utils.database_utils import is_sql_server_mode
    from django.db import connection
    
    if is_sql_server_mode():
        # SQL Server mode with full CRUD support
        if request.method == 'POST':
            try:
                with connection.cursor() as cursor:
                    # Update PAP record in SQL Server
                    cursor.execute("""
                        UPDATE [piuprod3].[dbo].[social_and_env_pap]
                        SET name = %s,
                            location = %s,
                            compensation_amount = %s,
                            completion_status = %s,
                            date_updated = GETDATE()
                        WHERE pap_identification_number = %s
                    """, [
                        request.POST.get('name'),
                        request.POST.get('location'),
                        request.POST.get('compensation_amount'),
                        request.POST.get('completion_status'),
                        pk
                    ])
                    
                messages.success(request, 'PAP record updated successfully!')
                return redirect('pap_detail', pk=pk)
                
            except Exception as e:
                messages.error(request, f'Error updating record: {str(e)}')
        
        # Get current record for form display
        try:
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT * FROM [piuprod3].[dbo].[social_and_env_pap]
                    WHERE pap_identification_number = %s
                """, [pk])
                
                row = cursor.fetchone()
                if not row:
                    messages.error(request, 'PAP record not found.')
                    return redirect('pap_list')
                
                columns = [col[0] for col in cursor.description]
                pap_data = dict(zip(columns, row))
                
                context = {
                    'pap_data': pap_data,
                    'sql_server_mode': True,
                    'title': 'Edit PAP Record'
                }
                return render(request, 'social_and_env/pap/pap_sql_form.html', context)
                
        except Exception as e:
            messages.error(request, f'Error accessing data: {str(e)}')
            return redirect('pap_list')
    else:
        # SQLite mode using Django ORM
        pap = get_object_or_404(PAP, pk=pk)

        if request.method == 'POST':
            form = PAPUpdateForm(request.POST, instance=pap)
            if form.is_valid():
                form.save()
                messages.success(request, 'PAP record updated successfully!')
                return redirect('pap_detail', pk=pap.pap_identification_number)
            else:
                messages.error(request, 'Please correct the errors below.')
        else:
            form = PAPUpdateForm(instance=pap)

        context = {'form': form, 'pap': pap, 'title': 'Edit PAP Record', 'sql_server_mode': False}
        return render(request, 'social_and_env/pap/pap_form.html', context)


@login_required
def pap_delete(request, pk):
    """Delete PAP record - Dual Mode Support"""
    from utils.database_utils import is_sql_server_mode
    from django.db import connection
    
    if is_sql_server_mode():
        # SQL Server mode with full CRUD support
        if request.method == 'POST':
            try:
                with connection.cursor() as cursor:
                    # Delete PAP record from SQL Server
                    cursor.execute("""
                        DELETE FROM [piuprod3].[dbo].[social_and_env_pap]
                        WHERE pap_identification_number = %s
                    """, [pk])
                    
                messages.success(request, 'PAP record deleted successfully!')
                return redirect('pap_list')
                
            except Exception as e:
                messages.error(request, f'Error deleting record: {str(e)}')
                return redirect('pap_detail', pk=pk)
        
        # Get record for confirmation display
        try:
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT pap_identification_number, name FROM [piuprod3].[dbo].[social_and_env_pap]
                    WHERE pap_identification_number = %s
                """, [pk])
                
                row = cursor.fetchone()
                if not row:
                    messages.error(request, 'PAP record not found.')
                    return redirect('pap_list')
                
                context = {
                    'object_name': f'PAP Record - {row[0]} ({row[1]})',
                    'cancel_url': 'pap_detail',
                    'cancel_pk': pk,
                    'sql_server_mode': True
                }
                return render(request, 'social_and_env/confirm_delete.html', context)
                
        except Exception as e:
            messages.error(request, f'Error accessing data: {str(e)}')
            return redirect('pap_list')
    else:
        # SQLite mode using Django ORM
        if request.method == 'POST':
            pap = get_object_or_404(PAP, pk=pk)
            pap.delete()
            messages.success(request, 'PAP record deleted successfully!')
            return redirect('pap_list')
        else:
            pap = get_object_or_404(PAP, pk=pk)
            context = {
                'object': pap,
                'object_name': f'PAP Record - {pap.pap_identification_number} ({pap.name})',
                'cancel_url': 'pap_detail',
                'cancel_pk': pk,
                'sql_server_mode': False
            }
            return render(request, 'social_and_env/confirm_delete.html', context)


# ======================== Grievance Views ========================
@login_required
def grievance_list(request):
    """Enhanced Grievance list view with filtering and pagination - Dual Mode Support"""
    from utils.database_utils import is_sql_server_mode
    
    if is_sql_server_mode():
        # Use raw SQL for SQL Server mode
        from django.db import connection
        
        try:
            with connection.cursor() as cursor:
                # Get all grievance records from SQL Server
                cursor.execute("""
                    SELECT * FROM [piuprod3].[dbo].[social_and_env_grieviancemonitoringlog]
                    ORDER BY date_claim_recieved DESC
                """)
                
                rows = cursor.fetchall()
                columns = [col[0] for col in cursor.description]
                
                # Create mock objects for template compatibility
                class MockGrievance:
                    def __init__(self, data_dict):
                        for key, value in data_dict.items():
                            setattr(self, key, value)
                        # Set pk to case_no for URL generation
                        self.pk = self.case_no if hasattr(self, 'case_no') else str(data_dict.get('case_no', ''))
                
                grievance_list = []
                for row in rows:
                    data_dict = dict(zip(columns, row))
                    grievance_list.append(MockGrievance(data_dict))
                
                # Basic pagination for SQL Server mode
                page_size = request.GET.get('page_size', 10)
                try:
                    page_size = int(page_size)
                    if page_size not in [10, 15, 25, 50, 100]:
                        page_size = 10
                except (ValueError, TypeError):
                    page_size = 10
                
                paginator = Paginator(grievance_list, page_size)
                page_number = request.GET.get('page')
                page_obj = paginator.get_page(page_number)
                
                # Basic statistics for SQL Server mode
                stats = {
                    'total_cases': len(grievance_list),
                    'filtered_count': len(grievance_list),
                    'satisfied': len([g for g in grievance_list if getattr(g, 'was_complainant_satisfied_with_decision', '') == 'Y']),
                    'not_satisfied': len([g for g in grievance_list if getattr(g, 'was_complainant_satisfied_with_decision', '') == 'N']),
                    'pending': 0,  # Simplified for SQL Server mode
                }
                
                context = {
                    'page_obj': page_obj,
                    'stats': stats,
                    'is_filtered': False,
                    'sql_server_mode': True,
                }
                
                return render(request, 'social_and_env/grievance/grievance_list.html', context)
                
        except Exception as e:
            messages.error(request, f'Error accessing SQL Server data: {str(e)}')
            # Fall back to empty list
            context = {
                'page_obj': Paginator([], 10).get_page(1),
                'stats': {'total_cases': 0, 'filtered_count': 0, 'satisfied': 0, 'not_satisfied': 0, 'pending': 0},
                'is_filtered': False,
                'sql_server_mode': True,
            }
            return render(request, 'social_and_env/grievance/grievance_list.html', context)
    else:
        # Use Django ORM for SQLite mode
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
            'sql_server_mode': False,
        }

        return render(request, 'social_and_env/grievance/grievance_list.html',
                      context)


@login_required
def grievance_detail(request, pk):
    """Grievance detail view - Dual Mode Support"""
    from utils.database_utils import is_sql_server_mode
    
    if is_sql_server_mode():
        # Use raw SQL for SQL Server mode
        from django.db import connection
        
        try:
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT * FROM [piuprod3].[dbo].[social_and_env_grieviancemonitoringlog]
                    WHERE case_no = %s
                """, [pk])
                
                row = cursor.fetchone()
                if not row:
                    messages.error(request, 'Grievance case not found.')
                    return redirect('grievance_list')
                
                columns = [col[0] for col in cursor.description]
                grievance_data = dict(zip(columns, row))
                
                # Create mock object for template compatibility
                class MockGrievance:
                    def __init__(self, data_dict):
                        for key, value in data_dict.items():
                            setattr(self, key, value)
                        self.pk = self.case_no if hasattr(self, 'case_no') else pk
                
                grievance = MockGrievance(grievance_data)
                
                context = {
                    'grievance': grievance,
                    'sql_server_mode': True
                }
                return render(request, 'social_and_env/grievance/grievance_detail.html', context)
                
        except Exception as e:
            messages.error(request, f'Error accessing SQL Server data: {str(e)}')
            return redirect('grievance_list')
    else:
        # Use Django ORM for SQLite mode
        grievance = get_object_or_404(
            GrievianceMonitoringLog.objects.select_related('project',
                                                           'type_of_investment',
                                                           'decision_outcome',
                                                           'loginUser'),
            pk=pk)

        context = {
            'grievance': grievance,
            'sql_server_mode': False
        }
        return render(request, 'social_and_env/grievance/grievance_detail.html',
                      context)


@login_required
def grievance_add(request):
    """Add new Grievance record - Dual Mode Support"""
    from utils.database_utils import is_sql_server_mode
    from django.db import connection
    import uuid
    
    if is_sql_server_mode():
        # SQL Server mode with full CRUD support
        if request.method == 'POST':
            try:
                with connection.cursor() as cursor:
                    # Generate unique case number
                    case_no = f"GR-{uuid.uuid4().hex[:8].upper()}"
                    
                    # Insert new grievance record into SQL Server
                    cursor.execute("""
                        INSERT INTO [piuprod3].[dbo].[social_and_env_grieviancemonitoringlog]
                        (case_no, name_of_complainant, sex, phone_number, location,
                         complaint_category, description_of_complaint, responsible_unit_or_department,
                         date_claim_recieved, expected_decision_date, was_complainant_satisfied_with_decision,
                         outcome_of_grievance, date_created, loginUser_id)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, GETDATE(), %s)
                    """, [
                        case_no,
                        request.POST.get('name_of_complainant'),
                        request.POST.get('sex'),
                        request.POST.get('phone_number'),
                        request.POST.get('location'),
                        request.POST.get('complaint_category'),
                        request.POST.get('description_of_complaint'),
                        request.POST.get('responsible_unit_or_department'),
                        request.POST.get('date_claim_recieved'),
                        request.POST.get('expected_decision_date'),
                        request.POST.get('was_complainant_satisfied_with_decision'),
                        request.POST.get('outcome_of_grievance'),
                        request.user.id
                    ])
                    
                messages.success(request, f'Grievance case {case_no} created successfully!')
                return redirect('grievance_list')
                
            except Exception as e:
                messages.error(request, f'Error creating record: {str(e)}')
        
        context = {
            'sql_server_mode': True,
            'title': 'Add Grievance Case'
        }
        return render(request, 'social_and_env/grievance/grievance_sql_form.html', context)
    else:
        # SQLite mode using Django ORM
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

        context = {'form': form, 'title': 'Add Grievance Case', 'sql_server_mode': False}
        return render(request, 'social_and_env/grievance/grievance_form.html', context)


@login_required
def grievance_edit(request, pk):
    """Edit Grievance record - Dual Mode Support"""
    from utils.database_utils import is_sql_server_mode
    from django.db import connection
    
    if is_sql_server_mode():
        # SQL Server mode with full CRUD support
        if request.method == 'POST':
            try:
                with connection.cursor() as cursor:
                    # Update grievance record in SQL Server
                    cursor.execute("""
                        UPDATE [piuprod3].[dbo].[social_and_env_grieviancemonitoringlog]
                        SET name_of_complainant = %s,
                            sex = %s,
                            phone_number = %s,
                            location = %s,
                            complaint_category = %s,
                            description_of_complaint = %s,
                            responsible_unit_or_department = %s,
                            expected_decision_date = %s,
                            was_complainant_satisfied_with_decision = %s,
                            outcome_of_grievance = %s,
                            date_updated = GETDATE()
                        WHERE case_no = %s
                    """, [
                        request.POST.get('name_of_complainant'),
                        request.POST.get('sex'),
                        request.POST.get('phone_number'),
                        request.POST.get('location'),
                        request.POST.get('complaint_category'),
                        request.POST.get('description_of_complaint'),
                        request.POST.get('responsible_unit_or_department'),
                        request.POST.get('expected_decision_date'),
                        request.POST.get('was_complainant_satisfied_with_decision'),
                        request.POST.get('outcome_of_grievance'),
                        pk
                    ])
                    
                messages.success(request, 'Grievance case updated successfully!')
                return redirect('grievance_detail', pk=pk)
                
            except Exception as e:
                messages.error(request, f'Error updating record: {str(e)}')
        
        # Get current record for form display
        try:
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT * FROM [piuprod3].[dbo].[social_and_env_grieviancemonitoringlog]
                    WHERE case_no = %s
                """, [pk])
                
                row = cursor.fetchone()
                if not row:
                    messages.error(request, 'Grievance case not found.')
                    return redirect('grievance_list')
                
                columns = [col[0] for col in cursor.description]
                grievance_data = dict(zip(columns, row))
                
                context = {
                    'grievance_data': grievance_data,
                    'sql_server_mode': True,
                    'title': 'Edit Grievance Case'
                }
                return render(request, 'social_and_env/grievance/grievance_sql_form.html', context)
                
        except Exception as e:
            messages.error(request, f'Error accessing data: {str(e)}')
            return redirect('grievance_list')
    else:
        # Use Django ORM for SQLite mode
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
            'title': 'Edit Grievance Case',
            'sql_server_mode': False
        }
        return render(request, 'social_and_env/grievance/grievance_form.html', context)


@login_required
def grievance_delete(request, pk):
    """Delete Grievance record - Dual Mode Support"""
    from utils.database_utils import is_sql_server_mode
    from django.db import connection
    
    if is_sql_server_mode():
        # SQL Server mode with full CRUD support
        if request.method == 'POST':
            try:
                with connection.cursor() as cursor:
                    # Delete grievance record from SQL Server
                    cursor.execute("""
                        DELETE FROM [piuprod3].[dbo].[social_and_env_grieviancemonitoringlog]
                        WHERE case_no = %s
                    """, [pk])
                    
                messages.success(request, 'Grievance case deleted successfully!')
                return redirect('grievance_list')
                
            except Exception as e:
                messages.error(request, f'Error deleting record: {str(e)}')
                return redirect('grievance_detail', pk=pk)
        
        # Get record for confirmation display
        try:
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT case_no, name_of_complainant FROM [piuprod3].[dbo].[social_and_env_grieviancemonitoringlog]
                    WHERE case_no = %s
                """, [pk])
                
                row = cursor.fetchone()
                if not row:
                    messages.error(request, 'Grievance case not found.')
                    return redirect('grievance_list')
                
                context = {
                    'object_name': f'Grievance Case - {row[0]} ({row[1]})',
                    'cancel_url': 'grievance_detail',
                    'cancel_pk': pk,
                    'sql_server_mode': True
                }
                return render(request, 'social_and_env/confirm_delete.html', context)
                
        except Exception as e:
            messages.error(request, f'Error accessing data: {str(e)}')
            return redirect('grievance_list')
    else:
        # Use Django ORM for SQLite mode
        grievance = get_object_or_404(GrievianceMonitoringLog, pk=pk)
        
        if request.method == 'POST':
            grievance.delete()
            messages.success(request, 'Grievance case deleted successfully!')
            return redirect('grievance_list')
        
        context = {
            'object': grievance,
            'object_name': f'Grievance Case - {grievance.case_no}',
            'cancel_url': 'grievance_detail',
            'cancel_pk': pk,
            'sql_server_mode': False
        }
        return render(request, 'social_and_env/confirm_delete.html', context)


# ======================== OHS Views ========================
@login_required
def ohs_list(request):
    """Enhanced OHS list view with filtering and pagination"""
    # Use Django ORM for SQLite database
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
        'total_reports': ohs_list.count(),
        'filtered_count': filtered_ohs.count(),
        'total_workers': sum([(ohs.male or 0) + (ohs.female or 0) for ohs in ohs_list]),
        'total_youth': sum([(ohs.youth_male or 0) + (ohs.youth_female or 0) for ohs in ohs_list]),
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
    """Add new OHS record - Dual Mode Support"""
    if request.method == 'POST':
        form = OHSMonitoringForm(request.POST, request.FILES)
        if form.is_valid():
            ohs = form.save(commit=False)
            ohs.loginUser = request.user
            
            # Use dual-mode save
            if is_sql_server_mode():
                if safe_model_save(ohs, using_raw_sql=True):
                    messages.success(request, 'OHS monitoring record created successfully!')
                    return redirect('ohs_list')
                else:
                    messages.error(request, 'Error saving to SQL Server database.')
            else:
                ohs.save()
                messages.success(request, 'OHS monitoring record created successfully!')
                return redirect('ohs_list')
        else:
            messages.error(request, 'Please correct the errors below.')
    else:
        form = OHSMonitoringForm()

    context = {'form': form, 'title': 'Add OHS Monitoring Record'}
    return render(request, 'social_and_env/ohs/ohs_form.html', context)


@login_required
def ohs_detail(request, pk):
    """Detail view for OHS monitoring record - Dual Mode Support"""
    if is_sql_server_mode():
        # Use SQL Server compatible approach
        from django.db import connection
        
        with connection.cursor() as cursor:
            # Try different table name variations for SQL Server
            tables_to_try = [
                '[piuprod3].[dbo].[social_and_env_ohs_monitoring]',
                'social_and_env_ohs_monitoring'
            ]
            
            ohs_data = None
            for table_name in tables_to_try:
                try:
                    cursor.execute(f"""
                        SELECT * FROM {table_name} 
                        WHERE ohs_Id = %s
                    """, [pk])
                    
                    row = cursor.fetchone()
                    if row:
                        columns = [col[0] for col in cursor.description]
                        ohs_data = dict(zip(columns, row))
                        break
                except Exception as e:
                    continue
            
            if not ohs_data:
                messages.error(request, 'OHS record not found.')
                return redirect('ohs_list')
            
            # Create a mock object with the data for template compatibility
            class MockOHS:
                def __init__(self, data):
                    for key, value in data.items():
                        setattr(self, key, value)
                    
                    # Add calculated properties
                    self.pk = data.get('ohs_Id')
                    self.total_workers = (data.get('male') or 0) + (data.get('female') or 0)
                    self.total_youth = (data.get('youth_male') or 0) + (data.get('youth_female') or 0)
                    
                    # Mock related objects for template compatibility
                    self.project = type('Project', (), {
                        'project': data.get('project_id', 'Unknown'),
                        'project_name': data.get('project_id', 'Unknown')
                    })()
                    
                    self.region = type('Region', (), {
                        'region_name': data.get('region_id', 'Unknown')
                    })()
                    
                    self.district = type('District', (), {
                        'district_name': data.get('district_id', 'Unknown')
                    })()
                    
                    self.settlement = type('Settlement', (), {
                        'settlement_name': data.get('settlement_id', 'Unknown')
                    })()
                    
                    self.Type_of_Investment = type('Investment', (), {
                        'type_of_investment': data.get('Type_of_Investment_id', 'Unknown')
                    })()
                    
                    self.year_of_report = type('Year', (), {
                        'year_name': data.get('year_of_report_id', 'Unknown')
                    })()
                    
                    self.quarter = type('Quarter', (), {
                        'quarter_name': data.get('quarter_id', 'Unknown')
                    })()
            
            ohs = MockOHS(ohs_data)
            
            context = {
                'ohs': ohs,
                'title': f'OHS Monitoring - {ohs.project.project}',
                'sql_server_mode': True
            }
            
            return render(request, 'social_and_env/ohs/ohs_detail.html', context)
    else:
        # Use Django ORM for SQLite
        ohs = get_object_or_404(OHS_Monitoring.objects.select_related(
            'project', 'Type_of_Investment', 'year_of_report', 'quarter', 'region',
            'district', 'settlement', 'loginUser'), pk=pk)
        
        context = {
            'ohs': ohs,
            'title': f'OHS Monitoring - {ohs.project.project if ohs.project else "Unknown"}',
            'sql_server_mode': False
        }
        
        return render(request, 'social_and_env/ohs/ohs_detail.html', context)


@login_required
def ohs_edit(request, pk):
    """Edit OHS monitoring record - Dual Mode Support"""
    if is_sql_server_mode():
        # For SQL Server mode, provide read-only view with edit capability
        from django.db import connection
        
        with connection.cursor() as cursor:
            # Get the OHS record
            try:
                cursor.execute("""
                    SELECT * FROM [piuprod3].[dbo].[social_and_env_ohs_monitoring] 
                    WHERE ohs_Id = %s
                """, [pk])
                
                row = cursor.fetchone()
                if not row:
                    messages.error(request, 'OHS record not found.')
                    return redirect('ohs_list')
                
                columns = [col[0] for col in cursor.description]
                ohs_data = dict(zip(columns, row))
                
                if request.method == 'POST':
                    # Handle SQL Server update
                    try:
                        # Get form data
                        male = request.POST.get('male', 0)
                        female = request.POST.get('female', 0)
                        youth_male = request.POST.get('youth_male', 0)
                        youth_female = request.POST.get('youth_female', 0)
                        quality_at_entry_requirement = request.POST.get('quality_at_entry_requirement', '')
                        working_environment = request.POST.get('working_environment', '')
                        remarks = request.POST.get('remarks', '')
                        
                        # Update the record
                        cursor.execute("""
                            UPDATE [piuprod3].[dbo].[social_and_env_ohs_monitoring]
                            SET male = %s, female = %s, youth_male = %s, youth_female = %s,
                                quality_at_entry_requirement = %s, working_environment = %s,
                                remarks = %s
                            WHERE ohs_Id = %s
                        """, [male, female, youth_male, youth_female, 
                              quality_at_entry_requirement, working_environment, remarks, pk])
                        
                        messages.success(request, 'OHS monitoring record updated successfully!')
                        return redirect('ohs_detail', pk=pk)
                    except Exception as e:
                        messages.error(request, f'Error updating record: {str(e)}')
                
                # Create initial form data
                initial_data = {
                    'male': ohs_data.get('male', 0),
                    'female': ohs_data.get('female', 0),
                    'youth_male': ohs_data.get('youth_male', 0),
                    'youth_female': ohs_data.get('youth_female', 0),
                    'quality_at_entry_requirement': ohs_data.get('quality_at_entry_requirement', ''),
                    'working_environment': ohs_data.get('working_environment', ''),
                    'remarks': ohs_data.get('remarks', ''),
                }
                
                context = {
                    'ohs_data': ohs_data,
                    'initial_data': initial_data,
                    'pk': pk,
                    'title': f'Edit OHS Monitoring - {ohs_data.get("project_id", "Unknown")}',
                    'sql_server_mode': True
                }
                
                return render(request, 'social_and_env/ohs/ohs_edit_sql.html', context)
                
            except Exception as e:
                messages.error(request, f'Error accessing SQL Server: {str(e)}')
                return redirect('ohs_list')
    else:
        # Use Django ORM for SQLite
        ohs = get_object_or_404(OHS_Monitoring, pk=pk)
        
        if request.method == 'POST':
            form = OHSUpdateForm(request.POST, request.FILES, instance=ohs)
            if form.is_valid():
                # Set the login user before saving
                ohs_instance = form.save(commit=False)
                ohs_instance.loginUser = request.user
                ohs_instance.save()
                messages.success(request, 'OHS monitoring record updated successfully!')
                return redirect('ohs_detail', pk=ohs.pk)
            else:
                # Debug form errors
                print("Form errors:", form.errors)
                for field, errors in form.errors.items():
                    print(f"Field '{field}': {errors}")
                messages.error(request, 'Please correct the errors below.')
        else:
            form = OHSUpdateForm(instance=ohs)

        context = {
            'form': form,
            'ohs': ohs,
            'title': f'Edit OHS Monitoring - {ohs.project.project if ohs.project else "Unknown"}',
            'sql_server_mode': False
        }
        return render(request, 'social_and_env/ohs/ohs_form.html', context)


@login_required
def ohs_delete(request, pk):
    """Delete OHS monitoring record - Dual Mode Support"""
    if is_sql_server_mode():
        # Handle SQL Server deletion
        from django.db import connection
        
        with connection.cursor() as cursor:
            try:
                # Check if record exists
                cursor.execute("""
                    SELECT COUNT(*) FROM [piuprod3].[dbo].[social_and_env_ohs_monitoring] 
                    WHERE ohs_Id = %s
                """, [pk])
                
                if cursor.fetchone()[0] == 0:
                    messages.error(request, 'OHS record not found.')
                    return redirect('ohs_list')
                
                if request.method == 'POST':
                    # Delete the record
                    cursor.execute("""
                        DELETE FROM [piuprod3].[dbo].[social_and_env_ohs_monitoring] 
                        WHERE ohs_Id = %s
                    """, [pk])
                    
                    messages.success(request, 'OHS monitoring record deleted successfully!')
                    return redirect('ohs_list')
                
                # Show confirmation page
                context = {
                    'object_name': f'OHS Monitoring Record #{pk}',
                    'cancel_url': 'ohs_detail',
                    'cancel_pk': pk,
                    'delete_url': 'ohs_delete',
                    'delete_pk': pk,
                    'sql_server_mode': True
                }
                return render(request, 'social_and_env/confirm_delete.html', context)
                
            except Exception as e:
                messages.error(request, f'Error deleting record: {str(e)}')
                return redirect('ohs_list')
    else:
        # Use Django ORM for SQLite
        ohs = get_object_or_404(OHS_Monitoring, pk=pk)
        
        if request.method == 'POST':
            ohs.delete()
            messages.success(request, 'OHS monitoring record deleted successfully!')
            return redirect('ohs_list')
        
        context = {
            'object': ohs,
            'object_name': f'OHS Monitoring Record - {ohs.project.project if ohs.project else "Unknown"}',
            'cancel_url': 'ohs_detail',
            'cancel_pk': pk,
            'sql_server_mode': False
        }
        return render(request, 'social_and_env/confirm_delete.html', context)


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
        form = CommunityEngagementForm(request.POST)
        if form.is_valid():
            community = form.save(commit=False)
            community.loginUser = request.user
            community.save()
            messages.success(request, 'Community engagement record created successfully!')
            return redirect('community_list')
        else:
            messages.error(request, 'Please correct the errors below.')
    else:
        form = CommunityEngagementForm()
    
    context = {'form': form, 'title': 'Add Community Engagement Record'}
    return render(request, 'social_and_env/community/community_form.html', context)


@login_required
def community_edit(request, pk):
    """Edit Community Engagement record"""
    community = get_object_or_404(CommunityConsult_Engagement, pk=pk)
    
    if request.method == 'POST':
        form = CommunityEngagementUpdateForm(request.POST, instance=community)
        if form.is_valid():
            form.save()
            messages.success(request, 'Community engagement record updated successfully!')
            return redirect('community_detail', pk=community.pk)
        else:
            messages.error(request, 'Please correct the errors below.')
    else:
        form = CommunityEngagementUpdateForm(instance=community)
    
    context = {'form': form, 'community': community, 'title': 'Edit Community Engagement Record'}
    return render(request, 'social_and_env/community/community_form.html', context)


@login_required
def community_delete(request, pk):
    """Delete Community Engagement record"""
    community = get_object_or_404(CommunityConsult_Engagement, pk=pk)
    
    if request.method == 'POST':
        community.delete()
        messages.success(request, 'Community engagement record deleted successfully!')
        return redirect('community_list')
    
    context = {
        'object': community,
        'object_name': f'Community Engagement - {community.project_name}',
        'cancel_url': 'community_detail',
        'cancel_pk': pk,
    }
    return render(request, 'social_and_env/confirm_delete.html', context)


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
def esia_delete(request, pk):
    """Delete ESIA record"""
    esia = get_object_or_404(ESIA, pk=pk)
    
    if request.method == 'POST':
        esia.delete()
        messages.success(request, 'ESIA record deleted successfully!')
        return redirect('esia_list')
    
    context = {
        'object': esia,
        'object_name': f'ESIA - {esia.project_name}',
        'cancel_url': 'esia_detail',
        'cancel_pk': pk,
    }
    return render(request, 'social_and_env/confirm_delete.html', context)


@login_required
def grievance_add(request):
    """Add new Grievance record - Dual Mode Support"""
    from utils.database_utils import is_sql_server_mode
    from django.db import connection
    import uuid
    
    if is_sql_server_mode():
        # SQL Server mode with full CRUD support
        if request.method == 'POST':
            try:
                with connection.cursor() as cursor:
                    # Generate unique case number
                    case_no = f"GR-{uuid.uuid4().hex[:8].upper()}"
                    
                    # Insert new grievance record into SQL Server
                    cursor.execute("""
                        INSERT INTO [piuprod3].[dbo].[social_and_env_grieviancemonitoringlog]
                        (case_no, name_of_complainant, sex, phone_number, location,
                         complaint_category, description_of_complaint, responsible_unit_or_department,
                         date_claim_recieved, expected_decision_date, was_complainant_satisfied_with_decision,
                         outcome_of_grievance, date_created, loginUser_id)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, GETDATE(), %s)
                    """, [
                        case_no,
                        request.POST.get('name_of_complainant'),
                        request.POST.get('sex'),
                        request.POST.get('phone_number'),
                        request.POST.get('location'),
                        request.POST.get('complaint_category'),
                        request.POST.get('description_of_complaint'),
                        request.POST.get('responsible_unit_or_department'),
                        request.POST.get('date_claim_recieved'),
                        request.POST.get('expected_decision_date'),
                        request.POST.get('was_complainant_satisfied_with_decision'),
                        request.POST.get('outcome_of_grievance'),
                        request.user.id
                    ])
                    
                messages.success(request, f'Grievance case {case_no} created successfully!')
                return redirect('grievance_list')
                
            except Exception as e:
                messages.error(request, f'Error creating record: {str(e)}')
        
        context = {
            'sql_server_mode': True,
            'title': 'Add Grievance Case'
        }
        return render(request, 'social_and_env/grievance/grievance_sql_form.html', context)
    else:
        # SQLite mode using Django ORM
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

        context = {'form': form, 'title': 'Add Grievance Case', 'sql_server_mode': False}
        return render(request, 'social_and_env/grievance/grievance_form.html', context)


@login_required
def grievance_edit(request, pk):
    """Edit Grievance record"""
    grievance = get_object_or_404(GrievianceMonitoringLog, pk=pk)
    
    if request.method == 'POST':
        form = GrievianceUpdateForm(request.POST, instance=grievance)
        if form.is_valid():
            form.save()
            messages.success(request, 'Grievance record updated successfully!')
            return redirect('grievance_detail', pk=grievance.pk)
        else:
            messages.error(request, 'Please correct the errors below.')
    else:
        form = GrievianceUpdateForm(instance=grievance)
    
    context = {'form': form, 'grievance': grievance, 'title': 'Edit Grievance Record'}
    return render(request, 'social_and_env/grievance/grievance_form.html', context)


@login_required
def grievance_delete(request, pk):
    """Delete Grievance record"""
    grievance = get_object_or_404(GrievianceMonitoringLog, pk=pk)
    
    if request.method == 'POST':
        grievance.delete()
        messages.success(request, 'Grievance record deleted successfully!')
        return redirect('grievance_list')
    
    context = {
        'object': grievance,
        'object_name': f'Grievance - {grievance.project}',
        'cancel_url': 'grievance_detail',
        'cancel_pk': pk,
    }
    return render(request, 'social_and_env/confirm_delete.html', context)


# ======================== AJAX Views ========================
@login_required
def load_districts(request):
    """Load districts based on selected region"""
    region_id = request.GET.get('region_id')
    districts = Districts.objects.filter(region_code=region_id).order_by('district_name')
    return JsonResponse({'districts': [{'id': d.district_code, 'name': d.district_name} for d in districts]})


@login_required
def load_settlements(request):
    """Load settlements based on selected district"""
    district_id = request.GET.get('district_id')
    settlements = Settlements.objects.filter(district_code=district_id).order_by('settlement_name')
    return JsonResponse({'settlements': [{'id': s.settlement_code, 'name': s.settlement_name} for s in settlements]})


@login_required
def load_investment_types(request):
    """Load investment types based on selected project"""
    project_id = request.GET.get('project_id')
    investment_types = Type_of_Investment.objects.filter(project=project_id).order_by('type_of_investment')
    return JsonResponse({'investment_types': [{'id': t.pk, 'name': t.type_of_investment} for t in investment_types]})


@csrf_exempt
def load_investment_types_grievance(request):
    """Load investment types for Grievance based on project selection"""
    project_id = request.GET.get('project_id')
    
    if project_id:
        try:
            investment_types = KPI_For_Contract.objects.filter(
                project=project_id
            ).values('type_of_investment', 'Kpi_description').distinct()
            
            options = '<option value="">Select Investment Type</option>'
            for item in investment_types:
                options += f'<option value="{item["type_of_investment"]}">{item["type_of_investment"]} - {item["Kpi_description"]}</option>'
            
            return HttpResponse(options)
        except Exception as e:
            return HttpResponse('<option value="">Error loading investment types</option>')
    
    return HttpResponse('<option value="">Select Investment Type</option>')


def load_investment_types_ohs(request):
    """Load investment types for OHS based on selected project"""
    project_id = request.GET.get('project')
    investment_types = KPI_For_Contract.objects.none()
    
    if project_id:
        investment_types = KPI_For_Contract.objects.filter(project_id=project_id).distinct()
    
    return render(request, 'social_and_env/partials/investment_types_ohs.html', {
        'investment_types': investment_types
    })


def load_districts_ohs(request):
    """Load districts for OHS based on selected region"""
    from django.http import HttpResponse
    
    region_id = request.GET.get('region')
    
    if not region_id:
        return HttpResponse('<option value="">Select District</option>')
    
    try:
        # Use raw SQL to get districts from the actual database
        from django.db import connection
        with connection.cursor() as cursor:
            # Query using the actual string region codes (not numeric mapping)
            cursor.execute("""
                SELECT district_code, district_name 
                FROM setup_districts 
                WHERE region_code_id = %s 
                ORDER BY district_name
            """, [region_id])
            
            rows = cursor.fetchall()
            
            # Build HTML response
            html = '<option value="">Select District</option>'
            for row in rows:
                html += f'<option value="{row[0]}">{row[1]}</option>'
            
            return HttpResponse(html)
    
    except Exception as e:
        return HttpResponse(f'<option value="">Error: {str(e)}</option>')


def load_settlements_ohs(request):
    """Load settlements for OHS based on selected district"""
    from django.http import HttpResponse
    
    district_id = request.GET.get('district')
    
    if not district_id:
        return HttpResponse('<option value="">Select Settlement</option>')
    
    try:
        # Use raw SQL to get settlements from the actual database
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT settlement_code, settlement_name 
                FROM setup_settlements 
                WHERE district_code = %s 
                ORDER BY settlement_name
            """, [district_id])
            
            rows = cursor.fetchall()
            
            # Build HTML response
            html = '<option value="">Select Settlement</option>'
            for row in rows:
                html += f'<option value="{row[0]}">{row[1]}</option>'
            
            return HttpResponse(html)
    
    except Exception as e:
        return HttpResponse(f'<option value="">Error: {str(e)}</option>')


# Test endpoint to validate cascading dropdown functionality
def test_cascading_dropdown(request):
    """Test endpoint to validate cascading dropdown functionality and provide dropdown data"""
    from django.http import HttpResponse
    
    try:
        from django.db import connection
        with connection.cursor() as cursor:
            region_id = request.GET.get('region')
            district_id = request.GET.get('district')
            dropdown_type = request.GET.get('type', 'test')
            
            if dropdown_type == 'districts' and region_id:
                # Return districts for the specified region
                cursor.execute("""
                    SELECT district_code, district_name 
                    FROM setup_districts 
                    WHERE region_code_id = %s 
                    ORDER BY district_name
                """, [region_id])
                
                rows = cursor.fetchall()
                
                result = '<select><option value="">Select District</option>'
                for row in rows:
                    result += f'<option value="{row[0]}">{row[1]}</option>'
                result += '</select>'
                
                return HttpResponse(result)
                
            elif dropdown_type == 'settlements' and district_id:
                # Return settlements for the specified district
                # Note: settlements table doesn't exist, so we'll create placeholder settlements
                try:
                    # Use the actual setup_settlement table
                    cursor.execute("""
                        SELECT settlement_code, settlement_name 
                        FROM setup_settlement 
                        WHERE district_code_id = %s 
                        ORDER BY settlement_name
                    """, [district_id])
                    rows = cursor.fetchall()
                    
                    # If no settlements found, create placeholder settlements
                    if not rows:
                        cursor.execute("SELECT district_name FROM setup_districts WHERE district_code = %s", [district_id])
                        district_info = cursor.fetchone()
                        if district_info:
                            district_name = district_info[0]
                            # Create some typical settlements
                            settlements = [
                                (f"{district_id}_001", f"{district_name} Central"),
                                (f"{district_id}_002", f"{district_name} North"),
                                (f"{district_id}_003", f"{district_name} South"),
                                (f"{district_id}_004", f"{district_name} East"),
                                (f"{district_id}_005", f"{district_name} West"),
                            ]
                            rows = settlements
                        else:
                            rows = []
                except Exception as e:
                    # Fallback settlements if there's an error
                    rows = [(f"{district_id}_001", f"Settlement 1"), (f"{district_id}_002", f"Settlement 2")]
                
                result = '<select><option value="">Select Settlement</option>'
                for row in rows:
                    result += f'<option value="{row[0]}">{row[1]}</option>'
                result += '</select>'
                
                return HttpResponse(result)
            
            else:
                # Test districts for WCR
                cursor.execute("SELECT COUNT(*) FROM setup_districts WHERE region_code_id = 'WCR'")
                wcr_count = cursor.fetchone()[0]
                
                cursor.execute("SELECT district_code, district_name FROM setup_districts WHERE region_code_id = 'WCR' LIMIT 3")
                wcr_districts = cursor.fetchall()
                
                # Test districts for GBA
                cursor.execute("SELECT COUNT(*) FROM setup_districts WHERE region_code_id = 'GBA'")
                gba_count = cursor.fetchone()[0]
                
                result = f"""
                <h3>Cascading Dropdown Test Results</h3>
                <p>WCR districts: {wcr_count}</p>
                <p>Sample WCR districts: {wcr_districts}</p>
                <p>GBA districts: {gba_count}</p>
                
                <h4>Test WCR Dropdown:</h4>
                <select>
                    <option value="">Select District</option>
                """
                
                for district in wcr_districts:
                    result += f'<option value="{district[0]}">{district[1]}</option>'
                
                result += "</select>"
                
                return HttpResponse(result)
    
    except Exception as e:
        return HttpResponse(f"Error: {str(e)}")


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
                '[piuprod3].[dbo].[social_and_env_communityconsult_engagement]',
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
                                # Handle picture URL for SQL Server mode
                                self.picture = getattr(self, 'picture', None)
                            
                            def get_picture_url(self):
                                if self.picture:
                                    # For SQL Server mode, construct the URL path
                                    if hasattr(settings, 'MEDIA_URL'):
                                        return f"{settings.MEDIA_URL}{self.picture}"
                                    else:
                                        return f"/media/{self.picture}"
                                return None
                        
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
    from django.http import HttpResponse
    
    project_id = request.GET.get('project')
    if not project_id:
        return HttpResponse('<option value="">Select Investment Type</option>')
    
    try:
        from django.db import connection
        
        # Use raw SQL to ensure compatibility
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT DISTINCT type_of_investment 
                FROM PIU_Financial_mgt_kpi_for_contract 
                WHERE project_id = %s 
                ORDER BY type_of_investment
            """, [project_id])
            
            rows = cursor.fetchall()
            
            options = '<option value="">Select Investment Type</option>'
            for row in rows:
                options += f'<option value="{row[0]}">{row[0]}</option>'
            
            return HttpResponse(options)
    
    except Exception as e:
        return HttpResponse(f'<option value="">Error: {str(e)}</option>')


@login_required
def load_districts(request):
    """Load districts based on region selection - Dual Mode Support"""
    from django.http import HttpResponse
    
    region_id = request.GET.get('region')
    if not region_id:
        return HttpResponse('<option value="">Select District</option>')
    
    try:
        from django.db import connection
        
        # Use raw SQL to ensure compatibility
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT district_code, district_name 
                FROM setup_districts 
                WHERE region_code_id = %s 
                ORDER BY district_name
            """, [region_id])
            
            rows = cursor.fetchall()
            
            options = '<option value="">Select District</option>'
            for row in rows:
                options += f'<option value="{row[0]}">{row[1]}</option>'
            
            return HttpResponse(options)
    
    except Exception as e:
        return HttpResponse(f'<option value="">Error: {str(e)}</option>')


@login_required
def load_settlements(request):
    """Load settlements based on district selection - Dual Mode Support"""
    from django.http import HttpResponse
    
    district_id = request.GET.get('district')
    if not district_id:
        return HttpResponse('<option value="">Select Settlement</option>')
    
    try:
        from django.db import connection
        
        # Use raw SQL to ensure compatibility
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT settlement_code, settlement_name 
                FROM setup_settlement 
                WHERE district_code_id = %s 
                ORDER BY settlement_name
            """, [district_id])
            
            rows = cursor.fetchall()
            
            options = '<option value="">Select Settlement</option>'
            for row in rows:
                options += f'<option value="{row[0]}">{row[1]}</option>'
            
            return HttpResponse(options)
    
    except Exception as e:
        return HttpResponse(f'<option value="">Error: {str(e)}</option>')


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
        districts = Districts.objects.filter(region_code=region_id)

    return render(request, 'social_and_env/partials/districts.html',
                  {'districts': districts})


@login_required
def load_settlements_ohs(request):
    """Load settlements for OHS based on district selection"""
    district_id = request.GET.get('district')
    settlements = Settlement.objects.none()

    if district_id:
        settlements = Settlement.objects.filter(district_code=district_id)

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
