from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .models import HeroSection, HeroTypewriterItem

@api_view(['GET'])
@permission_classes([AllowAny])
def home_overview(request):
    hero = HeroSection.objects.filter(is_active=True).first()
    if not hero:
        hero = HeroSection.objects.create(
            badge_text="پیشرو در توسعه پلتفرم‌های سازمانی",
            main_title_static="معماری سامانه‌های اختصاصی،",
            sub_description="شرکت «ارشیا نگین پردازش کویر» طراح و مجری سامانه‌های مایکروپروسس بومی برای دانشگاه‌ها، بیمارستان‌ها و سازمان‌های بزرگ کشور با پایداری ۹۹.۹٪ و ارائه مستندات کامل فنی."
        )
        HeroTypewriterItem.objects.create(hero=hero, text="هوش مصنوعی و سلامت", color_class="gradient-text-primary", order=1)
        HeroTypewriterItem.objects.create(hero=hero, text="اتوماسیون بیمارستانی", color_class="gradient-text-accent", order=2)
        HeroTypewriterItem.objects.create(hero=hero, text="سامانه‌های چابک سازمانی", color_class="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent", order=3)
        HeroTypewriterItem.objects.create(hero=hero, text="داشبوردهای هوشمند BI", color_class="bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent", order=4)

    typewriter_items = hero.typewriter_items.all()
    dynamic_items = [{'text': item.text, 'colorClass': item.color_class} for item in typewriter_items]

    return Response({
        'badgeText': hero.badge_text,
        'mainTitleStatic': hero.main_title_static,
        'subDescription': hero.sub_description,
        'primaryButtonText': hero.primary_button_text,
        'secondaryButtonText': hero.secondary_button_text,
        'dynamicItems': dynamic_items,
        'company': 'شرکت ارشیا نگین پردازش کویر (ANPK)',
        'uptime': '۹۹.۹٪',
    })
