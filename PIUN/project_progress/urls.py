from django.urls import path
from . import views

app_name = 'project_progress'

urlpatterns = [
    path('', views.project_progress_list, name='list'),
    path('create/', views.project_progress_create, name='create'),
    path('<int:pk>/update/', views.project_progress_update, name='update'),
    path('<int:pk>/delete/', views.project_progress_delete, name='delete'),
]
