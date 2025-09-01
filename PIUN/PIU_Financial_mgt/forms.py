from django import forms
from .models import Project, Component, Subcomponent, Activities, PDO, ProjectOutCome, ProjectResult, Currency
from setup.models import Donor
from django.urls import reverse_lazy
from datetime import datetime


class addProjectForm(forms.ModelForm):
    
    # Add field definitions directly in the form
    effectiveness_Date = forms.DateTimeField(
        widget=forms.DateTimeInput(attrs={'type': 'datetime-local'}),
        input_formats=['%Y-%m-%dT%H:%M', '%Y-%m-%d %H:%M', '%m/%d/%Y %H:%M'],
        required=False  # Make it optional if needed
    )
    
    closure_Date = forms.DateTimeField(
        widget=forms.DateTimeInput(attrs={'type': 'datetime-local'}),
        input_formats=['%Y-%m-%dT%H:%M', '%Y-%m-%d %H:%M', '%m/%d/%Y %H:%M'],
        required=False
    )
    
    last_date_of_Disbursement = forms.DateTimeField(
        widget=forms.DateTimeInput(attrs={'type': 'datetime-local'}),
        input_formats=['%Y-%m-%dT%H:%M', '%Y-%m-%d %H:%M', '%m/%d/%Y %H:%M'],
        required=False
    )
    
    class Meta:
        model = Project
        fields = (
            'projectID', 'project', 'currency', 'funding', 'donors', 'contributors', 
            'effectiveness_Date', 'closure_Date', 'last_date_of_Disbursement'
        )

    donors = forms.ModelMultipleChoiceField(
        queryset=Donor.objects.all(),
        widget=forms.SelectMultiple(attrs={'class': 'input input-sm w-full bg-white text-gray-900'}),
        required=False
    )



class addComponentForm(forms.ModelForm):
    class Meta:
        model = Component
        fields = ['projectID','project_components','component_description','currency','allocation']


#######update subcomponent form ################################################333

class updatesubcomponentForm(forms.ModelForm):
    projectID = forms.ModelChoiceField(
        queryset=Project.objects.all(),
        widget=forms.Select(attrs={
            "hx-get": reverse_lazy('PIU_Financial_mgt:load_project_components'),
            "hx-target": "#id_compID"
        }),
        empty_label="Select Project...",
        to_field_name='projectID'
    )
    compID = forms.ModelChoiceField(
        queryset=Component.objects.none(), 
        required=True,
        empty_label="Select Component..."
    )
    
    # Fix currency field validation by explicitly setting queryset
    currency = forms.ModelChoiceField(
        queryset=Currency.objects.all(),
        widget=forms.Select(attrs={'class': 'form-select'})
    )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        # Override the project field to only show project names
        self.fields['projectID'].label_from_instance = lambda obj: obj.project

        # Ensure compID field doesn't cause errors if missing
        self.fields['compID'].queryset = Component.objects.none()

        # Editing an existing subcomponent
        if self.instance and self.instance.pk:
            if hasattr(self.instance, 'projectID') and self.instance.projectID:  # Ensure projectID exists
                self.fields['compID'].queryset = Component.objects.filter(projectID=self.instance.projectID)

            if hasattr(self.instance, 'compID') and self.instance.compID_id:  # Check using compID_id to avoid errors
                self.fields['compID'].initial = self.instance.compID

        # Handling dynamic updates when projectID is selected from the form
        elif 'projectID' in self.data:
            try:
                projectID = int(self.data.get('projectID'))  # Convert to int safely
                self.fields['compID'].queryset = Component.objects.filter(projectID=projectID)
            except (ValueError, TypeError):
                pass  # Handle invalid data gracefully

    class Meta:
        model = Subcomponent
        fields = ['projectID', 'compID', 'subcomponent', 'subcomponent_Description', 'currency', 'allocation']


# class updatesubcomponentForm(forms.ModelForm):
#     projectID = forms.ModelChoiceField(
#         queryset=Project.objects.all(),
#         widget=forms.Select(attrs={
#             "hx-get": reverse_lazy('PIU_Financial_mgt:load_project_components'),
#             "hx-target": "#id_compID"
#         })
#     )
#     compID = forms.ModelChoiceField(queryset=Component.objects.none())

#     def __init__(self, *args, **kwargs):
#         super().__init__(*args, **kwargs)

#         # If editing an existing subcomponent
#         if self.instance and self.instance.pk:
#             if self.instance.projectID:  # Ensure projectID is set
#                 self.fields['compID'].queryset = Component.objects.filter(projectID=self.instance.projectID)
#                 self.fields['compID'].initial = self.instance.compID  # Set initial value

#         # If projectID is set from a submitted form (dynamic updates)
#         elif 'projectID' in self.data:
#             try:
#                 projectID = int(self.data.get('projectID'))  # Convert to int
#                 self.fields['compID'].queryset = Component.objects.filter(projectID=projectID)
#             except (ValueError, TypeError):
#                 pass  # Handle invalid data gracefully

#     class Meta:
#         model = Subcomponent
#         fields = ['projectID', 'compID', 'subcomponent', 'subcomponent_Description', 'currency', 'allocation']


###################################### ADD Subcomponent form ####################################3
class addsubcomponentForm(forms.ModelForm):
    # Custom field that explicitly displays only project names
    projectID = forms.ModelChoiceField(
        queryset=Project.objects.all(),
        widget=forms.Select(attrs={"hx-get": reverse_lazy('PIU_Financial_mgt:load_project_components'), "hx-target": "#id_compID"}),
        empty_label="Select Project..."
    )
    compID = forms.ModelChoiceField(
        queryset=Component.objects.none(),
        empty_label="Select Component..."
    )
    
    # Fix currency field validation by explicitly setting queryset
    currency = forms.ModelChoiceField(
        queryset=Currency.objects.all(),
        widget=forms.Select(attrs={'class': 'form-select'}),
        empty_label="Select Currency..."
    )
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        # Override the project field to only show project names
        self.fields['projectID'].label_from_instance = lambda obj: obj.project

        if 'projectID' in self.data:
            projectID = str(self.data.get('projectID'))
            # projectID =int(self.data.get('projectID'))
            self.fields['compID'].queryset = Component.objects.filter(projectID=projectID)

    class Meta:
        model = Subcomponent
        fields = ['projectID', 'compID', 'subcomponent', 'subcomponent_Description', 'currency','allocation']
        

class addActivitiesForm(forms.ModelForm):

    projectID = forms.ModelChoiceField(
        queryset=Project.objects.all(),
        widget=forms.Select(attrs={"hx-get":  reverse_lazy('PIU_Financial_mgt:load_project_components'), "hx-target": "#id_compID"}),
        empty_label="Select Project...",
        to_field_name='projectID'
    )

    compID = forms.ModelChoiceField(
        queryset=Component.objects.all(),
        widget=forms.Select(attrs={"hx-get": reverse_lazy("PIU_Financial_mgt:load_project_subcomponents"), "hx-target": "#id_subcompID"}),
        empty_label="Select Component..."
    )

    subcompID = forms.ModelChoiceField(
        queryset=Subcomponent.objects.none(), 
        required=False,
        empty_label="Select Subcomponent..."
    )

   
    class Meta:
        model = Activities
        fields = ['year','projectID','compID','subcompID','activityID','activity', 'currency', 'allocation']
        

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        # Override the project field to only show project names
        self.fields['projectID'].label_from_instance = lambda obj: obj.project
        
        if 'projectID' in self.data:
            try:
                projectID = str(self.data.get('projectID'))
                self.fields['compID'].queryset = Component.objects.filter(projectID=projectID)
            except (ValueError, TypeError):
                pass

        if 'compID' in self.data:
            try:
                compID = str(self.data.get('compID'))
                self.fields['subcompID'].queryset = Subcomponent.objects.filter(compID=compID)
            except (ValueError, TypeError):
                pass

################################3update Activity ###############################################

class updateActivitiesForm(forms.ModelForm):
    projectID = forms.ModelChoiceField(
        queryset=Project.objects.all(),
        widget=forms.Select(attrs={
            "hx-get": reverse_lazy('PIU_Financial_mgt:load_project_components'), 
            "hx-target": "#id_compID",
            "class": "form-control"
        }),
        required=True,
        label="Project",
        empty_label="Select Project...",
        to_field_name='projectID'
    )

    compID = forms.ModelChoiceField(
        queryset=Component.objects.all(),
        widget=forms.Select(attrs={
 

            "class": "form-control"
        }),
        required=False,
        label="Component"
    )

    subcompID = forms.ModelChoiceField(
        queryset=Subcomponent.objects.all(),
        widget=forms.Select(attrs={
            "class": "form-control"
        }),
        required=False,
        label="Subcomponent"
    )

    class Meta:
        model = Activities
        fields = [
            'year', 'projectID', 'compID', 'subcompID', 
            'activityID', 'activity', 'currency', 'allocation'
        ]
        widgets = {
            'year': forms.Select(attrs={'class': 'form-control'}),
            'activityID': forms.TextInput(attrs={'class': 'form-control'}),
            'activity': forms.TextInput(attrs={'class': 'form-control'}),
            'currency': forms.Select(attrs={'class': 'form-control'}),
            'allocation': forms.NumberInput(attrs={'class': 'form-control'})
        }

    def __init__(self, *args, **kwargs):
        # Safely extract instance
        instance = kwargs.get('instance')
        
        super().__init__(*args, **kwargs)
        
        # Override the project field to only show project names
        self.fields['projectID'].label_from_instance = lambda obj: obj.project

        # Editing Mode: Comprehensive Initial Value Setting
        if instance and instance.pk:
            # Always set initial project if exists
            if hasattr(instance, 'projectID') and instance.projectID:
                self.fields['projectID'].initial = instance.projectID
                
                # Filter components for this project (but keep all available)
                if hasattr(instance, 'compID') and instance.compID:
                    self.fields['compID'].initial = instance.compID
                    
                    # Filter subcomponents for this component (but keep all available)
                    if hasattr(instance, 'subcompID') and instance.subcompID:
                        self.fields['subcompID'].initial = instance.subcompID

        # Dynamic Updates from Form Submission
        elif self.data:
            try:
                # Project-based component filtering
                if 'projectID' in self.data:
                    projectID = int(self.data.get('projectID'))
                    
                    # Keep all components, but hint available components
                    self.fields['compID'].queryset = Component.objects.all()

                # Component-based subcomponent filtering
                if 'compID' in self.data:
                    compID = int(self.data.get('compID'))
                    
                    # Keep all subcomponents, but hint available subcomponents
                    self.fields['subcompID'].queryset = Subcomponent.objects.all()

            except (ValueError, TypeError):
                # Gracefully handle invalid data
                self.add_error('projectID', 'Invalid selection')

    def clean(self):
        cleaned_data = super().clean()
        
        # Custom validation logic
        projectID = cleaned_data.get('projectID')
        compID = cleaned_data.get('compID')
        subcompID = cleaned_data.get('subcompID')

        # Validate component belongs to project
        if projectID and compID:
            if not Component.objects.filter(projectID=projectID, pk=compID.pk).exists():
                self.add_error('compID', 'Selected component does not belong to the chosen project')

        # Validate subcomponent belongs to component
        if compID and subcompID:
            if not Subcomponent.objects.filter(compID=compID, pk=subcompID.pk).exists():
                self.add_error('subcompID', 'Selected subcomponent does not belong to the chosen component')

        return cleaned_data

# class updateActivitiesForm(forms.ModelForm):
#     projectID = forms.ModelChoiceField(
#         queryset=Project.objects.all(),
#         widget=forms.Select(attrs={"hx-get": reverse_lazy('PIU_Financial_mgt:load_project_components'), "hx-target": "#id_compID"}),
#     )

#     compID = forms.ModelChoiceField(
#         queryset=Component.objects.all(),
#         widget=forms.Select(attrs={"hx-get": reverse_lazy("load_project_subcomponents"), "hx-target": "#id_subcompID"})
#     )

#     subcompID = forms.ModelChoiceField(queryset=Subcomponent.objects.none(), required=False)

#     class Meta:
#         model = Activities
#         fields = ['year', 'projectID', 'compID', 'subcompID', 'activityID', 'activity', 'currency', 'allocation']

#     def __init__(self, *args, **kwargs):
#         super().__init__(*args, **kwargs)

#         # Editing Mode: Set initial selected values
#         if self.instance and self.instance.pk:
#             if self.instance.compID:
#                 self.fields['subcompID'].queryset = Subcomponent.objects.filter(compID=self.instance.compID)
#                 self.fields['subcompID'].initial = self.instance.subcompID  # Set initial value

#             if self.instance.projectID:
#                 self.fields['compID'].queryset = Component.objects.filter(projectID=self.instance.projectID)
#                 self.fields['compID'].initial = self.instance.compID  # Set initial value

#         # New Form: Handle dynamically loaded data
#         elif 'projectID' in self.data:
#             try:
#                 projectID = int(self.data.get('projectID'))
#                 self.fields['compID'].queryset = Component.objects.filter(projectID=projectID)
#             except (ValueError, TypeError):
#                 pass

#         if 'compID' in self.data:
#             try:
#                 compID = int(self.data.get('compID'))
#                 self.fields['subcompID'].queryset = Subcomponent.objects.filter(compID=compID)
#             except (ValueError, TypeError):
#                 pass


class PdoForm(forms.ModelForm):
    class Meta:
        model = PDO
        fields = ['project', 'pdo_statement',]
        widgets = {
            'Date_Created': forms.DateTimeInput(attrs={'type': 'datetime-local', 'value': datetime.now().strftime('%Y-%m-%dT%H:%M')}),
        }

class ProjectOutcomeForm(forms.ModelForm):
    class Meta:
        model = ProjectOutCome
        fields = ['pdo', 'project_outcome',]
        widgets = {
            'Date_Created': forms.DateTimeInput(attrs={'type': 'datetime-local', 'value': datetime.now().strftime('%Y-%m-%dT%H:%M')}),
        }

class ProjectResultForm(forms.ModelForm):
    class Meta:
        model = ProjectResult
        fields = ['project_outcome', 'project_result']
        widgets = {
            'Date_Created': forms.DateTimeInput(attrs={'type': 'datetime-local', 'value': datetime.now().strftime('%Y-%m-%dT%H:%M')}),
        }