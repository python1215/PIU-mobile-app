from django.apps import AppConfig


class IssuesActionsMonitoringConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'Issues_Actions_monitoring'
    
    def ready(self):
        import Issues_Actions_monitoring.signals
