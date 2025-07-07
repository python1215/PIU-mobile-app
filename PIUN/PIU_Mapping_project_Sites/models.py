from django.db import models
from PIU_Financial_mgt .models import Project, Donor
from setup.models import Regions, Districts,  Settlement, YEAR, Access
from django.core.validators import MinValueValidator, MaxValueValidator


class projectMapping(models.Model):
    profile_year = models.ForeignKey(YEAR, on_delete=models.CASCADE)
    region = models.ForeignKey(Regions, on_delete=models.CASCADE)
    district = models.ForeignKey(Districts, on_delete=models.CASCADE)
    settlement = models.ForeignKey(Settlement, on_delete=models.CASCADE, verbose_name= 'settlement_name')
    Total_No_of_Households = models.IntegerField()
    no_of_connected_household = models.IntegerField(null=True)
    no_of_customer_connections = models.IntegerField(null=True)
    Latitude = models.FloatField()
    Longitude = models.FloatField()
    access = models.ForeignKey(Access, on_delete=models.CASCADE)
    project = models.ManyToManyField(Project)
    donor = models.ManyToManyField(Donor)
   
    #Note if access to electricity and water is True load another form to regist NAWEC infrastructure in the village
    def __str__(self):
        projects = ', '.join([project.project for project in self.project.all()])  # Replace 'name' with the field you want
        return f" {self.region}, {projects} , {self.settlement},  {self.Longitude}, {self.Latitude}"
   
class nawecinfrastructure(models.Model):
    scode = models.CharField(max_length=50)
    No_of_Transfprmer = models.IntegerField()
    transformer_name =models.CharField(max_length=10)
    No_of_Households_With_Electricity = models.IntegerField()
    water_supply_source =models.CharField(max_length=25)
    No_of_Households_With_water = models.IntegerField()

    # display cells base on serve selected
    def __str__(self):
        return str(self.scode)
    
class settlementwithCoordinates(models.Model):
    region = models.CharField(max_length=25)
    lga = models.CharField(max_length=50)
    district = models.CharField(max_length=100)
    ward = models.CharField(max_length=100)
    settlement_code =models.CharField(max_length=25)
    settlement_name = models.CharField(max_length=100)
    population_household = models.IntegerField(
        validators=[MinValueValidator(0)]  # No negative values allowed
    )
    Latitude = models.FloatField(
        validators=[MinValueValidator(13.0), MaxValueValidator(14.0)]
    )
    Longitude = models.FloatField(
        validators=[MinValueValidator(-14.0), MaxValueValidator(-18.0)]
    )

    def __str__(self):
        return str(self.settlement_name)
    

