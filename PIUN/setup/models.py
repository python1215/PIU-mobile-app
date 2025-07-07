from django.conf import settings
from django.db import models

# Create your models here.


class Donor(models.Model):
    donorID = models.AutoField(primary_key=True)
    name = models.CharField(max_length=200, unique=True, null=False)
    date = models.DateTimeField(auto_now_add=True)
    loginUser = models.ForeignKey(settings.AUTH_USER_MODEL,
                                  on_delete=models.CASCADE)

    class Meta:
        verbose_name = ("Donor")
        verbose_name_plural = ("Donor")

    def __str__(self):
        return str(self.name)


class Contributors(models.Model):
    contriID = models.AutoField(primary_key=True)
    name = models.CharField(max_length=200, unique=True, null=False)
    date = models.DateTimeField(auto_now_add=True)
    loginUser = models.ForeignKey(settings.AUTH_USER_MODEL,
                                  on_delete=models.CASCADE)

    class Meta:
        verbose_name = ("Contributors")
        verbose_name_plural = ("Contributors")

    def __str__(self):
        return str(self.name)


class ProjectCategory(models.Model):
    categoryID = models.AutoField(primary_key=True)
    category = models.CharField(max_length=50, unique=True, null=False)
    category_Description = models.CharField(max_length=100, null=True)

    date = models.DateTimeField(auto_now_add=True)
    loginUser = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='categories',
        on_delete=models.CASCADE,
    )

    class Meta:
        verbose_name = ("Project Category")
        verbose_name_plural = ("Project Category")

    def __str__(self):
        return str(self.category_Description)


class YEAR(models.Model):
    profile_year = models.CharField(max_length=4, unique=True, null=False)
    date = models.DateTimeField(auto_now_add=True)
    loginUser = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='years',
        on_delete=models.CASCADE,
    )

    class Meta:
        verbose_name = "Profile Year"
        verbose_name_plural = "Profile Year"

    def __str__(self):
        return str(self.profile_year)


#not in use : To be removed
class Month(models.Model):

    MONTH_CHOICES = [
        ("January", "January"),
        ("February", "February"),
        ("March", "March"),
        ("April", "April"),
        ("May", "May"),
        ("June", "June"),
        ("July", "July"),
        ("August", "August"),
        ("September", "September"),
        ("October", "October"),
        ("November", "November"),
        ("December", "December"),
    ]

    month = models.CharField(primary_key=True,
                             max_length=10,
                             choices=MONTH_CHOICES)
    date = models.DateTimeField(auto_now_add=True)
    loginUser = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
    )

    class Meta:
        verbose_name = "month"
        verbose_name_plural = "months"

    def __str__(self):
        return str(self.month)


class Quarter(models.Model):
    quarter = models.CharField(max_length=15,
                               unique=True,
                               null=False,
                               verbose_name="Report Frequency")
    date = models.DateTimeField(auto_now_add=True)
    loginUser = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='quarters',
        on_delete=models.CASCADE,
    )

    class Meta:
        verbose_name = "Quarter"
        verbose_name_plural = "Quarter"

    def __str__(self):
        return str(self.quarter)


class Physicalprogress(models.Model):
    progress_scale = models.CharField(max_length=20, unique=True, null=False)
    date = models.DateTimeField(auto_now_add=True)
    loginUser = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='physicalprogress',
        on_delete=models.CASCADE,
    )

    class Meta:
        verbose_name = ("Physical progress")
        verbose_name_plural = ("Physical progress")

    def __str__(self):
        return str(self.progress_scale)


class project_Activity_monitoring(models.Model):
    activity_type = models.CharField(max_length=150, unique=True, null=False)
    date = models.DateTimeField(auto_now_add=True)
    loginUser = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='project_activities_monitoring',
        on_delete=models.CASCADE,
    )

    class Meta:
        verbose_name = ("Activity Type")
        verbose_name_plural = ("Activity Types")

    def __str__(self):
        return str(self.activity_type)


class Indicator_Type(models.Model):
    indicator_type = models.CharField(max_length=500, unique=True, null=False)
    loginUser = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='indicator_types',
        on_delete=models.CASCADE,
    )

    class Meta:
        verbose_name = "Indicator Type"
        verbose_name_plural = "Indicator Type"

    def __str__(self):
        return str(self.indicator_type)


class DocumentType(models.Model):
    document_type = models.CharField(max_length=50, null=False, unique=True)
    date = models.DateTimeField(auto_now_add=True)
    loginUser = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='types_of_document',
        on_delete=models.CASCADE,
    )

    class Meta:
        verbose_name = ("Type Of Document")
        verbose_name_plural = ("Type of Documents")

    def __str__(self):
        return str(self.document_type)


class Type_of_Monitoring(models.Model):
    monitoring_type_code = models.CharField(max_length=10, primary_key=True)
    monitoring_type = models.CharField(max_length=25, unique=True, null=False)
    date = models.DateTimeField(auto_now_add=True)
    loginUser = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='types_of_monitoring',
        on_delete=models.CASCADE,
    )

    class Meta:
        verbose_name = ("Type Of Monitoring")
        verbose_name_plural = ("Type Of Monitoring")

    def __str__(self):
        return str(self.monitoring_type)


class TypeOfInvestment(models.Model):
    investmentID = models.AutoField(primary_key=True)
    name_of_investment = models.CharField(max_length=100,
                                          unique=True,
                                          null=False)
    loginUser = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='investment_type',
        on_delete=models.CASCADE,
    )

    class Meta:
        verbose_name = "Type of Investment"
        verbose_name_plural = "Type of Investment"

    def __str__(self):
        return str(self.name_of_investment)


class Measurement_Unit(models.Model):
    unit = models.CharField(max_length=50, unique=True, null=False)
    loginUser = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='measuring_unit',
        on_delete=models.CASCADE,
    )

    class Meta:
        verbose_name = "Measuring Unit"
        verbose_name_plural = 'Measuring Unit'

    def __str__(self):
        return str(self.unit)


class Data_Collection_Frequency(models.Model):
    frequency = models.CharField(max_length=50, unique=True, null=False)
    loginUser = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='collection_freq',
        on_delete=models.CASCADE,
    )

    class Meta:
        verbose_name = "Data Collection Frequency"
        verbose_name_plural = 'Data Collection Frequency'

    def __str__(self):
        return str(self.frequency)


#Categories Of vulnerability


class VulnerabilityCategory(models.Model):
    vulnerability = models.CharField(max_length=30, unique=True, null=False)
    loginUser = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='vulnerability_category',
        on_delete=models.CASCADE,
    )

    class Meta:
        verbose_name = "Vulnerability category"
        verbose_name_plural = "Vulnerability category"

    def __str__(self):
        return self.vulnerability


#Access to NAWEC Facilities (Electricity, Water, Elec & Wat, No Ele, No Wat, Sewrage, No Sewrage)
class Access(models.Model):
    access_type = models.CharField(max_length=30, null=False, unique=True)
    loginUser = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='access',
        on_delete=models.CASCADE,
    )

    class Meta:
        verbose_name = "access_type"
        verbose_name_plural = "access_type"

    def __str__(self):
        return str(self.access_type)


#Region : Contains the regions
class Regions(models.Model):
    region_code = models.CharField(primary_key=True, max_length=5)
    region_name = models.CharField(max_length=5, unique=True)
    description = models.CharField(max_length=100)

    class Meta:
        verbose_name = "Region"
        verbose_name_plural = "Region"

    def __str__(self):
        return self.region_name


class LGA(models.Model):
    lga_code = models.CharField(primary_key=True, max_length=5)
    lga_name = models.CharField(max_length=50, unique=True)
    region_code = models.ForeignKey(Regions, on_delete=models.CASCADE)

    class Meta:
        verbose_name = "LGA"
        verbose_name_plural = "LGA"

    def __str__(self):
        return self.lga_name


#Districts
class Districts(models.Model):
    region_code = models.ForeignKey(Regions, on_delete=models.CASCADE)
    lga_code = models.ForeignKey(LGA, on_delete=models.CASCADE)
    district_code = models.CharField(primary_key=True, max_length=5)
    district_name = models.CharField(max_length=100, unique=True)

    class Meta:
        verbose_name = "Districts"
        verbose_name_plural = "Districts"

    def __str__(self):
        return self.district_name


#Wards
class Ward(models.Model):
    ward_code = models.CharField(primary_key=True, max_length=5)
    ward_name = models.CharField(max_length=50, unique=True)
    district_code = models.ForeignKey(Districts, on_delete=models.CASCADE)

    class Meta:
        verbose_name = "Ward"
        verbose_name_plural = "Ward"

    def __str__(self):
        return self.ward_name


#Community
class Settlement(models.Model):
    district_code = models.ForeignKey(Districts, on_delete=models.CASCADE)
    settlement_code = models.CharField(primary_key=True, max_length=6)
    settlement_name = models.CharField(max_length=150)
    ward_code = models.ForeignKey(Ward, on_delete=models.CASCADE)
    EA = models.CharField(max_length=10)

    class Meta:
        db_table = "setup_settlement"
        verbose_name = "Settlement"
        verbose_name_plural = "Settlement name"

    def __str__(self):
        return self.settlement_name


class TypeOfImpact(models.Model):
    impact_number = models.IntegerField(default=1, primary_key=True)
    impact = models.CharField(max_length=150, unique=True,
                              null=False)  # 1. loss of land 2. Loss of Earning
    loginUser = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='impact_type',
        on_delete=models.CASCADE,
    )

    #if land, size should be given
    #earning estimated cost

    class Meta:
        verbose_name = "Impact"
        verbose_name_plural = "Type Of Impact"

    def __str__(self):
        return self.impact


#PAP Categories
class PAPCategory(models.Model):
    pap_category = models.CharField(
        max_length=70, unique=True,
        null=False)  #choices= [('A','Aggrieved'), ('B', 'Non Aggrieved')]
    loginUser = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='papcategories',
        on_delete=models.CASCADE,
    )

    class Meta:
        verbose_name = "PAP Category"
        verbose_name_plural = "PAP Category"

    def __str__(self):
        return self.pap_category


class TypeOfPAP(models.Model):
    type_of_pap = models.CharField(
        max_length=70, unique=True,
        null=False)  #choices= [('A','Aggrieved'), ('B', 'Non Aggrieved')]
    loginUser = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='paptypes',
        on_delete=models.CASCADE,
    )

    class Meta:
        verbose_name = "Type of PAP"
        verbose_name_plural = "Type of PAP"

    def __str__(self):
        return self.type_of_pap


#NAture of Settlement
class NatureOfSettlement(models.Model):
    nature_of_settlement = models.CharField(
        max_length=50, unique=True,
        null=False)  #choices=[('Cash','Cash'),('land','Land')]
    loginUser = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
    )

    class Meta:
        verbose_name = "nature_of_settlement"
        verbose_name_plural = "Nature Of Settlement"

    def __str__(self):
        return self.nature_of_settlement


class response(models.Model):
    yes_or_no = models.CharField(max_length=10)
    loginUser = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='responses',
        on_delete=models.CASCADE,
    )

    class Meta:
        verbose_name = "Yes OR No"
        verbose_name_plural = "Yes OR No"

    def __str__(self):
        return self.yes_or_no


#Decision Outcome  # Accept or Reject
class DecisionOutcome(models.Model):
    outcome = models.CharField(max_length=20)
    loginUser = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='outcomes',
        on_delete=models.CASCADE,
    )

    class Meta:
        verbose_name = "Decision OutCome"
        verbose_name_plural = "Decision OutCome"

    def __str__(self):
        return self.outcome


# STAKE_HOLDER_ENGAGEMENTs
class TypeOfStakeholderEngagement(models.Model):
    #change to type of stakeholder consultations/enagement at the frontend
    stake_holder_engagement = models.CharField(
        max_length=150, verbose_name='Consultation/Engagement')
    #choices with add option # example: 1.      Project operational modalities,Gender,child labour, SEA/SH, OHS
    loginUser = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='engagements',
        on_delete=models.CASCADE,
    )

    class Meta:
        verbose_name = "Type Of Stakeholder Engagement"
        verbose_name_plural = "Type Of Stakeholder Engagement"

    def __str__(self):
        return str(self.stake_holder_engagement)
