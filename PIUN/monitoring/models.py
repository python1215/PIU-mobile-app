from django.conf import settings
from django.db import models
from PIU_Financial_mgt.models import Project, PDO, ProjectOutCome, ProjectResult
from setup.models import Indicator_Type, YEAR, Quarter, Measurement_Unit, Data_Collection_Frequency

# Indicator Description model
class Indicator_Description(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    pdo = models.ForeignKey(PDO, on_delete=models.CASCADE)

    project_outcome = models.ForeignKey(ProjectOutCome, on_delete=models.CASCADE)
    project_result = models.ForeignKey(ProjectResult, on_delete=models.CASCADE) 
    indicator_type = models.ForeignKey(Indicator_Type, on_delete=models.CASCADE)
    indicator_description = models.CharField(max_length=500)
    loginUser = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='indicator_descriptions',
        on_delete=models.CASCADE,
    ) 

    class Meta:
        verbose_name = "Indicator Description"
        verbose_name_plural = "Indicator Descriptions"
    
    def __str__(self):
        return str(self.indicator_description)

# Results Oriented Monitoring model
class Results_Oriented_Monitoring(models.Model):
    year = models.ForeignKey(YEAR, on_delete=models.CASCADE, null=True)
    quarter = models.ForeignKey(Quarter, on_delete=models.CASCADE, verbose_name="Report Frequency")
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    pdo = models.ForeignKey(PDO, on_delete=models.CASCADE)
 
    project_outcome = models.ForeignKey(ProjectOutCome, on_delete=models.CASCADE)
    project_result = models.ForeignKey(ProjectResult, on_delete=models.CASCADE)
    indicator_type = models.ForeignKey(Indicator_Type, on_delete=models.CASCADE)
    indicator_description = models.TextField(max_length=500)
    measurement_unit = models.ForeignKey(Measurement_Unit, on_delete=models.CASCADE)
    collection_frequency = models.ForeignKey(Data_Collection_Frequency, on_delete=models.CASCADE)
    baseline_value = models.FloatField(null=True, blank=True)
    achieved_value = models.FloatField(null=True, blank=True)
    End_Target_Value = models.FloatField(null=True, blank=True)  # renamed to follow snake_case
    percentage_achieved_vs_baseline = models.FloatField(null=True, blank=True)
    percentage_achieved_vs_end_target = models.FloatField(null=True, blank=True)
    remarks = models.TextField(max_length=250)
    date_created = models.DateTimeField(auto_now_add=True)
    loginUser = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
    ) 

    class Meta:
        verbose_name = "Results Oriented Monitoring"
        verbose_name_plural = "Results Oriented Monitoring"
    
    def __str__(self):
        return str(self.pdo)
