from django.db import models

class CompanyInfo(models.Model):
    name = models.CharField(max_length=255, default="شرکت ارشیا نگین پردازش کویر")
    tagline = models.CharField(max_length=255, default="طراح و مجری سامانه‌های اختصاصی سازمانی")
    phone = models.CharField(max_length=50, default="03534200000")
    email = models.EmailField(default="info@anpk.ir")
    address = models.TextField(default="ایران، استان یزد، شهرستان یزد، محله خرمشاه")

    class Meta:
        verbose_name = "اطلاعات شرکت"
        verbose_name_plural = "اطلاعات پایه شرکت"

class HeroSection(models.Model):
    badge_text = models.CharField(max_length=255, default="پیشرو در توسعه پلتفرم‌های سازمانی", verbose_name="متن بج بالایی هیرو")
    main_title_static = models.CharField(max_length=255, default="معماری سامانه‌های اختصاصی،", verbose_name="متن ثابت تیتر هیرو")
    sub_description = models.TextField(
        default="شرکت «ارشیا نگین پردازش کویر» طراح و مجری سامانه‌های مایکروپروسس بومی برای دانشگاه‌ها، بیمارستان‌ها و سازمان‌های بزرگ کشور با پایداری ۹۹.۹٪ و ارائه مستندات کامل فنی.",
        verbose_name="توضیحات اصلی هیرو"
    )
    primary_button_text = models.CharField(max_length=150, default="ثبت درخواست پروژه (فرم ۴ مرحله‌ای)", verbose_name="متن دکمه اصلی")
    secondary_button_text = models.CharField(max_length=150, default="محصولات نرم‌افزاری", verbose_name="متن دکمه دوم")
    is_active = models.BooleanField(default=True, verbose_name="محتوای فعال هیرو")

    def __str__(self):
        return f"محتوای هیرو: {self.main_title_static}"

    class Meta:
        verbose_name = "محتوای بخش هیرو"
        verbose_name_plural = "مدیریت بخش هیرو (صفحه اصلی)"


class HeroTypewriterItem(models.Model):
    hero = models.ForeignKey(HeroSection, on_delete=models.CASCADE, related_name="typewriter_items", verbose_name="بخش هیرو")
    text = models.CharField(max_length=255, verbose_name="عبارت تایپ شونده")
    color_class = models.CharField(max_length=150, default="gradient-text-primary", verbose_name="کلاس رنگ گرادیان")
    order = models.IntegerField(default=0, verbose_name="ترتیب نمایش")

    def __str__(self):
        return self.text

    class Meta:
        ordering = ['order']
        verbose_name = "عبارت تایپ شونده هیرو"
        verbose_name_plural = "عبارات انیمیشنی هیرو"
