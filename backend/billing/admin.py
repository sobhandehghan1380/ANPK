from django.contrib import admin

from .models import Invoice, InvoiceItem, Payment, Wallet, WalletTransaction


@admin.register(Wallet)
class WalletAdmin(admin.ModelAdmin):
    list_display = ("client", "balance", "is_active", "updated_at")
    search_fields = ("client__name",)
    list_filter = ("is_active",)


@admin.register(WalletTransaction)
class WalletTransactionAdmin(admin.ModelAdmin):
    list_display = ("wallet", "transaction_type", "amount", "balance_before", "balance_after", "invoice", "project", "status", "created_at")
    list_filter = ("transaction_type", "status", "created_at")
    search_fields = ("wallet__client__name", "invoice__invoice_number", "idempotency_key")


class InvoiceItemInline(admin.TabularInline):
    model = InvoiceItem
    extra = 0


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ("invoice_number", "client", "project", "invoice_type", "total_amount", "status", "due_date", "paid_at")
    search_fields = ("invoice_number", "client__name", "project__title")
    list_filter = ("status", "invoice_type", "created_at")
    inlines = (InvoiceItemInline,)


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ("invoice", "amount", "payment_method", "status", "reference_id", "paid_at")
    search_fields = ("invoice__invoice_number", "reference_id")
    list_filter = ("payment_method", "status", "paid_at")
