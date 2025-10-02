from django.db import models
from django.conf import settings
from PIU_Financial_mgt.models import Project
from dateutil.relativedelta import relativedelta
from datetime import date


# Create your models here.
class ProjectProgress(models.Model):
  project = models.ForeignKey(Project, on_delete=models.CASCADE)
  total_funding = models.DecimalField(max_digits=12, decimal_places=2)
  start_date = models.DateField()
  end_date = models.DateField()
  disbursement = models.DecimalField(max_digits=12, decimal_places=2)
  over_all_disbursement_rate = models.CharField(max_length=10, blank=True)
  over_all_physical_progress = models.CharField(max_length=10)
  over_project_time_elapsed = models.CharField(max_length=50, blank=True)
  date_created = models.DateTimeField(auto_now_add=True,
                                      verbose_name="Date Created")
  loginuser = models.ForeignKey(settings.AUTH_USER_MODEL,
                                on_delete=models.CASCADE,
                                verbose_name="Created By")

  class Meta:
    verbose_name = "Project Progress"
    verbose_name_plural = "Project Progress"
    ordering = ['-date_created']

  def save(self, *args, **kwargs):
    # Calculate over_all_disbursement_rate
    if self.total_funding and self.total_funding > 0:
      rate = (float(self.disbursement) / float(self.total_funding)) * 100
      self.over_all_disbursement_rate = f"{rate:.2f}%"
    else:
      self.over_all_disbursement_rate = "0.00%"
    
    # Calculate over_project_time_elapsed
    if self.start_date and self.end_date:
      diff = relativedelta(self.end_date, self.start_date)
      self.over_project_time_elapsed = f"{diff.years} years and {diff.months} months"
    else:
      self.over_project_time_elapsed = "N/A"
    
    super().save(*args, **kwargs)

  def __str__(self):
    return str(self.project)
