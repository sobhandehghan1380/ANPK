from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('portal', '0005_secure_otp_storage'),
    ]

    operations = [
        migrations.AlterField(
            model_name='wallet',
            name='balance',
            field=models.IntegerField(default=0, verbose_name='موجودی حساب کیف پول (تومان)'),
        ),
    ]
