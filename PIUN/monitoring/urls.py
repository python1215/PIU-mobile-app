from django.urls import path
from monitoring import views

app_name = 'monitoring'

urlpatterns = [
    # Basic monitoring views
    path('', views.monitoring_dashboard, name='monitoring_dashboard'),
    path('dashboard/', views.monitoring_dashboard, name='monitoring-dashboard'),
    
    # HTMX Load Views
    path('load_project_PDO/', views.load_project_PDO, name='load_project_PDO'),
    path('load_project_Outcome/', views.load_project_Outcome, name='load_project_Outcome'),
    path('load_project_Result/', views.load_project_Result, name='load_project_Result'),
    path('load_indicator_type/', views.load_indicator_type, name='load_indicator_type'),

    # Enhanced CRUD Views
    path('add-indicator-description/', views.add_indicator_description, name='add-indicator-description'),
    path('update-indicator-description/<int:pk>/', views.update_indicator_description, name='update-indicator-description'),
    path('delete-indicator-description/<int:pk>/', views.delete_indicator_description, name='delete-indicator-description'),
    
    path('add-results-monitoring/', views.add_results_monitoring, name='add-results-monitoring'),
    path('enhanced-results-monitoring-list/', views.enhanced_results_monitoring_list, name='enhanced-results-monitoring-list'),
    path('detail-results-monitoring/<int:pk>/', views.detail_results_monitoring, name='detail-results-monitoring'),
    path('update-results-monitoring/<int:pk>/', views.update_results_monitoring, name='update-results-monitoring'),
    path('delete-results-monitoring/<int:pk>/', views.delete_results_monitoring, name='delete-results-monitoring'),
    
    # Export Views
    path('export-indicator-descriptions/', views.export_indicator_descriptions_excel, name='export-indicator-descriptions'),
    path('export-results-monitoring/', views.export_results_monitoring_excel, name='export-results-monitoring'),
    path('export-results-monitoring-pdf/', views.export_results_monitoring_pdf, name='export-results-monitoring-pdf'),
    
    # Cascade Filtering Views
    path('cascade-filtering-demo/', views.cascade_filtering_demo, name='cascade_filtering_demo'),
    path('cascade-filtering-results/', views.cascade_filtering_results, name='cascade_filtering_results'),
    
    # HTMX Cascade Filtering AJAX Views
    path('load-monitoring-types/', views.load_monitoring_types, name='load_monitoring_types'),
    path('load-investment-types/', views.load_investment_types_cascade, name='load_investment_types'),
    path('load-kpi-descriptions/', views.load_kpi_descriptions_cascade, name='load_kpi_descriptions'),
]