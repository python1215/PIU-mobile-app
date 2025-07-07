import django_filters
from django import forms
from .models import Indicator_Description, Results_Oriented_Monitoring
from PIU_Financial_mgt.models import Project, PDO, ProjectOutCome, ProjectResult
from setup.models import Indicator_Type, YEAR, Quarter, Measurement_Unit, Data_Collection_Frequency


class IndicatorDescriptionFilter(django_filters.FilterSet):
    """Advanced filtering for Indicator Descriptions"""
    project = django_filters.ModelChoiceFilter(
        queryset=Project.objects.all(),
        label="Project",
        empty_label="All Projects"
    )
    
    pdo = django_filters.ModelChoiceFilter(
        queryset=PDO.objects.all(),
        label="PDO",
        empty_label="All PDOs"
    )
    
    project_outcome = django_filters.ModelChoiceFilter(
        queryset=ProjectOutCome.objects.all(),
        label="Project Outcome",
        empty_label="All Outcomes"
    )
    
    project_result = django_filters.ModelChoiceFilter(
        queryset=ProjectResult.objects.all(),
        label="Project Result",
        empty_label="All Results"
    )
    
    indicator_type = django_filters.ModelChoiceFilter(
        queryset=Indicator_Type.objects.all(),
        label="Indicator Type",
        empty_label="All Types"
    )
    
    indicator_description = django_filters.CharFilter(
        field_name='indicator_description',
        lookup_expr='icontains',
        label="Description Contains"
    )
    
    loginUser = django_filters.CharFilter(
        field_name='loginUser__username',
        lookup_expr='icontains',
        label="Created By"
    )

    class Meta:
        model = Indicator_Description
        fields = [
            'project', 'pdo', 'project_outcome', 'project_result',
            'indicator_type', 'indicator_description', 'loginUser'
        ]


class ResultsOrientedMonitoringFilter(django_filters.FilterSet):
    """Advanced filtering for Results Oriented Monitoring"""
    year = django_filters.ModelChoiceFilter(
        queryset=YEAR.objects.all(),
        label="Year",
        empty_label="All Years"
    )
    
    quarter = django_filters.ModelChoiceFilter(
        queryset=Quarter.objects.all(),
        label="Quarter",
        empty_label="All Quarters"
    )
    
    project = django_filters.ModelChoiceFilter(
        queryset=Project.objects.all(),
        label="Project",
        empty_label="All Projects"
    )
    
    pdo = django_filters.ModelChoiceFilter(
        queryset=PDO.objects.all(),
        label="PDO",
        empty_label="All PDOs"
    )
    
    project_outcome = django_filters.ModelChoiceFilter(
        queryset=ProjectOutCome.objects.all(),
        label="Project Outcome",
        empty_label="All Outcomes"
    )
    
    project_result = django_filters.ModelChoiceFilter(
        queryset=ProjectResult.objects.all(),
        label="Project Result",
        empty_label="All Results"
    )
    
    indicator_type = django_filters.ModelChoiceFilter(
        queryset=Indicator_Type.objects.all(),
        label="Indicator Type",
        empty_label="All Types"
    )
    
    measurement_unit = django_filters.ModelChoiceFilter(
        queryset=Measurement_Unit.objects.all(),
        label="Measurement Unit",
        empty_label="All Units"
    )
    
    collection_frequency = django_filters.ModelChoiceFilter(
        queryset=Data_Collection_Frequency.objects.all(),
        label="Collection Frequency",
        empty_label="All Frequencies"
    )
    
    indicator_description = django_filters.CharFilter(
        field_name='indicator_description',
        lookup_expr='icontains',
        label="Description Contains"
    )
    
    baseline_value_min = django_filters.NumberFilter(
        field_name='baseline_value',
        lookup_expr='gte',
        label='Baseline Value (Min)'
    )
    
    baseline_value_max = django_filters.NumberFilter(
        field_name='baseline_value',
        lookup_expr='lte',
        label='Baseline Value (Max)'
    )
    
    achieved_value_min = django_filters.NumberFilter(
        field_name='achieved_value',
        lookup_expr='gte',
        label='Achieved Value (Min)'
    )
    
    achieved_value_max = django_filters.NumberFilter(
        field_name='achieved_value',
        lookup_expr='lte',
        label='Achieved Value (Max)'
    )
    
    end_target_value_min = django_filters.NumberFilter(
        field_name='End_Target_Value',
        lookup_expr='gte',
        label='End Target Value (Min)'
    )
    
    end_target_value_max = django_filters.NumberFilter(
        field_name='End_Target_Value',
        lookup_expr='lte',
        label='End Target Value (Max)'
    )
    
    percentage_achieved_vs_baseline_min = django_filters.NumberFilter(
        field_name='percentage_achieved_vs_baseline',
        lookup_expr='gte',
        label='% Achieved vs Baseline (Min)'
    )
    
    percentage_achieved_vs_baseline_max = django_filters.NumberFilter(
        field_name='percentage_achieved_vs_baseline',
        lookup_expr='lte',
        label='% Achieved vs Baseline (Max)'
    )
    
    percentage_achieved_vs_end_target_min = django_filters.NumberFilter(
        field_name='percentage_achieved_vs_end_target',
        lookup_expr='gte',
        label='% Achieved vs End Target (Min)'
    )
    
    percentage_achieved_vs_end_target_max = django_filters.NumberFilter(
        field_name='percentage_achieved_vs_end_target',
        lookup_expr='lte',
        label='% Achieved vs End Target (Max)'
    )
    
    remarks = django_filters.CharFilter(
        field_name='remarks',
        lookup_expr='icontains',
        label="Remarks Contains"
    )
    
    date_created_after = django_filters.DateFilter(
        field_name='date_created',
        lookup_expr='gte',
        label='Created After',
        widget=forms.DateInput(attrs={'type': 'date'})
    )
    
    date_created_before = django_filters.DateFilter(
        field_name='date_created',
        lookup_expr='lte',
        label='Created Before',
        widget=forms.DateInput(attrs={'type': 'date'})
    )
    
    loginUser = django_filters.CharFilter(
        field_name='loginUser__username',
        lookup_expr='icontains',
        label="Created By"
    )

    class Meta:
        model = Results_Oriented_Monitoring
        fields = [
            'year', 'quarter', 'project', 'pdo', 'project_outcome', 'project_result',
            'indicator_type', 'measurement_unit', 'collection_frequency',
            'indicator_description', 'baseline_value_min', 'baseline_value_max',
            'achieved_value_min', 'achieved_value_max', 'end_target_value_min',
            'end_target_value_max', 'percentage_achieved_vs_baseline_min',
            'percentage_achieved_vs_baseline_max', 'percentage_achieved_vs_end_target_min',
            'percentage_achieved_vs_end_target_max', 'remarks', 'date_created_after',
            'date_created_before', 'loginUser'
        ]