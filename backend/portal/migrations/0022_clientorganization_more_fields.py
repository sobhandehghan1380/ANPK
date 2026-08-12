from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('portal', '0021_invoice_discount_amount'),
    ]

    operations = [
        migrations.AddField(
            model_name='clientorganization',
            name='email',
            field=models.EmailField(blank=True, null=True, verbose_name='ایمیل سازمان'),
        ),
        migrations.AddField(
            model_name='clientorganization',
            name='address',
            field=models.TextField(blank=True, null=True, verbose_name='آدرس سازمان'),
        ),
        migrations.AddField(
            model_name='clientorganization',
            name='national_code',
            field=models.CharField(blank=True, max_length=50, null=True, verbose_name='کد اقتصادی / شناسه ملی'),
        ),
        migrations.AddField(
            model_name='clientorganization',
            name='website',
            field=models.URLField(blank=True, null=True, verbose_name='وب‌سایت سازمان'),
        ),
        migrations.AddField(
            model_name='clientorganization',
            name='description',
            field=models.TextField(blank=True, null=True, verbose_name='توضیحات / یادداشت'),
        ),
        migrations.AddField(
            model_name='clientorganization',
            name='logo_url',
            field=models.CharField(blank=True, default='', max_length=500, verbose_name='آدرس لوگوی سازمان'),
        ),
    ]
