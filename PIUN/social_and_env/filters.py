import django_filters
from .models import GrievianceMonitoringLog, Project, KPI_For_Contract, DecisionOutcome
from django_filters import FilterSet, ModelChoiceFilter
from .models import OHS_Monitoring, Project, KPI_For_Contract, YEAR, Quarter, Regions, Districts, \
      Settlement, ESIA

from .models import PAP, Project, KPI_For_Contract, TypeOfPAP, Regions, Districts, Settlement, PAPCategory, VulnerabilityCategory, TypeOfImpact, NatureOfSettlement, CommunityConsult_Engagement, TypeOfStakeholderEngagement, YEAR



class GrievianceMonitoringLogFilter(django_filters.FilterSet):
    project = django_filters.ModelChoiceFilter(
        queryset=Project.objects.all(),
        label="Project"
    )

    type_of_investment = django_filters.ModelChoiceFilter(
        queryset=KPI_For_Contract.objects.filter(monitoring_type_id='ESS'),
        label="Type of Investment"
    )

    sex = django_filters.ChoiceFilter(
        choices=GrievianceMonitoringLog._meta.get_field('sex').choices,
        label="Sex"
    )

    decision_outcome = django_filters.ModelChoiceFilter(
        queryset=DecisionOutcome.objects.all(),
        label="Decision Outcome"
    )

    communication_method = django_filters.ChoiceFilter(
        choices=GrievianceMonitoringLog.Communication_method,
        label="Communication Method"
    )

    how_complaint_was_received = django_filters.ChoiceFilter(
        choices=GrievianceMonitoringLog.Communication_method,
        label="How Complaint Was Received"
    )

    # Method 1: Using separate date filters (recommended)
    date_claim_recieved_after = django_filters.DateFilter(
        field_name='date_claim_recieved',
        lookup_expr='gte',
        label='Date Received (From)'
    )
    
    date_claim_recieved_before = django_filters.DateFilter(
        field_name='date_claim_recieved',
        lookup_expr='lte',
        label='Date Received (To)'
    )

    any_follow_up_action = django_filters.CharFilter(
        field_name='any_follow_up_action',
        lookup_expr='icontains',
        label="Follow-up Action"
    )

    class Meta:
        model = GrievianceMonitoringLog
        fields = [
            'project', 'type_of_investment', 'sex',
            'decision_outcome', 'communication_method',
            'how_complaint_was_received', 
            'date_claim_recieved_after', 'date_claim_recieved_before',
            'any_follow_up_action'
        ]

class OHSMonitoringFilter(FilterSet):
    project = ModelChoiceFilter(queryset=Project.objects.all(), label="Project")
    Type_of_Investment = ModelChoiceFilter(
        queryset=KPI_For_Contract.objects.filter(monitoring_type_id='ESS'),
        label="Type of Investment"
    )
    year_of_report = ModelChoiceFilter(queryset=YEAR.objects.all(), label="Year")
    quarter = ModelChoiceFilter(queryset=Quarter.objects.all(), label="Quarter")
    region = ModelChoiceFilter(queryset=Regions.objects.all(), label="Region")
    district = ModelChoiceFilter(queryset=Districts.objects.all(), label="District")
    settlement = ModelChoiceFilter(queryset=Settlement.objects.all(), label="Settlement")

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
        label="Project"
    )

    type_of_investment = django_filters.ModelChoiceFilter(
        queryset=KPI_For_Contract.objects.filter(monitoring_type_id='ESS'),
        label="Type of Investment"
    )

    type_of_pap = django_filters.ModelChoiceFilter(
        queryset=TypeOfPAP.objects.all(),
        label="Type of PAP"
    )

    region = django_filters.ModelChoiceFilter(
        queryset=Regions.objects.all(),
        label="Region"
    )

    district = django_filters.ModelChoiceFilter(
        queryset=Districts.objects.all(),
        label="District"
    )

    pap_Current_Address = django_filters.ModelChoiceFilter(
        queryset=Settlement.objects.all(),
        label="Current Address"
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
            'sex', 'pap_compensated', 'compensation_date', 'remarks'
        ]




class ESIAFilter(django_filters.FilterSet):
    project_name = django_filters.ModelChoiceFilter(
        queryset=Project.objects.all(),
        label="Project"
    )

    type_of_investment = django_filters.ModelChoiceFilter(
        queryset=KPI_For_Contract.objects.filter(monitoring_type_id="ESS"),
        label="Type of Investment"
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

