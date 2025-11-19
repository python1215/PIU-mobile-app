from django.db import models
from django.conf import settings
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from PIU_Financial_mgt.models import Project
from setup.models import YEAR, Quarter, Type_of_Monitoring


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
  issue_action_type = models.ForeignKey(Type_of_Monitoring,
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
                                       ('critical', 'Critical'),
                                       ('done', 'Done')],
                              default='medium',
                              null=True,
                              blank=True,
                              verbose_name="Priority")
  assigned_to = models.CharField(max_length=100, verbose_name="Assigned To")
  date_created = models.DateTimeField(auto_now_add=True,
                                      verbose_name="Date Created")
  date_updated = models.DateTimeField(auto_now=True,
                                      verbose_name="Date Updated")
  assign_date = models.DateField(null=True,
                                 blank=True,
                                 verbose_name="Assign Date")
  due_date = models.DateField(null=True, blank=True, verbose_name="Due Date")
  remarks = models.TextField(blank=False, verbose_name="Remarks")
  loginUser = models.ForeignKey(settings.AUTH_USER_MODEL,
                                on_delete=models.CASCADE,
                                related_name='created_issues',
                                verbose_name="Created By")

  class Meta:
    verbose_name = "Issue/Action"
    verbose_name_plural = "Issues/Actions"
    ordering = ['-date_created']

  def save(self, *args, **kwargs):
    # Automatically set priority to 'done' when status is complete to stop notifications
    if self.status == 'complete':
      self.priority = 'done'
    super().save(*args, **kwargs)

  def __str__(self):
    return f"{self.issue_code} - {self.project}"
  
  def get_notifications_per_day(self):
    """Return number of notifications per day (24 hours) based on priority"""
    priority_notifications = {
      'low': 2,
      'medium': 5,
      'high': 10,
      'critical': 20,
      'done': 0
    }
    return priority_notifications.get(self.priority, 0) if self.priority else 0
  
  def get_notification_interval_minutes(self):
    """Calculate interval in minutes between notifications based on priority"""
    notifications_per_day = self.get_notifications_per_day()
    if notifications_per_day == 0:
      return None
    # 24 hours = 1440 minutes
    return 1440 // notifications_per_day
  
  def get_assigned_to_name(self):
    """Return the full name of the assigned user, or username if full name not available"""
    if not self.assigned_to:
      return "Unassigned"
    
    User = get_user_model()
    try:
      user = User.objects.get(username=self.assigned_to)
      return user.get_full_name() or user.username
    except User.DoesNotExist:
      return self.assigned_to


class IssueNotification(models.Model):
  """Track notifications for issues to send reminders based on priority"""
  notificationID = models.AutoField(primary_key=True)
  issue = models.ForeignKey(IssueActions, on_delete=models.CASCADE, related_name='notifications')
  user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
  notification_type = models.CharField(
    max_length=50,
    choices=[
      ('assignment', 'Assignment Notification'),
      ('reminder', 'Due Date Reminder'),
      ('status_change', 'Status Change')
    ]
  )
  message = models.TextField()
  is_read = models.BooleanField(default=False)
  created_at = models.DateTimeField(auto_now_add=True)
  read_at = models.DateTimeField(null=True, blank=True)
  
  class Meta:
    verbose_name = "Issue Notification"
    verbose_name_plural = "Issue Notifications"
    ordering = ['-created_at']
  
  def __str__(self):
    return f"Notification for {self.user.username} - {self.issue.issue_code}"
  
  def mark_as_read(self):
    """Mark notification as read"""
    self.is_read = True
    self.read_at = timezone.now()
    self.save()


class IssueReminderLog(models.Model):
  """Log when reminders are sent to avoid duplicate notifications"""
  logID = models.AutoField(primary_key=True)
  issue = models.ForeignKey(IssueActions, on_delete=models.CASCADE, related_name='reminder_logs')
  user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
  sent_at = models.DateTimeField(auto_now_add=True)
  
  class Meta:
    verbose_name = "Issue Reminder Log"
    verbose_name_plural = "Issue Reminder Logs"
    ordering = ['-sent_at']
  
  def __str__(self):
    return f"Reminder for {self.issue.issue_code} sent to {self.user.username} at {self.sent_at}"
