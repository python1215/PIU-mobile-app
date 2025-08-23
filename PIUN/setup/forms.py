from django import forms
from django.contrib.auth.models import User
from .models import *
from PIU_Financial_mgt.models import KPI_For_Contract

class DonorForm(forms.ModelForm):
    class Meta:
        model = Donor
        fields = ['name']
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Enter donor name'})
        }

class ContributorsForm(forms.ModelForm):
    class Meta:
        model = Contributors
        fields = ['name']
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Enter contributor name'})
        }

class ProjectCategoryForm(forms.ModelForm):
    class Meta:
        model = ProjectCategory
        fields = ['category', 'category_Description']
        widgets = {
            'category': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Enter category name'}),
            'category_Description': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Enter category description'})
        }

class YearForm(forms.ModelForm):
    class Meta:
        model = YEAR
        fields = ['profile_year']
        widgets = {
            'profile_year': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Enter year (e.g., 2024)', 'maxlength': '4'})
        }

class QuarterForm(forms.ModelForm):
    class Meta:
        model = Quarter
        fields = ['quarter']
        widgets = {
            'quarter': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Enter quarter (e.g., Q1 2024)'})
        }

class PhysicalprogressForm(forms.ModelForm):
    class Meta:
        model = Physicalprogress
        fields = ['progress_scale']
        widgets = {
            'progress_scale': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Enter progress scale'})
        }

class ProjectActivityMonitoringForm(forms.ModelForm):
    class Meta:
        model = project_Activity_monitoring
        fields = ['activity_type']
        widgets = {
            'activity_type': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Enter activity type'})
        }

class IndicatorTypeForm(forms.ModelForm):
    class Meta:
        model = Indicator_Type
        fields = ['indicator_type']
        widgets = {
            'indicator_type': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Enter indicator type'})
        }

class DocumentTypeForm(forms.ModelForm):
    class Meta:
        model = DocumentType
        fields = ['document_type']
        widgets = {
            'document_type': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Enter document type'})
        }

class TypeOfMonitoringForm(forms.ModelForm):
    class Meta:
        model = Type_of_Monitoring
        fields = ['monitoring_type_code', 'monitoring_type']
        widgets = {
            'monitoring_type_code': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Enter monitoring code', 'maxlength': '10'}),
            'monitoring_type': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Enter monitoring type'})
        }



class TypeOfMonitoringForm(forms.ModelForm):
    class Meta:
        model = Type_of_Monitoring
        fields = ['monitoring_type_code', 'monitoring_type']
        widgets = {
            'monitoring_type_code': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Enter monitoring code', 'maxlength': '10'}),
            'monitoring_type': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Enter monitoring type'})
        }

class TypeOfInvestmentForm(forms.ModelForm):
    class Meta:
        model = TypeOfInvestment
        fields = ['name_of_investment']
        widgets = {
            'name_of_investment': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Enter investment type'})
        }

class KPIForContractForm(forms.ModelForm):
    class Meta:
        model = KPI_For_Contract
        fields = ['project', 'type_of_investment', 'Kpi_description', 'monitoring_Type_Code', 'monitoring_type']
        widgets = {
            'project': forms.Select(attrs={'class': 'form-control'}),
            'type_of_investment': forms.Textarea(attrs={'class': 'form-control', 'rows': 3, 'placeholder': 'Enter investment type'}),
            'Kpi_description': forms.Textarea(attrs={'class': 'form-control', 'rows': 3, 'placeholder': 'Enter KPI description'}),
            'monitoring_Type_Code': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Enter monitoring code', 'maxlength': '15'}),
            'monitoring_type': forms.Select(attrs={'class': 'form-control'})
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Import here to avoid circular imports
        from PIU_Financial_mgt.models import Project
        
        # Set the project queryset to all available projects
        self.fields['project'].queryset = Project.objects.all()
        self.fields['project'].empty_label = "Select a project..."
        
        # Set the monitoring type queryset
        self.fields['monitoring_type'].queryset = Type_of_Monitoring.objects.all()
        self.fields['monitoring_type'].empty_label = "Select monitoring type..."
        
        # Add debugging info
        project_count = Project.objects.count()
        if project_count == 0:
            self.fields['project'].help_text = "No projects available. Please create projects first in the Financial Management module."
        
        # Set the project queryset to all available projects
        self.fields['project'].queryset = Project.objects.all()
        
        # Set the monitoring type queryset
        self.fields['monitoring_type'].queryset = Type_of_Monitoring.objects.all()

class MeasurementUnitForm(forms.ModelForm):
    class Meta:
        model = Measurement_Unit
        fields = ['unit']
        widgets = {
            'unit': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Enter measurement unit'})
        }

class DataCollectionFrequencyForm(forms.ModelForm):
    class Meta:
        model = Data_Collection_Frequency
        fields = ['frequency']
        widgets = {
            'frequency': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Enter collection frequency'})
        }

class VulnerabilityCategoryForm(forms.ModelForm):
    class Meta:
        model = VulnerabilityCategory
        fields = ['vulnerability']
        widgets = {
            'vulnerability': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Enter vulnerability category'})
        }

class AccessForm(forms.ModelForm):
    class Meta:
        model = Access
        fields = ['access_type']
        widgets = {
            'access_type': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Enter access type'})
        }

class RegionsForm(forms.ModelForm):
    class Meta:
        model = Regions
        fields = ['region_code', 'region_name', 'description']
        widgets = {
            'region_code': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Enter region code', 'maxlength': '5'}),
            'region_name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Enter region name', 'maxlength': '5'}),
            'description': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Enter description'})
        }

class LGAForm(forms.ModelForm):
    class Meta:
        model = LGA
        fields = ['lga_code', 'lga_name', 'region_code']
        widgets = {
            'lga_code': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Enter LGA code', 'maxlength': '5'}),
            'lga_name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Enter LGA name'}),
            'region_code': forms.Select(attrs={'class': 'form-control'})
        }

class DistrictsForm(forms.ModelForm):
    class Meta:
        model = Districts
        fields = ['region_code', 'lga_code', 'district_code', 'district_name']
        widgets = {
            'region_code': forms.Select(attrs={'class': 'form-control'}),
            'lga_code': forms.Select(attrs={'class': 'form-control'}),
            'district_code': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Enter district code', 'maxlength': '5'}),
            'district_name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Enter district name'})
        }

class WardForm(forms.ModelForm):
    class Meta:
        model = Ward
        fields = ['ward_code', 'ward_name', 'district_code']
        widgets = {
            'ward_code': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Enter ward code', 'maxlength': '5'}),
            'ward_name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Enter ward name'}),
            'district_code': forms.Select(attrs={'class': 'form-control'})
        }

class SettlementForm(forms.ModelForm):
    class Meta:
        model = Settlement
        fields = ['district_code', 'settlement_code', 'settlement_name', 'ward_code', 'EA']
        widgets = {
            'district_code': forms.Select(attrs={'class': 'form-control'}),
            'settlement_code': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Enter settlement code', 'maxlength': '6'}),
            'settlement_name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Enter settlement name'}),
            'ward_code': forms.Select(attrs={'class': 'form-control'}),
            'EA': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Enter EA', 'maxlength': '10'})
        }

class TypeOfImpactForm(forms.ModelForm):
    class Meta:
        model = TypeOfImpact
        fields = ['impact_number', 'impact']
        widgets = {
            'impact_number': forms.NumberInput(attrs={'class': 'form-control', 'placeholder': 'Enter impact number'}),
            'impact': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Enter impact description'})
        }

class PAPCategoryForm(forms.ModelForm):
    class Meta:
        model = PAPCategory
        fields = ['pap_category']
        widgets = {
            'pap_category': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Enter PAP category'})
        }

class TypeOfPAPForm(forms.ModelForm):
    class Meta:
        model = TypeOfPAP
        fields = ['type_of_pap']
        widgets = {
            'type_of_pap': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Enter type of PAP'})
        }

class NatureOfSettlementForm(forms.ModelForm):
    class Meta:
        model = NatureOfSettlement
        fields = ['nature_of_settlement']
        widgets = {
            'nature_of_settlement': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Enter nature of settlement'})
        }

class ResponseForm(forms.ModelForm):
    class Meta:
        model = response
        fields = ['yes_or_no']
        widgets = {
            'yes_or_no': forms.Select(choices=[('Yes', 'Yes'), ('No', 'No')], attrs={'class': 'form-control'})
        }

class DecisionOutcomeForm(forms.ModelForm):
    class Meta:
        model = DecisionOutcome
        fields = ['outcome']
        widgets = {
            'outcome': forms.Select(choices=[('Accept', 'Accept'), ('Reject', 'Reject')], attrs={'class': 'form-control'})
        }

class TypeOfStakeholderEngagementForm(forms.ModelForm):
    class Meta:
        model = TypeOfStakeholderEngagement
        fields = ['stake_holder_engagement']
        widgets = {
            'stake_holder_engagement': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Enter stakeholder engagement type'})
        }
class SetupPDOForm(forms.ModelForm):
    class Meta:
        model = SetupPDO
        fields = [
            'pdo_title', 'pdo_description', 'pdo_indicator', 'target_value', 
            'baseline_value', 'target_date', 'responsible_unit', 'status', 'is_active'
        ]
        widgets = {
            'pdo_title': forms.TextInput(attrs={
                'class': 'form-control', 
                'placeholder': 'Enter PDO title',
                'maxlength': '300'
            }),
            'pdo_description': forms.Textarea(attrs={
                'class': 'form-control', 
                'placeholder': 'Enter detailed description of the PDO',
                'rows': 4
            }),
            'pdo_indicator': forms.TextInput(attrs={
                'class': 'form-control', 
                'placeholder': 'Enter key performance indicator'
            }),
            'target_value': forms.TextInput(attrs={
                'class': 'form-control', 
                'placeholder': 'Enter target value or outcome'
            }),
            'baseline_value': forms.TextInput(attrs={
                'class': 'form-control', 
                'placeholder': 'Enter baseline value'
            }),
            'target_date': forms.DateInput(attrs={
                'class': 'form-control', 
                'type': 'date'
            }),
            'responsible_unit': forms.TextInput(attrs={
                'class': 'form-control', 
                'placeholder': 'Enter responsible unit or department'
            }),
            'status': forms.Select(attrs={
                'class': 'form-control'
            }),
            'is_active': forms.CheckboxInput(attrs={
                'class': 'form-check-input'
            })
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Add help text to fields
        self.fields['pdo_title'].help_text = "Enter a clear and concise PDO title"
        self.fields['pdo_description'].help_text = "Provide detailed description of what this PDO aims to achieve"
        self.fields['target_date'].help_text = "Expected completion date for this PDO"
