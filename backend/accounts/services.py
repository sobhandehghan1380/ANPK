from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password

from .models import OrganizationMembership


User = get_user_model()


def normalize_phone(phone):
    value = str(phone or "").strip().replace(" ", "").replace("-", "")
    if value.startswith("+98"):
        value = f"0{value[3:]}"
    elif value.startswith("98") and len(value) == 12:
        value = f"0{value[2:]}"
    return value


def ensure_owner_membership(organization, phone, full_name, member_user=None):
    """Ensure an organization has an active OWNER membership."""
    existing_owner = organization.members.filter(role="OWNER", is_active=True).first()
    if existing_owner:
        changed_fields = []
        normalized_phone = normalize_phone(phone)
        if full_name and existing_owner.full_name != full_name:
            existing_owner.full_name = full_name
            changed_fields.append("full_name")
        if normalized_phone and existing_owner.phone != normalized_phone:
            phone_taken = OrganizationMembership.objects.filter(phone=normalized_phone).exclude(pk=existing_owner.pk).exists()
            if not phone_taken:
                existing_owner.phone = normalized_phone
                changed_fields.append("phone")
        if member_user and existing_owner.user_id != member_user.id:
            user_taken = OrganizationMembership.objects.filter(user=member_user).exclude(pk=existing_owner.pk).exists()
            if not user_taken:
                existing_owner.user = member_user
                changed_fields.append("user")
        if changed_fields:
            existing_owner.save(update_fields=changed_fields)
        return existing_owner

    phone = normalize_phone(phone)
    if not phone or OrganizationMembership.objects.filter(phone=phone).exists():
        return None

    if member_user is None:
        username = f"client_{phone}"
        member_user, _ = User.objects.get_or_create(
            username=username,
            defaults={
                "first_name": full_name or organization.name,
                "password": make_password(None),
            },
        )
    elif OrganizationMembership.objects.filter(user=member_user).exists():
        return None

    return OrganizationMembership.objects.create(
        organization=organization,
        user=member_user,
        phone=phone,
        full_name=full_name or organization.name,
        role="OWNER",
    )
