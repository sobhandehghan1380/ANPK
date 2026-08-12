from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('leads', '0002_leadactivitylog'),
    ]

    operations = [
        migrations.AddField(
            model_name='projectlead',
            name='priority',
            field=models.CharField(choices=[('hot', 'داغ (فوری)'), ('warm', 'گرم (احتمالی)'), ('cold', 'سرد (بلندمدت)')], default='warm', max_length=20, verbose_name='اولویت'),
        ),
        migrations.AddField(
            model_name='projectlead',
            name='source',
            field=models.CharField(blank=True, max_length=100, null=True, verbose_name='منبع لید'),
        ),
        migrations.AddField(
            model_name='projectlead',
            name='assigned_to',
            field=models.CharField(blank=True, max_length=100, null=True, verbose_name='مسئول پیگیری'),
        ),
    ]
