from django import forms
from .models import ProjectProgress
from PIU_Financial_mgt.models import Project


class ProjectProgressForm(forms.ModelForm):
    class Meta:
        model = ProjectProgress
        fields = ['project', 'total_funding', 'start_date', 'end_date', 'disbursement', 'over_all_disbursement_rate']
        widgets = {
            'project': forms.Select(attrs={'class': 'form-select'}),
            'total_funding': forms.NumberInput(attrs={'class': 'form-control', 'step': '0.01'}),
            'start_date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'end_date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'disbursement': forms.NumberInput(attrs={'class': 'form-control', 'step': '0.01'}),
            'over_all_disbursement_rate': forms.NumberInput(attrs={'class': 'form-control', 'step': '0.01', 'min': '0', 'max': '100'}),
        }
        labels = {
            'project': 'Project',
            'total_funding': 'Total Funding',
            'start_date': 'Start Date',
            'end_date': 'End Date',
            'disbursement': 'Disbursement Amount',
            'over_all_disbursement_rate': 'Overall Disbursement Rate (%)',
        }
