from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

class Command(BaseCommand):
    help = 'ایجاد یا بازنشانی رمز عبور کاربر ادمین ارشد ANPK'

    def add_arguments(self, parser):
        parser.add_argument('--username', type=str, default='admin', help='نام کاربری ادمین')
        parser.add_argument('--password', type=str, default='admin123', help='رمز عبور ادمین')
        parser.add_argument('--email', type=str, default='admin@anpk.ir', help='ایمیل ادمین')

    def handle(self, *args, **options):
        User = get_user_model()
        username = options['username']
        password = options['password']
        email = options['email']

        user, created = User.objects.get_or_create(username=username)
        user.set_password(password)
        user.email = email
        user.is_staff = True
        user.is_superuser = True
        user.is_active = True
        user.save()

        action = 'ایجاد شد' if created else 'بروزرسانی و دسترسی ادمین فعال شد'
        self.stdout.write(self.style.SUCCESS(f'کاربر ادمین "{username}" با موفقیت {action}.'))
