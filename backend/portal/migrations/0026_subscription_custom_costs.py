from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('portal', '0025_subscription_enhancements'),
    ]

    operations = [
        migrations.AddField(
            model_name='clientsubscription',
            name='custom_server_cost',
            field=models.IntegerField(default=0, verbose_name='هزینه سرور اختصاصی'),
        ),
        migrations.AddField(
            model_name='clientsubscription',
            name='custom_support_cost',
            field=models.IntegerField(default=0, verbose_name='هزینه پشتیبانی اختصاصی'),
        ),
    ]
