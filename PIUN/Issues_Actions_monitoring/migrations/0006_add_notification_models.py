# Generated manually for notification system

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('Issues_Actions_monitoring', '0005_allow_null_priority'),
    ]

    operations = [
        migrations.CreateModel(
            name='IssueNotification',
            fields=[
                ('notificationID', models.AutoField(primary_key=True, serialize=False)),
                ('notification_type', models.CharField(choices=[('assignment', 'Assignment Notification'), ('reminder', 'Due Date Reminder'), ('status_change', 'Status Change')], max_length=50)),
                ('message', models.TextField()),
                ('is_read', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('read_at', models.DateTimeField(blank=True, null=True)),
                ('issue', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='notifications', to='Issues_Actions_monitoring.issueactions')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Issue Notification',
                'verbose_name_plural': 'Issue Notifications',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='IssueReminderLog',
            fields=[
                ('logID', models.AutoField(primary_key=True, serialize=False)),
                ('sent_at', models.DateTimeField(auto_now_add=True)),
                ('issue', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='reminder_logs', to='Issues_Actions_monitoring.issueactions')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Issue Reminder Log',
                'verbose_name_plural': 'Issue Reminder Logs',
                'ordering': ['-sent_at'],
            },
        ),
    ]
