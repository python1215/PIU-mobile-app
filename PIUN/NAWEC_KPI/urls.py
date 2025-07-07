from django.urls import path
from . import views
from .api_views import SaveKPICalculationView, DeleteKPICalculationView

app_name = 'NAWEC_KPI'

urlpatterns = [
    # Dashboard - Performance Dashboard is now main
    path('', views.performance_dashboard, name='dashboard'),
    path('kpi-dashboard/', views.dashboard, name='kpi_dashboard'),
    path('performance-dashboard/', views.performance_dashboard, name='performance_dashboard'),
    path('performance-report/', views.performance_report, name='performance_report'),
    
    # KPI Indicators
    path('indicators/', views.indicator_list, name='indicator_list'),
    path('indicators/create/', views.indicator_create, name='indicator_create'),
    path('indicators/<int:pk>/', views.indicator_detail, name='indicator_detail'),
    path('indicators/<int:pk>/edit/', views.indicator_edit, name='indicator_edit'),
    path('indicators/<int:pk>/delete/', views.indicator_delete, name='indicator_delete'),
    
    # KPI Data Entry CRUD operations
    path('data-entry/', views.data_entry, name='data_entry'),
    path('data-entry/list/', views.data_entry_list, name='data_entry_list'),
    path('data-entry/export/', views.data_entry_export, name='data_entry_export'),
    path('data-entry/<int:pk>/', views.data_entry_detail, name='data_entry_detail'),
    path('data-entry/<int:pk>/edit/', views.data_entry_edit, name='data_entry_edit'),
    path('data-entry/<int:pk>/delete/', views.data_entry_delete, name='data_entry_delete'),
    
    # Monitoring List
    path('monitoring/', views.monitoring_list, name='monitoring_list'),
    
    # Performance Analysis
    path('analysis/', views.performance_analysis, name='performance_analysis'),
    
    # Popup calculation forms
    path('calculate-roa/', views.calculate_roa_popup, name='calculate_roa_popup'),
    path('calculate-npm/', views.calculate_npm_popup, name='calculate_npm_popup'),
    
    # API endpoints for saving KPI calculations
    path('api/save-kpi/', SaveKPICalculationView.as_view(), name='save_kpi_calculation'),
    path('api/delete-calculation/', DeleteKPICalculationView.as_view(), name='delete_kpi_calculation'),
    
    # Calculation lists
    path('roa-calculations/', views.calculate_roa_list, name='calculate_roa_list'),
    path('roa-calculations/<int:calc_id>/', views.calculate_roa_detail, name='calculate_roa_detail'),
    path('roa-calculations/<int:calc_id>/edit/', views.calculate_roa_edit, name='calculate_roa_edit'),
    path('npm-calculations/', views.calculate_npm_list, name='calculate_npm_list'),
    path('npm-calculations/<int:calc_id>/', views.calculate_npm_detail, name='calculate_npm_detail'),
    path('npm-calculations/<int:calc_id>/edit/', views.calculate_npm_edit, name='calculate_npm_edit'),
    
    # DSCR calculations
    path('dscr-calculations/', views.calculate_dscr_list, name='calculate_dscr_list'),
    path('dscr-calculations/<int:calc_id>/', views.calculate_dscr_detail, name='calculate_dscr_detail'),
    path('dscr-calculations/<int:calc_id>/edit/', views.calculate_dscr_edit, name='calculate_dscr_edit'),
    
    # MWh calculations
    path('mwh-calculations/', views.calculate_mwh_list, name='calculate_mwh_list'),
    path('mwh-calculations/<int:calc_id>/', views.calculate_mwh_detail, name='calculate_mwh_detail'),
    path('mwh-calculations/<int:calc_id>/edit/', views.calculate_mwh_edit, name='calculate_mwh_edit'),
    
    # GAF calculations
    path('gaf-calculations/', views.calculate_gaf_list, name='calculate_gaf_list'),
    path('gaf-calculations/<int:calc_id>/', views.calculate_gaf_detail, name='calculate_gaf_detail'),
    path('gaf-calculations/<int:calc_id>/edit/', views.calculate_gaf_edit, name='calculate_gaf_edit'),
    
    # TDE calculations
    path('tde-calculations/', views.calculate_tde_list, name='calculate_tde_list'),
    path('tde-calculations/<int:calc_id>/', views.calculate_tde_detail, name='calculate_tde_detail'),
    path('tde-calculations/<int:calc_id>/edit/', views.calculate_tde_edit, name='calculate_tde_edit'),
    
    # ATC calculations
    path('atc-calculations/', views.calculate_atc_list, name='calculate_atc_list'),
    path('atc-calculations/<int:calc_id>/', views.calculate_atc_detail, name='calculate_atc_detail'),
    path('atc-calculations/<int:calc_id>/edit/', views.calculate_atc_edit, name='calculate_atc_edit'),
    
    # NECD calculations
    path('necd-calculations/', views.calculate_necd_list, name='calculate_necd_list'),
    path('necd-calculations/<int:calc_id>/', views.calculate_necd_detail, name='calculate_necd_detail'),
    path('necd-calculations/<int:calc_id>/edit/', views.calculate_necd_edit, name='calculate_necd_edit'),
    
    # NWCD calculations
    path('nwcd-calculations/', views.calculate_nwcd_list, name='calculate_nwcd_list'),
    path('nwcd-calculations/<int:calc_id>/', views.calculate_nwcd_detail, name='calculate_nwcd_detail'),
    path('nwcd-calculations/<int:calc_id>/edit/', views.calculate_nwcd_edit, name='calculate_nwcd_edit'),
    
    # TPS calculations
    path('tps-calculations/', views.calculate_tps_list, name='calculate_tps_list'),
    path('tps-calculations/<int:calc_id>/', views.calculate_tps_detail, name='calculate_tps_detail'),
    path('tps-calculations/<int:calc_id>/edit/', views.calculate_tps_edit, name='calculate_tps_edit'),
    
    # TTP calculations
    path('ttp-calculations/', views.calculate_ttp_list, name='calculate_ttp_list'),
    path('ttp-calculations/<int:calc_id>/', views.calculate_ttp_detail, name='calculate_ttp_detail'),
    path('ttp-calculations/<int:calc_id>/edit/', views.calculate_ttp_edit, name='calculate_ttp_edit'),
    
    # WQCC calculations
    path('wqcc-calculations/', views.calculate_wqcc_list, name='calculate_wqcc_list'),
    path('wqcc-calculations/<int:calc_id>/', views.calculate_wqcc_detail, name='calculate_wqcc_detail'),
    path('wqcc-calculations/<int:calc_id>/edit/', views.calculate_wqcc_edit, name='calculate_wqcc_edit'),
    
    # WQCB calculations
    path('wqcb-calculations/', views.calculate_wqcb_list, name='calculate_wqcb_list'),
    path('wqcb-calculations/<int:calc_id>/', views.calculate_wqcb_detail, name='calculate_wqcb_detail'),
    path('wqcb-calculations/<int:calc_id>/edit/', views.calculate_wqcb_edit, name='calculate_wqcb_edit'),
    
    # NRW calculations
    path('nrw-calculations/', views.calculate_nrw_list, name='calculate_nrw_list'),
    path('nrw-calculations/<int:calc_id>/', views.calculate_nrw_detail, name='calculate_nrw_detail'),
    path('nrw-calculations/<int:calc_id>/edit/', views.calculate_nrw_edit, name='calculate_nrw_edit'),
    
    # DD calculations
    path('dd-calculations/', views.calculate_dd_list, name='calculate_dd_list'),
    path('dd-calculations/<int:pk>/', views.calculate_dd_detail, name='calculate_dd_detail'),
    path('dd-calculations/<int:pk>/edit/', views.calculate_dd_edit, name='calculate_dd_edit'),
    path('dd-calculations/<int:pk>/delete/', views.calculate_dd_delete, name='calculate_dd_delete'),

    
    # API endpoints
    path('get-indicator-details/<int:indicator_id>/', views.get_indicator_details, name='get_indicator_details'),
    
    # HTMX endpoints for cascading dropdowns
    path('get-project-outcomes/', views.get_project_outcomes, name='get_project_outcomes'),
    path('get-project-results/', views.get_project_results, name='get_project_results'),
    path('get-pdos-by-project/', views.get_pdos_by_project, name='get_pdos_by_project'),
    path('get-outcomes-by-pdo/', views.get_outcomes_by_pdo, name='get_outcomes_by_pdo'),
    path('get-results-by-outcome/', views.get_results_by_outcome, name='get_results_by_outcome'),
]