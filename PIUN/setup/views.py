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
        'total_physical_progress': Physicalprogress.objects.count(),
        'total_type_of_impact': TypeOfImpact.objects.count(),
        'total_regions': Regions.objects.count(),
        'total_districts': Districts.objects.count(),
        'total_settlements': Settlement.objects.count(),
        'total_lgas': LGA.objects.count(),
        
        # Recent items
        'recent_donors': list(Donor.objects.order_by('-donorID')[:5]),
        'recent_categories': list(ProjectCategory.objects.order_by('-categoryID')[:5]),
        'recent_physical_progress': list(Physicalprogress.objects.order_by('-date')[:5]),
        'recent_type_of_impact': list(TypeOfImpact.objects.order_by('impact_number')[:5]),
        'total_type_of_pap': TypeOfPAP.objects.count(),
        'recent_type_of_pap': list(TypeOfPAP.objects.order_by('id')[:5]),
        'total_nature_of_settlement': NatureOfSettlement.objects.count(),
        'recent_nature_of_settlement': list(NatureOfSettlement.objects.order_by('id')[:5]),
        'total_decision_outcome': DecisionOutcome.objects.count(),
        'recent_decision_outcome': list(DecisionOutcome.objects.order_by('id')[:5]),
        'total_type_of_stakeholder_engagement': TypeOfStakeholderEngagement.objects.count(),
        'recent_type_of_stakeholder_engagement': list(TypeOfStakeholderEngagement.objects.order_by('id')[:5]),
        'total_access': Access.objects.count(),
        'recent_access': list(Access.objects.order_by('id')[:5]),
        'total_data_collection_frequency': Data_Collection_Frequency.objects.count(),
        'recent_data_collection_frequency': list(Data_Collection_Frequency.objects.order_by('id')[:5]),
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

# ============ GEOGRAPHIC CRUD OPERATIONS ============

# Regions CRUD
@login_required
def regions_list(request):
    regions = Regions.objects.all().order_by('region_name')
    paginator = Paginator(regions, 20)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    context = {
        'regions': page_obj,
        'total_regions': Regions.objects.count(),
    }
    return render(request, 'setup/geographic/regions_list.html', context)

@login_required
def regions_create(request):
    if request.method == 'POST':
        form = RegionsForm(request.POST)
        if form.is_valid():
            region = form.save(commit=False)
            region.loginUser = request.user
            region.save()
            messages.success(request, 'Region created successfully!')
            return redirect('setup:regions_list')
    else:
        form = RegionsForm()
    
    context = {'form': form, 'title': 'Add New Region'}
    return render(request, 'setup/geographic/regions_form.html', context)

@login_required
def regions_detail(request, pk):
    region = get_object_or_404(Regions, pk=pk)
    context = {'region': region}
    return render(request, 'setup/geographic/regions_detail.html', context)

@login_required
def regions_update(request, pk):
    region = get_object_or_404(Regions, pk=pk)
    if request.method == 'POST':
        form = RegionsForm(request.POST, instance=region)
        if form.is_valid():
            form.save()
            messages.success(request, 'Region updated successfully!')
            return redirect('setup:regions_detail', pk=region.pk)
    else:
        form = RegionsForm(instance=region)
    
    context = {'form': form, 'region': region, 'title': 'Edit Region'}
    return render(request, 'setup/geographic/regions_form.html', context)

@login_required
def regions_delete(request, pk):
    region = get_object_or_404(Regions, pk=pk)
    if request.method == 'POST':
        region.delete()
        messages.success(request, 'Region deleted successfully!')
        return redirect('setup:regions_list')
    
    context = {'region': region}
    return render(request, 'setup/geographic/regions_confirm_delete.html', context)

# Districts CRUD
@login_required
def districts_list(request):
    districts = Districts.objects.all().select_related('region_code').order_by('district_name')
    paginator = Paginator(districts, 20)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    context = {
        'districts': page_obj,
        'total_districts': Districts.objects.count(),
    }
    return render(request, 'setup/geographic/districts_list.html', context)

@login_required
def districts_create(request):
    if request.method == 'POST':
        form = DistrictsForm(request.POST)
        if form.is_valid():
            district = form.save(commit=False)
            district.loginUser = request.user
            district.save()
            messages.success(request, 'District created successfully!')
            return redirect('setup:districts_list')
    else:
        form = DistrictsForm()
    
    context = {'form': form, 'title': 'Add New District'}
    return render(request, 'setup/geographic/districts_form.html', context)

@login_required
def districts_detail(request, pk):
    district = get_object_or_404(Districts, pk=pk)
    context = {'district': district}
    return render(request, 'setup/geographic/districts_detail.html', context)

@login_required
def districts_update(request, pk):
    district = get_object_or_404(Districts, pk=pk)
    if request.method == 'POST':
        form = DistrictsForm(request.POST, instance=district)
        if form.is_valid():
            form.save()
            messages.success(request, 'District updated successfully!')
            return redirect('setup:districts_detail', pk=district.pk)
    else:
        form = DistrictsForm(instance=district)
    
    context = {'form': form, 'district': district, 'title': 'Edit District'}
    return render(request, 'setup/geographic/districts_form.html', context)

@login_required
def districts_delete(request, pk):
    district = get_object_or_404(Districts, pk=pk)
    if request.method == 'POST':
        district.delete()
        messages.success(request, 'District deleted successfully!')
        return redirect('setup:districts_list')
    
    context = {'district': district}
    return render(request, 'setup/geographic/districts_confirm_delete.html', context)

# Settlements CRUD
@login_required
def settlement_list(request):
    settlements = Settlement.objects.all().select_related('district_code').order_by('settlement_name')
    paginator = Paginator(settlements, 20)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    context = {
        'settlements': page_obj,
        'total_settlements': Settlement.objects.count(),
    }
    return render(request, 'setup/geographic/settlements_list.html', context)

@login_required
def settlement_create(request):
    if request.method == 'POST':
        form = SettlementForm(request.POST)
        if form.is_valid():
            settlement = form.save(commit=False)
            settlement.loginUser = request.user
            settlement.save()
            messages.success(request, 'Settlement created successfully!')
            return redirect('setup:settlement_list')
    else:
        form = SettlementForm()
    
    context = {'form': form, 'title': 'Add New Settlement'}
    return render(request, 'setup/geographic/settlements_form.html', context)

@login_required
def settlement_detail(request, pk):
    settlement = get_object_or_404(Settlement, pk=pk)
    context = {'settlement': settlement}
    return render(request, 'setup/geographic/settlements_detail.html', context)

@login_required
def settlement_update(request, pk):
    settlement = get_object_or_404(Settlement, pk=pk)
    if request.method == 'POST':
        form = SettlementForm(request.POST, instance=settlement)
        if form.is_valid():
            form.save()
            messages.success(request, 'Settlement updated successfully!')
            return redirect('setup:settlement_detail', pk=settlement.pk)
    else:
        form = SettlementForm(instance=settlement)
    
    context = {'form': form, 'settlement': settlement, 'title': 'Edit Settlement'}
    return render(request, 'setup/geographic/settlements_form.html', context)

@login_required
def settlement_delete(request, pk):
    settlement = get_object_or_404(Settlement, pk=pk)
    if request.method == 'POST':
        settlement.delete()
        messages.success(request, 'Settlement deleted successfully!')
        return redirect('setup:settlement_list')
    
    context = {'settlement': settlement}
    return render(request, 'setup/geographic/settlements_confirm_delete.html', context)

# LGA CRUD
@login_required
def lga_list(request):
    lgas = LGA.objects.all().select_related('region_code').order_by('lga_name')
    paginator = Paginator(lgas, 20)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    context = {
        'lgas': page_obj,
        'total_lgas': LGA.objects.count(),
    }
    return render(request, 'setup/geographic/lga_list.html', context)

@login_required
def lga_create(request):
    if request.method == 'POST':
        form = LGAForm(request.POST)
        if form.is_valid():
            lga = form.save(commit=False)
            lga.loginUser = request.user
            lga.save()
            messages.success(request, 'LGA created successfully!')
            return redirect('setup:lga_list')
    else:
        form = LGAForm()
    
    context = {'form': form, 'title': 'Add New LGA'}
    return render(request, 'setup/geographic/lga_form.html', context)

@login_required
def lga_detail(request, pk):
    lga = get_object_or_404(LGA, pk=pk)
    context = {'lga': lga}
    return render(request, 'setup/geographic/lga_detail.html', context)

@login_required
def lga_update(request, pk):
    lga = get_object_or_404(LGA, pk=pk)
    if request.method == 'POST':
        form = LGAForm(request.POST, instance=lga)
        if form.is_valid():
            form.save()
            messages.success(request, 'LGA updated successfully!')
            return redirect('setup:lga_detail', pk=lga.pk)
    else:
        form = LGAForm(instance=lga)
    
    context = {'form': form, 'lga': lga, 'title': 'Edit LGA'}
    return render(request, 'setup/geographic/lga_form.html', context)

@login_required
def lga_delete(request, pk):
    lga = get_object_or_404(LGA, pk=pk)
    if request.method == 'POST':
        lga.delete()
        messages.success(request, 'LGA deleted successfully!')
        return redirect('setup:lga_list')
    
    context = {'lga': lga}
    return render(request, 'setup/geographic/lga_confirm_delete.html', context)

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


# ============ PHYSICAL PROGRESS CRUD OPERATIONS ============

@login_required
def physical_progress_list(request):
    """List all physical progress records with pagination and search"""
    physical_progress_list = Physicalprogress.objects.all().order_by('-date')
    
    # Search functionality
    search_query = request.GET.get('search')
    if search_query:
        physical_progress_list = physical_progress_list.filter(
            progress_scale__icontains=search_query
        )
    
    paginator = Paginator(physical_progress_list, 20)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    context = {
        'physical_progress': page_obj,
        'total_physical_progress': Physicalprogress.objects.count(),
        'search_query': search_query,
    }
    return render(request, 'setup/physical_progress/physical_progress_list.html', context)

@login_required
def physical_progress_create(request):
    """Create a new physical progress record"""
    if request.method == 'POST':
        form = PhysicalprogressForm(request.POST)
        if form.is_valid():
            physical_progress = form.save(commit=False)
            physical_progress.loginUser = request.user
            physical_progress.save()
            messages.success(request, 'Physical progress record created successfully!')
            return redirect('setup:physical_progress_list')
    else:
        form = PhysicalprogressForm()
    
    context = {'form': form, 'title': 'Add New Physical Progress Record'}
    return render(request, 'setup/physical_progress/physical_progress_form.html', context)

@login_required
def physical_progress_detail(request, pk):
    """View details of a physical progress record"""
    physical_progress = get_object_or_404(Physicalprogress, id=pk)
    context = {'physical_progress': physical_progress}
    return render(request, 'setup/physical_progress/physical_progress_detail.html', context)

@login_required
def physical_progress_update(request, pk):
    """Update an existing physical progress record"""
    physical_progress = get_object_or_404(Physicalprogress, id=pk)
    if request.method == 'POST':
        form = PhysicalprogressForm(request.POST, instance=physical_progress)
        if form.is_valid():
            form.save()
            messages.success(request, 'Physical progress record updated successfully!')
            return redirect('setup:physical_progress_list')
    else:
        form = PhysicalprogressForm(instance=physical_progress)
    
    context = {
        'form': form, 
        'physical_progress': physical_progress, 
        'title': f'Edit Physical Progress: {physical_progress.progress_scale}'
    }
    return render(request, 'setup/physical_progress/physical_progress_form.html', context)

@login_required
def physical_progress_delete(request, pk):
    """Delete a physical progress record"""
    physical_progress = get_object_or_404(Physicalprogress, id=pk)
    if request.method == 'POST':
        progress_scale = physical_progress.progress_scale
        physical_progress.delete()
        messages.success(request, f'Physical progress record "{progress_scale}" deleted successfully!')
        return redirect('setup:physical_progress_list')
    
    context = {'physical_progress': physical_progress}
    return render(request, 'setup/physical_progress/physical_progress_confirm_delete.html', context)


# ============ TYPE OF IMPACT CRUD OPERATIONS ============

@login_required
def type_of_impact_list(request):
    """List all type of impact records with pagination and search"""
    type_of_impact_list = TypeOfImpact.objects.all().order_by('impact_number')
    
    # Search functionality
    search_query = request.GET.get('search')
    if search_query:
        type_of_impact_list = type_of_impact_list.filter(
            impact__icontains=search_query
        )
    
    paginator = Paginator(type_of_impact_list, 20)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    context = {
        'type_of_impact': page_obj,
        'total_type_of_impact': TypeOfImpact.objects.count(),
        'search_query': search_query,
    }
    return render(request, 'setup/type_of_impact/type_of_impact_list.html', context)

@login_required
def type_of_impact_create(request):
    """Create a new type of impact record"""
    if request.method == 'POST':
        form = TypeOfImpactForm(request.POST)
        if form.is_valid():
            type_of_impact = form.save(commit=False)
            type_of_impact.loginUser = request.user
            type_of_impact.save()
            messages.success(request, 'Type of impact record created successfully!')
            return redirect('setup:type_of_impact_list')
    else:
        form = TypeOfImpactForm()
    
    context = {'form': form, 'title': 'Add New Type of Impact'}
    return render(request, 'setup/type_of_impact/type_of_impact_form.html', context)

@login_required
def type_of_impact_detail(request, pk):
    """View details of a type of impact record"""
    type_of_impact = get_object_or_404(TypeOfImpact, impact_number=pk)
    context = {'type_of_impact': type_of_impact}
    return render(request, 'setup/type_of_impact/type_of_impact_detail.html', context)

@login_required
def type_of_impact_update(request, pk):
    """Update an existing type of impact record"""
    type_of_impact = get_object_or_404(TypeOfImpact, impact_number=pk)
    if request.method == 'POST':
        form = TypeOfImpactForm(request.POST, instance=type_of_impact)
        if form.is_valid():
            form.save()
            messages.success(request, 'Type of impact record updated successfully!')
            return redirect('setup:type_of_impact_list')
    else:
        form = TypeOfImpactForm(instance=type_of_impact)
    
    context = {
        'form': form, 
        'type_of_impact': type_of_impact, 
        'title': f'Edit Type of Impact: {type_of_impact.impact}'
    }
    return render(request, 'setup/type_of_impact/type_of_impact_form.html', context)

@login_required
def type_of_impact_delete(request, pk):
    """Delete a type of impact record"""
    type_of_impact = get_object_or_404(TypeOfImpact, impact_number=pk)
    if request.method == 'POST':
        impact_description = type_of_impact.impact
        type_of_impact.delete()
        messages.success(request, f'Type of impact "{impact_description}" deleted successfully!')
        return redirect('setup:type_of_impact_list')
    
    context = {'type_of_impact': type_of_impact}
    return render(request, 'setup/type_of_impact/type_of_impact_confirm_delete.html', context)


# ============ TYPE OF PAP CRUD OPERATIONS ============

@login_required
def type_of_pap_list(request):
    """List all type of PAP records with pagination and search"""
    type_of_pap_list = TypeOfPAP.objects.all().order_by('id')
    
    # Search functionality
    search_query = request.GET.get('search')
    if search_query:
        type_of_pap_list = type_of_pap_list.filter(
            type_of_pap__icontains=search_query
        )
    
    paginator = Paginator(type_of_pap_list, 20)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    context = {
        'type_of_pap': page_obj,
        'total_type_of_pap': TypeOfPAP.objects.count(),
        'search_query': search_query,
    }
    return render(request, 'setup/type_of_pap/type_of_pap_list.html', context)

@login_required
def type_of_pap_create(request):
    """Create a new type of PAP record"""
    if request.method == 'POST':
        form = TypeOfPAPForm(request.POST)
        if form.is_valid():
            type_of_pap = form.save(commit=False)
            type_of_pap.loginUser = request.user
            type_of_pap.save()
            messages.success(request, 'Type of PAP record created successfully!')
            return redirect('setup:type_of_pap_list')
    else:
        form = TypeOfPAPForm()
    
    context = {'form': form, 'title': 'Add New Type of PAP'}
    return render(request, 'setup/type_of_pap/type_of_pap_form.html', context)

@login_required
def type_of_pap_detail(request, pk):
    """View details of a type of PAP record"""
    type_of_pap = get_object_or_404(TypeOfPAP, id=pk)
    context = {'type_of_pap': type_of_pap}
    return render(request, 'setup/type_of_pap/type_of_pap_detail.html', context)

@login_required
def type_of_pap_update(request, pk):
    """Update an existing type of PAP record"""
    type_of_pap = get_object_or_404(TypeOfPAP, id=pk)
    if request.method == 'POST':
        form = TypeOfPAPForm(request.POST, instance=type_of_pap)
        if form.is_valid():
            form.save()
            messages.success(request, 'Type of PAP record updated successfully!')
            return redirect('setup:type_of_pap_list')
    else:
        form = TypeOfPAPForm(instance=type_of_pap)
    
    context = {
        'form': form, 
        'type_of_pap': type_of_pap, 
        'title': f'Edit Type of PAP: {type_of_pap.type_of_pap}'
    }
    return render(request, 'setup/type_of_pap/type_of_pap_form.html', context)

@login_required
def type_of_pap_delete(request, pk):
    """Delete a type of PAP record"""
    type_of_pap = get_object_or_404(TypeOfPAP, id=pk)
    if request.method == 'POST':
        pap_description = type_of_pap.type_of_pap
        type_of_pap.delete()
        messages.success(request, f'Type of PAP "{pap_description}" deleted successfully!')
        return redirect('setup:type_of_pap_list')
    
    context = {'type_of_pap': type_of_pap}
    return render(request, 'setup/type_of_pap/type_of_pap_confirm_delete.html', context)


# ============ NATURE OF SETTLEMENT CRUD OPERATIONS ============

@login_required
def nature_of_settlement_list(request):
    """List all nature of settlement records with pagination and search"""
    nature_of_settlement_list = NatureOfSettlement.objects.all().order_by('id')
    
    # Search functionality
    search_query = request.GET.get('search')
    if search_query:
        nature_of_settlement_list = nature_of_settlement_list.filter(
            nature_of_settlement__icontains=search_query
        )
    
    paginator = Paginator(nature_of_settlement_list, 20)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    context = {
        'nature_of_settlement': page_obj,
        'total_nature_of_settlement': NatureOfSettlement.objects.count(),
        'search_query': search_query,
    }
    return render(request, 'setup/nature_of_settlement/nature_of_settlement_list.html', context)

@login_required
def nature_of_settlement_create(request):
    """Create a new nature of settlement record"""
    if request.method == 'POST':
        form = NatureOfSettlementForm(request.POST)
        if form.is_valid():
            nature_of_settlement = form.save(commit=False)
            nature_of_settlement.loginUser = request.user
            nature_of_settlement.save()
            messages.success(request, 'Nature of settlement record created successfully!')
            return redirect('setup:nature_of_settlement_list')
    else:
        form = NatureOfSettlementForm()
    
    context = {'form': form, 'title': 'Add New Nature of Settlement'}
    return render(request, 'setup/nature_of_settlement/nature_of_settlement_form.html', context)

@login_required
def nature_of_settlement_detail(request, pk):
    """View details of a nature of settlement record"""
    nature_of_settlement = get_object_or_404(NatureOfSettlement, id=pk)
    context = {'nature_of_settlement': nature_of_settlement}
    return render(request, 'setup/nature_of_settlement/nature_of_settlement_detail.html', context)

@login_required
def nature_of_settlement_update(request, pk):
    """Update an existing nature of settlement record"""
    nature_of_settlement = get_object_or_404(NatureOfSettlement, id=pk)
    if request.method == 'POST':
        form = NatureOfSettlementForm(request.POST, instance=nature_of_settlement)
        if form.is_valid():
            form.save()
            messages.success(request, 'Nature of settlement record updated successfully!')
            return redirect('setup:nature_of_settlement_list')
    else:
        form = NatureOfSettlementForm(instance=nature_of_settlement)
    
    context = {
        'form': form, 
        'nature_of_settlement': nature_of_settlement, 
        'title': f'Edit Nature of Settlement: {nature_of_settlement.nature_of_settlement}'
    }
    return render(request, 'setup/nature_of_settlement/nature_of_settlement_form.html', context)

@login_required
def nature_of_settlement_delete(request, pk):
    """Delete a nature of settlement record"""
    nature_of_settlement = get_object_or_404(NatureOfSettlement, id=pk)
    if request.method == 'POST':
        settlement_description = nature_of_settlement.nature_of_settlement
        nature_of_settlement.delete()
        messages.success(request, f'Nature of settlement "{settlement_description}" deleted successfully!')
        return redirect('setup:nature_of_settlement_list')
    
    context = {'nature_of_settlement': nature_of_settlement}
    return render(request, 'setup/nature_of_settlement/nature_of_settlement_confirm_delete.html', context)


# ============ DECISION OUTCOME CRUD OPERATIONS ============

@login_required
def decision_outcome_list(request):
    """List all decision outcome records with pagination and search"""
    decision_outcome_list = DecisionOutcome.objects.all().order_by('id')
    
    # Search functionality
    search_query = request.GET.get('search')
    if search_query:
        decision_outcome_list = decision_outcome_list.filter(
            outcome__icontains=search_query
        )
    
    paginator = Paginator(decision_outcome_list, 20)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    context = {
        'decision_outcome': page_obj,
        'total_decision_outcome': DecisionOutcome.objects.count(),
        'search_query': search_query,
    }
    return render(request, 'setup/decision_outcome/decision_outcome_list.html', context)

@login_required
def decision_outcome_create(request):
    """Create a new decision outcome record"""
    if request.method == 'POST':
        form = DecisionOutcomeForm(request.POST)
        if form.is_valid():
            decision_outcome = form.save(commit=False)
            decision_outcome.loginUser = request.user
            decision_outcome.save()
            messages.success(request, 'Decision outcome record created successfully!')
            return redirect('setup:decision_outcome_list')
    else:
        form = DecisionOutcomeForm()
    
    context = {'form': form, 'title': 'Add New Decision Outcome'}
    return render(request, 'setup/decision_outcome/decision_outcome_form.html', context)

@login_required
def decision_outcome_detail(request, pk):
    """View details of a decision outcome record"""
    decision_outcome = get_object_or_404(DecisionOutcome, id=pk)
    context = {'decision_outcome': decision_outcome}
    return render(request, 'setup/decision_outcome/decision_outcome_detail.html', context)

@login_required
def decision_outcome_update(request, pk):
    """Update an existing decision outcome record"""
    decision_outcome = get_object_or_404(DecisionOutcome, id=pk)
    if request.method == 'POST':
        form = DecisionOutcomeForm(request.POST, instance=decision_outcome)
        if form.is_valid():
            form.save()
            messages.success(request, 'Decision outcome record updated successfully!')
            return redirect('setup:decision_outcome_list')
    else:
        form = DecisionOutcomeForm(instance=decision_outcome)
    
    context = {
        'form': form, 
        'decision_outcome': decision_outcome, 
        'title': f'Edit Decision Outcome: {decision_outcome.outcome}'
    }
    return render(request, 'setup/decision_outcome/decision_outcome_form.html', context)

@login_required
def decision_outcome_delete(request, pk):
    """Delete a decision outcome record"""
    decision_outcome = get_object_or_404(DecisionOutcome, id=pk)
    if request.method == 'POST':
        outcome_description = decision_outcome.outcome
        decision_outcome.delete()
        messages.success(request, f'Decision outcome "{outcome_description}" deleted successfully!')
        return redirect('setup:decision_outcome_list')
    
    context = {'decision_outcome': decision_outcome}
    return render(request, 'setup/decision_outcome/decision_outcome_confirm_delete.html', context)


# ============ TYPE OF STAKEHOLDER ENGAGEMENT CRUD OPERATIONS ============

@login_required
def type_of_stakeholder_engagement_list(request):
    """List all type of stakeholder engagement records with pagination and search"""
    type_of_stakeholder_engagement_list = TypeOfStakeholderEngagement.objects.all().order_by('id')
    
    # Search functionality
    search_query = request.GET.get('search')
    if search_query:
        type_of_stakeholder_engagement_list = type_of_stakeholder_engagement_list.filter(
            stake_holder_engagement__icontains=search_query
        )
    
    paginator = Paginator(type_of_stakeholder_engagement_list, 20)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    context = {
        'type_of_stakeholder_engagement': page_obj,
        'total_type_of_stakeholder_engagement': TypeOfStakeholderEngagement.objects.count(),
        'search_query': search_query,
    }
    return render(request, 'setup/type_of_stakeholder_engagement/type_of_stakeholder_engagement_list.html', context)

@login_required
def type_of_stakeholder_engagement_create(request):
    """Create a new type of stakeholder engagement record"""
    if request.method == 'POST':
        form = TypeOfStakeholderEngagementForm(request.POST)
        if form.is_valid():
            type_of_stakeholder_engagement = form.save(commit=False)
            type_of_stakeholder_engagement.loginUser = request.user
            type_of_stakeholder_engagement.save()
            messages.success(request, 'Type of stakeholder engagement record created successfully!')
            return redirect('setup:type_of_stakeholder_engagement_list')
    else:
        form = TypeOfStakeholderEngagementForm()
    
    context = {'form': form, 'title': 'Add New Type of Stakeholder Engagement'}
    return render(request, 'setup/type_of_stakeholder_engagement/type_of_stakeholder_engagement_form.html', context)

@login_required
def type_of_stakeholder_engagement_detail(request, pk):
    """View details of a type of stakeholder engagement record"""
    type_of_stakeholder_engagement = get_object_or_404(TypeOfStakeholderEngagement, id=pk)
    context = {'type_of_stakeholder_engagement': type_of_stakeholder_engagement}
    return render(request, 'setup/type_of_stakeholder_engagement/type_of_stakeholder_engagement_detail.html', context)

@login_required
def type_of_stakeholder_engagement_update(request, pk):
    """Update an existing type of stakeholder engagement record"""
    type_of_stakeholder_engagement = get_object_or_404(TypeOfStakeholderEngagement, id=pk)
    if request.method == 'POST':
        form = TypeOfStakeholderEngagementForm(request.POST, instance=type_of_stakeholder_engagement)
        if form.is_valid():
            form.save()
            messages.success(request, 'Type of stakeholder engagement record updated successfully!')
            return redirect('setup:type_of_stakeholder_engagement_list')
    else:
        form = TypeOfStakeholderEngagementForm(instance=type_of_stakeholder_engagement)
    
    context = {
        'form': form, 
        'type_of_stakeholder_engagement': type_of_stakeholder_engagement, 
        'title': f'Edit Type of Stakeholder Engagement: {type_of_stakeholder_engagement.stake_holder_engagement}'
    }
    return render(request, 'setup/type_of_stakeholder_engagement/type_of_stakeholder_engagement_form.html', context)

@login_required
def type_of_stakeholder_engagement_delete(request, pk):
    """Delete a type of stakeholder engagement record"""
    type_of_stakeholder_engagement = get_object_or_404(TypeOfStakeholderEngagement, id=pk)
    if request.method == 'POST':
        engagement_description = type_of_stakeholder_engagement.stake_holder_engagement
        type_of_stakeholder_engagement.delete()
        messages.success(request, f'Type of stakeholder engagement "{engagement_description}" deleted successfully!')
        return redirect('setup:type_of_stakeholder_engagement_list')
    
    context = {'type_of_stakeholder_engagement': type_of_stakeholder_engagement}
    return render(request, 'setup/type_of_stakeholder_engagement/type_of_stakeholder_engagement_confirm_delete.html', context)


# ============ ACCESS CRUD OPERATIONS ============

@login_required
def access_list(request):
    """List all access records with pagination and search"""
    access_list = Access.objects.all().order_by('id')
    
    # Search functionality
    search_query = request.GET.get('search')
    if search_query:
        access_list = access_list.filter(
            access_type__icontains=search_query
        )
    
    paginator = Paginator(access_list, 20)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    context = {
        'access': page_obj,
        'total_access': Access.objects.count(),
        'search_query': search_query,
    }
    return render(request, 'setup/access/access_list.html', context)

@login_required
def access_create(request):
    """Create a new access record"""
    if request.method == 'POST':
        form = AccessForm(request.POST)
        if form.is_valid():
            access = form.save(commit=False)
            access.loginUser = request.user
            access.save()
            messages.success(request, 'Access record created successfully!')
            return redirect('setup:access_list')
    else:
        form = AccessForm()
    
    context = {'form': form, 'title': 'Add New Access'}
    return render(request, 'setup/access/access_form.html', context)

@login_required
def access_detail(request, pk):
    """View details of an access record"""
    access = get_object_or_404(Access, id=pk)
    context = {'access': access}
    return render(request, 'setup/access/access_detail.html', context)

@login_required
def access_update(request, pk):
    """Update an existing access record"""
    access = get_object_or_404(Access, id=pk)
    if request.method == 'POST':
        form = AccessForm(request.POST, instance=access)
        if form.is_valid():
            form.save()
            messages.success(request, 'Access record updated successfully!')
            return redirect('setup:access_list')
    else:
        form = AccessForm(instance=access)
    
    context = {
        'form': form, 
        'access': access, 
        'title': f'Edit Access: {access.access_type}'
    }
    return render(request, 'setup/access/access_form.html', context)

@login_required
def access_delete(request, pk):
    """Delete an access record"""
    access = get_object_or_404(Access, id=pk)
    if request.method == 'POST':
        access_description = access.access_type
        access.delete()
        messages.success(request, f'Access "{access_description}" deleted successfully!')
        return redirect('setup:access_list')
    
    context = {'access': access}
    return render(request, 'setup/access/access_confirm_delete.html', context)


# ============ DATA COLLECTION FREQUENCY CRUD OPERATIONS ============

@login_required
def data_collection_frequency_list(request):
    """List all data collection frequency records with pagination and search"""
    data_collection_frequency_list = Data_Collection_Frequency.objects.all().order_by('id')
    
    # Search functionality
    search_query = request.GET.get('search')
    if search_query:
        data_collection_frequency_list = data_collection_frequency_list.filter(
            frequency__icontains=search_query
        )
    
    paginator = Paginator(data_collection_frequency_list, 20)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    context = {
        'data_collection_frequency': page_obj,
        'total_data_collection_frequency': Data_Collection_Frequency.objects.count(),
        'search_query': search_query,
    }
    return render(request, 'setup/data_collection_frequency/data_collection_frequency_list.html', context)

@login_required
def data_collection_frequency_create(request):
    """Create a new data collection frequency record"""
    if request.method == 'POST':
        form = DataCollectionFrequencyForm(request.POST)
        if form.is_valid():
            data_collection_frequency = form.save(commit=False)
            data_collection_frequency.loginUser = request.user
            data_collection_frequency.save()
            messages.success(request, 'Data collection frequency record created successfully!')
            return redirect('setup:data_collection_frequency_list')
    else:
        form = DataCollectionFrequencyForm()
    
    context = {'form': form, 'title': 'Add New Data Collection Frequency'}
    return render(request, 'setup/data_collection_frequency/data_collection_frequency_form.html', context)

@login_required
def data_collection_frequency_detail(request, pk):
    """View details of a data collection frequency record"""
    data_collection_frequency = get_object_or_404(Data_Collection_Frequency, id=pk)
    context = {'data_collection_frequency': data_collection_frequency}
    return render(request, 'setup/data_collection_frequency/data_collection_frequency_detail.html', context)

@login_required
def data_collection_frequency_update(request, pk):
    """Update an existing data collection frequency record"""
    data_collection_frequency = get_object_or_404(Data_Collection_Frequency, id=pk)
    if request.method == 'POST':
        form = DataCollectionFrequencyForm(request.POST, instance=data_collection_frequency)
        if form.is_valid():
            form.save()
            messages.success(request, 'Data collection frequency record updated successfully!')
            return redirect('setup:data_collection_frequency_list')
    else:
        form = DataCollectionFrequencyForm(instance=data_collection_frequency)
    
    context = {
        'form': form, 
        'data_collection_frequency': data_collection_frequency, 
        'title': f'Edit Data Collection Frequency: {data_collection_frequency.frequency}'
    }
    return render(request, 'setup/data_collection_frequency/data_collection_frequency_form.html', context)

@login_required
def data_collection_frequency_delete(request, pk):
    """Delete a data collection frequency record"""
    data_collection_frequency = get_object_or_404(Data_Collection_Frequency, id=pk)
    if request.method == 'POST':
        frequency_description = data_collection_frequency.frequency
        data_collection_frequency.delete()
        messages.success(request, f'Data collection frequency "{frequency_description}" deleted successfully!')
        return redirect('setup:data_collection_frequency_list')
    
    context = {'data_collection_frequency': data_collection_frequency}
    return render(request, 'setup/data_collection_frequency/data_collection_frequency_confirm_delete.html', context)