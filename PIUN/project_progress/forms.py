from django import forms
from .models import ProjectProgress
from PIU_Financial_mgt.models import Project


class ProjectProgressForm(forms.ModelForm):
    class Meta:
        model = ProjectProgress
        fields = ['project', 'total_funding', 'start_date', 'end_date', 'disbursement', 
                  'over_all_disbursement_rate', 'over_all_physical_progress', 'over_project_time_elapsed']
        widgets = {
            'project': forms.Select(attrs={'class': 'form-select'}),
            'total_funding': forms.NumberInput(attrs={'class': 'form-control', 'step': '0.01'}),
            'start_date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'end_date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'disbursement': forms.NumberInput(attrs={'class': 'form-control', 'step': '0.01'}),
            'over_all_disbursement_rate': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'e.g., 75.5%'}),
            'over_all_physical_progress': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'e.g., 60%'}),
            'over_project_time_elapsed': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'e.g., 80%'}),
        }
        labels = {
            'project': 'Project',
            'total_funding': 'Total Funding',
            'start_date': 'Start Date',
            'end_date': 'End Date',
            'disbursement': 'Disbursement Amount',
            'over_all_disbursement_rate': 'Overall Disbursement Rate (%)',
            'over_all_physical_progress': 'Overall Physical Progress (%)',
            'over_project_time_elapsed': 'Project Time Elapsed (%)',
        }
