from django.contrib.auth.hashers import make_password
from django.db import migrations


def backfill_owner_members(apps, schema_editor):
    ClientOrganization = apps.get_model('portal', 'ClientOrganization')
    ClientMember = apps.get_model('portal', 'ClientMember')
    User = apps.get_model('auth', 'User')

    for org in ClientOrganization.objects.all():
        if not org.phone:
            continue
        if ClientMember.objects.filter(phone=org.phone).exists():
            continue

        username = f"client_{org.phone}"
        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                'first_name': org.contact_person or org.name,
                'password': make_password(None),
            },
        )

        ClientMember.objects.create(
            organization=org,
            user=user,
            phone=org.phone,
            full_name=org.contact_person or org.name,
            role='OWNER',
            is_active=True,
        )


def noop_reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('portal', '0003_clientmember'),
    ]

    operations = [
        migrations.RunPython(backfill_owner_members, noop_reverse),
    ]
