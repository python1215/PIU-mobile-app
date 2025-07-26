# Fixed URLs for PIU Mapping project Sites
from django.urls import path
from . import views

app_name = 'PIU_Mapping_project_Sites'

urlpatterns = [
    path('', views.working_map, name='mapping-dashboard'),
    path('index/', views.working_map, name='index'),
    path('working-map/', views.working_map, name='working_map'),  # Added missing working_map pattern
    path('complex/', views.index, name='complex-index'),
    path('leafletmap/', views.indexl, name='leafletmap'),
    path('offline-map/', views.offline_map, name='offline-map'),
    path('toggle/', views.togglemarker, name='toggle'),
    path('sitemapping/', views.mappingCreateView, name='sitemapping'),
    path('load_districts/', views.load_districts, name='load_districts'),
    path('load_settlement/', views.load_settlement, name='load_settlement'),
    path('togglecor/', views.settlementswithcor, name='togglecor'),

    # Project Mapping CRUD
    path("mapping/", views.mapping_list, name='mapping-list'),
    path("mapping/<str:pk>/", views.mapping_detail, name='mapping-detail'),
    path("add-mapping/", views.add_mapping, name='add-mapping'),
    path('update-mapping/<str:pk>/', views.update_mapping, name='update-mapping'),
    path('delete-mapping/<str:pk>/', views.delete_mapping, name='delete-mapping'),
]