# Generated migration for field updates

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('project_progress', '0001_initial_project_progress'),
    ]

    operations = [
        migrations.AlterField(
            model_name='projectprogress',
            name='over_all_disbursement_rate',
            field=models.CharField(blank=True, max_length=10),
        ),
        migrations.AlterField(
            model_name='projectprogress',
            name='over_project_time_elapsed',
            field=models.CharField(blank=True, max_length=50),
        ),
    ]
