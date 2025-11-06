from django.urls import path
from . import views

app_name = 'animation_dashboard'

urlpatterns = [
    # Dashboard
    path('', views.animation_dashboard, name='dashboard'),
    
    # Media Gallery
    path('media/', views.media_gallery, name='media_gallery'),
    
    # Custom Reports
    path('reports/by-donors/', views.projects_by_donors, name='projects_by_donors'),
    path('reports/by-closing-date/', views.projects_by_closing_date, name='projects_by_closing_date'),
    path('reports/by-funding/', views.projects_by_funding, name='projects_by_funding'),
]
