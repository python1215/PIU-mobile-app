from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .models import IssueActions, IssueNotification

User = get_user_model()


@receiver(pre_save, sender=IssueActions)
def track_assignment_changes(sender, instance, **kwargs):
    """Track when assigned_to changes to create notification"""
    if instance.pk:
        try:
            old_instance = IssueActions.objects.get(pk=instance.pk)
            instance._old_assigned_to = old_instance.assigned_to
            instance._old_status = old_instance.status
        except IssueActions.DoesNotExist:
            instance._old_assigned_to = None
            instance._old_status = None
    else:
        instance._old_assigned_to = None
        instance._old_status = None


@receiver(post_save, sender=IssueActions)
def create_issue_notifications(sender, instance, created, **kwargs):
    """Create notifications when issues are assigned or status changes"""
    
    # Get the assigned user
    if not instance.assigned_to:
        return
    
    # Try to find user by username (since assigned_to is a CharField)
    try:
        assigned_user = User.objects.get(username=instance.assigned_to)
    except User.DoesNotExist:
        # If username doesn't match, try to find by partial match
        try:
            assigned_user = User.objects.filter(username__icontains=instance.assigned_to).first()
            if not assigned_user:
                return
        except:
            return
    
    # Create assignment notification if newly created or assigned_to changed
    # Skip assignment notifications for completed issues
    old_assigned = getattr(instance, '_old_assigned_to', None)
    if (created or (old_assigned != instance.assigned_to and instance.assigned_to)) and instance.status != 'complete':
        priority_label = instance.get_priority_display() if instance.priority else 'No Priority'
        message = f"You have been assigned to issue '{instance.issue_code}': {instance.description_of_issue_or_action[:100]}. Priority: {priority_label}, Due: {instance.due_date if instance.due_date else 'Not set'}"
        
        IssueNotification.objects.create(
            issue=instance,
            user=assigned_user,
            notification_type='assignment',
            message=message
        )
    
    # Create status change notification (including transitions to 'complete')
    old_status = getattr(instance, '_old_status', None)
    if not created and old_status and old_status != instance.status:
        message = f"Issue '{instance.issue_code}' status changed from {old_status} to {instance.status}"
        IssueNotification.objects.create(
            issue=instance,
            user=assigned_user,
            notification_type='status_change',
            message=message
        )
