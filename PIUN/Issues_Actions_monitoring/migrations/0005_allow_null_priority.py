# Generated manually to allow NULL values for priority field

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Issues_Actions_monitoring', '0004_alter_issueactions_remarks'),
    ]

    operations = [
        migrations.AlterField(
            model_name='issueactions',
            name='priority',
            field=models.CharField(
                blank=True,
                choices=[('low', 'Low'), ('medium', 'Medium'), ('high', 'High'), ('critical', 'Critical')],
                default='medium',
                max_length=20,
                null=True,
                verbose_name='Priority'
            ),
        ),
    ]
