from django.urls import path
from . import views

app_name = 'dashboard_recommendations'

urlpatterns = [
    # Main recommendation views
    path('', views.dashboard_recommendations, name='recommendations'),
    path('catalog/', views.widget_catalog, name='widget_catalog'),
    path('personalized/', views.user_dashboard_personalized, name='personalized_dashboard'),
    
    # Widget management actions
    path('add-widget/', views.add_widget_to_dashboard, name='add_widget'),
    path('remove-widget/', views.remove_widget_from_dashboard, name='remove_widget'),
    path('reorder-widgets/', views.reorder_dashboard_widgets, name='reorder_widgets'),
    
    # Recommendation management
    path('refresh/', views.refresh_recommendations, name='refresh_recommendations'),
]