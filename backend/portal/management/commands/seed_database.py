import os

from django.core.management.base import BaseCommand
from django.core.management.base import CommandError
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import date, timedelta

class Command(BaseCommand):
    help = 'بارگذاری داده‌های اولیه و استاندارد دیتابیس ANPK Enterprise'

    def handle(self, *args, **options):
        User = get_user_model()
        self.stdout.write('در حال مقداردهی اولیه داده‌های استاندارد دیتابیس...')

        # 1. Superuser
        admin_password = os.getenv('ANPK_SEED_ADMIN_PASSWORD')
        if not admin_password:
            raise CommandError('برای seed کردن ادمین، ANPK_SEED_ADMIN_PASSWORD را تنظیم کنید.')
        admin_user, _ = User.objects.get_or_create(username='admin')
        admin_user.set_password(admin_password)
        admin_user.email = 'admin@anpk.ir'
        admin_user.is_staff = True
        admin_user.is_superuser = True
        admin_user.is_active = True
        admin_user.first_name = 'مدیر ارشد'
        admin_user.last_name = 'سیستم'
        admin_user.save()

        # 2. Core Company Info & Hero
        from core.models import CompanyInfo, HeroSection, HeroTypewriterItem
        company, _ = CompanyInfo.objects.get_or_create(
            id=1,
            defaults={
                'name': 'شرکت ارشیا نگین پردازش کویر (ANPK)',
                'tagline': 'طراح و مجری سامانه‌های اختصاصی، مایکروپروسس و پلتفرم‌های کلود سازمانی',
                'phone': '03534200000',
                'email': 'info@anpk.ir',
                'address': 'ایران، استان یزد، پارک علم و فناوری / مجتمع فناوری'
            }
        )

        hero, _ = HeroSection.objects.get_or_create(
            id=1,
            defaults={
                'badge_text': 'پیشرو در معماری سامانه‌های سلامت و کلود',
                'main_title_static': 'معماری و استقرار سامانه‌های سازمانی،',
                'sub_description': 'شرکت ارشیا نگین پردازش کویر مجری سامانه‌های یکپارچه، پلتفرم‌های تله‌مدیسین، CMMS بیمارستانی و هوش مصنوعی اسناد برای دانشگاه‌ها و مراکز بزرگ کشور.',
                'primary_button_text': 'سفارش سامانه (فرم ۴ مرحله‌ای)',
                'secondary_button_text': 'کاتالوگ محصولات',
                'is_active': True
            }
        )
        typewriter_texts = [
            ('پلتفرم‌های وبینار و آموزش WebRTC', 'gradient-text-primary', 1),
            ('سامانه‌های CMMS پایش موتورخانه بیمارستان', 'gradient-text-accent', 2),
            ('پردازش اسناد بالینی با هوش مصنوعی و OCR', 'gradient-text-primary', 3),
        ]
        for txt, color, order in typewriter_texts:
            HeroTypewriterItem.objects.get_or_create(hero=hero, text=txt, defaults={'color_class': color, 'order': order})

        # 3. Catalog Products & Solutions
        from catalog.models import ProductCategory, Product, ProductFeature, Solution, SolutionBenefit
        pcat1, _ = ProductCategory.objects.get_or_create(slug='webrtc-lms', defaults={'name': 'ارتباطات بلادرنگ & WebRTC', 'icon_name': 'Video', 'order': 1})
        pcat2, _ = ProductCategory.objects.get_or_create(slug='cmms-iot', defaults={'name': 'نگهداشت تأسیسات & IoT', 'icon_name': 'Activity', 'order': 2})
        pcat3, _ = ProductCategory.objects.get_or_create(slug='enterprise-links', defaults={'name': 'مدیریت پیوندها & کلود', 'icon_name': 'Link', 'order': 3})

        p1, _ = Product.objects.get_or_create(
            slug='aira',
            defaults={
                'name': 'پلتفرم کلاس‌های آنلاین و وبینار آیرا (Aira)',
                'category': pcat1,
                'short_description': 'پلتفرم بومی برگزاری کلاس، وبینار و جلسات ویدئوکنفرانس بر پایه پروتکل‌های فوق‌سریع WebRTC با رمزنگاری End-to-End.',
                'full_description': 'پلتفرم آیرا با سرورهای اختصاصی SFU/MCU امکان برگزاری همزمان صدها جلسه با کیفیت HD و تاخیر زیر ۲۰۰ میلی‌ثانیه را فراهم می‌کند.',
                'status': 'عملیاتی / آماده استقرار',
                'demo_url': 'https://aira.anpk.ir',
                'features_list': "کیفیت تصویر Full HD تطبیق‌پذیر (Simulcast)\nتخته وایت‌برد تعاملی چندکاربره\nضبط ابری جلسات با فرمت MP4\nرمزنگاری سرتاسری و احراز هویت SSO",
                'technical_specs': "بک‌اند: Golang & Python FastEngine\nپروتکل: WebRTC / SFU Node\nدیتابیس: Redis Cluster & PostgreSQL\nپایداری: ۹۹.۹٪ با مانیتورینگ آنلاین",
                'is_featured': True,
                'order': 1
            }
        )
        ProductFeature.objects.get_or_create(product=p1, title='تخته هوشمند و تعاملی', defaults={'description': 'امکان رسم اشکال، اشتراک PDF و ابزارهای آموزشی'})
        ProductFeature.objects.get_or_create(product=p1, title='اشتراک‌گذاری همزمان صفحه', defaults={'description': 'اشتراک دسکتاپ و تب‌های مرورگر با صدای استریو'})

        p2, _ = Product.objects.get_or_create(
            slug='tasisat-negar',
            defaults={
                'name': 'سامانه جامع CMMS تأسیسات نگار',
                'category': pcat2,
                'short_description': 'سامانه هوشمند پایش و نگهداشت پیشگیرانه (PM) موتورخانه، چیلرها و تجهیزات حساس بیمارستانی با سنسورهای IoT.',
                'full_description': 'تأسیسات نگار فرایند صدور دستور کارهای اضطراری، کنترل دوره‌های کالیبراسیون و انبارداری قطعات یدکی را مکانیزه می‌کند.',
                'status': 'عملیاتی / فعال در بیمارستان‌ها',
                'features_list': "پایش بلادرنگ سنسورهای Modbus IoT\nصدور اتوماتیک Work Order و هشدار SMS\nمدیریت انبار قطعات یدکی و MTTR/MTBF\nداشبوردهای هوش تجاری و گزارش‌های BI",
                'is_featured': True,
                'order': 2
            }
        )

        p3, _ = Product.objects.get_or_create(
            slug='nikilink',
            defaults={
                'name': 'سامانه پیوند و کوتاه‌کننده لینک نیکی لینک',
                'category': pcat3,
                'short_description': 'پلتفرم امن مدیریت، آنالیز و کوتاه‌سازی لینک‌های سازمانی با گزارش‌گیری پیشرفته جغرافیایی و کلیک‌ها.',
                'status': 'عملیاتی',
                'features_list': "گزارش پیشرفته کلیک‌ها و منبع ورودی\nدامنه اختصاصی سازمانی\nتولید هوشمند QR Code\nامنیت ضد فیشینگ و اسکن لینک",
                'is_featured': True,
                'order': 3
            }
        )

        # Solutions
        sol1, _ = Solution.objects.get_or_create(
            slug='digital-health-fhir',
            defaults={
                'title': 'یکپارچه‌سازی سامانه‌های سلامت با استاندارد بین‌المللی HL7 FHIR',
                'subtitle': 'پایداری ۹۹.۹٪ و تبادل امن پرونده سلامت',
                'description': 'تبادل داده‌های بالینی میان HIS، LIS، PACS و سامانه‌های نوبت‌دهی با بالاترین استانداردهای امنیتی و استانداردهای وزارت بهداشت.',
                'target_industries': "دانشگاه‌های علوم پزشکی\nبیمارستان‌های دولتی و خصوصی\nکلینیک‌ها و مراکز جراحی محدود",
                'key_benefits': "کاهش خطاهای ثبت پرونده پزشکی\nتبادل زیرثانیه‌ای اطلاعات بالینی\nانطباق ۱۰۰٪ با استاندارد HL7 FHIR\nمانیتورینگ و لاگ امنیتی تراکنش‌ها",
                'is_featured': True,
                'order': 1
            }
        )
        SolutionBenefit.objects.get_or_create(solution=sol1, title='کاهش زمان ترخیص بیمار', defaults={'metric_value': '۴۵٪', 'description': 'تسریع ارسال اسناد به بیمه‌ها'})
        SolutionBenefit.objects.get_or_create(solution=sol1, title='پایداری انتقال اطلاعات', defaults={'metric_value': '۹۹.۹٪', 'description': 'استفاده از معماری پیام‌رسان توزیع‌شده'})

        # 4. Pricing Plans & Subscriptions
        from accounts.models import Organization as ClientOrganization
        from billing.models import Invoice, InvoiceItem, Payment, Wallet, WalletTransaction
        from subscriptions.models import ClientSubscription, PricingPlan
        from support.models import SLASupportContract, SupportTicket, TicketReply
        
        plan_basic, _ = PricingPlan.objects.get_or_create(
            name='پلن پایه استارتاپی (Basic)',
            defaults={
                'description': 'مناسب برای کلینیک‌ها و تیم‌های کوچک',
                'monthly_price': 5000000,
                'yearly_price': 50000000,
                'server_cost': 1500000,
                'support_cost': 3500000,
                'trial_days': 7,
                'min_months': 1,
                'features_list': "دسترسی کامل به پورتال\nپشتیبانی تیکتی ۵ روز در هفته\nبکاپ‌گیری هفتگی ابری\nتا ۵ کاربر همزمان",
                'is_active': True
            }
        )

        plan_pro, _ = PricingPlan.objects.get_or_create(
            name='پلن حرفه‌ای سازمانی (Pro)',
            defaults={
                'description': 'مناسب برای بیمارستان‌ها و شرکت‌های متوسط',
                'monthly_price': 15000000,
                'yearly_price': 150000000,
                'server_cost': 4500000,
                'support_cost': 10500000,
                'trial_days': 14,
                'min_months': 3,
                'features_list': "پشتیبانی طلایی SLA ۲۴/۷\nبکاپ‌گیری روزانه خودکار\nاتصال به درگاه پیامک و AI\nکاربران نامحدود",
                'is_active': True
            }
        )

        plan_ent, _ = PricingPlan.objects.get_or_create(
            name='پلن جامع سازمانی (Enterprise)',
            defaults={
                'description': 'استقرار اختصاصی بر روی زیرساخت و دیتاسنتر کارفرما',
                'monthly_price': 35000000,
                'yearly_price': 350000000,
                'server_cost': 10000000,
                'support_cost': 25000000,
                'trial_days': 30,
                'min_months': 6,
                'features_list': "استقرار On-Premise اختصاصی\nتیم پشتیبانی و کارشناس آنکال اختصاصی\nسفارشی‌سازی کامل سورس‌کد\nگارانتی آپ‌تایم ۹۹.۹۵٪ با خسارت تاخیر",
                'is_active': True
            }
        )

        # 5. Client Organizations & Financial Accounts
        client_user, _ = User.objects.get_or_create(username='09131518904', defaults={'first_name': 'مهندس', 'last_name': 'دهقان', 'email': 'client@anpk.ir'})
        client_user.set_password('Client123!@#')
        client_user.save()

        client_org, _ = ClientOrganization.objects.get_or_create(
            phone='09131518904',
            defaults={
                'name': 'بیمارستان تخصصی و فوق‌تخصصی ولایت',
                'contact_person': 'دکتر رضایی (رئیس انفورماتیک)',
                'email': 'velayat@hospital.ac.ir',
                'address': 'یزد، بلوار دانشگاه، مجتمع درمانی ولایت',
                'national_code': '14008923011',
                'tags': 'بیمارستانی, CMMS, قرارداد طلایی',
                'portal_access': True
            }
        )
        from accounts.services import ensure_owner_membership
        ensure_owner_membership(client_org, client_org.phone, client_org.contact_person, client_user)

        wallet, _ = Wallet.objects.get_or_create(client=client_org, defaults={'balance': 45000000})
        WalletTransaction.objects.get_or_create(
            wallet=wallet,
            amount=50000000,
            defaults={'transaction_type': 'deposit', 'description': 'شارژ اعتباری اولیه حساب سازمانی'}
        )

        sla_contract, _ = SLASupportContract.objects.get_or_create(
            client=client_org,
            defaults={
                'plan_name': 'پشتیبانی طلایی SLA ۲۴/۷',
                'start_date': date.today(),
                'duration_months': 12,
                'is_active': True
            }
        )

        sub1, _ = ClientSubscription.objects.get_or_create(
            client=client_org,
            plan=plan_pro,
            defaults={
                'status': 'active',
                'start_date': date.today(),
                'end_date': date.today() + timedelta(days=365),
                'auto_renew': True
            }
        )

        inv1, _ = Invoice.objects.get_or_create(
            invoice_number='INV-ANPK-140401',
            defaults={
                'client': client_org,
                'subscription': sub1,
                'invoice_type': 'subscription',
                'description': 'اشتراک سالانه پلن حرفه‌ای سامانه CMMS',
                'amount': 150000000,
                'discount_amount': 15000000,
                'tax_amount': 13500000,
                'total_amount': 148500000,
                'status': 'paid',
                'due_date': date.today() + timedelta(days=30)
            }
        )
        InvoiceItem.objects.get_or_create(invoice=inv1, title='اشتراک سالانه سامانه تأسیسات نگار', defaults={'quantity': 1, 'unit_price': 150000000})
        Payment.objects.get_or_create(invoice=inv1, defaults={'amount': 148500000, 'payment_method': 'حواله بانکی پایا', 'reference_id': 'PAY-TRX-9823011'})

        # Support Tickets
        t1, _ = SupportTicket.objects.get_or_create(
            client=client_org,
            subject='درخواست اتصال سنسورهای دمای سردخانه به داشبورد CMMS',
            defaults={'client_name': 'دکتر رضایی', 'message': 'با سلام، ۴ سنسور Modbus جدید در بخش سردخانه دارویی نصب شده، لطفاً آی‌پی آن‌ها را در سامانه تعریف فرمایید.', 'status': 'open'}
        )
        TicketReply.objects.get_or_create(ticket=t1, sender_name='تیم پشتیبانی ANPK', defaults={'is_admin': True, 'message': 'سلام و احترام، کانفیگ نود با موفقیت انجام شد و داده‌ها در داشبورد قابل مشاهده است.'})

        # 6. Projects & Sprints
        from projects.models import ProjectCategory, Technology, PublicPortfolioProject, ClientContractProject, ProjectPhase
        pcat_ent, _ = ProjectCategory.objects.get_or_create(slug='hospital-systems', defaults={'name': 'سامانه‌های بیمارستانی'})
        tech_py, _ = Technology.objects.get_or_create(name='Django & Python', defaults={'category': 'بک‌اند'})
        tech_react, _ = Technology.objects.get_or_create(name='Next.js & React', defaults={'category': 'فرانت‌اند'})
        tech_iot, _ = Technology.objects.get_or_create(name='Modbus RTU / IoT', defaults={'category': 'اینترنت اشیاء'})

        pub_proj1, _ = PublicPortfolioProject.objects.get_or_create(
            slug='cmms-velayat-hospital',
            defaults={
                'title': 'سامانه CMMS و مانیتورینگ آنلاین تأسیسات بیمارستان ولایت',
                'category': pcat_ent,
                'client_name_display': 'بیمارستان فوق‌تخصصی ولایت',
                'summary': 'پیاده‌سازی مانیتورینگ آنلاین موتورخانه، چیلرها و ژنراتورهای اضطراری با کاهش ۴۰٪ هزینه‌های تعمیرات اتفاقی.',
                'full_description': 'در این پروژه بیش از ۱۲۰ سنسور صنعتی به نودهای پردازشی متصل گردیده و داشبورد زنده پایش تأسیسات مستقر شد.',
                'sprint_progress': 100,
                'is_featured': True
            }
        )
        pub_proj1.technologies.set([tech_py, tech_react, tech_iot])

        contract_proj, _ = ClientContractProject.objects.get_or_create(
            slug='velayat-cmms-contract',
            defaults={
                'client': client_org,
                'title': 'پروژه استقرار و مانیتورینگ تأسیسات بیمارستان ولایت',
                'contract_number': 'ANPK-CNT-1404-001',
                'contract_date': date.today() - timedelta(days=60),
                'contract_value': 185000000,
                'sprint_progress': 85,
                'active_phase_title': 'فاز ۳: تست‌های نهایی و آموزش پرسنل',
                'is_active': True
            }
        )
        ProjectPhase.objects.get_or_create(project=contract_proj, phase_number=1, defaults={'title': 'فاز ۱: نیازسنجی، خرید سنسورها و طراحی معماری', 'progress_percentage': 100, 'status': 'COMPLETED'})
        ProjectPhase.objects.get_or_create(project=contract_proj, phase_number=2, defaults={'title': 'فاز ۲: پیاده‌سازی بک‌اند و استقرار نودهای محلی', 'progress_percentage': 100, 'status': 'COMPLETED'})
        ProjectPhase.objects.get_or_create(project=contract_proj, phase_number=3, defaults={'title': 'فاز ۳: اتصال به هشدار SMS و تحویل گارانتی SLA', 'progress_percentage': 60, 'status': 'IN_PROGRESS'})

        sub1.project = contract_proj
        sub1.save(update_fields=['project'])
        sla_contract.project = contract_proj
        sla_contract.subscription = sub1
        sla_contract.save(update_fields=['project', 'subscription'])
        inv1.project = contract_proj
        inv1.save(update_fields=['project'])
        t1.project = contract_proj
        t1.save(update_fields=['project'])

        # 7. Blog Articles & Comments
        from blog.models import ArticleCategory, ArticleTag, Article, ArticleComment
        bcat1, _ = ArticleCategory.objects.get_or_create(slug='digital-health', defaults={'name': 'سلامت دیجیتال & FHIR'})
        bcat2, _ = ArticleCategory.objects.get_or_create(slug='cmms', defaults={'name': 'نگهداشت تأسیسات & CMMS'})
        tag1, _ = ArticleTag.objects.get_or_create(slug='hl7-fhir', defaults={'name': 'HL7 FHIR'})
        tag2, _ = ArticleTag.objects.get_or_create(slug='cmms-tag', defaults={'name': 'CMMS'})

        art1, _ = Article.objects.get_or_create(
            slug='hl7-fhir-architecture',
            defaults={
                'title': 'معماری پلتفرم‌های سلامت دیجیتال و استاندارد HL7 FHIR',
                'category': bcat1,
                'author': 'تیم مهندسی ANPK',
                'summary': 'بررسی نحوه تبادل امن داده‌های بالینی و پرونده الکترونیک سلامت بیمارستانی بر اساس آخرین پروتکل‌های HL7 FHIR با پایداری ۹۹.۹٪.',
                'content': 'در عصر سلامت دیجیتال، پروتکل HL7 FHIR تبادل زیرثانیه‌ای اطلاعات سلامت بیمار را میسر می‌سازد.',
                'read_time': '۶ دقیقه',
                'status': 'PUBLISHED',
                'is_featured': True,
                'views_count': 620
            }
        )
        art1.tags.set([tag1])

        ArticleComment.objects.get_or_create(
            article=art1,
            name='مهندس سلطانی',
            email='soltani@med.ir',
            defaults={'content': 'بسیار تحلیل دقیق و کاربردی بود. آیا امکان یکپارچه‌سازی با HISهای بومی وجود دارد؟', 'status': 'APPROVED'}
        )

        # 8. CRM Leads & Activity
        from leads.models import ProjectLead, LeadActivityLog
        lead1, _ = ProjectLead.objects.get_or_create(
            phone='09132223344',
            defaults={
                'company_name': 'مرکز بهداشت و درمان شهدای محراب',
                'contact_person': 'خانم دکتر اسماعیلی',
                'email': 'esmaeili@shohada.ir',
                'service_type': 'سامانه کلاس مجازی و آموزش سلامت',
                'budget_range': '۸۰ تا ۱۲۰ میلیون تومان',
                'timeline': '۲ ماه آینده',
                'status': 'contacted',
                'priority': 'hot',
                'source': 'وب‌سایت - فرم ۴ مرحله‌ای'
            }
        )
        LeadActivityLog.objects.get_or_create(lead=lead1, description='تماس تلفنی اولیه برقرار و کاتالوگ پلتفرم آیرا ارسال شد.')

        # 9. Services Nodes & Logs
        from services.models import OpenRouterConfig, SMSGatewayConfig, AILog, SystemNodeStatus
        OpenRouterConfig.objects.get_or_create(id=1, defaults={'default_model': 'google/gemini-2.5-flash', 'wallet_rate_per_query': 240, 'is_active': True})
        SMSGatewayConfig.objects.get_or_create(id=1, defaults={'sender_line': '3000777', 'is_active': True})
        SystemNodeStatus.objects.get_or_create(name='پلتفرم وبینار آیرا (SFU Node)', defaults={'status_label': 'آنلاین (۹۹.۹٪)', 'uptime_percentage': '۹۹.۹٪', 'latency_ms': 15, 'is_active': True})
        SystemNodeStatus.objects.get_or_create(name='سرور پایگاه داده CMMS تأسیسات نگار', defaults={'status_label': 'آنلاین (۱۰۰٪)', 'uptime_percentage': '۱۰۰٪', 'latency_ms': 22, 'is_active': True})
        SystemNodeStatus.objects.get_or_create(name='موتور OCR و پردازش هوش مصنوعی', defaults={'status_label': 'عملیاتی (۹۹.۸٪)', 'uptime_percentage': '۹۹.۸٪', 'latency_ms': 180, 'is_active': True})

        self.stdout.write(self.style.SUCCESS('تمامی داده‌های استاندارد دیتابیس با موفقیت ثبت و مقداردهی اولیه شدند!'))
