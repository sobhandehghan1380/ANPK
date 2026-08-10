from django.db import migrations


MODELS = ("pricingplan", "clientsubscription")


def move_content_types(apps, source_app, target_app):
    ContentType = apps.get_model("contenttypes", "ContentType")
    for model_name in MODELS:
        source = ContentType.objects.filter(app_label=source_app, model=model_name).first()
        if source is None:
            continue
        if ContentType.objects.filter(app_label=target_app, model=model_name).exclude(pk=source.pk).exists():
            raise RuntimeError(
                f"Cannot move {source_app}.{model_name}: {target_app}.{model_name} already exists."
            )
        source.app_label = target_app
        source.save(update_fields=["app_label"])


def forwards(apps, schema_editor):
    move_content_types(apps, "billing", "subscriptions")


def backwards(apps, schema_editor):
    move_content_types(apps, "subscriptions", "billing")


class Migration(migrations.Migration):
    dependencies = [
        ("billing", "0003_alter_invoice_subscription_delete_pricingplan_and_more"),
        ("subscriptions", "0001_initial"),
        ("support", "0002_alter_slasupportcontract_subscription"),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]
