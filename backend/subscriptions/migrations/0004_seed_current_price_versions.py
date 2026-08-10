from django.db import migrations


def seed_current_price_versions(apps, schema_editor):
    PricingPlan = apps.get_model("subscriptions", "PricingPlan")
    PricingPlanVersion = apps.get_model("subscriptions", "PricingPlanVersion")
    for plan in PricingPlan.objects.all().iterator():
        if plan.service_type == "HOSTING":
            monthly_price = plan.server_cost or plan.monthly_price
        elif plan.service_type in {"SUPPORT", "MAINTENANCE"}:
            monthly_price = plan.support_cost or plan.monthly_price
        else:
            monthly_price = plan.monthly_price
        PricingPlanVersion.objects.get_or_create(
            plan_id=plan.id,
            effective_from=plan.created_at.date(),
            defaults={"monthly_price": max(monthly_price, 0)},
        )


class Migration(migrations.Migration):
    dependencies = [
        ("subscriptions", "0003_pricingplanversion_subscriptionperiod_and_more"),
    ]

    operations = [
        migrations.RunPython(seed_current_price_versions, migrations.RunPython.noop),
    ]
