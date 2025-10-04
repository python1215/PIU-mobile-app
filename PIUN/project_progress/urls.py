from django.urls import path
from . import views

app_name = 'project_progress'

urlpatterns = [
    path('', views.project_progress_list, name='list'),
    path('create/', views.project_progress_create, name='create'),
    path('<int:pk>/', views.project_progress_detail, name='detail'),
    path('<int:pk>/update/', views.project_progress_update, name='update'),
    path('<int:pk>/delete/', views.project_progress_delete, name='delete'),
    
    # Export URLs
    path('export/excel/', views.export_progress_excel, name='export_excel'),
    path('export/pdf/', views.export_progress_pdf, name='export_pdf'),
]
