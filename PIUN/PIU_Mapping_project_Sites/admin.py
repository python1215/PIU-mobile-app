from django.contrib import admin
from .models import projectMapping, Access, nawecinfrastructure
# Register your models here.



class PIU_Mapping_Project_SitesAdmin(admin.ModelAdmin):
    list_display = (
        'profile_year', 'region', 'district', 'settlement', 
        'Total_No_of_Households', 'no_of_customer_connections', 
        'no_of_connected_household', 'Latitude', 'Longitude', 'access', 'display_donors'
    )
    list_filter = ('project', 'region', 'donor')
    search_fields = ['settlement__settlement_name']

    def display_donors(self, obj):
        return ", ".join([donor.name for donor in obj.donor.all()])
    display_donors.short_description = "Donors"

    class Media:
        css = {
            'all': ('admin/custom_admin.css',)  # Reference your CSS file
        }

# Register the model
admin.site.register(projectMapping, PIU_Mapping_Project_SitesAdmin)





admin.site.register(Access)
admin.site.register(nawecinfrastructure)