import os

from django.core.management.base import BaseCommand
from django.core.management.base import CommandError
from django.contrib.auth import get_user_model

class Command(BaseCommand):
    help = 'ایجاد یا بازنشانی رمز عبور کاربر ادمین ارشد ANPK'

    def add_arguments(self, parser):
        parser.add_argument('--username', type=str, default='admin', help='نام کاربری ادمین')
        parser.add_argument('--password', type=str, help='رمز عبور ادمین؛ در صورت حذف از ANPK_ADMIN_PASSWORD خوانده می‌شود')
        parser.add_argument('--email', type=str, default='admin@anpk.ir', help='ایمیل ادمین')

    def handle(self, *args, **options):
        User = get_user_model()
        username = options['username']
        password = options['password'] or os.getenv('ANPK_ADMIN_PASSWORD')
        email = options['email']

        if not password:
            raise CommandError('رمز عبور را با --password یا ANPK_ADMIN_PASSWORD مشخص کنید.')

        user, created = User.objects.get_or_create(username=username)
        user.set_password(password)
        user.email = email
        user.is_staff = True
        user.is_superuser = True
        user.is_active = True
        user.save()

        action = 'ایجاد شد' if created else 'بروزرسانی و دسترسی ادمین فعال شد'
        self.stdout.write(self.style.SUCCESS(f'کاربر ادمین "{username}" با موفقیت {action}.'))
