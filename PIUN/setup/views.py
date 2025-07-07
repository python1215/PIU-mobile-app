from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse
from django.core.paginator import Paginator
from django.views.decorators.http import require_http_methods
from .models import *
from .forms import *
from PIU_Financial_mgt.models import KPI_For_Contract

@login_required
def setup_dashboard(request):
    context = {
        # Statistics
        'total_donors': Donor.objects.count(),
        'total_contributors': Contributors.objects.count(),
        'total_categories': ProjectCategory.objects.count(),
        'total_document_types': DocumentType.objects.count(),
        'total_monitoring_types': Type_of_Monitoring.objects.count(),
        'total_kpi_contracts': 0,  # Moved to PIU_Financial_mgt
        'total_quarters': Quarter.objects.count(),
        'total_measurement_units': Measurement_Unit.objects.count(),
        
        # Recent items
        'recent_donors': Donor.objects.order_by('-donorID')[:5],
        'recent_categories': ProjectCategory.objects.order_by('-categoryID')[:5],
    }
    return render(request, 'setup/setup_dashboard.html', context)

# ============ DONOR CRUD OPERATIONS ============

@login_required
def donor_list(request):
    donors = Donor.objects.all().order_by('-date')
    paginator = Paginator(donors, 20)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    context = {
        'donors': page_obj,
        'total_donors': Donor.objects.count(),
    }
    return render(request, 'setup/donors/donor_list.html', context)

@login_required
def donor_create(request):
    if request.method == 'POST':
        form = DonorForm(request.POST)
        if form.is_valid():
            donor = form.save(commit=False)
            donor.loginUser = request.user
            donor.save()
            messages.success(request, 'Donor created successfully!')
            return redirect('setup:donor_list')
    else:
        form = DonorForm()
    
    context = {'form': form, 'title': 'Add New Donor'}
    return render(request, 'setup/donors/donor_form.html', context)

@login_required
def donor_detail(request, pk):
    donor = get_object_or_404(Donor, donorID=pk)
    context = {'donor': donor}
    return render(request, 'setup/donors/donor_detail.html', context)

@login_required
def donor_update(request, pk):
    donor = get_object_or_404(Donor, donorID=pk)
    if request.method == 'POST':
        form = DonorForm(request.POST, instance=donor)
        if form.is_valid():
            form.save()
            messages.success(request, 'Donor updated successfully!')
            return redirect('setup:donor_detail', pk=donor.donorID)
    else:
        form = DonorForm(instance=donor)
    
    context = {'form': form, 'donor': donor, 'title': 'Edit Donor'}
    return render(request, 'setup/donors/donor_form.html', context)

@login_required
def donor_delete(request, pk):
    donor = get_object_or_404(Donor, donorID=pk)
    if request.method == 'POST':
        donor.delete()
        messages.success(request, 'Donor deleted successfully!')
        return redirect('setup:donor_list')
    
    context = {'donor': donor}
    return render(request, 'setup/donors/donor_confirm_delete.html', context)

# ============ CONTRIBUTORS CRUD OPERATIONS ============

@login_required
def contributors_list(request):
    contributors = Contributors.objects.all().order_by('-date')
    paginator = Paginator(contributors, 20)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    context = {
        'contributors': page_obj,
        'total_contributors': Contributors.objects.count(),
    }
    return render(request, 'setup/contributors/contributors_list.html', context)

@login_required
def contributors_create(request):
    if request.method == 'POST':
        form = ContributorsForm(request.POST)
        if form.is_valid():
            contributor = form.save(commit=False)
            contributor.loginUser = request.user
            contributor.save()
            messages.success(request, 'Contributor created successfully!')
            return redirect('setup:contributors_list')
    else:
        form = ContributorsForm()
    
    context = {'form': form, 'title': 'Add New Contributor'}
    return render(request, 'setup/contributors/contributors_form.html', context)

@login_required
def contributors_detail(request, pk):
    contributor = get_object_or_404(Contributors, contriID=pk)
    context = {'contributor': contributor}
    return render(request, 'setup/contributors/contributors_detail.html', context)

@login_required
def contributors_update(request, pk):
    contributor = get_object_or_404(Contributors, contriID=pk)
    if request.method == 'POST':
        form = ContributorsForm(request.POST, instance=contributor)
        if form.is_valid():
            form.save()
            messages.success(request, 'Contributor updated successfully!')
            return redirect('setup:contributors_detail', pk=contributor.contriID)
    else:
        form = ContributorsForm(instance=contributor)
    
    context = {'form': form, 'contributor': contributor, 'title': 'Edit Contributor'}
    return render(request, 'setup/contributors/contributors_form.html', context)

@login_required
def contributors_delete(request, pk):
    contributor = get_object_or_404(Contributors, contriID=pk)
    if request.method == 'POST':
        contributor.delete()
        messages.success(request, 'Contributor deleted successfully!')
        return redirect('setup:contributors_list')
    
    context = {'contributor': contributor}
    return render(request, 'setup/contributors/contributors_confirm_delete.html', context)

# ============ PROJECT CATEGORY CRUD OPERATIONS ============

@login_required
def project_category_list(request):
    categories = ProjectCategory.objects.all().order_by('-date')
    paginator = Paginator(categories, 20)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    context = {
        'project_categories': page_obj,
        'total_project_categories': ProjectCategory.objects.count(),
    }
    return render(request, 'setup/project_categories/project_category_list.html', context)

@login_required
def project_category_create(request):
    if request.method == 'POST':
        form = ProjectCategoryForm(request.POST)
        if form.is_valid():
            category = form.save(commit=False)
            category.loginUser = request.user
            category.save()
            messages.success(request, 'Project category created successfully!')
            return redirect('setup:project_category_list')
    else:
        form = ProjectCategoryForm()
    
    context = {'form': form, 'title': 'Add New Project Category'}
    return render(request, 'setup/project_categories/project_category_form.html', context)

@login_required
def project_category_detail(request, pk):
    category = get_object_or_404(ProjectCategory, categoryID=pk)
    context = {'category': category}
    return render(request, 'setup/project_categories/project_category_detail.html', context)

@login_required
def project_category_update(request, pk):
    category = get_object_or_404(ProjectCategory, categoryID=pk)
    if request.method == 'POST':
        form = ProjectCategoryForm(request.POST, instance=category)
        if form.is_valid():
            form.save()
            messages.success(request, 'Project category updated successfully!')
            return redirect('setup:project_category_detail', pk=category.categoryID)
    else:
        form = ProjectCategoryForm(instance=category)
    
    context = {'form': form, 'category': category, 'title': 'Edit Project Category'}
    return render(request, 'setup/project_categories/project_category_form.html', context)

@login_required
def project_category_delete(request, pk):
    category = get_object_or_404(ProjectCategory, categoryID=pk)
    if request.method == 'POST':
        category.delete()
        messages.success(request, 'Project category deleted successfully!')
        return redirect('setup:project_category_list')
    
    context = {'category': category}
    return render(request, 'setup/project_categories/project_category_confirm_delete.html', context)

# ============ TYPE OF MONITORING CRUD OPERATIONS ============

@login_required
def type_of_monitoring_list(request):
    monitoring_types = Type_of_Monitoring.objects.all().order_by('-date')
    paginator = Paginator(monitoring_types, 20)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    context = {
        'monitoring_types': page_obj,
        'total_monitoring_types': Type_of_Monitoring.objects.count(),
    }
    return render(request, 'setup/monitoring_types/type_of_monitoring_list.html', context)

@login_required
def type_of_monitoring_create(request):
    if request.method == 'POST':
        form = TypeOfMonitoringForm(request.POST)
        if form.is_valid():
            monitoring_type = form.save(commit=False)
            monitoring_type.loginUser = request.user
            monitoring_type.save()
            messages.success(request, 'Monitoring type created successfully!')
            return redirect('setup:type_of_monitoring_list')
    else:
        form = TypeOfMonitoringForm()
    
    context = {'form': form, 'title': 'Add New Monitoring Type'}
    return render(request, 'setup/monitoring_types/type_of_monitoring_form.html', context)

@login_required
def type_of_monitoring_detail(request, pk):
    monitoring_type = get_object_or_404(Type_of_Monitoring, monitoring_type_code=pk)
    context = {'monitoring_type': monitoring_type}
    return render(request, 'setup/monitoring_types/monitoring_type_detail.html', context)

@login_required
def type_of_monitoring_update(request, pk):
    monitoring_type = get_object_or_404(Type_of_Monitoring, monitoring_type_code=pk)
    if request.method == 'POST':
        form = TypeOfMonitoringForm(request.POST, instance=monitoring_type)
        if form.is_valid():
            form.save()
            messages.success(request, 'Monitoring type updated successfully!')
            return redirect('setup:type_of_monitoring_detail', pk=monitoring_type.monitoring_type_code)
    else:
        form = TypeOfMonitoringForm(instance=monitoring_type)
    
    context = {'form': form, 'monitoring_type': monitoring_type, 'title': 'Edit Monitoring Type'}
    return render(request, 'setup/monitoring_types/monitoring_type_form.html', context)

@login_required
def type_of_monitoring_delete(request, pk):
    monitoring_type = get_object_or_404(Type_of_Monitoring, monitoring_type_code=pk)
    if request.method == 'POST':
        monitoring_type.delete()
        messages.success(request, 'Monitoring type deleted successfully!')
        return redirect('setup:type_of_monitoring_list')
    
    context = {'monitoring_type': monitoring_type}
    return render(request, 'setup/monitoring_types/monitoring_type_confirm_delete.html', context)

# ============ KPI FOR CONTRACT CRUD OPERATIONS ============

@login_required
def kpi_for_contract_list(request):
    kpis = KPI_For_Contract.objects.all().order_by('-date')
    paginator = Paginator(kpis, 20)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    context = {
        'kpis': page_obj,
        'total_kpis': KPI_For_Contract.objects.count(),
    }
    return render(request, 'setup/kpi_contracts/kpi_contract_list.html', context)

@login_required
def kpi_for_contract_create(request):
    if request.method == 'POST':
        form = KPIForContractForm(request.POST)
        if form.is_valid():
            kpi = form.save(commit=False)
            kpi.loginUser = request.user
            kpi.save()
            messages.success(request, 'KPI for contract created successfully!')
            return redirect('setup:kpi_for_contract_list')
    else:
        form = KPIForContractForm()
    
    context = {'form': form, 'title': 'Add New KPI for Contract'}
    return render(request, 'setup/kpi_for_contract/add-kpi_for_contract.html', context)

@login_required
def kpi_for_contract_detail(request, pk):
    kpi = get_object_or_404(KPI_For_Contract, monitoring_Type_Code=pk)
    context = {'kpi': kpi}
    return render(request, 'setup/kpi_contracts/kpi_contract_detail.html', context)

@login_required
def kpi_for_contract_update(request, pk):
    kpi = get_object_or_404(KPI_For_Contract, monitoring_Type_Code=pk)
    if request.method == 'POST':
        form = KPIForContractForm(request.POST, instance=kpi)
        if form.is_valid():
            form.save()
            messages.success(request, 'KPI for contract updated successfully!')
            return redirect('setup:kpi_for_contract_detail', pk=kpi.monitoring_Type_Code)
    else:
        form = KPIForContractForm(instance=kpi)
    
    context = {'form': form, 'kpi': kpi, 'title': 'Edit KPI for Contract'}
    return render(request, 'setup/kpi_contracts/kpi_contract_form.html', context)

@login_required
def kpi_for_contract_delete(request, pk):
    kpi = get_object_or_404(KPI_For_Contract, monitoring_Type_Code=pk)
    if request.method == 'POST':
        kpi.delete()
        messages.success(request, 'KPI for contract deleted successfully!')
        return redirect('setup:kpi_for_contract_list')
    
    context = {'kpi': kpi}
    return render(request, 'setup/kpi_contracts/kpi_contract_confirm_delete.html', context)

# ============ QUARTER CRUD OPERATIONS ============

@login_required
def quarter_list(request):
    quarters = Quarter.objects.all().order_by('-date')
    paginator = Paginator(quarters, 20)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    context = {
        'quarters': page_obj,
        'total_quarters': Quarter.objects.count(),
    }
    return render(request, 'setup/quarters/quarter_list.html', context)

@login_required
def quarter_create(request):
    if request.method == 'POST':
        form = QuarterForm(request.POST)
        if form.is_valid():
            quarter = form.save(commit=False)
            quarter.loginUser = request.user
            quarter.save()
            messages.success(request, 'Quarter created successfully!')
            return redirect('setup:quarter_list')
    else:
        form = QuarterForm()
    
    context = {'form': form, 'title': 'Add New Quarter'}
    return render(request, 'setup/quarters/quarter_form.html', context)

@login_required
def quarter_detail(request, pk):
    quarter = get_object_or_404(Quarter, pk=pk)
    context = {'quarter': quarter}
    return render(request, 'setup/quarters/quarter_detail.html', context)

@login_required
def quarter_update(request, pk):
    quarter = get_object_or_404(Quarter, pk=pk)
    if request.method == 'POST':
        form = QuarterForm(request.POST, instance=quarter)
        if form.is_valid():
            form.save()
            messages.success(request, 'Quarter updated successfully!')
            return redirect('setup:quarter_detail', pk=quarter.pk)
    else:
        form = QuarterForm(instance=quarter)
    
    context = {'form': form, 'quarter': quarter, 'title': 'Edit Quarter'}
    return render(request, 'setup/quarters/quarter_form.html', context)

@login_required
def quarter_delete(request, pk):
    quarter = get_object_or_404(Quarter, pk=pk)
    if request.method == 'POST':
        quarter.delete()
        messages.success(request, 'Quarter deleted successfully!')
        return redirect('setup:quarter_list')
    
    context = {'quarter': quarter}
    return render(request, 'setup/quarters/quarter_confirm_delete.html', context)

# ============ MEASUREMENT UNIT CRUD OPERATIONS ============

@login_required
def measurement_unit_list(request):
    units = Measurement_Unit.objects.all().order_by('unit')
    paginator = Paginator(units, 20)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    context = {
        'units': page_obj,
        'total_units': Measurement_Unit.objects.count(),
    }
    return render(request, 'setup/measurement_units/measurement_unit_list.html', context)

@login_required
def measurement_unit_create(request):
    if request.method == 'POST':
        form = MeasurementUnitForm(request.POST)
        if form.is_valid():
            unit = form.save(commit=False)
            unit.loginUser = request.user
            unit.save()
            messages.success(request, 'Measurement unit created successfully!')
            return redirect('setup:measurement_unit_list')
    else:
        form = MeasurementUnitForm()
    
    context = {'form': form, 'title': 'Add New Measurement Unit'}
    return render(request, 'setup/measurement_units/measurement_unit_form.html', context)

@login_required
def measurement_unit_detail(request, pk):
    unit = get_object_or_404(Measurement_Unit, pk=pk)
    context = {'unit': unit}
    return render(request, 'setup/measurement_units/measurement_unit_detail.html', context)

@login_required
def measurement_unit_update(request, pk):
    unit = get_object_or_404(Measurement_Unit, pk=pk)
    if request.method == 'POST':
        form = MeasurementUnitForm(request.POST, instance=unit)
        if form.is_valid():
            form.save()
            messages.success(request, 'Measurement unit updated successfully!')
            return redirect('setup:measurement_unit_detail', pk=unit.pk)
    else:
        form = MeasurementUnitForm(instance=unit)
    
    context = {'form': form, 'unit': unit, 'title': 'Edit Measurement Unit'}
    return render(request, 'setup/measurement_units/measurement_unit_form.html', context)

@login_required
def measurement_unit_delete(request, pk):
    unit = get_object_or_404(Measurement_Unit, pk=pk)
    if request.method == 'POST':
        unit.delete()
        messages.success(request, 'Measurement unit deleted successfully!')
        return redirect('setup:measurement_unit_list')
    
    context = {'unit': unit}
    return render(request, 'setup/measurement_units/measurement_unit_confirm_delete.html', context)

# ============ PROJECT ACTIVITY MONITORING CRUD OPERATIONS ============

@login_required
def project_activity_monitoring_list(request):
    activities = project_Activity_monitoring.objects.all().order_by('-date')
    paginator = Paginator(activities, 20)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    context = {
        'activities': page_obj,
        'total_activities': project_Activity_monitoring.objects.count(),
    }
    return render(request, 'setup/activity_monitoring/activity_monitoring_list.html', context)

@login_required
def project_activity_monitoring_create(request):
    if request.method == 'POST':
        form = ProjectActivityMonitoringForm(request.POST)
        if form.is_valid():
            activity = form.save(commit=False)
            activity.loginUser = request.user
            activity.save()
            messages.success(request, 'Activity monitoring type created successfully!')
            return redirect('setup:project_activity_monitoring_list')
    else:
        form = ProjectActivityMonitoringForm()
    
    context = {'form': form, 'title': 'Add New Activity Monitoring Type'}
    return render(request, 'setup/activity_monitoring/activity_monitoring_form.html', context)

@login_required
def project_activity_monitoring_detail(request, pk):
    activity = get_object_or_404(project_Activity_monitoring, pk=pk)
    context = {'activity': activity}
    return render(request, 'setup/activity_monitoring/activity_monitoring_detail.html', context)

@login_required
def project_activity_monitoring_update(request, pk):
    activity = get_object_or_404(project_Activity_monitoring, pk=pk)
    if request.method == 'POST':
        form = ProjectActivityMonitoringForm(request.POST, instance=activity)
        if form.is_valid():
            form.save()
            messages.success(request, 'Activity monitoring type updated successfully!')
            return redirect('setup:project_activity_monitoring_detail', pk=activity.pk)
    else:
        form = ProjectActivityMonitoringForm(instance=activity)
    
    context = {'form': form, 'activity': activity, 'title': 'Edit Activity Monitoring Type'}
    return render(request, 'setup/activity_monitoring/activity_monitoring_form.html', context)

@login_required
def project_activity_monitoring_delete(request, pk):
    activity = get_object_or_404(project_Activity_monitoring, pk=pk)
    if request.method == 'POST':
        activity.delete()
        messages.success(request, 'Activity monitoring type deleted successfully!')
        return redirect('setup:project_activity_monitoring_list')
    
    context = {'activity': activity}
    return render(request, 'setup/activity_monitoring/activity_monitoring_confirm_delete.html', context)

# ============ DOCUMENT TYPE CRUD OPERATIONS ============

@login_required
def document_type_list(request):
    document_types = DocumentType.objects.all().order_by('-date')
    paginator = Paginator(document_types, 20)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    context = {
        'document_types': page_obj,
        'total_document_types': DocumentType.objects.count(),
    }
    return render(request, 'setup/document_types/document_type_list.html', context)

@login_required
def document_type_create(request):
    if request.method == 'POST':
        form = DocumentTypeForm(request.POST)
        if form.is_valid():
            document_type = form.save(commit=False)
            document_type.loginUser = request.user
            document_type.save()
            messages.success(request, 'Document type created successfully!')
            return redirect('setup:document_type_list')
    else:
        form = DocumentTypeForm()
    
    context = {'form': form, 'title': 'Add New Document Type'}
    return render(request, 'setup/document_types/document_type_form.html', context)

@login_required
def document_type_detail(request, pk):
    document_type = get_object_or_404(DocumentType, pk=pk)
    context = {'document_type': document_type}
    return render(request, 'setup/document_types/document_type_detail.html', context)

@login_required
def document_type_update(request, pk):
    document_type = get_object_or_404(DocumentType, pk=pk)
    if request.method == 'POST':
        form = DocumentTypeForm(request.POST, instance=document_type)
        if form.is_valid():
            form.save()
            messages.success(request, 'Document type updated successfully!')
            return redirect('setup:document_type_detail', pk=document_type.pk)
    else:
        form = DocumentTypeForm(instance=document_type)
    
    context = {'form': form, 'document_type': document_type, 'title': 'Edit Document Type'}
    return render(request, 'setup/document_types/document_type_form.html', context)

@login_required
def document_type_delete(request, pk):
    document_type = get_object_or_404(DocumentType, pk=pk)
    if request.method == 'POST':
        document_type.delete()
        messages.success(request, 'Document type deleted successfully!')
        return redirect('setup:document_type_list')
    
    context = {'document_type': document_type}
    return render(request, 'setup/document_types/document_type_confirm_delete.html', context)