from django.db import models

# Create your models here.
class ProjectProgress(models.Model):
    project = models.ForeignKey('PIU_Financial_mgt.Project', on_delete=models.CASCADE)
    total_funding = models.DecimalField(max_digits=12, decimal_places=2)
    start_date = models.DateField()
    end_date = models.DateField()
    disbursement = models.DecimalField(max_digits=12, decimal_places=2)
    over_all_disbursement_rate = models.DecimalField(max_digits=5, decimal_places=2, help_text="Percentage value (0-100)")
    
