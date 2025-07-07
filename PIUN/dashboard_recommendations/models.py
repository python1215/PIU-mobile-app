from django.db import models
from django.conf import settings
from django.utils import timezone
import json

class UserDashboardActivity(models.Model):
    """Track user interactions with dashboard widgets"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    widget_type = models.CharField(max_length=100)  # e.g., 'project_summary', 'financial_chart'
    action = models.CharField(max_length=50)  # e.g., 'view', 'click', 'export'
    timestamp = models.DateTimeField(auto_now_add=True)
    duration_seconds = models.IntegerField(null=True, blank=True)
    metadata = models.TextField(default='{}', blank=True)  # Additional context data as JSON string
    
    def get_metadata(self):
        """Parse metadata JSON string to Python dict"""
        try:
            return json.loads(self.metadata) if self.metadata else {}
        except json.JSONDecodeError:
            return {}
    
    def set_metadata(self, data):
        """Set metadata from Python dict to JSON string"""
        self.metadata = json.dumps(data if data else {})
    
    class Meta:
        db_table = 'dashboard_user_activity'
        indexes = [
            models.Index(fields=['user', 'timestamp']),
            models.Index(fields=['widget_type', 'action']),
        ]

class WidgetRecommendation(models.Model):
    """Store personalized widget recommendations for users"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    widget_type = models.CharField(max_length=100)
    recommendation_score = models.FloatField()  # 0.0 to 1.0
    reason = models.TextField()  # Why this widget is recommended
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'dashboard_widget_recommendations'
        unique_together = ['user', 'widget_type']
        ordering = ['-recommendation_score']

class AvailableWidget(models.Model):
    """Define available dashboard widgets"""
    WIDGET_CATEGORIES = [
        ('financial', 'Financial Management'),
        ('monitoring', 'Project Monitoring'),
        ('mapping', 'Project Mapping'),
        ('analytics', 'Data Analytics'),
        ('reports', 'Reports & Export'),
    ]
    
    widget_id = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=50, choices=WIDGET_CATEGORIES)
    icon_class = models.CharField(max_length=100, default='bi-graph-up')
    template_path = models.CharField(max_length=200)
    required_permissions = models.TextField(default='[]', blank=True)  # JSON string for permissions list
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def get_required_permissions(self):
        """Parse required_permissions JSON string to Python list"""
        try:
            return json.loads(self.required_permissions) if self.required_permissions else []
        except json.JSONDecodeError:
            return []
    
    def set_required_permissions(self, permissions_list):
        """Set required_permissions from Python list to JSON string"""
        self.required_permissions = json.dumps(permissions_list if permissions_list else [])
    
    class Meta:
        db_table = 'dashboard_available_widgets'
        ordering = ['category', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.category})"

class UserWidgetPreference(models.Model):
    """Track user's explicit widget preferences"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    widget = models.ForeignKey(AvailableWidget, on_delete=models.CASCADE)
    is_enabled = models.BooleanField(default=True)
    position = models.IntegerField(default=0)  # Dashboard layout position
    settings = models.TextField(default='{}', blank=True)  # Widget-specific settings as JSON string
    last_accessed = models.DateTimeField(null=True, blank=True)
    
    def get_settings(self):
        """Parse settings JSON string to Python dict"""
        try:
            return json.loads(self.settings) if self.settings else {}
        except json.JSONDecodeError:
            return {}
    
    def set_settings(self, settings_dict):
        """Set settings from Python dict to JSON string"""
        self.settings = json.dumps(settings_dict if settings_dict else {})
    
    class Meta:
        db_table = 'dashboard_user_preferences'
        unique_together = ['user', 'widget']
        ordering = ['position']