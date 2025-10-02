from django import forms
from .models import   ProjectResult,Indicator_Description, Results_Oriented_Monitoring
from PIU_Financial_mgt.models import Project, PDO, ProjectOutCome, ProjectResult
from datetime import datetime
from django.urls import reverse_lazy

class Indicator_DescriptionForm(forms.ModelForm):
     # Get the various selection when one item is selected

    project = forms.ModelChoiceField(
        queryset=Project.objects.filter(projectID='NAWEC'),
        widget=forms.Select(
            attrs={
                "hx-get": reverse_lazy("monitoring:load_project_PDO"),
                "hx-target": "#id_pdo",
                "hx-trigger": "change",
            }
        )
    )

    project_outcome = forms.ModelChoiceField(
       
        queryset=ProjectOutCome.objects.none(),  # Initially empty until a project is selected
        widget=forms.Select(
            attrs={
                "hx-get": reverse_lazy("monitoring:load_project_Outcome"),
                "hx-include": "[name='pdo']" , # Include pdo field value in the request
                "hx-target": "#id_project_outcome"
            }
        ),
        required=True
    )

    project_outcome = forms.ModelChoiceField(
        queryset=ProjectOutCome.objects.all(),
        widget=forms.Select(
            attrs={
                "hx-get": reverse_lazy("monitoring:load_project_Result"),
                "hx-target": "#id_project_result",
            }
        )
    )

    class Meta:
        model = Indicator_Description
        fields = ['project', 'pdo', 'project_outcome', 'project_result', 'indicator_type', 'indicator_description']
        widgets = {
            'Date_Created': forms.DateTimeInput(attrs={'type': 'datetime-local', 'value': datetime.now().strftime('%Y-%m-%dT%H:%M')}),
        }


    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        if 'project' in self.data:  # Use the correct key
            try:
                project_id = self.data.get('project')  # Adjust this to match your field name
                self.fields['pdo'].queryset = PDO.objects.filter(project_id=project_id)
            except (ValueError, TypeError):
                pass

        if 'pdo' in self.data:  # Use the correct key
            try:
                pdo_id = self.data.get('pdo')  # Adjust this to match your field name
                self.fields['project_outcome'].queryset = ProjectOutCome.objects.filter(pdo_id=pdo_id)
            except (ValueError, TypeError):
                pass

        if 'project_outcome' in self.data:  # Use the correct key
            try:
                project_outcome_id = self.data.get('project_outcome')  # Adjust this to match your field name
                self.fields['project_result'].queryset = ProjectResult.objects.filter(project_outcome_id=project_outcome_id)
            except (ValueError, TypeError):
                pass

class Results_Oriented_MonitoringForm(forms.ModelForm):
    project = forms.ModelChoiceField(
        queryset=Project.objects.all().order_by('project'),
        widget=forms.Select(
            attrs={
                "hx-get": reverse_lazy("monitoring:load_project_PDO"), 
                "hx-target": "#id_pdo", 
                "hx-trigger": "change",  # Trigger when project changes
            }
        )
    )

    project_outcome = forms.ModelChoiceField(
        queryset=ProjectOutCome.objects.none(),  # Initially empty until a project is selected
        widget=forms.Select(
            attrs={
                "hx-get": reverse_lazy("monitoring:load_project_Outcome"), 
                "hx-target": "#id_project_outcome",
                "hx-trigger": "change",  # Trigger when PDO changes
            }
        ),
        required=False
    )

    project_outcome = forms.ModelChoiceField(
        queryset=ProjectOutCome.objects.none(),  # Initially empty until PDO is selected
        widget=forms.Select(
            attrs={
                "hx-get": reverse_lazy("monitoring:load_project_Result"), 
                "hx-target": "#id_project_result",
                "hx-trigger": "change",  # Trigger when outcome changes
            }
        ),
        required=False
    )

 
    class Meta:
        model = Results_Oriented_Monitoring
        fields = ['year', 'quarter', 'project', 'pdo', 'project_outcome', 'project_result',
                  'indicator_type', 'indicator_description', 'measurement_unit', 'collection_frequency',
                  'baseline_value', 'achieved_value', 'End_Target_Value',
                  'percentage_achieved_vs_baseline', 'percentage_achieved_vs_end_target', 'remarks']
        widgets = {
            'indicator_description': forms.Textarea(attrs={'rows': 2, 'class': 'form-control'}),
            'remarks': forms.Textarea(attrs={'rows': 2, 'class': 'form-control'}),
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        # Set all cascading fields to show all available options
        # HTMX handles dynamic filtering on the frontend
        self.fields['pdo'].queryset = PDO.objects.all()
        self.fields['project_outcome'].queryset = ProjectOutCome.objects.all()
        self.fields['project_result'].queryset = ProjectResult.objects.all()   
            

class updateResults_Oriented_MonitoringForm(forms.ModelForm):
    project = forms.ModelChoiceField(
        queryset=Project.objects.all().order_by('project'),
        widget=forms.Select()
    )

    project_outcome = forms.ModelChoiceField(
        queryset=PDO.objects.all(),  # Show all PDOs for editing mode
        widget=forms.Select(),
        required=False
    )

    project_outcome = forms.ModelChoiceField(
        queryset=ProjectOutCome.objects.all(),  # Show all outcomes for editing mode
        widget=forms.Select(),
        required=False
    )

    project_result = forms.ModelChoiceField(
        queryset=ProjectResult.objects.all(),  # Show all results for editing mode
        required=False
    )

    class Meta:
        model = Results_Oriented_Monitoring
        fields = ['year', 'quarter', 'project', 'pdo', 'project_outcome', 'project_result',
                  'indicator_type', 'indicator_description', 'measurement_unit', 'collection_frequency',
                  'baseline_value', 'achieved_value', 'End_Target_Value',
                  'percentage_achieved_vs_baseline', 'percentage_achieved_vs_end_target', 'remarks']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        # Make required fields actually required for database integrity
        self.fields['project_outcome'].required = True
        self.fields['project_result'].required = True
        self.fields['pdo'].required = True
        
        # Set initial querysets - show all options for editing
        self.fields['pdo'].queryset = PDO.objects.all()
        self.fields['project_outcome'].queryset = ProjectOutCome.objects.all()
        self.fields['project_result'].queryset = ProjectResult.objects.all()
        
        # If this is an editing form with an existing instance, set explicit initial values
        if self.instance and self.instance.pk:
            # Explicitly set all form field initial values to ensure they display correctly
            self.initial['project'] = self.instance.project.pk if self.instance.project else None
            self.initial['pdo'] = self.instance.pdo.id if self.instance.pdo else None
            self.initial['project_outcome'] = self.instance.project_outcome.id if self.instance.project_outcome else None
            self.initial['project_result'] = self.instance.project_result.id if self.instance.project_result else None
            self.initial['indicator_type'] = self.instance.indicator_type.id if self.instance.indicator_type else None
            self.initial['measurement_unit'] = self.instance.measurement_unit.id if self.instance.measurement_unit else None
            self.initial['collection_frequency'] = self.instance.collection_frequency.id if self.instance.collection_frequency else None
            self.initial['year'] = self.instance.year.id if self.instance.year else None
            self.initial['quarter'] = self.instance.quarter.id if self.instance.quarter else None

        # Dynamic filtering for form submission validation
        if self.data:
            # If 'project' is in the data, filter pdo options
            if 'project' in self.data:
                try:
                    project_id = self.data.get('project')
                    if project_id:
                        self.fields['pdo'].queryset = PDO.objects.filter(project_id=project_id)
                except (ValueError, TypeError):
                    # Keep all PDOs if there's an error
                    self.fields['pdo'].queryset = PDO.objects.all()

            # If 'pdo' is in the data, filter project_outcome options
            if 'pdo' in self.data:
                try:
                    pdo_id = self.data.get('pdo')
                    if pdo_id:
                        self.fields['project_outcome'].queryset = ProjectOutCome.objects.filter(pdo_id=pdo_id)
                except (ValueError, TypeError):
                    # Keep all outcomes if there's an error
                    self.fields['project_outcome'].queryset = ProjectOutCome.objects.all()

            # If 'project_outcome' is in the data, filter project_result options
            if 'project_outcome' in self.data:
                try:
                    project_outcome_id = self.data.get('project_outcome')
                    if project_outcome_id:
                        self.fields['project_result'].queryset = ProjectResult.objects.filter(project_outcome_id=project_outcome_id)
                except (ValueError, TypeError):
                    # Keep all results if there's an error
                    self.fields['project_result'].queryset = ProjectResult.objects.all()


################Result Oreiented Monitoring For Nawec KPIs/Nawec KPI Monitoring ################
########        This view visble to only nawec       ############

class Nawec_Kpi_MonitoringForm(forms.ModelForm):
    project = forms.ModelChoiceField(
        queryset=Project.objects.filter(projectID='NAWEC'),
        widget=forms.Select(
            attrs={
                "hx-get": "/monitoring/load_project_PDO", 
                "hx-target": "#id_PDO", 
                "hx-trigger": "change",
            }
        )
    )

    PDO = forms.ModelChoiceField(
        queryset=PDO.objects.none(),
        widget=forms.Select(
            attrs={
                "hx-get": "/monitoring/load_project_Outcome", 
                "hx-target": "#id_project_outcome",
                "hx-trigger": "change",
            }
        ),
        required=False
    )

    project_outcome = forms.ModelChoiceField(
        queryset=ProjectOutCome.objects.none(),
        widget=forms.Select(
            attrs={
                "hx-get": "/monitoring/load_project_Result", 
                "hx-target": "#id_project_result",
                "hx-trigger": "change",
            }
        ),
        required=False
    )

    project_result = forms.ModelChoiceField(
        queryset=ProjectResult.objects.none(),
     
    )
        
    class Meta:
        model = Results_Oriented_Monitoring
        fields = ['year', 'quarter', 'project', 'PDO', 'project_outcome', 'project_result',
                  'indicator_type', 'indicator_description', 'measurement_unit', 'collection_frequency',
                  'baseline_value', 'achieved_value', 'End_Target_Value', 
                  
                   'remarks']
        #'percentage_achieved_vs_baseline', 'percentage_achieved_vs_end_target'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['project'].queryset = Project.objects.filter(projectID='NAWEC')
        self.fields['project'].initial = Project.objects.filter(projectID='NAWEC').first()

        if 'project' in self.data:
            try:
                project_id = self.data.get('project')
                self.fields['PDO'].queryset = PDO.objects.filter(project_id=project_id)
            except (ValueError, TypeError):
                self.fields['PDO'].queryset = PDO.objects.none()

        if 'PDO' in self.data:
            try:
                pdo_id = self.data.get('PDO')
                self.fields['project_outcome'].queryset = ProjectOutCome.objects.filter(pdo_id=pdo_id)
            except (ValueError, TypeError):
                self.fields['project_outcome'].queryset = ProjectOutCome.objects.none()

        if 'project_outcome' in self.data:
            try:
                project_outcome_id = self.data.get('project_outcome')
                self.fields['project_result'].queryset = ProjectResult.objects.filter(project_outcome_id=project_outcome_id)
            except (ValueError, TypeError):
                self.fields['project_result'].queryset = ProjectResult.objects.none()


class Nawec_Kpi_MonitoringForm_tes(forms.ModelForm):
    indicator_description = forms.CharField(widget=forms.Textarea(attrs={'readonly': 'readonly'}), label="Indicator Description", required=False)
    
    class Meta:
        model = Results_Oriented_Monitoring
        fields = ['year', 'quarter', 'project', 'pdo', 'project_outcome', 'project_result', 
                  'indicator_type', 'indicator_description', 'measurement_unit', 'collection_frequency', 
                  'baseline_value', 'achieved_value', 'End_Target_Value', 'remarks']
    
    def __init__(self, *args, **kwargs):
        super(Nawec_Kpi_MonitoringForm, self).__init__(*args, **kwargs)
        if 'project' in self.data and 'indicator_type' in self.data:
            project_id = self.data.get('project')
            indicator_type_id = self.data.get('indicator_type')
            descriptions = Indicator_Description.objects.filter(
                project_id=project_id,
                indicator_type_id=indicator_type_id
            ).values_list('indicator_description', flat=True)
            if descriptions:
                self.fields['indicator_description'].initial = descriptions[0]
            else:
                self.fields['indicator_description'].initial = "No description available for the selected type."


class CascadeFilteringForm(forms.Form):
    """Form for cascade filtering based on project and monitoring type"""
    
    project = forms.ModelChoiceField(
        queryset=Project.objects.all(),
        empty_label="Select Project",
        widget=forms.Select(attrs={
            "class": "form-select",
            "hx-get": reverse_lazy("monitoring:load_monitoring_types"),
            "hx-target": "#id_monitoring_type",
            "hx-trigger": "change"
        }),
        required=True
    )
    
    monitoring_type = forms.ModelChoiceField(
        queryset=None,  # Will be populated via AJAX
        empty_label="Select Type of Monitoring",
        widget=forms.Select(attrs={
            "class": "form-select",
            "hx-get": reverse_lazy("monitoring:load_investment_types"),
            "hx-target": "#id_type_of_investment",
            "hx-include": "[name='project']",
            "hx-trigger": "change"
        }),
        required=False
    )
    
    type_of_investment = forms.ChoiceField(
        choices=[],  # Will be populated via AJAX
        widget=forms.Select(attrs={
            "class": "form-select",
            "hx-get": reverse_lazy("monitoring:load_kpi_descriptions"),
            "hx-target": "#id_kpi_description",
            "hx-include": "[name='project'], [name='monitoring_type']",
            "hx-trigger": "change"
        }),
        required=False
    )
    
    kpi_description = forms.ChoiceField(
        choices=[],  # Will be populated via AJAX
        widget=forms.Select(attrs={
            "class": "form-select"
        }),
        required=False
    )
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        # Import here to avoid circular imports
        from setup.models import Type_of_Monitoring
        from PIU_Financial_mgt.models import KPI_For_Contract
        
        # Initialize monitoring type queryset
        self.fields['monitoring_type'].queryset = Type_of_Monitoring.objects.all()
        
        # Handle initial data for cascade filtering
        if self.data:
            project_id = self.data.get('project')
            monitoring_type_code = self.data.get('monitoring_type')
            
            # Load investment types based on project and monitoring type
            if project_id and monitoring_type_code:
                try:
                    investment_types = KPI_For_Contract.objects.filter(
                        project__projectID=project_id,
                        monitoring_type__monitoring_type_code=monitoring_type_code
                    ).values_list('monitoring_Type_Code', 'type_of_investment').distinct()
                    
                    self.fields['type_of_investment'].choices = [('', 'Select Investment Type')] + [
                        (inv[0], inv[1]) for inv in investment_types if inv[1]
                    ]
                except (ValueError, TypeError):
                    self.fields['type_of_investment'].choices = [('', 'Select Investment Type')]
            
            # Load KPI descriptions based on investment type
            type_of_investment_code = self.data.get('type_of_investment')
            if type_of_investment_code:
                try:
                    kpi_descriptions = KPI_For_Contract.objects.filter(
                        monitoring_Type_Code=type_of_investment_code
                    ).values_list('monitoring_Type_Code', 'Kpi_description').distinct()
                    
                    self.fields['kpi_description'].choices = [('', 'Select KPI Description')] + [
                        (kpi[0], kpi[1]) for kpi in kpi_descriptions if kpi[1]
                    ]
                except (ValueError, TypeError):
                    self.fields['kpi_description'].choices = [('', 'Select KPI Description')]