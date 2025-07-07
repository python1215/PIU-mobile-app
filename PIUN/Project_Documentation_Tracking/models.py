from django.db import models

# Create your models here.
from django.db import models
from PIU_Financial_mgt.models import Project
from setup.models import DocumentType
from django.conf import settings


def document_upload_path(instance, filename):
    # Constructing the upload path based on document type
    #document_type = instance.document_type # Replacing spaces with underscores
    #self.filename = filename
    document_type = str(instance.document_type).replace(" ", "_")
    #return f"documents/{document_type}/{filename}"
    return f"documents/{document_type}/{filename}"


class Project_Documentation_Tracking(models.Model):
    project = models.ForeignKey(Project, on_delete = models.CASCADE)
    document_type = models.ForeignKey(DocumentType, on_delete=models.CASCADE)
    description = models.TextField(blank=True, null=True)
    document_date = models.DateField()
    attachment = models.FileField(upload_to=document_upload_path)
    date = models.DateTimeField(auto_now_add=True)
    loginUser = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
    ) 


    class Meta:
        verbose_name = ("Project Documentation Tracking")
        verbose_name_plural= ("Project Documentation Tracking ")
    
    def __str__(self):
        return str(self.description)
    
    def get_attachment_url(self):
        return self.attachment.url