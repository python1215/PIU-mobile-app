from django import forms
from django.core.exceptions import ValidationError
from django.utils import timezone
from crispy_forms.helper import FormHelper
from crispy_forms.layout import Layout, Field, Row, Column, Div, Submit, HTML
from crispy_forms.bootstrap import FormActions

from .models import Contract_Profiling_works, Contract_Profiling_goods_services, Specific_Contract_Monitoring

# Safe imports with error handling
try:
    from setup.models import (
        ProjectCategory, Donor, Type_of_Monitoring, 
        Physicalprogress, Quarter, KPI_For_Contract
    )
except ImportError:
    ProjectCategory = Donor = Type_of_Monitoring = None
    Physicalprogress = Quarter = KPI_For_Contract = None

try:
    from PIU_Financial_mgt.models import Project, Component, Subcomponent, Activities, Currency
except ImportError:
    Project = Component = Subcomponent = Activities = Currency = None


class ContractWorksFilterForm(forms.Form):
    """Advanced filtering form for Contract Profiling Works using real database data"""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        # Project filter using real data
        if Project:
            self.fields['project'] = forms.ModelChoiceField(
                queryset=Project.objects.all(),
                empty_label="All Projects",
                required=False,
                widget=forms.Select(attrs={'class': 'form-select'})
            )
        
        # Component filter using real data
        if Component:
            self.fields['component'] = forms.ModelChoiceField(
                queryset=Component.objects.all(),
                empty_label="All Components",
                required=False,
                widget=forms.Select(attrs={'class': 'form-select'})
            )
        
        # Subcomponent filter using real data
        if Subcomponent:
            self.fields['subcomponent'] = forms.ModelChoiceField(
                queryset=Subcomponent.objects.all(),
                empty_label="All Subcomponents",
                required=False,
                widget=forms.Select(attrs={'class': 'form-select'})
            )
        
        # Activity filter using real data
        if Activities:
            self.fields['activity'] = forms.ModelChoiceField(
                queryset=Activities.objects.all(),
                empty_label="All Activities",
                required=False,
                widget=forms.Select(attrs={'class': 'form-select'})
            )
        
        # Currency filter using real data
        if Currency:
            self.fields['currency'] = forms.ModelChoiceField(
                queryset=Currency.objects.all(),
                empty_label="All Currencies",
                required=False,
                widget=forms.Select(attrs={'class': 'form-select'})
            )
        
        # Project Category filter using real data
        if ProjectCategory:
            self.fields['project_category'] = forms.ModelChoiceField(
                queryset=ProjectCategory.objects.all(),
                empty_label="All Categories",
                required=False,
                widget=forms.Select(attrs={'class': 'form-select'})
            )
        
        # Contractor filter from existing contracts
        contractor_choices = [('', 'All Contractors')]
        try:
            contractors = Contract_Profiling_works.objects.exclude(
                name_of_contractor__isnull=True
            ).exclude(name_of_contractor='').values_list(
                'name_of_contractor', flat=True
            ).distinct().order_by('name_of_contractor')
            contractor_choices.extend([(c, c) for c in contractors])
        except:
            pass
        
        self.fields['contractor'] = forms.ChoiceField(
            choices=contractor_choices,
            required=False,
            widget=forms.Select(attrs={'class': 'form-select'})
        )
        
        # Consultant filter from existing contracts
        consultant_choices = [('', 'All Consultants')]
        try:
            consultants = Contract_Profiling_works.objects.exclude(
                name_of_consultant__isnull=True
            ).exclude(name_of_consultant='').values_list(
                'name_of_consultant', flat=True
            ).distinct().order_by('name_of_consultant')
            consultant_choices.extend([(c, c) for c in consultants])
        except:
            pass
        
        self.fields['consultant'] = forms.ChoiceField(
            choices=consultant_choices,
            required=False,
            widget=forms.Select(attrs={'class': 'form-select'})
        )
        
        # Contract value range filter
        self.fields['value_range'] = forms.ChoiceField(
            choices=[
                ('', 'All Values'),
                ('0-100000', 'Under $100K'),
                ('100000-500000', '$100K - $500K'),
                ('500000-1000000', '$500K - $1M'),
                ('1000000-99999999', 'Over $1M'),
            ],
            required=False,
            widget=forms.Select(attrs={'class': 'form-select'})
        )
        
        # Status filter
        self.fields['status'] = forms.ChoiceField(
            choices=[
                ('', 'All Status'),
                ('active', 'Active'),
                ('completed', 'Completed'),
                ('pending', 'Pending'),
                ('cancelled', 'Cancelled'),
            ],
            required=False,
            widget=forms.Select(attrs={'class': 'form-select'})
        )
        
        # Basic search field
        self.fields['search'] = forms.CharField(
            required=False,
            widget=forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Quick search by contract ref, contractor, consultant, or location...'
            })
        )


class ContractProfilingWorksForm(forms.ModelForm):
    """Enhanced form for Contract Profiling Works with validation and crispy styling"""
    
    class Meta:
        model = Contract_Profiling_works
        fields = [
            'projectID', 'compID', 'subcompID', 'activityID', 'project_Category',
            'funding_source', 'main_intervention_focus_result', 'target_number_of_beneficiary_settlements',
            'location_of_investment', 'Latitude', 'Longitude', 'gross_floor_area_m2',
            'currency', 'contract_value', 'amendments', 'contract_refNo',
            'name_of_contractor', 'name_of_consultant', 'contract_start_date',
            'contract_end_date', 'duration', 'remarks'
        ]
        widgets = {
            'contract_start_date': forms.DateInput(attrs={'type': 'date', 'class': 'form-control'}),
            'contract_end_date': forms.DateInput(attrs={'type': 'date', 'class': 'form-control'}),
            'main_intervention_focus_result': forms.Textarea(attrs={'rows': 3}),
            'remarks': forms.Textarea(attrs={'rows': 4}),
            'location_of_investment': forms.Textarea(attrs={'rows': 2}),
            'Latitude': forms.NumberInput(attrs={'step': 'any', 'placeholder': 'e.g., -1.2921'}),
            'Longitude': forms.NumberInput(attrs={'step': 'any', 'placeholder': 'e.g., 36.8219'}),
            'contract_value': forms.NumberInput(attrs={'step': '0.01', 'min': '0'}),
            'gross_floor_area_m2': forms.NumberInput(attrs={'min': '0'}),
            'target_number_of_beneficiary_settlements': forms.NumberInput(attrs={'min': '0'}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.form_method = 'post'
        self.helper.form_class = 'form-horizontal'
        self.helper.label_class = 'col-lg-3'
        self.helper.field_class = 'col-lg-9'
        
        # Make certain fields required (based on model constraints)
        self.fields['projectID'].required = True
        self.fields['compID'].required = True
        self.fields['subcompID'].required = True
        self.fields['activityID'].required = True
        self.fields['project_Category'].required = True
        self.fields['funding_source'].required = True
        self.fields['contract_refNo'].required = True
        self.fields['name_of_contractor'].required = True
        self.fields['contract_value'].required = True
        self.fields['contract_start_date'].required = True
        self.fields['contract_end_date'].required = True
        self.fields['duration'].required = True
        self.fields['remarks'].required = True
        
        # Make optional fields truly optional
        self.fields['currency'].required = False
        self.fields['name_of_consultant'].required = False
        self.fields['amendments'].required = False
        self.fields['main_intervention_focus_result'].required = False
        self.fields['target_number_of_beneficiary_settlements'].required = False
        self.fields['location_of_investment'].required = False
        self.fields['Latitude'].required = False
        self.fields['Longitude'].required = False
        self.fields['gross_floor_area_m2'].required = False
        
        # Add help texts
        self.fields['contract_refNo'].help_text = 'Unique contract reference number'
        self.fields['Latitude'].help_text = 'Decimal degrees (e.g., -1.2921)'
        self.fields['Longitude'].help_text = 'Decimal degrees (e.g., 36.8219)'
        self.fields['amendments'].help_text = 'Check if this contract has amendments'
        
        self.helper.layout = Layout(
            HTML('<h4>Project Information</h4>'),
            Row(
                Column('projectID', css_class='form-group col-md-6'),
                Column('project_Category', css_class='form-group col-md-6'),
            ),
            Row(
                Column('compID', css_class='form-group col-md-4'),
                Column('subcompID', css_class='form-group col-md-4'),
                Column('activityID', css_class='form-group col-md-4'),
            ),
            Row(
                Column('funding_source', css_class='form-group col-md-6'),
                Column('currency', css_class='form-group col-md-6'),
            ),
            
            HTML('<hr><h4>Contract Details</h4>'),
            Row(
                Column('contract_refNo', css_class='form-group col-md-6'),
                Column('contract_value', css_class='form-group col-md-6'),
            ),
            Row(
                Column('name_of_contractor', css_class='form-group col-md-6'),
                Column('name_of_consultant', css_class='form-group col-md-6'),
            ),
            Row(
                Column('contract_start_date', css_class='form-group col-md-4'),
                Column('contract_end_date', css_class='form-group col-md-4'),
                Column('duration', css_class='form-group col-md-4'),
            ),
            Field('amendments'),
            
            HTML('<hr><h4>Project Specifics</h4>'),
            Field('main_intervention_focus_result'),
            Row(
                Column('target_number_of_beneficiary_settlements', css_class='form-group col-md-6'),
                Column('gross_floor_area_m2', css_class='form-group col-md-6'),
            ),
            Field('location_of_investment'),
            Row(
                Column('Latitude', css_class='form-group col-md-6'),
                Column('Longitude', css_class='form-group col-md-6'),
            ),
            Field('remarks'),
            
            FormActions(
                Submit('submit', 'Save Contract', css_class='btn btn-primary'),
                HTML('<a href="{% url "project_actions:contract_profiling_works-list" %}" class="btn btn-secondary ms-2">Cancel</a>')
            )
        )

    def clean(self):
        cleaned_data = super().clean()
        start_date = cleaned_data.get('contract_start_date')
        end_date = cleaned_data.get('contract_end_date')
        contract_value = cleaned_data.get('contract_value')
        
        # Validate dates
        if start_date and end_date:
            if start_date >= end_date:
                raise ValidationError("Contract end date must be after start date.")
        
        # Validate contract value
        if contract_value and contract_value <= 0:
            raise ValidationError("Contract value must be greater than zero.")
        
        # Validate coordinates
        latitude = cleaned_data.get('Latitude')
        longitude = cleaned_data.get('Longitude')
        if latitude is not None and (latitude < -90 or latitude > 90):
            raise ValidationError("Latitude must be between -90 and 90 degrees.")
        if longitude is not None and (longitude < -180 or longitude > 180):
            raise ValidationError("Longitude must be between -180 and 180 degrees.")
            
        return cleaned_data


class ContractProfilingGoodsServicesForm(forms.ModelForm):
    """Enhanced form for Contract Profiling Goods & Services"""
    
    class Meta:
        model = Contract_Profiling_goods_services
        fields = [
            'projectID', 'compID', 'subcompID', 'activityID', 'project_Category',
            'funding_source', 'currency', 'contract_value', 'amendments',
            'contract_refNo', 'name_of_Supplier', 'name_of_consultant',
            'contract_start_date', 'contract_end_date', 'remarks'
        ]
        widgets = {
            'contract_start_date': forms.DateInput(attrs={'type': 'date', 'class': 'form-control'}),
            'contract_end_date': forms.DateInput(attrs={'type': 'date', 'class': 'form-control'}),
            'remarks': forms.Textarea(attrs={'rows': 4}),
            'contract_value': forms.NumberInput(attrs={'step': '0.01', 'min': '0'}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.form_method = 'post'
        self.helper.form_class = 'form-horizontal'
        self.helper.label_class = 'col-lg-3'
        self.helper.field_class = 'col-lg-9'
        
        # Make certain fields required (based on model constraints)
        self.fields['projectID'].required = True
        self.fields['compID'].required = True
        self.fields['subcompID'].required = True
        self.fields['activityID'].required = True
        self.fields['project_Category'].required = True
        self.fields['funding_source'].required = True
        self.fields['contract_refNo'].required = True
        self.fields['name_of_consultant'].required = True
        self.fields['contract_value'].required = True
        self.fields['contract_start_date'].required = True
        self.fields['contract_end_date'].required = True
        self.fields['remarks'].required = True
        
        # Make optional fields truly optional
        self.fields['currency'].required = False
        self.fields['name_of_Supplier'].required = False
        self.fields['amendments'].required = False
        
        # Add help texts
        self.fields['contract_refNo'].help_text = 'Unique contract reference number'
        self.fields['name_of_Supplier'].help_text = 'Name of goods/services supplier'
        self.fields['amendments'].help_text = 'Check if this contract has amendments'
        
        self.helper.layout = Layout(
            HTML('<h4>Project Information</h4>'),
            Row(
                Column('projectID', css_class='form-group col-md-6'),
                Column('project_Category', css_class='form-group col-md-6'),
            ),
            Row(
                Column('compID', css_class='form-group col-md-4'),
                Column('subcompID', css_class='form-group col-md-4'),
                Column('activityID', css_class='form-group col-md-4'),
            ),
            Row(
                Column('funding_source', css_class='form-group col-md-6'),
                Column('currency', css_class='form-group col-md-6'),
            ),
            
            HTML('<hr><h4>Contract Details</h4>'),
            Row(
                Column('contract_refNo', css_class='form-group col-md-6'),
                Column('contract_value', css_class='form-group col-md-6'),
            ),
            Row(
                Column('name_of_Supplier', css_class='form-group col-md-6'),
                Column('name_of_consultant', css_class='form-group col-md-6'),
            ),
            Row(
                Column('contract_start_date', css_class='form-group col-md-4'),
                Column('contract_end_date', css_class='form-group col-md-4'),
                Column('duration', css_class='form-group col-md-4'),
            ),
            Field('amendments'),
            Field('remarks'),
            
            FormActions(
                Submit('submit', 'Save Contract', css_class='btn btn-primary'),
                HTML('<a href="{% url "project_actions:contract_profiling_goods_services_list" %}" class="btn btn-secondary ms-2">Cancel</a>')
            )
        )

    def clean(self):
        cleaned_data = super().clean()
        start_date = cleaned_data.get('contract_start_date')
        end_date = cleaned_data.get('contract_end_date')
        contract_value = cleaned_data.get('contract_value')
        
        # Validate dates
        if start_date and end_date:
            if start_date >= end_date:
                raise ValidationError("Contract end date must be after start date.")
        
        # Validate contract value
        if contract_value and contract_value <= 0:
            raise ValidationError("Contract value must be greater than zero.")
            
        return cleaned_data


class SpecificContractMonitoringForm(forms.ModelForm):
    """Enhanced form for Specific Contract Monitoring"""
    
    class Meta:
        model = Specific_Contract_Monitoring
        fields = [
            'project', 'contract_refNo', 'monitoring_date', 'quarter',
            'type_of_monitoring', 'Type_of_Investment', 'Kpi_description',
            'milestone_start_date', 'milestone_end_date', 'Target',
            'Achieved_status', 'Contract_implementation_Status',
            'picture_of_status', 'remarks'
        ]
        widgets = {
            'monitoring_date': forms.DateInput(attrs={'type': 'date', 'class': 'form-control'}),
            'milestone_start_date': forms.DateInput(attrs={'type': 'date', 'class': 'form-control'}),
            'milestone_end_date': forms.DateInput(attrs={'type': 'date', 'class': 'form-control'}),
            'Target': forms.Textarea(attrs={'rows': 3}),
            'Achieved_status': forms.Textarea(attrs={'rows': 3}),
            'remarks': forms.Textarea(attrs={'rows': 4}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.form_method = 'post'
        self.helper.form_class = 'form-horizontal'
        self.helper.label_class = 'col-lg-3'
        self.helper.field_class = 'col-lg-9'
        self.helper.attrs = {'enctype': 'multipart/form-data'}
        
        # Handle model imports safely
        try:
            from PIU_Financial_mgt.models import Project
            self.fields['project'].queryset = Project.objects.all()
        except:
            self.fields['project'].queryset = self.fields['project'].queryset.none()
            
        try:
            from setup.models import Quarter, Type_of_Monitoring, Physicalprogress
            from PIU_Financial_mgt.models import KPI_For_Contract
            self.fields['quarter'].queryset = Quarter.objects.all()
            self.fields['type_of_monitoring'].queryset = Type_of_Monitoring.objects.all()
            self.fields['Contract_implementation_Status'].queryset = Physicalprogress.objects.all()
            
            # Handle KPI fields with fallback
            kpi_queryset = KPI_For_Contract.objects.all()
            self.fields['Type_of_Investment'].queryset = kpi_queryset
            self.fields['Kpi_description'].queryset = kpi_queryset
            
            # If no KPI data exists, make fields optional and add helpful text
            if not kpi_queryset.exists():
                self.fields['Type_of_Investment'].required = False
                self.fields['Kpi_description'].required = False
                self.fields['Type_of_Investment'].help_text = 'No KPI data available. Please contact administrator to set up KPI records.'
                self.fields['Kpi_description'].help_text = 'No KPI data available. Please contact administrator to set up KPI records.'
            else:
                # Make fields optional initially - they'll be populated via AJAX
                self.fields['Type_of_Investment'].required = False
                self.fields['Kpi_description'].required = False
                self.fields['Type_of_Investment'].help_text = 'Will be populated based on project and monitoring type selection'
                self.fields['Kpi_description'].help_text = 'Will be populated based on type of investment selection'
                
        except ImportError:
            # Handle missing setup models gracefully
            self.fields['quarter'].queryset = self.fields['quarter'].queryset.none()
            self.fields['type_of_monitoring'].queryset = self.fields['type_of_monitoring'].queryset.none()
            self.fields['Contract_implementation_Status'].queryset = self.fields['Contract_implementation_Status'].queryset.none()
            self.fields['Type_of_Investment'].queryset = self.fields['Type_of_Investment'].queryset.none()
            self.fields['Kpi_description'].queryset = self.fields['Kpi_description'].queryset.none()
            
            # Make KPI fields optional if models don't exist
            self.fields['Type_of_Investment'].required = False
            self.fields['Kpi_description'].required = False
        
        # Make certain fields required
        self.fields['project'].required = True
        self.fields['contract_refNo'].required = True
        self.fields['monitoring_date'].required = True
        self.fields['quarter'].required = True
        self.fields['type_of_monitoring'].required = True
        
        # Set up cascading dropdown fields for both SQLite and SQL Server
        self.fields['Type_of_Investment'].required = True
        self.fields['Kpi_description'].required = True
        
        # Set default monitoring date to today
        if not self.instance.pk:
            self.fields['monitoring_date'].initial = timezone.now().date()
            self.fields['milestone_start_date'].initial = timezone.now().date()
            # Set end date to tomorrow to avoid validation issues
            from datetime import timedelta
            self.fields['milestone_end_date'].initial = (timezone.now() + timedelta(days=1)).date()
        
        # Add help texts
        self.fields['contract_refNo'].help_text = 'Reference number of the contract being monitored'
        self.fields['picture_of_status'].help_text = 'Upload image showing current status (max 5MB)'
        self.fields['Target'].help_text = 'Describe the specific target for this milestone'
        self.fields['Achieved_status'].help_text = 'Describe what has been achieved vs the target'
        
        self.helper.layout = Layout(
            HTML('<h4>Monitoring Information</h4>'),
            Row(
                Column('project', css_class='form-group col-md-6'),
                Column('contract_refNo', css_class='form-group col-md-6'),
            ),
            Row(
                Column('monitoring_date', css_class='form-group col-md-4'),
                Column('quarter', css_class='form-group col-md-4'),
                Column('type_of_monitoring', css_class='form-group col-md-4'),
            ),
            Row(
                Column('Type_of_Investment', css_class='form-group col-md-6'),
                Column('Kpi_description', css_class='form-group col-md-6'),
            ),
            
            HTML('<hr><h4>Milestone Details</h4>'),
            Row(
                Column('milestone_start_date', css_class='form-group col-md-6'),
                Column('milestone_end_date', css_class='form-group col-md-6'),
            ),
            Field('Target'),
            Field('Achieved_status'),
            
            HTML('<hr><h4>Implementation Status</h4>'),
            Field('Contract_implementation_Status'),
            Field('picture_of_status'),
            Field('remarks'),
            
            FormActions(
                Submit('submit', 'Save Monitoring Record', css_class='btn btn-primary'),
                HTML('<a href="{% url "project_actions:contract_monitoring_list" %}" class="btn btn-secondary ms-2">Cancel</a>')
            )
        )

    def clean(self):
        cleaned_data = super().clean()
        monitoring_date = cleaned_data.get('monitoring_date')
        start_date = cleaned_data.get('milestone_start_date')
        end_date = cleaned_data.get('milestone_end_date')
        picture = cleaned_data.get('picture_of_status')
        
        # Validate dates
        if start_date and end_date:
            if start_date > end_date:
                raise ValidationError("Milestone end date must be after or equal to start date.")
        
        if monitoring_date:
            if monitoring_date > timezone.now().date():
                raise ValidationError("Monitoring date cannot be in the future.")
        
        # Validate image file
        if picture:
            if picture.size > 5 * 1024 * 1024:  # 5MB limit
                raise ValidationError("Image file too large (max 5MB).")
            
            valid_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
            if not any(picture.name.lower().endswith(ext) for ext in valid_extensions):
                raise ValidationError("Invalid image format. Please use JPG, PNG, GIF, or WebP.")
        
        # Validate cascading dropdown fields for both SQLite and SQL Server
        project = cleaned_data.get('project')
        type_of_monitoring = cleaned_data.get('type_of_monitoring')
        type_of_investment = cleaned_data.get('Type_of_Investment')
        kpi_description = cleaned_data.get('Kpi_description')
        
        # Check if cascading fields are properly selected
        if project and type_of_monitoring and not type_of_investment:
            raise ValidationError("Please select a Type of Investment.")
        
        if type_of_investment and not kpi_description:
            raise ValidationError("Please select a KPI Description.")
        
        # For SQL Server compatibility, validate that the selected options exist in the database
        if project and type_of_monitoring and type_of_investment:
            try:
                from django.db import connection
                from PIU_Financial_mgt.models import KPI_For_Contract
                
                # Check if we're using SQL Server
                if True:  # Force SQL Server mode - always use raw SQL queries
                    # Validate using raw SQL for SQL Server
                    with connection.cursor() as cursor:
                        table_names = [
                            '[piuprod3].[dbo].[PIU_Financial_mgt_kpi_for_contract]',
                            '[piuprod3].[dbo].[PIU_Financial_mgt_kpi_for_contract]',
                            'PIU_Financial_mgt_kpi_for_contract'
                        ]
                        
                        for table_name in table_names:
                            try:
                                # Check if the selected Type_of_Investment exists for this project
                                query = "SELECT COUNT(*) FROM " + table_name + " WHERE project_id = ? AND monitoring_type_id = ? AND type_of_investment = ?"
                                cursor.execute(query, (project.projectID, type_of_monitoring.monitoring_type_id, type_of_investment.type_of_investment))
                                
                                count = cursor.fetchone()[0]
                                if count == 0:
                                    raise ValidationError(f"Selected Type of Investment is not available for project {project.projectID}")
                                break
                            except Exception:
                                continue
                else:
                    # SQLite - use Django ORM validation
                    if not KPI_For_Contract.objects.filter(
                        project=project,
                        monitoring_type=type_of_monitoring,
                        type_of_investment=type_of_investment.type_of_investment
                    ).exists():
                        raise ValidationError("Selected Type of Investment is not available for this project and monitoring type.")
                        
            except Exception as e:
                # If validation fails, log but don't block saving
                import logging
                logger = logging.getLogger(__name__)
                logger.warning(f"Cascading dropdown validation failed: {e}")
        
        return cleaned_data


# Quick form for AJAX operations
class QuickContractMonitoringForm(forms.Form):
    """Quick form for adding monitoring records via AJAX"""
    contract_ref = forms.CharField(max_length=50, required=True)
    monitoring_date = forms.DateField(widget=forms.DateInput(attrs={'type': 'date'}))
    status = forms.CharField(max_length=200, required=True)
    remarks = forms.CharField(widget=forms.Textarea(attrs={'rows': 2}), required=False)
