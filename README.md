# ANPK Enterprise Platform

پلتفرم یکپارچه ANPK شامل وب‌سایت عمومی Next.js، پنل مدیریت، پورتال مشتریان و API مبتنی بر Django REST Framework است.

## معماری

- `src/`: فرانت‌اند Next.js 16 و TypeScript
- `backend/`: API، مدل‌ها و migrationهای Django
- `public/`: تصاویر، فونت‌ها و فایل‌های عمومی

Prisma دیگر بخشی از معماری فعال نیست و Django ORM منبع اصلی داده است.

## پیش‌نیازها

- Node.js 20.9+
- Python 3.12+
- SQLite برای توسعه یا PostgreSQL برای production

## راه‌اندازی فرانت‌اند

```powershell
Copy-Item .env.local.example .env.local
npm ci
npm run dev
```

فرانت‌اند به‌صورت پیش‌فرض روی `http://localhost:3000` اجرا می‌شود.

## راه‌اندازی بک‌اند

```powershell
Set-Location backend
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements-dev.txt
Copy-Item .env.example .env
python manage.py migrate
$env:ANPK_ADMIN_PASSWORD='use-a-strong-password'
python manage.py setup_admin
python manage.py runserver
```

API به‌صورت پیش‌فرض روی `http://127.0.0.1:8000` اجرا می‌شود.

نسخه canonical تمام APIهای بک‌اند `/api/v1/` است. مسیرهای بدون نسخه `/api/` حذف شده‌اند و پاسخ `404` می‌دهند. Routeهای واسط Next.js نیز فقط زیر `/api/v1/` ارائه می‌شوند.

## API مصرف هر پروژه

```http
GET /api/v1/projects/{project_id}/usage/
Authorization: Bearer <JWT>
```

این endpoint تعداد و هزینه مصرف هوش مصنوعی، تعداد و هزینه پیامک، وضعیت تحویل و ریزلاگ‌های همان پروژه را برمی‌گرداند. عضو پورتال فقط به پروژه‌های سازمان خودش دسترسی دارد و کاربر staff می‌تواند مصرف همه پروژه‌ها را مشاهده کند.

پارامترهای اختیاری:

- `date_from=YYYY-MM-DD`
- `date_to=YYYY-MM-DD`
- `limit=1..100` برای تعداد ریزلاگ هر سرویس

## ساختار تجاری مشتری و پروژه

- سازمان مالک کاربران، کیف پول و همه فاکتورها است.
- هر اشتراک به یک پروژه سازمان متصل می‌شود؛ ایجاد اشتراک جدید بدون پروژه از طریق API مجاز نیست.
- هر SLA جدید به یک اشتراک متصل است و پروژه و سازمان آن از همان اشتراک تعیین می‌شود.
- تیکت‌ها، کلیدهای API و مصرف AI/SMS در سطح پروژه ثبت می‌شوند.
- فاکتور همیشه متعلق به سازمان است و برای هزینه‌های پروژه‌ای می‌تواند به پروژه و اشتراک نیز متصل باشد؛ فاکتور شارژ کیف پول الزاماً پروژه ندارد.

## کنترل کیفیت

```powershell
npm run lint
npm run build
Set-Location backend
python manage.py check
python manage.py makemigrations --check --dry-run
python manage.py test
```

## تنظیمات امنیتی مهم

- `DJANGO_SECRET_KEY` و `ADMIN_JWT_SECRET` در production باید مقادیر تصادفی و مستقل داشته باشند.
- `DEBUG=False` و `CORS_ALLOW_ALL_ORIGINS=False` در production الزامی است.
- `PAYMENT_MOCK_ENABLED` فقط برای توسعه است و در production باید `False` باشد.
- ارسال OTP عملیاتی به `SMS_OTP_ENDPOINT`، `SMS_OTP_API_KEY` و `SMS_SENDER_LINE` نیاز دارد.
- مقدار کامل API Key مشتری فقط هنگام ساخت نمایش داده می‌شود.

## داده‌های اولیه

فرمان seed رمز پیش‌فرض ندارد. قبل از اجرا مقدار زیر را تنظیم کنید:

```powershell
$env:ANPK_SEED_ADMIN_PASSWORD='use-a-strong-password'
python manage.py seed_database
```
