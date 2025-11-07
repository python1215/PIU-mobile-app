from django import forms
from .models import MediaItem


class MediaItemForm(forms.ModelForm):
    """Form for uploading and editing media items (pictures/videos)"""
    
    class Meta:
        model = MediaItem
        fields = ['title', 'description', 'media_type', 'file']
        widgets = {
            'title': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter media title',
            }),
            'description': forms.Textarea(attrs={
                'class': 'form-control',
                'placeholder': 'Enter description (optional)',
                'rows': 3
            }),
            'media_type': forms.Select(attrs={
                'class': 'form-select',
            }),
            'file': forms.FileInput(attrs={
                'class': 'form-control',
                'accept': 'image/*,video/*'
            })
        }
        labels = {
            'title': 'Media Title',
            'description': 'Description',
            'media_type': 'Media Type',
            'file': 'Select File'
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # File is required only when creating new items
        if not self.instance.pk:
            self.fields['file'].required = True
        else:
            self.fields['file'].required = False
    
    def clean_file(self):
        """Validate file type based on media_type"""
        file = self.cleaned_data.get('file')
        media_type = self.cleaned_data.get('media_type')
        
        # Skip validation if no file uploaded (editing existing record)
        if not file:
            return file
        
        if file and media_type:
            # Get file extension
            file_ext = file.name.split('.')[-1].lower()
            
            # Valid extensions for each type
            image_extensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg']
            video_extensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', 'm4v', '3gp', 'mpeg', 'mpg']
            
            if media_type == 'image' and file_ext not in image_extensions:
                raise forms.ValidationError(
                    f'Please upload a valid image file. Supported formats: {", ".join(image_extensions).upper()}'
                )
            elif media_type == 'video' and file_ext not in video_extensions:
                raise forms.ValidationError(
                    f'Please upload a valid video file. Supported formats: {", ".join(video_extensions).upper()}'
                )
            
            # Check file size (max 50MB for deployment compatibility)
            max_size = 50 * 1024 * 1024  # 50MB in bytes
            if file.size > max_size:
                file_size_mb = file.size / (1024 * 1024)
                raise forms.ValidationError(
                    f'File size ({file_size_mb:.2f}MB) exceeds the maximum allowed size of 50MB. '
                    f'Please upload a smaller file or compress your video.'
                )
        
        return file
