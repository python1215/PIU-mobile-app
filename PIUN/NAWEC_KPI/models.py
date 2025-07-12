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

    # Calculation input fields
    net_profit_after_tax = models.FloatField(
        null=True, blank=True, help_text="Net profit after tax amount")
    total_assets = models.FloatField(null=True,
                                     blank=True,
                                     help_text="Total assets amount")

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

    # Calculation input fields
    total_revenues_turnover = models.FloatField(
        null=True, blank=True, help_text="Total revenue/turnover amount")
    netprofit = models.FloatField(null=True,
                                  blank=True,
                                  help_text="Total expenses amount")

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

    # Calculation input fields
    net_operating_income = models.FloatField(
        null=True, blank=True, help_text="Net operating income amount")
    total_debt_service = models.FloatField(
        null=True, blank=True, help_text="Total debt service amount")
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

        super().save(*args, **kwargs)

    def __str__(self):
        return f"DSCR - {self.achieved_value} (ID: {self.pk})"

    class Meta:
        verbose_name = "Calculate DSCR"
        verbose_name_plural = "Calculate DSCR"


class CalculateMWh(models.Model):
    """KPI-04: Energy Generation Calculation Model
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

        super().save(*args, **kwargs)

    def __str__(self):
        return f"MWh Calculation - {self.achieved_value} MWh ({self.year}/{self.quarter})"

    class Meta:
        verbose_name = "Energy Generation (MWh) Calculation"
        verbose_name_plural = "Energy Generation (MWh) Calculations"


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

        super().save(*args, **kwargs)

    def __str__(self):
        return f"GAF Calculation - {self.achieved_value}% ({self.year}/{self.quarter})"

    class Meta:
        verbose_name = "Generation Availability Factor (GAF) Calculation"
        verbose_name_plural = "Generation Availability Factor (GAF) Calculations"


class CalculateTDE(models.Model):
    """KPI-06: Training Days per Employee Calculation Model
    Formula: TDE = total_training_days_conducted / total_number_of_employees
    """
    # KPI tracking fields
    baseline_value = models.FloatField(
        null=True, blank=True, help_text="Baseline value for comparison")
    End_Target_Value = models.FloatField(
        null=True, blank=True, help_text="End target value to achieve")
    achieved_value = models.FloatField(null=True,
                                       blank=True,
                                       help_text="Calculated result")

    # Calculation input fields
    total_training_days_conducted = models.FloatField(
        null=True, blank=True, help_text="Total training days conducted")
    total_number_of_employees = models.FloatField(
        null=True, blank=True, help_text="Total number of employees")

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
        # Auto-calculate TDE
        if (self.total_training_days_conducted is not None
                and self.total_number_of_employees is not None
                and self.total_number_of_employees > 0):
            self.achieved_value = float(
                self.total_training_days_conducted) / float(
                    self.total_number_of_employees)

        super().save(*args, **kwargs)

    def __str__(self):
        return f"TDE Calculation - {self.achieved_value} days/employee ({self.year}/{self.quarter})"

    class Meta:
        verbose_name = "Training Days per Employee (TDE) Calculation"
        verbose_name_plural = "Training Days per Employee (TDE) Calculations"


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

    # Calculation input fields
    billing_efficiency = models.FloatField(
        null=True,
        blank=True,
        help_text="Billing efficiency as percentage (0-100)")
    collection_efficiency = models.FloatField(
        null=True,
        blank=True,
        help_text="Collection efficiency as percentage (0-100)")

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

        super().save(*args, **kwargs)

    def __str__(self):
        return f"TTP Calculation - {self.achieved_value} ({self.year}/{self.quarter})"

    class Meta:
        verbose_name = "Timely Tax Payment (TTP) Calculation"
        verbose_name_plural = "Timely Tax Payment (TTP) Calculations"


class CalculateWQCC(models.Model):
    """KPI-12: Water Quality Compliance Bacteriological calculation"""
    # KPI tracking fields
    baseline_value = models.FloatField(
        null=True, blank=True, help_text="Baseline value for comparison")
    End_Target_Value = models.FloatField(
        null=True, blank=True, help_text="End target value to achieve")
    achieved_value = models.FloatField(null=True,
                                       blank=True,
                                       help_text="achieved_value")

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

        super().save(*args, **kwargs)

    def __str__(self):
        return f"NRW Calculation - {self.achieved_value}% ({self.year}/{self.quarter})"

    class Meta:
        verbose_name = "Non-Revenue Water (NRW) Calculation"
        verbose_name_plural = "Non-Revenue Water (NRW) Calculations"


class CalculateDD(models.Model):
    """Model for Debtor Days calculation (KPI-15)"""
    # KPI tracking fields
    baseline_value = models.FloatField(
        null=True, blank=True, help_text="Baseline value for comparison")
    End_Target_Value = models.FloatField(
        null=True, blank=True, help_text="End target value to achieve")
    achieved_value = models.FloatField(null=True,
                                       blank=True,
                                       help_text="achieved_value")

    # Calculation input fields
    trade_receivables = models.FloatField(
        null=True, blank=True, help_text="Total revenue/turnover amount")
    total_credit_sales = models.FloatField(null=True,
                                           blank=True,
                                           help_text="Total expenses amount")

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
        # Auto-calculate Debtor Days
        if (self.trade_receivables is not None
                and self.total_credit_sales is not None
                and self.total_credit_sales != 0):
            self.achieved_value = (self.trade_receivables / self.total_credit_sales)

        super().save(*args, **kwargs)

    def __str__(self):
        return f"DD - {self.achieved_value} GMD (ID: {self.pk})"

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

        super().save(*args, **kwargs)

    def __str__(self):
        opinion_text = "Unqualified" if self.achieved_value == 1 else "Qualified"
        return f"AO Calculation - {opinion_text} ({self.year}/{self.quarter})"

    class Meta:
        verbose_name = "Audit Opinion (AO) Calculation"
        verbose_name_plural = "Audit Opinion (AO) Calculations"


class CalculateDER(models.Model):
    """KPI-18: Debt to Equity Ratio Calculation"""
    # KPI tracking fields
    baseline_value = models.FloatField(
        null=True, blank=True, help_text="Baseline value for comparison")
    End_Target_Value = models.FloatField(
        null=True, blank=True, help_text="End target value to achieve")
    achieved_value = models.FloatField(null=True,
                                       blank=True,
                                       help_text="Calculated Debt to Equity Ratio")

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
                and self.total_equity > 0):
            self.achieved_value = (float(self.total_debt) /
                                   float(self.total_equity))

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

        super().save(*args, **kwargs)

    def __str__(self):
        return f"CR Calculation - {self.achieved_value} ({self.year}/{self.quarter})"

    class Meta:
        verbose_name = "Current Ratio (CR) Calculation"
        verbose_name_plural = "Current Ratio (CR) Calculations"
