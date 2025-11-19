# Issue Notification System Setup Guide

## Overview
The notification system automatically sends periodic reminders to users assigned to incomplete issues based on priority levels.

## Notification Frequencies

| Priority | Notifications per 24 hours | Interval Between Notifications |
|----------|---------------------------|-------------------------------|
| Low      | 2                         | Every 12 hours (720 minutes)  |
| Medium   | 5                         | Every 4.8 hours (288 minutes) |
| High     | 10                        | Every 2.4 hours (144 minutes) |
| Critical | 20                        | Every 72 minutes              |
| Done     | 0                         | No notifications sent         |

## How It Works

1. **Status-Based Logic:**
   - When an issue is created with `status='incomplete'` and a priority level, notifications begin
   - When an issue's status changes to `complete`, priority is automatically set to `'done'` and all notifications stop
   - Users receive reminders at intervals based on the priority level

2. **Assignment:**
   - Notifications are sent to the user specified in the `assigned_to` field
   - The system looks up users by username

3. **Tracking:**
   - Each notification creates an `IssueNotification` record (visible in notification dropdown)
   - Each reminder logs an `IssueReminderLog` entry to track timing
   - The system prevents duplicate notifications by checking the last sent time

## Running the Command

### Manual Execution
```bash
# Send notifications
python manage.py send_issue_notifications

# Dry run mode (shows what would be sent without actually sending)
python manage.py send_issue_notifications --dry-run

# Verbose output (shows skipped notifications too)
python manage.py send_issue_notifications --verbosity=2
```

### Setting Up Automated Notifications (Cron Job)

#### For Linux/Unix Production Servers

Edit crontab:
```bash
crontab -e
```

Add one of these lines based on your needs:

```bash
# Run every hour (recommended for all priority levels)
0 * * * * cd /path/to/PIUN && /path/to/python manage.py send_issue_notifications

# Run every 30 minutes (better for high/critical priorities)
*/30 * * * * cd /path/to/PIUN && /path/to/python manage.py send_issue_notifications

# Run every 15 minutes (best for critical priorities)
*/15 * * * * cd /path/to/PIUN && /path/to/python manage.py send_issue_notifications
```

**Recommended:** Run every hour for balanced performance

#### For Windows Task Scheduler

1. Open Task Scheduler
2. Create Basic Task
3. Set trigger (e.g., every 1 hour)
4. Action: Start a program
   - Program: `C:\path\to\python.exe`
   - Arguments: `manage.py send_issue_notifications`
   - Start in: `C:\path\to\PIUN`

#### For Replit Deployment

Replit doesn't support traditional cron jobs. Options:

1. **APScheduler (Recommended):**
   Add to your Django app initialization:
   ```python
   from apscheduler.schedulers.background import BackgroundScheduler
   from django.core.management import call_command
   
   def send_notifications():
       call_command('send_issue_notifications')
   
   scheduler = BackgroundScheduler()
   scheduler.add_job(send_notifications, 'interval', hours=1)
   scheduler.start()
   ```

2. **External Cron Service:**
   - Use services like cron-job.org or EasyCron
   - Create an endpoint that triggers the command
   - Schedule the external service to call it

## Testing the System

### 1. Create a Test Issue
```python
from Issues_Actions_monitoring.models import IssueActions
from PIU_Financial_mgt.models import Project
from setup.models import YEAR, Quarter, Type_of_Monitoring
from Issues_Actions_monitoring.models import issue_action_source

issue = IssueActions.objects.create(
    project=Project.objects.first(),
    year=YEAR.objects.first(),
    quarter=Quarter.objects.first(),
    issue_code='TEST-001',
    issue_action_type=Type_of_Monitoring.objects.first(),
    description_of_issue_or_action='Test notification',
    source_of_issue_or_action=issue_action_source.objects.first(),
    status='incomplete',
    priority='high',  # Will send 10 notifications per day
    assigned_to='admin',  # Change to actual username
    remarks='Testing',
    loginUser=user
)
```

### 2. Run the Command
```bash
python manage.py send_issue_notifications --verbosity=2
```

### 3. Check Results
- Notifications appear in the navbar bell icon
- Check the console output for confirmation
- View notification page: `/Issues_Actions_monitoring/test-notifications/`

### 4. Test Interval Logic
Run the command again immediately - no new notifications should be sent because the interval hasn't elapsed.

## Monitoring

### Check Notification Count
```python
from Issues_Actions_monitoring.models import IssueNotification

# Total notifications
IssueNotification.objects.count()

# Unread notifications for a user
IssueNotification.objects.filter(user=user, is_read=False).count()

# Reminders sent today
from django.utils import timezone
from datetime import timedelta
from Issues_Actions_monitoring.models import IssueReminderLog

today = timezone.now() - timedelta(days=1)
IssueReminderLog.objects.filter(sent_at__gte=today).count()
```

### Cleanup Old Notifications (Optional)
```python
# Delete notifications older than 30 days
from django.utils import timezone
from datetime import timedelta

cutoff = timezone.now() - timedelta(days=30)
IssueNotification.objects.filter(created_at__lt=cutoff, is_read=True).delete()
```

## Troubleshooting

### No Notifications Being Sent
1. Check if issues exist: `IssueActions.objects.filter(status='incomplete').count()`
2. Verify assigned users exist: Check `assigned_to` field matches a username
3. Run in verbose mode: `--verbosity=2` to see why notifications are skipped
4. Check last reminder time: May not have reached the interval yet

### User Not Found Errors
- The `assigned_to` field must match an existing username exactly
- Update invalid usernames in the database

### Too Many Notifications
- Review priority levels of issues
- Consider reducing cron frequency
- Implement notification preferences per user (future enhancement)

## Future Enhancements
- Email notifications
- SMS notifications (Twilio integration)
- User notification preferences
- Notification scheduling (business hours only)
- Escalation rules (notify supervisor if overdue)
