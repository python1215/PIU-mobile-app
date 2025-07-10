from django.urls import path
from . import views

urlpatterns = [
    # Main social and environmental dashboard
    path('', views.social_env_dashboard, name='social_env_dashboard'),
    
    # ESIA Management
    path('esia/', views.esia_list, name='esia_list'),
    path('esia/add/', views.esia_add, name='esia_add'),
    path('esia/<int:pk>/', views.esia_detail, name='esia_detail'),
    path('esia/<int:pk>/edit/', views.esia_edit, name='esia_edit'),
    path('esia/<int:pk>/delete/', views.esia_delete, name='esia_delete'),
    
    # PAP Management
    path('pap/', views.pap_list, name='pap_list'),
    path('pap/add/', views.pap_add, name='pap_add'),
    path('pap/<str:pk>/', views.pap_detail, name='pap_detail'),
    path('pap/<str:pk>/edit/', views.pap_edit, name='pap_edit'),
    path('pap/<str:pk>/delete/', views.pap_delete, name='pap_delete'),
    path('pap/export/excel/', views.export_pap_excel, name='export_pap_excel'),
    
    # Grievance Management
    path('grievance/', views.grievance_list, name='grievance_list'),
    path('grievance/add/', views.grievance_add, name='grievance_add'),
    path('grievance/<int:pk>/', views.grievance_detail, name='grievance_detail'),
    path('grievance/<int:pk>/edit/', views.grievance_edit, name='grievance_edit'),
    path('grievance/<int:pk>/delete/', views.grievance_delete, name='grievance_delete'),
    
    # OHS Monitoring
    path('ohs/', views.ohs_list, name='ohs_list'),
    path('ohs/add/', views.ohs_add, name='ohs_add'),
    path('ohs/<int:pk>/', views.ohs_detail, name='ohs_detail'),
    path('ohs/<int:pk>/edit/', views.ohs_edit, name='ohs_edit'),
    path('ohs/<int:pk>/delete/', views.ohs_delete, name='ohs_delete'),
    
    # Community Engagement
    path('community/', views.community_list, name='community_list'),
    path('community/add/', views.community_add, name='community_add'),
    path('community/<int:pk>/', views.community_detail, name='community_detail'),
    path('community/<int:pk>/edit/', views.community_edit, name='community_edit'),
    path('community/<int:pk>/delete/', views.community_delete, name='community_delete'),
    
    # AJAX Cascading Dropdowns (no authentication required)
    path('ajax/load-districts/', views.load_districts, name='load_districts'),
    path('ajax/load-settlements/', views.load_settlements, name='load_settlements'),
    path('ajax/load-investment-types/', views.load_investment_types, name='load_investment_types'),
    path('ajax/load-investment-types-pap/', views.load_investment_types_pap, name='load_investment_types_pap'),
    path('ajax/load-investment-types-ohs/', views.load_investment_types_ohs, name='load_investment_types_ohs'),
    path('ajax/load-districts-ohs/', views.load_districts_ohs, name='load_districts_ohs'),
    path('ajax/load-settlements-ohs/', views.load_settlements_ohs, name='load_settlements_ohs'),
    
    # Test endpoint for cascading dropdown validation
    path('test-cascading/', views.test_cascading_dropdown, name='test_cascading_dropdown'),
]