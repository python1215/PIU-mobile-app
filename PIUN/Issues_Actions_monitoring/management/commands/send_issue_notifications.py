"""
Django management command to send periodic notifications for incomplete issues.
Notifications are sent based on issue priority:
- Low Priority: 2 notifications per 24 hours (every 12 hours)
- Medium Priority: 5 notifications per 24 hours (every 4.8 hours)
- High Priority: 10 notifications per 24 hours (every 2.4 hours)
- Critical Priority: 20 notifications per 24 hours (every 1.2 hours)
- Done: No notifications

Usage:
    python manage.py send_issue_notifications
    
Should be run as a cron job every hour (or more frequently for critical issues)
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from django.contrib.auth import get_user_model
from datetime import timedelta
from Issues_Actions_monitoring.models import IssueActions, IssueNotification, IssueReminderLog


class Command(BaseCommand):
    help = 'Send periodic notifications for incomplete issues based on priority'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be sent without actually sending notifications',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        
        if dry_run:
            self.stdout.write(self.style.WARNING('DRY RUN MODE - No notifications will be sent'))
        
        # Get all incomplete issues with assigned users
        incomplete_issues = IssueActions.objects.filter(
            status='incomplete'
        ).exclude(
            priority='done'
        ).exclude(
            priority__isnull=True
        )
        
        now = timezone.now()
        notifications_sent = 0
        notifications_skipped = 0
        
        User = get_user_model()
        
        for issue in incomplete_issues:
            # Get notification interval for this issue
            interval_minutes = issue.get_notification_interval_minutes()
            
            if interval_minutes is None:
                notifications_skipped += 1
                continue
            
            # Get the assigned user
            try:
                assigned_user = User.objects.get(username=issue.assigned_to)
            except User.DoesNotExist:
                self.stdout.write(
                    self.style.WARNING(
                        f'User {issue.assigned_to} not found for issue {issue.issue_code}'
                    )
                )
                notifications_skipped += 1
                continue
            
            # Check when the last reminder was sent
            last_reminder = IssueReminderLog.objects.filter(
                issue=issue,
                user=assigned_user
            ).order_by('-sent_at').first()
            
            should_send = False
            
            if last_reminder is None:
                # No reminder sent yet, send one
                should_send = True
                reason = 'First notification'
            else:
                # Check if enough time has passed since last reminder
                time_since_last = (now - last_reminder.sent_at).total_seconds() / 60  # in minutes
                
                if time_since_last >= interval_minutes:
                    should_send = True
                    reason = f'Interval met ({int(time_since_last)} minutes since last)'
                else:
                    reason = f'Too soon ({int(time_since_last)}/{interval_minutes} minutes)'
            
            if should_send:
                if not dry_run:
                    # Create notification
                    message = self._create_notification_message(issue)
                    
                    IssueNotification.objects.create(
                        issue=issue,
                        user=assigned_user,
                        notification_type='reminder',
                        message=message
                    )
                    
                    # Log the reminder
                    IssueReminderLog.objects.create(
                        issue=issue,
                        user=assigned_user
                    )
                
                self.stdout.write(
                    self.style.SUCCESS(
                        f'{"[DRY RUN] " if dry_run else ""}Sent notification for {issue.issue_code} '
                        f'({issue.priority}) to {assigned_user.username} - {reason}'
                    )
                )
                notifications_sent += 1
            else:
                if options['verbosity'] >= 2:
                    self.stdout.write(
                        f'Skipped {issue.issue_code} - {reason}'
                    )
                notifications_skipped += 1
        
        # Summary
        self.stdout.write(
            self.style.SUCCESS(
                f'\n{"[DRY RUN] " if dry_run else ""}Summary:\n'
                f'  Total incomplete issues: {incomplete_issues.count()}\n'
                f'  Notifications sent: {notifications_sent}\n'
                f'  Notifications skipped: {notifications_skipped}'
            )
        )
    
    def _create_notification_message(self, issue):
        """Create a notification message for the issue"""
        days_until_due = 'No due date'
        if issue.due_date:
            days_diff = (issue.due_date - timezone.now().date()).days
            if days_diff < 0:
                days_until_due = f'{abs(days_diff)} days overdue'
            elif days_diff == 0:
                days_until_due = 'Due today'
            else:
                days_until_due = f'{days_diff} days remaining'
        
        return (
            f'Reminder: Issue {issue.issue_code} is still incomplete.\n'
            f'Priority: {issue.priority.upper()}\n'
            f'Due date: {days_until_due}\n'
            f'Description: {issue.description_of_issue_or_action[:100]}...'
        )
