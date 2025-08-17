from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse, HttpResponse, Http404
from django.contrib import messages
from django.conf import settings
from django.core.paginator import Paginator
from django.db import models
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
from setup.models import Districts, Settlement, Regions, Quarter, YEAR
from PIU_Financial_mgt.models import KPI_For_Contract, Project
from PIU_Financial_mgt.models import ProjectOutCome, PDO, ProjectResult
from monitoring.models import Indicator_Description
# Using Django ORM exclusively for all database operations


# ======================== ESIA Views ========================
@login_required
def esia_list(request):
    """Enhanced ESIA/ESMP list view with filtering and pagination"""
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
            try:
                esia = form.save(commit=False)
                esia.loginUser = request.user
                esia.save()
                messages.success(request, 'ESIA/ESMP record created successfully!')
                return redirect('esia_list')
            except Exception as e:
                messages.error(request, f'Error saving ESIA/ESMP record: {str(e)}')
        else:
            # Print form errors for debugging
            for field, errors in form.errors.items():
                for error in errors:
                    messages.error(request, f'{field}: {error}')
    else:
        form = ESIAForm()

    context = {'form': form, 'title': 'Add ESIA/ESMP Record'}
    return render(request, 'social_and_env/esia/esia_form.html', context)


@login_required
def esia_edit(request, pk):
    """Edit ESIA/ESMP record"""
    esia = get_object_or_404(ESIA, pk=pk)

    if request.method == 'POST':
        form = ESIAForm(request.POST, instance=esia)
        if form.is_valid():
            try:
                esia = form.save(commit=False)
                esia.loginUser = request.user
                esia.save()
                messages.success(request, 'ESIA/ESMP record updated successfully!')
                return redirect('esia_list')
            except Exception as e:
                messages.error(request, f'Error updating ESIA/ESMP record: {str(e)}')
        else:
            # Print form errors for debugging
            for field, errors in form.errors.items():
                for error in errors:
                    messages.error(request, f'{field}: {error}')
    else:
        form = ESIAForm(instance=esia)

    context = {'form': form, 'esia': esia, 'title': 'Edit ESIA/ESMP Record'}
    return render(request, 'social_and_env/esia/esia_edit.html', context)





@login_required
@require_http_methods(["DELETE"])
def esia_delete(request, pk):
    """Delete ESIA/ESMP record"""
    esia = get_object_or_404(ESIA, pk=pk)
    esia.delete()
    messages.success(request, 'ESIA/ESMP record deleted successfully!')
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
    """Enhanced PAP list view with filtering and pagination"""
    pap_list = PAP.objects.select_related(
        'project', 'type_of_investment', 'region', 'district',
        'pap_Current_Address', 'type_of_pap', 'pap_category',
        'vulnerability_category', 'type_of_impact', 'nature_of_compensation',
        'loginUser'
    ).all()

    # Apply filters
    pap_filter = PAPFilter(request.GET, queryset=pap_list)
    filtered_pap = pap_filter.qs

    # Pagination
    paginator = Paginator(filtered_pap, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    # Statistics
    stats = {
        'total_pap': pap_list.count(),
        'filtered_count': filtered_pap.count(),
        'compensated': filtered_pap.filter(pap_compensated='Y').count(),
        'not_compensated': filtered_pap.filter(pap_compensated='N').count(),
        'total_compensation': filtered_pap.aggregate(Sum('amount'))['amount__sum'] or 0,
        'male_count': filtered_pap.filter(sex='M').count(),
        'female_count': filtered_pap.filter(sex='F').count(),
    }

    context = {
        'page_obj': page_obj,
        'filter': pap_filter,
        'stats': stats,
        'is_filtered': bool(request.GET),
    }

    return render(request, 'social_and_env/pap/pap_list.html', context)


@login_required
def pap_detail(request, pk):
    """PAP detail view"""
    try:
        pap = get_object_or_404(PAP.objects.select_related(
            'project', 'type_of_investment', 'region', 'district',
            'pap_Current_Address', 'type_of_pap', 'pap_category',
            'vulnerability_category', 'type_of_impact', 'loginUser'
        ), pk=pk)
        
        context = {
            'pap': pap,
            'title': f'PAP Details - {pap.pap_name}',
        }
        
        return render(request, 'social_and_env/pap/pap_detail.html', context)
    
    except Exception as e:
        messages.error(request, f'Error loading PAP details: {str(e)}')
        return redirect('pap_list')


@login_required
def export_pap_excel(request):
    """Export PAP data to Excel format"""
    from django.http import HttpResponse
    from openpyxl import Workbook
    from openpyxl.utils import get_column_letter
    from datetime import datetime
    
    try:
        # Get PAP data using Django ORM
        pap_list = PAP.objects.select_related(
            'project', 'type_of_investment', 'region', 'district',
            'pap_Current_Address', 'type_of_pap', 'pap_category',
            'vulnerability_category', 'type_of_impact', 'loginUser'
        ).all()
        
        # Create workbook and worksheet
        wb = Workbook()
        ws = wb.active
        ws.title = 'PAP Records'
        
        # Define headers
        headers = [
            'PAP ID', 'PAP Name', 'Gender', 'Project', 'Region', 'District',
            'Location of Impact', 'Amount', 'Area', 'Compensated', 'Compensation Date',
            'Compensation Ref No', 'Type of PAP', 'PAP Category', 'Vulnerability Category',
            'Type of Impact', 'Type of Investment', 'Pre-Project Situation', 'Remarks',
            'Date Created', 'User'
        ]
        
        # Write headers
        for col, header in enumerate(headers, 1):
            ws.cell(row=1, column=col, value=header)
        
        # Write data
        for row, pap in enumerate(pap_list, 2):
            ws.cell(row=row, column=1, value=pap.pap_identification_number)
            ws.cell(row=row, column=2, value=pap.pap_name)
            ws.cell(row=row, column=3, value=pap.gender)
            ws.cell(row=row, column=4, value=pap.project.project if pap.project else '')
            ws.cell(row=row, column=5, value=pap.region.region_name if pap.region else '')
            ws.cell(row=row, column=6, value=pap.district.district_name if pap.district else '')
            ws.cell(row=row, column=7, value=pap.location_of_impact)
            ws.cell(row=row, column=8, value=pap.amount)
            ws.cell(row=row, column=9, value=pap.area)
            ws.cell(row=row, column=10, value=pap.pap_compensated)
            ws.cell(row=row, column=11, value=pap.compensation_date)
            ws.cell(row=row, column=12, value=pap.compensation_RefNo)
            ws.cell(row=row, column=13, value=pap.type_of_pap.type_of_pap if pap.type_of_pap else '')
            ws.cell(row=row, column=14, value=pap.pap_category.pap_category if pap.pap_category else '')
            ws.cell(row=row, column=15, value=pap.vulnerability_category.vulnerability_category if pap.vulnerability_category else '')
            ws.cell(row=row, column=16, value=pap.type_of_impact.type_of_impact if pap.type_of_impact else '')
            ws.cell(row=row, column=17, value=pap.type_of_investment.type_of_investment if pap.type_of_investment else '')
            ws.cell(row=row, column=18, value=pap.pre_project_situation)
            ws.cell(row=row, column=19, value=pap.remarks)
            ws.cell(row=row, column=20, value=pap.date_created.strftime('%Y-%m-%d %H:%M') if pap.date_created else '')
            ws.cell(row=row, column=21, value=pap.loginUser.username if pap.loginUser else '')
        
        # Auto-adjust column widths
        for col in range(1, len(headers) + 1):
            ws.column_dimensions[get_column_letter(col)].width = 15
        
        # Create response
        response = HttpResponse(
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = f'attachment; filename=pap_records_{datetime.now().strftime("%Y%m%d_%H%M")}.xlsx'
        
        wb.save(response)
        return response
    
    except Exception as e:
        messages.error(request, f'Error exporting PAP data: {str(e)}')
        return redirect('pap_list')


@login_required
def pap_add(request):
    """Add new PAP record with improved error handling"""
    if request.method == 'POST':
        form = PAPForm(request.POST)
        if form.is_valid():
            try:
                pap = form.save(commit=False)
                pap.loginUser = request.user
                
                # Import required models
                from PIU_Financial_mgt.models import KPI_For_Contract
                from setup.models import (
                    Districts, Settlement, TypeOfPAP, PAPCategory, 
                    VulnerabilityCategory, TypeOfImpact, NatureOfSettlement
                )
                
                # Ensure all required fields have values
                if not pap.type_of_investment and pap.project:
                    pap.type_of_investment = KPI_For_Contract.objects.filter(project=pap.project).first()
                
                if not pap.district and pap.region:
                    pap.district = Districts.objects.filter(region_code_id=pap.region.pk).first()
                
                if not pap.pap_Current_Address and pap.district:
                    pap.pap_Current_Address = Settlement.objects.filter(district_code_id=pap.district.pk).first()
                
                # Set defaults for required lookup fields
                if not pap.type_of_pap:
                    pap.type_of_pap = TypeOfPAP.objects.first()
                if not pap.pap_category:
                    pap.pap_category = PAPCategory.objects.first()
                if not pap.vulnerability_category:
                    pap.vulnerability_category = VulnerabilityCategory.objects.first()
                if not pap.type_of_impact:
                    pap.type_of_impact = TypeOfImpact.objects.first()
                if not pap.nature_of_compensation:
                    pap.nature_of_compensation = NatureOfSettlement.objects.first()
                
                # Set defaults for required text fields
                if not pap.area:
                    pap.area = '0'
                if not pap.pap_compensated:
                    pap.pap_compensated = 'N'
                if not pap.pre_project_situation:
                    pap.pre_project_situation = 'Information not provided'
                
                pap.save()
                messages.success(request, f'PAP record {pap.pap_identification_number} added successfully.')
                return redirect('pap_list')
                
            except Exception as e:
                messages.error(request, f'Error saving PAP record: {str(e)}')
                import traceback
                print(f'PAP Save Error: {traceback.format_exc()}')
        else:
            # Display form errors to user
            for field, errors in form.errors.items():
                for error in errors:
                    messages.error(request, f'{field}: {error}')
    else:
        form = PAPForm()
    
    return render(request, 'social_and_env/pap/pap_form.html', {
        'form': form,
        'title': 'Add PAP Record'
    })


@login_required
def pap_edit(request, pk):
    """Edit PAP record with dedicated edit template"""
    try:
        pap = get_object_or_404(PAP.objects.select_related(
            'project', 'type_of_investment', 'region', 'district',
            'pap_Current_Address', 'type_of_pap', 'pap_category',
            'vulnerability_category', 'type_of_impact', 'nature_of_compensation',
            'loginUser'
        ), pk=pk)
        
        if request.method == 'POST':
            form = PAPUpdateForm(request.POST, instance=pap)
            if form.is_valid():
                try:
                    updated_pap = form.save(commit=False)
                    updated_pap.loginUser = request.user
                    # Note: date_modified field doesn't exist in PAP model, removed to avoid error
                    updated_pap.save()
                    messages.success(request, f'PAP record "{pap.pap_name}" updated successfully.')
                    return redirect('pap_list')
                except Exception as e:
                    messages.error(request, f'Error updating PAP record: {str(e)}')
            else:
                # Display form validation errors
                for field, errors in form.errors.items():
                    for error in errors:
                        messages.error(request, f'{field}: {error}')
        else:
            form = PAPUpdateForm(instance=pap)
        
        context = {
            'form': form,
            'pap': pap,
            'title': f'Edit PAP Record - {pap.pap_name}',
        }
        
        return render(request, 'social_and_env/pap/pap_edit.html', context)
        
    except Exception as e:
        messages.error(request, f'Error loading PAP record for editing: {str(e)}')
        return redirect('pap_list')


@login_required
def pap_delete(request, pk):
    """Delete PAP record"""
    pap = get_object_or_404(PAP, pk=pk)
    
    if request.method == 'POST':
        try:
            pap.delete()
            messages.success(request, 'PAP record deleted successfully.')
            return redirect('pap_list')
        except Exception as e:
            messages.error(request, f'Error deleting PAP record: {str(e)}')
    
    return render(request, 'social_and_env/pap/pap_confirm_delete.html', {
        'pap': pap,
        'title': 'Delete PAP Record'
    })


@login_required
def social_env_dashboard(request):
    """Dashboard with overview statistics"""
    from django.db.models import Count, Sum
    
    try:
        # Get statistics using Django ORM
        stats = {
            'total_pap': PAP.objects.count(),
            'total_grievances': GrievianceMonitoringLog.objects.count(),
            'total_esia': ESIA.objects.count(),
            'total_ohs': OHS_Monitoring.objects.count(),
            'total_community': CommunityConsult_Engagement.objects.count(),
            'compensated_pap': PAP.objects.filter(pap_compensated='Y').count(),
            'male_pap': PAP.objects.filter(sex='M').count(),
            'female_pap': PAP.objects.filter(sex='F').count(),
            'open_grievances': GrievianceMonitoringLog.objects.filter(was_complainant_satisfied_with_decision='N').count(),
            'closed_grievances': GrievianceMonitoringLog.objects.filter(was_complainant_satisfied_with_decision='Y').count(),
        }
        
        # Get recent activities - convert to lists for template evaluation
        recent_pap = list(PAP.objects.select_related('project', 'loginUser').order_by('-date_created')[:5])
        recent_grievances = list(GrievianceMonitoringLog.objects.select_related('project', 'loginUser').order_by('-date_created')[:5])
        recent_esia = list(ESIA.objects.select_related('project', 'loginUser').order_by('-date_created')[:5])
        
        context = {
            'stats': stats,
            'recent_pap': recent_pap,
            'recent_grievances': recent_grievances,
            'recent_esia': recent_esia,
            'title': 'Social & Environmental Dashboard'
        }
        
        return render(request, 'social_and_env/dashboard.html', context)
    
    except Exception as e:
        messages.error(request, f'Error loading dashboard: {str(e)}')
        return render(request, 'social_and_env/dashboard.html', {
            'stats': {},
            'recent_pap': [],
            'recent_grievances': [],
            'recent_esia': [],
            'title': 'Social & Environmental Dashboard'
        })


# ======================== Grievance Views ========================
@login_required
def grievance_list(request):
    """Enhanced Grievance list view with filtering and pagination"""
    from django.core.paginator import Paginator
    
    try:
        # Initialize the filter
        grievance_filter = GrievianceMonitoringLogFilter(request.GET, 
            queryset=GrievianceMonitoringLog.objects.select_related(
                'project', 'type_of_investment', 'decision_outcome', 'loginUser'
            ).order_by('-date_claim_recieved'))
        
        # Get filtered queryset
        grievances = grievance_filter.qs
        
        # Search functionality (additional to filters)
        search_query = request.GET.get('search', '')
        if search_query:
            grievances = grievances.filter(
                Q(case_no__icontains=search_query) |
                Q(name_of_complainant__icontains=search_query) |
                Q(complaint_content__icontains=search_query) |
                Q(project__project__icontains=search_query)
            )
        
        # Pagination
        page_size = request.GET.get('page_size', 15)
        try:
            page_size = int(page_size)
            if page_size not in [10, 15, 25, 50, 100]:
                page_size = 15
        except (ValueError, TypeError):
            page_size = 15
        
        paginator = Paginator(grievances, page_size)
        page_number = request.GET.get('page')
        page_obj = paginator.get_page(page_number)
        
        # Get statistics from filtered queryset
        total_cases = grievances.count()
        satisfied = grievances.filter(was_complainant_satisfied_with_decision='Y').count()
        not_satisfied = grievances.filter(was_complainant_satisfied_with_decision='N').count()
        pending = grievances.filter(was_complainant_satisfied_with_decision__isnull=True).count()
        
        stats = {
            'total_cases': total_cases,
            'satisfied': satisfied,
            'not_satisfied': not_satisfied,
            'pending': pending,
            'male_complainants': grievances.filter(sex='M').count(),
            'female_complainants': grievances.filter(sex='F').count(),
        }
        
        context = {
            'page_obj': page_obj,
            'filter': grievance_filter,
            'stats': stats,
            'search_query': search_query,
            'is_filtered': bool(request.GET),
            'title': 'Grievance Management'
        }
        
        return render(request, 'social_and_env/grievance/grievance_list.html', context)
    
    except Exception as e:
        messages.error(request, f'Error loading grievances: {str(e)}')
        return render(request, 'social_and_env/grievance/grievance_list.html', {
            'page_obj': None,
            'filter': None,
            'stats': {},
            'search_query': '',
            'is_filtered': False,
            'title': 'Grievance Management'
        })


@login_required
def grievance_detail(request, pk):
    """Grievance detail view"""
    try:
        grievance = get_object_or_404(GrievianceMonitoringLog.objects.select_related(
            'project', 'type_of_investment', 'decision_outcome', 'loginUser'
        ), pk=pk)
        
        context = {
            'grievance': grievance,
            'title': f'Grievance Details - {grievance.case_no}',
        }
        
        return render(request, 'social_and_env/grievance/grievance_detail.html', context)
    
    except Exception as e:
        messages.error(request, f'Error loading grievance details: {str(e)}')
        return redirect('grievance_list')


@login_required
def grievance_add(request):
    """Add new Grievance record"""
    if request.method == 'POST':
        form = GrievianceMonitoringLogForm(request.POST)
        if form.is_valid():
            try:
                grievance = form.save(commit=False)
                grievance.loginUser = request.user
                grievance.save()
                messages.success(request, 'Grievance record added successfully.')
                return redirect('grievance_list')
            except Exception as e:
                messages.error(request, f'Error saving grievance record: {str(e)}')
    else:
        form = GrievianceMonitoringLogForm()
    
    return render(request, 'social_and_env/grievance/grievance_form.html', {
        'form': form,
        'title': 'Add Grievance Record'
    })


@login_required
def grievance_edit(request, pk):
    """Edit Grievance record"""
    grievance = get_object_or_404(GrievianceMonitoringLog, pk=pk)
    
    if request.method == 'POST':
        form = GrievianceMonitoringLogForm(request.POST, instance=grievance)
        if form.is_valid():
            try:
                grievance = form.save(commit=False)
                grievance.loginUser = request.user
                grievance.save()
                messages.success(request, 'Grievance record updated successfully.')
                return redirect('grievance_list')
            except Exception as e:
                messages.error(request, f'Error updating grievance record: {str(e)}')
    else:
        form = GrievianceMonitoringLogForm(instance=grievance)
    
    return render(request, 'social_and_env/grievance/grievance_form.html', {
        'form': form,
        'title': 'Edit Grievance Record'
    })


@login_required
def grievance_delete(request, pk):
    """Delete Grievance record"""
    grievance = get_object_or_404(GrievianceMonitoringLog, pk=pk)
    
    if request.method == 'POST':
        try:
            grievance.delete()
            messages.success(request, 'Grievance record deleted successfully.')
            return redirect('grievance_list')
        except Exception as e:
            messages.error(request, f'Error deleting grievance record: {str(e)}')
    
    return render(request, 'social_and_env/grievance/grievance_confirm_delete.html', {
        'grievance': grievance,
        'title': 'Delete Grievance Record'
    })


# ======================== OHS Views ========================
@login_required  
def ohs_list(request):
    """Enhanced OHS list view with filtering and pagination"""
    from django.core.paginator import Paginator
    from django.db.models import Q
    
    try:
        # Use raw SQL to get OHS records with proper joins
        from django.db import connection
        
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    ohs.ohs_id,
                    ohs.project_id,
                    ohs.date,
                    ohs.quality_at_entry_requirement,
                    ohs.working_environment,
                    ohs.remarks,
                    ohs.male,
                    ohs.female,
                    ohs.youth_male,
                    ohs.youth_female,
                    r.region_name,
                    d.district_name,
                    y.year_name,
                    q.quarter_name
                FROM social_and_env_ohs_monitoring ohs
                LEFT JOIN setup_regions r ON ohs.region_id = r.id
                LEFT JOIN setup_districts d ON ohs.district_id = d.id
                LEFT JOIN setup_year y ON ohs.year_of_report_id = y.id
                LEFT JOIN setup_quarter q ON ohs.quarter_id = q.id
                ORDER BY ohs.date DESC, ohs.date_created DESC
            """)
            
            ohs_data = []
            for row in cursor.fetchall():
                ohs_data.append({
                    'ohs_id': row[0],
                    'project_id': row[1],
                    'date': row[2],
                    'quality_at_entry_requirement': row[3],
                    'working_environment': row[4],
                    'remarks': row[5],
                    'male': row[6],
                    'female': row[7],
                    'youth_male': row[8],
                    'youth_female': row[9],
                    'region_name': row[10],
                    'district_name': row[11],
                    'year_name': row[12],
                    'quarter_name': row[13]
                })
        
        # Apply filters to the data
        filtered_data = ohs_data
        
        if request.GET.get('project'):
            filtered_data = [ohs for ohs in filtered_data if request.GET.get('project') in str(ohs['project_id'])]
        
        if request.GET.get('region'):
            filtered_data = [ohs for ohs in filtered_data if ohs['region_name'] and request.GET.get('region') in ohs['region_name']]
            
        if request.GET.get('district'):
            filtered_data = [ohs for ohs in filtered_data if ohs['district_name'] and request.GET.get('district') in ohs['district_name']]
            
        if request.GET.get('year'):
            filtered_data = [ohs for ohs in filtered_data if ohs['year_name'] and request.GET.get('year') in str(ohs['year_name'])]
            
        if request.GET.get('quarter'):
            filtered_data = [ohs for ohs in filtered_data if ohs['quarter_name'] and request.GET.get('quarter') in str(ohs['quarter_name'])]
            
        # Apply search filter
        search_query = request.GET.get('search', '').strip()
        if search_query:
            filtered_data = [ohs for ohs in filtered_data if 
                search_query.lower() in str(ohs['project_id']).lower() or
                search_query.lower() in str(ohs['quality_at_entry_requirement']).lower() or
                search_query.lower() in str(ohs['working_environment']).lower() or
                search_query.lower() in str(ohs['remarks']).lower()
            ]
        
        # Pagination
        page_size = request.GET.get('page_size', 10)
        try:
            page_size = int(page_size)
            if page_size not in [10, 15, 25, 50, 100]:
                page_size = 10
        except (ValueError, TypeError):
            page_size = 10
        
        paginator = Paginator(filtered_data, page_size)
        page_number = request.GET.get('page')
        page_obj = paginator.get_page(page_number)
        
        # Get statistics from filtered data
        stats = {
            'total_ohs': len(ohs_data),
            'filtered_count': len(filtered_data),
            'total_male_workers': sum(ohs.get('male', 0) or 0 for ohs in filtered_data),
            'total_female_workers': sum(ohs.get('female', 0) or 0 for ohs in filtered_data),
            'total_youth_male': sum(ohs.get('youth_male', 0) or 0 for ohs in filtered_data),
            'total_youth_female': sum(ohs.get('youth_female', 0) or 0 for ohs in filtered_data),
        }
        
        # Calculate additional metrics
        stats['total_workers'] = stats['total_male_workers'] + stats['total_female_workers']
        stats['total_youth'] = stats['total_youth_male'] + stats['total_youth_female']
        
        # Get filter choices for dropdowns - simplified for raw data
        filter_choices = {
            'projects': list(set(ohs['project_id'] for ohs in ohs_data if ohs['project_id'])),
            'regions': list(set(ohs['region_name'] for ohs in ohs_data if ohs['region_name'])),
            'districts': list(set(ohs['district_name'] for ohs in ohs_data if ohs['district_name'])),
            'years': list(set(ohs['year_name'] for ohs in ohs_data if ohs['year_name'])),
            'quarters': list(set(ohs['quarter_name'] for ohs in ohs_data if ohs['quarter_name'])),
        }
        
        # Remove debug output - issue resolved
        
        context = {
            'page_obj': page_obj,
            'stats': stats,
            'filter_choices': filter_choices,
            'current_filters': request.GET,
            'title': 'OHS Monitoring'
        }
        
        return render(request, 'social_and_env/ohs/ohs_list.html', context)
    
    except Exception as e:
        messages.error(request, f'Error loading OHS records: {str(e)}')
        return render(request, 'social_and_env/ohs/ohs_list.html', {
            'page_obj': None,
            'stats': {},
            'title': 'OHS Monitoring'
        })


# AJAX endpoints for cascading dropdowns
def load_districts(request):
    """Load districts based on selected region"""
    from django.http import JsonResponse
    from setup.models import Districts
    
    region_id = request.GET.get('region_id') or request.GET.get('region')
    if not region_id:
        return JsonResponse({'districts': []})
    
    try:
        # Get districts by region code - direct match with stored values
        from setup.models import Regions
        try:
            region = Regions.objects.get(pk=region_id)
            # Districts store region codes or full names, check both patterns
            districts = Districts.objects.filter(
                region_code__in=[region.region_code, region.region_name]
            ).values_list('district_code', 'district_name').order_by('district_name')
        except Regions.DoesNotExist:
            districts = []
        
        district_list = [
            {'id': district_code, 'name': district_name}
            for district_code, district_name in districts
        ]
        
        return JsonResponse({'districts': district_list})
    except Exception as e:
        return JsonResponse({'districts': [], 'error': str(e)})


def load_settlements(request):
    """Load settlements based on selected district"""
    from django.http import JsonResponse
    from setup.models import Settlement
    
    district_id = request.GET.get('district_id') or request.GET.get('district')
    if not district_id:
        return JsonResponse({'settlements': []})
    
    try:
        settlements = Settlement.objects.filter(
            district_code=district_id
        ).values_list('settlement_code', 'settlement_name').order_by('settlement_name')
        
        settlement_list = [
            {'id': settlement_code, 'name': settlement_name}
            for settlement_code, settlement_name in settlements
        ]
        
        return JsonResponse({'settlements': settlement_list})
    except Exception as e:
        return JsonResponse({'settlements': [], 'error': str(e)})


def load_kpi_descriptions(request):
    """Load KPI descriptions based on selected project for AJAX requests"""
    from django.http import JsonResponse
    from PIU_Financial_mgt.models import KPI_For_Contract
    
    project_id = request.GET.get('project_id')
    # Remove debug output for production
    
    if project_id:
        # Use project_id directly as foreign key lookup since project field expects the primary key
        kpi_contracts = KPI_For_Contract.objects.filter(project_id=project_id).distinct()
        
        kpi_list = []
        for kpi in kpi_contracts:
            if kpi.Kpi_description and kpi.Kpi_description.strip():
                kpi_list.append({
                    'id': kpi.monitoring_Type_Code, 
                    'description': kpi.Kpi_description.strip()
                })
                
        return JsonResponse({'kpi_descriptions': kpi_list})
    return JsonResponse({'kpi_descriptions': []})


@login_required
def load_investment_types_esia(request):
    """Load all available investment types for ESIA form"""
    from django.http import JsonResponse
    from PIU_Financial_mgt.models import KPI_For_Contract
    
    try:
        # Get all distinct investment types since they're not project-specific
        investment_types = KPI_For_Contract.objects.values('monitoring_Type_Code', 'type_of_investment').distinct()
        investment_list = [
            {'id': inv['monitoring_Type_Code'] or f'inv_{idx}', 'name': inv['type_of_investment']} 
            for idx, inv in enumerate(investment_types, 1) if inv['type_of_investment']
        ]
        return JsonResponse({'investment_types': investment_list})
    except Exception as e:
        return JsonResponse({'investment_types': [], 'error': str(e)})





@login_required 
def load_investment_types_ohs(request):
    """Load investment types and KPI descriptions for OHS form based on selected project"""
    from django.http import JsonResponse
    from PIU_Financial_mgt.models import KPI_For_Contract
    import logging
    
    logger = logging.getLogger(__name__)
    project_id = request.GET.get('project_id')
    logger.debug(f"OHS AJAX called with project_id: {project_id}")
    
    try:
        if project_id:
            # Get investment types for specific project (using projectID field)
            investment_types = KPI_For_Contract.objects.filter(
                project__projectID=project_id
            ).values('monitoring_Type_Code', 'type_of_investment').distinct()
            
            # Get KPI descriptions for the project (using correct field name: Kpi_description)
            kpi_descriptions = KPI_For_Contract.objects.filter(
                project__projectID=project_id
            ).values('monitoring_Type_Code', 'Kpi_description').distinct()
            
            investment_list = [
                {'id': inv['monitoring_Type_Code'], 'name': inv['type_of_investment']} 
                for inv in investment_types if inv['type_of_investment']
            ]
            
            kpi_list = [
                {'id': kpi['monitoring_Type_Code'], 'name': kpi['Kpi_description']} 
                for kpi in kpi_descriptions if kpi['Kpi_description']
            ]
            
            logger.debug(f"Found {len(investment_list)} investments, {len(kpi_list)} KPIs")
            
            response_data = {
                'investment_types': investment_list,
                'kpi_descriptions': kpi_list
            }
            logger.debug(f"Returning JSON response: {response_data}")
            return JsonResponse(response_data)
        else:
            # No project selected - return empty lists
            logger.debug("No project_id provided, returning empty lists")
            return JsonResponse({'investment_types': [], 'kpi_descriptions': []})
            
    except Exception as e:
        logger.error(f"Error in load_investment_types_ohs: {str(e)}")
        return JsonResponse({'investment_types': [], 'kpi_descriptions': [], 'error': str(e)})


@login_required
def ohs_add(request):
    """Add new OHS record with improved form handling"""
    if request.method == 'POST':
        form = OHSMonitoringForm(request.POST, request.FILES)
        if form.is_valid():
            try:
                ohs = form.save(commit=False)
                ohs.loginUser = request.user
                
                # Set default values for optional fields
                if not ohs.male:
                    ohs.male = 0
                if not ohs.female:
                    ohs.female = 0
                if not ohs.youth_male:
                    ohs.youth_male = 0
                if not ohs.youth_female:
                    ohs.youth_female = 0
                
                ohs.save()
                messages.success(request, 'OHS record added successfully.')
                
                # Redirect to list with success message
                return redirect('ohs_list')
            except Exception as e:
                messages.error(request, f'Error saving OHS record: {str(e)}')
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f'OHS save error: {str(e)}')
        else:
            # Show form validation errors with better debugging
            messages.error(request, 'Please correct the following errors:')
            for field, errors in form.errors.items():
                for error in errors:
                    messages.error(request, f'{field}: {error}')
            # Add debug info for troubleshooting
            import logging
            logger = logging.getLogger(__name__)
            logger.debug(f'Form errors: {form.errors}')
            logger.debug(f'Form data: {form.data}')
    else:
        form = OHSMonitoringForm()
    
    return render(request, 'social_and_env/ohs/ohs_form.html', {
        'form': form,
        'title': 'Add OHS Record'
    })


@login_required
def load_kpi_descriptions_ohs(request):
    """Load KPI descriptions for OHS form based on selected project"""
    from django.http import JsonResponse
    from PIU_Financial_mgt.models import KPI_For_Contract
    
    project_id = request.GET.get('project_id')
    
    try:
        if project_id:
            # Get KPI descriptions for the project (using correct field name: Kpi_description)
            kpi_descriptions = KPI_For_Contract.objects.filter(
                project__projectID=project_id
            ).values('monitoring_Type_Code', 'Kpi_description').distinct()
            
            kpi_list = [
                {'id': kpi['monitoring_Type_Code'], 'name': kpi['Kpi_description']} 
                for kpi in kpi_descriptions if kpi['Kpi_description']
            ]
            
            return JsonResponse({'kpi_descriptions': kpi_list})
        else:
            return JsonResponse({'kpi_descriptions': []})
            
    except Exception as e:
        return JsonResponse({'kpi_descriptions': [], 'error': str(e)})


@login_required
def ohs_detail(request, pk):
    """Detail view for OHS monitoring record"""
    try:
        ohs = get_object_or_404(OHS_Monitoring.objects.select_related(
            'project', 'Type_of_Investment', 'year_of_report', 'quarter', 
            'region', 'district', 'settlement', 'loginUser'
        ), pk=pk)
        
        context = {
            'ohs': ohs,
            'title': f'OHS Monitoring - {ohs.project.project if ohs.project else "Unknown"}',
        }
        
        return render(request, 'social_and_env/ohs/ohs_detail.html', context)
    
    except Exception as e:
        messages.error(request, f'Error loading OHS details: {str(e)}')
        return redirect('ohs_list')


@login_required
def ohs_edit(request, pk):
    """Edit OHS monitoring record with improved handling"""
    try:
        ohs = get_object_or_404(OHS_Monitoring.objects.select_related(
            'project', 'Type_of_Investment', 'year_of_report', 'quarter',
            'region', 'district', 'settlement'
        ), pk=pk)
    except OHS_Monitoring.DoesNotExist:
        messages.error(request, 'OHS record not found.')
        return redirect('ohs_list')
    
    if request.method == 'POST':
        form = OHSMonitoringForm(request.POST, request.FILES, instance=ohs)
        if form.is_valid():
            try:
                ohs = form.save(commit=False)
                ohs.loginUser = request.user
                
                # Ensure numeric fields have valid values
                if not ohs.male:
                    ohs.male = 0
                if not ohs.female:
                    ohs.female = 0
                if not ohs.youth_male:
                    ohs.youth_male = 0
                if not ohs.youth_female:
                    ohs.youth_female = 0
                
                ohs.save()
                messages.success(request, 'OHS record updated successfully.')
                return redirect('ohs_list')
            except ValidationError as e:
                messages.error(request, f'Validation error: {str(e)}')
            except Exception as e:
                messages.error(request, f'Error updating OHS record: {str(e)}')
        else:
            # Show form validation errors
            for field, errors in form.errors.items():
                for error in errors:
                    messages.error(request, f'{field}: {error}')
    else:
        form = OHSMonitoringForm(instance=ohs)
    
    return render(request, 'social_and_env/ohs/ohs_form.html', {
        'form': form,
        'ohs': ohs,
        'title': 'Edit OHS Record'
    })


@login_required
def ohs_delete(request, pk):
    """Delete OHS monitoring record with improved error handling"""
    try:
        ohs = get_object_or_404(OHS_Monitoring.objects.select_related(
            'project', 'Type_of_Investment', 'region', 'district', 'settlement'
        ), pk=pk)
    except OHS_Monitoring.DoesNotExist:
        messages.error(request, 'OHS record not found.')
        return redirect('ohs_list')
    
    if request.method == 'POST':
        try:
            ohs_project = ohs.project.project if ohs.project else "Unknown"
            ohs_id = ohs.ohs_Id
            ohs.delete()
            messages.success(request, f'OHS record OHS-{ohs_id} for project {ohs_project} deleted successfully.')
            return redirect('ohs_list')
        except Exception as e:
            messages.error(request, f'Error deleting OHS record: {str(e)}')
            return redirect('ohs_detail', pk=pk)
    
    return render(request, 'social_and_env/ohs/ohs_confirm_delete.html', {
        'ohs': ohs,
        'title': 'Delete OHS Record'
    })


@login_required
def export_ohs_excel(request):
    """Export OHS monitoring data to Excel"""
    import openpyxl
    from openpyxl.styles import Font, Alignment, PatternFill
    from django.http import HttpResponse
    import io
    
    try:
        # Create workbook and worksheet
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "OHS Monitoring Data"
        
        # Headers
        headers = [
            'OHS ID', 'Project', 'Investment Type', 'Year', 'Quarter', 'Date',
            'Region', 'District', 'Settlement', 'Male Workers', 'Female Workers',
            'Youth Male', 'Youth Female', 'Total Workers', 'Quality Requirements',
            'Working Environment', 'Remarks', 'Created By', 'Created Date'
        ]
        
        # Style headers
        header_font = Font(bold=True, color="FFFFFF")
        header_fill = PatternFill(start_color="366092", end_color="366092", fill_type="solid")
        header_alignment = Alignment(horizontal="center", vertical="center")
        
        for col, header in enumerate(headers, 1):
            cell = ws.cell(row=1, column=col, value=header)
            cell.font = header_font
            cell.fill = header_fill
            cell.alignment = header_alignment
        
        # Get OHS data with related fields
        ohs_records = OHS_Monitoring.objects.select_related(
            'project', 'Type_of_Investment', 'year_of_report', 'quarter',
            'region', 'district', 'settlement', 'loginUser'
        ).order_by('-date')
        
        # Add data rows
        for row, ohs in enumerate(ohs_records, 2):
            ws.cell(row=row, column=1, value=f"OHS-{ohs.ohs_Id}")
            ws.cell(row=row, column=2, value=ohs.project.project if ohs.project else "N/A")
            ws.cell(row=row, column=3, value=ohs.Type_of_Investment.monitoring_Type_Code if ohs.Type_of_Investment else "N/A")
            ws.cell(row=row, column=4, value=ohs.year_of_report.year_name if ohs.year_of_report else "N/A")
            ws.cell(row=row, column=5, value=ohs.quarter.quarter_name if ohs.quarter else "N/A")
            ws.cell(row=row, column=6, value=ohs.date.strftime('%Y-%m-%d') if ohs.date else "N/A")
            ws.cell(row=row, column=7, value=ohs.region.region_name if ohs.region else "N/A")
            ws.cell(row=row, column=8, value=ohs.district.district_name if ohs.district else "N/A")
            ws.cell(row=row, column=9, value=ohs.settlement.settlement_name if ohs.settlement else "N/A")
            ws.cell(row=row, column=10, value=ohs.male or 0)
            ws.cell(row=row, column=11, value=ohs.female or 0)
            ws.cell(row=row, column=12, value=ohs.youth_male or 0)
            ws.cell(row=row, column=13, value=ohs.youth_female or 0)
            ws.cell(row=row, column=14, value=ohs.total_workers)
            ws.cell(row=row, column=15, value=ohs.quality_at_entry_requirement or "N/A")
            ws.cell(row=row, column=16, value=ohs.working_environment or "N/A")
            ws.cell(row=row, column=17, value=ohs.remarks or "N/A")
            ws.cell(row=row, column=18, value=ohs.loginUser.username if ohs.loginUser else "N/A")
            ws.cell(row=row, column=19, value=ohs.date_created.strftime('%Y-%m-%d %H:%M') if ohs.date_created else "N/A")
        
        # Auto-adjust column widths
        for column in ws.columns:
            max_length = 0
            column_letter = column[0].column_letter
            for cell in column:
                try:
                    if len(str(cell.value)) > max_length:
                        max_length = len(str(cell.value))
                except:
                    pass
            adjusted_width = min(max_length + 2, 50)
            ws.column_dimensions[column_letter].width = adjusted_width
        
        # Save to response
        output = io.BytesIO()
        wb.save(output)
        output.seek(0)
        
        response = HttpResponse(
            output.getvalue(),
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = 'attachment; filename="OHS_Monitoring_Data.xlsx"'
        
        return response
        
    except Exception as e:
        messages.error(request, f'Error exporting OHS data: {str(e)}')
        return redirect('ohs_list')


# ======================== Community Engagement Views ========================
@login_required
def community_list(request):
    """Enhanced Community Engagement list view with filtering and pagination"""
    from django.core.paginator import Paginator
    from django.db.models import Sum
    
    try:
        engagements = CommunityConsult_Engagement.objects.select_related(
            'project_name', 'stake_holder_engagement_Types', 'year', 'loginUser'
        ).all()
        
        # Apply filters
        if request.GET.get('project'):
            engagements = engagements.filter(project_name=request.GET.get('project'))
        
        if request.GET.get('engagement_type'):
            engagements = engagements.filter(stake_holder_engagement_Types=request.GET.get('engagement_type'))
        
        if request.GET.get('year'):
            engagements = engagements.filter(year=request.GET.get('year'))
        
        if request.GET.get('search'):
            search_term = request.GET.get('search')
            engagements = engagements.filter(
                models.Q(place_of_event__icontains=search_term) |
                models.Q(key_issues_discussed__icontains=search_term) |
                models.Q(reference_number__icontains=search_term)
            )
        
        # Pagination
        page_size = request.GET.get('page_size', 10)
        try:
            page_size = int(page_size)
            if page_size not in [10, 15, 25, 50, 100]:
                page_size = 10
        except (ValueError, TypeError):
            page_size = 10
        
        paginator = Paginator(engagements, page_size)
        page_number = request.GET.get('page')
        page_obj = paginator.get_page(page_number)
        
        # Get statistics with correct field names
        stats = {
            'total_engagements': CommunityConsult_Engagement.objects.count(),
            'filtered_count': engagements.count(),
            'total_male_participants': engagements.aggregate(total=Sum('male'))['total'] or 0,
            'total_female_participants': engagements.aggregate(total=Sum('female'))['total'] or 0,
            'total_participants': engagements.aggregate(total=Sum('total_participants'))['total'] or 0,
        }
        
        # Get filter data
        from PIU_Financial_mgt.models import Project
        from setup.models import YEAR
        projects = Project.objects.filter(project='National Electricity and Water Company')
        years = YEAR.objects.all()
        engagement_types = TypeOfStakeholderEngagement.objects.all()
        
        context = {
            'page_obj': page_obj,
            'stats': stats,
            'projects': projects,
            'years': years,
            'engagement_types': engagement_types,
            'title': 'Community Engagement'
        }
        
        return render(request, 'social_and_env/community/community_list.html', context)
    
    except Exception as e:
        messages.error(request, f'Error loading community engagements: {str(e)}')
        # Get filter data for error case
        try:
            from PIU_Financial_mgt.models import Project
            from setup.models import YEAR
            projects = Project.objects.filter(project='National Electricity and Water Company')
            years = YEAR.objects.all()
            engagement_types = TypeOfStakeholderEngagement.objects.all()
        except:
            projects = []
            years = []
            engagement_types = []
        
        return render(request, 'social_and_env/community/community_list.html', {
            'page_obj': None,
            'stats': {},
            'projects': projects,
            'years': years,
            'engagement_types': engagement_types,
            'title': 'Community Engagement'
        })


@login_required
def community_add(request):
    """Add new Community Engagement record"""
    if request.method == 'POST':
        form = CommunityEngagementForm(request.POST, request.FILES)
        if form.is_valid():
            try:
                engagement = form.save(commit=False)
                engagement.loginUser = request.user
                engagement.save()
                messages.success(request, 'Community engagement record added successfully.')
                return redirect('community_list')
            except Exception as e:
                messages.error(request, f'Error saving community engagement record: {str(e)}')
    else:
        form = CommunityEngagementForm()
    
    return render(request, 'social_and_env/community/community_form.html', {
        'form': form,
        'title': 'Add Community Engagement Record'
    })


@login_required
def community_detail(request, pk):
    """Community Engagement detail view"""
    try:
        engagement = get_object_or_404(CommunityConsult_Engagement.objects.select_related(
            'project_name', 'stake_holder_engagement_Types', 'year', 'loginUser'
        ), pk=pk)
        
        context = {
            'engagement': engagement,
            'title': f'Community Engagement - {engagement.project_name.project if engagement.project_name else "Unknown"}',
        }
        
        return render(request, 'social_and_env/community/community_detail.html', context)
    
    except Exception as e:
        messages.error(request, f'Error loading community engagement details: {str(e)}')
        return redirect('community_list')


@login_required
def community_edit(request, pk):
    """Edit Community Engagement record"""
    engagement = get_object_or_404(CommunityConsult_Engagement, pk=pk)
    
    if request.method == 'POST':
        form = CommunityEngagementForm(request.POST, request.FILES, instance=engagement)
        if form.is_valid():
            try:
                engagement = form.save(commit=False)
                engagement.loginUser = request.user
                engagement.save()
                messages.success(request, 'Community engagement record updated successfully.')
                return redirect('community_list')
            except Exception as e:
                messages.error(request, f'Error updating community engagement record: {str(e)}')
    else:
        form = CommunityEngagementForm(instance=engagement)
    
    return render(request, 'social_and_env/community/community_form.html', {
        'form': form,
        'title': 'Edit Community Engagement Record'
    })


@login_required
def community_delete(request, pk):
    """Delete Community Engagement record"""
    engagement = get_object_or_404(CommunityConsult_Engagement, pk=pk)
    
    if request.method == 'POST':
        try:
            engagement.delete()
            messages.success(request, 'Community engagement record deleted successfully.')
            return redirect('community_list')
        except Exception as e:
            messages.error(request, f'Error deleting community engagement record: {str(e)}')
    
    return render(request, 'social_and_env/community/community_confirm_delete.html', {
        'engagement': engagement,
        'title': 'Delete Community Engagement Record'
    })


# ======================== ESIA Views ========================
@login_required
def esia_list(request):
    """Enhanced ESIA list view with filtering and pagination"""
    from django.core.paginator import Paginator
    
    try:
        esias = ESIA.objects.select_related(
            'project_name', 'type_of_investment', 'loginUser'
        ).all()
        
        # Apply filters
        if request.GET.get('project'):
            esias = esias.filter(project_name=request.GET.get('project'))
        
        if request.GET.get('region'):
            # Since ESIA doesn't have region field, we'll skip this filter
            pass
        
        # Pagination
        page_size = request.GET.get('page_size', 10)
        try:
            page_size = int(page_size)
            if page_size not in [10, 15, 25, 50, 100]:
                page_size = 10
        except (ValueError, TypeError):
            page_size = 10
        
        paginator = Paginator(esias, page_size)
        page_number = request.GET.get('page')
        page_obj = paginator.get_page(page_number)
        
        # Get statistics
        stats = {
            'total_esia': ESIA.objects.count(),
            'filtered_count': esias.count(),
            'total_communities': esias.aggregate(total=Sum('number_of_communities'))['total'] or 0,
        }
        
        # Get filter data
        from PIU_Financial_mgt.models import Project
        projects = Project.objects.all()
        regions = Regions.objects.all()
        years = [record.date_created.year for record in ESIA.objects.all()]
        years = sorted(list(set(years)))
        
        context = {
            'page_obj': page_obj,
            'stats': stats,
            'projects': projects,
            'regions': regions,
            'years': years,
            'title': 'ESIA/ESMP Management'
        }
        
        return render(request, 'social_and_env/esia/esia_list.html', context)
    
    except Exception as e:
        messages.error(request, f'Error loading ESIA/ESMP records: {str(e)}')
        # Get filter data for error case
        from PIU_Financial_mgt.models import Project
        projects = Project.objects.all()
        regions = Regions.objects.all()
        years = []
        
        return render(request, 'social_and_env/esia/esia_list.html', {
            'page_obj': None,
            'stats': {},
            'projects': projects,
            'regions': regions,
            'years': years,
            'title': 'ESIA/ESMP Management'
        })


@login_required
def esia_add(request):
    """Add new ESIA/ESMP record"""
    if request.method == 'POST':
        form = ESIAForm(request.POST)
        if form.is_valid():
            try:
                esia = form.save(commit=False)
                esia.loginUser = request.user
                esia.save()
                messages.success(request, 'ESIA/ESMP record added successfully.')
                return redirect('esia_list')
            except Exception as e:
                messages.error(request, f'Error saving ESIA/ESMP record: {str(e)}')
    else:
        form = ESIAForm()
    
    return render(request, 'social_and_env/esia/esia_form.html', {
        'form': form,
        'title': 'Add ESIA/ESMP Record'
    })


@login_required
def esia_detail(request, pk):
    """ESIA/ESMP detail view"""
    try:
        esia = get_object_or_404(ESIA.objects.select_related(
            'project_name', 'type_of_investment', 'loginUser'
        ), pk=pk)
        
        context = {
            'esia': esia,
            'title': f'ESIA/ESMP Details - {esia.project_name.project if esia.project_name else "Unknown"}',
        }
        
        return render(request, 'social_and_env/esia/esia_detail.html', context)
    
    except Exception as e:
        messages.error(request, f'Error loading ESIA/ESMP details: {str(e)}')
        return redirect('esia_list')





@login_required
def esia_delete(request, pk):
    """Delete ESIA record"""
    esia = get_object_or_404(ESIA, pk=pk)
    
    if request.method == 'POST':
        try:
            esia.delete()
            messages.success(request, 'ESIA record deleted successfully.')
            return redirect('esia_list')
        except Exception as e:
            messages.error(request, f'Error deleting ESIA record: {str(e)}')
    
    return render(request, 'social_and_env/esia/esia_confirm_delete.html', {
        'esia': esia,
        'title': 'Delete ESIA Record'
    })


# ======================== Additional AJAX Views ========================
@login_required
def load_investment_types(request):
    """Load investment types based on project selection"""
    from django.http import HttpResponse
    
    project_id = request.GET.get('project')
    if not project_id:
        return HttpResponse('<option value="">Select Investment Type</option>')
    
    try:
        investment_types = KPI_For_Contract.objects.filter(
            project=project_id
        ).values_list('type_of_investment', flat=True).distinct().order_by('type_of_investment')
        
        options = '<option value="">Select Investment Type</option>'
        for investment_type in investment_types:
            options += f'<option value="{investment_type}">{investment_type}</option>'
        
        return HttpResponse(options)
    
    except Exception as e:
        return HttpResponse(f'<option value="">Error: {str(e)}</option>')


@login_required
def load_investment_types_grievance(request):
    """Load investment types for Grievance based on project selection"""
    from django.http import HttpResponse
    
    project_id = request.GET.get('project')
    if not project_id:
        return HttpResponse('<option value="">Select Investment Type</option>')
    
    try:
        investment_types = KPI_For_Contract.objects.filter(
            project=project_id
        ).values_list('type_of_investment', flat=True).distinct().order_by('type_of_investment')
        
        options = '<option value="">Select Investment Type</option>'
        for investment_type in investment_types:
            options += f'<option value="{investment_type}">{investment_type}</option>'
        
        return HttpResponse(options)
    
    except Exception as e:
        return HttpResponse(f'<option value="">Error: {str(e)}</option>')





@login_required
def load_districts_ohs(request):
    """Load districts for OHS based on selected region"""
    from django.http import HttpResponse
    
    region_id = request.GET.get('region')
    if not region_id:
        return HttpResponse('<option value="">Select District</option>')
    
    try:
        districts = Districts.objects.filter(
            region_code=region_id
        ).values_list('district_code', 'district_name').order_by('district_name')
        
        options = '<option value="">Select District</option>'
        for district_code, district_name in districts:
            options += f'<option value="{district_code}">{district_name}</option>'
        
        return HttpResponse(options)
    
    except Exception as e:
        return HttpResponse(f'<option value="">Error: {str(e)}</option>')


@login_required
def load_settlements_ohs(request):
    """Load settlements for OHS based on selected district"""
    from django.http import HttpResponse
    
    district_id = request.GET.get('district')
    if not district_id:
        return HttpResponse('<option value="">Select Settlement</option>')
    
    try:
        settlements = Settlement.objects.filter(
            district_code=district_id
        ).values_list('settlement_code', 'settlement_name').order_by('settlement_name')
        
        options = '<option value="">Select Settlement</option>'
        for settlement_code, settlement_name in settlements:
            options += f'<option value="{settlement_code}">{settlement_name}</option>'
        
        return HttpResponse(options)
    
    except Exception as e:
        return HttpResponse(f'<option value="">Error: {str(e)}</option>')


@login_required
def test_cascading_dropdown(request):
    """Test endpoint to validate cascading dropdown functionality"""
    from django.http import JsonResponse
    
    try:
        # Test data for cascading dropdowns
        test_data = {
            'status': 'success',
            'message': 'Cascading dropdown test endpoint working',
            'regions': list(Regions.objects.values('region_code', 'region_name')),
            'districts': list(Districts.objects.values('district_code', 'district_name', 'region_code')),
            'settlements': list(Settlement.objects.values('settlement_code', 'settlement_name', 'district_code')),
            'projects': list(Project.objects.values('project', 'project_name')),
        }
        
        return JsonResponse(test_data)
    
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        })








@login_required
def load_investment_types_pap(request):
    """Load investment types for PAP based on project selection"""
    from django.http import HttpResponse, JsonResponse
    
    project_id = request.GET.get('project') or request.GET.get('project_id')
    if not project_id:
        if request.headers.get('Content-Type') == 'application/json':
            return JsonResponse({'investment_types': []})
        return HttpResponse('<option value="">Select Investment Type</option>')
    
    try:
        investment_types = KPI_For_Contract.objects.filter(
            project=project_id
        ).distinct().order_by('type_of_investment')
        
        # Check if requesting JSON format (for edit forms)
        if request.headers.get('Content-Type') == 'application/json' or 'project_id' in request.GET:
            investment_data = []
            for investment in investment_types:
                investment_data.append({
                    'id': investment.monitoring_Type_Code,
                    'name': investment.type_of_investment
                })
            return JsonResponse({'investment_types': investment_data})
        
        # Return HTML options (for add forms)
        options = '<option value="">Select Investment Type</option>'
        for investment in investment_types:
            options += f'<option value="{investment.monitoring_Type_Code}">{investment.type_of_investment}</option>'
        
        return HttpResponse(options)
    
    except Exception as e:
        if request.headers.get('Content-Type') == 'application/json' or 'project_id' in request.GET:
            return JsonResponse({'error': str(e), 'investment_types': []})
        return HttpResponse(f'<option value="">Error: {str(e)}</option>')


@login_required
def load_investment_types_esia(request):
    """Load investment types for ESIA based on project selection"""
    from django.http import HttpResponse
    
    project_id = request.GET.get('project')
    if not project_id:
        return HttpResponse('<option value="">Select Investment Type</option>')
    
    try:
        investment_types = KPI_For_Contract.objects.filter(
            project=project_id
        ).values_list('type_of_investment', flat=True).distinct().order_by('type_of_investment')
        
        options = '<option value="">Select Investment Type</option>'
        for investment_type in investment_types:
            options += f'<option value="{investment_type}">{investment_type}</option>'
        
        return HttpResponse(options)
    
    except Exception as e:
        return HttpResponse(f'<option value="">Error: {str(e)}</option>')


@login_required
def esia_export_excel(request):
    """Export ESIA data to Excel"""
    import openpyxl
    from django.http import HttpResponse
    
    try:
        # Get all ESIA records
        esias = ESIA.objects.select_related(
            'project', 'Type_of_Investment', 'year_of_report', 'quarter', 'loginUser'
        ).all()
        
        # Create workbook and worksheet
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = 'ESIA Data'
        
        # Add headers
        headers = [
            'Project', 'Investment Type', 'Year', 'Quarter', 'Region', 
            'Number of Communities', 'ESIA Findings', 'Created By', 'Date Created'
        ]
        
        for col, header in enumerate(headers, 1):
            ws.cell(row=1, column=col, value=header)
        
        # Add data rows
        for row, esia in enumerate(esias, 2):
            ws.cell(row=row, column=1, value=esia.project.project if esia.project else '')
            ws.cell(row=row, column=2, value=esia.Type_of_Investment.type_of_investment if esia.Type_of_Investment else '')
            ws.cell(row=row, column=3, value=esia.year_of_report.year if esia.year_of_report else '')
            ws.cell(row=row, column=4, value=esia.quarter.quarter if esia.quarter else '')
            ws.cell(row=row, column=5, value=esia.region)
            ws.cell(row=row, column=6, value=esia.number_of_communities)
            ws.cell(row=row, column=7, value=esia.esia_findings)
            ws.cell(row=row, column=8, value=esia.loginUser.username if esia.loginUser else '')
            ws.cell(row=row, column=9, value=esia.date_created.strftime('%Y-%m-%d') if esia.date_created else '')
        
        # Set up response
        response = HttpResponse(
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = 'attachment; filename="esia_data.xlsx"'
        
        wb.save(response)
        return response
    
    except Exception as e:
        messages.error(request, f'Error exporting ESIA data: {str(e)}')
        return redirect('esia_list')


@login_required
def pap_detail(request, pk):
    """PAP detail view"""
    try:
        pap = get_object_or_404(PAP.objects.select_related(
            'project', 'type_of_investment', 'region', 'district', 
            'pap_category', 'loginUser'
        ), pk=pk)
        
        context = {
            'pap': pap,
            'title': f'PAP Details - {pap.pap_name}',
        }
        
        return render(request, 'social_and_env/pap/pap_detail.html', context)
    
    except Exception as e:
        messages.error(request, f'Error loading PAP details: {str(e)}')
        return redirect('pap_list')
