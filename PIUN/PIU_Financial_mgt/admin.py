from django.contrib import admin
from django.contrib.admin import site


from .models  import *

# Register your models here.


admin.site.register(Currency)

class ProjectAdmin(admin.ModelAdmin):
    list_display = ('projectID', 'project', 'display_donors', 'display_contributors', 'currency','funding' ,'effectiveness_Date','closure_Date','last_date_of_Disbursement','date','loginUser')
    list_filter = ('project', 'donors', 'date')
    search_fields = ('projectID', 'project')
    
    fieldsets = (
        ('Project', {
            'fields': (('projectID', 'project'), ('donors', 'contributors'), 'currency', 'funding','effectiveness_Date','closure_Date','last_date_of_Disbursement','loginUser')
        }),
    )

    def display_donors(self, obj):
        return ", ".join([p.name for p in obj.donors.all()])

    display_donors.short_description = 'donors'

    def display_contributors(self, obj):
        return ", ".join([p.name for p in obj.contributors.all()])

    display_contributors.short_description = 'Contributors'

admin.site.register(Project, ProjectAdmin)


class ComponentAdmin(admin.ModelAdmin):
    fields = ['projectID', 'Project_Components','component_Description', 'currency','allocation','loginUser']
    list_display = ('projectID', 'Project_Components','component_Description', 'currency','allocation','date')
admin.site.register(Component, ComponentAdmin)



class SubcomponentAdmin(admin.ModelAdmin):
    fields =['projectID','compID','subcomponent','subcomponent_Description', 'currency','allocation','loginUser']
    list_display= ('projectID','compID','subcomponent','subcomponent_Description', 'currency','allocation','date')
admin.site.register(Subcomponent, SubcomponentAdmin)

class ActivitiesAdmin(admin.ModelAdmin):
    fields =['projectID','compID','subcompID','activity', 'currency','allocation','year','loginUser']
    list_display= ('projectID','compID','subcompID','activity', 'currency','allocation','year')
admin.site.register(Activities, ActivitiesAdmin)

admin.site.register(PDO)

class ProjectOutcomeAdmin(admin.ModelAdmin):
    fields =['pdo','project_outcome']
    list_display= ('pdo','project_outcome')
admin.site.register(ProjectOutCome, ProjectOutcomeAdmin)

class ProjectResultAdmin(admin.ModelAdmin):
    fields =['project_outcome','project_result']
    list_display= ('project_outcome','project_result')
admin.site.register(ProjectResult, ProjectResultAdmin)