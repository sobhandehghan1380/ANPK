from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('services', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='openrouterconfig',
            name='api_key',
            field=models.CharField(blank=True, default='', max_length=255, verbose_name='کلید API سرویس هوش مصنوعی'),
        ),
        migrations.AlterField(
            model_name='smsgatewayconfig',
            name='api_key',
            field=models.CharField(blank=True, default='', max_length=255, verbose_name='کلید API درگاه پیامک'),
        ),
        migrations.AlterField(
            model_name='smsgatewayconfig',
            name='sender_line',
            field=models.CharField(blank=True, default='', max_length=50, verbose_name='خط اختصاصی ارسال پیامک'),
        ),
    ]
