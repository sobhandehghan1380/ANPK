import uuid
from datetime import date, timedelta

from django.db import transaction
from django.db.models import Q
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response

from accounts.models import Organization as ClientOrganization
from billing.models import Invoice, InvoiceItem
from billing.services import BillingError, create_renewal_invoice, settle_invoice
from projects.models import ClientContractProject
from subscriptions.models import ClientSubscription, PricingPlan, PricingPlanVersion, SubscriptionPeriod


def _plan_monthly_price(plan):
    if plan.service_type == "HOSTING":
        return plan.server_cost or plan.monthly_price
    if plan.service_type in {"SUPPORT", "MAINTENANCE"}:
        return plan.support_cost or plan.monthly_price
    return plan.monthly_price


@api_view(["GET", "POST", "DELETE"])
@permission_classes([IsAdminUser])
def admin_pricing_plans(request):
    if request.method == "POST":
        action = request.data.get("action")
        if action == "toggle_active":
            plan = PricingPlan.objects.get(id=request.data.get("id"))
            plan.is_active = not plan.is_active
            plan.save(update_fields=["is_active"])
            return Response({"message": f"وضعیت پلن {plan.name} تغییر یافت."})
        if action == "delete":
            PricingPlan.objects.filter(id=request.data.get("id")).delete()
            return Response({"message": "پلن با موفقیت حذف شد."})

        try:
            price_fields = {
                "monthly_price": int(request.data.get("monthly_price", 0)),
                "yearly_price": int(request.data.get("yearly_price", 0)),
                "server_cost": int(request.data.get("server_cost", 0)),
                "support_cost": int(request.data.get("support_cost", 0)),
                "trial_days": int(request.data.get("trial_days", 0)),
                "min_months": int(request.data.get("min_months", 1)),
            }
        except (TypeError, ValueError):
            return Response({"error": "مقادیر قیمت و مدت باید عدد باشند."}, status=400)

        effective_from = request.data.get("effective_from") or timezone.localdate()
        if isinstance(effective_from, str):
            try:
                effective_from = date.fromisoformat(effective_from)
            except ValueError:
                return Response({"error": "تاریخ شروع اعتبار قیمت معتبر نیست."}, status=400)
        plan_id = request.data.get("id")
        with transaction.atomic():
            if plan_id:
                plan = PricingPlan.objects.select_for_update().get(id=plan_id)
                plan.name = request.data.get("name") or plan.name
                plan.description = request.data.get("description", "")
                plan.service_type = request.data.get("service_type", plan.service_type)
                plan.features_list = request.data.get("features_list", "")
                for field, value in price_fields.items():
                    setattr(plan, field, value)
                plan.save()
                message = "پلن قیمتی بروزرسانی شد."
            else:
                plan = PricingPlan.objects.create(
                    name=request.data.get("name"),
                    description=request.data.get("description", ""),
                    service_type=request.data.get("service_type", "SUPPORT"),
                    features_list=request.data.get("features_list", ""),
                    **price_fields,
                )
                message = "پلن جدید با موفقیت اضافه شد."

            # Price versions make future price changes independent of already-issued periods.
            price_version, _ = PricingPlanVersion.objects.update_or_create(
                plan=plan,
                effective_from=effective_from,
                defaults={"monthly_price": _plan_monthly_price(plan)},
            )
            next_version = (
                PricingPlanVersion.objects.filter(plan=plan, effective_from__gt=price_version.effective_from)
                .order_by("effective_from")
                .first()
            )
            price_version.effective_to = next_version.effective_from - timedelta(days=1) if next_version else None
            price_version.save(update_fields=["effective_to"])
            PricingPlanVersion.objects.filter(
                plan=plan,
                effective_from__lt=price_version.effective_from,
            ).filter(
                Q(effective_to__isnull=True) | Q(effective_to__gte=price_version.effective_from),
            ).update(effective_to=price_version.effective_from - timedelta(days=1))
        return Response({"message": message, "id": plan.id})

    if request.method == "DELETE":
        PricingPlan.objects.filter(id=request.data.get("id")).delete()
        return Response({"message": "پلن با موفقیت حذف شد."})

    plans = PricingPlan.objects.prefetch_related("price_versions").all().order_by("-created_at")
    return Response([
        {
            "id": plan.id,
            "name": plan.name,
            "description": plan.description,
            "service_type": plan.service_type,
            "monthly_price": plan.monthly_price,
            "yearly_price": plan.yearly_price,
            "server_cost": plan.server_cost,
            "support_cost": plan.support_cost,
            "trial_days": plan.trial_days,
            "min_months": plan.min_months,
            "features_list": plan.features_list,
            "is_active": plan.is_active,
            "price_versions": [
                {
                    "id": version.id,
                    "effective_from": version.effective_from.isoformat(),
                    "effective_to": version.effective_to.isoformat() if version.effective_to else None,
                    "monthly_price": version.monthly_price,
                }
                for version in plan.price_versions.all()
            ],
        }
        for plan in plans
    ])


@api_view(["GET", "POST", "DELETE"])
@permission_classes([IsAdminUser])
def admin_subscriptions(request):
    if request.method == "POST":
        action = request.data.get("action")

        if action == "cancel_subscription":
            try:
                with transaction.atomic():
                    subscription = ClientSubscription.objects.select_for_update().get(id=request.data.get("subscription_id"))
                    subscription.invoices.filter(status="pending").update(status="cancelled")
                    subscription.periods.filter(status="INVOICED").update(status="CANCELED")
                    subscription.status = "canceled"
                    subscription.canceled_at = timezone.now()
                    subscription.cancellation_reason = request.data.get("reason", "")
                    subscription.auto_renew = False
                    subscription.save(update_fields=["status", "canceled_at", "cancellation_reason", "auto_renew"])
            except ClientSubscription.DoesNotExist:
                return Response({"error": "قرارداد سرویس یافت نشد."}, status=404)
            return Response({"message": "قرارداد سرویس با موفقیت لغو شد."})

        if action == "renew_subscription":
            try:
                subscription = ClientSubscription.objects.get(id=request.data.get("subscription_id"))
                invoice, period = create_renewal_invoice(
                    subscription,
                    request.data.get("months", 1),
                    discount_amount=request.data.get("discount_amount", 0),
                    tax_amount=request.data.get("tax_amount", 0),
                )
            except ClientSubscription.DoesNotExist:
                return Response({"error": "قرارداد سرویس یافت نشد."}, status=404)
            except BillingError as exc:
                return Response({"error": str(exc)}, status=400)
            return Response({
                "message": "فاکتور تمدید صادر شد؛ دوره پس از پرداخت فعال می‌شود.",
                "invoice_id": invoice.id,
                "invoice_number": invoice.invoice_number,
                "period_id": period.id,
                "months": period.months,
            })

        if action == "create_subscription":
            try:
                project = ClientContractProject.objects.select_related("client").get(id=request.data.get("project_id"))
            except ClientContractProject.DoesNotExist:
                return Response({"error": "انتخاب یک پروژه معتبر الزامی است."}, status=404)

            use_custom_plan = bool(request.data.get("use_custom_plan", False))
            plan = None
            if not use_custom_plan:
                try:
                    plan = PricingPlan.objects.get(id=request.data.get("plan_id"), is_active=True)
                except PricingPlan.DoesNotExist:
                    return Response({"error": "انتخاب یک پلن فعال الزامی است."}, status=400)
            service_type = request.data.get("service_type") or (plan.service_type if plan else "SUPPORT")
            if ClientSubscription.objects.filter(
                project=project,
                service_type=service_type,
                status__in=["trialing", "active", "past_due"],
            ).exists():
                return Response({"error": "برای این نوع سرویس در پروژه، قرارداد باز دیگری وجود دارد."}, status=400)

            custom = request.data.get("custom_plan", {}) if use_custom_plan else {}
            today = timezone.localdate()
            try:
                with transaction.atomic():
                    subscription = ClientSubscription.objects.create(
                        client=project.client,
                        project=project,
                        plan=plan,
                        service_type=service_type,
                        is_custom_plan=use_custom_plan,
                        custom_plan_name=custom.get("name", "پلن اختصاصی") if use_custom_plan else None,
                        custom_monthly_price=int(custom.get("monthly_price", 0)),
                        custom_yearly_price=int(custom.get("yearly_price", 0)),
                        custom_server_cost=int(custom.get("server_cost", 0)),
                        custom_support_cost=int(custom.get("support_cost", 0)),
                        custom_description=custom.get("description", ""),
                        start_date=today,
                        end_date=today,
                        status="past_due",
                        auto_renew=bool(request.data.get("auto_renew", False)),
                    )
                    invoice, period = create_renewal_invoice(
                        subscription,
                        request.data.get("months", 1),
                        discount_amount=request.data.get("discount_amount", 0),
                        tax_amount=request.data.get("tax_amount", 0),
                    )
            except (TypeError, ValueError):
                return Response({"error": "قیمت پلن اختصاصی معتبر نیست."}, status=400)
            except BillingError as exc:
                return Response({"error": str(exc)}, status=400)
            return Response({
                "message": "قرارداد سرویس و فاکتور دوره نخست ثبت شد؛ فعال‌سازی پس از پرداخت انجام می‌شود.",
                "id": subscription.id,
                "invoice_id": invoice.id,
                "period_id": period.id,
            })

        return Response({"error": "عملیات نامعتبر."}, status=400)

    if request.method == "DELETE":
        ClientSubscription.objects.filter(id=request.data.get("id")).delete()
        return Response({"message": "قرارداد سرویس حذف شد."})

    subscriptions = (
        ClientSubscription.objects.select_related("client", "project", "plan", "sla_contract")
        .prefetch_related("periods")
        .all()
        .order_by("-created_at")
    )
    data = [
        {
            "id": item.id,
            "client_name": item.client.name,
            "client_id": item.client_id,
            "project_id": item.project_id,
            "project_name": item.project.title if item.project else "قرارداد قدیمی بدون پروژه",
            "service_type": item.service_type,
            "plan_name": item.plan.name if item.plan else (item.custom_plan_name or "نامشخص"),
            "has_sla": hasattr(item, "sla_contract"),
            "is_custom_plan": item.is_custom_plan,
            "status": item.status,
            "start_date": item.start_date.isoformat(),
            "end_date": item.end_date.isoformat(),
            "trial_end": item.trial_end.isoformat() if item.trial_end else None,
            "auto_renew": item.auto_renew,
            "canceled_at": item.canceled_at.date().isoformat() if item.canceled_at else None,
            "cancellation_reason": item.cancellation_reason,
            "days_remaining": (item.end_date - timezone.localdate()).days,
            "monthly_price": item.custom_monthly_price if item.is_custom_plan else (_plan_monthly_price(item.plan) if item.plan else 0),
            "periods": [
                {
                    "id": period.id,
                    "months": period.months,
                    "start_date": period.start_date.isoformat(),
                    "end_date": period.end_date.isoformat(),
                    "total_amount": period.total_amount,
                    "status": period.status,
                    "invoice_id": period.invoice_id,
                }
                for period in item.periods.all()
            ],
        }
        for item in subscriptions
    ]
    projects = [
        {
            "id": project.id,
            "title": project.title,
            "client_id": project.client_id,
            "client_name": project.client.name,
            "contract_number": project.contract_number,
        }
        for project in ClientContractProject.objects.select_related("client").filter(is_active=True)
    ]
    plans = [
        {
            "id": plan.id,
            "name": plan.name,
            "service_type": plan.service_type,
            "monthly_price": plan.monthly_price,
            "yearly_price": plan.yearly_price,
            "server_cost": plan.server_cost,
            "support_cost": plan.support_cost,
            "trial_days": plan.trial_days,
            "min_months": plan.min_months,
        }
        for plan in PricingPlan.objects.filter(is_active=True)
    ]
    return Response({"subscriptions": data, "projects": projects, "plans": plans})


def _payment_method_code(value):
    normalized = str(value or "").strip().upper()
    if normalized in {"WALLET", "کیف پول"}:
        return "WALLET"
    if normalized in {"GATEWAY", "درگاه", "درگاه پرداخت"}:
        return "GATEWAY"
    return "BANK"


@api_view(["GET", "POST", "DELETE"])
@permission_classes([IsAdminUser])
def admin_invoices(request):
    if request.method == "POST":
        action = request.data.get("action")
        if action == "mark_paid":
            try:
                invoice = Invoice.objects.get(id=request.data.get("id"))
                method = _payment_method_code(request.data.get("payment_method"))
                reference = request.data.get("reference_id") or f"ADMIN-{uuid.uuid4().hex[:12].upper()}"
                result = settle_invoice(
                    invoice,
                    payment_method=method,
                    reference_id=reference,
                    idempotency_key=f"admin:{invoice.id}:{reference}",
                )
            except Invoice.DoesNotExist:
                return Response({"error": "فاکتور یافت نشد."}, status=404)
            except BillingError as exc:
                return Response({"error": str(exc)}, status=400)
            message = "این فاکتور قبلاً پرداخت شده بود." if result.already_paid else f"فاکتور {invoice.invoice_number} تسویه شد."
            return Response({"message": message, "status": "success", "payment_method": method})

        if action == "cancel":
            try:
                invoice = Invoice.objects.get(id=request.data.get("id"), status="pending")
            except Invoice.DoesNotExist:
                return Response({"error": "فقط فاکتور پرداخت‌نشده قابل لغو است."}, status=400)
            invoice.status = "cancelled"
            invoice.save(update_fields=["status"])
            SubscriptionPeriod.objects.filter(invoice=invoice, status="INVOICED").update(status="CANCELED")
            return Response({"message": "فاکتور لغو شد."})

        invoice_type = request.data.get("invoice_type", "custom")
        if invoice_type == "subscription":
            return Response({"error": "فاکتور سرویس باید از عملیات تمدید قرارداد صادر شود."}, status=400)
        items = request.data.get("items", [])
        if not items:
            return Response({"error": "فاکتور باید حداقل یک ردیف داشته باشد."}, status=400)

        client_id = request.data.get("client_id")
        project = None
        if request.data.get("project_id"):
            try:
                project = ClientContractProject.objects.select_related("client").get(id=request.data.get("project_id"))
                client_id = project.client_id
            except ClientContractProject.DoesNotExist:
                return Response({"error": "پروژه یافت نشد."}, status=404)
        if not client_id:
            return Response({"error": "سازمان پرداخت‌کننده الزامی است."}, status=400)

        try:
            amount = sum(int(row.get("unit_price", 0)) * int(row.get("quantity", 1)) for row in items)
            discount = int(request.data.get("discount_amount", 0))
            tax = int(request.data.get("tax_amount", 0))
            due_date = request.data.get("due_date") or timezone.localdate()
        except (TypeError, ValueError):
            return Response({"error": "مبالغ فاکتور معتبر نیستند."}, status=400)

        invoice_number = f"INV-{uuid.uuid4().hex[:8].upper()}"
        with transaction.atomic():
            invoice = Invoice.objects.create(
                client_id=client_id,
                project=project,
                invoice_type=invoice_type,
                description=request.data.get("description", ""),
                invoice_number=invoice_number,
                amount=amount,
                discount_amount=discount,
                tax_amount=tax,
                total_amount=max(0, amount - discount + tax),
                due_date=due_date,
            )
            for row in items:
                InvoiceItem.objects.create(
                    invoice=invoice,
                    title=row.get("title"),
                    quantity=int(row.get("quantity", 1)),
                    unit_price=int(row.get("unit_price", 0)),
                )
        return Response({"message": f"فاکتور {invoice_number} صادر شد.", "id": invoice.id})

    if request.method == "DELETE":
        deleted, _ = Invoice.objects.filter(id=request.data.get("id"), status="pending").delete()
        if not deleted:
            return Response({"error": "فاکتور پرداخت‌شده یا ناموجود قابل حذف نیست."}, status=400)
        return Response({"message": "فاکتور حذف شد."})

    invoices = Invoice.objects.select_related("client", "project", "subscription__plan").prefetch_related("items", "payments").all().order_by("-created_at")
    data = [
        {
            "id": invoice.id,
            "client_name": invoice.client.name,
            "client_id": invoice.client_id,
            "project_id": invoice.project_id,
            "project_name": invoice.project.title if invoice.project else None,
            "invoice_number": invoice.invoice_number,
            "invoice_type": invoice.invoice_type,
            "description": invoice.description,
            "amount": invoice.amount,
            "discount_amount": invoice.discount_amount,
            "tax_amount": invoice.tax_amount,
            "total_amount": invoice.total_amount,
            "status": invoice.status,
            "due_date": invoice.due_date.isoformat(),
            "paid_at": invoice.paid_at.isoformat() if invoice.paid_at else None,
            "created_at": invoice.created_at.strftime("%Y/%m/%d - %H:%M"),
            "subscription_desc": f"بابت {invoice.subscription.plan.name}" if invoice.subscription and invoice.subscription.plan else (invoice.description or "خدمات متفرقه"),
            "payment_method": invoice.payments.order_by("-paid_at").values_list("payment_method", flat=True).first(),
            "items": [
                {
                    "title": item.title,
                    "quantity": item.quantity,
                    "unit_price": item.unit_price,
                    "total_price": item.total_price,
                }
                for item in invoice.items.all()
            ],
        }
        for invoice in invoices
    ]
    clients = [{"id": client.id, "name": client.name} for client in ClientOrganization.objects.all()]
    projects = [
        {"id": project.id, "client_id": project.client_id, "client_name": project.client.name, "title": project.title}
        for project in ClientContractProject.objects.select_related("client").filter(is_active=True)
    ]
    subscriptions = [
        {
            "id": item.id,
            "client_id": item.client_id,
            "project_id": item.project_id,
            "label": f"{item.project.title if item.project else item.client.name} - {item.plan.name if item.plan else (item.custom_plan_name or 'بدون پلن')}",
        }
        for item in ClientSubscription.objects.select_related("client", "project", "plan").filter(status__in=["active", "past_due"])
    ]
    return Response({"invoices": data, "clients": clients, "projects": projects, "subscriptions": subscriptions})
