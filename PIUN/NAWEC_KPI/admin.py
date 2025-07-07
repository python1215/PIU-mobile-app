from django.contrib import admin
from .models import (
    KPIIndicator, NAWEC_KPI_Monitoring, CalculateROA, CalculateNPM, CalculateDSCR, 
    CalculateMWh, CalculateGAF, CalculateTDE, CalculateATC, CalculateNECD,
    CalculateNWCD, CalculateTPS, CalculateTTP, CalculateWQCC, CalculateWQCB, CalculateNRW, CalculateDD
)



@admin.register(KPIIndicator)
class KPIIndicatorAdmin(admin.ModelAdmin):
    list_display = ('indicator_no', 'indicator_description', 'baseline_value', 'End_Target_Value', 'targeted_weight_value', 'date_created', 'loginUser')
    list_filter = ('date_created', 'loginUser')
    search_fields = ('indicator_no', 'indicator_description', 'attributes')
    readonly_fields = ('date_created', 'loginUser')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('indicator_no', 'indicator_description', 'attributes')
        }),
        ('Performance Metrics', {
            'fields': ('baseline_value', 'End_Target_Value', 'targeted_weight_value'),
            'description': 'Set baseline values, target values, and weight percentages for this indicator'
        }),
        ('System Information', {
            'fields': ('date_created', 'loginUser'),
            'classes': ('collapse',)
        }),
    )

    def save_model(self, request, obj, form, change):
        if not change:
            obj.loginUser = request.user
        super().save_model(request, obj, form, change)


@admin.register(NAWEC_KPI_Monitoring)
class NAWECKPIMonitoringAdmin(admin.ModelAdmin):
    list_display = ('project', 'pdo', 'indicator_type', 'achieved_value', 'End_Target_Value', 'Targeted_Achieved_weight', 'year', 'quarter', 'date_created')
    list_filter = ('year', 'quarter', 'project', 'indicator_type', 'date_created')
    search_fields = ('indicator_description', 'project__project', 'pdo__pdo')
    readonly_fields = ('date_created', 'loginUser', 'Percentage_progress_from_baseline', 'Percentage_progress_towards_end_target')
    
    fieldsets = (
        ('Project Information', {
            'fields': ('project', 'pdo', 'project_outcome', 'project_result')
        }),
        ('Indicator Details', {
            'fields': ('indicator_type', 'indicator_description', 'measurement_unit', 'collection_frequency')
        }),
        ('Performance Values', {
            'fields': ('baseline_value', 'achieved_value', 'End_Target_Value', 'Targeted_Achieved_weight', 'Percentage_progress_from_baseline', 'Percentage_progress_towards_end_target')
        }),
        ('Time Period', {
            'fields': ('year', 'quarter')
        }),
        ('Additional Information', {
            'fields': ('remarks', 'date_created', 'loginUser')
        }),
    )

    def save_model(self, request, obj, form, change):
        if not change:
            obj.loginUser = request.user
        super().save_model(request, obj, form, change)

@admin.register(CalculateTDE)
class CalculateTDEAdmin(admin.ModelAdmin):
    list_display = ("achieved_value", "total_training_days_conducted", "total_number_of_employees", "year", "quarter", "date_created", "loginUser")
    list_filter = ("year", "quarter", "date_created", "loginUser")
    search_fields = ("year__profile_year", "quarter__quarter")
    readonly_fields = ("date_created", "loginUser", "achieved_value")
    
    fieldsets = (
        ("Training Data", {
            "fields": ("total_training_days_conducted", "total_number_of_employees")
        }),
        ("Time Period", {
            "fields": ("year", "quarter")
        }),
        ("Calculation Result", {
            "fields": ("achieved_value",)
        }),
        ("Audit Information", {
            "fields": ("date_created", "loginUser")
        }),
    )

    def save_model(self, request, obj, form, change):
        if not change:
            obj.loginUser = request.user
        super().save_model(request, obj, form, change)



@admin.register(CalculateDD)
class CalculateDDAdmin(admin.ModelAdmin):
    list_display = ("achieved_value", "trade_receivables", "total_credit_sales", "year", "quarter", "date_created", "loginUser")
    list_filter = ("year", "quarter", "date_created", "loginUser")
    search_fields = ("year__profile_year", "quarter__quarter")
    readonly_fields = ("date_created", "loginUser", "achieved_value")

    fieldsets = (
        ("Debtor Days Data", {
            "fields": ("trade_receivables", "total_credit_sales")
        }),
        ("Time Period", {
            "fields": ("year", "quarter")
        }),
        ("Calculation Result", {
            "fields": ("achieved_value",)
        }),
        ("Audit Information", {
            "fields": ("date_created", "loginUser")
        }),
    )

    def save_model(self, request, obj, form, change):
        if not change:
            obj.loginUser = request.user
        super().save_model(request, obj, form, change)
