from django.contrib import admin
from .models import *

# Register your models here.

class IndicatorDescriptionAdmin(admin.ModelAdmin):
    fields =['project','pdo','project_outcome','project_result','indicator_type','indicator_description','loginUser']
    list_display= ('project','pdo','project_outcome','project_result','indicator_type','indicator_description')
admin.site.register(Indicator_Description, IndicatorDescriptionAdmin)

class ResultsOrientedMonitoringAdmin(admin.ModelAdmin):
    fields =['year','quarter','project','pdo','project_outcome','project_result', 'indicator_type','indicator_description','measurement_unit',
             'collection_frequency', 'baseline_value','achieved_value', 'End_Target_Value','percentage_achieved_vs_baseline','percentage_achieved_vs_end_target','remarks','loginUser']
    list_display= ('year','quarter','project','pdo','project_outcome', 'project_result','indicator_type','indicator_description','measurement_unit',
                   'collection_frequency','baseline_value','achieved_value','End_Target_Value','percentage_achieved_vs_baseline','percentage_achieved_vs_end_target','remarks')
admin.site.register(Results_Oriented_Monitoring, ResultsOrientedMonitoringAdmin)