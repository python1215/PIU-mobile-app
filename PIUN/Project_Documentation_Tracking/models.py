from django.db import models
from PIU_Financial_mgt.models import Project
from setup.models import DocumentType
from django.conf import settings
from django.utils import timezone


def document_upload_path(instance, filename):
    """Constructing the upload path based on document type"""
    document_type = str(instance.document_type).replace(" ", "_")
    return f"documents/{document_type}/{filename}"


class Project_Documentation_Tracking(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    document_type = models.ForeignKey(DocumentType, on_delete=models.CASCADE)
    description = models.TextField(blank=True, null=True)
    document_date = models.DateField()
    attachment = models.FileField(upload_to=document_upload_path, blank=True, null=True)
    date = models.DateTimeField(auto_now_add=True)
    loginUser = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
    )

    class Meta:
        verbose_name = "Project Documentation Tracking"
        verbose_name_plural = "Project Documentation Tracking"

    def __str__(self):
        return str(self.description)

    def get_attachment_url(self):
        if self.attachment:
            return self.attachment.url
        return None


# Alias for backward compatibility with views
ProjectDocument = Project_Documentation_Tracking


class DocumentVersion(models.Model):
    """Document version tracking for Project Documentation"""
    document = models.ForeignKey(Project_Documentation_Tracking, on_delete=models.CASCADE, related_name='versions')
    version = models.CharField(max_length=10, default='1.0')
    description = models.TextField(blank=True, null=True)
    attachment = models.FileField(upload_to=document_upload_path, blank=True, null=True)
    created_date = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    
    class Meta:
        verbose_name = "Document Version"
        verbose_name_plural = "Document Versions"
        ordering = ['-created_date']
    
    def __str__(self):
        return f"{self.document.description} - v{self.version}"


class DocumentComment(models.Model):
    """Comments on project documents"""
    document = models.ForeignKey(Project_Documentation_Tracking, on_delete=models.CASCADE, related_name='comments')
    comment = models.TextField()
    created_date = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    
    class Meta:
        verbose_name = "Document Comment"
        verbose_name_plural = "Document Comments"
        ordering = ['-created_date']
    
    def __str__(self):
        return f"Comment on {self.document.description}"


class DocumentTag(models.Model):
    """Tags for organizing project documents"""
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True, null=True)
    created_date = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    
    class Meta:
        verbose_name = "Document Tag"
        verbose_name_plural = "Document Tags"
        ordering = ['name']
    
    def __str__(self):
        return self.name


class DocumentTagAssignment(models.Model):
    """Many-to-many relationship between documents and tags"""
    document = models.ForeignKey(Project_Documentation_Tracking, on_delete=models.CASCADE)
    tag = models.ForeignKey(DocumentTag, on_delete=models.CASCADE)
    assigned_date = models.DateTimeField(auto_now_add=True)
    assigned_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    
    class Meta:
        verbose_name = "Document Tag Assignment"
        verbose_name_plural = "Document Tag Assignments"
        unique_together = ['document', 'tag']
    
    def __str__(self):
        return f"{self.document.description} - {self.tag.name}"
