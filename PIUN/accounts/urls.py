from django.urls import path
from . import views

app_name = 'accounts'

urlpatterns = [
    # User management dashboard (admin only)
    path('dashboard/', views.user_dashboard, name='user_dashboard'),
    
    # User CRUD operations (admin only)
    path('users/', views.UserListView.as_view(), name='user_list'),
    path('users/create/', views.UserCreateView.as_view(), name='user_create'),
    path('users/<int:pk>/', views.UserDetailView.as_view(), name='user_detail'),
    path('users/<int:pk>/edit/', views.UserUpdateView.as_view(), name='user_update'),
    path('users/<int:pk>/delete/', views.UserDeleteView.as_view(), name='user_delete'),
    
    # User profile and password management
    path('profile/', views.profile_view, name='profile'),
    path('password/change/', views.change_password, name='change_password'),
    
    # Platform independence management (admin only)
    path('admin/activate-all-users/', views.activate_all_users_view, name='activate_all_users'),
    path('admin/ensure-platform-independence/', views.ensure_platform_independence_view, name='ensure_platform_independence'),
    
    # API endpoints
    path('api/system-status/', views.system_status_api, name='system_status'),
    
    # Legacy signup (keep for compatibility)
    path('signup/', views.SignUpView.as_view(), name='signup'),
]