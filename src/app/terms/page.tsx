import React from 'react';
import { FileText, CheckCircle2 } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'شرایط استفاده و موافقت‌نامه خدمات | ارشیا نگین پردازش',
  description: 'قوانین و شرایط استفاده از خدمات و محصولات نرم‌افزاری ارشیا نگین پردازش کویر.',
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 text-brand-300 text-xs font-bold border border-brand-500/20">
          <FileText className="w-4 h-4" />
          <span>قوانین و ضوابط همکاری</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">شرایط استفاده و موافقت‌نامه سطح خدمات (SLA)</h1>
      </div>

      <div className="glass-card rounded-3xl border border-slate-800 p-8 space-y-6 text-slate-300 text-xs sm:text-sm leading-relaxed">
        <h2 className="text-lg font-bold text-white">۱. تحویل واقعی و تعهدات قرارداد</h2>
        <p>
          تمام خدمات نرم‌افزاری و پروژه‌های سفارشی بر اساس پروپوزال فنی تاییدشده و قرارداد فازبندی‌شده ارائه می‌گردند. کد پیگیری صادره در وب‌سایت سند رسمی ثبت اولیه درخواست شماست.
        </p>

        <h2 className="text-lg font-bold text-white">۲. مالكیت معنوی و سورس‌کد</h2>
        <p>
          طبق قوانین شرکت ارشیا نگین پردازش کویر، در پروژه‌های توسعه سفارشی، مالکیت مادی و معنوی سورس‌کد پس از تسویه نهایی به سازمان کارفرما واگذار می‌گردد.
        </p>
      </div>
    </div>
  );
}
