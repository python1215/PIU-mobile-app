from django.contrib import admin
from .models import *

# Register your models here.
class Project_DocumentationTrackingAdmin(admin.ModelAdmin):
    fields = ['project','document_type','description','document_date','attachment']
    list_display = ('project','document_type','description','document_date','attachment')
admin.site.register(Project_Documentation_Tracking, Project_DocumentationTrackingAdmin)