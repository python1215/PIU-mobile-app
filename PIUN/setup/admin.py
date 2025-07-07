from django.contrib import admin
from django.contrib.admin import site

# Register your models here.

from .models  import *

class ProjectFinanceAdmin(admin.ModelAdmin):
    pass


class piuAdminArea(admin.AdminSite):
   site.site_header ="PIU IMS Application"
   site.site_title ='PIU '
piuAdminArea_site = piuAdminArea(name='piuAdmin')

class DonorAdmin(admin.ModelAdmin):
    fields = ['name','loginUser']
    list_display = ('donorID', 'name','date','loginUser')
admin.site.register(Donor, DonorAdmin)

admin.site.register(Contributors)

class ProjectCategoryAdmin(admin.ModelAdmin):
    fields = ['category_Description','loginUser']
    list_display = ('category_Description',)
admin.site.register(ProjectCategory, ProjectCategoryAdmin)


admin.site.register(YEAR)

class PhysicalProgressAdmin(admin.ModelAdmin):
    fields = ['progress_scale',]
    list_display = ('progress_scale',)
admin.site.register(Physicalprogress,PhysicalProgressAdmin)


class ProjectActivityMonitoringAdmin(admin.ModelAdmin):
    fields = ['activity_type',]
    list_display = (fields)
admin.site.register(project_Activity_monitoring,ProjectActivityMonitoringAdmin)


class DocumentsAdmin(admin.ModelAdmin):
    list_display = ('document_type',)
admin.site.register(DocumentType, DocumentsAdmin)

admin.site.register(Type_of_Monitoring)

# admin.site.register(KPI_For_Contract)
admin.site.register(Quarter)

class MeasurementUnitAdmin(admin.ModelAdmin):
    fields =['unit',]
    list_display= ('unit',)
admin.site.register(Measurement_Unit, MeasurementUnitAdmin)

class DataCollectionFrequencyAdmin(admin.ModelAdmin):
    fields =['frequency',]
    list_display= ('frequency',)
admin.site.register(Data_Collection_Frequency, DataCollectionFrequencyAdmin)

class IndicatorTypeAdmin(admin.ModelAdmin):
    fields =['indicator_type',]
    list_display= ('indicator_type',)
admin.site.register(Indicator_Type, IndicatorTypeAdmin)

class responseAdmin(admin.ModelAdmin):
    fields = ['yes_or_no',]
    list_display = (fields)   
admin.site.register(response,)


class DecisionOutcomeAdmin(admin.ModelAdmin):
    fields = ['outcome',]
    list_display = (fields)   
admin.site.register(DecisionOutcome,DecisionOutcomeAdmin)

class TypeOfStakeholderEngagementAdmin(admin.ModelAdmin):
    fields = ['stake_holder_engagement',]
    list_display = (fields)   
admin.site.register(TypeOfStakeholderEngagement,TypeOfStakeholderEngagementAdmin)

class PAPCategoryAdmin(admin.ModelAdmin):
    fields = ['pap_category',]
    list_display = (fields)   
admin.site.register(PAPCategory,PAPCategoryAdmin)

class RegionsAdmin(admin.ModelAdmin):
    fields = ('region_name',)
    list_display = (fields)
admin.site.register(Regions, RegionsAdmin)


class DistrictsAdmin(admin.ModelAdmin):
    fields = ('district_name',)
    list_display = (fields)
admin.site.register(Districts, DistrictsAdmin)


class TypeOfImpactAdmin(admin.ModelAdmin):
    fields = ['impact_number','impact']
    list_display = (fields)
admin.site.register(TypeOfImpact, TypeOfImpactAdmin)


class VulnerabilityCategoryAdmin(admin.ModelAdmin):
    list_display = ('vulnerability',)
admin.site.register(VulnerabilityCategory, VulnerabilityCategoryAdmin)

class NatureOfSettlementAdmin(admin.ModelAdmin):
    fields = ['nature_of_settlement',]
    list_display = (fields)
admin.site.register(NatureOfSettlement, NatureOfSettlementAdmin)

class TypeOfInvestmentAdmin(admin.ModelAdmin):
    fields = ['name_of_investment',]
    list_display = ('name_of_investment',)
admin.site.register(TypeOfInvestment, TypeOfInvestmentAdmin)

# admin.site.register(Settlement)

class SettlementAdmin(admin.ModelAdmin):
    fields = ['district_code','settlement_code','settlement_name']
    list_display = ('district_code','settlement_code','settlement_name')
    search_fields = ['settlement_name']
admin.site.register(Settlement, SettlementAdmin)

admin.site.register(Ward)
admin.site.register(LGA)