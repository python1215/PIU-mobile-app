from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('project_progress', '0002_alter_projectprogress_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='projectprogress',
            name='over_project_time_over_run',
            field=models.CharField(blank=True, max_length=50),
        ),
    ]
