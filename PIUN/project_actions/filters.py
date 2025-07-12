import django_filters
from django import forms
from django.db.models import Q
from django.utils import timezone

from .models import Contract_Profiling_works, Contract_Profiling_goods_services, Specific_Contract_Monitoring

# Safe imports with error handling
try:
    from setup.models import (
        ProjectCategory, Donor, Type_of_Monitoring, 
        Physicalprogress, Quarter, KPI_For_Contract
    )
except ImportError:
    ProjectCategory = Donor = Type_of_Monitoring = None
    Physicalprogress = Quarter = KPI_For_Contract = None

try:
    from PIU_Financial_mgt.models import Project, Component, Subcomponent, Activities, Currency
except ImportError:
    Project = Component = Subcomponent = Activities = Currency = None


class ContractProfilingWorksFilter(django_filters.FilterSet):
    """Advanced filtering for Contract Profiling Works"""
    
    # Text search across multiple fields
    search = django_filters.CharFilter(
        method='filter_search',
        widget=forms.TextInput(attrs={
            'placeholder': 'Search by contract ref, contractor, consultant, or location...',
            'class': 'form-control'
        })
    )
    
    # Date range filters
    contract_start_date = django_filters.DateFromToRangeFilter(
        widget=django_filters.widgets.RangeWidget(attrs={
            'type': 'date',
            'class': 'form-control'
        })
    )
    
    contract_end_date = django_filters.DateFromToRangeFilter(
        widget=django_filters.widgets.RangeWidget(attrs={
            'type': 'date',
            'class': 'form-control'
        })
    )
    
    # Value range filter
    contract_value = django_filters.RangeFilter(
        widget=django_filters.widgets.RangeWidget(attrs={
            'type': 'number',
            'step': '0.01',
            'class': 'form-control'
        })
    )
    
    # Boolean filters
    amendments = django_filters.BooleanFilter(
        widget=forms.Select(
            choices=[('', 'All'), (True, 'Yes'), (False, 'No')],
            attrs={'class': 'form-select'}
        )
    )
    
    # Choice filters with proper widgets - filtered to show only NAWEC
    if Project:
        projectID = django_filters.ModelChoiceFilter(
            queryset=Project.objects.filter(projectID='NAWEC'),
            widget=forms.Select(attrs={'class': 'form-select'}),
            empty_label="All Projects"
        )
    
    if ProjectCategory:
        project_Category = django_filters.ModelChoiceFilter(
            queryset=ProjectCategory.objects.all(),
            widget=forms.Select(attrs={'class': 'form-select'}),
            empty_label="All Categories"
        )
    
    if Donor:
        funding_source = django_filters.ModelChoiceFilter(
            queryset=Donor.objects.all(),
            widget=forms.Select(attrs={'class': 'form-select'}),
            empty_label="All Funding Sources"
        )
    
    if Currency:
        currency = django_filters.ModelChoiceFilter(
            queryset=Currency.objects.all(),
            widget=forms.Select(attrs={'class': 'form-select'}),
            empty_label="All Currencies"
        )
    
    # Custom filters for contract status
    contract_status = django_filters.ChoiceFilter(
        choices=[
            ('', 'All Contracts'),
            ('active', 'Active'),
            ('completed', 'Completed'),
            ('upcoming', 'Upcoming'),
        ],
        method='filter_contract_status',
        widget=forms.Select(attrs={'class': 'form-select'})
    )

    class Meta:
        model = Contract_Profiling_works
        fields = [
            'projectID', 'project_Category', 'funding_source', 'currency', 'amendments',
            'contract_start_date', 'contract_end_date', 'contract_value'
        ]


    def filter_search(self, queryset, name, value):
        if value:
            return queryset.filter(
                Q(contract_refNo__icontains=value) |
                Q(name_of_contractor__icontains=value) |
                Q(name_of_consultant__icontains=value) |
                Q(location_of_investment__icontains=value) |
                Q(main_intervention_focus_result__icontains=value) |
                Q(remarks__icontains=value)
            )
        return queryset

    def filter_contract_status(self, queryset, name, value):
        today = timezone.now().date()
        if value == 'active':
            return queryset.filter(
                contract_start_date__lte=today,
                contract_end_date__gte=today
            )
        elif value == 'completed':
            return queryset.filter(contract_end_date__lt=today)
        elif value == 'upcoming':
            return queryset.filter(contract_start_date__gt=today)
        return queryset


class ContractProfilingGoodsServicesFilter(django_filters.FilterSet):
    """Advanced filtering for Contract Profiling Goods & Services"""
    
    # Text search across multiple fields
    search = django_filters.CharFilter(
        method='filter_search',
        widget=forms.TextInput(attrs={
            'placeholder': 'Search by contract ref, supplier, consultant...',
            'class': 'form-control'
        })
    )
    
    # Date range filters
    contract_start_date = django_filters.DateFromToRangeFilter(
        widget=django_filters.widgets.RangeWidget(attrs={
            'type': 'date',
            'class': 'form-control'
        })
    )
    
    contract_end_date = django_filters.DateFromToRangeFilter(
        widget=django_filters.widgets.RangeWidget(attrs={
            'type': 'date',
            'class': 'form-control'
        })
    )
    
    # Value range filter
    contract_value = django_filters.RangeFilter(
        widget=django_filters.widgets.RangeWidget(attrs={
            'type': 'number',
            'step': '0.01',
            'class': 'form-control'
        })
    )
    
    # Boolean filters
    amendments = django_filters.BooleanFilter(
        widget=forms.Select(
            choices=[('', 'All'), (True, 'Yes'), (False, 'No')],
            attrs={'class': 'form-select'}
        )
    )
    
    # Choice filters - filtered to show only NAWEC
    if Project:
        projectID = django_filters.ModelChoiceFilter(
            queryset=Project.objects.filter(projectID='NAWEC'),
            widget=forms.Select(attrs={'class': 'form-select'}),
            empty_label="All Projects"
        )
    
    if ProjectCategory:
        project_Category = django_filters.ModelChoiceFilter(
            queryset=ProjectCategory.objects.all(),
            widget=forms.Select(attrs={'class': 'form-select'}),
            empty_label="All Categories"
        )
    
    if Donor:
        funding_source = django_filters.ModelChoiceFilter(
            queryset=Donor.objects.all(),
            widget=forms.Select(attrs={'class': 'form-select'}),
            empty_label="All Funding Sources"
        )
    
    if Currency:
        currency = django_filters.ModelChoiceFilter(
            queryset=Currency.objects.all(),
            widget=forms.Select(attrs={'class': 'form-select'}),
            empty_label="All Currencies"
        )
    
    # Custom filters for contract status
    contract_status = django_filters.ChoiceFilter(
        choices=[
            ('', 'All Contracts'),
            ('active', 'Active'),
            ('completed', 'Completed'),
            ('upcoming', 'Upcoming'),
        ],
        method='filter_contract_status',
        widget=forms.Select(attrs={'class': 'form-select'})
    )

    class Meta:
        model = Contract_Profiling_goods_services
        fields = []

    def filter_search(self, queryset, name, value):
        if value:
            return queryset.filter(
                Q(contract_refNo__icontains=value) |
                Q(name_of_Supplier__icontains=value) |
                Q(name_of_consultant__icontains=value) |
                Q(remarks__icontains=value)
            )
        return queryset

    def filter_contract_status(self, queryset, name, value):
        today = timezone.now().date()
        if value == 'active':
            return queryset.filter(
                contract_start_date__lte=today,
                contract_end_date__gte=today
            )
        elif value == 'completed':
            return queryset.filter(contract_end_date__lt=today)
        elif value == 'upcoming':
            return queryset.filter(contract_start_date__gt=today)
        return queryset


class SpecificContractMonitoringFilter(django_filters.FilterSet):
    """Advanced filtering for Specific Contract Monitoring"""
    
    # Text search across multiple fields
    search = django_filters.CharFilter(
        method='filter_search',
        widget=forms.TextInput(attrs={
            'placeholder': 'Search by contract ref, target, status...',
            'class': 'form-control'
        })
    )
    
    # Date range filters
    monitoring_date = django_filters.DateFromToRangeFilter(
        widget=django_filters.widgets.RangeWidget(attrs={
            'type': 'date',
            'class': 'form-control'
        })
    )
    
    milestone_start_date = django_filters.DateFromToRangeFilter(
        widget=django_filters.widgets.RangeWidget(attrs={
            'type': 'date',
            'class': 'form-control'
        })
    )
    
    milestone_end_date = django_filters.DateFromToRangeFilter(
        widget=django_filters.widgets.RangeWidget(attrs={
            'type': 'date',
            'class': 'form-control'
        })
    )
    
    # Choice filters - filtered to show only NAWEC
    if Project:
        project = django_filters.ModelChoiceFilter(
            queryset=Project.objects.filter(projectID='NAWEC'),
            widget=forms.Select(attrs={'class': 'form-select'}),
            empty_label="All Projects"
        )
    
    if Quarter:
        quarter = django_filters.ModelChoiceFilter(
            queryset=Quarter.objects.all(),
            widget=forms.Select(attrs={'class': 'form-select'}),
            empty_label="All Quarters"
        )
    
    if Type_of_Monitoring:
        type_of_monitoring = django_filters.ModelChoiceFilter(
            queryset=Type_of_Monitoring.objects.all(),
            widget=forms.Select(attrs={'class': 'form-select'}),
            empty_label="All Monitoring Types"
        )
    
    if Physicalprogress:
        Contract_implementation_Status = django_filters.ModelChoiceFilter(
            queryset=Physicalprogress.objects.all(),
            widget=forms.Select(attrs={'class': 'form-select'}),
            empty_label="All Implementation Status"
        )
    
    if KPI_For_Contract:
        Type_of_Investment = django_filters.ModelChoiceFilter(
            queryset=KPI_For_Contract.objects.all(),
            widget=forms.Select(attrs={'class': 'form-select'}),
            empty_label="All Investment Types"
        )
    
    # Custom filters
    milestone_status = django_filters.ChoiceFilter(
        choices=[
            ('', 'All Milestones'),
            ('upcoming', 'Upcoming'),
            ('active', 'Active'),
            ('overdue', 'Overdue'),
            ('completed', 'Completed'),
        ],
        method='filter_milestone_status',
        widget=forms.Select(attrs={'class': 'form-select'})
    )

    class Meta:
        model = Specific_Contract_Monitoring
        fields = []

    def filter_search(self, queryset, name, value):
        if value:
            return queryset.filter(
                Q(contract_refNo__icontains=value) |
                Q(Target__icontains=value) |
                Q(Achieved_status__icontains=value) |
                Q(remarks__icontains=value)
            )
        return queryset

    def filter_milestone_status(self, queryset, name, value):
        today = timezone.now().date()
        if value == 'upcoming':
            return queryset.filter(milestone_start_date__gt=today)
        elif value == 'active':
            return queryset.filter(
                milestone_start_date__lte=today,
                milestone_end_date__gte=today
            )
        elif value == 'overdue':
            return queryset.filter(milestone_end_date__lt=today)
        elif value == 'completed':
            # Assuming completed means monitoring date is after milestone end
            return queryset.filter(
                monitoring_date__gte=models.F('milestone_end_date')
            )
        return queryset
