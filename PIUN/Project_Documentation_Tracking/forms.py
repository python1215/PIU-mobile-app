from django import forms
from .models import Project_Documentation_Tracking
from PIU_Financial_mgt.models import Project
from setup.models import DocumentType


class Project_DocumentationTrackingForm(forms.ModelForm):
    
    project = forms.ModelChoiceField(
        queryset=Project.objects.all(),
        empty_label="Select a Project",
        widget=forms.Select(attrs={
            'class': 'form-select'
        })
    )
    
    document_type = forms.ModelChoiceField(
        queryset=DocumentType.objects.all(),
        empty_label="Select Document Type",
        widget=forms.Select(attrs={
            'class': 'form-select'
        })
    )
    
    description = forms.CharField(
        label="Document Name/Description",
        widget=forms.Textarea(attrs={
            'class': 'form-control',
            'rows': 4,
            'placeholder': 'Enter document name and description'
        })
    )
    
    document_date = forms.DateField(
        label="Document Date",
        widget=forms.DateInput(attrs={
            'type': 'date',
            'class': 'form-control'
        })
    )
    
    attachment = forms.FileField(
        label="Document File",
        widget=forms.ClearableFileInput(attrs={
            'class': 'form-control',
            'accept': '.pdf,.doc,.docx,.xls,.xlsx'
        })
    )

    class Meta:
        model = Project_Documentation_Tracking
        fields = ['project', 'document_type', 'description', 'document_date', 'attachment']