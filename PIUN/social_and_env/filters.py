import django_filters
from django import forms
from django_filters import FilterSet, ModelChoiceFilter

# Import all required models from their respective modules
from .models import GrievianceMonitoringLog, OHS_Monitoring, PAP, ESIA, CommunityConsult_Engagement
from PIU_Financial_mgt.models import Project, KPI_For_Contract
from setup.models import (
    YEAR, Quarter, Regions, Districts, Settlement,
    DecisionOutcome, TypeOfPAP, PAPCategory, VulnerabilityCategory, 
    TypeOfImpact, NatureOfSettlement, TypeOfStakeholderEngagement
)



class GrievianceMonitoringLogFilter(django_filters.FilterSet):
    project = django_filters.ModelChoiceFilter(
        queryset=Project.objects.all(),
        label="Project",
        empty_label="All Projects",
        widget=forms.Select(attrs={'class': 'form-select'})
    )

    type_of_investment = django_filters.ModelChoiceFilter(
        queryset=KPI_For_Contract.objects.filter(monitoring_type_id='ESS'),
        label="Type of Investment",
        empty_label="All Investment Types",
        widget=forms.Select(attrs={'class': 'form-select'})
    )

    sex = django_filters.ChoiceFilter(
        choices=[('', 'All Genders')] + list(GrievianceMonitoringLog._meta.get_field('sex').choices),
        label="Gender",
        widget=forms.Select(attrs={'class': 'form-select'})
    )

    decision_outcome = django_filters.ModelChoiceFilter(
        queryset=DecisionOutcome.objects.all(),
        label="Decision Outcome",
        empty_label="All Outcomes",
        widget=forms.Select(attrs={'class': 'form-select'})
    )

    was_complainant_satisfied_with_decision = django_filters.ChoiceFilter(
        choices=[('', 'All Satisfaction Levels'), ('Y', 'Satisfied'), ('N', 'Not Satisfied')],
        label="Complainant Satisfaction",
        widget=forms.Select(attrs={'class': 'form-select'})
    )

    communication_method = django_filters.ChoiceFilter(
        choices=[('', 'All Methods')] + list(GrievianceMonitoringLog.Communication_method),
        label="Communication Method",
        widget=forms.Select(attrs={'class': 'form-select'})
    )

    how_complaint_was_received = django_filters.ChoiceFilter(
        choices=[('', 'All Methods')] + list(GrievianceMonitoringLog.Communication_method),
        label="How Complaint Was Received",
        widget=forms.Select(attrs={'class': 'form-select'})
    )

    # Date range filters
    date_claim_recieved_after = django_filters.DateFilter(
        field_name='date_claim_recieved',
        lookup_expr='gte',
        label='Date Received (From)',
        widget=forms.DateInput(attrs={'class': 'form-control', 'type': 'date'})
    )
    
    date_claim_recieved_before = django_filters.DateFilter(
        field_name='date_claim_recieved',
        lookup_expr='lte',
        label='Date Received (To)',
        widget=forms.DateInput(attrs={'class': 'form-control', 'type': 'date'})
    )

    # Text search filters
    name_of_complainant = django_filters.CharFilter(
        lookup_expr='icontains',
        label="Complainant Name",
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Search by complainant name...'})
    )

    complaint_content = django_filters.CharFilter(
        lookup_expr='icontains',
        label="Complaint Content",
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Search in complaint content...'})
    )

    case_no = django_filters.CharFilter(
        lookup_expr='icontains',
        label="Case Number",
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Search by case number...'})
    )

    class Meta:
        model = GrievianceMonitoringLog
        fields = [
            'project', 'type_of_investment', 'sex', 'decision_outcome',
            'was_complainant_satisfied_with_decision', 'communication_method',
            'how_complaint_was_received', 'date_claim_recieved_after', 
            'date_claim_recieved_before', 'name_of_complainant', 
            'complaint_content', 'case_no'
        ]

class OHSMonitoringFilter(FilterSet):
    project = ModelChoiceFilter(
        queryset=Project.objects.all(), 
        label="Project",
        empty_label="All Projects",
        widget=forms.Select(attrs={'class': 'form-select'})
    )
    Type_of_Investment = ModelChoiceFilter(
        queryset=KPI_For_Contract.objects.filter(monitoring_type_id='ESS'),
        label="Type of Investment",
        empty_label="All Investment Types",
        widget=forms.Select(attrs={'class': 'form-select'})
    )
    year_of_report = ModelChoiceFilter(
        queryset=YEAR.objects.all(), 
        label="Year",
        empty_label="All Years",
        widget=forms.Select(attrs={'class': 'form-select'})
    )
    quarter = ModelChoiceFilter(
        queryset=Quarter.objects.all(), 
        label="Quarter",
        empty_label="All Quarters",
        widget=forms.Select(attrs={'class': 'form-select'})
    )
    region = ModelChoiceFilter(
        queryset=Regions.objects.all(), 
        label="Region",
        empty_label="All Regions",
        widget=forms.Select(attrs={'class': 'form-select'})
    )
    district = ModelChoiceFilter(
        queryset=Districts.objects.all(), 
        label="District",
        empty_label="All Districts",
        widget=forms.Select(attrs={'class': 'form-select'})
    )
    settlement = ModelChoiceFilter(
        queryset=Settlement.objects.all(), 
        label="Settlement",
        empty_label="All Settlements",
        widget=forms.Select(attrs={'class': 'form-select'})
    )

    # Method 1: Using separate date filters (recommended)
    date_after = django_filters.DateFilter(
        field_name='date',
        lookup_expr='gte',
        label='Date Received (From)'
    )
    
    date_before = django_filters.DateFilter(
        field_name='date',
        lookup_expr='lte',
        label='Date Received (To)'
    )
    
  
    class Meta:
        model = OHS_Monitoring
        fields = [
            'project', 'Type_of_Investment', 'year_of_report', 'quarter',
            'region', 'district', 'settlement', 'date_after','date_before'
        ]


class PAPFilter(django_filters.FilterSet):
    project = django_filters.ModelChoiceFilter(
        queryset=Project.objects.all(),
        label="Project",
        widget=forms.Select(attrs={
            "class": "form-select",
            "hx-get": "/social_and_env/ajax/load-investment-types-pap/",
            "hx-target": "#id_type_of_investment",
            "hx-trigger": "change",
            "hx-include": "this"
        })
    )

    type_of_investment = django_filters.ModelChoiceFilter(
        queryset=KPI_For_Contract.objects.filter(monitoring_type_id='ESS'),
        label="Type of Investment",
        widget=forms.Select(attrs={"class": "form-select"})
    )

    type_of_pap = django_filters.ModelChoiceFilter(
        queryset=TypeOfPAP.objects.all(),
        label="Type of PAP"
    )

    region = django_filters.ModelChoiceFilter(
        queryset=Regions.objects.all(),
        label="Region",
        widget=forms.Select(attrs={
            "class": "form-select",
            "hx-get": "/social_and_env/ajax/load-districts/",
            "hx-target": "#id_district",
            "hx-trigger": "change",
            "hx-include": "this"
        })
    )

    district = django_filters.ModelChoiceFilter(
        queryset=Districts.objects.all(),
        label="District",
        widget=forms.Select(attrs={
            "class": "form-select",
            "hx-get": "/social_and_env/ajax/load-settlements/",
            "hx-target": "#id_pap_Current_Address",
            "hx-trigger": "change",
            "hx-include": "this"
        })
    )

    pap_Current_Address = django_filters.ModelChoiceFilter(
        queryset=Settlement.objects.all(),
        label="Current Address",
        widget=forms.Select(attrs={"class": "form-select"})
    )

    pap_category = django_filters.ModelChoiceFilter(
        queryset=PAPCategory.objects.all(),
        label="PAP Category"
    )

    vulnerability_category = django_filters.ModelChoiceFilter(
        queryset=VulnerabilityCategory.objects.all(),
        label="Vulnerability Category"
    )

    type_of_impact = django_filters.ModelChoiceFilter(
        queryset=TypeOfImpact.objects.all(),
        label="Type of Impact"
    )

    nature_of_compensation = django_filters.ModelChoiceFilter(
        queryset=NatureOfSettlement.objects.all(),
        label="Nature of Compensation"
    )

    sex = django_filters.ChoiceFilter(
        choices=PAP._meta.get_field('sex').choices,
        label="Sex"
    )

    pap_compensated = django_filters.ChoiceFilter(
        choices=PAP.YesOrNo,
        label="Compensated?"
    )

       # Method 1: Using separate date filters (recommended)
    compensation_date_after = django_filters.DateFilter(
        field_name='compensation_date',
        lookup_expr='gte',
        label='Date Received (From)'
    )
    
    compensation_date_before = django_filters.DateFilter(
        field_name='compensation_date',
        lookup_expr='lte',
        label='Date Received (To)'
    )

    remarks = django_filters.CharFilter(
        field_name='remarks',
        lookup_expr='icontains',
        label="Remarks"
    )

    class Meta:
        model = PAP
        fields = [
            'project', 'type_of_investment', 'type_of_pap',
            'region', 'district', 'pap_Current_Address', 'pap_category',
            'vulnerability_category', 'type_of_impact', 'nature_of_compensation',
            'sex', 'pap_compensated', 'compensation_date_after', 'compensation_date_before', 'remarks'
        ]




class ESIAFilter(django_filters.FilterSet):
    project_name = django_filters.ModelChoiceFilter(
        queryset=Project.objects.all(),
        label="Project",
        empty_label="All Projects",
        widget=forms.Select(attrs={'class': 'form-select'})
    )

    type_of_investment = django_filters.ModelChoiceFilter(
        queryset=KPI_For_Contract.objects.filter(monitoring_type_id="ESS"),
        label="Type of Investment",
        empty_label="All Investment Types",
        widget=forms.Select(attrs={'class': 'form-select'})
    )

    project_locations = django_filters.CharFilter(
        lookup_expr="icontains",
        label="Location"
    )

    date_created_after = django_filters.DateFilter(
        field_name="date_created",
        lookup_expr="gte",
        label="Created (From)"
    )

    date_created_before = django_filters.DateFilter(
        field_name="date_created",
        lookup_expr="lte",
        label="Created (To)"
    )

    class Meta:
        model = ESIA
        fields = [
            "project_name",
            "type_of_investment",
            "project_locations",
            "date_created_after",
            "date_created_before"
        ]



class CommunityEngagementFilter(django_filters.FilterSet):
    project_name = django_filters.ModelChoiceFilter(queryset=Project.objects.all(), label="Project")
    year = django_filters.ModelChoiceFilter(queryset=YEAR.objects.all(), label="Year")
    stake_holder_engagement_Types = django_filters.ModelChoiceFilter(
        queryset=TypeOfStakeholderEngagement.objects.all(),
        label="Engagement Type"
    )
    date_of_consultation_after = django_filters.DateFilter(
        field_name='date_of_consultation', lookup_expr='gte', label='Date (From)'
    )
    date_of_consultation_before = django_filters.DateFilter(
        field_name='date_of_consultation', lookup_expr='lte', label='Date (To)'
    )

    class Meta:
        model = CommunityConsult_Engagement
        fields = [
            'project_name', 'year', 'stake_holder_engagement_Types',
            'date_of_consultation_after', 'date_of_consultation_before'
        ]

