from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('portal', '0023_clientorganization_tags_portal_access'),
    ]

    operations = [
        migrations.AddField(
            model_name='pricingplan',
            name='min_months',
            field=models.IntegerField(default=1, verbose_name='حداقل مدت (ماه)'),
        ),
    ]
