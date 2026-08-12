import os
import uuid
from django.conf import settings
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response


ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
ALLOWED_VIDEO_EXTENSIONS = ['.mp4', '.webm', '.ogg', '.mov']
MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10MB
MAX_VIDEO_SIZE = 50 * 1024 * 1024  # 50MB


@api_view(['POST'])
@permission_classes([IsAdminUser])
def admin_file_upload(request):
    """
    Handle file uploads for admin panel
    Accepts image and video files, returns the URL
    """
    if 'file' not in request.FILES:
        return Response({'error': 'فایلی ارسال نشده است.'}, status=400)

    file = request.FILES['file']
    upload_type = request.data.get('type', 'image')

    # Get file extension
    ext = os.path.splitext(file.name)[1].lower()

    # Validate file type
    if upload_type == 'image' and ext not in ALLOWED_IMAGE_EXTENSIONS:
        return Response({'error': f'فرمت فایل مجاز نیست. فرمت‌های مجاز: {", ".join(ALLOWED_IMAGE_EXTENSIONS)}'}, status=400)
    
    if upload_type == 'video' and ext not in ALLOWED_VIDEO_EXTENSIONS:
        return Response({'error': f'فرمت فایل مجاز نیست. فرمت‌های مجاز: {", ".join(ALLOWED_VIDEO_EXTENSIONS)}'}, status=400)

    # Validate file size
    if upload_type == 'image' and file.size > MAX_IMAGE_SIZE:
        return Response({'error': 'حداکثر حجم تصویر ۱۰ مگابایت است.'}, status=400)
    
    if upload_type == 'video' and file.size > MAX_VIDEO_SIZE:
        return Response({'error': 'حداکثر حجم ویدیو ۵۰ مگابایت است.'}, status=400)

    # Generate unique filename
    filename = f"{uuid.uuid4().hex}{ext}"
    
    # Determine upload path
    if upload_type == 'image':
        upload_path = f"uploads/images/{filename}"
    else:
        upload_path = f"uploads/videos/{filename}"

    # Save file
    try:
        saved_path = default_storage.save(upload_path, ContentFile(file.read()))
        file_url = f"{settings.MEDIA_URL}{saved_path}"
        return Response({'url': file_url, 'filename': filename})
    except Exception as e:
        return Response({'error': f'خطا در ذخیره فایل: {str(e)}'}, status=500)
