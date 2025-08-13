from django.db import migrations

class Migration(migrations.Migration):

    dependencies = [
        ('PIU_Financial_mgt', '0001_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='component',
            old_name='projectID',
            new_name='project',
        ),
        migrations.RenameField(
            model_name='component',
            old_name='Project_Components',
            new_name='project_components',
        ),
        migrations.RenameField(
            model_name='component',
            old_name='component_Description',
            new_name='component_description',
        ),
        migrations.RenameField(
            model_name='subcomponent',
            old_name='projectID',
            new_name='project',
        ),
        migrations.RenameField(
            model_name='subcomponent',
            old_name='compID',
            new_name='component',
        ),
    ]