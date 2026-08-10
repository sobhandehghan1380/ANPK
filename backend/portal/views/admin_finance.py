from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from portal.models import ClientOrganization, PricingPlan, ClientSubscription, Invoice, Payment, Wallet, WalletTransaction, InvoiceItem
import uuid

@api_view(['GET', 'POST', 'DELETE'])
@permission_classes([IsAdminUser])
def admin_pricing_plans(request):
    """
    API for managing SaaS / Support Pricing Plans
    """
    if request.method == 'POST':
        action = request.data.get('action')
        if action == 'toggle_active':
            plan = PricingPlan.objects.get(id=request.data.get('id'))
            plan.is_active = not plan.is_active
            plan.save()
            return Response({'message': f'وضعیت پلن {plan.name} تغییر یافت.'})

        plan_id = request.data.get('id')
        name = request.data.get('name')
        monthly_price = int(request.data.get('monthly_price', 0))
        yearly_price = int(request.data.get('yearly_price', 0))
        features_list = request.data.get('features_list', '')

        if plan_id:
            plan = PricingPlan.objects.get(id=plan_id)
            plan.name = name
            plan.monthly_price = monthly_price
            plan.yearly_price = yearly_price
            plan.features_list = features_list
            plan.save()
            return Response({'message': 'پلن قیمتی بروزرسانی شد.'})
        else:
            PricingPlan.objects.create(
                name=name,
                monthly_price=monthly_price,
                yearly_price=yearly_price,
                features_list=features_list
            )
            return Response({'message': 'پلن جدید با موفقیت اضافه شد.'})

    if request.method == 'DELETE':
        PricingPlan.objects.filter(id=request.data.get('id')).delete()
        return Response({'message': 'پلن با موفقیت حذف شد.'})

    plans = PricingPlan.objects.all().order_by('-created_at')
    data = [{
        'id': p.id,
        'name': p.name,
        'monthly_price': p.monthly_price,
        'yearly_price': p.yearly_price,
        'features_list': p.features_list,
        'is_active': p.is_active,
    } for p in plans]
    return Response(data)


@api_view(['GET', 'POST', 'DELETE'])
@permission_classes([IsAdminUser])
def admin_subscriptions(request):
    """
    API for Managing Client Subscriptions
    Standard SaaS subscription lifecycle:
    - trialing: In free trial period
    - active: Active and paid
    - past_due: Payment overdue
    - canceled: Canceled by customer
    - expired: Subscription ended
    """
    if request.method == 'POST':
        action = request.data.get('action')
        
        # Cancel subscription
        if action == 'cancel_subscription':
            sub_id = request.data.get('subscription_id')
            cancellation_reason = request.data.get('reason', '')
            try:
                sub = ClientSubscription.objects.get(id=sub_id)
                sub.status = 'canceled'
                sub.canceled_at = timezone.now()
                sub.cancellation_reason = cancellation_reason
                sub.auto_renew = False
                sub.save()
                return Response({'message': 'اشتراک با موفقیت لغو شد.'})
            except ClientSubscription.DoesNotExist:
                return Response({'error': 'اشتراک یافت نشد.'}, status=404)

        # Renew subscription
        if action == 'renew_subscription':
            sub_id = request.data.get('subscription_id')
            try:
                sub = ClientSubscription.objects.get(id=sub_id)
                from datetime import timedelta
                sub.end_date = sub.end_date + timedelta(days=365)
                sub.status = 'active'
                sub.save()
                return Response({'message': 'اشتراک با موفقیت تمدید شد.'})
            except ClientSubscription.DoesNotExist:
                return Response({'error': 'اشتراک یافت نشد.'}, status=404)

        # Create subscription
        if action == 'create_subscription':
            client_id = request.data.get('client_id')
            months = int(request.data.get('months', 1))
            auto_renew = request.data.get('auto_renew', False)
            use_custom_plan = request.data.get('use_custom_plan', False)

            from datetime import datetime, timedelta
            start_date = datetime.now().date()
            end_date = start_date + timedelta(days=30 * months)

            # Create subscription data
            sub_data = {
                'client_id': client_id,
                'start_date': start_date,
                'end_date': end_date,
                'auto_renew': auto_renew,
            }

            if use_custom_plan:
                # Custom plan for this specific customer
                custom_plan = request.data.get('custom_plan', {})
                sub_data['is_custom_plan'] = True
                sub_data['custom_plan_name'] = custom_plan.get('name', 'پلن اختصاصی')
                sub_data['custom_monthly_price'] = int(custom_plan.get('monthly_price', 0))
                sub_data['custom_yearly_price'] = int(custom_plan.get('yearly_price', 0))
                sub_data['custom_description'] = custom_plan.get('description', '')
                sub_data['custom_server_cost'] = int(custom_plan.get('server_cost', 0))
                sub_data['custom_support_cost'] = int(custom_plan.get('support_cost', 0))
                sub_data['status'] = 'active'
            else:
                # Standard plan
                plan_id = request.data.get('plan_id')
                if not plan_id:
                    return Response({'error': 'لطفاً پلن را انتخاب کنید.'}, status=400)
                sub_data['plan_id'] = plan_id
                
                # Check if plan has trial period
                try:
                    plan = PricingPlan.objects.get(id=plan_id)
                    if plan.trial_days > 0:
                        sub_data['status'] = 'trialing'
                        sub_data['trial_end'] = start_date + timedelta(days=plan.trial_days)
                    else:
                        sub_data['status'] = 'active'
                except PricingPlan.DoesNotExist:
                    sub_data['status'] = 'active'

            sub = ClientSubscription.objects.create(**sub_data)
            return Response({'message': 'اشتراک جدید با موفقیت ثبت شد.', 'id': sub.id})

        return Response({'error': 'عملیات نامعتبر.'}, status=400)

    if request.method == 'DELETE':
        ClientSubscription.objects.filter(id=request.data.get('id')).delete()
        return Response({'message': 'اشتراک با موفقیت حذف شد.'})

    # GET - List all subscriptions with related data
    subs = ClientSubscription.objects.select_related('client', 'plan').all().order_by('-created_at')
    data = [{
        'id': s.id,
        'client_name': s.client.name,
        'client_id': s.client.id,
        'plan_name': s.plan.name if s.plan else (s.custom_plan_name or 'نامشخص'),
        'is_custom_plan': s.is_custom_plan,
        'status': s.status,
        'start_date': s.start_date.strftime('%Y-%m-%d'),
        'end_date': s.end_date.strftime('%Y-%m-%d'),
        'trial_end': s.trial_end.strftime('%Y-%m-%d') if s.trial_end else None,
        'auto_renew': s.auto_renew,
        'canceled_at': s.canceled_at.strftime('%Y-%m-%d') if s.canceled_at else None,
        'cancellation_reason': s.cancellation_reason,
        'days_remaining': (s.end_date - __import__('datetime').datetime.now().date()).days,
        'monthly_price': s.custom_monthly_price if s.is_custom_plan else (s.plan.monthly_price if s.plan else 0),
    } for s in subs]
    
    # Also return clients and plans for the form dropdowns
    clients = [{'id': c.id, 'name': c.name} for c in ClientOrganization.objects.all()]
    plans = [{
        'id': p.id,
        'name': p.name,
        'monthly_price': p.monthly_price,
        'yearly_price': p.yearly_price,
        'server_cost': p.server_cost,
        'support_cost': p.support_cost,
        'trial_days': p.trial_days,
        'min_months': p.min_months,
    } for p in PricingPlan.objects.filter(status='active')]
    
    return Response({'subscriptions': data, 'clients': clients, 'plans': plans})


@api_view(['GET', 'POST', 'DELETE'])
@permission_classes([IsAdminUser])
def admin_invoices(request):
    """
    API for Generating and Managing Multi-Item Invoices
    """
    if request.method == 'POST':
        action = request.data.get('action')
        
        if action == 'mark_paid':
            invoice = Invoice.objects.get(id=request.data.get('id'))
            payment_method = request.data.get('payment_method', 'کارت / حواله بانکی')
            
            if invoice.status != 'paid':
                # Handle wallet deduction
                if payment_method == 'کیف پول':
                    wallet, _ = Wallet.objects.get_or_create(client=invoice.client)
                    if wallet.balance < invoice.total_amount:
                        return Response({'error': 'موجودی کیف پول برای پرداخت این فاکتور کافی نیست.'}, status=400)
                    wallet.balance -= invoice.total_amount
                    wallet.save()
                    WalletTransaction.objects.create(wallet=wallet, transaction_type='withdrawal', amount=invoice.total_amount, description=f'کسر بابت فاکتور {invoice.invoice_number}')
                
                # Handle wallet recharge
                elif invoice.invoice_type == 'wallet_recharge':
                    wallet, _ = Wallet.objects.get_or_create(client=invoice.client)
                    wallet.balance += invoice.total_amount
                    wallet.save()
                    WalletTransaction.objects.create(wallet=wallet, transaction_type='deposit', amount=invoice.total_amount, description=f'شارژ حساب با فاکتور {invoice.invoice_number}')
                    
                invoice.status = 'paid'
                invoice.save()
                Payment.objects.create(
                    invoice=invoice,
                    amount=invoice.total_amount,
                    payment_method=payment_method,
                    reference_id='ADMIN_APPROVE'
                )
                return Response({'message': f'فاکتور {invoice.invoice_number} با موفقیت پرداخت شد.'})
            return Response({'message': 'این فاکتور قبلاً پرداخت شده است.'})
            
        if action == 'cancel':
            invoice = Invoice.objects.get(id=request.data.get('id'))
            invoice.status = 'cancelled'
            invoice.save()
            return Response({'message': 'فاکتور لغو گردید.'})

        client_id = request.data.get('client_id')
        sub_id = request.data.get('subscription_id')
        tax_amount = int(request.data.get('tax_amount', 0))
        due_date = request.data.get('due_date')
        invoice_type = request.data.get('invoice_type', 'custom')
        description = request.data.get('description', '')
        items = request.data.get('items', [])
        discount_amount = int(request.data.get('discount_amount', 0))
        
        if not items:
            return Response({'error': 'فاکتور باید حداقل دارای یک ردیف کالا/خدمات باشد.'}, status=400)
            
        # Calculate totals from items
        amount = sum(int(item.get('unit_price', 0)) * int(item.get('quantity', 1)) for item in items)
        
        import uuid
        invoice_number = f"INV-{uuid.uuid4().hex[:8].upper()}"

        invoice = Invoice.objects.create(
            client_id=client_id,
            subscription_id=sub_id if sub_id else None,
            invoice_type=invoice_type,
            description=description,
            invoice_number=invoice_number,
            amount=amount,
            discount_amount=discount_amount,
            tax_amount=tax_amount,
            total_amount=max(0, amount - discount_amount + tax_amount),
            due_date=due_date
        )
        
        # Create items
        for item in items:
            InvoiceItem.objects.create(
                invoice=invoice,
                title=item.get('title'),
                quantity=int(item.get('quantity', 1)),
                unit_price=int(item.get('unit_price', 0))
            )
            
        return Response({'message': f'فاکتور چند ردیفه {invoice_number} صادر شد.'})

    if request.method == 'DELETE':
        Invoice.objects.filter(id=request.data.get('id')).delete()
        return Response({'message': 'فاکتور و تمامی آیتم‌های آن حذف شد.'})

    invoices = Invoice.objects.select_related('client', 'subscription').prefetch_related('items').all().order_by('-created_at')
    data = [{
        'id': i.id,
        'client_name': i.client.name,
        'invoice_number': i.invoice_number,
        'invoice_type': i.invoice_type,
        'description': i.description,
        'amount': i.amount,
        'discount_amount': getattr(i, 'discount_amount', 0),
        'tax_amount': i.tax_amount,
        'total_amount': i.total_amount,
        'status': i.status,
        'due_date': i.due_date.strftime('%Y-%m-%d'),
        'created_at': i.created_at.strftime('%Y/%m/%d - %H:%M'),
        'subscription_desc': f"بابت {i.subscription.plan.name}" if i.subscription and i.subscription.plan else (i.description if i.description else 'خدمات متفرقه'),
        'items': [{
            'title': item.title,
            'quantity': item.quantity,
            'unit_price': item.unit_price,
            'total_price': item.total_price
        } for item in i.items.all()]
    } for i in invoices]
    
    clients = [{'id': c.id, 'name': c.name} for c in ClientOrganization.objects.all()]
    subs = [{'id': s.id, 'label': f"{s.client.name} - {s.plan.name if s.plan else 'بدون پلن'}"} for s in ClientSubscription.objects.select_related('client', 'plan').filter(status='active')]

    return Response({'invoices': data, 'clients': clients, 'subscriptions': subs})