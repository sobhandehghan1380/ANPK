from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('portal', '0022_clientorganization_more_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='clientorganization',
            name='tags',
            field=models.CharField(blank=True, default='', max_length=500, verbose_name='برچسب\u200cها (با کاما جدا کنید)'),
        ),
        migrations.AddField(
            model_name='clientorganization',
            name='portal_access',
            field=models.BooleanField(default=True, verbose_name='دسترسی به پورتال'),
        ),
    ]
