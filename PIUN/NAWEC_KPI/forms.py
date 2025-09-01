from django import forms
from .models import (
    CalculateAO, CalculateDER, CalculateCR, CalculatePARI, CalculateTSQR,
    KPIIndicator, NAWEC_KPI_Monitoring
)
from setup.models import Quarter, YEAR, Indicator_Type, Measurement_Unit, Data_Collection_Frequency
from PIU_Financial_mgt.models import Project, ProjectOutCome, ProjectResult


class CalculateAOForm(forms.ModelForm):
    class Meta:
        model = CalculateAO
        fields = [
            'baseline_value', 'End_Target_Value', 'audit_opinion',
            'year', 'quarter'
        ]
        widgets = {
            'baseline_value': forms.NumberInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter baseline value',
                'step': '0.01'
            }),
            'End_Target_Value': forms.NumberInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter end target value',
                'step': '0.01'
            }),
            'audit_opinion': forms.Select(attrs={
                'class': 'form-select'
            }),
            'year': forms.Select(attrs={'class': 'form-select'}),
            'quarter': forms.Select(attrs={'class': 'form-select'}),
        }
        labels = {
            'baseline_value': 'Baseline Value',
            'End_Target_Value': 'End Target Value',
            'audit_opinion': 'Audit Opinion',
            'year': 'Year',
            'quarter': 'Quarter'
        }


class CalculateDERForm(forms.ModelForm):
    class Meta:
        model = CalculateDER
        fields = [
            'baseline_value', 'End_Target_Value', 'total_debt', 'total_equity',
            'year', 'quarter'
        ]
        widgets = {
            'baseline_value': forms.NumberInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter baseline value',
                'step': '0.01'
            }),
            'End_Target_Value': forms.NumberInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter end target value',
                'step': '0.01'
            }),
            'total_debt': forms.NumberInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter total debt amount',
                'step': '0.01'
            }),
            'total_equity': forms.NumberInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter total equity amount',
                'step': '0.01'
            }),
            'year': forms.Select(attrs={'class': 'form-select'}),
            'quarter': forms.Select(attrs={'class': 'form-select'}),
        }
        labels = {
            'baseline_value': 'Baseline Value',
            'End_Target_Value': 'End Target Value',
            'total_debt': 'Total Debt',
            'total_equity': 'Total Equity',
            'year': 'Year',
            'quarter': 'Quarter'
        }


class CalculateCRForm(forms.ModelForm):
    class Meta:
        model = CalculateCR
        fields = [
            'baseline_value', 'End_Target_Value', 'current_assets', 'current_liabilities',
            'year', 'quarter'
        ]
        widgets = {
            'baseline_value': forms.NumberInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter baseline value',
                'step': '0.01'
            }),
            'End_Target_Value': forms.NumberInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter end target value',
                'step': '0.01'
            }),
            'current_assets': forms.NumberInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter current assets amount',
                'step': '0.01'
            }),
            'current_liabilities': forms.NumberInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter current liabilities amount',
                'step': '0.01'
            }),
            'year': forms.Select(attrs={'class': 'form-select'}),
            'quarter': forms.Select(attrs={'class': 'form-select'}),
        }
        labels = {
            'baseline_value': 'Baseline Value',
            'End_Target_Value': 'End Target Value',
            'current_assets': 'Current Assets',
            'current_liabilities': 'Current Liabilities',
            'year': 'Year',
            'quarter': 'Quarter'
        }


class CalculatePARIForm(forms.ModelForm):
    class Meta:
        model = CalculatePARI
        fields = [
            'baseline_value', 'End_Target_Value', 'total_number_of_recommendations', 
            'total_implemented', 'year', 'quarter'
        ]
        widgets = {
            'baseline_value': forms.NumberInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter baseline value',
                'step': '0.01'
            }),
            'End_Target_Value': forms.NumberInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter end target value',
                'step': '0.01'
            }),
            'total_number_of_recommendations': forms.NumberInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter total number of recommendations',
                'min': '0'
            }),
            'total_implemented': forms.NumberInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter total implemented',
                'min': '0'
            }),
            'year': forms.Select(attrs={'class': 'form-select'}),
            'quarter': forms.Select(attrs={'class': 'form-select'}),
        }
        labels = {
            'baseline_value': 'Baseline Value',
            'End_Target_Value': 'End Target Value',
            'total_number_of_recommendations': 'Total Number of Recommendations',
            'total_implemented': 'Total Implemented',
            'year': 'Year',
            'quarter': 'Quarter'
        }


class CalculateTSQRForm(forms.ModelForm):
    class Meta:
        model = CalculateTSQR
        fields = [
            'baseline_value', 'End_Target_Value', 'due_date', 'actual_date',
            'year', 'quarter'
        ]
        widgets = {
            'baseline_value': forms.NumberInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter baseline value',
                'step': '0.01'
            }),
            'End_Target_Value': forms.NumberInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter end target value',
                'step': '0.01'
            }),
            'due_date': forms.NumberInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter due date in days',
                'min': '1'
            }),
            'actual_date': forms.NumberInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter actual date in days',
                'min': '1'
            }),
            'year': forms.Select(attrs={'class': 'form-select'}),
            'quarter': forms.Select(attrs={'class': 'form-select'}),
        }
        labels = {
            'baseline_value': 'Baseline Value',
            'End_Target_Value': 'End Target Value',
            'due_date': 'Due Date (A) - in days',
            'actual_date': 'Actual Date (B) - in days',
            'year': 'Year',
            'quarter': 'Quarter'
        }


class KPIMonitoringDataForm(forms.ModelForm):
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Dynamically populate quarter choices from database
        quarter_choices = [('', 'Select Quarter')]
        for quarter in Quarter.objects.all():
            # Only include proper Quarter entries, skip Monthly to avoid duplicates
            if quarter.quarter == 'Quarter 1':
                display_text = '1'
                quarter_choices.append((quarter.id, display_text))
            elif quarter.quarter == 'Quarter 2':
                display_text = '2'
                quarter_choices.append((quarter.id, display_text))
            elif quarter.quarter == 'Quarter 3':
                display_text = '3'
                quarter_choices.append((quarter.id, display_text))
            elif quarter.quarter == 'Quarter 4':
                display_text = '4'
                quarter_choices.append((quarter.id, display_text))
            # Skip 'Monthly' to avoid duplicate "2" entries
        
        self.fields['quarter'].choices = quarter_choices
    
    quarter = forms.ChoiceField(
        choices=[],  # Will be populated dynamically
        widget=forms.Select(attrs={'class': 'form-select'}),
        required=True
    )
    
    def save(self, commit=True):
        instance = super().save(commit=False)
        
        # Handle quarter field conversion from ID to model instance
        quarter_id = self.cleaned_data.get('quarter')
        if quarter_id:
            try:
                quarter_instance = Quarter.objects.get(id=quarter_id)
                instance.quarter = quarter_instance
            except Quarter.DoesNotExist:
                # Handle invalid quarter ID
                pass
        
        if commit:
            instance.save()
        return instance
    
    class Meta:
        model = NAWEC_KPI_Monitoring
        fields = [
            'project', 'pdo', 'project_outcome', 'project_result',
            'indicator_type', 'indicator_description', 'measurement_unit',
            'collection_frequency', 'baseline_value', 'End_Target_Value',
            'achieved_value', 'Percentage_progress_from_baseline',
            'Percentage_progress_towards_end_target', 'Targeted_Achieved_weight',
            'year', 'remarks'
        ]
        widgets = {
            'project': forms.Select(attrs={'class': 'form-select'}),
            'pdo': forms.Select(attrs={'class': 'form-select'}),
            'project_outcome': forms.Select(attrs={'class': 'form-select'}),
            'project_result': forms.Select(attrs={'class': 'form-select'}),
            'indicator_type': forms.Select(attrs={'class': 'form-select'}),
            'indicator_description': forms.Select(attrs={'class': 'form-select'}),
            'measurement_unit': forms.Select(attrs={'class': 'form-select'}),
            'collection_frequency': forms.Select(attrs={'class': 'form-select'}),
            'baseline_value': forms.NumberInput(attrs={
                'class': 'form-control',
                'step': '0.01'
            }),
            'End_Target_Value': forms.NumberInput(attrs={
                'class': 'form-control',
                'step': '0.01'
            }),
            'achieved_value': forms.NumberInput(attrs={
                'class': 'form-control',
                'step': '0.01'
            }),
            'Percentage_progress_from_baseline': forms.NumberInput(attrs={
                'class': 'form-control',
                'step': '0.01',
                'readonly': True
            }),
            'Percentage_progress_towards_end_target': forms.NumberInput(attrs={
                'class': 'form-control',
                'step': '0.01',
                'readonly': True
            }),
            'Targeted_Achieved_weight': forms.NumberInput(attrs={
                'class': 'form-control',
                'step': '0.01',
                'readonly': True
            }),
            'year': forms.Select(attrs={'class': 'form-select'}),
            'remarks': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 3,
                'placeholder': 'Enter any relevant observations, issues, or notes'
            }),
        }


class KPIIndicatorForm(forms.ModelForm):
    class Meta:
        model = KPIIndicator
        fields = [
            'indicator_no', 'indicator_description', 'attributes',
            'baseline_value', 'End_Target_Value', 'targeted_weight_value'
        ]
        widgets = {
            'indicator_no': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter KPI indicator number'
            }),
            'indicator_description': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 3,
                'placeholder': 'Enter KPI description'
            }),
            'attributes': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter attributes'
            }),
            'baseline_value': forms.NumberInput(attrs={
                'class': 'form-control',
                'step': '0.01'
            }),
            'End_Target_Value': forms.NumberInput(attrs={
                'class': 'form-control',
                'step': '0.01'
            }),
            'targeted_weight_value': forms.NumberInput(attrs={
                'class': 'form-control',
                'step': '0.01'
            }),
        }


class CalculateROAForm(forms.ModelForm):
    class Meta:
        model = CalculateAO  # Using AO model as placeholder
        fields = ['baseline_value', 'End_Target_Value', 'year', 'quarter']
        widgets = {
            'baseline_value': forms.NumberInput(attrs={
                'class': 'form-control',
                'step': '0.01'
            }),
            'End_Target_Value': forms.NumberInput(attrs={
                'class': 'form-control',
                'step': '0.01'
            }),
            'year': forms.Select(attrs={'class': 'form-select'}),
            'quarter': forms.Select(attrs={'class': 'form-select'}),
        }


class CalculateNPMForm(forms.ModelForm):
    class Meta:
        model = CalculateAO  # Using AO model as placeholder
        fields = ['baseline_value', 'End_Target_Value', 'year', 'quarter']
        widgets = {
            'baseline_value': forms.NumberInput(attrs={
                'class': 'form-control',
                'step': '0.01'
            }),
            'End_Target_Value': forms.NumberInput(attrs={
                'class': 'form-control',
                'step': '0.01'
            }),
            'year': forms.Select(attrs={'class': 'form-select'}),
            'quarter': forms.Select(attrs={'class': 'form-select'}),
        }