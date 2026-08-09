from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import ContactMessage

@api_view(['GET', 'POST'])
def contact_messages(request):
    if request.method == 'GET':
        msgs = ContactMessage.objects.all().order_by('-created_at')
        if not msgs.exists():
            ContactMessage.objects.create(name='مهندس ابراهیمی', phone='09139998877', subject='درخواست جلسه مشاوره اختصاصی', message='با سلام، جهت دریافت تایم جلسه در خصوص CMMS تماس بگیرید.')
            msgs = ContactMessage.objects.all().order_by('-created_at')

        data = [{
            'id': m.id,
            'name': m.name,
            'phone': m.phone,
            'subject': m.subject,
            'message': m.message,
            'date': m.created_at.strftime('%Y/%m/%d')
        } for m in msgs]
        return Response(data)

    elif request.method == 'POST':
        name = request.data.get('name')
        phone = request.data.get('phone')
        subject = request.data.get('subject', 'تماس عمومی')
        message = request.data.get('message', '')

        if not name or not phone:
            return Response({'error': 'نام و شماره تماس الزامی است.'}, status=status.HTTP_400_BAD_REQUEST)

        msg = ContactMessage.objects.create(name=name, phone=phone, subject=subject, message=message)
        return Response({'message': 'پیام شما ثبت گردید.', 'id': msg.id}, status=status.HTTP_201_CREATED)
