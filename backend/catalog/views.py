from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import ProductCategory, Product, Solution

def split_lines(text):
    if not text:
        return []
    return [line.strip() for line in text.split('\n') if line.strip()]

@api_view(['GET'])
def products_list(request):
    products = Product.objects.filter(is_featured=True).order_by('order', 'id')
    
    # Auto-seed sample products if database table is empty
    if not products.exists():
        cat_ai, _ = ProductCategory.objects.get_or_create(name='هوش مصنوعی & پردازش اسناد', slug='ai-ocr', icon_name='Bot')
        cat_cmms, _ = ProductCategory.objects.get_or_create(name='نگهداشت تاسیسات & CMMS', slug='cmms-facility', icon_name='Activity')
        cat_webrtc, _ = ProductCategory.objects.get_or_create(name='ارتباطات تصویری & WebRTC', slug='webrtc-media', icon_name='Video')

        p1 = Product.objects.create(
            name='موتور بینایی ماشین & OCR هوشمند اسناد ANPK Vision',
            slug='anpk-vision-ocr',
            category=cat_ai,
            short_description='استخراج خودکار فیلدهای ساختاریافته از اسناد پزشکی، قبوض موتورخانه و داده‌های بالینی بیمارستانی با دقت ۹۹.۸٪.',
            full_description='سامانه پیشرفته پردازش تصویر و بینایی ماشین مبتنی بر شبکه‌های کانولوشنی عمیق جهت خوانش و استخراج متون دست‌نویس و چاپی.',
            icon_name='Bot',
            status='دمو فعال / آماده استقرار',
            demo_url='/portal',
            features_list="خواندن آنلاین خطوط دست‌نویس و چاپی با دقت ۹۹.۸٪\nاستخراج خودکار فیلدهای HL7 و پرونده الکترونیک سلامت\nاتصال آنی به کیف پول سازمان با کسر تعرفه ۲۴۰ تومان بر کوئری\nماژول پردازش بچ در دسته‌های ۱۰۰۰ تایی اسناد",
            technical_specs="معماری پایتون 3.12 & OpenCV & PyTorch\nسرعت پردازش زیرثانیه‌ای (۲۱۰ms)\nپشتیبانی از فرمت‌های PNG, JPG, PDF و TIFF\nرابط REST API استاندارد جهت یکپارچه‌سازی با نرم‌افزارهای موجود",
            is_featured=True,
            order=1
        )

        p2 = Product.objects.create(
            name='سامانه مدیریت هوشمند نگهداشت تأسیسات CMMS نگار',
            slug='cmms-facility-negar',
            category=cat_cmms,
            short_description='مانیتورینگ آنلاین ژنراتورها، چیلرها، هواسازها و کالیبراسیون تجهیزات حساس با هشدار آنی SMS.',
            full_description='پلتفرم کامل مدیریت دستور کارها، نگهداشت پیشگیرانه (PM)، کنترل قطعات یدکی انبار و ثبت کارکرد ماشین‌آلات صنعتی.',
            icon_name='Activity',
            status='آماده تحویل سازمانی',
            demo_url='/portal',
            features_list="ثبت خودکار دستور کارهای کارخانجات و بیمارستان‌ها\nهشدار آنی پیامکی SMS هنگام بروز اختلال حرارتی یا فشار\nسیستم گزارش‌گیری آنلاین کارکرد تکنسین‌ها و زمان رفع خرابی\nتحلیل هوشمند شاخص‌های MTTR و MTBF",
            technical_specs="بک‌اند قدرتمند Django REST Framework & PostgreSQL\nفرانت‌اند واکنش‌گرا Next.js 14 & Tailwind\nارتباط امن SSL/TLS با سرورهای اختصاصی سازمان\nزیرساخت گزارش‌گیری پویای Excel و PDF",
            is_featured=True,
            order=2
        )

        p3 = Product.objects.create(
            name='پلتفرم ارتباط تصویری و برگزاری وبینار آیرا (Aira WebRTC)',
            slug='aira-webrtc-platform',
            category=cat_webrtc,
            short_description='برگزاری وبینارها، کلاس‌های آنلاین و جلسات هیئت‌مدیره با کیفیت HD و استریم کم‌تاخیر بومی.',
            full_description='سامانه اختصاصی استریمینگ تصویری مبتنی بر WebRTC بدون نیاز به نصب هیچ‌گونه نرم‌افزار یا پلاگین جانبی در مرورگر.',
            icon_name='Video',
            status='دمو فعال',
            demo_url='/portal',
            features_list="برگزاری هم‌زمان جلسات چندکاربره با کیفیت Full HD\nقابلیت تخته سیاه هوشمند، اشتراک‌گذاری دسکتاپ و ضبط جلسات\nسیستم نظرسنجی و حضور و غیاب آنلاین کاربران\nکاهش تاخیر ارتباط تا زیر ۱۵ میلی‌ثانیه",
            technical_specs="پروتکل کم‌تاخیر WebRTC & SFU Media Server\nسازگاری ۱۰۰٪ با تمامی مرورگرهای موبایل و دسکتاپ\nامکان نصب بر روی سرورهای داخلی سازمان (On-Premises)\nکدگذاری پیشرفته H.264 و VP9",
            is_featured=True,
            order=3
        )

        products = Product.objects.filter(is_featured=True).order_by('order', 'id')

    data = [{
        'id': p.id,
        'name': p.name,
        'slug': p.slug,
        'category': p.category.name if p.category else 'پلتفرم سازمانی',
        'category_slug': p.category.slug if p.category else 'general',
        'short_description': p.short_description,
        'full_description': p.full_description,
        'icon_name': p.icon_name,
        'image_url': p.image_url,
        'status': p.status,
        'demo_url': p.demo_url,
        'catalog_pdf_url': p.catalog_pdf_url,
        'features': split_lines(p.features_list) + [f.title for f in p.features.all()],
        'technical_specs': split_lines(p.technical_specs)
    } for p in products]

    return Response(data)


@api_view(['GET'])
def product_detail(request, slug):
    try:
        p = Product.objects.get(slug=slug)
        data = {
            'id': p.id,
            'name': p.name,
            'slug': p.slug,
            'category': p.category.name if p.category else 'پلتفرم سازمانی',
            'short_description': p.short_description,
            'full_description': p.full_description,
            'icon_name': p.icon_name,
            'image_url': p.image_url,
            'status': p.status,
            'demo_url': p.demo_url,
            'catalog_pdf_url': p.catalog_pdf_url,
            'features': split_lines(p.features_list) + [f.title for f in p.features.all()],
            'technical_specs': split_lines(p.technical_specs)
        }
        return Response(data)
    except Product.DoesNotExist:
        return Response({'error': 'محصول مورد نظر یافت نشد.'}, status=404)


@api_view(['GET'])
def solutions_list(request):
    solutions = Solution.objects.filter(is_featured=True).order_by('order', 'id')

    # Auto-seed sample solutions if database table is empty
    if not solutions.exists():
        s1 = Solution.objects.create(
            title='راهکار هوشمندسازی و نگهداشت تأسیسات بیمارستانی و مراکز درمانی',
            slug='hospital-facility-cmms-solution',
            subtitle='کاهش ۳۵٪ هزینه‌های تعمیرات و پایدارسازی ۹۹.۹٪ تجهیزات پزشکی',
            description='ارائه زیرساخت جامع پایش آنلاین چیلرها، ژنراتورها، کالیبراسیون تجهیزات پزشکی و مدیریت کشیک‌های تأسیساتی بیمارستان‌ها مطابق استانداردهای اعتباربخشی.',
            icon_name='ShieldCheck',
            target_industries="بیمارستان‌های دولتی و خصوصی\nدانشگاه‌های علوم پزشکی کشور\nمراکز جراحی محدود و کلینیک‌های تخصصی",
            key_benefits="کاهش ۳۵٪ توقف‌های ناخواسته ژنراتورها و تجهیزات حیاتی\nارسال آنلاین هشدارهای پیامکی به مسئول تاسیسات هنگام افت فشار یا افزایش دما\nمدیریت متمرکز انبار قطعات یدکی و ثبت کالیبراسیون دوره ای",
            use_cases="استقرار در بیش از ۱۵ مرکز درمانی و بیمارستانی بزرگ کشور\nیکپارچه‌سازی با سامانه‌های پیامکی و پورتال مشتریان",
            architecture_summary="معماری میکروسرویس کلود بومی با دیتابیس پشتیبان PostgreSQL و ماژول هشدارهای فوری SMS",
            demo_url='/portal',
            is_featured=True,
            order=1
        )

        s2 = Solution.objects.create(
            title='راهکار هوش مصنوعی و بینایی ماشین استخراج خودکار اسناد سازمانی',
            slug='ai-document-vision-solution',
            subtitle='پردازش خودکار ۱۰,۰۰۰ سند در ساعت با دقت ۹۹.۸٪',
            description='راهکار جامع خوانش و تبدیل فرم‌ها، اسناد دست‌نویس، کادکس‌های بیمارستانی و قبض‌های موتورخانه به داده‌های ساختاریافته قابل تحلیل در دیتابیس.',
            icon_name='Bot',
            target_industries="مؤسسات مالی و بیمه‌ها\nسازمان‌ها و ادارات دولتی\nبیمارستان‌ها و دانشگاه‌ها",
            key_benefits="حذف ۹۰٪ خطاهای انسانی در ورود دستی اطلاعات اسناد\nپاسخ‌دهی آنلاین زیر ثانیه‌ای (۲۱۰ms) از طریق API اختصاصی\nکسر اتوماتیک هزینه از کیف پول اعتباری سازمان",
            use_cases="دیجیتال‌سازی آرشیو اسناد فیزیکی و ثبت پرونده‌های قدیمی\nخوانش خودکار شماره کنتورها و داده‌های بالینی",
            architecture_summary="مدل‌های اختصاصی عمیق ANPK Vision مبتنی بر PyTorch & REST API قابل اتصال به کلیه سامانه‌ها",
            demo_url='/portal',
            is_featured=True,
            order=2
        )

        solutions = Solution.objects.filter(is_featured=True).order_by('order', 'id')

    data = [{
        'id': s.id,
        'title': s.title,
        'slug': s.slug,
        'subtitle': s.subtitle,
        'description': s.description,
        'icon_name': s.icon_name,
        'image_url': s.image_url,
        'target_industries': split_lines(s.target_industries),
        'key_benefits': split_lines(s.key_benefits) + [b.title for b in s.benefits.all()],
        'use_cases': split_lines(s.use_cases),
        'architecture_summary': s.architecture_summary,
        'demo_url': s.demo_url
    } for s in solutions]

    return Response(data)


@api_view(['GET'])
def solution_detail(request, slug):
    try:
        s = Solution.objects.get(slug=slug)
        data = {
            'id': s.id,
            'title': s.title,
            'slug': s.slug,
            'subtitle': s.subtitle,
            'description': s.description,
            'icon_name': s.icon_name,
            'image_url': s.image_url,
            'target_industries': split_lines(s.target_industries),
            'key_benefits': split_lines(s.key_benefits) + [b.title for b in s.benefits.all()],
            'use_cases': split_lines(s.use_cases),
            'architecture_summary': s.architecture_summary,
            'demo_url': s.demo_url
        }
        return Response(data)
    except Solution.DoesNotExist:
        return Response({'error': 'راهکار تخصصی مورد نظر یافت نشد.'}, status=404)
