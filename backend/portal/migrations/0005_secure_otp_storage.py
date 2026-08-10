from django.db import migrations, models


def purge_legacy_otp_codes(apps, schema_editor):
    apps.get_model('portal', 'SMSOTPCode').objects.all().delete()


class Migration(migrations.Migration):

    dependencies = [
        ('portal', '0004_backfill_client_members'),
    ]

    operations = [
        migrations.AlterField(
            model_name='smsotpcode',
            name='code',
            field=models.CharField(max_length=128, verbose_name='هش کد OTP'),
        ),
        migrations.RunPython(purge_legacy_otp_codes, migrations.RunPython.noop),
    ]
