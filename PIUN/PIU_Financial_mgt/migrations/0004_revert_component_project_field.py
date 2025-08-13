from django.db import migrations

class Migration(migrations.Migration):

    dependencies = [
        ('PIU_Financial_mgt', '0003_merge_20250813_0528'),
    ]

    operations = [
        migrations.RenameField(
            model_name='component',
            old_name='project',
            new_name='projectID',
        ),
    ]