from django import forms
from .models import PAPDocument


class PAPDocumentForm(forms.ModelForm):
    class Meta:
        model = PAPDocument
        fields = ['document_file']
        widgets = {
            'document_file': forms.FileInput(attrs={
                'class': 'form-control',
                'accept': '.pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls',
                'id': 'id_document_file'
            })
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['document_file'].required = True

    def clean_document_file(self):
        document_file = self.cleaned_data.get('document_file')
        if document_file:
            # Check file size (10MB limit)
            if document_file.size > 10 * 1024 * 1024:
                raise forms.ValidationError("File size cannot exceed 10MB")
            
            # Check file extension
            allowed_extensions = ['.pdf', '.doc', '.docx', '.xlsx', '.xls', '.jpg', '.jpeg', '.png']
            if not any(document_file.name.lower().endswith(ext) for ext in allowed_extensions):
                raise forms.ValidationError("File type not allowed. Please upload PDF, Word, Excel, or Image files only.")
        
        return document_file