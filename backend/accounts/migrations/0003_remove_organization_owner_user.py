from django.db import migrations


def validate_owner_memberships(apps, schema_editor):
    Organization = apps.get_model("accounts", "Organization")
    Membership = apps.get_model("accounts", "OrganizationMembership")

    for organization in Organization.objects.all():
        active_owners = Membership.objects.filter(
            organization_id=organization.pk,
            role="OWNER",
            is_active=True,
        )
        owner_count = active_owners.count()
        if owner_count == 1:
            continue
        if owner_count > 1:
            raise RuntimeError(
                f"Organization {organization.pk} has multiple active owners."
            )

        inactive_owner = Membership.objects.filter(
            organization_id=organization.pk,
            role="OWNER",
        ).first()
        if inactive_owner is not None:
            inactive_owner.is_active = True
            inactive_owner.save(update_fields=["is_active"])
            continue

        if organization.owner_user_id is None:
            raise RuntimeError(
                f"Organization {organization.pk} has no owner membership or legacy owner."
            )

        if Membership.objects.filter(user_id=organization.owner_user_id).exists():
            raise RuntimeError(
                f"Legacy owner for organization {organization.pk} already belongs to another organization."
            )
        if Membership.objects.filter(phone=organization.phone).exists():
            raise RuntimeError(
                f"Organization {organization.pk} cannot reuse its phone for an owner membership."
            )

        Membership.objects.create(
            organization_id=organization.pk,
            user_id=organization.owner_user_id,
            phone=organization.phone,
            full_name=organization.contact_person or organization.name,
            role="OWNER",
            is_active=True,
        )


def restore_legacy_owner_links(apps, schema_editor):
    Organization = apps.get_model("accounts", "Organization")
    Membership = apps.get_model("accounts", "OrganizationMembership")

    for organization in Organization.objects.all():
        owner = Membership.objects.filter(
            organization_id=organization.pk,
            role="OWNER",
            is_active=True,
        ).first()
        if owner is not None:
            organization.owner_user_id = owner.user_id
            organization.save(update_fields=["owner_user"])


class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0002_move_content_types"),
    ]

    operations = [
        migrations.RunPython(
            validate_owner_memberships,
            restore_legacy_owner_links,
        ),
        migrations.RemoveField(
            model_name="organization",
            name="owner_user",
        ),
    ]
