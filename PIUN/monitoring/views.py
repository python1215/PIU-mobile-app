from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.shortcuts import render, get_object_or_404, redirect
from .models import Results_Oriented_Monitoring
from django.contrib import messages

from .forms import Results_Oriented_MonitoringForm, updateResults_Oriented_MonitoringForm
# Using standard forms from forms.py
from django.contrib import messages

from setup.models import Indicator_Type
from PIU_Financial_mgt.models import ProjectOutCome, PDO, ProjectResult
from monitoring.models import Indicator_Description
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.core.paginator import Paginator


# Create your views here.

@login_required
def monitoring_dashboard(request):
    """Simple monitoring dashboard for offline deployment"""
    return render(request, 'monitoring/dashboard.html', {
        'page_title': 'Monitoring Dashboard'
    })

@login_required
@csrf_exempt
def get_indicator_descriptions(request):
    if request.method == "POST":
        project_id = request.POST.get('project')
        indicator_type = request.POST.get('indicator_type')
        descriptions = Indicator_Description.objects.filter(
            project_id=project_id,
            indicator_type=indicator_type
        ).values('id', 'description')
        return JsonResponse({'descriptions': list(descriptions)})
    return JsonResponse({'error': 'Invalid request'}, status=400)


@login_required
def load_project_PDO(request):
    project_id = request.GET.get("project")
    print("Received project:", project_id)
    pdos = PDO.objects.filter(project_id=project_id)
        
    print("pdos:", pdos)
    return render(request, "monitoring/result_oriented_monitoring/get_pdo.html", {"pdos": pdos})

@login_required
def load_project_Outcome(request):
    pdo_id = request.GET.get("pdo")
    print("Received PDO:", pdo_id)
    project_outcomes = ProjectOutCome.objects.filter(pdo_id=pdo_id)
    
    print("project_outcomes:", project_outcomes)
    return render(request, "monitoring/get_project_outcome.html", {"project_outcomes": project_outcomes})


@login_required
def load_project_Result(request):
    project_outcome_id = request.GET.get("project_outcome")
    print("Received Project Result:", project_outcome_id)
    projectResults = ProjectResult.objects.filter(project_outcome_id=project_outcome_id)
   
    print("projectResults:", projectResults)
    return render(request, "monitoring/result_oriented_monitoring/get_projectResult.html", {"projectResults": projectResults})

@login_required
def load_indicator_type(request):
    # Get the project_result_id from the GET request
    project_result_id = request.GET.get("project_result")
    
    # Fetch indicator types related to the selected project_result_id
    indicatorTypes = Indicator_Type.objects.filter(
        id__in=Indicator_Description.objects.filter(project_result_id=project_result_id).values('indicator_type')
    )

    print("Indicator Types:", indicatorTypes)  # Debugging to check the queryset
    
    # Return the template with the indicator_types context
    return render(request, 'monitoring/result_oriented_monitoring/get_IndicatorType.html', {'indicator_types': indicatorTypes})






#udate request
@login_required
def update_result_oriented_monitoring(request, pk):
    result_oriented_monitoring = get_object_or_404 (Results_Oriented_Monitoring, pk=pk)
    if request.method == "POST":
        form = updateResults_Oriented_MonitoringForm(request.POST, instance=result_oriented_monitoring)
        if form.is_valid():
            form.save()
            return render(request, 'monitoring/result_oriented_monitoring/result_oriented_monitoring_success.html', {'message': 'specific_contract_monitoring updated successfully'})
    else:
        form = updateResults_Oriented_MonitoringForm(instance=result_oriented_monitoring)
    return render(request, 'monitoring/result_oriented_monitoring/update-result_oriented_monitoring.html', {'form': form, 'result_oriented_monitoring': result_oriented_monitoring})

#Delete request
@login_required
@require_http_methods(["DELETE"])
def delete_result_oriented_monitoring(request, pk):
    result_oriented_monitoring = get_object_or_404(Results_Oriented_Monitoring, pk=pk)
    result_oriented_monitoring.delete()
    
    # Return success message for HTMX request
    context = {
        'message': "Data Deleted successfully!" 
    }
    return render(request, 'monitoring/result_oriented_monitoring/result_oriented_monitoring_success.html', context)



# Enhanced CRUD Views for Dashboard Integration
# Using standard forms

@login_required
def add_indicator_description(request):
    if request.method == 'POST':
        form = Indicator_DescriptionForm(request.POST)
        if form.is_valid():
            instance = form.save(commit=False)
            instance.loginUser = request.user
            instance.save()
            messages.success(request, "Indicator Description saved successfully!")
            return redirect('monitoring:enhanced-indicator-description-list')
    else:
        form = SimpleIndicatorDescriptionForm()
    
    context = {'form': form}
    return render(request, 'monitoring/indicator_description/add_indicator_description.html', context)


@login_required
def update_indicator_description(request, pk):
    indicator = get_object_or_404(Indicator_Description, pk=pk)
    if request.method == 'POST':
        form = Indicator_DescriptionForm(request.POST, instance=indicator)
        if form.is_valid():
            form.save()
            messages.success(request, "Indicator Description updated successfully!")
            return redirect('monitoring:enhanced-indicator-description-list')
    else:
        form = Indicator_DescriptionForm(instance=indicator)
    
    context = {'form': form, 'indicator': indicator}
    return render(request, 'monitoring/indicator_description/update_indicator_description.html', context)


@login_required
def delete_indicator_description(request, pk):
    indicator = get_object_or_404(Indicator_Description, pk=pk)
    if request.method == 'POST':
        indicator.delete()
        messages.success(request, "Indicator Description deleted successfully!")
        return redirect('monitoring:enhanced-indicator-description-list')
    
    context = {'indicator': indicator}
    return render(request, 'monitoring/indicator_description/delete_indicator_description.html', context)


@login_required
def add_results_monitoring(request):
    if request.method == 'POST':
        # Debug submitted data
        print("POST data:", dict(request.POST))
        form = Results_Oriented_MonitoringForm(request.POST)
        
        # Debug form queryset for project_outcome
        print("project_outcome queryset:", form.fields['project_outcome'].queryset)
        print("Available project_outcome IDs:", [obj.id for obj in form.fields['project_outcome'].queryset])
        
        if form.is_valid():
            instance = form.save(commit=False)
            instance.loginUser = request.user
            instance.save()
            messages.success(request, "Results Monitoring record saved successfully!")
            return redirect('monitoring:enhanced-results-monitoring-list')
        else:
            # Debug form errors
            print("Form validation errors:", form.errors)
            for field, errors in form.errors.items():
                print(f"Field '{field}': {errors}")
            messages.error(request, "Please correct the errors below.")
    else:
        form = Results_Oriented_MonitoringForm()
    
    context = {'form': form}
    return render(request, 'monitoring/results_monitoring/add_results_monitoring.html', context)


@login_required
def enhanced_results_monitoring_list(request):
    """Enhanced list view for Results Oriented Monitoring records"""
    monitoring_records = Results_Oriented_Monitoring.objects.all().select_related(
        'project', 'pdo', 'project_outcome', 'project_result', 
        'indicator_type', 'measurement_unit', 'collection_frequency',
        'year', 'quarter', 'loginUser'
    ).order_by('-date_created')
    
    context = {
        'monitoring_records': monitoring_records,
        'title': 'Enhanced Results Monitoring List'
    }
    return render(request, 'monitoring/results_monitoring/enhanced_results_monitoring_list.html', context)


@login_required
def update_results_monitoring(request, pk):
    monitoring = get_object_or_404(Results_Oriented_Monitoring, pk=pk)
    if request.method == 'POST':
        form = updateResults_Oriented_MonitoringForm(request.POST, instance=monitoring)
        if form.is_valid():
            instance = form.save(commit=False)
            instance.loginUser = request.user
            instance.save()
            messages.success(request, "Results Monitoring record updated successfully!")
            return redirect('monitoring:enhanced-results-monitoring-list')
    else:
        form = updateResults_Oriented_MonitoringForm(instance=monitoring)
    
    context = {'form': form, 'monitoring': monitoring}
    return render(request, 'monitoring/results_monitoring/update_results_monitoring.html', context)


@login_required
def delete_results_monitoring(request, pk):
    monitoring = get_object_or_404(Results_Oriented_Monitoring, pk=pk)
    if request.method == 'POST':
        monitoring.delete()
        messages.success(request, "Results Monitoring record deleted successfully!")
        return redirect('monitoring:enhanced-results-monitoring-list')
    
    context = {'monitoring': monitoring}
    return render(request, 'monitoring/results_monitoring/delete_results_monitoring.html', context)


@login_required
def detail_results_monitoring(request, pk):
    """Detail view for monitoring records"""
    try:
        record = get_object_or_404(Results_Oriented_Monitoring, pk=pk)
        
        # Initialize all variables with safe defaults
        performance_vs_target = 0
        performance_vs_baseline = 0
        variance_from_target = 0
        
        # Safe calculations with None checks
        if record.End_Target_Value and record.achieved_value:
            try:
                performance_vs_target = (float(record.achieved_value) / float(record.End_Target_Value)) * 100
                variance_from_target = float(record.achieved_value) - float(record.End_Target_Value)
            except (ValueError, ZeroDivisionError):
                pass
        
        if record.baseline_value and record.achieved_value:
            try:
                performance_vs_baseline = ((float(record.achieved_value) - float(record.baseline_value)) / float(record.baseline_value)) * 100
            except (ValueError, ZeroDivisionError):
                pass
        
        # Safe status determination
        if performance_vs_target >= 100:
            status = 'excellent'
            status_color = 'success'
        elif performance_vs_target >= 75:
            status = 'good'
            status_color = 'warning'
        elif performance_vs_target >= 50:
            status = 'fair'
            status_color = 'info'
        else:
            status = 'needs_improvement'
            status_color = 'danger'
        
        context = {
            'record': record,
            'page_title': f'Monitoring Details - {record.indicator_description}',
            'performance_vs_target': performance_vs_target,
            'performance_vs_baseline': performance_vs_baseline,
            'variance_from_target': variance_from_target,
            'status': status,
            'status_color': status_color,
        }
        
        return render(request, 'monitoring/results_monitoring/detail_results_monitoring.html', context)
        
    except Exception as e:
        # If anything fails, provide debugging info and redirect
        messages.error(request, f"Error loading monitoring record details: {str(e)}")
        return redirect('monitoring:enhanced-results-monitoring-list')


@login_required
def export_indicator_descriptions_excel(request):
    from django.http import HttpResponse
    import openpyxl
    from openpyxl.styles import Font, PatternFill
    
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Indicator Descriptions"
    
    headers = ['ID', 'Project', 'PDO', 'Project Outcome', 'Project Result', 'Indicator Type', 'Description', 'Created By']
    
    header_font = Font(bold=True, color="FFFFFF")
    header_fill = PatternFill(start_color="366092", end_color="366092", fill_type="solid")
    
    for col, header in enumerate(headers, 1):
        cell = ws.cell(row=1, column=col, value=header)
        cell.font = header_font
        cell.fill = header_fill
    
    indicators = Indicator_Description.objects.select_related(
        'project', 'pdo', 'project_outcome', 'project_result', 'indicator_type', 'loginUser'
    ).all()
    
    for row, indicator in enumerate(indicators, 2):
        ws.cell(row=row, column=1, value=indicator.id)
        ws.cell(row=row, column=2, value=str(indicator.project))
        ws.cell(row=row, column=3, value=str(indicator.pdo))
        ws.cell(row=row, column=4, value=str(indicator.project_outcome))
        ws.cell(row=row, column=5, value=str(indicator.project_result))
        ws.cell(row=row, column=6, value=str(indicator.indicator_type))
        ws.cell(row=row, column=7, value=indicator.indicator_description)
        ws.cell(row=row, column=8, value=indicator.loginUser.username)
    
    response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    response['Content-Disposition'] = 'attachment; filename=indicator_descriptions.xlsx'
    wb.save(response)
    return response


@login_required
def export_results_monitoring_excel(request):
    from django.http import HttpResponse
    import openpyxl
    from openpyxl.styles import Font, PatternFill
    
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Results Monitoring"
    
    headers = ['ID', 'Year', 'Quarter', 'Project', 'PDO', 'Indicator Type', 'Description', 
               'Baseline Value', 'Achieved Value', 'Target Value', '% vs Baseline', '% vs Target', 
               'Remarks', 'Created By', 'Date Created']
    
    header_font = Font(bold=True, color="FFFFFF")
    header_fill = PatternFill(start_color="366092", end_color="366092", fill_type="solid")
    
    for col, header in enumerate(headers, 1):
        cell = ws.cell(row=1, column=col, value=header)
        cell.font = header_font
        cell.fill = header_fill
    
    monitoring_records = Results_Oriented_Monitoring.objects.select_related(
        'year', 'quarter', 'project', 'pdo', 'indicator_type', 'loginUser'
    ).all()
    
    for row, record in enumerate(monitoring_records, 2):
        ws.cell(row=row, column=1, value=record.id)
        ws.cell(row=row, column=2, value=str(record.year) if record.year else '')
        ws.cell(row=row, column=3, value=str(record.quarter))
        ws.cell(row=row, column=4, value=str(record.project))
        ws.cell(row=row, column=5, value=str(record.pdo))
        ws.cell(row=row, column=6, value=str(record.indicator_type))
        ws.cell(row=row, column=7, value=record.indicator_description)
        ws.cell(row=row, column=8, value=record.baseline_value)
        ws.cell(row=row, column=9, value=record.achieved_value)
        ws.cell(row=row, column=10, value=record.End_Target_Value)
        ws.cell(row=row, column=11, value=record.percentage_achieved_vs_baseline)
        ws.cell(row=row, column=12, value=record.percentage_achieved_vs_end_target)
        ws.cell(row=row, column=13, value=record.remarks)
        ws.cell(row=row, column=14, value=record.loginUser.username)
        ws.cell(row=row, column=15, value=record.date_created.strftime('%Y-%m-%d %H:%M') if record.date_created else '')
    
    response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    response['Content-Disposition'] = 'attachment; filename=results_monitoring.xlsx'
    wb.save(response)
    return response
