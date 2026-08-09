from django.db import models

class ContactMessage(models.Model):
    name = models.CharField(max_length=255, verbose_name="نام و نام خانوادگی فرستنده")
    email = models.EmailField(blank=True, null=True, verbose_name="ایمیل")
    phone = models.CharField(max_length=50, verbose_name="شماره تماس")
    subject = models.CharField(max_length=255, verbose_name="موضوع پیام")
    message = models.TextField(verbose_name="متن پیام")
    is_read = models.BooleanField(default=False, verbose_name="خوانده شده")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاریخ دریافت")

    def __str__(self):
        return f"{self.name} - {self.subject}"

    class Meta:
        verbose_name = "پیام تماس با ما"
        verbose_name_plural = "پیام‌های تماس با ما"
