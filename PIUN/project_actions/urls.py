from django.urls import path
from . import views

app_name = 'project_actions'

urlpatterns = [
    # Dashboard
    path('', views.dashboard, name='dashboard'),
    
    # Contract Profiling Works - Maintaining exact existing URL names
    path('contract-profiling-works/', views.contract_profiling_works_list, name='contract_profiling_works_list'),
    path('contract-profiling-works/create/', views.contract_profiling_works_create, name='contract_profiling_works_create'),
    path('contract-profiling-works/<int:pk>/', views.contract_profiling_works_detail, name='contract_profiling_works_detail'),
    path('contract-profiling-works/<int:pk>/update/', views.contract_profiling_works_update, name='update-contract_profiling_works'),
    path('contract-profiling-works/<int:pk>/delete/', views.contract_profiling_works_delete, name='delete-contract_profiling_works'),
    
    # Contract Profiling Goods & Services - Maintaining exact existing URL names
    path('contract-profiling-goods-services/', views.contract_profiling_goods_services_list, name='contract_profiling_goods_services_list'),
    path('contract-profiling-goods-services/<int:pk>/', views.contract_profiling_goods_services_detail, name='contract_profiling_goods_services_detail'),
    path('contract-profiling-goods-services/create/', views.contract_profiling_goods_services_create, name='add-contract_profiling_goods_service'),
    path('contract-profiling-goods-services/<int:pk>/update/', views.contract_profiling_goods_services_update, name='update-contract_profiling_goods_service'),
    path('contract-profiling-goods-services/<int:pk>/delete/', views.contract_profiling_goods_services_delete, name='delete-contract_profiling_goods_service'),
    
    # Contract Monitoring - Maintaining exact existing URL names
    path('contract-monitoring/', views.contract_monitoring_list, name='contract_monitoring_list'),
    path('contract-monitoring/create/', views.contract_monitoring_create, name='contract_monitoring_create'),
    path('contract-monitoring/<int:pk>/', views.contract_monitoring_detail, name='contract_monitoring_detail'),
    path('contract-monitoring/<int:pk>/update/', views.contract_monitoring_update, name='contract_monitoring_update'),
    path('contract-monitoring/<int:pk>/delete/', views.contract_monitoring_delete, name='contract_monitoring_delete'),
    
    # Export functions - Maintaining exact existing URL names
    path('contract-profiling/export-excel/', views.export_works_contracts_excel, name='contract_profiling_works_export_excel'),
    path('export/works-contracts/', views.export_works_contracts_excel, name='export_works_contracts_excel'),
    path('export/goods-services-contracts/', views.export_goods_services_contracts_excel, name='export_goods_services_contracts_excel'),
    path('export/monitoring-records/', views.export_monitoring_records_excel, name='export_monitoring_records_excel'),
    
    # PDF Export functions - A4 Portrait formatted
    path('export/works-contracts-pdf/', views.export_works_contracts_pdf, name='export_works_contracts_pdf'),
    path('export/goods-services-contracts-pdf/', views.export_goods_services_contracts_pdf, name='export_goods_services_contracts_pdf'),
    path('export/monitoring-records-pdf/', views.export_monitoring_records_pdf, name='export_monitoring_records_pdf'),
    
    # AJAX endpoints - Maintaining exact existing URL names
    path('ajax/get-project-components/', views.get_project_components, name='get_project_components'),
    path('ajax/get-project-subcomponents/', views.get_project_subcomponents, name='get_project_subcomponents'),
    path('ajax/get-project-activities/', views.get_project_activities, name='get_project_activities'),
    path('ajax/get-contract-info/', views.get_contract_info, name='get_contract_info'),
    path('ajax/get-contracts-by-project-and-type/', views.get_contracts_by_project_and_type, name='get_contracts_by_project_and_type'),
    
    # Bulk actions
    path('ajax/bulk-actions/', views.bulk_actions, name='bulk_actions'),
    
    # HTMX endpoints for dynamic cascading dropdowns
    path('htmx/load-components/', views.load_project_components, name='load_project_components'),
    path('htmx/load-subcomponents/', views.load_component_subcomponents, name='load_component_subcomponents'),
    path('htmx/load-activities/', views.load_subcomponent_activities, name='load_subcomponent_activities'),

    path("ajax/load-type-of-investments/", views.load_type_of_investments, name="load_type_of_investments"),
    path("ajax/load-kpi-descriptions/", views.load_kpi_descriptions, name="load_kpi_descriptions"),
    
    # SQL Server diagnostic endpoints
    path('test-sql-connection/', views.test_sql_server_connection, name='test_sql_server_connection'),
    path('sql-diagnostics/', views.sql_server_diagnostics, name='sql_server_diagnostics'),
    path('debug-cascading/', views.debug_cascading_dropdowns, name='debug_cascading_dropdowns'),

]
