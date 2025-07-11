from django.urls import path
from . import views

app_name = 'Project_Documentation_Tracking'

urlpatterns = [
    # Dashboard
    path('', views.document_dashboard, name='document_dashboard'),
    
    # Document management
    path('documents/', views.document_list, name='document_list'),
    path('documents/<int:pk>/', views.document_detail, name='document_detail'),
    path('documents/create/', views.document_create, name='document_create'),
    path('documents/<int:pk>/edit/', views.document_update, name='document_update'),
    path('documents/<int:pk>/delete/', views.document_delete, name='document_delete'),
    
    # Document workflow
    path('documents/<int:pk>/approve/', views.document_approve, name='document_approve'),
    path('documents/<int:pk>/reject/', views.document_reject, name='document_reject'),
    
    # Version management
    path('documents/<int:pk>/upload-version/', views.upload_version, name='upload_version'),
    
    # Tag management
    path('tags/', views.tag_management, name='tag_management'),
    
    # AJAX endpoints
    path('ajax/update-status/', views.ajax_update_document_status, name='ajax_update_status'),
]