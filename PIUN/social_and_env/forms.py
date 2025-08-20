from django import forms
from django.urls import reverse_lazy
from django.core.exceptions import ValidationError
from .models import ESIA, PAP, PAPDocument, GrievianceMonitoringLog, OHS_Monitoring, CommunityConsult_Engagement
from setup.models import (
    Regions, Districts, Settlement, TypeOfPAP, 
    PAPCategory, VulnerabilityCategory, TypeOfImpact, NatureOfSettlement,
    DecisionOutcome, TypeOfStakeholderEngagement, YEAR, Quarter
)
from PIU_Financial_mgt.models import KPI_For_Contract
from PIU_Financial_mgt.models import Project


class ESIAForm(forms.ModelForm):
    project_name = forms.ModelChoiceField(
        queryset=Project.objects.all(),
        empty_label="Select Project",
        widget=forms.Select(attrs={"class": "form-select"})
    )

    type_of_investment = forms.ModelChoiceField(
        queryset=KPI_For_Contract.objects.none(),
        empty_label="Select Investment Type",
        widget=forms.Select(attrs={"class": "form-select"}),
        required=False,
        to_field_name='monitoring_Type_Code'
    )

    class Meta:
        model = ESIA
        fields = [
            'project_name', 'type_of_investment', 'project_duration',
            'project_phase', 'project_locations', 'number_of_communities',
            'esia_findings'
        ]
        widgets = {
            'project_duration': forms.NumberInput(attrs={
                'class': 'form-control',
                'min': '1',
                'max': '120',
                'placeholder': 'Duration in months'
            }),
            'project_phase': forms.NumberInput(attrs={
                'class': 'form-control',
                'min': '1',
                'max': '10',
                'placeholder': 'Phase number'
            }),
            'project_locations': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter project locations (comma-separated)'
            }),
            'number_of_communities': forms.NumberInput(attrs={
                'class': 'form-control',
                'min': '1',
                'placeholder': 'Number of communities'
            }),
            'esia_findings': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 4,
                'placeholder': 'Enter detailed ESIA findings...'
            }),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        # Set up dynamic querysets for investment types
        if 'project_name' in self.data:
            try:
                project_id = int(self.data.get('project_name'))
                self.fields['type_of_investment'].queryset = KPI_For_Contract.objects.filter(
                    project_id=project_id,
                    monitoring_type_id='ESS'
                )
            except (ValueError, TypeError):
                pass
                pass
        
        # Make required fields (except cascading dropdowns)
        for field_name, field in self.fields.items():
            if field_name not in ['type_of_investment']:
                field.required = True



    def clean_type_of_investment(self):
        """Custom validation for type_of_investment field"""
        type_of_investment = self.cleaned_data.get('type_of_investment')
        
        # If no investment type selected, try to find a default
        if not type_of_investment:
            project_name = self.cleaned_data.get('project_name')
            if project_name:
                from PIU_Financial_mgt.models import KPI_For_Contract
                first_investment = KPI_For_Contract.objects.filter(project=project_name).first()
                if first_investment:
                    return first_investment
        
        return type_of_investment

    def clean(self):
        """Override clean method to handle validation"""
        cleaned_data = super().clean()
        project_duration = cleaned_data.get('project_duration')
        project_phase = cleaned_data.get('project_phase')
        
        # Basic validation logic
        if project_duration and (project_duration < 1 or project_duration > 120):
            self.add_error('project_duration', 'Project duration must be between 1 and 120 months.')
            
        if project_phase and (project_phase < 1 or project_phase > 10):
            self.add_error('project_phase', 'Project phase must be between 1 and 10.')
            
        return cleaned_data


class PAPForm(forms.ModelForm):
    project = forms.ModelChoiceField(
        queryset=Project.objects.all(),
        empty_label="Select Project",
        widget=forms.Select(attrs={
            "class": "form-select",
            "hx-get": "/social_and_env/ajax/load-investment-types-pap/",
            "hx-target": "#id_type_of_investment",
            "hx-trigger": "change",
            "hx-include": "this"
        })
    )

    type_of_investment = forms.CharField(
        widget=forms.Select(attrs={"class": "form-select"}),
        required=False
    )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        # Initialize CharField select fields with proper options
        self.fields['type_of_investment'].widget.choices = [('', 'Select Investment Type')]
        self.fields['district'].widget.choices = [('', 'Select District')]  
        self.fields['pap_Current_Address'].widget.choices = [('', 'Select Settlement')]
        
        # Set non-required fields
        self.fields['area'].required = False
        self.fields['compensation_RefNo'].required = False
        self.fields['compensation_date'].required = False



    region = forms.ModelChoiceField(
        queryset=Regions.objects.all(),
        empty_label="Select Region",
        widget=forms.Select(attrs={
            "class": "form-select",
            "hx-get": "/social_and_env/ajax/load-districts/",
            "hx-target": "#id_district",
            "hx-trigger": "change",
            "hx-include": "this"
        })
    )

    district = forms.CharField(
        widget=forms.Select(attrs={
            "class": "form-select",
            "hx-get": "/social_and_env/ajax/load-settlements/",
            "hx-target": "#id_pap_Current_Address",
            "hx-trigger": "change",
            "hx-include": "this"
        }),
        required=False
    )

    pap_Current_Address = forms.CharField(
        widget=forms.Select(attrs={"class": "form-select"}),
        required=False
    )

    class Meta:
        model = PAP
        # Exclude the CharField cascading dropdown fields from automatic processing
        exclude = ['type_of_investment', 'district', 'pap_Current_Address']
        fields = [
            'project', 'pap_identification_number',
            'type_of_pap', 'region', 'pap_name', 'sex',
            'pap_category', 'vulnerability_category',
            'location_of_impact', 'type_of_impact', 'nature_of_compensation',
            'amount', 'area', 'pap_compensated', 'compensation_date',
            'compensation_RefNo', 'pre_project_situation', 'remarks'
        ]
        widgets = {
            'pap_identification_number': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter unique PAP ID'
            }),
            'pap_name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter full name'
            }),
            'sex': forms.Select(attrs={'class': 'form-select'}),
            'type_of_pap': forms.Select(attrs={'class': 'form-select'}),
            'pap_category': forms.Select(attrs={'class': 'form-select'}),
            'vulnerability_category': forms.Select(attrs={'class': 'form-select'}),
            'location_of_impact': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Describe impact location'
            }),
            'type_of_impact': forms.Select(attrs={'class': 'form-select'}),
            'nature_of_compensation': forms.Select(attrs={'class': 'form-select'}),
            'amount': forms.NumberInput(attrs={
                'class': 'form-control',
                'step': '0.01',
                'min': '0',
                'placeholder': 'Compensation amount'
            }),
            'area': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Area in hectares'
            }),
            'pap_compensated': forms.Select(attrs={'class': 'form-select'}),
            'compensation_date': forms.DateInput(attrs={
                'class': 'form-control',
                'type': 'date'
            }),
            'compensation_RefNo': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Reference number'
            }),
            'pre_project_situation': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 3,
                'placeholder': 'Describe pre-project situation...'
            }),
            'remarks': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 2,
                'placeholder': 'Additional remarks...'
            }),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        # Set up dynamic querysets based on form data
        if 'project' in self.data and self.data.get('project'):
            try:
                project_id = int(self.data.get('project'))
                self.fields['type_of_investment'].queryset = KPI_For_Contract.objects.filter(
                    project_id=project_id
                )
            except (ValueError, TypeError):
                # Reset to empty queryset if invalid project_id
                self.fields['type_of_investment'].queryset = KPI_For_Contract.objects.none()
        elif self.instance and self.instance.pk and self.instance.project:
            # For editing existing PAP records, populate investment types for the selected project
            self.fields['type_of_investment'].queryset = KPI_For_Contract.objects.filter(
                project=self.instance.project
            )
        else:
            # For fresh forms or invalid data, reset to empty
            self.fields['type_of_investment'].queryset = KPI_For_Contract.objects.none()
        
        if 'region' in self.data and self.data.get('region'):
            try:
                region_id = int(self.data.get('region'))
                self.fields['district'].queryset = Districts.objects.filter(
                    region_code_id=region_id
                )
            except (ValueError, TypeError):
                self.fields['district'].queryset = Districts.objects.none()
        else:
            self.fields['district'].queryset = Districts.objects.none()
        
        if 'district' in self.data and self.data.get('district'):
            try:
                district_id = int(self.data.get('district'))
                self.fields['pap_Current_Address'].queryset = Settlement.objects.filter(
                    district_code_id=district_id
                )
            except (ValueError, TypeError):
                self.fields['pap_Current_Address'].queryset = Settlement.objects.none()
        else:
            self.fields['pap_Current_Address'].queryset = Settlement.objects.none()
        
        # Make cascading dropdown fields not required to avoid validation errors
        self.fields['type_of_investment'].required = False
        self.fields['district'].required = False  
        self.fields['pap_Current_Address'].required = False
        self.fields['area'].required = False
        self.fields['compensation_RefNo'].required = False
        self.fields['compensation_date'].required = False
        
        # Allow empty choice validation for cascading fields
        self.fields['type_of_investment'].empty_label = "Select Investment Type"
        self.fields['district'].empty_label = "Select District" 
        self.fields['pap_Current_Address'].empty_label = "Select Settlement"
    
    def clean_type_of_investment(self):
        """Custom validation for type_of_investment field"""
        type_of_investment = self.cleaned_data.get('type_of_investment')
        
        # Always return the value as-is for cascading dropdown fields
        # Let the view handle defaults if needed
        return type_of_investment
    
    def clean(self):
        cleaned_data = super().clean()
        
        # Don't perform cascading dropdown validation here
        # Let the view handle defaults and validation
        # This prevents "Select a valid choice" errors for cascading fields
        
        # Ensure required lookup fields have defaults
        if not cleaned_data.get('type_of_pap'):
            default_pap_type = TypeOfPAP.objects.first()
            if default_pap_type:
                cleaned_data['type_of_pap'] = default_pap_type
            
        if not cleaned_data.get('pap_category'):
            default_category = PAPCategory.objects.first()
            if default_category:
                cleaned_data['pap_category'] = default_category
            
        if not cleaned_data.get('vulnerability_category'):
            default_vulnerability = VulnerabilityCategory.objects.first()
            if default_vulnerability:
                cleaned_data['vulnerability_category'] = default_vulnerability
            
        if not cleaned_data.get('type_of_impact'):
            default_impact = TypeOfImpact.objects.first()
            if default_impact:
                cleaned_data['type_of_impact'] = default_impact
            
        if not cleaned_data.get('nature_of_compensation'):
            default_nature = NatureOfSettlement.objects.first()
            if default_nature:
                cleaned_data['nature_of_compensation'] = default_nature
        
        # Set default values for required text/choice fields
        if not cleaned_data.get('area'):
            cleaned_data['area'] = '0'
            
        if not cleaned_data.get('pap_compensated'):
            cleaned_data['pap_compensated'] = 'N'
            
        if not cleaned_data.get('pre_project_situation'):
            cleaned_data['pre_project_situation'] = 'Information not provided'
            
        if not cleaned_data.get('compensation_RefNo'):
            cleaned_data['compensation_RefNo'] = ''
        
        return cleaned_data




# Base form class for common fields and methods
class BaseGrievianceForm(forms.ModelForm):
    """Base form for Grievance Management with common fields and methods"""
    
    class Meta:
        model = GrievianceMonitoringLog
        fields = [
            'project', 'type_of_investment', 'case_no', 'sex',
            'date_claim_recieved', 'name_of_person_receiving_complaint',
            'how_complaint_was_received', 'name_of_complainant', 'tell_no',
            'complaint_content', 'was_recieved_of_complaint_ack',
            'expected_decision_date', 'decision_outcome',
            'was_decison_communicated_to_complainant', 'communication_method',
            'was_complainant_satisfied_with_decision', 'brief_note_for_NO_answer',
            'any_follow_up_action'
        ]
        widgets = {
            'case_no': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter unique case number'
            }),
            'sex': forms.Select(attrs={'class': 'form-select'}),
            'date_claim_recieved': forms.DateInput(attrs={
                'class': 'form-control',
                'type': 'date'
            }),
            'name_of_person_receiving_complaint': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Name of receiving officer'
            }),
            'how_complaint_was_received': forms.Select(attrs={'class': 'form-select'}),
            'name_of_complainant': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Complainant full name'
            }),
            'tell_no': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Phone number'
            }),
            'complaint_content': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 4,
                'placeholder': 'Describe the complaint in detail...'
            }),
            'was_recieved_of_complaint_ack': forms.Select(attrs={'class': 'form-select'}),
            'expected_decision_date': forms.DateInput(attrs={
                'class': 'form-control',
                'type': 'date'
            }),
            'decision_outcome': forms.Select(attrs={'class': 'form-select'}),
            'was_decison_communicated_to_complainant': forms.Select(attrs={'class': 'form-select'}),
            'communication_method': forms.Select(attrs={'class': 'form-select'}),
            'was_complainant_satisfied_with_decision': forms.Select(attrs={'class': 'form-select'}),
            'brief_note_for_NO_answer': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 3,
                'placeholder': 'Explain why complainant was not satisfied...'
            }),
            'any_follow_up_action': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 3,
                'placeholder': 'Describe follow-up actions...'
            }),
        }

    def clean_type_of_investment(self):
        """Custom validation for type_of_investment field"""
        type_of_investment = self.cleaned_data.get('type_of_investment')
        
        # If no investment type selected, try to find a default
        if not type_of_investment:
            project = self.cleaned_data.get('project')
            if project:
                from PIU_Financial_mgt.models import KPI_For_Contract
                default_investment = KPI_For_Contract.objects.filter(
                    project=project,
                    monitoring_type_id='ESS'
                ).first()
                if default_investment:
                    return default_investment
        
        return type_of_investment


# Form for creating new grievance records
class GrievianceMonitoringLogForm(BaseGrievianceForm):
    """Form for creating new grievance monitoring records"""
    
    project = forms.ModelChoiceField(
        queryset=Project.objects.all(),
        empty_label="Select Project",
        widget=forms.Select(attrs={
            "class": "form-select",
            "hx-get": reverse_lazy("load_investment_types_grievance"),
            "hx-target": "#id_type_of_investment",
            "hx-trigger": "change"
        })
    )

    type_of_investment = forms.ModelChoiceField(
        queryset=KPI_For_Contract.objects.all(),
        empty_label="Select Investment Type",
        widget=forms.Select(attrs={
            "class": "form-select",
            "data-preserve-on-submit": "true"
        }),
        required=True,  # Make this required to ensure it's selected
        to_field_name='monitoring_Type_Code'
    )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        # Set initial queryset based on context
        if 'project' in self.data:
            try:
                project_id = int(self.data.get('project'))
                self.fields['type_of_investment'].queryset = KPI_For_Contract.objects.filter(
                    project=project_id,
                    monitoring_type_id='ESS'
                )
            except (ValueError, TypeError):
                # If error, show all ESS types to prevent form validation errors
                self.fields['type_of_investment'].queryset = KPI_For_Contract.objects.filter(
                    monitoring_type_id='ESS'
                )
        else:
            # For new forms without data, show all ESS investment types
            self.fields['type_of_investment'].queryset = KPI_For_Contract.objects.filter(
                monitoring_type_id='ESS'
            )
    
    def clean(self):
        """Enhanced validation for grievance form"""
        cleaned_data = super().clean()
        
        # Validate project and investment type
        project = cleaned_data.get('project')
        type_of_investment = cleaned_data.get('type_of_investment')
        
        if project and not type_of_investment:
            # Auto-assign first available ESS investment type for the project
            default_investment = KPI_For_Contract.objects.filter(
                project=project,
                monitoring_type_id='ESS'
            ).first()
            if default_investment:
                cleaned_data['type_of_investment'] = default_investment
            else:
                raise forms.ValidationError(
                    'No ESS investment type found for the selected project. Please contact administrator.'
                )
        
        # Validate case number is unique
        case_no = cleaned_data.get('case_no')
        if case_no:
            existing = GrievianceMonitoringLog.objects.filter(case_no=case_no)
            if self.instance and self.instance.pk:
                existing = existing.exclude(pk=self.instance.pk)
            if existing.exists():
                raise forms.ValidationError('A grievance with this case number already exists.')
        
        # Validate dates
        date_received = cleaned_data.get('date_claim_recieved')
        expected_date = cleaned_data.get('expected_decision_date')
        
        if date_received and expected_date:
            if expected_date < date_received:
                raise forms.ValidationError('Expected decision date cannot be before the date claim was received.')
        
        # Ensure required choice fields have values
        if not cleaned_data.get('sex'):
            cleaned_data['sex'] = 'M'  # Default to Male
            
        if not cleaned_data.get('how_complaint_was_received'):
            cleaned_data['how_complaint_was_received'] = 'In Person'  # Default
            
        if not cleaned_data.get('was_recieved_of_complaint_ack'):
            cleaned_data['was_recieved_of_complaint_ack'] = 'Y'  # Default to Yes
            
        if not cleaned_data.get('was_decison_communicated_to_complainant'):
            cleaned_data['was_decison_communicated_to_complainant'] = 'N'  # Default to No
            
        if not cleaned_data.get('communication_method'):
            cleaned_data['communication_method'] = 'In Person'  # Default
            
        if not cleaned_data.get('was_complainant_satisfied_with_decision'):
            cleaned_data['was_complainant_satisfied_with_decision'] = 'N'  # Default to No
            
        # Ensure decision_outcome has a default value
        if not cleaned_data.get('decision_outcome'):
            from setup.models import DecisionOutcome
            default_decision = DecisionOutcome.objects.first()
            if default_decision:
                cleaned_data['decision_outcome'] = default_decision
        
        return cleaned_data


# Form for updating existing grievance records  
class GrievianceUpdateForm(BaseGrievianceForm):
    """Form for updating existing grievance monitoring records"""
    
    project = forms.ModelChoiceField(
        queryset=Project.objects.all(),
        empty_label="Select Project",
        widget=forms.Select(attrs={
            "class": "form-select",
            "hx-get": reverse_lazy("load_investment_types_grievance"),
            "hx-target": "#id_type_of_investment",
            "hx-trigger": "change"
        })
    )

    type_of_investment = forms.ModelChoiceField(
        queryset=KPI_For_Contract.objects.all(),
        empty_label="Select Investment Type",
        widget=forms.Select(attrs={
            "class": "form-select",
            "data-preserve-on-submit": "true"
        }),
        required=True,  # Make this required to ensure it's selected
        to_field_name='monitoring_Type_Code'
    )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        if 'project' in self.data:
            try:
                project_id = int(self.data.get('project'))
                self.fields['type_of_investment'].queryset = KPI_For_Contract.objects.filter(
                    project=project_id,
                    monitoring_type_id='ESS'
                )
            except (ValueError, TypeError):
                pass
        elif self.instance and self.instance.pk and self.instance.project:
            # For editing existing records, load investment types for the selected project
            self.fields['type_of_investment'].queryset = KPI_For_Contract.objects.filter(
                project=self.instance.project,
                monitoring_type_id='ESS'
            )
        else:
            # For existing forms without project selection, show all ESS types
            self.fields['type_of_investment'].queryset = KPI_For_Contract.objects.filter(
                monitoring_type_id='ESS'
            )


class OHSMonitoringForm(forms.ModelForm):
    project = forms.ModelChoiceField(
        queryset=Project.objects.all(),
        empty_label="Select Project",
        widget=forms.Select(attrs={"class": "form-select"})
    )

    Type_of_Investment = forms.ModelChoiceField(
        queryset=KPI_For_Contract.objects.all(),
        empty_label="Select Investment Type",
        widget=forms.Select(attrs={"class": "form-select"}),
        to_field_name='monitoring_Type_Code',
        required=False
    )

    region = forms.ModelChoiceField(
        queryset=Regions.objects.all(),
        empty_label="Select Region",
        widget=forms.Select(attrs={"class": "form-select"}),
        to_field_name='region_code'
    )

    district = forms.ModelChoiceField(
        queryset=Districts.objects.all(),
        empty_label="Select District",
        widget=forms.Select(attrs={"class": "form-select"}),
        required=False,
        to_field_name='district_code'
    )

    settlement = forms.ModelChoiceField(
        queryset=Settlement.objects.all(),
        empty_label="Select Settlement",
        widget=forms.Select(attrs={"class": "form-select"}),
        required=False,
        to_field_name='settlement_code'
    )
    
    Kpi_description = forms.ModelChoiceField(
        queryset=KPI_For_Contract.objects.all(),
        empty_label="Select KPI Description",
        widget=forms.Select(attrs={"class": "form-select"}),
        to_field_name='monitoring_Type_Code',
        required=False
    )

    class Meta:
        model = OHS_Monitoring
        fields = [
            'project', 'Type_of_Investment', 'year_of_report', 'quarter',
            'date', 'region', 'district', 'settlement',
            'quality_at_entry_requirement', 'working_environment', 'remarks',
            'male', 'female', 'youth_male', 'youth_female',
            'Kpi_description', 'picture'
        ]
        widgets = {
            'year_of_report': forms.Select(attrs={'class': 'form-select'}),
            'quarter': forms.Select(attrs={'class': 'form-select'}),
            'date': forms.DateInput(attrs={
                'class': 'form-control',
                'type': 'date'
            }),
            'quality_at_entry_requirement': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 3,
                'placeholder': 'Describe quality requirements...'
            }),
            'working_environment': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 3,
                'placeholder': 'Describe working environment...'
            }),
            'remarks': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 2,
                'placeholder': 'Additional remarks...'
            }),
            'male': forms.NumberInput(attrs={
                'class': 'form-control',
                'min': '0',
                'placeholder': 'Number of male workers'
            }),
            'female': forms.NumberInput(attrs={
                'class': 'form-control',
                'min': '0',
                'placeholder': 'Number of female workers'
            }),
            'youth_male': forms.NumberInput(attrs={
                'class': 'form-control',
                'min': '0',
                'placeholder': 'Number of male youth'
            }),
            'youth_female': forms.NumberInput(attrs={
                'class': 'form-control',
                'min': '0',
                'placeholder': 'Number of female youth'
            }),

            'picture': forms.FileInput(attrs={
                'class': 'form-control',
                'accept': 'image/*'
            }),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        # Set up dynamic querysets for project-based fields
        if 'project' in self.data:
            try:
                project_id = self.data.get('project')
                project_kpis = KPI_For_Contract.objects.filter(project_id=project_id)
                self.fields['Type_of_Investment'].queryset = project_kpis
                self.fields['Kpi_description'].queryset = project_kpis
            except (ValueError, TypeError):
                # If error, show all KPIs to prevent validation failures
                self.fields['Type_of_Investment'].queryset = KPI_For_Contract.objects.all()
                self.fields['Kpi_description'].queryset = KPI_For_Contract.objects.all()
        elif self.instance and self.instance.pk and self.instance.project:
            # For editing existing records, load KPIs for the selected project
            project_kpis = KPI_For_Contract.objects.filter(project=self.instance.project)
            self.fields['Type_of_Investment'].queryset = project_kpis
            self.fields['Kpi_description'].queryset = project_kpis
        else:
            # For new forms, show all KPIs initially
            self.fields['Type_of_Investment'].queryset = KPI_For_Contract.objects.all()
            self.fields['Kpi_description'].queryset = KPI_For_Contract.objects.all()
        
        # Set up dynamic querysets for geographic cascading
        if 'region' in self.data:
            try:
                region_value = self.data.get('region')
                self.fields['district'].queryset = Districts.objects.filter(
                    region_code=region_value
                )
                
                # If district is also selected, load settlements
                if 'district' in self.data:
                    district_value = self.data.get('district')
                    self.fields['settlement'].queryset = Settlement.objects.filter(
                        district_code=district_value
                    )
            except (ValueError, TypeError):
                # If error, show all districts to prevent validation failures
                self.fields['district'].queryset = Districts.objects.all()
                self.fields['settlement'].queryset = Settlement.objects.all()
        elif self.instance and self.instance.pk and hasattr(self.instance, 'region') and self.instance.region:
            self.fields['district'].queryset = Districts.objects.filter(
                region_code=self.instance.region.region_code
            )
            if hasattr(self.instance, 'district') and self.instance.district:
                self.fields['settlement'].queryset = Settlement.objects.filter(
                    district_code=self.instance.district.district_code
                )
        else:
            # For new forms, start with all available options
            self.fields['district'].queryset = Districts.objects.all()
            self.fields['settlement'].queryset = Settlement.objects.all()
        
        if 'district' in self.data:
            try:
                district_id = int(self.data.get('district'))
                self.fields['settlement'].queryset = Settlement.objects.filter(
                    district_code_id=district_id
                )
            except (ValueError, TypeError):
                pass
        elif self.instance and self.instance.pk and hasattr(self.instance, 'district') and self.instance.district:
            self.fields['settlement'].queryset = Settlement.objects.filter(
                district_code_id=self.instance.district.district_code
            )
        
        # Auto-select cascade defaults for new forms to prevent validation errors
        self._auto_select_cascade_defaults()
    
    def _auto_select_cascade_defaults(self):
        """Auto-select first available options for required cascade fields"""
        # Auto-select first investment type if project is selected but no investment type
        if not self.data.get('Type_of_Investment') and self.data.get('project'):
            first_investment = self.fields['Type_of_Investment'].queryset.first()
            if first_investment and hasattr(self, 'data') and hasattr(self.data, '_mutable'):
                if self.data._mutable:
                    self.data['Type_of_Investment'] = str(first_investment.monitoring_Type_Code)
        
        # Auto-select first KPI description if project is selected but no KPI selected
        if not self.data.get('Kpi_description') and self.data.get('project'):
            first_kpi = self.fields['Kpi_description'].queryset.first()
            if first_kpi and hasattr(self, 'data') and hasattr(self.data, '_mutable'):
                if self.data._mutable:
                    self.data['Kpi_description'] = str(first_kpi.monitoring_Type_Code)
        
        # Auto-select first district if region is selected but no district
        if not self.data.get('district') and self.data.get('region'):
            first_district = self.fields['district'].queryset.first()
            if first_district and hasattr(self, 'data') and hasattr(self.data, '_mutable'):
                if self.data._mutable:
                    self.data['district'] = str(first_district.district_code)
        
        # Auto-select first settlement if district is selected but no settlement
        if not self.data.get('settlement') and self.data.get('district'):
            first_settlement = self.fields['settlement'].queryset.first()
            if first_settlement and hasattr(self, 'data') and hasattr(self.data, '_mutable'):
                if self.data._mutable:
                    self.data['settlement'] = str(first_settlement.settlement_code)
    
    def clean_Type_of_Investment(self):
        """Auto-select first investment type if none provided"""
        investment_type = self.cleaned_data.get('Type_of_Investment')
        if not investment_type:
            project = self.cleaned_data.get('project')
            if project:
                first_investment = KPI_For_Contract.objects.filter(project=project).first()
                if first_investment:
                    return first_investment
        return investment_type
    
    def clean_Kpi_description(self):
        """Auto-select first KPI description if none provided"""
        kpi_description = self.cleaned_data.get('Kpi_description')
        if not kpi_description:
            project = self.cleaned_data.get('project')
            if project:
                first_kpi = KPI_For_Contract.objects.filter(project=project).first()
                if first_kpi:
                    return first_kpi
        return kpi_description


class CommunityEngagementForm(forms.ModelForm):
    class Meta:
        model = CommunityConsult_Engagement
        fields = [
            'project_name', 'reference_number', 'year', 'place_of_event',
            'date_of_consultation', 'male', 'female', 'total_participants',
            'stake_holder_engagement_Types', 'key_issues_discussed',
            'any_follow_up_actions', 'picture'
        ]
        widgets = {
            'project_name': forms.Select(attrs={'class': 'form-select'}),
            'reference_number': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter unique reference number'
            }),
            'year': forms.Select(attrs={'class': 'form-select'}),
            'place_of_event': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Location of engagement'
            }),
            'date_of_consultation': forms.DateInput(attrs={
                'class': 'form-control',
                'type': 'date'
            }),
            'male': forms.NumberInput(attrs={
                'class': 'form-control',
                'min': '0',
                'placeholder': 'Number of male participants'
            }),
            'female': forms.NumberInput(attrs={
                'class': 'form-control',
                'min': '0',
                'placeholder': 'Number of female participants'
            }),
            'total_participants': forms.NumberInput(attrs={
                'class': 'form-control',
                'min': '0',
                'placeholder': 'Total participants',
                'readonly': True
            }),
            'stake_holder_engagement_Types': forms.Select(attrs={'class': 'form-select'}),
            'key_issues_discussed': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 4,
                'placeholder': 'Describe key issues discussed...'
            }),
            'any_follow_up_actions': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 3,
                'placeholder': 'Describe follow-up actions...'
            }),
            'picture': forms.FileInput(attrs={
                'class': 'form-control',
                'accept': 'image/*'
            }),
        }

    def clean(self):
        cleaned_data = super().clean()
        male = cleaned_data.get('male', 0)
        female = cleaned_data.get('female', 0)
        total_participants = cleaned_data.get('total_participants', 0)
        
        calculated_total = (male or 0) + (female or 0)
        
        if total_participants != calculated_total:
            cleaned_data['total_participants'] = calculated_total
            
        return cleaned_data


# Update forms for editing existing records
class ESIAUpdateForm(ESIAForm):
    class Meta(ESIAForm.Meta):
        pass

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance and self.instance.pk:
            # Pre-populate the investment types for the selected project
            self.fields['type_of_investment'].queryset = KPI_For_Contract.objects.filter(
                project_id=self.instance.project_name.pk,
                monitoring_type_id='ESS'
            )


class PAPUpdateForm(PAPForm):
    class Meta(PAPForm.Meta):
        pass

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance and self.instance.pk:
            # Pre-populate dependent fields
            if self.instance.project:
                self.fields['type_of_investment'].queryset = KPI_For_Contract.objects.filter(
                    project=self.instance.project
                )
            else:
                # If no project, show all investment types
                self.fields['type_of_investment'].queryset = KPI_For_Contract.objects.all()
                
            if self.instance.region:
                self.fields['district'].queryset = Districts.objects.filter(
                    region_code_id=self.instance.region.region_code
                )
            else:
                self.fields['district'].queryset = Districts.objects.all()
                
            if self.instance.district:
                self.fields['pap_Current_Address'].queryset = Settlement.objects.filter(
                    district_code_id=self.instance.district.district_code
                )
            else:
                self.fields['pap_Current_Address'].queryset = Settlement.objects.all()
        else:
            # For new forms (shouldn't happen in update form but safety measure)
            self.fields['type_of_investment'].queryset = KPI_For_Contract.objects.all()
            self.fields['district'].queryset = Districts.objects.all()
            self.fields['pap_Current_Address'].queryset = Settlement.objects.all()


class GrievianceUpdateForm(GrievianceMonitoringLogForm):
    class Meta(GrievianceMonitoringLogForm.Meta):
        pass

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance and self.instance.pk:
            self.fields['type_of_investment'].queryset = KPI_For_Contract.objects.filter(
                project_id=self.instance.project.pk
            )


class OHSUpdateForm(OHSMonitoringForm):
    class Meta(OHSMonitoringForm.Meta):
        pass

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance and self.instance.pk:
            # Pre-populate dependent fields with correct field references
            if self.instance.project:
                self.fields['Type_of_Investment'].queryset = KPI_For_Contract.objects.filter(
                    project=self.instance.project
                )
            
            if self.instance.region:
                self.fields['district'].queryset = Districts.objects.filter(
                    region_code_id=self.instance.region.region_code
                )
            
            if self.instance.district:
                self.fields['settlement'].queryset = Settlement.objects.filter(
                    district_code_id=self.instance.district.district_code
                )
                
            # Pre-populate KPI description based on investment type
            if self.instance.Type_of_Investment:
                self.fields['Kpi_description'].queryset = KPI_For_Contract.objects.filter(
                    project=self.instance.project,
                    type_of_investment=self.instance.Type_of_Investment.type_of_investment
                )
        
        # Ensure all dependent fields have proper cascading setup
        elif 'project' in self.data:
            try:
                project_id = int(self.data.get('project'))
                self.fields['Type_of_Investment'].queryset = KPI_For_Contract.objects.filter(
                    project_id=project_id
                )
            except (ValueError, TypeError):
                pass

        if 'region' in self.data:
            try:
                region_id = int(self.data.get('region'))
                self.fields['district'].queryset = Districts.objects.filter(region_code_id=region_id)
            except (ValueError, TypeError):
                pass

        if 'district' in self.data:
            try:
                district_id = int(self.data.get('district'))
                self.fields['settlement'].queryset = Settlement.objects.filter(
                    district_code_id=district_id
                )
            except (ValueError, TypeError):
                pass