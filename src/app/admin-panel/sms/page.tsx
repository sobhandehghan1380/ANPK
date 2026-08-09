'use client';

import React from 'react';
import { Send, Smartphone, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function AdminSmsPage() {
  return (
    <div className="space-y-8 animate-fade-in text-right">
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
          <Send className="w-6 h-6 text-sky-400" />
          پایش خطوط پیامکی سازمانی و تعرفه‌ها
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 font-medium">
          مدیریت خطوط خدماتی بدون بلک‌لیست و بررسی گزارش ارسال‌های سراسری کل پلتفرم.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold">
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
          <span className="text-slate-400 block">خط خدماتی اصلی فعال</span>
          <span className="text-lg font-black text-sky-400 font-mono block dir-ltr text-right">1000890412</span>
        </div>
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
          <span className="text-slate-400 block">ارسال ماه جاری پلتفرم</span>
          <span className="text-lg font-black text-emerald-400 block font-mono">۵۴,۲۰۰ پیامک</span>
        </div>
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
          <span className="text-slate-400 block">تعرفه کسر از کیف پول</span>
          <span className="text-lg font-black text-amber-400 block font-mono">۷۵ تومان</span>
        </div>
      </div>
    </div>
  );
}
