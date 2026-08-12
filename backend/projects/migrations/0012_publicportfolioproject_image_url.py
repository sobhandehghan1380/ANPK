from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0011_publicportfolioproject_meta_description_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='publicportfolioproject',
            name='image_url',
            field=models.CharField(blank=True, default='', max_length=500, verbose_name='آدرس تصویر نمونه\u200cکار'),
        ),
    ]
