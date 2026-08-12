from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('portal', '0024_pricingplan_min_months'),
    ]

    operations = [
        # PricingPlan new fields
        migrations.AddField(
            model_name='pricingplan',
            name='description',
            field=models.TextField(blank=True, null=True, verbose_name='توضیحات پلن'),
        ),
        migrations.AddField(
            model_name='pricingplan',
            name='server_cost',
            field=models.IntegerField(default=0, verbose_name='هزینه سرور (تومان)'),
        ),
        migrations.AddField(
            model_name='pricingplan',
            name='support_cost',
            field=models.IntegerField(default=0, verbose_name='هزینه پشتیبانی (تومان)'),
        ),
        migrations.AddField(
            model_name='pricingplan',
            name='trial_days',
            field=models.IntegerField(default=0, verbose_name='روزهای تست رایگان'),
        ),
        
        # ClientSubscription new fields
        migrations.AddField(
            model_name='clientsubscription',
            name='is_custom_plan',
            field=models.BooleanField(default=False, verbose_name='پلن اختصاصی'),
        ),
        migrations.AddField(
            model_name='clientsubscription',
            name='custom_plan_name',
            field=models.CharField(blank=True, max_length=150, null=True, verbose_name='نام پلن اختصاصی'),
        ),
        migrations.AddField(
            model_name='clientsubscription',
            name='custom_monthly_price',
            field=models.IntegerField(default=0, verbose_name='قیمت ماهانه اختصاصی'),
        ),
        migrations.AddField(
            model_name='clientsubscription',
            name='custom_yearly_price',
            field=models.IntegerField(default=0, verbose_name='قیمت سالانه اختصاصی'),
        ),
        migrations.AddField(
            model_name='clientsubscription',
            name='custom_description',
            field=models.TextField(blank=True, null=True, verbose_name='توضیحات پلن اختصاصی'),
        ),
        migrations.AddField(
            model_name='clientsubscription',
            name='status',
            field=models.CharField(choices=[('trialing', 'در دوره تست'), ('active', 'فعال'), ('past_due', 'سررسید شده'), ('canceled', 'لغو شده'), ('expired', 'منقضی شده')], default='trialing', max_length=20, verbose_name='وضعیت اشتراک'),
        ),
        migrations.AddField(
            model_name='clientsubscription',
            name='trial_end',
            field=models.DateField(blank=True, null=True, verbose_name='تاریخ پایان تست'),
        ),
        migrations.AddField(
            model_name='clientsubscription',
            name='canceled_at',
            field=models.DateTimeField(blank=True, null=True, verbose_name='تاریخ لغو'),
        ),
        migrations.AddField(
            model_name='clientsubscription',
            name='cancellation_reason',
            field=models.TextField(blank=True, null=True, verbose_name='دلیل لغو'),
        ),
    ]
