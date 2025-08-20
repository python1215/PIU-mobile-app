# Generated manually to add title_deed field and PAPDocument model

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('social_and_env', '0002_add_pap_document_model'),
    ]

    operations = [
        migrations.AddField(
            model_name='pap',
            name='title_deed',
            field=models.CharField(blank=True, max_length=200, null=True, verbose_name='Title Deed Number'),
        ),
        migrations.CreateModel(
            name='PAPDocument',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('document_name', models.CharField(max_length=255, verbose_name='Document Name')),
                ('document_file', models.FileField(upload_to='pap_documents/', verbose_name='Document File')),
                ('description', models.TextField(blank=True, verbose_name='Description')),
                ('upload_date', models.DateTimeField(auto_now_add=True, verbose_name='Upload Date')),
                ('pap', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='documents', to='social_and_env.pap')),
                ('uploaded_by', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'PAP Document',
                'verbose_name_plural': 'PAP Documents',
                'ordering': ['-upload_date'],
            },
        ),
    ]