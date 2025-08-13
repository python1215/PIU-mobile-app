from django.db import migrations

class Migration(migrations.Migration):

    dependencies = [
        ('PIU_Financial_mgt', '0004_revert_component_project_field'),
    ]

    operations = [
        # Rename foreign key fields if they exist with old names
        migrations.RunSQL(
            "ALTER TABLE PIU_Financial_mgt_subcomponent RENAME COLUMN project_id TO projectID_id;",
            reverse_sql="ALTER TABLE PIU_Financial_mgt_subcomponent RENAME COLUMN projectID_id TO project_id;",
            state_operations=[],
        ),
        migrations.RunSQL(
            "ALTER TABLE PIU_Financial_mgt_subcomponent RENAME COLUMN component_id TO compID_id;",
            reverse_sql="ALTER TABLE PIU_Financial_mgt_subcomponent RENAME COLUMN compID_id TO component_id;",
            state_operations=[],
        ),
    ]