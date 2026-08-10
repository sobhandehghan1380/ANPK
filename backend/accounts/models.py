from django.conf import settings
from django.db import models
from django.utils import timezone


class UserProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profile",
    )
    phone_number = models.CharField(max_length=20, blank=True, null=True, verbose_name="شماره تماس")
    national_code = models.CharField(max_length=20, blank=True, null=True, verbose_name="کد ملی")
    job_title = models.CharField(max_length=150, blank=True, null=True, verbose_name="عنوان شغلی")
    address = models.TextField(blank=True, null=True, verbose_name="آدرس پستی")
    bio = models.TextField(blank=True, null=True, verbose_name="درباره شخص")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Profile: {self.user.username}"

    class Meta:
        db_table = "portal_userprofile"
        verbose_name = "پروفایل کاربر"
        verbose_name_plural = "پروفایل کاربران"


class Organization(models.Model):
    name = models.CharField(max_length=255, verbose_name="نام سازمان / بیمارستان")
    contact_person = models.CharField(max_length=150, verbose_name="نام رابط اصلی سازمان")
    phone = models.CharField(max_length=50, db_index=True, verbose_name="شماره تماس سازمان")
    email = models.EmailField(blank=True, null=True, verbose_name="ایمیل سازمان")
    address = models.TextField(blank=True, null=True, verbose_name="آدرس سازمان")
    national_code = models.CharField(max_length=50, blank=True, null=True, verbose_name="کد اقتصادی / شناسه ملی")
    website = models.URLField(blank=True, null=True, verbose_name="وب‌سایت سازمان")
    description = models.TextField(blank=True, null=True, verbose_name="توضیحات / یادداشت")
    logo_url = models.CharField(max_length=500, blank=True, default="", verbose_name="آدرس لوگوی سازمان")
    tags = models.CharField(max_length=500, blank=True, default="", verbose_name="برچسب‌ها (با کاما جدا کنید)")
    portal_access = models.BooleanField(default=True, verbose_name="دسترسی به پورتال")
    created_at = models.DateTimeField(default=timezone.now, verbose_name="تاریخ ثبت سازمان")

    def __str__(self):
        return self.name

    def get_tags_list(self):
        return [tag.strip() for tag in self.tags.split(",") if tag.strip()]

    class Meta:
        db_table = "portal_clientorganization"
        verbose_name = "سازمان / مشتری"
        verbose_name_plural = "سازمان‌ها و مشتریان"


class OrganizationMembership(models.Model):
    ROLE_CHOICES = [
        ("OWNER", "مالک سازمان"),
        ("MEMBER", "عضو سازمان"),
    ]

    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="members",
        verbose_name="سازمان",
    )
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="client_member",
        verbose_name="حساب کاربری",
    )
    phone = models.CharField(max_length=50, unique=True, db_index=True, verbose_name="شماره تلفن همراه")
    full_name = models.CharField(max_length=150, verbose_name="نام و نام خانوادگی")
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default="MEMBER", verbose_name="نقش دسترسی")
    is_active = models.BooleanField(default=True, verbose_name="فعال")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاریخ عضویت")

    def __str__(self):
        return f"{self.full_name} ({self.get_role_display()}) - {self.organization.name}"

    class Meta:
        db_table = "portal_clientmember"
        verbose_name = "عضو سازمان"
        verbose_name_plural = "اعضای سازمان‌ها"


class SMSOTPCode(models.Model):
    phone = models.CharField(max_length=50, db_index=True, verbose_name="شماره تلفن همراه")
    code = models.CharField(max_length=128, verbose_name="هش کد OTP")
    is_used = models.BooleanField(default=False, verbose_name="استفاده گردیده")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاریخ و زمان صدور")

    def __str__(self):
        return f"کد OTP برای شماره {self.phone}"

    class Meta:
        db_table = "portal_smsotpcode"
        verbose_name = "کد تایید OTP"
        verbose_name_plural = "کدهای تایید OTP (ورود پیامکی)"
