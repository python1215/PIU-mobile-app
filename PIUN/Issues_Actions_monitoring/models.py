from django.db import models
from django.conf import settings
from PIU_Financial_mgt.models import KPI_For_Contract, Project
from setup.models import YEAR, Quarter


# Create your models here.
class issue_action_source(models.Model):
  sourceID = models.AutoField(primary_key=True)
  issue_action_source = models.CharField(max_length=100,
                                         verbose_name="Issue/Action Source")
  date_created = models.DateTimeField(auto_now_add=True,
                                      verbose_name="Date Created")
  loginuser = models.ForeignKey(settings.AUTH_USER_MODEL,
                                on_delete=models.CASCADE,
                                verbose_name="Created By")

  class Meta:
    verbose_name = "Issue/Action Source"
    verbose_name_plural = "Issue/Action Sources"
    ordering = ['-date_created']

  def __str__(self):
    return str(self.issue_action_source)


class IssueActions(models.Model):
  issueID = models.AutoField(primary_key=True)
  project = models.ForeignKey(Project, on_delete=models.CASCADE)
  year = models.ForeignKey(YEAR, on_delete=models.CASCADE)
  quarter = models.ForeignKey(Quarter, on_delete=models.CASCADE)
  issue_code = models.CharField(max_length=100, verbose_name="Issue Code")
  issue_action_type = models.ForeignKey(KPI_For_Contract,
                                        on_delete=models.CASCADE,
                                        verbose_name="Issue/Action Type")
  description_of_issue_or_action = models.TextField(
      verbose_name="Description of Issue/Action")
  source_of_issue_or_action = models.ForeignKey(
      issue_action_source,
      on_delete=models.CASCADE,
      verbose_name="Source of Issue/Action")
  status = models.CharField(max_length=50,
                            choices=[('complete', 'complete'),
                                     ('incomplete', 'incomplete'),
                                     ('Cancel', 'cancel')],
                            default='incomplete',
                            verbose_name="Status")
  priority = models.CharField(max_length=20,
                              choices=[('low', 'Low'), ('medium', 'Medium'),
                                       ('high', 'High'),
                                       ('critical', 'Critical')],
                              default='medium',
                              verbose_name="Priority")
  assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL,
                                  on_delete=models.SET_NULL,
                                  null=True,
                                  blank=True,
                                  verbose_name="Assigned To")
  date_created = models.DateTimeField(auto_now_add=True,
                                      verbose_name="Date Created")
  date_updated = models.DateTimeField(auto_now=True,
                                      verbose_name="Date Updated")
  due_date = models.DateField(null=True, blank=True, verbose_name="Due Date")
  remarks = models.TextField(blank=True, verbose_name="Remarks")
  loginUser = models.ForeignKey(settings.AUTH_USER_MODEL,
                                on_delete=models.CASCADE,
                                related_name='created_issues',
                                verbose_name="Created By")

  class Meta:
    verbose_name = "Issue/Action"
    verbose_name_plural = "Issues/Actions"
    ordering = ['-date_created']

  def __str__(self):
    return f"{self.issue_code} - {self.project}"
