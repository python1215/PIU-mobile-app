from django import forms
from django.core.exceptions import ValidationError
from .models import ProjectDocument, DocumentComment, DocumentTag
from PIU_Financial_mgt.models import Project
from setup.models import DocumentType


class ProjectDocumentForm(forms.ModelForm):
    class Meta:
        model = ProjectDocument
        fields = [
            'project', 'document_type', 'title', 'description', 'document_file',
            'version', 'status', 'priority', 'due_date', 'submission_date'
        ]
        widgets = {
            'project': forms.Select(attrs={'class': 'form-select'}),
            'document_type': forms.Select(attrs={'class': 'form-select'}),
            'title': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter document title'
            }),
            'description': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 4,
                'placeholder': 'Enter document description'
            }),
            'document_file': forms.ClearableFileInput(attrs={
                'class': 'form-control',
                'accept': '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png'
            }),
            'version': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'e.g., 1.0, 2.1'
            }),
            'status': forms.Select(attrs={'class': 'form-select'}),
            'priority': forms.Select(attrs={'class': 'form-select'}),
            'due_date': forms.DateInput(attrs={
                'class': 'form-control',
                'type': 'date'
            }),
            'submission_date': forms.DateInput(attrs={
                'class': 'form-control',
                'type': 'date'
            }),
        }
        labels = {
            'project': 'Project',
            'document_type': 'Document Type',
            'title': 'Document Title',
            'description': 'Description',
            'document_file': 'Document File',
            'version': 'Version',
            'status': 'Status',
            'priority': 'Priority',
            'due_date': 'Due Date',
            'submission_date': 'Submission Date',
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Set required fields
        self.fields['project'].required = True
        self.fields['document_type'].required = True
        self.fields['title'].required = True
        self.fields['document_file'].required = False  # Make file optional for testing
        
        # Add help text
        self.fields['version'].help_text = 'Version number (e.g., 1.0, 2.1)'
        self.fields['document_file'].help_text = 'Supported formats: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, JPG, JPEG, PNG'
    
    def clean_document_file(self):
        file = self.cleaned_data.get('document_file')
        if file:
            # Check file size (max 16MB)
            if file.size > 16 * 1024 * 1024:
                raise ValidationError('File size must be less than 16MB.')
            
            # Check file extension
            allowed_extensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.jpg', '.jpeg', '.png']
            file_extension = file.name.lower().split('.')[-1]
            if f'.{file_extension}' not in allowed_extensions:
                raise ValidationError('File type not supported. Please upload PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, JPG, JPEG, or PNG files.')
        
        return file
    
    def clean_version(self):
        version = self.cleaned_data.get('version')
        if version:
            # Simple version validation
            if not version.replace('.', '').replace('-', '').isalnum():
                raise ValidationError('Version must contain only letters, numbers, dots, and hyphens.')
        return version


class DocumentCommentForm(forms.ModelForm):
    class Meta:
        model = DocumentComment
        fields = ['comment_text', 'parent_comment']
        widgets = {
            'comment_text': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 3,
                'placeholder': 'Enter your comment...'
            }),
            'parent_comment': forms.HiddenInput(),
        }
        labels = {
            'comment_text': 'Comment',
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['comment_text'].required = True


class DocumentTagForm(forms.ModelForm):
    class Meta:
        model = DocumentTag
        fields = ['name', 'color']
        widgets = {
            'name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter tag name'
            }),
            'color': forms.TextInput(attrs={
                'class': 'form-control',
                'type': 'color',
                'value': '#007bff'
            }),
        }
        labels = {
            'name': 'Tag Name',
            'color': 'Tag Color',
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['name'].required = True
        self.fields['color'].required = True
    
    def clean_name(self):
        name = self.cleaned_data.get('name')
        if name:
            # Check for duplicate tag names
            if DocumentTag.objects.filter(name__iexact=name).exists():
                raise ValidationError('A tag with this name already exists.')
        return name


class DocumentFilterForm(forms.Form):
    project = forms.ModelChoiceField(
        queryset=Project.objects.all(),
        required=False,
        empty_label="All Projects",
        widget=forms.Select(attrs={'class': 'form-select'})
    )
    
    document_type = forms.ModelChoiceField(
        queryset=DocumentType.objects.all(),
        required=False,
        empty_label="All Document Types",
        widget=forms.Select(attrs={'class': 'form-select'})
    )
    
    status = forms.ChoiceField(
        choices=[('', 'All Status')] + ProjectDocument.DOCUMENT_STATUS_CHOICES,
        required=False,
        widget=forms.Select(attrs={'class': 'form-select'})
    )
    
    priority = forms.ChoiceField(
        choices=[('', 'All Priorities')] + ProjectDocument.PRIORITY_CHOICES,
        required=False,
        widget=forms.Select(attrs={'class': 'form-select'})
    )
    
    search = forms.CharField(
        required=False,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Search documents...'
        })
    )
    
    date_from = forms.DateField(
        required=False,
        widget=forms.DateInput(attrs={
            'class': 'form-control',
            'type': 'date'
        })
    )
    
    date_to = forms.DateField(
        required=False,
        widget=forms.DateInput(attrs={
            'class': 'form-control',
            'type': 'date'
        })
    )


class DocumentVersionForm(forms.Form):
    version_number = forms.CharField(
        max_length=10,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'e.g., 2.0, 2.1'
        })
    )
    
    version_file = forms.FileField(
        widget=forms.ClearableFileInput(attrs={
            'class': 'form-control',
            'accept': '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png'
        })
    )
    
    version_notes = forms.CharField(
        required=False,
        widget=forms.Textarea(attrs={
            'class': 'form-control',
            'rows': 3,
            'placeholder': 'Enter version notes...'
        })
    )
    
    def clean_version_file(self):
        file = self.cleaned_data.get('version_file')
        if file:
            # Check file size (max 16MB)
            if file.size > 16 * 1024 * 1024:
                raise ValidationError('File size must be less than 16MB.')
            
            # Check file extension
            allowed_extensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.jpg', '.jpeg', '.png']
            file_extension = file.name.lower().split('.')[-1]
            if f'.{file_extension}' not in allowed_extensions:
                raise ValidationError('File type not supported.')
        
        return file