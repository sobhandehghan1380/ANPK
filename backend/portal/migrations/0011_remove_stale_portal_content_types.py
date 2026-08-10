from django.db import migrations


def remove_stale_content_types(apps, schema_editor):
    ContentType = apps.get_model("contenttypes", "ContentType")
    ContentType.objects.filter(
        app_label="portal",
        model__in=("clientapikey", "smsotpcode"),
    ).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("portal", "0010_move_domain_content_types"),
    ]

    operations = [
        migrations.RunPython(
            remove_stale_content_types,
            migrations.RunPython.noop,
        ),
    ]
