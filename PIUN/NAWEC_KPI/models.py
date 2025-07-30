from django.conf import settings
from django.db import models
from django.contrib.auth.models import User
from datetime import datetime
from PIU_Financial_mgt.models import Project, PDO, ProjectOutCome, ProjectResult
from setup.models import YEAR, Quarter, Indicator_Type, Measurement_Unit, Data_Collection_Frequency


def calculate_percentage_progress(achieved_value,
                                  baseline_value,
                                  end_target_value=None):
    """
    Utility function to calculate percentage progress from baseline and towards end target
    Returns tuple (progress_from_baseline, progress_towards_end_target)
    """
    progress_from_baseline = None
    progress_towards_end_target = None

    if achieved_value is not None and baseline_value is not None:
        if baseline_value != 0:
            progress_from_baseline = (
                (achieved_value - baseline_value) / abs(baseline_value)) * 100
        else:
            progress_from_baseline = 0

    if (achieved_value is not None and baseline_value is not None
            and end_target_value is not None
            and end_target_value != baseline_value):
        progress_towards_end_target = (
            (achieved_value - baseline_value) /
            (end_target_value - baseline_value)) * 100

    return progress_from_baseline, progress_towards_end_target


class KPIIndicator(models.Model):
    """KPI Indicators for tracking performance metrics"""
    indicator_no = models.CharField(max_length=20, unique=True)
    indicator_description = models.TextField()
    attributes = models.CharField(max_length=200, blank=True)
    baseline_value = models.FloatField(null=True, blank=True)
    End_Target_Value = models.FloatField(null=True, blank=True)
    targeted_weight_value = models.FloatField(null=True, blank=True)
    date_created = models.DateTimeField(auto_now_add=True)
    loginUser = models.ForeignKey(settings.AUTH_USER_MODEL,
                                  on_delete=models.CASCADE)

    class Meta:
        verbose_name_plural = 'KPI Indicators'
        ordering = ['indicator_no']

    def __str__(self):
        return str(self.indicator_description)


class NAWEC_KPI_Monitoring(models.Model):
    """Results Oriented Monitoring model for NAWEC KPI tracking"""
    year = models.ForeignKey(YEAR, on_delete=models.CASCADE, null=True)
    quarter = models.ForeignKey(Quarter,
                                on_delete=models.CASCADE,
                                verbose_name="Report Frequency")
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    pdo = models.ForeignKey(PDO, on_delete=models.CASCADE)
    project_outcome = models.ForeignKey(ProjectOutCome,
                                        on_delete=models.CASCADE)
    project_result = models.ForeignKey(ProjectResult, on_delete=models.CASCADE)
    indicator_type = models.ForeignKey(Indicator_Type,
                                       on_delete=models.CASCADE)
    indicator_description = models.ForeignKey(KPIIndicator,
                                              on_delete=models.CASCADE,
                                              null=True,
                                              blank=True)
    measurement_unit = models.ForeignKey(Measurement_Unit,
                                         on_delete=models.CASCADE)
    collection_frequency = models.ForeignKey(Data_Collection_Frequency,
                                             on_delete=models.CASCADE)
    baseline_value = models.FloatField(null=True, blank=True)
    achieved_value = models.FloatField(null=True, blank=True)
    End_Target_Value = models.FloatField(null=True, blank=True)
    Percentage_progress_from_baseline = models.FloatField(
        null=True, blank=True, help_text="Percentage progress from baseline")
    Percentage_progress_towards_end_target = models.FloatField(
        null=True,
        blank=True,
        help_text="Percentage progress towards end target")

    Targeted_Achieved_weight = models.FloatField(null=True, blank=True)
    remarks = models.TextField(blank=True)
    date_created = models.DateTimeField(auto_now_add=True)
    loginUser = models.ForeignKey(settings.AUTH_USER_MODEL,
                                  on_delete=models.CASCADE,
                                  null=True,
                                  blank=True)

    class Meta:
        verbose_name = 'NAWEC KPI Monitoring'
        verbose_name_plural = 'NAWEC KPI Monitoring'

    def __str__(self):
        return f"{self.project} - {self.indicator_type} ({self.year})"


class CalculateROA(models.Model):
    """Model for Return on Assets calculation (KPI-01)"""
    # KPI tracking fields
    baseline_value = models.FloatField(
        null=True, blank=True, help_text="Baseline value for comparison")
    End_Target_Value = models.FloatField(
        null=True, blank=True, help_text="End target value to achieve")
    achieved_value = models.FloatField(null=True,
                                       blank=True,
                                       help_text="Calculated ROA percentage")
    
    # Progress calculation fields
    progress_from_baseline = models.FloatField(
        null=True, blank=True, help_text="Percentage progress from baseline")
    progress_towards_end_target = models.FloatField(
        null=True, blank=True, help_text="Percentage progress towards end target")

    # Calculation input fields
    net_profit_after_tax = models.FloatField(
        null=True, blank=True, help_text="Net profit after tax amount")
    total_assets = models.FloatField(null=True,
                                     blank=True,
                                     help_text="Total assets amount")
    compensation_amount = models.FloatField(
        null=True, blank=True, help_text="Compensation amount")
    compensation_end_target = models.FloatField(
        null=True, blank=True, help_text="End target value based on compensation amount")

    year = models.ForeignKey(YEAR,
                             on_delete=models.CASCADE,
                             null=True,
                             blank=True,
                             help_text="Year for this calculation")
    quarter = models.ForeignKey(Quarter,
                                on_delete=models.CASCADE,
                                null=True,
                                blank=True,
                                help_text="Quarter for this calculation")
    date_created = models.DateTimeField(auto_now_add=True)
    loginUser = models.ForeignKey(settings.AUTH_USER_MODEL,
                                  on_delete=models.CASCADE,
                                  null=True,
                                  blank=True)

    class Meta:
        verbose_name = "Calculate ROA"
        verbose_name_plural = "Calculate ROA"

    def save(self, *args, **kwargs):
        # Auto-calculate ROA percentage
        if self.net_profit_after_tax is not None and self.total_assets is not None and self.total_assets != 0:
            self.achieved_value = (self.net_profit_after_tax /
                                   self.total_assets) * 100
        
        # Calculate compensation_end_target based on compensation_amount
        if self.compensation_amount is not None:
            if self.compensation_amount == 0:
                self.compensation_end_target = -12.0
            elif self.compensation_amount >= 2000000000:
                self.compensation_end_target = 6.0
            elif 1 <= self.compensation_amount <= 1999999999:
                # Pro rata calculation: 
                # compensation_end_target = -12 + (18 * (compensation_amount - 1) / (2000000000 - 1))
                # Range: -12% to 6% (total range of 18%)
                ratio = (self.compensation_amount - 1) / (2000000000 - 1)
                self.compensation_end_target = -12.0 + (18.0 * ratio)
            else:
                # For values less than 1 or invalid, default to -12%
                self.compensation_end_target = -12.0
        
        # Calculate progress using KPI-01 formula
        if self.achieved_value is not None and self.baseline_value is not None:
            if self.baseline_value != 0:
                self.progress_from_baseline = ((self.achieved_value - self.baseline_value) / self.baseline_value) * 100
            
            if self.End_Target_Value is not None and self.End_Target_Value != self.baseline_value:
                self.progress_towards_end_target = ((self.achieved_value - self.baseline_value) / (self.End_Target_Value - self.baseline_value)) * 100

        super().save(*args, **kwargs)

    def __str__(self):
        return f"ROA - {self.achieved_value}% (ID: {self.pk})"


class CalculateNPM(models.Model):
    """Model for Net Profit Margin calculation (KPI-02)"""
    # KPI tracking fields
    baseline_value = models.FloatField(
        null=True, blank=True, help_text="Baseline value for comparison")
    End_Target_Value = models.FloatField(
        null=True, blank=True, help_text="End target value to achieve")
    achieved_value = models.FloatField(null=True,
                                       blank=True,
                                       help_text="achieved_value")
    
    # Progress calculation fields
    progress_from_baseline = models.FloatField(
        null=True, blank=True, help_text="Percentage progress from baseline")
    progress_towards_end_target = models.FloatField(
        null=True, blank=True, help_text="Percentage progress towards end target")

    # Calculation input fields
    total_revenues_turnover = models.FloatField(
        null=True, blank=True, help_text="Total revenue/turnover amount")
    netprofit = models.FloatField(null=True,
                                  blank=True,
                                  help_text="Total expenses amount")
    compensation_amount = models.FloatField(
        null=True, blank=True, help_text="Compensation amount")
    compensation_end_target = models.FloatField(
        null=True, blank=True, help_text="End target value based on compensation amount")

    year = models.ForeignKey(YEAR,
                             on_delete=models.CASCADE,
                             null=True,
                             blank=True,
                             help_text="Year for this calculation")
    quarter = models.ForeignKey(Quarter,
                                on_delete=models.CASCADE,
                                null=True,
                                blank=True,
                                help_text="Quarter for this calculation")
    date_created = models.DateTimeField(auto_now_add=True)
    loginUser = models.ForeignKey(settings.AUTH_USER_MODEL,
                                  on_delete=models.CASCADE,
                                  null=True,
                                  blank=True)

    class Meta:
        verbose_name = "Calculate PAT"
        verbose_name_plural = "Calculate PAT"

    def save(self, *args, **kwargs):
        # Auto-calculate Net Profit Margin (NPM)
        # NPM = (Net Profit / Total Revenue) × 100
        if (self.total_revenues_turnover is not None
                and self.netprofit is not None
                and self.total_revenues_turnover > 0):
            self.achieved_value = (self.netprofit / self.total_revenues_turnover) * 100
        
        # Calculate compensation_end_target based on compensation_amount (NPM specific logic)
        if self.compensation_amount is not None:
            if self.compensation_amount == 0:
                self.compensation_end_target = -15.0
            elif self.compensation_amount >= 2000000000:
                self.compensation_end_target = 10.0
            elif 1 <= self.compensation_amount <= 1999999999:
                # Pro rata calculation: 
                # compensation_end_target = -15 + (25 * (compensation_amount - 1) / (2000000000 - 1))
                # Range: -15% to 10% (total range of 25%)
                ratio = (self.compensation_amount - 1) / (2000000000 - 1)
                self.compensation_end_target = -15.0 + (25.0 * ratio)
            else:
                # For values less than 1 or invalid, default to -15%
                self.compensation_end_target = -15.0
        
        # Calculate progress using KPI-02 formula
        if self.achieved_value is not None and self.baseline_value is not None:
            if self.baseline_value != 0:
                self.progress_from_baseline = ((self.achieved_value - self.baseline_value) / self.baseline_value) * 100
            
            if self.End_Target_Value is not None and self.End_Target_Value != self.baseline_value:
                self.progress_towards_end_target = ((self.achieved_value - self.baseline_value) / (self.End_Target_Value - self.baseline_value)) * 100

        super().save(*args, **kwargs)

    def __str__(self):
        return f"NPM - {self.achieved_value} GMD (ID: {self.pk})"


class CalculateDSCR(models.Model):
    """Model for Debt Service Coverage Ratio calculation (KPI-03)"""
    # KPI tracking fields
    baseline_value = models.FloatField(
        null=True, blank=True, help_text="Baseline value for comparison")
    End_Target_Value = models.FloatField(
        null=True, blank=True, help_text="End target value to achieve")
    achieved_value = models.FloatField(null=True,
                                       blank=True,
                                       help_text="achieved_value")
    
    # Progress calculation fields
    progress_from_baseline = models.FloatField(
        null=True, blank=True, help_text="Percentage progress from baseline")
    progress_towards_end_target = models.FloatField(
        null=True, blank=True, help_text="Percentage progress towards end target")

    # Calculation input fields
    net_operating_income = models.FloatField(
        null=True, blank=True, help_text="Net operating income amount")
    total_debt_service = models.FloatField(
        null=True, blank=True, help_text="Total debt service amount")
    compensation_amount = models.FloatField(
        null=True, blank=True, help_text="Compensation amount")
    compensation_end_target = models.FloatField(
        null=True, blank=True, help_text="End target value based on compensation amount")
    unique_id = models.AutoField(primary_key=True)

    year = models.ForeignKey(YEAR,
                             on_delete=models.CASCADE,
                             null=True,
                             blank=True)
    quarter = models.ForeignKey(Quarter,
                                on_delete=models.CASCADE,
                                null=True,
                                blank=True)
    date_created = models.DateTimeField(auto_now_add=True)
    loginUser = models.ForeignKey(settings.AUTH_USER_MODEL,
                                  on_delete=models.CASCADE,
                                  null=True,
                                  blank=True)

    def save(self, *args, **kwargs):
        # Auto-calculate DSCR
        if (self.net_operating_income is not None
                and self.total_debt_service is not None
                and self.total_debt_service != 0):
            self.achieved_value = float(self.net_operating_income) / float(
                self.total_debt_service)
        
        # Calculate compensation_end_target based on compensation_amount (same logic as ROA)
        if self.compensation_amount is not None:
            if self.compensation_amount == 0:
                self.compensation_end_target = -12.0
            elif self.compensation_amount >= 2000000000:
                self.compensation_end_target = 6.0
            elif 1 <= self.compensation_amount <= 1999999999:
                # Pro rata calculation: 
                # compensation_end_target = -12 + (18 * (compensation_amount - 1) / (2000000000 - 1))
                # Range: -12% to 6% (total range of 18%)
                ratio = (self.compensation_amount - 1) / (2000000000 - 1)
                self.compensation_end_target = -12.0 + (18.0 * ratio)
            else:
                # For values less than 1 or invalid, default to -12%
                self.compensation_end_target = -12.0
        
        # Calculate progress using KPI-03 formula
        if self.achieved_value is not None and self.baseline_value is not None:
            if self.baseline_value != 0:
                self.progress_from_baseline = ((self.achieved_value - self.baseline_value) / self.baseline_value) * 100
            
            if self.End_Target_Value is not None and self.End_Target_Value != self.baseline_value:
                self.progress_towards_end_target = ((self.achieved_value - self.baseline_value) / (self.End_Target_Value - self.baseline_value)) * 100

        super().save(*args, **kwargs)

    def __str__(self):
        return f"DSCR - {self.achieved_value} (ID: {self.pk})"

    class Meta:
        verbose_name = "Calculate DSCR"
        verbose_name_plural = "Calculate DSCR"


class CalculateMWh(models.Model):
    """KPI-04: Local Production (Total electricity generated) Calculation Model
    Formula: Ejtotal = Σ(Ai×Bi) where A=power_injected, B=time_duration, C=number_of_sources
    """
    # KPI tracking fields
    baseline_value = models.FloatField(
        null=True, blank=True, help_text="Baseline value for comparison")
    End_Target_Value = models.FloatField(
        null=True, blank=True, help_text="End target value to achieve")
    achieved_value = models.FloatField(null=True,
                                       blank=True,
                                       help_text="Calculated result")
    
    # Progress calculation fields
    progress_from_baseline = models.FloatField(
        null=True, blank=True, help_text="Percentage progress from baseline")
    progress_towards_end_target = models.FloatField(
        null=True, blank=True, help_text="Percentage progress towards end target")

    # Calculation input fields
    power_injected = models.FloatField(null=True,
                                       blank=True,
                                       help_text="Power injected (MW)")
    time_duration = models.FloatField(null=True,
                                      blank=True,
                                      help_text="Time duration (hours)")
    number_of_sources = models.IntegerField(
        null=True, blank=True, help_text="Number of energy sources")

    year = models.ForeignKey(YEAR,
                             on_delete=models.CASCADE,
                             null=True,
                             blank=True)
    quarter = models.ForeignKey(Quarter,
                                on_delete=models.CASCADE,
                                null=True,
                                blank=True)
    date_created = models.DateTimeField(auto_now_add=True)
    loginUser = models.ForeignKey(settings.AUTH_USER_MODEL,
                                  on_delete=models.CASCADE,
                                  null=True,
                                  blank=True)

    def save(self, *args, **kwargs):
        # Auto-calculate MWh
        if (self.power_injected is not None and self.time_duration is not None
                and self.number_of_sources is not None):
            single_source_energy = float(self.power_injected) * float(
                self.time_duration)
            self.achieved_value = single_source_energy * int(
                self.number_of_sources)
        
        # Calculate progress using KPI-04 formula
        if self.achieved_value is not None and self.baseline_value is not None:
            if self.baseline_value != 0:
                self.progress_from_baseline = ((self.achieved_value - self.baseline_value) / self.baseline_value) * 100
            
            if self.End_Target_Value is not None and self.End_Target_Value != self.baseline_value:
                self.progress_towards_end_target = ((self.achieved_value - self.baseline_value) / (self.End_Target_Value - self.baseline_value)) * 100

        super().save(*args, **kwargs)

    def __str__(self):
        return f"MWh Calculation - {self.achieved_value} MWh ({self.year}/{self.quarter})"

    class Meta:
        verbose_name = "Local Production (Total electricity generated) (MWh) Calculation"
        verbose_name_plural = "Local Production (Total electricity generated) (MWh) Calculations"


class CalculateGAF(models.Model):
    """KPI-05: Generation Availability Factor calculation"""
    # KPI tracking fields
    baseline_value = models.FloatField(
        null=True, blank=True, help_text="Baseline value for comparison")
    End_Target_Value = models.FloatField(
        null=True, blank=True, help_text="End target value to achieve")
    achieved_value = models.FloatField(null=True,
                                       blank=True,
                                       help_text="achieved_value")
    
    # Progress calculation fields
    progress_from_baseline = models.FloatField(
        null=True, blank=True, help_text="Percentage progress from baseline")
    progress_towards_end_target = models.FloatField(
        null=True, blank=True, help_text="Percentage progress towards end target")

    # Calculation input fields
    total_available_hours = models.FloatField(
        null=True, blank=True, help_text="Total available hours")
    total_period_hours = models.FloatField(null=True,
                                           blank=True,
                                           help_text="Total period hours")

    year = models.ForeignKey(YEAR,
                             on_delete=models.CASCADE,
                             null=True,
                             blank=True)
    quarter = models.ForeignKey(Quarter,
                                on_delete=models.CASCADE,
                                null=True,
                                blank=True)
    date_created = models.DateTimeField(auto_now_add=True)
    loginUser = models.ForeignKey(settings.AUTH_USER_MODEL,
                                  on_delete=models.CASCADE,
                                  null=True,
                                  blank=True)

    def save(self, *args, **kwargs):
        # Auto-calculate GAF
        if (self.total_available_hours is not None
                and self.total_period_hours is not None
                and self.total_period_hours > 0):
            self.achieved_value = (float(self.total_available_hours) /
                                   float(self.total_period_hours)) * 100
        
        # Calculate progress using KPI-05 formula
        if self.achieved_value is not None and self.baseline_value is not None:
            if self.baseline_value != 0:
                self.progress_from_baseline = ((self.achieved_value - self.baseline_value) / self.baseline_value) * 100
            
            if self.End_Target_Value is not None and self.End_Target_Value != self.baseline_value:
                self.progress_towards_end_target = ((self.achieved_value - self.baseline_value) / (self.End_Target_Value - self.baseline_value)) * 100

        super().save(*args, **kwargs)

    def __str__(self):
        return f"GAF Calculation - {self.achieved_value}% ({self.year}/{self.quarter})"

    class Meta:
        verbose_name = "Generation Availability Factor (GAF) Calculation"
        verbose_name_plural = "Generation Availability Factor (GAF) Calculations"


class Month(models.Model):
    """Month model for Training Man Hours calculations"""
    MONTH_CHOICES = [
        (1, 'January'),
        (2, 'February'),
        (3, 'March'),
        (4, 'April'),
        (5, 'May'),
        (6, 'June'),
        (7, 'July'),
        (8, 'August'),
        (9, 'September'),
        (10, 'October'),
        (11, 'November'),
        (12, 'December'),
    ]
    
    month_number = models.IntegerField(choices=MONTH_CHOICES, unique=True)
    month_name = models.CharField(max_length=20)
    
    def save(self, *args, **kwargs):
        # Auto-set month_name based on month_number
        if self.month_number:
            month_dict = dict(self.MONTH_CHOICES)
            self.month_name = month_dict.get(self.month_number, '')
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.month_name
    
    class Meta:
        verbose_name = "Month"
        verbose_name_plural = "Months"
        ordering = ['month_number']


class CalculateTMH(models.Model):
    """KPI-06: Training Man Hours Calculation Model
    Formula: TMH = number_of_days × hours_per_day × number_of_participants
    """
    # KPI tracking fields
    baseline_value = models.FloatField(
        null=True, blank=True, help_text="Baseline value for comparison")
    End_Target_Value = models.FloatField(
        null=True, blank=True, help_text="End target value to achieve")
    achieved_value = models.FloatField(null=True,
                                       blank=True,
                                       help_text="Calculated training man hours result")
    
    # Progress calculation fields
    progress_from_baseline = models.FloatField(
        null=True, blank=True, help_text="Percentage progress from baseline")
    progress_towards_end_target = models.FloatField(
        null=True, blank=True, help_text="Percentage progress towards end target")

    # Training details
    title = models.CharField(max_length=200, default='Training Session')
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    hours_per_day = models.FloatField(default=8.0)
    number_of_participants = models.PositiveIntegerField(default=1)

    @property
    def number_of_days(self):
        if self.start_date and self.end_date:
            return (self.end_date - self.start_date).days + 1
        return 0

    @property
    def total_duration_hours(self):
        return self.number_of_days * self.hours_per_day

    @property
    def total_man_hours(self):
        return self.total_duration_hours * self.number_of_participants

    year = models.ForeignKey(YEAR,
                             on_delete=models.CASCADE,
                             null=True,
                             blank=True)
    quarter = models.ForeignKey(Quarter,
                                on_delete=models.CASCADE,
                                null=True,
                                blank=True)
    date_created = models.DateTimeField(auto_now_add=True)
    loginUser = models.ForeignKey(settings.AUTH_USER_MODEL,
                                  on_delete=models.CASCADE,
                                  null=True,
                                  blank=True)

    def save(self, *args, **kwargs):
        # Auto-calculate TMH using the total_man_hours property
        self.achieved_value = self.total_man_hours
        
        # Calculate progress using KPI-06 formula
        if self.achieved_value is not None and self.baseline_value is not None:
            if self.baseline_value != 0:
                self.progress_from_baseline = ((self.achieved_value - self.baseline_value) / self.baseline_value) * 100
            
            if self.End_Target_Value is not None and self.End_Target_Value != self.baseline_value:
                self.progress_towards_end_target = ((self.achieved_value - self.baseline_value) / (self.End_Target_Value - self.baseline_value)) * 100

        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = "Training Man Hours (TMH) Calculation"
        verbose_name_plural = "Training Man Hours (TMH) Calculations"


class CalculateATC(models.Model):
    """KPI-07: ATC&C (Total Losses Electricity) Calculation Model
    Formula: ATC = (1-(billing_efficiency * collection_efficiency))/100
    """
    # KPI tracking fields
    baseline_value = models.FloatField(
        null=True, blank=True, help_text="Baseline value for comparison")
    End_Target_Value = models.FloatField(
        null=True, blank=True, help_text="End target value to achieve")
    achieved_value = models.FloatField(null=True,
                                       blank=True,
                                       help_text="achieved_value")
    
    # Progress calculation fields
    progress_from_baseline = models.FloatField(
        null=True, blank=True, help_text="Percentage progress from baseline")
    progress_towards_end_target = models.FloatField(
        null=True, blank=True, help_text="Percentage progress towards end target")

    # Calculation input fields
    billing_efficiency = models.FloatField(
        null=True,
        blank=True,
        help_text="Billing efficiency as percentage (≥0)")
    collection_efficiency = models.FloatField(
        null=True,
        blank=True,
        help_text="Collection efficiency as percentage (≥0)")

    year = models.ForeignKey(YEAR,
                             on_delete=models.CASCADE,
                             null=True,
                             blank=True)
    quarter = models.ForeignKey(Quarter,
                                on_delete=models.CASCADE,
                                null=True,
                                blank=True)
    date_created = models.DateTimeField(auto_now_add=True)
    loginUser = models.ForeignKey(settings.AUTH_USER_MODEL,
                                  on_delete=models.CASCADE,
                                  null=True,
                                  blank=True)

    def save(self, *args, **kwargs):
        # Auto-calculate ATC&C
        if self.billing_efficiency is not None and self.collection_efficiency is not None:
            # Convert percentages to decimals (divide by 100)
            billing_decimal = float(self.billing_efficiency) / 100
            collection_decimal = float(self.collection_efficiency) / 100
            # Apply the formula
            self.achieved_value = (
                1 - (billing_decimal * collection_decimal)) / 100
        
        # Calculate progress using KPI-07 formula (reverse calculation)
        if self.achieved_value is not None and self.baseline_value is not None:
            if self.baseline_value != self.End_Target_Value:
                self.progress_from_baseline = ((self.baseline_value - self.achieved_value) / (self.baseline_value - self.End_Target_Value)) * 100
                self.progress_towards_end_target = 100 - self.progress_from_baseline

        super().save(*args, **kwargs)

    def __str__(self):
        return f"ATC&C Calculation - {self.achieved_value} ({self.year}/{self.quarter})"

    class Meta:
        verbose_name = "Total Losses Electricity (ATC&C) Calculation"
        verbose_name_plural = "Total Losses Electricity (ATC&C) Calculations"


class CalculateNECD(models.Model):
    """KPI-08: New Electricity Connection Days calculation"""
    # KPI tracking fields
    baseline_value = models.FloatField(
        null=True, blank=True, help_text="Baseline value for comparison")
    End_Target_Value = models.FloatField(
        null=True, blank=True, help_text="End target value to achieve")
    achieved_value = models.FloatField(null=True,
                                       blank=True,
                                       help_text="achieved_value")
    
    # Progress calculation fields
    progress_from_baseline = models.FloatField(
        null=True, blank=True, help_text="Percentage progress from baseline")
    progress_towards_end_target = models.FloatField(
        null=True, blank=True, help_text="Percentage progress towards end target")

    # Calculation input fields
    total_time_days = models.FloatField(null=True,
                                        blank=True,
                                        help_text="Total time in days")
    total_number_of_new_connections = models.FloatField(
        null=True, blank=True, help_text="Total number of new connections")

    year = models.ForeignKey(YEAR,
                             on_delete=models.CASCADE,
                             null=True,
                             blank=True)
    quarter = models.ForeignKey(Quarter,
                                on_delete=models.CASCADE,
                                null=True,
                                blank=True)
    date_created = models.DateTimeField(auto_now_add=True)
    loginUser = models.ForeignKey(settings.AUTH_USER_MODEL,
                                  on_delete=models.CASCADE,
                                  null=True,
                                  blank=True)

    def save(self, *args, **kwargs):
        if (self.total_time_days is not None
                and self.total_number_of_new_connections is not None
                and self.total_number_of_new_connections > 0):
            self.achieved_value = float(self.total_time_days) / float(
                self.total_number_of_new_connections)
        
        # Calculate progress using KPI-08 formula (reverse calculation)
        if self.achieved_value is not None and self.baseline_value is not None:
            if self.baseline_value != self.End_Target_Value:
                self.progress_from_baseline = ((self.baseline_value - self.achieved_value) / (self.baseline_value - self.End_Target_Value)) * 100
                self.progress_towards_end_target = 100 - self.progress_from_baseline

        super().save(*args, **kwargs)

    def __str__(self):
        return f"NECD Calculation - {self.achieved_value} days ({self.year}/{self.quarter})"

    class Meta:
        verbose_name = "New Electricity Connection Days (NECD) Calculation"
        verbose_name_plural = "New Electricity Connection Days (NECD) Calculations"


class CalculateNWCD(models.Model):
    """KPI-09: New Water Connection Days calculation"""
    # KPI tracking fields
    baseline_value = models.FloatField(
        null=True, blank=True, help_text="Baseline value for comparison")
    End_Target_Value = models.FloatField(
        null=True, blank=True, help_text="End target value to achieve")
    achieved_value = models.FloatField(null=True,
                                       blank=True,
                                       help_text="achieved_value")
    
    # Progress calculation fields
    progress_from_baseline = models.FloatField(
        null=True, blank=True, help_text="Percentage progress from baseline")
    progress_towards_end_target = models.FloatField(
        null=True, blank=True, help_text="Percentage progress towards end target")

    # Calculation input fields
    total_time_days = models.FloatField(null=True,
                                        blank=True,
                                        help_text="Total time in days")
    total_number_of_new_connections = models.FloatField(
        null=True,
        blank=True,
        help_text="Total number of new water connections")

    year = models.ForeignKey(YEAR,
                             on_delete=models.CASCADE,
                             null=True,
                             blank=True)
    quarter = models.ForeignKey(Quarter,
                                on_delete=models.CASCADE,
                                null=True,
                                blank=True)
    date_created = models.DateTimeField(auto_now_add=True)
    loginUser = models.ForeignKey(settings.AUTH_USER_MODEL,
                                  on_delete=models.CASCADE,
                                  null=True,
                                  blank=True)

    def save(self, *args, **kwargs):
        if (self.total_time_days is not None
                and self.total_number_of_new_connections is not None
                and self.total_number_of_new_connections > 0):
            self.achieved_value = float(self.total_time_days) / float(
                self.total_number_of_new_connections)
        
        # Calculate progress using KPI-09 formula (reverse calculation)
        if self.achieved_value is not None and self.baseline_value is not None:
            if self.baseline_value != self.End_Target_Value:
                self.progress_from_baseline = ((self.baseline_value - self.achieved_value) / (self.baseline_value - self.End_Target_Value)) * 100
                self.progress_towards_end_target = 100 - self.progress_from_baseline

        super().save(*args, **kwargs)

    def __str__(self):
        return f"NWCD Calculation - {self.achieved_value} days ({self.year}/{self.quarter})"

    class Meta:
        verbose_name = "New Water Connection Days (NWCD) Calculation"
        verbose_name_plural = "New Water Connection Days (NWCD) Calculations"


class CalculateTPS(models.Model):
    """KPI-10: Timely Payment of Salary calculation"""
    # KPI tracking fields
    baseline_value = models.FloatField(
        null=True, blank=True, help_text="Baseline value for comparison")
    End_Target_Value = models.FloatField(
        null=True, blank=True, help_text="End target value to achieve")
    achieved_value = models.FloatField(null=True,
                                       blank=True,
                                       help_text="achieved_value")
    
    # Progress calculation fields
    progress_from_baseline = models.FloatField(
        null=True, blank=True, help_text="Percentage progress from baseline")
    progress_towards_end_target = models.FloatField(
        null=True, blank=True, help_text="Percentage progress towards end target")

    # Calculation input fields
    number_of_on_time_payments = models.FloatField(
        null=True, blank=True, help_text="Number of on-time payments")
    total_number_of_payments_due = models.FloatField(
        null=True, blank=True, help_text="Total number of payments due")

    year = models.ForeignKey(YEAR,
                             on_delete=models.CASCADE,
                             null=True,
                             blank=True)
    quarter = models.ForeignKey(Quarter,
                                on_delete=models.CASCADE,
                                null=True,
                                blank=True)
    date_created = models.DateTimeField(auto_now_add=True)
    loginUser = models.ForeignKey(settings.AUTH_USER_MODEL,
                                  on_delete=models.CASCADE,
                                  null=True,
                                  blank=True)

    def save(self, *args, **kwargs):
        if (self.number_of_on_time_payments is not None
                and self.total_number_of_payments_due is not None
                and self.total_number_of_payments_due > 0):
            self.achieved_value = (
                float(self.number_of_on_time_payments) /
                float(self.total_number_of_payments_due)) * 100
        
        # Calculate progress using KPI-10 formula
        if self.achieved_value is not None and self.baseline_value is not None:
            if self.baseline_value != 0:
                self.progress_from_baseline = ((self.achieved_value - self.baseline_value) / self.baseline_value) * 100
            
            if self.End_Target_Value is not None and self.End_Target_Value != self.baseline_value:
                self.progress_towards_end_target = ((self.achieved_value - self.baseline_value) / (self.End_Target_Value - self.baseline_value))

        super().save(*args, **kwargs)

    def __str__(self):
        return f"TPS Calculation - {self.achieved_value}% ({self.year}/{self.quarter})"

    class Meta:
        verbose_name = "Timely Payment of Salary (TPS) Calculation"
        verbose_name_plural = "Timely Payment of Salary (TPS) Calculations"


class CalculateTTP(models.Model):
    """KPI-11: Timely Tax Payment calculation"""
    # KPI tracking fields
    baseline_value = models.FloatField(
        null=True, blank=True, help_text="Baseline value for comparison")
    End_Target_Value = models.FloatField(
        null=True, blank=True, help_text="End target value to achieve")
    achieved_value = models.FloatField(null=True,
                                       blank=True,
                                       help_text="achieved_value")
    
    # Progress calculation fields
    progress_from_baseline = models.FloatField(
        null=True, blank=True, help_text="Percentage progress from baseline")
    progress_towards_end_target = models.FloatField(
        null=True, blank=True, help_text="Percentage progress towards end target")

    # Calculation input fields
    timely_tax_payments = models.FloatField(
        null=True, blank=True, help_text="Number of timely tax payments")
    total_tax_payments_due = models.FloatField(
        null=True, blank=True, help_text="Total tax payments due")

    year = models.ForeignKey(YEAR,
                             on_delete=models.CASCADE,
                             null=True,
                             blank=True)
    quarter = models.ForeignKey(Quarter,
                                on_delete=models.CASCADE,
                                null=True,
                                blank=True)
    date_created = models.DateTimeField(auto_now_add=True)
    loginUser = models.ForeignKey(settings.AUTH_USER_MODEL,
                                  on_delete=models.CASCADE,
                                  null=True,
                                  blank=True)

    def save(self, *args, **kwargs):
        if (self.timely_tax_payments is not None
                and self.total_tax_payments_due is not None
                and self.total_tax_payments_due > 0):
            self.achieved_value = float(self.timely_tax_payments) / float(
                self.total_tax_payments_due)
        
        # Calculate progress using KPI-11 formula
        if self.achieved_value is not None and self.baseline_value is not None:
            if self.baseline_value != 0:
                self.progress_from_baseline = ((self.achieved_value - self.baseline_value) / self.baseline_value) * 100
            
            if self.End_Target_Value is not None and self.End_Target_Value != self.baseline_value:
                self.progress_towards_end_target = ((self.achieved_value - self.baseline_value) / (self.End_Target_Value - self.baseline_value))

        super().save(*args, **kwargs)

    def __str__(self):
        return f"TTP Calculation - {self.achieved_value} ({self.year}/{self.quarter})"

    class Meta:
        verbose_name = "Timely Tax Payment (TTP) Calculation"
        verbose_name_plural = "Timely Tax Payment (TTP) Calculations"


class CalculateWQCC(models.Model):
    """KPI-12: Water Quality Compliance Chemical calculation"""
    # KPI tracking fields
    baseline_value = models.FloatField(
        null=True, blank=True, help_text="Baseline value for comparison")
    End_Target_Value = models.FloatField(
        null=True, blank=True, help_text="End target value to achieve")
    achieved_value = models.FloatField(null=True,
                                       blank=True,
                                       help_text="achieved_value")
    
    # Progress calculation fields
    progress_from_baseline = models.FloatField(
        null=True, blank=True, help_text="Percentage progress from baseline")
    progress_towards_end_target = models.FloatField(
        null=True, blank=True, help_text="Percentage progress towards end target")

    # Calculation input fields
    number_of_compliant_water_samples = models.FloatField(
        null=True, blank=True, help_text="Number of compliant water samples")
    total_number_of_tested_water_samples = models.FloatField(
        null=True,
        blank=True,
        help_text="Total number of tested water samples")

    year = models.ForeignKey(YEAR,
                             on_delete=models.CASCADE,
                             null=True,
                             blank=True)
    quarter = models.ForeignKey(Quarter,
                                on_delete=models.CASCADE,
                                null=True,
                                blank=True)
    date_created = models.DateTimeField(auto_now_add=True)
    loginUser = models.ForeignKey(settings.AUTH_USER_MODEL,
                                  on_delete=models.CASCADE,
                                  null=True,
                                  blank=True)

    def save(self, *args, **kwargs):
        if (self.number_of_compliant_water_samples is not None
                and self.total_number_of_tested_water_samples is not None
                and self.total_number_of_tested_water_samples > 0):
            self.achieved_value = (
                float(self.number_of_compliant_water_samples) /
                float(self.total_number_of_tested_water_samples)) * 100
        
        # Calculate progress using KPI-12 formula
        if self.achieved_value is not None and self.baseline_value is not None:
            if self.baseline_value != 0:
                self.progress_from_baseline = ((self.achieved_value - self.baseline_value) / self.baseline_value) * 100
            
            if self.End_Target_Value is not None and self.End_Target_Value != self.baseline_value:
                self.progress_towards_end_target = ((self.achieved_value - self.baseline_value) / (self.End_Target_Value - self.baseline_value))

        super().save(*args, **kwargs)

    def __str__(self):
        return f"WQCC Calculation - {self.achieved_value}% ({self.year}/{self.quarter})"

    class Meta:
        verbose_name = "Water Quality Compliance Bacteriological (WQCC) Calculation"
        verbose_name_plural = "Water Quality Compliance Bacteriological (WQCC) Calculations"


class CalculateWQCB(models.Model):
    """KPI-13: Water Quality Compliance Bacteriological calculation"""
    # KPI tracking fields
    baseline_value = models.FloatField(
        null=True, blank=True, help_text="Baseline value for comparison")
    End_Target_Value = models.FloatField(
        null=True, blank=True, help_text="End target value to achieve")
    achieved_value = models.FloatField(null=True,
                                       blank=True,
                                       help_text="achieved_value")
    
    # Progress calculation fields
    progress_from_baseline = models.FloatField(
        null=True, blank=True, help_text="Percentage progress from baseline")
    progress_towards_end_target = models.FloatField(
        null=True, blank=True, help_text="Percentage progress towards end target")

    # Calculation input fields
    number_of_compliant_water_samples = models.FloatField(
        null=True, blank=True, help_text="Number of compliant water samples")
    total_number_of_tested_water_samples = models.FloatField(
        null=True,
        blank=True,
        help_text="Total number of tested water samples")

    year = models.ForeignKey(YEAR,
                             on_delete=models.CASCADE,
                             null=True,
                             blank=True)
    quarter = models.ForeignKey(Quarter,
                                on_delete=models.CASCADE,
                                null=True,
                                blank=True)
    date_created = models.DateTimeField(auto_now_add=True)
    loginUser = models.ForeignKey(settings.AUTH_USER_MODEL,
                                  on_delete=models.CASCADE,
                                  null=True,
                                  blank=True)

    def save(self, *args, **kwargs):
        if (self.number_of_compliant_water_samples is not None
                and self.total_number_of_tested_water_samples is not None
                and self.total_number_of_tested_water_samples > 0):
            self.achieved_value = (
                float(self.number_of_compliant_water_samples) /
                float(self.total_number_of_tested_water_samples)) * 100
        
        # Calculate progress using KPI-13 formula
        if self.achieved_value is not None and self.baseline_value is not None:
            if self.baseline_value != 0:
                self.progress_from_baseline = ((self.achieved_value - self.baseline_value) / self.baseline_value) * 100
            
            if self.End_Target_Value is not None and self.End_Target_Value != self.baseline_value:
                self.progress_towards_end_target = ((self.achieved_value - self.baseline_value) / (self.End_Target_Value - self.baseline_value))

        super().save(*args, **kwargs)

    def __str__(self):
        return f"WQCB Calculation - {self.achieved_value}% ({self.year}/{self.quarter})"

    class Meta:
        verbose_name = "Water Quality Compliance Bacteriological (WQCB) Calculation"
        verbose_name_plural = "Water Quality Compliance Bacteriological (WQCB) Calculations"


class CalculateNRW(models.Model):
    """KPI-14: Non-Revenue Water calculation"""
    # KPI tracking fields
    baseline_value = models.FloatField(
        null=True, blank=True, help_text="Baseline value for comparison")
    End_Target_Value = models.FloatField(
        null=True, blank=True, help_text="End target value to achieve")
    achieved_value = models.FloatField(null=True,
                                       blank=True,
                                       help_text="achieved_value")
    
    # Progress calculation fields
    progress_from_baseline = models.FloatField(
        null=True, blank=True, help_text="Percentage progress from baseline")
    progress_towards_end_target = models.FloatField(
        null=True, blank=True, help_text="Percentage progress towards end target")

    # Calculation input fields
    water_entering_system = models.FloatField(
        null=True, blank=True, help_text="Water entering system M3")
    billed_authorized_consumption = models.FloatField(
        null=True, blank=True, help_text="Billed authorized consumption M3")

    year = models.ForeignKey(YEAR,
                             on_delete=models.CASCADE,
                             null=True,
                             blank=True)
    quarter = models.ForeignKey(Quarter,
                                on_delete=models.CASCADE,
                                null=True,
                                blank=True)
    date_created = models.DateTimeField(auto_now_add=True)
    loginUser = models.ForeignKey(settings.AUTH_USER_MODEL,
                                  on_delete=models.CASCADE,
                                  null=True,
                                  blank=True)

    def save(self, *args, **kwargs):
        if (self.water_entering_system is not None
                and self.billed_authorized_consumption is not None
                and self.water_entering_system > 0):
            self.achieved_value = (float(self.billed_authorized_consumption) /
                                   float(self.water_entering_system)) * 100
        
        # Calculate progress using KPI-14 formula (reverse calculation)
        if self.achieved_value is not None and self.baseline_value is not None:
            if self.baseline_value != self.End_Target_Value:
                self.progress_from_baseline = ((self.baseline_value - self.achieved_value) / (self.baseline_value - self.End_Target_Value)) * 100
                self.progress_towards_end_target = 100 - self.progress_from_baseline

        super().save(*args, **kwargs)

    def __str__(self):
        return f"NRW Calculation - {self.achieved_value}% ({self.year}/{self.quarter})"

    class Meta:
        verbose_name = "Non-Revenue Water (NRW) Calculation"
        verbose_name_plural = "Non-Revenue Water (NRW) Calculations"


class CalculateDD(models.Model):
    """Model for Debtor Days calculation (KPI-15)
    Formula: DD = (Trade Receivables ÷ Total Credit Sales) * 365
    """
    # KPI tracking fields
    baseline_value = models.FloatField(
        null=True, blank=True, help_text="Baseline value for comparison")
    End_Target_Value = models.FloatField(
        null=True, blank=True, help_text="End target value to achieve")
    achieved_value = models.FloatField(null=True,
                                       blank=True,
                                       help_text="achieved_value")
    
    # Progress calculation fields
    progress_from_baseline = models.FloatField(
        null=True, blank=True, help_text="Percentage progress from baseline")
    progress_towards_end_target = models.FloatField(
        null=True, blank=True, help_text="Percentage progress towards end target")

    # Calculation input fields
    trade_receivables = models.FloatField(
        null=True, blank=True, help_text="Trade Receivables amount")
    total_credit_sales = models.FloatField(null=True,
                                           blank=True,
                                           help_text="Total Credit Sales amount")

    year = models.ForeignKey(YEAR,
                             on_delete=models.CASCADE,
                             null=True,
                             blank=True,
                             help_text="Year for this calculation")
    quarter = models.ForeignKey(Quarter,
                                on_delete=models.CASCADE,
                                null=True,
                                blank=True,
                                help_text="Quarter for this calculation")
    date_created = models.DateTimeField(auto_now_add=True)
    loginUser = models.ForeignKey(settings.AUTH_USER_MODEL,
                                  on_delete=models.CASCADE,
                                  null=True,
                                  blank=True)

    class Meta:
        verbose_name = "Calculate DD"
        verbose_name_plural = "Calculate DD"

    def save(self, *args, **kwargs):
        # Auto-calculate Debtor Days: DD = (Trade Receivables ÷ Total Credit Sales) * 365
        if (self.trade_receivables is not None
                and self.total_credit_sales is not None
                and self.total_credit_sales != 0):
            self.achieved_value = (self.trade_receivables / self.total_credit_sales) * 365
        
        # Calculate progress using KPI-15 formula (reverse calculation)
        if self.achieved_value is not None and self.baseline_value is not None:
            if self.baseline_value != self.End_Target_Value:
                self.progress_from_baseline = ((self.baseline_value - self.achieved_value) / (self.baseline_value - self.End_Target_Value)) * 100
                self.progress_towards_end_target = 100 - self.progress_from_baseline

        super().save(*args, **kwargs)

    def __str__(self):
        return f"DD - {self.achieved_value} days (ID: {self.pk})"

class CalculateAO(models.Model):
    """KPI-17: Audit Opinion Calculation"""
    # KPI tracking fields
    baseline_value = models.FloatField(
        null=True, blank=True, help_text="Baseline value for comparison")
    End_Target_Value = models.FloatField(
        null=True, blank=True, help_text="End target value to achieve")
    achieved_value = models.IntegerField(
        null=True, blank=True, 
        choices=[(0, 'Qualified'), (1, 'Unqualified')],
        help_text="Audit Opinion: 0=Qualified, 1=Unqualified")
    
    # Progress calculation fields
    progress_from_baseline = models.FloatField(
        null=True, blank=True, help_text="Percentage progress from baseline")
    progress_towards_end_target = models.FloatField(
        null=True, blank=True, help_text="Percentage progress towards end target")

    # Audit Opinion input fields
    audit_opinion = models.IntegerField(
        choices=[(0, 'Qualified'), (1, 'Unqualified')],
        help_text="Audit Opinion: 0=Qualified, 1=Unqualified")

    year = models.ForeignKey(YEAR,
                             on_delete=models.CASCADE,
                             null=True,
                             blank=True)
    quarter = models.ForeignKey(Quarter,
                                on_delete=models.CASCADE,
                                null=True,
                                blank=True)
    date_created = models.DateTimeField(auto_now_add=True)
    loginUser = models.ForeignKey(settings.AUTH_USER_MODEL,
                                  on_delete=models.CASCADE,
                                  null=True,
                                  blank=True)

    def save(self, *args, **kwargs):
        # Set achieved_value to the selected audit opinion
        if self.audit_opinion is not None:
            self.achieved_value = self.audit_opinion
        
        # Calculate progress using KPI-17 formula (special case for binary value)
        if self.achieved_value is not None and self.baseline_value is not None:
            if self.baseline_value != self.End_Target_Value:
                self.progress_from_baseline = ((self.achieved_value - self.baseline_value) / (self.End_Target_Value - self.baseline_value)) * 100
                self.progress_towards_end_target = 100 - self.progress_from_baseline

        super().save(*args, **kwargs)

    def __str__(self):
        opinion_text = "Unqualified" if self.achieved_value == 1 else "Qualified"
        return f"AO Calculation - {opinion_text} ({self.year}/{self.quarter})"

    class Meta:
        verbose_name = "Audit Opinion (AO) Calculation"
        verbose_name_plural = "Audit Opinion (AO) Calculations"


class CalculateDER(models.Model):
    """KPI-18: Debt to Equity Ratio Calculation
    Formula: DER = (Total Debt ÷ Total Equity) × 100 (negative values allowed)
    """
    # KPI tracking fields
    baseline_value = models.FloatField(
        null=True, blank=True, help_text="Baseline value for comparison")
    End_Target_Value = models.FloatField(
        null=True, blank=True, help_text="End target value to achieve")
    achieved_value = models.FloatField(null=True,
                                       blank=True,
                                       help_text="Calculated Debt to Equity Ratio")
    
    # Progress calculation fields
    progress_from_baseline = models.FloatField(
        null=True, blank=True, help_text="Percentage progress from baseline")
    progress_towards_end_target = models.FloatField(
        null=True, blank=True, help_text="Percentage progress towards end target")

    # Calculation input fields
    total_debt = models.FloatField(
        null=True, blank=True, help_text="Total Debt")
    total_equity = models.FloatField(
        null=True, blank=True, help_text="Total Equity")

    year = models.ForeignKey(YEAR,
                             on_delete=models.CASCADE,
                             null=True,
                             blank=True)
    quarter = models.ForeignKey(Quarter,
                                on_delete=models.CASCADE,
                                null=True,
                                blank=True)
    date_created = models.DateTimeField(auto_now_add=True)
    loginUser = models.ForeignKey(settings.AUTH_USER_MODEL,
                                  on_delete=models.CASCADE,
                                  null=True,
                                  blank=True)

    def save(self, *args, **kwargs):
        if (self.total_debt is not None
                and self.total_equity is not None
                and self.total_equity != 0):
            self.achieved_value = (float(self.total_debt) /
                                   float(self.total_equity)) * 100
        
        # Calculate progress using KPI-18 formula (reverse calculation)
        if self.achieved_value is not None and self.baseline_value is not None:
            if self.baseline_value != self.End_Target_Value:
                self.progress_from_baseline = ((self.baseline_value - self.achieved_value) / (self.baseline_value - self.End_Target_Value)) * 100
                self.progress_towards_end_target = 100 - self.progress_from_baseline

        super().save(*args, **kwargs)

    def __str__(self):
        return f"DER Calculation - {self.achieved_value} ({self.year}/{self.quarter})"

    class Meta:
        verbose_name = "Debt to Equity Ratio (DER) Calculation"
        verbose_name_plural = "Debt to Equity Ratio (DER) Calculations"


class CalculateCR(models.Model):
    """KPI-19: Current Ratio Calculation"""
    # KPI tracking fields
    baseline_value = models.FloatField(
        null=True, blank=True, help_text="Baseline value for comparison")
    End_Target_Value = models.FloatField(
        null=True, blank=True, help_text="End target value to achieve")
    achieved_value = models.FloatField(null=True,
                                       blank=True,
                                       help_text="Calculated Current Ratio")
    
    # Progress calculation fields
    progress_from_baseline = models.FloatField(
        null=True, blank=True, help_text="Percentage progress from baseline")
    progress_towards_end_target = models.FloatField(
        null=True, blank=True, help_text="Percentage progress towards end target")

    # Calculation input fields
    current_assets = models.FloatField(
        null=True, blank=True, help_text="Current Assets")
    current_liabilities = models.FloatField(
        null=True, blank=True, help_text="Current Liabilities")

    year = models.ForeignKey(YEAR,
                             on_delete=models.CASCADE,
                             null=True,
                             blank=True)
    quarter = models.ForeignKey(Quarter,
                                on_delete=models.CASCADE,
                                null=True,
                                blank=True)
    date_created = models.DateTimeField(auto_now_add=True)
    loginUser = models.ForeignKey(settings.AUTH_USER_MODEL,
                                  on_delete=models.CASCADE,
                                  null=True,
                                  blank=True)

    def save(self, *args, **kwargs):
        if (self.current_assets is not None
                and self.current_liabilities is not None
                and self.current_liabilities > 0):
            self.achieved_value = (float(self.current_assets) /
                                   float(self.current_liabilities))
        
        # Calculate progress using KPI-19 formula
        if self.achieved_value is not None and self.baseline_value is not None:
            if self.baseline_value != 0:
                self.progress_from_baseline = ((self.achieved_value - self.baseline_value) / self.baseline_value) * 100
            
            if self.End_Target_Value is not None and self.End_Target_Value != self.baseline_value:
                self.progress_towards_end_target = ((self.achieved_value - self.baseline_value) / (self.End_Target_Value - self.baseline_value)) * 100

        super().save(*args, **kwargs)

    def __str__(self):
        return f"CR Calculation - {self.achieved_value} ({self.year}/{self.quarter})"

    class Meta:
        verbose_name = "Current Ratio (CR) Calculation"
        verbose_name_plural = "Current Ratio (CR) Calculations"

class CalculatePARI(models.Model):
    """KPI-20: percentage of Audit Recommendations implemented Calculation"""
    # KPI tracking fields
    baseline_value = models.FloatField(
        null=True, blank=True, help_text="Baseline value for comparison")
    End_Target_Value = models.FloatField(
        null=True, blank=True, help_text="End target value to achieve")
    achieved_value = models.FloatField(null=True,
                                       blank=True,
                                       help_text="Calculated Current Ratio")
    
    # Progress calculation fields
    progress_from_baseline = models.FloatField(
        null=True, blank=True, help_text="Percentage progress from baseline")
    progress_towards_end_target = models.FloatField(
        null=True, blank=True, help_text="Percentage progress towards end target")

    # Calculation input fields
    total_number_of_recommendations = models.FloatField(
        null=True, blank=True, help_text="total_number_of_recommendations")
    total_implemented = models.FloatField(
        null=True, blank=True, help_text="total implemented")

    year = models.ForeignKey(YEAR,
                             on_delete=models.CASCADE,
                             null=True,
                             blank=True)
    quarter = models.ForeignKey(Quarter,
                                on_delete=models.CASCADE,
                                null=True,
                                blank=True)
    date_created = models.DateTimeField(auto_now_add=True)
    loginUser = models.ForeignKey(settings.AUTH_USER_MODEL,
                                  on_delete=models.CASCADE,
                                  null=True,
                                  blank=True)

    def save(self, *args, **kwargs):
        # Auto-calculate PARI percentage
        if (self.total_number_of_recommendations is not None
                and self.total_implemented is not None
                and self.total_number_of_recommendations > 0):
            self.achieved_value = (float(self.total_implemented) /
                                   float(self.total_number_of_recommendations)) * 100
        
        # Calculate progress using KPI-20 formula
        if self.achieved_value is not None and self.baseline_value is not None:
            if self.baseline_value != 0:
                self.progress_from_baseline = ((self.achieved_value - self.baseline_value) / self.baseline_value) * 100
            
            if self.End_Target_Value is not None and self.End_Target_Value != self.baseline_value:
                self.progress_towards_end_target = ((self.achieved_value - self.baseline_value) / (self.End_Target_Value - self.baseline_value)) * 100

        super().save(*args, **kwargs)

    def __str__(self):
        return f"PARI Calculation - {self.achieved_value}% ({self.year}/{self.quarter})"

    class Meta:
        verbose_name = "PARI (Percentage Audit Recommendations Implementation) Calculation"
        verbose_name_plural = "PARI (Percentage Audit Recommendations Implementation) Calculations"


class CalculateTSQR(models.Model):
    """KPI-21: Timely Submission of Quarterly Report Calculation"""
    # KPI tracking fields
    baseline_value = models.FloatField(
        null=True, blank=True, help_text="Baseline value for comparison")
    End_Target_Value = models.FloatField(
        null=True, blank=True, help_text="End target value to achieve")
    achieved_value = models.FloatField(null=True,
                                       blank=True,
                                       help_text="Calculated TSQR ratio")
    
    # Progress calculation fields
    progress_from_baseline = models.FloatField(
        null=True, blank=True, help_text="Percentage progress from baseline")
    progress_towards_end_target = models.FloatField(
        null=True, blank=True, help_text="Percentage progress towards end target")

    # Calculation input fields - A = Due Date, B = Actual Date
    due_date = models.IntegerField(
        null=True, blank=True, help_text="Due Date (A) - in days")
    actual_date = models.IntegerField(
        null=True, blank=True, help_text="Actual Date (B) - in days")

    year = models.ForeignKey(YEAR,
                             on_delete=models.CASCADE,
                             null=True,
                             blank=True)
    quarter = models.ForeignKey(Quarter,
                                on_delete=models.CASCADE,
                                null=True,
                                blank=True)
    date_created = models.DateTimeField(auto_now_add=True)
    loginUser = models.ForeignKey(settings.AUTH_USER_MODEL,
                                  on_delete=models.CASCADE,
                                  null=True,
                                  blank=True)

    def save(self, *args, **kwargs):
        # Auto-calculate TSQR = B/A * 100 (Actual Date / Due Date * 100)
        if (self.due_date is not None and self.actual_date is not None and self.due_date > 0):
            self.achieved_value = (float(self.actual_date) / float(self.due_date)) * 100
        
        # Calculate progress using KPI-21 formula (reverse calculation)
        if self.achieved_value is not None and self.baseline_value is not None:
            if self.baseline_value != self.End_Target_Value:
                self.progress_from_baseline = ((self.baseline_value - self.achieved_value) / (self.baseline_value - self.End_Target_Value)) * 100
                self.progress_towards_end_target = 100 - self.progress_from_baseline

        super().save(*args, **kwargs)

    def __str__(self):
        return f"TSQR Calculation - {self.achieved_value}% ({self.year}/{self.quarter})"

    class Meta:
        verbose_name = "Timely Submission of Quarterly Report (TSQR) Calculation"
        verbose_name_plural = "Timely Submission of Quarterly Report (TSQR) Calculations"


class CalculateIMPORTS(models.Model):
    """Imports (MW) Calculation Model
    Formula: Imports (MW) = End_Target_Value * add_value
    """
    # KPI tracking fields
    baseline_value = models.FloatField(
        null=True, blank=True, help_text="Baseline value for comparison")
    End_Target_Value = models.FloatField(
        null=True, blank=True, help_text="End target value from database")
    achieved_value = models.FloatField(null=True,
                                       blank=True,
                                       help_text="Calculated imports value in MW")
    
    # Progress calculation fields
    progress_from_baseline = models.FloatField(
        null=True, blank=True, help_text="Percentage progress from baseline")
    progress_towards_end_target = models.FloatField(
        null=True, blank=True, help_text="Percentage progress towards end target")

    # Calculation input fields
    add_value = models.FloatField(
        null=True,
        blank=True,
        help_text="Multiplier value for imports calculation")

    year = models.ForeignKey(YEAR,
                             on_delete=models.CASCADE,
                             null=True,
                             blank=True)
    quarter = models.ForeignKey(Quarter,
                                on_delete=models.CASCADE,
                                null=True,
                                blank=True)
    date_created = models.DateTimeField(auto_now_add=True)
    loginUser = models.ForeignKey(settings.AUTH_USER_MODEL,
                                  on_delete=models.CASCADE,
                                  null=True,
                                  blank=True)

    def save(self, *args, **kwargs):
        # Auto-calculate Imports (MW) = End_Target_Value * add_value
        if self.End_Target_Value is not None and self.add_value is not None:
            self.achieved_value = float(self.End_Target_Value) * float(self.add_value)
        
        # Calculate progress using standard KPI formula
        if self.achieved_value is not None and self.baseline_value is not None:
            if self.baseline_value != 0:
                self.progress_from_baseline = ((self.achieved_value - self.baseline_value) / self.baseline_value) * 100
            
            if self.End_Target_Value is not None and self.End_Target_Value != self.baseline_value:
                self.progress_towards_end_target = ((self.achieved_value - self.baseline_value) / (self.End_Target_Value - self.baseline_value)) * 100

        super().save(*args, **kwargs)

    def __str__(self):
        return f"Imports (MW) Calculation - {self.achieved_value} MW ({self.year}/{self.quarter})"

    class Meta:
        verbose_name = "Imports (MW) Calculation"
        verbose_name_plural = "Imports (MW) Calculations"


class CalculateIPP(models.Model):
    """Independent Power Plants (MW) Calculation Model
    Formula: Independent Power Plants (MW) = End_Target_Value * add_value
    """
    # KPI tracking fields
    baseline_value = models.FloatField(
        null=True, blank=True, help_text="Baseline value for comparison")
    End_Target_Value = models.FloatField(
        null=True, blank=True, help_text="End target value from database")
    achieved_value = models.FloatField(null=True,
                                       blank=True,
                                       help_text="Calculated Independent Power Plants value in MW")
    
    # Progress calculation fields
    progress_from_baseline = models.FloatField(
        null=True, blank=True, help_text="Percentage progress from baseline")
    progress_towards_end_target = models.FloatField(
        null=True, blank=True, help_text="Percentage progress towards end target")

    # Calculation input fields
    add_value = models.FloatField(
        null=True,
        blank=True,
        help_text="Multiplier value for Independent Power Plants calculation")

    year = models.ForeignKey(YEAR,
                             on_delete=models.CASCADE,
                             null=True,
                             blank=True)
    quarter = models.ForeignKey(Quarter,
                                on_delete=models.CASCADE,
                                null=True,
                                blank=True)
    date_created = models.DateTimeField(auto_now_add=True)
    loginUser = models.ForeignKey(settings.AUTH_USER_MODEL,
                                  on_delete=models.CASCADE,
                                  null=True,
                                  blank=True)

    def save(self, *args, **kwargs):
        # Auto-calculate Independent Power Plants (MW) = End_Target_Value * add_value
        if self.End_Target_Value is not None and self.add_value is not None:
            self.achieved_value = float(self.End_Target_Value) * float(self.add_value)
        
        # Calculate progress using standard KPI formula
        if self.achieved_value is not None and self.baseline_value is not None:
            if self.baseline_value != 0:
                self.progress_from_baseline = ((self.achieved_value - self.baseline_value) / self.baseline_value) * 100
            
            if self.End_Target_Value is not None and self.End_Target_Value != self.baseline_value:
                self.progress_towards_end_target = ((self.achieved_value - self.baseline_value) / (self.End_Target_Value - self.baseline_value)) * 100

        super().save(*args, **kwargs)

    def __str__(self):
        return f"Independent Power Plants (MW) Calculation - {self.achieved_value} MW ({self.year}/{self.quarter})"

    class Meta:
        verbose_name = "Independent Power Plants (MW) Calculation"
        verbose_name_plural = "Independent Power Plants (MW) Calculations"
