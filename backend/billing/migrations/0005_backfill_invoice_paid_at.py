from django.db import migrations


def backfill_invoice_paid_at(apps, schema_editor):
    Invoice = apps.get_model("billing", "Invoice")
    for invoice in Invoice.objects.filter(status="paid", paid_at__isnull=True).iterator():
        payment = invoice.payments.order_by("paid_at", "id").first()
        if payment:
            invoice.paid_at = payment.paid_at
            invoice.save(update_fields=["paid_at"])


class Migration(migrations.Migration):
    dependencies = [
        ("billing", "0004_alter_wallet_options_invoice_paid_at_and_more"),
    ]

    operations = [
        migrations.RunPython(backfill_invoice_paid_at, migrations.RunPython.noop),
    ]
