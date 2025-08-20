from django.db import models
import os
from setup.models import (DecisionOutcome, Districts, NatureOfSettlement, PAPCategory, Quarter,
    Regions, response, Settlement, TypeOfImpact, TypeOfInvestment, TypeOfPAP,
    TypeOfStakeholderEngagement, VulnerabilityCategory, Ward, YEAR)
from PIU_Financial_mgt.models import Project, KPI_For_Contract
from django.conf import settings
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator


# Create your models here

# To be used by different models
GENDER = [
    ("M", "Male"),
    ("F", "Female")
]

# Saving the image path to the database and image on the folder
def image_upload_path(instance, filename):
    # Name of the folder to store the image(model name)
    imgfolder = str(instance.__class__.__name__).replace(" ", "_")
    return os.path.join("images", imgfolder, filename)

# Document upload path for PAP documents
def pap_document_upload_path(instance, filename):
    return os.path.join("documents", "pap", instance.pap.pap_identification_number, filename)


# ESIA form : Environmental And Social Impact Assessment
class ESIA(models.Model):
    esiaID = models.AutoField(primary_key=True)
    project_name = models.ForeignKey(
        Project, 
        on_delete=models.CASCADE, 
        related_name="esia_entries",
        db_index=True
    )
    type_of_investment = models.ForeignKey(
        KPI_For_Contract, 
        on_delete=models.CASCADE,
        db_index=True
    )
    project_duration = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(120)],
        help_text="Duration in months (1-120)"
    )
    project_phase = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        help_text="Phase number (1-10)"
    )
    project_locations = models.CharField(
        max_length=200,
        help_text="Comma-separated list of project locations"
    )
    number_of_communities = models.PositiveIntegerField(
        validators=[MinValueValidator(1)],
        help_text="Number of communities affected"
    )
    esia_findings = models.TextField(
        help_text="Detailed findings of the ESIA study"
    )
    date_created = models.DateTimeField(auto_now_add=True, db_index=True)
    loginUser = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        db_index=True
    )

    class Meta:
        verbose_name = "ESIA"
        verbose_name_plural = "ESIA"
        ordering = ['-date_created']
        indexes = [
            models.Index(fields=['project_name', 'type_of_investment']),
            models.Index(fields=['date_created', 'loginUser']),
            models.Index(fields=['project_phase', 'number_of_communities']),
        ]

    def __str__(self):
        return f"ESIA-{self.esiaID} - {self.project_name}"

    def get_absolute_url(self):
        from django.urls import reverse
        return reverse('esia_detail', kwargs={'pk': self.esiaID})


# PAP Monitoring FORM (PAP = People Affected By Project)
class PAP(models.Model):
    # Yes and no choices
    YesOrNo = [
        ("Y", "Yes"),
        ("N", "No")
    ]

    project = models.ForeignKey(
        Project, 
        on_delete=models.CASCADE,
        db_index=True
    )
    type_of_investment = models.ForeignKey(
        KPI_For_Contract, 
        on_delete=models.CASCADE,
        db_index=True
    )
    pap_identification_number = models.CharField(
        max_length=15, 
        primary_key=True, 
        verbose_name="PAP ID"
    )
    type_of_pap = models.ForeignKey(
        TypeOfPAP, 
        on_delete=models.CASCADE,
        db_index=True
    )
    region = models.ForeignKey(
        Regions, 
        on_delete=models.CASCADE,
        db_index=True
    )
    district = models.ForeignKey(
        Districts, 
        on_delete=models.CASCADE,
        db_index=True
    )
    pap_name = models.CharField(max_length=150)
    sex = models.CharField(max_length=1, choices=GENDER, db_index=True)
    pap_category = models.ForeignKey(
        PAPCategory, 
        on_delete=models.CASCADE,
        db_index=True
    )
    pap_Current_Address = models.ForeignKey(
        Settlement, 
        on_delete=models.CASCADE,
        db_index=True
    )
    vulnerability_category = models.ForeignKey(
        VulnerabilityCategory, 
        on_delete=models.CASCADE,
        db_index=True
    )
    location_of_impact = models.CharField(max_length=200)
    type_of_impact = models.ForeignKey(
        TypeOfImpact, 
        on_delete=models.CASCADE,
        db_index=True
    )
    nature_of_compensation = models.ForeignKey(
        NatureOfSettlement, 
        on_delete=models.CASCADE
    )
    amount = models.DecimalField(
        decimal_places=2, 
        max_digits=12,
        validators=[MinValueValidator(0)]
    )
    area = models.CharField(max_length=20, help_text="Area affected (in hectares)")
    pap_compensated = models.CharField(
        max_length=1, 
        choices=YesOrNo,
        db_index=True
    )
    compensation_date = models.DateField(null=True, blank=True, db_index=True)
    compensation_RefNo = models.CharField(max_length=30, blank=True)
    pre_project_situation = models.TextField(
        verbose_name="Pre-project situation",
        help_text="Describe the situation before project implementation"
    )
    remarks = models.TextField(blank=True)
    date_created = models.DateTimeField(auto_now_add=True, db_index=True)
    loginUser = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        db_index=True
    )

    class Meta:
        verbose_name = "PAP"
        verbose_name_plural = "PAP"
        ordering = ['-date_created']
        indexes = [
            models.Index(fields=['project', 'type_of_investment']),
            models.Index(fields=['region', 'district', 'pap_Current_Address']),
            models.Index(fields=['pap_compensated', 'compensation_date']),
            models.Index(fields=['sex', 'vulnerability_category']),
            models.Index(fields=['type_of_pap', 'pap_category']),
        ]

    def __str__(self):
        return f"{self.pap_identification_number} - {self.pap_name}"

    @property
    def compensation_status(self):
        return "Compensated" if self.pap_compensated == "Y" else "Not Compensated"


# PAP Document Model for multiple document uploads (title deeds, etc.)
class PAPDocument(models.Model):
    pap = models.ForeignKey(
        PAP, 
        on_delete=models.CASCADE, 
        related_name='documents',
        db_index=True
    )
    document_type = models.CharField(
        max_length=50,
        choices=[
            ('title_deed', 'Title Deed'),
            ('id_document', 'ID Document'),
            ('compensation_agreement', 'Compensation Agreement'),
            ('valuation_report', 'Valuation Report'),
            ('other', 'Other Document')
        ],
        default='title_deed',
        db_index=True
    )
    document_file = models.FileField(
        upload_to=pap_document_upload_path,
        help_text="Upload document (PDF, DOC, DOCX, JPG, PNG - Max 10MB)"
    )
    document_name = models.CharField(
        max_length=200,
        help_text="Document description or name"
    )
    upload_date = models.DateTimeField(auto_now_add=True, db_index=True)
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        db_index=True
    )

    class Meta:
        verbose_name = "PAP Document"
        verbose_name_plural = "PAP Documents"
        ordering = ['-upload_date']
        indexes = [
            models.Index(fields=['pap', 'document_type']),
            models.Index(fields=['upload_date', 'uploaded_by']),
        ]

    def __str__(self):
        return f"{self.pap.pap_identification_number} - {self.document_name} ({self.get_document_type_display()})"

    @property
    def file_size_mb(self):
        """Return file size in MB"""
        if self.document_file:
            return round(self.document_file.size / (1024 * 1024), 2)
        return 0

    def get_file_extension(self):
        """Get file extension"""
        if self.document_file:
            return os.path.splitext(self.document_file.name)[1].lower()
        return ""


# Grievance Form
class GrievianceMonitoringLog(models.Model):
    YesOrNo = [
        ("Y", "Yes"),
        ("N", "No")
    ]

    Communication_method = [
        ("Call", "Phone Call"),
        ("Email", "Email"),
        ("Letter", "Letter"),
        ("In Person", "In Person"),
        ("SMS", "SMS"),
        ("WhatsApp", "WhatsApp"),
    ]

    project = models.ForeignKey(
        Project, 
        on_delete=models.CASCADE,
        db_index=True
    )
    type_of_investment = models.ForeignKey(
        KPI_For_Contract, 
        on_delete=models.CASCADE,
        db_index=True
    )
    case_no = models.CharField(primary_key=True, max_length=15)
    sex = models.CharField(
        max_length=1, 
        choices=GENDER, 
        null=True, 
        blank=True,
        db_index=True
    )
    date_claim_recieved = models.DateField(db_index=True)
    name_of_person_receiving_complaint = models.CharField(max_length=150)
    how_complaint_was_received = models.CharField(
        max_length=20, 
        choices=Communication_method,
        db_index=True
    )
    name_of_complainant = models.CharField(max_length=150)
    tell_no = models.CharField(max_length=20, help_text="Phone number")
    complaint_content = models.TextField()
    was_recieved_of_complaint_ack = models.CharField(
        max_length=1, 
        choices=YesOrNo,
        db_index=True,
        verbose_name="Complaint acknowledgment received"
    )
    expected_decision_date = models.DateField(db_index=True)
    decision_outcome = models.ForeignKey(
        DecisionOutcome, 
        on_delete=models.CASCADE,
        db_index=True
    )
    was_decison_communicated_to_complainant = models.CharField(
        max_length=1, 
        choices=YesOrNo,
        db_index=True,
        verbose_name="Decision communicated to complainant"
    )
    communication_method = models.CharField(
        max_length=20, 
        choices=Communication_method,
        db_index=True
    )
    was_complainant_satisfied_with_decision = models.CharField(
        max_length=1, 
        choices=YesOrNo,
        db_index=True,
        verbose_name="Complainant satisfied with decision"
    )
    brief_note_for_NO_answer = models.TextField(
        blank=True,
        verbose_name="Explanation if not satisfied"
    )
    any_follow_up_action = models.TextField(
        verbose_name='Follow-up Actions',
        blank=True
    )
    date_created = models.DateTimeField(auto_now_add=True, db_index=True)
    loginUser = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        db_index=True
    )

    class Meta:
        verbose_name = "Grievance Case"
        verbose_name_plural = "Grievance Cases"
        ordering = ['-date_claim_recieved', '-date_created']
        indexes = [
            models.Index(fields=['project', 'type_of_investment']),
            models.Index(fields=['decision_outcome', 'communication_method']),
            models.Index(fields=['sex', 'how_complaint_was_received']),
            models.Index(fields=['date_claim_recieved', 'expected_decision_date']),
            models.Index(fields=['was_complainant_satisfied_with_decision']),
        ]

    def __str__(self):
        return f"Case {self.case_no} - {self.name_of_complainant}"

    @property
    def days_to_resolution(self):
        from django.utils import timezone
        if self.expected_decision_date:
            delta = self.expected_decision_date - self.date_claim_recieved
            return delta.days
        return None


# OHS Monitoring Form : Occupational health and Safety
class OHS_Monitoring(models.Model):
    ohs_Id = models.AutoField(primary_key=True)
    project = models.ForeignKey(
        Project, 
        on_delete=models.CASCADE, 
        verbose_name='Project',
        db_index=True
    )
    Type_of_Investment = models.ForeignKey(
        KPI_For_Contract, 
        on_delete=models.CASCADE, 
        related_name='ohs_investments',
        db_index=True
    )
    year_of_report = models.ForeignKey(
        YEAR, 
        on_delete=models.CASCADE,
        db_index=True
    )
    quarter = models.ForeignKey(
        Quarter, 
        on_delete=models.CASCADE, 
        verbose_name="Report Frequency",
        db_index=True
    )
    date = models.DateField(verbose_name="Monitoring Date", db_index=True)
    region = models.ForeignKey(
        Regions, 
        on_delete=models.CASCADE,
        db_index=True
    )
    district = models.ForeignKey(
        Districts, 
        on_delete=models.CASCADE,
        db_index=True
    )
    settlement = models.ForeignKey(
        Settlement,
        to_field='settlement_code',
        db_column='settlement_id',
        on_delete=models.CASCADE,
        db_index=True
    )
    quality_at_entry_requirement = models.TextField(
        help_text="Staffing, training, medicals, code of conduct, contracts"
    )
    working_environment = models.TextField()
    remarks = models.TextField(
        verbose_name='Issues or Remarks', 
        blank=True,
        default=''
    )
    male = models.PositiveIntegerField(
        validators=[MinValueValidator(0)],
        help_text="Number of male workers"
    )
    female = models.PositiveIntegerField(
        validators=[MinValueValidator(0)],
        help_text="Number of female workers"
    )
    youth_male = models.PositiveIntegerField(
        verbose_name='Male Youths',
        validators=[MinValueValidator(0)]
    )
    youth_female = models.PositiveIntegerField(
        verbose_name='Female Youths',
        validators=[MinValueValidator(0)]
    )
    Kpi_description = models.ForeignKey(
        KPI_For_Contract, 
        on_delete=models.CASCADE, 
        related_name='ohs_kpi_descriptions'
    )
    picture = models.ImageField(
        null=True, 
        blank=True, 
        upload_to=image_upload_path,
        verbose_name='Picture',
        help_text="Upload monitoring photos"
    )
    date_created = models.DateTimeField(auto_now_add=True, db_index=True)
    loginUser = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        db_index=True
    )

    class Meta:
        verbose_name = 'OHS Monitoring'
        verbose_name_plural = 'OHS Monitoring'
        ordering = ['-date', '-date_created']
        indexes = [
            models.Index(fields=['project', 'Type_of_Investment']),
            models.Index(fields=['year_of_report', 'quarter']),
            models.Index(fields=['region', 'district', 'settlement']),
            models.Index(fields=['date', 'loginUser']),
        ]

    def __str__(self):
        return f"OHS-{self.ohs_Id} - {self.project} ({self.date})"

    def get_picture_url(self):
        if self.picture:
            return self.picture.url
        return None

    @property
    def total_workers(self):
        return self.male + self.female

    @property
    def total_youth(self):
        return self.youth_male + self.youth_female


# Community Consultation and Engagement
class CommunityConsult_Engagement(models.Model):
    project_name = models.ForeignKey(
        Project, 
        on_delete=models.CASCADE, 
        verbose_name='Name of Project',
        db_index=True
    )
    reference_number = models.CharField(
        primary_key=True, 
        max_length=15,
        unique=True,
        help_text="Unique reference number for this engagement"
    )
    year = models.ForeignKey(
        YEAR, 
        on_delete=models.CASCADE,
        db_index=True
    )
    place_of_event = models.CharField(
        max_length=100,
        help_text="Location where engagement took place"
    )
    date_of_consultation = models.DateField(db_index=True)
    male = models.PositiveIntegerField(
        validators=[MinValueValidator(0)],
        help_text="Number of male participants"
    )
    female = models.PositiveIntegerField(
        validators=[MinValueValidator(0)],
        help_text="Number of female participants"
    )
    total_participants = models.PositiveIntegerField(
        validators=[MinValueValidator(0)]
    )
    stake_holder_engagement_Types = models.ForeignKey(
        TypeOfStakeholderEngagement, 
        on_delete=models.CASCADE,
        db_index=True
    )
    key_issues_discussed = models.TextField()
    any_follow_up_actions = models.TextField(blank=True)
    picture = models.ImageField(
        null=True, 
        blank=True, 
        upload_to='images/communityConsultation',
        verbose_name='Picture',
        help_text="Upload engagement photos"
    )
    date_created = models.DateTimeField(auto_now_add=True, db_index=True)
    loginUser = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        db_index=True
    )

    class Meta:
        verbose_name = 'Community Engagement/Consultation'
        verbose_name_plural = 'Community Engagement/Consultations'
        ordering = ['-date_of_consultation', '-date_created']
        indexes = [
            models.Index(fields=['project_name', 'year']),
            models.Index(fields=['stake_holder_engagement_Types']),
            models.Index(fields=['date_of_consultation', 'place_of_event']),
            models.Index(fields=['male', 'female', 'total_participants']),
        ]

    def __str__(self):
        return f"{self.reference_number} - {self.place_of_event} ({self.date_of_consultation})"

    def get_picture_url(self):
        if self.picture:
            return self.picture.url
        return None

    def clean(self):
        from django.core.exceptions import ValidationError
        if self.male + self.female != self.total_participants:
            raise ValidationError(
                "Total participants must equal the sum of male and female participants"
            )

    @property
    def female_percentage(self):
        if self.total_participants > 0:
            return round((self.female / self.total_participants) * 100, 1)
        return 0


def get_kpi_description(id_kpi_description):
    try:
        kpis = KPI_For_Contract.objects.filter(
            monitoring_type_code=id_kpi_description
        ).values_list('kpi_description', flat=True)
        return list(kpis)
    except KPI_For_Contract.DoesNotExist:
        return []