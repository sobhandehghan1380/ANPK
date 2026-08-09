'use client';

import React from 'react';
import { Package, Layers, Edit, Plus, CheckCircle2 } from 'lucide-react';

export default function AdminProductsPage() {
  const products = [
    { id: 'PRD-1', name: 'پلتفرم کلاس‌های آنلاین و وبینار آیرا (Aira)', category: 'وبینار WebRTC', status: 'دمو فعال', users: '۱۵ کلینیک و دانشگاه' },
    { id: 'PRD-2', name: 'سامانه CMMS تأسیسات نگار', category: 'نگهداشت تأسیسات', status: 'فعال', users: '۸ بیمارستان' },
    { id: 'PRD-3', name: 'سامانه نیکی لینک (NikiLink)', category: 'مدیریت پیوندها', status: 'در حال توسعه', users: 'نسخه بتا' },
  ];

  return (
    <div className="space-y-8 animate-fade-in text-right">
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-brand-400" />
            مدیریت کاتالوگ محصولات و راهکارها
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
            ویرایش مشخصات محصولات، دموها و پایش تعداد سازمان‌های استفاده‌کننده.
          </p>
        </div>

        <button className="px-4 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-black text-xs shadow-md flex items-center gap-1.5 transition-colors">
          <Plus className="w-4 h-4" />
          <span>افزودن محصول جدید</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map((p) => (
          <div key={p.id} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-brand-400">{p.id}</span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                {p.status}
              </span>
            </div>
            <h3 className="text-sm font-black text-white leading-snug">{p.name}</h3>
            <p className="text-xs text-slate-400 font-medium">دسته‌بندی: {p.category}</p>
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300 font-bold">
              <span>{p.users}</span>
              <button className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white">
                <Edit className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
