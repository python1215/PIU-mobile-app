import django_filters
from django import forms
from .models import projectMapping
from PIU_Financial_mgt.models import Project, Donor
from setup.models import Regions, Districts, YEAR, Access
from social_and_env.models import Settlement


class ProjectMappingFilter(django_filters.FilterSet):
    """
    Comprehensive filter for Project Mapping list with multiple filter options
    """
    
    # Region filter
    region = django_filters.ModelChoiceFilter(
        queryset=Regions.objects.all().order_by('region_name'),
        field_name='region',
        empty_label="All Regions",
        widget=forms.Select(attrs={
            'class': 'form-select form-select-sm',
            'id': 'region-filter'
        })
    )
    
    # District filter
    district = django_filters.ModelChoiceFilter(
        queryset=Districts.objects.all().order_by('district_name'),
        field_name='district',
        empty_label="All Districts",
        widget=forms.Select(attrs={
            'class': 'form-select form-select-sm',
            'id': 'district-filter'
        })
    )
    
    # Settlement filter
    settlement = django_filters.ModelChoiceFilter(
        queryset=Settlement.objects.all().order_by('settlement_name'),
        field_name='settlement',
        empty_label="All Settlements",
        widget=forms.Select(attrs={
            'class': 'form-select form-select-sm',
            'id': 'settlement-filter'
        })
    )
    
    # Project filter (ManyToMany relationship)
    project = django_filters.ModelChoiceFilter(
        queryset=Project.objects.all().order_by('project'),
        field_name='project',
        empty_label="All Projects",
        widget=forms.Select(attrs={
            'class': 'form-select form-select-sm',
            'id': 'project-filter'
        })
    )
    
    # Donor Profile filter (ManyToMany relationship)
    donor = django_filters.ModelChoiceFilter(
        queryset=Donor.objects.all().order_by('name'),
        field_name='donor',
        empty_label="All Donors",
        widget=forms.Select(attrs={
            'class': 'form-select form-select-sm',
            'id': 'donor-filter'
        })
    )
    
    # Year filter
    profile_year = django_filters.ModelChoiceFilter(
        queryset=YEAR.objects.all().order_by('profile_year'),
        field_name='profile_year',
        empty_label="All Years",
        widget=forms.Select(attrs={
            'class': 'form-select form-select-sm',
            'id': 'year-filter'
        })
    )
    
    # Access Type filter
    access = django_filters.ModelChoiceFilter(
        queryset=Access.objects.all().order_by('access_type'),
        field_name='access',
        empty_label="All Access Types",
        widget=forms.Select(attrs={
            'class': 'form-select form-select-sm',
            'id': 'access-filter'
        })
    )
    
    # Search by settlement name
    settlement_search = django_filters.CharFilter(
        field_name='settlement__settlement_name',
        lookup_expr='icontains',
        widget=forms.TextInput(attrs={
            'class': 'form-control form-control-sm',
            'placeholder': 'Search settlement...',
            'id': 'settlement-search'
        }),
        label='Settlement Search'
    )
    
    class Meta:
        model = projectMapping
        fields = ['region', 'district', 'settlement', 'project', 'donor', 'profile_year', 'access']