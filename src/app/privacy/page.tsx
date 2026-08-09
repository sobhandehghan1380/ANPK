import React from 'react';
import { ShieldCheck, Lock, Eye } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'حریم خصوصی و محرمانه بودن داده‌ها | ارشیا نگین پردازش',
  description: 'سیاست‌های حفاظت از حریم خصوصی، امنیت داده‌ها و محرمانه بودن اطلاعات در شرکت ارشیا نگین پردازش کویر.',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-300 text-xs font-bold border border-emerald-500/20">
          <ShieldCheck className="w-4 h-4" />
          <span>حفاظت از اطلاعات مشتریان</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">سیاست حریم خصوصی و محرمانه بودن داده‌ها</h1>
      </div>

      <div className="glass-card rounded-3xl border border-slate-800 p-8 space-y-6 text-slate-300 text-xs sm:text-sm leading-relaxed">
        <h2 className="text-lg font-bold text-white">۱. تعهد به حفظ محرمانه بودن داده‌های سازمانی</h2>
        <p>
          شرکت «ارشیا نگین پردازش کویر» متعهد است که تمام اطلاعات دریافت‌شده از طریق فرم‌های شروع پروژه، مکاتبات، داتابیس‌های پزشکی و زیرساخت‌های سازمان مشتریان را کاملاً محرمانه تلقی کرده و تحت هیچ شرایطی به اشخاص ثالث واگذار ننماید.
        </p>

        <h2 className="text-lg font-bold text-white">۲. نحوه جمع‌آوری و پردازش داده‌ها</h2>
        <p>
          اطلاعات تماس و شرح نیازمندی‌های ثبت‌شده در فرم ۴ مرحله‌ای صرفاً برای ارزیابی پروپوزال فنی، صدور کد پیگیری یکتا و برقراری ارتباط با درخواست‌دهنده استفاده می‌شود.
        </p>

        <h2 className="text-lg font-bold text-white">۳. امنیت فنی و ذخیره‌سازی</h2>
        <p>
          تمامی دادواستدهای اطلاعاتی در بستر وب‌سایت با الگوریتم‌های رمزنگاری TLS 1.3 و داتابیس‌های امن و ایزوله محافظت می‌شوند.
        </p>
      </div>
    </div>
  );
}
