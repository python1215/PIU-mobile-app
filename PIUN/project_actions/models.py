from django.db import models
from PIU_Financial_mgt.models import Project, Component, Subcomponent,  Activities, Currency
from setup.models import ProjectCategory, Donor,  Type_of_Monitoring, Physicalprogress, Quarter
from PIU_Financial_mgt.models import KPI_For_Contract
from piu_project import settings
from django.utils import timezone
from django.conf import settings

# Create your models here.

class Contract_Profiling_works(models.Model): 
    projectID = models.ForeignKey(Project, on_delete = models.CASCADE)
    compID = models.ForeignKey(Component, on_delete= models.CASCADE)
    subcompID = models.ForeignKey(Subcomponent, on_delete= models.CASCADE)
    #month = models.ForeignKey(Month, on_delete=models.CASCADE)
    activityID = models.ForeignKey(Activities, on_delete=models.CASCADE)
    project_Category = models. ForeignKey(ProjectCategory, on_delete=models.CASCADE)
    funding_source = models.ForeignKey(Donor, on_delete=models.CASCADE) #get funding source from 
    main_intervention_focus_result = models.CharField(max_length=500, null=True, blank=True)
    target_number_of_beneficiary_settlements = models.IntegerField( null = True, blank=True)
    location_of_investment = models.CharField(max_length=500, null = True, blank=True)
    Latitude=models.FloatField(null = True)
    Longitude =models.FloatField(null = True)
    gross_floor_area_m2 = models.IntegerField(null = True)
    currency = models.ForeignKey(Currency, on_delete=models.CASCADE, null=True)
    contract_value = models.DecimalField(max_digits=15, decimal_places=2)
    amendments = models.BooleanField(default=False) #if yes then load an amenment form to adjust date and amount
    contract_refNo = models.CharField(max_length=50)
    name_of_contractor = models.CharField(max_length=100 , null = True, blank=True)
    name_of_consultant = models.CharField(max_length=200)
    contract_start_date = models.DateField()
    contract_end_date = models.DateField()
    duration = models.CharField(max_length=10)
    remarks = models.TextField()
    date = models.DateTimeField(auto_now_add=True)
    loginUser = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='profiling_works',
        on_delete=models.CASCADE,
    )   

  
    class Meta:
        verbose_name = ("Contract Profiling works")
        verbose_name_plural= ("Contract Profiling works")
    
      
    def __str__(self):
        return str(self.contract_refNo)
    
class Contract_Profiling_goods_services(models.Model): 
    projectID = models.ForeignKey(Project, on_delete = models.CASCADE)
    compID = models.ForeignKey(Component, on_delete= models.CASCADE)
    subcompID = models.ForeignKey(Subcomponent, on_delete= models.CASCADE)
    activityID = models.ForeignKey(Activities, on_delete=models.CASCADE)
    project_Category = models. ForeignKey(ProjectCategory, on_delete=models.CASCADE)
    funding_source = models.ForeignKey(Donor, on_delete=models.CASCADE) #get funding source from 
    currency = models.ForeignKey(Currency, on_delete=models.CASCADE, null=True)
    contract_value = models.DecimalField(max_digits=15, decimal_places=2)
    amendments = models.BooleanField(default=False) #if yes then load an amenment form to adjust date and amount
    contract_refNo = models.CharField(max_length=50)
    name_of_Supplier = models.CharField(max_length=100 , null = True, blank=True)
    name_of_consultant = models.CharField(max_length=200)
    contract_start_date = models.DateField()
    contract_end_date = models.DateField()
    duration = models.CharField(max_length=10)
    remarks = models.TextField()
    date = models.DateTimeField(auto_now_add=True)
    loginUser = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='profiling_goods_and_services',
        on_delete=models.CASCADE,
    )    

  
    class Meta:
        verbose_name = ("Contract Profiling Goods & Services")
        verbose_name_plural= ("Contract Profiling Goods & Services ")
    
      
    def __str__(self):
        return str(self.contract_refNo)

class Specific_Contract_Monitoring(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE,  verbose_name="Project" )
    contract_refNo = models.CharField(max_length=50, verbose_name="Contract Reference Number" )
    monitoring_date = models.DateField(default=timezone.now, verbose_name="Monitoring Date" )
    quarter = models.ForeignKey(Quarter, on_delete=models.CASCADE, verbose_name="Report Frequency" )
    type_of_monitoring = models.ForeignKey(Type_of_Monitoring, on_delete=models.CASCADE, verbose_name="Type of Monitoring" )
    Type_of_Investment = models.ForeignKey(KPI_For_Contract,  on_delete=models.CASCADE, related_name="investment_types", verbose_name="Type of Investment" )
    Kpi_description = models.ForeignKey(KPI_For_Contract, on_delete=models.CASCADE, related_name="specific_contract_investments", verbose_name="KPI Description" )
    milestone_start_date = models.DateField(default=timezone.now, verbose_name="Milestone Start Date" )
    milestone_end_date = models.DateField(default=timezone.now, verbose_name="Milestone End Date" )
    Target = models.TextField(verbose_name="Target" )
    Achieved_status = models.TextField(verbose_name="Achieved Status")
    Contract_implementation_Status = models.ForeignKey(Physicalprogress, on_delete=models.CASCADE, verbose_name="Contract Implementation Status" )
    picture_of_status = models.ImageField( null=True, blank=True, upload_to="images/project_actions",  verbose_name="Picture of Status" )
    remarks = models.TextField( verbose_name="Remarks" )
    date = models.DateTimeField(
        auto_now_add=True, 
        verbose_name="Date Created"
    )
    loginUser = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='Specific_Contract_Monitoring',
        on_delete=models.CASCADE,
    )  

    class Meta:
        verbose_name = "Specific Contract Monitoring"
        verbose_name_plural = "Specific Contract Monitoring"
    
    def __str__(self):
        return f"{self. contract_refNo} - {self.type_of_monitoring}"
