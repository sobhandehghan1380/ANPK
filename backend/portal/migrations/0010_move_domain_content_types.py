from django.db import migrations


MODEL_MOVES = (
    ("wallet", "billing"),
    ("wallettransaction", "billing"),
    ("pricingplan", "billing"),
    ("clientsubscription", "billing"),
    ("invoice", "billing"),
    ("invoiceitem", "billing"),
    ("payment", "billing"),
    ("slasupportcontract", "support"),
    ("supportticket", "support"),
    ("ticketreply", "support"),
    ("inappnotification", "support"),
    ("apikey", "integrations"),
    ("smslog", "integrations"),
)


def move_content_types(apps, source_app, moves):
    ContentType = apps.get_model("contenttypes", "ContentType")

    for model_name, target_app in moves:
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
    move_content_types(apps, "portal", MODEL_MOVES)


def backwards(apps, schema_editor):
    ContentType = apps.get_model("contenttypes", "ContentType")
    for model_name, source_app in reversed(MODEL_MOVES):
        source = ContentType.objects.filter(app_label=source_app, model=model_name).first()
        if source is None:
            continue
        if ContentType.objects.filter(app_label="portal", model=model_name).exclude(pk=source.pk).exists():
            raise RuntimeError(
                f"Cannot restore {source_app}.{model_name}: portal.{model_name} already exists."
            )
        source.app_label = "portal"
        source.save(update_fields=["app_label"])


class Migration(migrations.Migration):
    dependencies = [
        ("portal", "0009_remove_clientsubscription_client_and_more"),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]
