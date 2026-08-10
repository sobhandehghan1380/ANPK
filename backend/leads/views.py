from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from .models import ProjectLead, LeadActivityLog

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def project_leads_list(request):
    if request.method == 'GET':
        if not request.user.is_authenticated or not request.user.is_staff:
            return Response({'error': 'دسترسی غیرمجاز.'}, status=status.HTTP_403_FORBIDDEN)

        leads = ProjectLead.objects.prefetch_related('activities').all().order_by('-created_at')

        data = [{
            'id': l.id,
            'ld_id': f"LD-{l.id}",
            'company': l.company_name,
            'contact': f"{l.contact_person} ({l.phone})",
            'contact_person': l.contact_person,
            'phone': l.phone,
            'email': l.email,
            'service': l.service_type,
            'budget': l.budget_range,
            'timeline': l.timeline,
            'priority': l.priority,
            'source': l.source,
            'assigned_to': l.assigned_to,
            'date': l.created_at.strftime('%Y/%m/%d'),
            'status': l.status,
            'activities': [{
                'id': act.id,
                'type': act.activity_type,
                'description': act.description,
                'created_at': act.created_at.strftime('%Y/%m/%d - %H:%M')
            } for act in l.activities.all()]
        } for l in leads]
        return Response(data)

    elif request.method == 'POST':
        action = request.data.get('action')

        if action and (not request.user.is_authenticated or not request.user.is_staff):
            return Response({'error': 'دسترسی غیرمجاز.'}, status=status.HTTP_403_FORBIDDEN)
        
        if action == 'update_status':
            lead_id = request.data.get('lead_id')
            new_status = request.data.get('status')
            try:
                lead = ProjectLead.objects.get(id=lead_id)
                lead.status = new_status
                lead.save()
                return Response({'message': f'وضعیت لید با موفقیت به {new_status} تغییر یافت.'})
            except ProjectLead.DoesNotExist:
                return Response({'error': 'لید یافت نشد.'}, status=400)
                
        if action == 'add_activity':
            lead_id = request.data.get('lead_id')
            activity_type = request.data.get('activity_type', 'note')
            description = request.data.get('description')
            try:
                lead = ProjectLead.objects.get(id=lead_id)
                LeadActivityLog.objects.create(
                    lead=lead,
                    activity_type=activity_type,
                    description=description
                )
                return Response({'message': 'فعالیت با موفقیت ثبت شد.'})
            except ProjectLead.DoesNotExist:
                return Response({'error': 'لید یافت نشد.'}, status=400)
        
        # Default create lead
        company_name = request.data.get('company_name')
        contact_person = request.data.get('contact_person')
        phone = request.data.get('phone')
        service_type = request.data.get('service_type', 'درخواست پروژه سازمانی')
        budget_range = request.data.get('budget_range', 'نامشخص')

        if not company_name or not phone:
            return Response({'error': 'نام سازمان و شماره تماس الزامی است.'}, status=status.HTTP_400_BAD_REQUEST)

        lead = ProjectLead.objects.create(
            company_name=company_name,
            contact_person=contact_person or 'نامشخص',
            phone=phone,
            email=request.data.get('email', ''),
            service_type=service_type,
            budget_range=budget_range,
            timeline=request.data.get('timeline', ''),
            priority=request.data.get('priority', 'warm'),
            source=request.data.get('source', ''),
            assigned_to=request.data.get('assigned_to', ''),
            status='new'
        )

        return Response({'message': 'درخواست پروژه شما با موفقیت در سیستم ثبت گردید.', 'id': f"LD-{lead.id}"}, status=status.HTTP_201_CREATED)

from accounts.models import Organization
from billing.models import Wallet

@api_view(['POST'])
@permission_classes([IsAdminUser])
def convert_lead(request):
    lead_id = request.data.get('lead_id')
    try:
        lead = ProjectLead.objects.get(id=lead_id)
        if lead.status != 'contract':
            lead.status = 'contract'
            lead.save()
            
        # Create client organization
        client, created = Organization.objects.get_or_create(
            phone=lead.phone,
            defaults={
                'name': lead.company_name,
                'contact_person': lead.contact_person,
            }
        )
        
        # Create wallet
        Wallet.objects.get_or_create(client=client, defaults={'balance': 0})

        from accounts.services import ensure_owner_membership
        owner_member = ensure_owner_membership(client, lead.phone, lead.contact_person)
        
        # Log conversion
        LeadActivityLog.objects.create(
            lead=lead,
            activity_type='note',
            description=f"تبدیل لید به مشتری قطعی انجام شد. عضو مالک: {owner_member.full_name if owner_member else 'از قبل موجود'}"
        )
        
        return Response({'message': 'مشتری و کیف پول با موفقیت ساخته شد!', 'client_id': client.id})
        
    except Exception as e:
        return Response({'error': str(e)}, status=400)
