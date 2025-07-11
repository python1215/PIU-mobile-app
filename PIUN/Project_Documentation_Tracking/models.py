from django.db import models
from django.contrib.auth import get_user_model
from django.urls import reverse
from django.conf import settings
from PIU_Financial_mgt.models import Project
from setup.models import DocumentType
import os

User = get_user_model()


class ProjectDocument(models.Model):
    DOCUMENT_STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('under_review', 'Under Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('archived', 'Archived'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]
    
    document_id = models.AutoField(primary_key=True)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='documents')
    document_type = models.ForeignKey(DocumentType, on_delete=models.CASCADE)
    title = models.CharField(max_length=200, verbose_name="Document Title")
    description = models.TextField(blank=True, verbose_name="Document Description")
    document_file = models.FileField(upload_to='project_documents/', verbose_name="Document File", blank=True, null=True)
    version = models.CharField(max_length=10, default='1.0', verbose_name="Version")
    status = models.CharField(max_length=20, choices=DOCUMENT_STATUS_CHOICES, default='draft')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    
    # Metadata
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_documents')
    created_date = models.DateTimeField(auto_now_add=True)
    modified_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='modified_documents', null=True, blank=True)
    modified_date = models.DateTimeField(auto_now=True)
    
    # Review information
    reviewed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_documents')
    review_date = models.DateTimeField(null=True, blank=True)
    review_comments = models.TextField(blank=True, verbose_name="Review Comments")
    
    # Due dates and tracking
    due_date = models.DateField(null=True, blank=True, verbose_name="Due Date")
    submission_date = models.DateField(null=True, blank=True, verbose_name="Submission Date")
    
    # File metadata
    file_size = models.BigIntegerField(null=True, blank=True, verbose_name="File Size (bytes)")
    file_checksum = models.CharField(max_length=64, blank=True, verbose_name="File Checksum")
    
    class Meta:
        ordering = ['-created_date']
        verbose_name = 'Project Document'
        verbose_name_plural = 'Project Documents'
    
    def __str__(self):
        return f"{self.title} - {self.project.project_name}"
    
    def get_absolute_url(self):
        return reverse('Project_Documentation_Tracking:document_detail', kwargs={'pk': self.document_id})
    
    @property
    def file_name(self):
        return os.path.basename(self.document_file.name)
    
    @property
    def file_extension(self):
        return os.path.splitext(self.document_file.name)[1].lower()
    
    @property
    def is_overdue(self):
        if self.due_date:
            from datetime import date
            return date.today() > self.due_date and self.status != 'approved'
        return False


class DocumentVersion(models.Model):
    document = models.ForeignKey(ProjectDocument, on_delete=models.CASCADE, related_name='versions')
    version_number = models.CharField(max_length=10, verbose_name="Version Number")
    document_file = models.FileField(upload_to='project_documents/versions/', verbose_name="Version File")
    version_notes = models.TextField(blank=True, verbose_name="Version Notes")
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_date = models.DateTimeField(auto_now_add=True)
    file_size = models.BigIntegerField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_date']
        unique_together = ['document', 'version_number']
        verbose_name = 'Document Version'
        verbose_name_plural = 'Document Versions'
    
    def __str__(self):
        return f"{self.document.title} - v{self.version_number}"


class DocumentComment(models.Model):
    document = models.ForeignKey(ProjectDocument, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    comment_text = models.TextField(verbose_name="Comment")
    created_date = models.DateTimeField(auto_now_add=True)
    parent_comment = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    
    class Meta:
        ordering = ['-created_date']
        verbose_name = 'Document Comment'
        verbose_name_plural = 'Document Comments'
    
    def __str__(self):
        return f"Comment by {self.author.username} on {self.document.title}"


class DocumentTag(models.Model):
    name = models.CharField(max_length=50, unique=True, verbose_name="Tag Name")
    color = models.CharField(max_length=7, default='#007bff', verbose_name="Tag Color")
    created_date = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['name']
        verbose_name = 'Document Tag'
        verbose_name_plural = 'Document Tags'
    
    def __str__(self):
        return self.name


class DocumentTagAssignment(models.Model):
    document = models.ForeignKey(ProjectDocument, on_delete=models.CASCADE, related_name='tag_assignments')
    tag = models.ForeignKey(DocumentTag, on_delete=models.CASCADE)
    assigned_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    assigned_date = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['document', 'tag']
        verbose_name = 'Document Tag Assignment'
        verbose_name_plural = 'Document Tag Assignments'
    
    def __str__(self):
        return f"{self.document.title} - {self.tag.name}"