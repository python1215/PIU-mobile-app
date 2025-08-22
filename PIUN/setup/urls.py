from django.urls import path
from . import views

app_name = 'setup'

urlpatterns = [
    # Dashboard
    path('', views.setup_dashboard, name='setup_dashboard'),
    
    # Donor URLs
    path('donors/', views.donor_list, name='donor_list'),
    path('donors/add/', views.donor_create, name='donor_create'),
    path('donors/<int:pk>/', views.donor_detail, name='donor_detail'),
    path('donors/<int:pk>/edit/', views.donor_update, name='donor_update'),
    path('donors/<int:pk>/delete/', views.donor_delete, name='donor_delete'),
    
    # Contributors URLs
    path('contributors/', views.contributors_list, name='contributors_list'),
    path('contributors/add/', views.contributors_create, name='contributors_create'),
    path('contributors/<int:pk>/', views.contributors_detail, name='contributors_detail'),
    path('contributors/<int:pk>/edit/', views.contributors_update, name='contributors_update'),
    path('contributors/<int:pk>/delete/', views.contributors_delete, name='contributors_delete'),
    
    # Project Category URLs
    path('project-categories/', views.project_category_list, name='project_category_list'),
    path('project-categories/add/', views.project_category_create, name='project_category_create'),
    path('project-categories/<int:pk>/', views.project_category_detail, name='project_category_detail'),
    path('project-categories/<int:pk>/edit/', views.project_category_update, name='project_category_update'),
    path('project-categories/<int:pk>/delete/', views.project_category_delete, name='project_category_delete'),
    
    # Type of Monitoring URLs
    path('monitoring-types/', views.type_of_monitoring_list, name='type_of_monitoring_list'),
    path('monitoring-types/add/', views.type_of_monitoring_create, name='type_of_monitoring_create'),
    path('monitoring-types/<str:pk>/', views.type_of_monitoring_detail, name='type_of_monitoring_detail'),
    path('monitoring-types/<str:pk>/edit/', views.type_of_monitoring_update, name='type_of_monitoring_update'),
    path('monitoring-types/<str:pk>/delete/', views.type_of_monitoring_delete, name='type_of_monitoring_delete'),
    
    # KPI for Contract URLs
    path('kpi-for-contract/', views.kpi_for_contract_list, name='kpi_for_contract_list'),
    path('kpi-for-contract/add/', views.kpi_for_contract_create, name='kpi_for_contract_create'),
    path('kpi-for-contract/<str:pk>/', views.kpi_for_contract_detail, name='kpi_for_contract_detail'),
    path('kpi-for-contract/<str:pk>/edit/', views.kpi_for_contract_update, name='kpi_for_contract_update'),
    path('kpi-for-contract/<str:pk>/delete/', views.kpi_for_contract_delete, name='kpi_for_contract_delete'),
    
    # Quarter URLs
    path('quarters/', views.quarter_list, name='quarter_list'),
    path('quarters/add/', views.quarter_create, name='quarter_create'),
    path('quarters/<int:pk>/', views.quarter_detail, name='quarter_detail'),
    path('quarters/<int:pk>/edit/', views.quarter_update, name='quarter_update'),
    path('quarters/<int:pk>/delete/', views.quarter_delete, name='quarter_delete'),
    
    # Measurement Unit URLs
    path('measurement-units/', views.measurement_unit_list, name='measurement_unit_list'),
    path('measurement-units/add/', views.measurement_unit_create, name='measurement_unit_create'),
    path('measurement-units/<int:pk>/', views.measurement_unit_detail, name='measurement_unit_detail'),
    path('measurement-units/<int:pk>/edit/', views.measurement_unit_update, name='measurement_unit_update'),
    path('measurement-units/<int:pk>/delete/', views.measurement_unit_delete, name='measurement_unit_delete'),
    
    # Geographic URLs
    # Regions
    path('regions/', views.regions_list, name='regions_list'),
    path('regions/add/', views.regions_create, name='regions_create'),
    path('regions/<str:pk>/', views.regions_detail, name='regions_detail'),
    path('regions/<str:pk>/edit/', views.regions_update, name='regions_update'),
    path('regions/<str:pk>/delete/', views.regions_delete, name='regions_delete'),
    
    # Districts
    path('districts/', views.districts_list, name='districts_list'),
    path('districts/add/', views.districts_create, name='districts_create'),
    path('districts/<str:pk>/', views.districts_detail, name='districts_detail'),
    path('districts/<str:pk>/edit/', views.districts_update, name='districts_update'),
    path('districts/<str:pk>/delete/', views.districts_delete, name='districts_delete'),
    
    # Settlements
    path('settlements/', views.settlement_list, name='settlement_list'),
    path('settlements/add/', views.settlement_create, name='settlement_create'),
    path('settlements/<str:pk>/', views.settlement_detail, name='settlement_detail'),
    path('settlements/<str:pk>/edit/', views.settlement_update, name='settlement_update'),
    path('settlements/<str:pk>/delete/', views.settlement_delete, name='settlement_delete'),
    
    # LGAs
    path('lgas/', views.lga_list, name='lga_list'),
    path('lgas/add/', views.lga_create, name='lga_create'),
    path('lgas/<str:pk>/', views.lga_detail, name='lga_detail'),
    path('lgas/<str:pk>/edit/', views.lga_update, name='lga_update'),
    path('lgas/<str:pk>/delete/', views.lga_delete, name='lga_delete'),

    # Project Activity Monitoring URLs
    path('project-activity-monitoring/', views.project_activity_monitoring_list, name='project_activity_monitoring_list'),
    path('project-activity-monitoring/add/', views.project_activity_monitoring_create, name='project_activity_monitoring_create'),
    path('project-activity-monitoring/<int:pk>/', views.project_activity_monitoring_detail, name='project_activity_monitoring_detail'),
    path('project-activity-monitoring/<int:pk>/edit/', views.project_activity_monitoring_update, name='project_activity_monitoring_update'),
    path('project-activity-monitoring/<int:pk>/delete/', views.project_activity_monitoring_delete, name='project_activity_monitoring_delete'),
    
    # Document Type URLs
    path('document-types/', views.document_type_list, name='document_type_list'),
    path('document-types/add/', views.document_type_create, name='document_type_create'),
    path('document-types/<int:pk>/', views.document_type_detail, name='document_type_detail'),
    path('document-types/<int:pk>/edit/', views.document_type_update, name='document_type_update'),
    path('document-types/<int:pk>/delete/', views.document_type_delete, name='document_type_delete'),
    
    # Physical Progress URLs
    path('physical-progress/', views.physical_progress_list, name='physical_progress_list'),
    path('physical-progress/add/', views.physical_progress_create, name='physical_progress_create'),
    path('physical-progress/<int:pk>/', views.physical_progress_detail, name='physical_progress_detail'),
    path('physical-progress/<int:pk>/edit/', views.physical_progress_update, name='physical_progress_update'),
    path('physical-progress/<int:pk>/delete/', views.physical_progress_delete, name='physical_progress_delete'),
    
    # Type of Impact URLs
    path('type-of-impact/', views.type_of_impact_list, name='type_of_impact_list'),
    path('type-of-impact/add/', views.type_of_impact_create, name='type_of_impact_create'),
    path('type-of-impact/<int:pk>/', views.type_of_impact_detail, name='type_of_impact_detail'),
    path('type-of-impact/<int:pk>/edit/', views.type_of_impact_update, name='type_of_impact_update'),
    path('type-of-impact/<int:pk>/delete/', views.type_of_impact_delete, name='type_of_impact_delete'),
    
    # Type of PAP URLs
    path('type-of-pap/', views.type_of_pap_list, name='type_of_pap_list'),
    path('type-of-pap/add/', views.type_of_pap_create, name='type_of_pap_create'),
    path('type-of-pap/<int:pk>/', views.type_of_pap_detail, name='type_of_pap_detail'),
    path('type-of-pap/<int:pk>/edit/', views.type_of_pap_update, name='type_of_pap_update'),
    path('type-of-pap/<int:pk>/delete/', views.type_of_pap_delete, name='type_of_pap_delete'),
    
    # Nature of Settlement URLs
    path('nature-of-settlement/', views.nature_of_settlement_list, name='nature_of_settlement_list'),
    path('nature-of-settlement/add/', views.nature_of_settlement_create, name='nature_of_settlement_create'),
    path('nature-of-settlement/<int:pk>/', views.nature_of_settlement_detail, name='nature_of_settlement_detail'),
    path('nature-of-settlement/<int:pk>/edit/', views.nature_of_settlement_update, name='nature_of_settlement_update'),
    path('nature-of-settlement/<int:pk>/delete/', views.nature_of_settlement_delete, name='nature_of_settlement_delete'),
    
    # Decision Outcome URLs
    path('decision-outcome/', views.decision_outcome_list, name='decision_outcome_list'),
    path('decision-outcome/add/', views.decision_outcome_create, name='decision_outcome_create'),
    path('decision-outcome/<int:pk>/', views.decision_outcome_detail, name='decision_outcome_detail'),
    path('decision-outcome/<int:pk>/edit/', views.decision_outcome_update, name='decision_outcome_update'),
    path('decision-outcome/<int:pk>/delete/', views.decision_outcome_delete, name='decision_outcome_delete'),
    
    # Type of Stakeholder Engagement URLs
    path('type-of-stakeholder-engagement/', views.type_of_stakeholder_engagement_list, name='type_of_stakeholder_engagement_list'),
    path('type-of-stakeholder-engagement/add/', views.type_of_stakeholder_engagement_create, name='type_of_stakeholder_engagement_create'),
    path('type-of-stakeholder-engagement/<int:pk>/', views.type_of_stakeholder_engagement_detail, name='type_of_stakeholder_engagement_detail'),
    path('type-of-stakeholder-engagement/<int:pk>/edit/', views.type_of_stakeholder_engagement_update, name='type_of_stakeholder_engagement_update'),
    path('type-of-stakeholder-engagement/<int:pk>/delete/', views.type_of_stakeholder_engagement_delete, name='type_of_stakeholder_engagement_delete'),
    
    # Access URLs
    path('access/', views.access_list, name='access_list'),
    path('access/add/', views.access_create, name='access_create'),
    path('access/<int:pk>/', views.access_detail, name='access_detail'),
    path('access/<int:pk>/edit/', views.access_update, name='access_update'),
    path('access/<int:pk>/delete/', views.access_delete, name='access_delete'),
    
    # Data Collection Frequency URLs
    path('data-collection-frequency/', views.data_collection_frequency_list, name='data_collection_frequency_list'),
    path('data-collection-frequency/add/', views.data_collection_frequency_create, name='data_collection_frequency_create'),
    path('data-collection-frequency/<int:pk>/', views.data_collection_frequency_detail, name='data_collection_frequency_detail'),
    path('data-collection-frequency/<int:pk>/edit/', views.data_collection_frequency_update, name='data_collection_frequency_update'),
    path('data-collection-frequency/<int:pk>/delete/', views.data_collection_frequency_delete, name='data_collection_frequency_delete'),
    
    # Type of Investment URLs (using investmentID as primary key)
    path('type-of-investment/', views.type_of_investment_list, name='type_of_investment_list'),
    path('type-of-investment/add/', views.type_of_investment_create, name='type_of_investment_create'),
    path('type-of-investment/<int:pk>/', views.type_of_investment_detail, name='type_of_investment_detail'),
    path('type-of-investment/<int:pk>/edit/', views.type_of_investment_update, name='type_of_investment_update'),
    path('type-of-investment/<int:pk>/delete/', views.type_of_investment_delete, name='type_of_investment_delete'),
]