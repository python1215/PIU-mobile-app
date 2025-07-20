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

    pdo = forms.ModelChoiceField(
       
        queryset=PDO.objects.none(),  # Initially empty until a project is selected
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
        queryset=Project.objects.filter(project__icontains='water'),
        widget=forms.Select(
            attrs={
                "hx-get": reverse_lazy("monitoring:load_project_PDO"), 
                "hx-target": "#id_pdo", 
                "hx-trigger": "change",  # Trigger when project changes
            }
        )
    )

    pdo = forms.ModelChoiceField(
        queryset=PDO.objects.none(),  # Initially empty until a project is selected
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
        queryset=Project.objects.filter(project__icontains='water'),
        widget=forms.Select(
            attrs={
                "hx-get": reverse_lazy("monitoring:load_project_PDO"), 
                "hx-target": "#id_pdo", 
                "hx-trigger": "change",  # Trigger when project changes
            }
        )
    )

    pdo = forms.ModelChoiceField(
        queryset=PDO.objects.none(),  # Initially empty until a project is selected
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

    project_result = forms.ModelChoiceField(
        queryset=ProjectResult.objects.none(),  # Initially empty until project_outcome is selected
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

        # For editing mode, set all querysets to show all options initially
        # Make required fields actually required for database integrity
        self.fields['project_outcome'].required = True
        self.fields['project_result'].required = True
        self.fields['pdo'].required = True
        
        # Populate all querysets for editing
        self.fields['pdo'].queryset = PDO.objects.all()
        self.fields['project_outcome'].queryset = ProjectOutCome.objects.all()
        self.fields['project_result'].queryset = ProjectResult.objects.all()
        
        # If this is bound form with instance, set proper cascading relationships
        if self.instance and self.instance.pk:
            if self.instance.project:
                self.fields['pdo'].queryset = PDO.objects.filter(project=self.instance.project)
            if self.instance.pdo:
                self.fields['project_outcome'].queryset = ProjectOutCome.objects.filter(pdo=self.instance.pdo)
            if self.instance.project_outcome:
                self.fields['project_result'].queryset = ProjectResult.objects.filter(project_outcome=self.instance.project_outcome)
        # HTMX will handle dynamic filtering
        self.fields['pdo'].queryset = PDO.objects.all()
        self.fields['project_outcome'].queryset = ProjectOutCome.objects.all()
        self.fields['project_result'].queryset = ProjectResult.objects.all()

        if self.instance.pk:  # Check if instance is being loaded for editing
            # Ensure pdo is not None before filtering
            if hasattr(self.instance, 'pdo') and self.instance.pdo:
                self.fields['project_outcome'].queryset = ProjectOutCome.objects.filter(pdo=self.instance.pdo)

            # Set the queryset for project_result based on the selected project_outcome
            if hasattr(self.instance, 'project_outcome') and self.instance.project_outcome:
                self.fields['project_result'].queryset = ProjectResult.objects.filter(project_outcome=self.instance.project_outcome)

        # If 'project' is in the data, filter pdo options
        if 'project' in self.data:
            try:
                project_id = self.data.get('project')
                self.fields['pdo'].queryset = PDO.objects.filter(project_id=project_id)
            except (ValueError, TypeError):
                pass

        # If 'pdo' is in the data, filter project_outcome options
        if 'pdo' in self.data:
            try:
                pdo_id = self.data.get('pdo')
                self.fields['project_outcome'].queryset = ProjectOutCome.objects.filter(pdo_id=pdo_id)
            except (ValueError, TypeError):
                pass

        # If 'project_outcome' is in the data, filter project_result options
        if 'project_outcome' in self.data:
            try:
                project_outcome_id = self.data.get('project_outcome')
                self.fields['project_result'].queryset = ProjectResult.objects.filter(project_outcome_id=project_outcome_id)
            except (ValueError, TypeError):
                pass


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