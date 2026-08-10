from .models import OrganizationMembership


def get_current_member(request):
    """Return the active organization membership for the authenticated user."""
    if not request.user or not request.user.is_authenticated:
        return None

    return (
        OrganizationMembership.objects.select_related("organization", "user")
        .filter(user=request.user, is_active=True)
        .first()
    )
