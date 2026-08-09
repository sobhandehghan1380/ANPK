'use client';

import React from 'react';
import { Key } from 'lucide-react';

export default function ApiKeysPage() {
  return (
    <div className="p-6 sm:p-8 rounded-3xl glass-card border dark:border-slate-800 border-slate-200/90 space-y-6 card-elevated animate-fade-in text-right">
      <div className="space-y-2 border-b dark:border-slate-800 border-slate-200 pb-4">
        <h2 className="text-xl font-black dark:text-white text-slate-900 flex items-center gap-2">
          <Key className="w-6 h-6 text-amber-500" />
          مدیریت کلیدهای اتصال API و وب‌هوک‌های سازمان
        </h2>
        <p className="text-xs dark:text-slate-400 text-slate-600 font-medium">
          کلیدهای امنیتی جهت اتصال سیستم‌های داخلی بیمارستان‌ها و کارخانجات به APIهای ANPK.
        </p>
      </div>

      <div className="p-5 rounded-2xl dark:bg-slate-900/90 bg-slate-100/90 border dark:border-slate-800 border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold dark:text-white text-slate-900">کلید تولید (Production Live Key)</span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">فعال</span>
        </div>
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-amber-400 dir-ltr text-left overflow-x-auto">
          anpk_live_sec_890412349018471290384710293
        </div>
      </div>
    </div>
  );
}
