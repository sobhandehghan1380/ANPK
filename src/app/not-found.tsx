import React from 'react';
import Link from 'next/link';
import { HelpCircle, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-8">
      <div className="w-20 h-20 rounded-3xl bg-brand-600/20 text-brand-400 border border-brand-500/30 flex items-center justify-center mx-auto shadow-2xl">
        <HelpCircle className="w-10 h-10 animate-pulse" />
      </div>

      <div className="space-y-3">
        <span className="font-mono text-4xl font-black text-brand-400">404</span>
        <h1 className="text-3xl font-black text-white">صفحه مورد نظر یافت نشد</h1>
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          آدرسی که وارد کرده‌اید وجود ندارد یا منتقل شده است. می‌توانید از دکمه‌های زیر جهت راهنمایی استفاده نمایید.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
        <Link
          href="/"
          className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg"
        >
          <Home className="w-4 h-4" />
          <span>بازگشت به صفحه اصلی</span>
        </Link>
        <Link
          href="/solutions"
          className="px-6 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white font-bold text-xs flex items-center gap-2"
        >
          <span>مشاهده راهکارها</span>
          <ArrowLeft className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
