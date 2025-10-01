from django.db import models

# Create your models here.
class ProjectProgress(models.Model):
    project = models.ForeignKey('PIU_Financial_mgt.Project', on_delete=models.CASCADE),
  tota
