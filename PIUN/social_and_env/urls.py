from django.urls import path
from . import views

urlpatterns = [
    # Dashboard
    path('', views.social_env_dashboard, name='social_env_dashboard'),
    
    # ESIA URLs
    path('esia/', views.esia_list, name='esia_list'),
    path('esia/add/', views.esia_add, name='esia_add'),
    path('esia/<int:pk>/', views.esia_detail, name='esia_detail'),
    path('esia/<int:pk>/edit/', views.esia_edit, name='esia_edit'),
    path('esia/<int:pk>/delete/', views.esia_delete, name='esia_delete'),
    path('esia/export/', views.esia_export_excel, name='esia_export_excel'),
    
    # PAP URLs
    path('pap/', views.pap_list, name='pap_list'),
    path('pap/add/', views.pap_add, name='pap_add'),
    path('pap/<str:pk>/', views.pap_detail, name='pap_detail'),
    path('pap/<str:pk>/edit/', views.pap_edit, name='pap_edit'),
    path('pap/<str:pk>/delete/', views.pap_delete, name='pap_delete'),
    
    # Grievance URLs
    path('grievance/', views.grievance_list, name='grievance_list'),
    path('grievance/add/', views.grievance_add, name='grievance_add'),
    path('grievance/<str:pk>/', views.grievance_detail, name='grievance_detail'),
    path('grievance/<str:pk>/edit/', views.grievance_edit, name='grievance_edit'),
    
    # OHS URLs
    path('ohs/', views.ohs_list, name='ohs_list'),
    path('ohs/add/', views.ohs_add, name='ohs_add'),
    
    # Community Engagement URLs
    path('community/', views.community_list, name='community_list'),
    path('community/add/', views.community_add, name='community_add'),
    
     path('load-investment-types-esia/', views.load_investment_types_esia, name='load_investment_types_esia'),
    path('load-investment-types-pap/', views.load_investment_types_pap, name='load_investment_types_pap'),
    path('load-investment-types-grievance/', views.load_investment_types_grievance, name='load_investment_types_grievance'),
    path('load-investment-types-ohs/', views.load_investment_types_ohs, name='load_investment_types_ohs'),
    path('load-districts/', views.load_districts, name='load_districts'),
    path('load-settlements/', views.load_settlements, name='load_settlements'),
    path('load-districts-ohs/', views.load_districts, name='load_districts_ohs'),
    path('load-settlements-ohs/', views.load_settlements, name='load_settlements_ohs'),
]