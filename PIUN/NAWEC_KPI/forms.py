from django import forms
from django.forms import ModelForm
from .models import KPIIndicator, NAWEC_KPI_Monitoring, CalculateROA, CalculateNPM, CalculateMWh, CalculateGAF, CalculateTDE, CalculateATC
from PIU_Financial_mgt.models import Project, PDO, ProjectOutCome, ProjectResult
from setup.models import Indicator_Type, YEAR, Quarter, Measurement_Unit, Data_Collection_Frequency





class KPIMonitoringDataForm(ModelForm):
    """Form for entering NAWEC KPI monitoring data using NAWEC_KPI_Monitoring model"""
    
    class Meta:
        model = NAWEC_KPI_Monitoring
        fields = [
            'project', 'pdo', 'project_outcome', 'project_result', 
            'indicator_type', 'indicator_description', 'measurement_unit',
            'year', 'quarter', 'collection_frequency',
            'baseline_value', 'achieved_value', 'End_Target_Value',
            'Percentage_progress_from_baseline', 'Percentage_progress_towards_end_target',
            'Targeted_Achieved_weight', 'remarks'
        ]
        widgets = {
            'project': forms.Select(attrs={'class': 'form-control'}),
            'pdo': forms.Select(attrs={'class': 'form-control'}),
            'project_outcome': forms.Select(attrs={'class': 'form-control'}),
            'project_result': forms.Select(attrs={'class': 'form-control'}),
            'indicator_type': forms.Select(attrs={'class': 'form-control'}),
            'indicator_description': forms.Select(attrs={'class': 'form-control'}),
            'measurement_unit': forms.Select(attrs={'class': 'form-control'}),
            'year': forms.Select(attrs={'class': 'form-control'}),
            'quarter': forms.Select(attrs={'class': 'form-control'}),
            'collection_frequency': forms.Select(attrs={'class': 'form-control'}),
            'baseline_value': forms.NumberInput(attrs={
                'class': 'form-control',
                'step': '0.01',
                'placeholder': 'Enter baseline value'
            }),
            'achieved_value': forms.NumberInput(attrs={
                'class': 'form-control',
                'step': '0.01',
                'placeholder': 'Use calculation popup to set value',
                'style': 'background-color: #f8f9fa; cursor: pointer;',
                'onclick': 'openKPIPopup()'
            }),
            'End_Target_Value': forms.NumberInput(attrs={
                'class': 'form-control',
                'step': '0.01',
                'placeholder': 'Enter end target value'
            }),
            'Percentage_progress_from_baseline': forms.NumberInput(attrs={
                'class': 'form-control',
                'step': '0.01',
                'placeholder': 'Auto-calculated vs baseline (%)',
                'style': 'background-color: #f8f9fa;'
            }),
            'Percentage_progress_towards_end_target': forms.NumberInput(attrs={
                'class': 'form-control',
                'step': '0.01',
                'placeholder': 'Auto-calculated vs target (%)',
                'style': 'background-color: #f8f9fa;'
            }),
            'Targeted_Achieved_weight': forms.NumberInput(attrs={
                'class': 'form-control',
                'step': '0.01',
                'placeholder': 'Enter targeted achieved weight value'
            }),
            'remarks': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 3,
                'placeholder': 'Add relevant remarks and observations'
            }),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        # Set field labels
        self.fields['pdo'].label = 'Project Development Objective (PDO)'
        self.fields['project_outcome'].label = 'Project Outcome'
        self.fields['project_result'].label = 'Project Result'
        self.fields['indicator_type'].label = 'Indicator Type'
        self.fields['indicator_description'].label = 'KPI Indicator'
        self.fields['measurement_unit'].label = 'Measurement Unit'
        self.fields['collection_frequency'].label = 'Data Collection Frequency'
        self.fields['baseline_value'].label = 'Baseline Value'
        self.fields['achieved_value'].label = 'Achieved Value'
        self.fields['End_Target_Value'].label = 'End Target Value'
        self.fields['Percentage_progress_from_baseline'].label = 'Percentage progress from baseline'
        self.fields['Percentage_progress_towards_end_target'].label = 'Percentage progress towards end target'
        self.fields['Targeted_Achieved_weight'].label = 'Targeted Achieved Weight'
        
        # Set optional fields
        self.fields['baseline_value'].required = False
        self.fields['achieved_value'].required = False
        self.fields['End_Target_Value'].required = False
        self.fields['Percentage_progress_from_baseline'].required = False
        self.fields['Percentage_progress_towards_end_target'].required = False
        
        # Set querysets for ForeignKey fields
        self.fields['indicator_description'].queryset = KPIIndicator.objects.all().order_by('indicator_no')
        
        # Ensure all projects are available in the project dropdown
        self.fields['project'].queryset = Project.objects.all()
        
        # For edit mode, ensure dependent dropdowns have proper querysets
        if self.instance and self.instance.pk:
            # Manually set initial values to ensure they persist
            if self.instance.project:
                self.fields['project'].initial = self.instance.project.pk
                self.fields['pdo'].queryset = PDO.objects.filter(project=self.instance.project)
            else:
                self.fields['pdo'].queryset = PDO.objects.none()
            
            # If instance has PDO, set Project Outcome queryset  
            if self.instance.pdo:
                self.fields['pdo'].initial = self.instance.pdo.pk
                self.fields['project_outcome'].queryset = ProjectOutCome.objects.filter(pdo=self.instance.pdo)
            else:
                self.fields['project_outcome'].queryset = ProjectOutCome.objects.none()
                
            # If instance has Project Outcome, set Project Result queryset
            if self.instance.project_outcome:
                self.fields['project_outcome'].initial = self.instance.project_outcome.pk
                self.fields['project_result'].queryset = ProjectResult.objects.filter(project_outcome=self.instance.project_outcome)
            else:
                self.fields['project_result'].queryset = ProjectResult.objects.none()
                
            # Set Project Result initial value
            if self.instance.project_result:
                self.fields['project_result'].initial = self.instance.project_result.pk
        else:
            # For new instances, start with empty dependent querysets
            self.fields['pdo'].queryset = PDO.objects.none()
            self.fields['project_outcome'].queryset = ProjectOutCome.objects.none()
            self.fields['project_result'].queryset = ProjectResult.objects.none()
        
        # Add empty labels for dropdown fields
        self.fields['pdo'].empty_label = "-- Select PDO --"
        self.fields['project_outcome'].empty_label = "-- Select Project Outcome --"
        self.fields['project_result'].empty_label = "-- Select Project Result --"
        self.fields['indicator_description'].empty_label = "-- Select KPI Indicator --"
        self.fields['quarter'].empty_label = "-- Select Quarter --"

    def clean_pdo(self):
        """Custom validation for PDO field"""
        pdo = self.cleaned_data.get('pdo')
        project = self.cleaned_data.get('project')
        
        if pdo and project:
            # If pdo is already an object, check its project relationship
            if hasattr(pdo, 'project'):
                if pdo.project != project:
                    raise forms.ValidationError("Selected PDO does not belong to the chosen project.")
            else:
                # If pdo is an ID, validate it exists and belongs to project
                try:
                    pdo = PDO.objects.get(id=pdo, project=project)
                except PDO.DoesNotExist:
                    raise forms.ValidationError("Selected PDO does not belong to the chosen project.")
        return pdo

    def clean_project_outcome(self):
        """Custom validation for Project Outcome field"""
        outcome = self.cleaned_data.get('project_outcome')
        pdo = self.cleaned_data.get('pdo')
        
        if outcome and pdo:
            # If outcome is already an object, check its PDO relationship
            if hasattr(outcome, 'pdo'):
                if outcome.pdo != pdo:
                    raise forms.ValidationError("Selected Project Outcome does not belong to the chosen PDO.")
            else:
                # If outcome is an ID, validate it exists and belongs to PDO
                try:
                    outcome = ProjectOutCome.objects.get(id=outcome, pdo=pdo)
                except ProjectOutCome.DoesNotExist:
                    raise forms.ValidationError("Selected Project Outcome does not belong to the chosen PDO.")
        return outcome

    def clean_project_result(self):
        """Custom validation for Project Result field"""
        result = self.cleaned_data.get('project_result')
        project_outcome = self.cleaned_data.get('project_outcome')
        
        if result and project_outcome:
            # If result is already an object, check its outcome relationship
            if hasattr(result, 'project_outcome'):
                if result.project_outcome != project_outcome:
                    raise forms.ValidationError("Selected Project Result does not belong to the chosen Project Outcome.")
            else:
                # If result is an ID, validate it exists and belongs to outcome
                try:
                    result = ProjectResult.objects.get(id=result, project_outcome=project_outcome)
                except ProjectResult.DoesNotExist:
                    raise forms.ValidationError("Selected Project Result does not belong to the chosen Project Outcome.")
        return result

    def clean(self):
        cleaned_data = super().clean()
        baseline_value = cleaned_data.get('baseline_value')
        achieved_value = cleaned_data.get('achieved_value')
        end_target_value = cleaned_data.get('End_Target_Value')
        
        # Auto-calculate percentages if values are provided
        if baseline_value and achieved_value and baseline_value != 0:
            percentage_vs_baseline = ((achieved_value - baseline_value) / baseline_value) * 100
            cleaned_data['Percentage_progress_from_baseline'] = round(percentage_vs_baseline, 2)
        
        if end_target_value and achieved_value and end_target_value != 0:
            percentage_vs_target = (achieved_value / end_target_value) * 100
            cleaned_data['Percentage_progress_towards_end_target'] = round(percentage_vs_target, 2)
        
        return cleaned_data


class KPIIndicatorForm(ModelForm):
    """Form for creating and editing KPI indicators"""
    
    class Meta:
        model = KPIIndicator
        fields = ['indicator_no', 'indicator_description', 'attributes', 'baseline_value', 'End_Target_Value', 'targeted_weight_value']
        widgets = {
            'indicator_no': forms.TextInput(attrs={
                'class': 'form-control bg-white',
                'placeholder': 'e.g., KPI001',
                'style': 'color: black; font-weight: bold;'
            }),
            'indicator_description': forms.Textarea(attrs={
                'class': 'form-control bg-white',
                'rows': 4,
                'placeholder': 'Provide a detailed description of what this KPI indicator measures...',
                'style': 'color: black; font-weight: bold;'
            }),
            'attributes': forms.TextInput(attrs={
                'class': 'form-control bg-white',
                'placeholder': 'e.g., Percentage, Monthly tracking',
                'style': 'color: black; font-weight: bold;'
            }),
            'baseline_value': forms.NumberInput(attrs={
                'class': 'form-control bg-white',
                'step': '0.01',
                'placeholder': 'Enter baseline value',
                'style': 'color: black; font-weight: bold;'
            }),
            'End_Target_Value': forms.NumberInput(attrs={
                'class': 'form-control bg-white',
                'step': '0.01',
                'placeholder': 'Enter target value',
                'style': 'color: black; font-weight: bold;'
            }),
            'targeted_weight_value': forms.NumberInput(attrs={
                'class': 'form-control bg-white',
                'step': '0.01',
                'placeholder': 'Enter weight percentage',
                'style': 'color: black; font-weight: bold;'
            }),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        # Set field labels
        self.fields['indicator_no'].label = 'Indicator Number'
        self.fields['indicator_description'].label = 'Indicator Description'
        self.fields['attributes'].label = 'Attributes'
        self.fields['baseline_value'].label = 'Baseline Value'
        self.fields['End_Target_Value'].label = 'End Target Value'
        self.fields['targeted_weight_value'].label = 'Target Weight (%)'
        
        # Set required fields
        self.fields['indicator_no'].required = True
        self.fields['indicator_description'].required = True
        self.fields['attributes'].required = False
        self.fields['baseline_value'].required = False
        self.fields['End_Target_Value'].required = False
        self.fields['targeted_weight_value'].required = False

    def clean_indicator_no(self):
        indicator_no = self.cleaned_data.get('indicator_no')
        if indicator_no:
            # Convert to uppercase and remove invalid characters
            indicator_no = indicator_no.upper().strip()
            # Check if this indicator number already exists (excluding current instance)
            existing = KPIIndicator.objects.filter(indicator_no=indicator_no)
            if self.instance.pk:
                existing = existing.exclude(pk=self.instance.pk)
            if existing.exists():
                raise forms.ValidationError('This indicator number already exists. Please use a unique identifier.')
        return indicator_no


class CalculateROAForm(ModelForm):
    """Form for ROA calculation (KPI-01)"""
    
    class Meta:
        model = CalculateROA
        fields = ['net_profit_after_tax', 'total_assets']
        widgets = {
            'net_profit_after_tax': forms.NumberInput(attrs={
                'class': 'form-control',
                'step': '0.01',
                'placeholder': 'Enter net profit after tax'
            }),
            'total_assets': forms.NumberInput(attrs={
                'class': 'form-control',
                'step': '0.01',
                'placeholder': 'Enter total assets value'
            }),
        }


class CalculateNPMForm(ModelForm):
    """Form for NPM calculation (KPI-02)"""
    
    class Meta:
        model = CalculateNPM
        fields = ['total_revenues_turnover', 'netprofit']
        widgets = {
            'total_revenues_turnover': forms.NumberInput(attrs={
                'class': 'form-control',
                'step': '0.01',
                'placeholder': 'Enter total revenue/turnover'
            }),
            'netprofit': forms.NumberInput(attrs={
                'class': 'form-control',
                'step': '0.01',
                'placeholder': 'Enter net profit'
            }),
        }

class CalculateTDEForm(ModelForm):
    """Form for TDE calculation (KPI-06)"""
    
    class Meta:
        model = CalculateTDE
        fields = ["total_training_days_conducted", "total_number_of_employees", "year", "quarter"]
        widgets = {
            "total_training_days_conducted": forms.NumberInput(attrs={
                "class": "form-control",
                "step": "0.01",
                "placeholder": "Enter total training days conducted"
            }),
            "total_number_of_employees": forms.NumberInput(attrs={
                "class": "form-control",
                "step": "1",
                "placeholder": "Enter total number of employees"
            }),
            "year": forms.Select(attrs={"class": "form-control"}),
            "quarter": forms.Select(attrs={"class": "form-control"}),
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["year"].queryset = YEAR.objects.all().order_by("-profile_year")
        self.fields["quarter"].queryset = Quarter.objects.all().order_by("quarter")


class CalculateATCForm(ModelForm):
    """Form for ATC calculation (KPI-07)"""
    
    class Meta:
        model = CalculateATC
        fields = ["billing_efficiency", "collection_efficiency", "year", "quarter"]
        widgets = {
            "billing_efficiency": forms.NumberInput(attrs={
                "class": "form-control",
                "step": "0.01",
                "min": "0",
                "max": "100",
                "placeholder": "Enter billing efficiency (%)"
            }),
            "collection_efficiency": forms.NumberInput(attrs={
                "class": "form-control",
                "step": "0.01",
                "min": "0",
                "max": "100",
                "placeholder": "Enter collection efficiency (%)"
            }),
            "year": forms.Select(attrs={"class": "form-control"}),
            "quarter": forms.Select(attrs={"class": "form-control"}),
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["year"].queryset = YEAR.objects.all().order_by("-profile_year")
        self.fields["quarter"].queryset = Quarter.objects.all().order_by("quarter")

