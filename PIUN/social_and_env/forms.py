from django import forms
from django.urls import reverse_lazy
from .models import ESIA, PAP, GrievianceMonitoringLog, OHS_Monitoring, CommunityConsult_Engagement
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
        widget=forms.Select(attrs={
            "class": "form-select",
            "hx-get": reverse_lazy("load_investment_types_esia"),
            "hx-target": "#id_type_of_investment",
            "hx-trigger": "change",
            "hx-indicator": "#loading-investment"
        })
    )

    type_of_investment = forms.ModelChoiceField(
        queryset=KPI_For_Contract.objects.all(),
        empty_label="Select Investment Type",
        widget=forms.Select(attrs={
            "class": "form-select"
        }),
        required=False
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
        
        # Make required fields (except cascading dropdowns)
        for field_name, field in self.fields.items():
            if field_name not in ['type_of_investment']:
                field.required = True



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
            "class": "form-select"
        })
    )

    type_of_investment = forms.ModelChoiceField(
        queryset=KPI_For_Contract.objects.all(),
        empty_label="Select Investment Type",
        widget=forms.Select(attrs={"class": "form-select"}),
        required=False,
        to_field_name='monitoring_Type_Code'
    )

    region = forms.ModelChoiceField(
        queryset=Regions.objects.all(),
        empty_label="Select Region",
        widget=forms.Select(attrs={
            "class": "form-select"
        })
    )

    district = forms.ModelChoiceField(
        queryset=Districts.objects.all(),
        empty_label="Select District",
        widget=forms.Select(attrs={
            "class": "form-select"
        }),
        required=False
    )

    pap_Current_Address = forms.ModelChoiceField(
        queryset=Settlement.objects.all(),
        empty_label="Select Settlement",
        widget=forms.Select(attrs={"class": "form-select"}),
        required=False
    )

    class Meta:
        model = PAP
        fields = [
            'project', 'type_of_investment', 'pap_identification_number',
            'type_of_pap', 'region', 'district', 'pap_name', 'sex',
            'pap_category', 'pap_Current_Address', 'vulnerability_category',
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
        
        # Make optional fields explicitly not required
        self.fields['area'].required = False
        self.fields['compensation_RefNo'].required = False
        self.fields['compensation_date'].required = False
        self.fields['type_of_investment'].required = False
        self.fields['district'].required = False
        self.fields['pap_Current_Address'].required = False
        
        # Make required fields (except cascading dropdowns and optional fields)
        for field_name, field in self.fields.items():
            if field_name not in ['type_of_investment', 'district', 'pap_Current_Address', 'area', 'compensation_RefNo', 'compensation_date']:
                field.required = True
    
    def clean_type_of_investment(self):
        """Custom validation for type_of_investment field"""
        type_of_investment = self.cleaned_data.get('type_of_investment')
        
        # If no investment type selected, try to find a default
        if not type_of_investment:
            project = self.cleaned_data.get('project')
            if project:
                from PIU_Financial_mgt.models import KPI_For_Contract
                first_investment = KPI_For_Contract.objects.filter(project=project).first()
                if first_investment:
                    return first_investment
        
        return type_of_investment
    
    def clean(self):
        cleaned_data = super().clean()
        
        # Provide default value for area if not provided
        if not cleaned_data.get('area'):
            cleaned_data['area'] = '0.0'
        
        # Provide default value for compensation_RefNo if not provided
        if not cleaned_data.get('compensation_RefNo'):
            cleaned_data['compensation_RefNo'] = 'N/A'
        
        # Handle cascading dropdowns - provide defaults if not selected
        if not cleaned_data.get('district') and cleaned_data.get('region'):
            # Get the first district for the selected region
            from setup.models import Districts
            region = cleaned_data.get('region')
            first_district = Districts.objects.filter(region_code=region).first()
            if first_district:
                cleaned_data['district'] = first_district
        
        if not cleaned_data.get('pap_Current_Address') and cleaned_data.get('district'):
            # Get the first settlement for the selected district
            from setup.models import Settlement
            district = cleaned_data.get('district')
            first_settlement = Settlement.objects.filter(district_code=district).first()
            if first_settlement:
                cleaned_data['pap_Current_Address'] = first_settlement
        
        return cleaned_data




class GrievianceMonitoringLogForm(forms.ModelForm):
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
        widget=forms.Select(attrs={"class": "form-select"}),
        required=False
    )

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

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        if 'project' in self.data:
            try:
                project_id = int(self.data.get('project'))
                self.fields['type_of_investment'].queryset = KPI_For_Contract.objects.filter(
                    project=project_id
                )
            except (ValueError, TypeError):
                pass
        elif self.instance and self.instance.pk and self.instance.project:
            # For editing existing records, load investment types for the selected project
            self.fields['type_of_investment'].queryset = KPI_For_Contract.objects.filter(
                project=self.instance.project
            )
        else:
            # For new forms, include all investment types to prevent validation errors
            self.fields['type_of_investment'].queryset = KPI_For_Contract.objects.all()


class OHSMonitoringForm(forms.ModelForm):
    project = forms.ModelChoiceField(
        queryset=Project.objects.all(),
        empty_label="Select Project",
        widget=forms.Select(attrs={
            "class": "form-select",
            "hx-get": reverse_lazy("load_investment_types_ohs"),
            "hx-target": "#id_Type_of_Investment",
            "hx-trigger": "change"
        })
    )

    Type_of_Investment = forms.ModelChoiceField(
        queryset=KPI_For_Contract.objects.none(),
        empty_label="Select Investment Type",
        widget=forms.Select(attrs={"class": "form-select"})
    )

    region = forms.ModelChoiceField(
        queryset=Regions.objects.all(),
        empty_label="Select Region",
        widget=forms.Select(attrs={
            "class": "form-select",
            "hx-get": reverse_lazy("load_districts_ohs"),
            "hx-target": "#id_district",
            "hx-trigger": "change"
        })
    )

    district = forms.ModelChoiceField(
        queryset=Districts.objects.none(),
        empty_label="Select District",
        widget=forms.Select(attrs={
            "class": "form-select",
            "hx-get": reverse_lazy("load_settlements_ohs"),
            "hx-target": "#id_settlement",
            "hx-trigger": "change"
        })
    )

    settlement = forms.ModelChoiceField(
        queryset=Settlement.objects.none(),
        empty_label="Select Settlement",
        widget=forms.Select(attrs={"class": "form-select"})
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
            'Kpi_description': forms.Select(attrs={'class': 'form-select'}),
            'picture': forms.FileInput(attrs={
                'class': 'form-control',
                'accept': 'image/*'
            }),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        # Set up dynamic querysets
        if 'project' in self.data:
            try:
                project_id = int(self.data.get('project'))
                self.fields['Type_of_Investment'].queryset = KPI_For_Contract.objects.filter(
                    project=project_id
                )
            except (ValueError, TypeError):
                pass
        else:
            # For new forms, include all investment types to prevent validation errors
            self.fields['Type_of_Investment'].queryset = KPI_For_Contract.objects.all()

        if 'region' in self.data:
            try:
                region_code = self.data.get('region')
                self.fields['district'].queryset = Districts.objects.filter(region_code=region_code)
            except (ValueError, TypeError):
                pass
        else:
            # For new forms, include all districts to prevent validation errors
            self.fields['district'].queryset = Districts.objects.all()

        if 'district' in self.data:
            try:
                district_code = self.data.get('district')
                self.fields['settlement'].queryset = Settlement.objects.filter(
                    district_code=district_code
                )
            except (ValueError, TypeError):
                pass
        else:
            # For new forms, include all settlements to prevent validation errors
            self.fields['settlement'].queryset = Settlement.objects.all()


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
            self.fields['type_of_investment'].queryset = KPI_For_Contract.objects.filter(
                project=self.instance.project
            )
            self.fields['district'].queryset = Districts.objects.filter(
                region_code_id=self.instance.region_id
            )
            self.fields['pap_Current_Address'].queryset = Settlement.objects.filter(
                district_code_id=self.instance.district_id
            )


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