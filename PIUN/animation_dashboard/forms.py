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
                'required': True
            }),
            'description': forms.Textarea(attrs={
                'class': 'form-control',
                'placeholder': 'Enter description (optional)',
                'rows': 3
            }),
            'media_type': forms.Select(attrs={
                'class': 'form-select',
                'required': True
            }),
            'file': forms.FileInput(attrs={
                'class': 'form-control',
                'required': True,
                'accept': 'image/*,video/*'
            })
        }
        labels = {
            'title': 'Media Title',
            'description': 'Description',
            'media_type': 'Media Type',
            'file': 'Select File'
        }
    
    def clean_file(self):
        """Validate file type based on media_type"""
        file = self.cleaned_data.get('file')
        media_type = self.cleaned_data.get('media_type')
        
        if file and media_type:
            # Get file extension
            file_ext = file.name.split('.')[-1].lower()
            
            # Valid extensions for each type
            image_extensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg']
            video_extensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv']
            
            if media_type == 'image' and file_ext not in image_extensions:
                raise forms.ValidationError(
                    f'Please upload a valid image file. Supported formats: {", ".join(image_extensions)}'
                )
            elif media_type == 'video' and file_ext not in video_extensions:
                raise forms.ValidationError(
                    f'Please upload a valid video file. Supported formats: {", ".join(video_extensions)}'
                )
            
            # Check file size (max 500MB)
            max_size = 500 * 1024 * 1024  # 500MB in bytes
            if file.size > max_size:
                file_size_mb = file.size / (1024 * 1024)
                raise forms.ValidationError(
                    f'File size ({file_size_mb:.2f}MB) exceeds the maximum allowed size of 500MB. '
                    f'Please upload a smaller file.'
                )
        
        return file
