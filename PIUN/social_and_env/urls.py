from django.urls import path
from . import views

urlpatterns = [
    # Main social and environmental dashboard
    path('', views.social_env_dashboard, name='social_env_dashboard'),
    
    # ESIA/ESMP Management
    path('esia/', views.esia_list, name='esia_list'),
    path('esia/add/', views.esia_add, name='esia_add'),
    path('esia/<str:pk>/', views.esia_detail, name='esia_detail'),
    path('esia/<str:pk>/edit/', views.esia_edit, name='esia_edit'),
    path('esia/<str:pk>/delete/', views.esia_delete, name='esia_delete'),
    path('esia/export/excel/', views.esia_export_excel, name='esia_export_excel'),
    
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
    path('grievance/<str:pk>/', views.grievance_detail, name='grievance_detail'),
    path('grievance/<str:pk>/edit/', views.grievance_edit, name='grievance_edit'),
    path('grievance/<str:pk>/delete/', views.grievance_delete, name='grievance_delete'),
    
    # OHS Monitoring
    path('ohs/', views.ohs_list, name='ohs_list'),
    path('ohs/add/', views.ohs_add, name='ohs_add'),
    path('ohs/export/excel/', views.export_ohs_excel, name='export_ohs_excel'),
    path('ohs/<str:pk>/', views.ohs_detail, name='ohs_detail'),
    path('ohs/<str:pk>/edit/', views.ohs_edit, name='ohs_edit'),
    path('ohs/<str:pk>/delete/', views.ohs_delete, name='ohs_delete'),
    
    # Community Engagement
    path('community/', views.community_list, name='community_list'),
    path('community/add/', views.community_add, name='community_add'),
    path('community/<str:pk>/', views.community_detail, name='community_detail'),
    path('community/<str:pk>/edit/', views.community_edit, name='community_edit'),
    path('community/<str:pk>/delete/', views.community_delete, name='community_delete'),
    
    # AJAX Cascading Dropdowns
    path('ajax/load-districts/', views.load_districts, name='load_districts'),
    path('ajax/load-settlements/', views.load_settlements, name='load_settlements'),
]