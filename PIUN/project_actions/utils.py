import os
from datetime import datetime, timedelta
from django.http import HttpResponse
from django.utils import timezone
from django.db.models import Sum, Count, Avg, Q
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

from .models import Contract_Profiling_works, Contract_Profiling_goods_services, Specific_Contract_Monitoring


def export_works_contracts_to_excel(queryset=None):
    """Export Contract Profiling Works to Excel with advanced formatting"""
    
    if queryset is None:
        queryset = Contract_Profiling_works.objects.all().select_related(
            'projectID', 'compID', 'subcompID', 'activityID', 'project_Category',
            'funding_source', 'currency', 'loginUser'
        )
    
    # Create workbook and worksheet
    workbook = openpyxl.Workbook()
    worksheet = workbook.active
    worksheet.title = "Works Contracts"
    
    # Define styles
    header_font = Font(bold=True, color="FFFFFF")
    header_fill = PatternFill(start_color="366092", end_color="366092", fill_type="solid")
    header_alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
    
    data_alignment = Alignment(horizontal="left", vertical="top", wrap_text=True)
    number_alignment = Alignment(horizontal="right", vertical="center")
    date_alignment = Alignment(horizontal="center", vertical="center")
    
    border = Border(
        left=Side(style='thin'),
        right=Side(style='thin'),
        top=Side(style='thin'),
        bottom=Side(style='thin')
    )
    
    # Headers
    headers = [
        'Contract Ref No', 'Project', 'Component', 'Subcomponent', 'Activity',
        'Category', 'Funding Source', 'Currency', 'Contract Value',
        'Contractor', 'Consultant', 'Start Date', 'End Date', 'Duration',
        'Location', 'Latitude', 'Longitude', 'Floor Area (m²)',
        'Beneficiaries', 'Intervention Focus', 'Amendments', 'Remarks',
        'Created By', 'Created Date'
    ]
    
    # Write headers
    for col_num, header in enumerate(headers, 1):
        cell = worksheet.cell(row=1, column=col_num)
        cell.value = header
        cell.font = header_font
        cell.fill = header_fill
        cell.alignment = header_alignment
        cell.border = border
    
    # Write data
    for row_num, contract in enumerate(queryset, 2):
        data = [
            contract.contract_refNo,
            str(contract.projectID) if contract.projectID else '',
            str(contract.compID) if contract.compID else '',
            str(contract.subcompID) if contract.subcompID else '',
            str(contract.activityID) if contract.activityID else '',
            str(contract.project_Category) if contract.project_Category else '',
            str(contract.funding_source) if contract.funding_source else '',
            str(contract.currency) if contract.currency else '',
            float(contract.contract_value) if contract.contract_value else 0,
            contract.name_of_contractor or '',
            contract.name_of_consultant or '',
            contract.contract_start_date,
            contract.contract_end_date,
            contract.duration or '',
            contract.location_of_investment or '',
            float(contract.Latitude) if contract.Latitude else '',
            float(contract.Longitude) if contract.Longitude else '',
            contract.gross_floor_area_m2 or '',
            contract.target_number_of_beneficiary_settlements or '',
            contract.main_intervention_focus_result or '',
            'Yes' if contract.amendments else 'No',
            contract.remarks or '',
            str(contract.loginUser) if contract.loginUser else '',
            contract.date.strftime('%Y-%m-%d %H:%M') if contract.date else ''
        ]
        
        for col_num, value in enumerate(data, 1):
            cell = worksheet.cell(row=row_num, column=col_num)
            cell.value = value
            cell.border = border
            
            # Apply specific formatting based on data type
            if col_num == 9:  # Contract Value
                cell.alignment = number_alignment
                cell.number_format = '#,##0.00'
            elif col_num in [12, 13]:  # Dates
                cell.alignment = date_alignment
                if value:
                    cell.number_format = 'YYYY-MM-DD'
            elif col_num in [16, 17]:  # Coordinates
                cell.alignment = number_alignment
                cell.number_format = '0.000000'
            else:
                cell.alignment = data_alignment
    
    # Auto-adjust column widths
    for column in worksheet.columns:
        max_length = 0
        column_letter = get_column_letter(column[0].column)
        
        for cell in column:
            try:
                if len(str(cell.value)) > max_length:
                    max_length = len(str(cell.value))
            except:
                pass
        
        adjusted_width = min(max_length + 2, 50)
        worksheet.column_dimensions[column_letter].width = adjusted_width
    
    # Freeze header row
    worksheet.freeze_panes = 'A2'
    
    # Create response
    response = HttpResponse(
        content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    response['Content-Disposition'] = f'attachment; filename="works_contracts_{datetime.now().strftime("%Y%m%d_%H%M%S")}.xlsx"'
    
    workbook.save(response)
    return response


def export_goods_services_contracts_to_excel(queryset=None):
    """Export Contract Profiling Goods & Services to Excel"""
    
    if queryset is None:
        queryset = Contract_Profiling_goods_services.objects.all().select_related(
            'projectID', 'compID', 'subcompID', 'activityID', 'project_Category',
            'funding_source', 'currency', 'loginUser'
        )
    
    # Create workbook and worksheet
    workbook = openpyxl.Workbook()
    worksheet = workbook.active
    worksheet.title = "Goods & Services Contracts"
    
    # Define styles (same as works contracts)
    header_font = Font(bold=True, color="FFFFFF")
    header_fill = PatternFill(start_color="28a745", end_color="28a745", fill_type="solid")
    header_alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
    
    data_alignment = Alignment(horizontal="left", vertical="top", wrap_text=True)
    number_alignment = Alignment(horizontal="right", vertical="center")
    date_alignment = Alignment(horizontal="center", vertical="center")
    
    border = Border(
        left=Side(style='thin'),
        right=Side(style='thin'),
        top=Side(style='thin'),
        bottom=Side(style='thin')
    )
    
    # Headers
    headers = [
        'Contract Ref No', 'Project', 'Component', 'Subcomponent', 'Activity',
        'Category', 'Funding Source', 'Currency', 'Contract Value',
        'Supplier', 'Consultant', 'Start Date', 'End Date', 'Duration',
        'Amendments', 'Remarks', 'Created By', 'Created Date'
    ]
    
    # Write headers
    for col_num, header in enumerate(headers, 1):
        cell = worksheet.cell(row=1, column=col_num)
        cell.value = header
        cell.font = header_font
        cell.fill = header_fill
        cell.alignment = header_alignment
        cell.border = border
    
    # Write data
    for row_num, contract in enumerate(queryset, 2):
        data = [
            contract.contract_refNo,
            str(contract.projectID) if contract.projectID else '',
            str(contract.compID) if contract.compID else '',
            str(contract.subcompID) if contract.subcompID else '',
            str(contract.activityID) if contract.activityID else '',
            str(contract.project_Category) if contract.project_Category else '',
            str(contract.funding_source) if contract.funding_source else '',
            str(contract.currency) if contract.currency else '',
            float(contract.contract_value) if contract.contract_value else 0,
            contract.name_of_Supplier or '',
            contract.name_of_consultant or '',
            contract.contract_start_date,
            contract.contract_end_date,
            contract.duration or '',
            'Yes' if contract.amendments else 'No',
            contract.remarks or '',
            str(contract.loginUser) if contract.loginUser else '',
            contract.date.strftime('%Y-%m-%d %H:%M') if contract.date else ''
        ]
        
        for col_num, value in enumerate(data, 1):
            cell = worksheet.cell(row=row_num, column=col_num)
            cell.value = value
            cell.border = border
            
            # Apply specific formatting based on data type
            if col_num == 9:  # Contract Value
                cell.alignment = number_alignment
                cell.number_format = '#,##0.00'
            elif col_num in [12, 13]:  # Dates
                cell.alignment = date_alignment
                if value:
                    cell.number_format = 'YYYY-MM-DD'
            else:
                cell.alignment = data_alignment
    
    # Auto-adjust column widths
    for column in worksheet.columns:
        max_length = 0
        column_letter = get_column_letter(column[0].column)
        
        for cell in column:
            try:
                if len(str(cell.value)) > max_length:
                    max_length = len(str(cell.value))
            except:
                pass
        
        adjusted_width = min(max_length + 2, 50)
        worksheet.column_dimensions[column_letter].width = adjusted_width
    
    # Freeze header row
    worksheet.freeze_panes = 'A2'
    
    # Create response
    response = HttpResponse(
        content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    response['Content-Disposition'] = f'attachment; filename="goods_services_contracts_{datetime.now().strftime("%Y%m%d_%H%M%S")}.xlsx"'
    
    workbook.save(response)
    return response


def export_monitoring_records_to_excel(queryset=None):
    """Export Contract Monitoring Records to Excel"""
    
    if queryset is None:
        queryset = Specific_Contract_Monitoring.objects.all().select_related(
            'project', 'quarter', 'type_of_monitoring', 'Type_of_Investment',
            'Kpi_description', 'Contract_implementation_Status', 'loginUser'
        )
    
    # Create workbook and worksheet
    workbook = openpyxl.Workbook()
    worksheet = workbook.active
    worksheet.title = "Monitoring Records"
    
    # Define styles
    header_font = Font(bold=True, color="FFFFFF")
    header_fill = PatternFill(start_color="17a2b8", end_color="17a2b8", fill_type="solid")
    header_alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
    
    data_alignment = Alignment(horizontal="left", vertical="top", wrap_text=True)
    date_alignment = Alignment(horizontal="center", vertical="center")
    
    border = Border(
        left=Side(style='thin'),
        right=Side(style='thin'),
        top=Side(style='thin'),
        bottom=Side(style='thin')
    )
    
    # Headers
    headers = [
        'Contract Ref No', 'Project', 'Monitoring Date', 'Quarter',
        'Monitoring Type', 'Investment Type', 'KPI Description',
        'Milestone Start', 'Milestone End', 'Target', 'Achieved Status',
        'Implementation Status', 'Remarks', 'Created By', 'Created Date'
    ]
    
    # Write headers
    for col_num, header in enumerate(headers, 1):
        cell = worksheet.cell(row=1, column=col_num)
        cell.value = header
        cell.font = header_font
        cell.fill = header_fill
        cell.alignment = header_alignment
        cell.border = border
    
    # Write data
    for row_num, record in enumerate(queryset, 2):
        data = [
            record.contract_refNo,
            str(record.project) if record.project else '',
            record.monitoring_date,
            str(record.quarter) if record.quarter else '',
            str(record.type_of_monitoring) if record.type_of_monitoring else '',
            str(record.Type_of_Investment) if record.Type_of_Investment else '',
            str(record.Kpi_description) if record.Kpi_description else '',
            record.milestone_start_date,
            record.milestone_end_date,
            record.Target or '',
            record.Achieved_status or '',
            str(record.Contract_implementation_Status) if record.Contract_implementation_Status else '',
            record.remarks or '',
            str(record.loginUser) if record.loginUser else '',
            record.date.strftime('%Y-%m-%d %H:%M') if record.date else ''
        ]
        
        for col_num, value in enumerate(data, 1):
            cell = worksheet.cell(row=row_num, column=col_num)
            cell.value = value
            cell.border = border
            
            # Apply specific formatting based on data type
            if col_num in [3, 8, 9]:  # Dates
                cell.alignment = date_alignment
                if value:
                    cell.number_format = 'YYYY-MM-DD'
            else:
                cell.alignment = data_alignment
    
    # Auto-adjust column widths
    for column in worksheet.columns:
        max_length = 0
        column_letter = get_column_letter(column[0].column)
        
        for cell in column:
            try:
                if len(str(cell.value)) > max_length:
                    max_length = len(str(cell.value))
            except:
                pass
        
        adjusted_width = min(max_length + 2, 50)
        worksheet.column_dimensions[column_letter].width = adjusted_width
    
    # Freeze header row
    worksheet.freeze_panes = 'A2'
    
    # Create response
    response = HttpResponse(
        content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    response['Content-Disposition'] = f'attachment; filename="monitoring_records_{datetime.now().strftime("%Y%m%d_%H%M%S")}.xlsx"'
    
    workbook.save(response)
    return response


def get_dashboard_analytics():
    """Get comprehensive analytics for dashboard"""
    
    today = timezone.now().date()
    
    analytics = {
        'works_contracts': {
            'total': 0,
            'active': 0,
            'completed': 0,
            'upcoming': 0,
            'total_value': 0,
            'with_amendments': 0,
        },
        'goods_services_contracts': {
            'total': 0,
            'active': 0,
            'completed': 0,
            'upcoming': 0,
            'total_value': 0,
            'with_amendments': 0,
        },
        'monitoring': {
            'total_records': 0,
            'unique_contracts': 0,
            'overdue_milestones': 0,
            'active_milestones': 0,
        },
        'recent_activity': {
            'works_contracts': [],
            'goods_services_contracts': [],
            'monitoring_records': [],
        }
    }
    
    try:
        # Works contracts analytics
        works_contracts = Contract_Profiling_works.objects.all()
        analytics['works_contracts'].update({
            'total': works_contracts.count(),
            'active': works_contracts.filter(
                contract_start_date__lte=today,
                contract_end_date__gte=today
            ).count(),
            'completed': works_contracts.filter(contract_end_date__lt=today).count(),
            'upcoming': works_contracts.filter(contract_start_date__gt=today).count(),
            'total_value': works_contracts.aggregate(
                total=Sum('contract_value')
            )['total'] or 0,
            'with_amendments': works_contracts.filter(amendments=True).count(),
        })
        
        # Goods & Services contracts analytics
        gs_contracts = Contract_Profiling_goods_services.objects.all()
        analytics['goods_services_contracts'].update({
            'total': gs_contracts.count(),
            'active': gs_contracts.filter(
                contract_start_date__lte=today,
                contract_end_date__gte=today
            ).count(),
            'completed': gs_contracts.filter(contract_end_date__lt=today).count(),
            'upcoming': gs_contracts.filter(contract_start_date__gt=today).count(),
            'total_value': gs_contracts.aggregate(
                total=Sum('contract_value')
            )['total'] or 0,
            'with_amendments': gs_contracts.filter(amendments=True).count(),
        })
        
        # Monitoring analytics
        monitoring_records = Specific_Contract_Monitoring.objects.all()
        analytics['monitoring'].update({
            'total_records': monitoring_records.count(),
            'unique_contracts': monitoring_records.values('contract_refNo').distinct().count(),
            'overdue_milestones': monitoring_records.filter(
                milestone_end_date__lt=today
            ).count(),
            'active_milestones': monitoring_records.filter(
                milestone_start_date__lte=today,
                milestone_end_date__gte=today
            ).count(),
        })
        
        # Recent activity
        analytics['recent_activity'].update({
            'works_contracts': works_contracts.order_by('-date')[:5],
            'goods_services_contracts': gs_contracts.order_by('-date')[:5],
            'monitoring_records': monitoring_records.order_by('-date')[:5],
        })
        
    except Exception as e:
        print(f"Error in dashboard analytics: {str(e)}")
    
    return analytics


def calculate_contract_duration_days(start_date, end_date):
    """Calculate contract duration in days"""
    if start_date and end_date:
        return (end_date - start_date).days
    return 0


def get_contract_status(start_date, end_date):
    """Get contract status based on dates"""
    today = timezone.now().date()
    
    if not start_date or not end_date:
        return 'unknown'
    
    if start_date > today:
        return 'upcoming'
    elif end_date < today:
        return 'completed'
    else:
        return 'active'


def get_milestone_status(start_date, end_date, monitoring_date=None):
    """Get milestone status"""
    today = timezone.now().date()
    
    if not start_date or not end_date:
        return 'unknown'
    
    if start_date > today:
        return 'upcoming'
    elif end_date < today:
        if monitoring_date and monitoring_date >= end_date:
            return 'completed'
        else:
            return 'overdue'
    else:
        return 'active'
