from django.db import models
from django.conf import settings


class MediaItem(models.Model):
    MEDIA_TYPE_CHOICES = [
        ('image', 'Image'),
        ('video', 'Video'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    media_type = models.CharField(max_length=10, choices=MEDIA_TYPE_CHOICES)
    file = models.FileField(upload_to='animation_media/')
    thumbnail = models.ImageField(upload_to='animation_media/thumbnails/', blank=True, null=True)
    project = models.ForeignKey('PIU_Financial_mgt.Project', on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    loginUser = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )
    
    class Meta:
        verbose_name = 'Media Item'
        verbose_name_plural = 'Media Items'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title
