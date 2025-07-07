from django.contrib import admin
from .models import Contract_Profiling_works, Contract_Profiling_goods_services, Specific_Contract_Monitoring

@admin.register(Contract_Profiling_works)
class ContractProfilingWorksAdmin(admin.ModelAdmin):
    list_display = ('contract_refNo', 'projectID', 'name_of_contractor', 'contract_start_date', 'contract_end_date', 'duration')
    list_filter = ('projectID', 'project_Category', 'amendments')
    readonly_fields = ('contract_refNo',)


@admin.register(Contract_Profiling_goods_services)
class ContractProfilingGoodsServicesAdmin(admin.ModelAdmin):
    list_display = ('contract_refNo', 'projectID', 'name_of_Supplier', 'contract_start_date', 'contract_end_date', 'duration')
    list_filter = ('projectID', 'project_Category', 'amendments')
    readonly_fields = ('contract_refNo',)


@admin.register(Specific_Contract_Monitoring)
class SpecificContractMonitoringAdmin(admin.ModelAdmin):
    list_display = ('contract_refNo', 'project', 'type_of_monitoring', 'quarter', 'milestone_start_date', 'milestone_end_date')
    list_filter = ('project', 'quarter', 'type_of_monitoring')
    readonly_fields = ('contract_refNo',)
