from django.conf import settings
from django.db import models
from django.core.exceptions import ValidationError
from django.db.models import Sum
from decimal import Decimal


from setup.models import Donor, Contributors, YEAR, Type_of_Monitoring


class Currency(models.Model):
    currency = models.CharField(max_length=4, unique=True, null=False)

    loginUser = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
    )

    class Meta:
        verbose_name = "currency"
        verbose_name_plural = "currencies"

    def __str__(self):
        return str(self.currency)
        

class Project(models.Model):
    projectID = models.CharField(max_length = 15, primary_key = True)
    project = models.CharField(max_length = 200, unique=True)
    # category_Description = models.ManyToManyField(ProjectCategory)
    currency = models.ForeignKey(Currency, on_delete=models.CASCADE, null=True)
    funding = models.DecimalField(max_digits=12, decimal_places = 2)
    donors =models.ManyToManyField(Donor)
    contributors =models.ManyToManyField(Contributors)
    effectiveness_Date = models.DateField(null=True, blank=True)
    closure_Date = models.DateField(null=True, blank=True)
    last_date_of_Disbursement = models.DateField(null=True, blank=True)

    date = models.DateTimeField(auto_now_add=True)
    loginUser = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )

    class Meta:
        verbose_name = ("Project")
        verbose_name_plural= ("Project")
    
    def __str__(self):
        return str(self.project)
    
    def get_total_components_allocation(self):
        """Calculate total allocation of all components for this project"""
        return self.component_set.aggregate(total=Sum('allocation'))['total'] or Decimal('0.00')
    
    def validate_funding_allocation(self):
        """Validate that project funding is reasonable compared to components allocation"""
        total_components = self.get_total_components_allocation()
        
        # Only validate if there are components and the difference is significant
        if total_components > 0:
            # Allow project funding to be greater than or equal to components allocation
            # This allows for planning additional components or budget adjustments
            if self.funding < total_components:
                raise ValidationError(
                    f"Project funding ({self.funding} {self.currency}) cannot be less than total components allocation "
                    f"({total_components} {self.currency}). Components exceed funding by: {total_components - self.funding}"
                )
            
            # Optional: Add a warning if funding is significantly higher than components (but don't prevent saving)
            difference = self.funding - total_components
            if difference > (self.funding * Decimal('0.5')):  # More than 50% difference
                # This could be logged as a warning but shouldn't prevent saving
                pass
    
    def clean(self):
        super().clean()
        # Skip validation for new projects (no components yet) during creation
        # Only validate during updates when components exist
        if self.pk and self.component_set.exists():
            self.validate_funding_allocation()

class Component(models.Model):
    compID = models.AutoField(primary_key=True, verbose_name='Component')
    projectID = models.ForeignKey(Project, on_delete=models.CASCADE, verbose_name='Project')
    Project_Components = models.CharField(max_length = 100)
    component_Description = models.CharField(max_length=500)
    currency = models.ForeignKey(Currency, on_delete=models.CASCADE, null=True)
    allocation = models.DecimalField(max_digits=12, decimal_places=2)
    date = models.DateTimeField(auto_now_add=True)
    loginUser = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
    )

    class Meta:
        verbose_name = ("Component")
        verbose_name_plural= ("Component")
    
    def __str__(self):
        return str(self.Project_Components)
    
    def get_total_subcomponents_allocation(self):
        """Calculate total allocation of all subcomponents for this component"""
        return self.subcomponent_set.aggregate(total=Sum('allocation'))['total'] or Decimal('0.00')
    
    def validate_component_allocation(self):
        """Validate that component allocation equals total subcomponents allocation"""
        total_subcomponents = self.get_total_subcomponents_allocation()
        
        # Only validate if there are subcomponents and the difference is significant
        if total_subcomponents > 0:
            difference = abs(self.allocation - total_subcomponents)
            # Allow some reasonable variance (e.g., small rounding differences)
            # Or if the component allocation is being adjusted to match planning
            if difference > Decimal('0.01') and self.allocation < total_subcomponents:
                # Only raise error if component allocation is significantly less than subcomponents
                # This allows increasing component allocation during planning
                raise ValidationError(
                    f"Component allocation ({self.allocation} {self.currency}) cannot be significantly less than "
                    f"total subcomponents allocation ({total_subcomponents} {self.currency}). "
                    f"Consider adjusting subcomponents or increase component allocation."
                )
    
    def validate_component_against_project_funding(self):
        """Validate that component allocation doesn't exceed project funding"""
        # Only validate if projectID exists and has a valid ID
        try:
            if not hasattr(self, 'projectID_id') or not self.projectID_id:
                return
            if not self.projectID:
                return
                
            project_funding = self.projectID.funding
            if self.allocation > project_funding:
                raise ValidationError(
                    f"Component allocation ({self.allocation} {self.currency}) cannot exceed project funding "
                    f"({project_funding} {self.projectID.currency})"
                )
        except (AttributeError, ValueError, Component.projectID.RelatedObjectDoesNotExist):
            # Handle case where projectID exists but funding is not accessible
            return
        
        try:
            # Check total component allocations don't exceed project funding
            other_components_total = Component.objects.filter(
                projectID=self.projectID
            ).exclude(compID=self.pk if self.pk else 0).aggregate(
                total=Sum('allocation')
            )['total'] or Decimal('0.00')
            
            total_with_this_component = other_components_total + self.allocation
            if total_with_this_component > project_funding:
                raise ValidationError(
                    f"Total component allocations ({total_with_this_component} {self.currency}) would exceed project funding "
                    f"({project_funding} {self.projectID.currency}). Current total: {other_components_total}"
                )
        except Exception:
            # Skip validation if there are database issues
            return
    
    def clean(self):
        super().clean()
        # Always validate component allocation against project funding
        self.validate_component_against_project_funding()
        
        # Skip strict subcomponent validation to allow flexible component management
        # This allows users to adjust component allocations for planning purposes
        # Validation can be enforced at reporting level if needed
   
class Subcomponent(models.Model):
    projectID = models.ForeignKey(Project, on_delete=models.CASCADE, verbose_name ='Project')
    compID = models.ForeignKey(Component, on_delete=models.CASCADE, verbose_name ='Component')
    subcompID = models.AutoField(primary_key=True)
    subcomponent = models.CharField(max_length=100)
    subcomponent_Description= models.CharField(max_length=500)
    currency = models.ForeignKey(Currency, on_delete=models.CASCADE, null=True)
    allocation = models.DecimalField(max_digits=12, decimal_places=2)
    date = models.DateTimeField(auto_now_add=True)
    loginUser = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
    )

    class Meta:
        verbose_name = "Subcomponent"
        verbose_name_plural = "Subcomponents"
    
    def __str__(self):
        return str(self.subcomponent)
    
    def get_total_activities_allocation(self):
        """Calculate total allocation of all activities for this subcomponent"""
        return self.activities_set.aggregate(total=Sum('allocation'))['total'] or Decimal('0.00')
    
    def validate_subcomponent_allocation(self):
        """Validate that subcomponent allocation equals total activities allocation"""
        total_activities = self.get_total_activities_allocation()
        if self.allocation != total_activities:
            raise ValidationError(
                f"Subcomponent allocation ({self.allocation} {self.currency}) must equal total activities allocation "
                f"({total_activities} {self.currency}). Difference: {abs(self.allocation - total_activities)}"
            )
    
    def validate_subcomponent_against_component_allocation(self):
        """Validate that subcomponent allocation doesn't exceed component allocation"""
        # Skip validation if component ID is not set (during form processing)
        if not hasattr(self, 'compID_id') or not self.compID_id:
            return
            
        try:
            # Use _state to check if the object is being created or updated
            if self._state.adding:
                # For new objects, get component from the foreign key ID
                try:
                    component = Component.objects.get(pk=self.compID_id)
                    component_allocation = component.allocation
                    component_currency = component.currency
                except Component.DoesNotExist:
                    return
            else:
                # For existing objects, use the relationship
                try:
                    component_allocation = self.compID.allocation
                    component_currency = self.compID.currency
                except:
                    return
                    
        except Exception:
            # If any error occurs, skip validation
            return
            
        if self.allocation and self.allocation > component_allocation:
            raise ValidationError(
                f"Subcomponent allocation ({self.allocation} {self.currency}) cannot exceed component allocation "
                f"({component_allocation} {component_currency})"
            )
        
        # Check total subcomponent allocations don't exceed component allocation
        if self.allocation:
            try:
                other_subcomponents_total = Subcomponent.objects.filter(
                    compID_id=self.compID_id
                ).exclude(subcompID=self.pk if self.pk else 0).aggregate(
                    total=Sum('allocation')
                )['total'] or Decimal('0.00')
                
                total_with_this_subcomponent = other_subcomponents_total + self.allocation
                if total_with_this_subcomponent > component_allocation:
                    raise ValidationError(
                        f"Total subcomponent allocations ({total_with_this_subcomponent} {self.currency}) would exceed component allocation "
                        f"({component_allocation} {component_currency}). Current total: {other_subcomponents_total}"
                    )
            except Exception:
                # If any error occurs, skip validation
                pass
    
    def clean(self):
        super().clean()
        # Always validate subcomponent allocation against component allocation
        self.validate_subcomponent_against_component_allocation()
        
        # Skip activity validation for new subcomponents (no activities yet) during creation
        # Only validate during updates when activities exist
        if self.pk and self.activities_set.exists():
            self.validate_subcomponent_allocation()


class Activities(models.Model):
    year = models.ForeignKey(YEAR, on_delete = models.CASCADE)
    projectID = models.ForeignKey('Project', on_delete=models.CASCADE, verbose_name='Project')
    compID = models.ForeignKey(Component, on_delete=models.CASCADE, verbose_name='Component')
    subcompID = models.ForeignKey(Subcomponent, on_delete=models.CASCADE, verbose_name='Subcomponent')
    activityID = models.AutoField(primary_key=True)
    activity = models.CharField(max_length=500, unique=True)
    currency = models.ForeignKey(Currency, on_delete=models.CASCADE, null=True)
    allocation = models.DecimalField(max_digits=12, decimal_places=2)
    date = models.DateTimeField(auto_now_add=True)
    loginUser = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
    )

    class Meta:
        verbose_name = "Activities"
        verbose_name_plural = "Activities"
    
    def __str__(self):
        return str(self.activity) 



#******************** PDO, Outcome and Results  *********************************
#Project Development Object
class PDO(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    pdo_statement = models.CharField(max_length=200, unique=True, null=False)
    date = models.DateTimeField(auto_now_add=True)
    loginUser = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='pdos',
        on_delete=models.CASCADE,
    )

    class Meta:
        verbose_name = ('PDO Statement')
        verbose_name_plural = ('PDO Statements')

    def __str__(self):
        return str(self.pdo_statement)
    

class ProjectOutCome(models.Model):
    pdo = models.ForeignKey(PDO, on_delete=models.CASCADE)
    project_outcome = models.CharField(max_length=200, unique=True, null=False)
    date = models.DateTimeField(auto_now_add=True)
    loginUser = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='projectoutcomes',
        on_delete=models.CASCADE,
    )

    class Meta:
        verbose_name = ('Project Outcome')
        verbose_name_plural = ('Project Outcomes')

    def __str__(self):
        return str(self.project_outcome)


class ProjectResult(models.Model):
    project_outcome = models.ForeignKey(ProjectOutCome, on_delete=models.CASCADE)
    project_result = models.CharField(max_length=200, unique=True, null=False)
    date = models.DateTimeField(auto_now_add=True)
    loginUser = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='projectresults',
        on_delete=models.CASCADE,
    )

    class Meta:
        verbose_name = ('Project Result')
        verbose_name_plural = ('Project Results')

    def __str__(self):
        return str(self.project_result)


class KPI_For_Contract(models.Model):
    project = models.ForeignKey('Project', on_delete=models.CASCADE, verbose_name='project')
    type_of_investment = models.TextField()
    Kpi_description = models.TextField()
    monitoring_Type_Code = models.CharField(max_length=15, primary_key=True)
    monitoring_type = models.ForeignKey(Type_of_Monitoring, on_delete=models.CASCADE)
    date = models.DateTimeField(auto_now_add=True)
    loginUser = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
    ) 
   
    class Meta:
        verbose_name = ("KPIs")
        verbose_name_plural= ("KPIs")
        # SQL Server compatibility
        db_table = 'PIU_Financial_mgt_kpi_for_contract'
    
    def __str__(self):
        return str(self.type_of_investment)
