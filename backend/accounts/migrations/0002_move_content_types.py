from django.db import migrations


MODEL_MOVES = (
    ("portal", "userprofile", "accounts", "userprofile"),
    ("portal", "clientorganization", "accounts", "organization"),
    ("portal", "clientmember", "accounts", "organizationmembership"),
    ("portal", "smsotpcode", "accounts", "smsotpcode"),
)


def move_content_types(apps, schema_editor, moves):
    ContentType = apps.get_model("contenttypes", "ContentType")
    Permission = apps.get_model("auth", "Permission")

    for source_app, source_model, target_app, target_model in moves:
        source = ContentType.objects.filter(
            app_label=source_app,
            model=source_model,
        ).first()
        if source is None:
            # Fresh databases create content types after all migrations, using
            # the final accounts model state, so there is nothing to move.
            continue

        if ContentType.objects.filter(
            app_label=target_app,
            model=target_model,
        ).exclude(pk=source.pk).exists():
            raise RuntimeError(
                f"Cannot move {source_app}.{source_model}: "
                f"{target_app}.{target_model} already exists."
            )

        source.app_label = target_app
        source.model = target_model
        source.save(update_fields=["app_label", "model"])

        for permission in Permission.objects.filter(content_type_id=source.pk):
            action, separator, model_name = permission.codename.partition("_")
            if separator and model_name == source_model:
                permission.codename = f"{action}_{target_model}"
                permission.save(update_fields=["codename"])


def forwards(apps, schema_editor):
    move_content_types(apps, schema_editor, MODEL_MOVES)


def backwards(apps, schema_editor):
    reverse_moves = tuple(
        (target_app, target_model, source_app, source_model)
        for source_app, source_model, target_app, target_model in reversed(MODEL_MOVES)
    )
    move_content_types(apps, schema_editor, reverse_moves)


class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0001_initial"),
        ("portal", "0008_remove_clientmember_organization_and_more"),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]
