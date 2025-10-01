"""
URL configuration for piu_project project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from . import views

urlpatterns = [
    path('admin-panel/', admin.site.urls),
    path('', views.main_dashboard, name='main_dashboard'),  # Main dashboard as homepage
    path('dashboard/', views.main_dashboard, name='dashboard-alt'),  # Alternative dashboard route
    path('user-accounts/', include('accounts.urls')),
    path('accounts/', include('allauth.urls')),
    path('accounts/profile/', views.main_dashboard, name='profile'),  # Add profile redirect
    path('setup/', include('setup.urls')),
    path('PIU_Financial_mgt/', include('PIU_Financial_mgt.urls', namespace='PIU_Financial_mgt')),
    path('project_actions/', include('project_actions.urls')),
    path('monitoring/', include('monitoring.urls')),

    path('social_and_env/', include('social_and_env.urls')),
    path('PIU_Mapping_project_Sites/', include("PIU_Mapping_project_Sites.urls", namespace='PIU_Mapping_project_Sites')),

    path('NAWEC_KPI/', include('NAWEC_KPI.urls', namespace='NAWEC_KPI')),
    path('Issues_Actions_monitoring/', include('Issues_Actions_monitoring.urls', namespace='Issues_Actions_monitoring')),
    path('document-management/', include('Project_Documentation_Tracking.urls', namespace='Project_Documentation_Tracking')),
    path('project-progress/', include('project_progress.urls', namespace='project_progress')),
]

# Serve static and media files during development and production
if settings.DEBUG or True:  # Always serve media files for now
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATICFILES_DIRS[0] if settings.STATICFILES_DIRS else settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)