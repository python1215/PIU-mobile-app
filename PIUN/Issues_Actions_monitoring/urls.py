from django.urls import path
from . import views

app_name = 'Issues_Actions_monitoring'

urlpatterns = [
    # Dashboard
    path('', views.dashboard, name='dashboard'),
    
    # Issue Action Source URLs
    path('sources/', views.source_list, name='source_list'),
    path('sources/create/', views.source_create, name='source_create'),
    path('sources/<int:pk>/', views.source_detail, name='source_detail'),
    path('sources/<int:pk>/update/', views.source_update, name='source_update'),
    path('sources/<int:pk>/delete/', views.source_delete, name='source_delete'),
    
    # Issue Actions URLs
    path('issues/', views.issues_list, name='issues_list'),
    path('issues/create/', views.issues_create, name='issues_create'),
    path('issues/<int:pk>/', views.issues_detail, name='issues_detail'),
    path('issues/<int:pk>/update/', views.issues_update, name='issues_update'),
    path('issues/<int:pk>/delete/', views.issues_delete, name='issues_delete'),
    path('issues/<int:pk>/reassign/', views.issues_reassign, name='issues_reassign'),
    
    # Export URLs
    path('export/issues/excel/', views.export_issues_excel, name='export_issues_excel'),
    path('export/issues/word/', views.export_issues_word, name='export_issues_word'),
    
    # Notification URLs
    path('api/notifications/', views.get_pending_notifications, name='get_pending_notifications'),
    path('api/notifications/<int:notification_id>/read/', views.mark_notification_read, name='mark_notification_read'),
    path('api/reminders/', views.get_pending_reminders, name='get_pending_reminders'),
]