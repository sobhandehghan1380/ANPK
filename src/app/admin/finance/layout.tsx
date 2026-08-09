'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, Banknote, PackageCheck, Wallet, CheckCircle2 } from 'lucide-react';

export default function HubLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const tabs = [{"path": "/admin/finance/invoices", "label": "فاکتورهای مالی", "icon": "FileText"}, {"path": "/admin/finance/wallets", "label": "کیف پول\u200cها", "icon": "Wallet"}, {"path": "/admin/finance/subscriptions", "label": "اشتراک\u200cهای فعال", "icon": "CheckCircle2"}, {"path": "/admin/finance/plans", "label": "پکیج\u200cهای قیمت\u200cگذاری", "icon": "PackageCheck"}];

  return (
    <div className="space-y-6 animate-fade-in print:space-y-0 print:m-0 print:block">
      <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl p-6 border dark:border-slate-800 border-slate-200 print:hidden">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="space-y-1 text-right w-full">
            <h1 className="text-2xl font-black dark:text-white text-slate-900 flex items-center gap-3">
              <Banknote className="w-8 h-8 text-brand-500" />
              امور مالی و حسابداری
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">مدیریت جامع فاکتورها، حساب‌های کیف‌پول و اشتراک مشتریان.</p>
          </div>
        </div>
        
        {/* Animated Tabs */}
        <div className="mt-8 flex flex-wrap gap-2 text-right">
          {tabs.map((tab: any, idx: number) => {
            const isActive = pathname.startsWith(tab.path);
            const Icon = require('lucide-react')[tab.icon];
            return (
              <Link key={idx} href={tab.path}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                  isActive 
                    ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30 scale-105' 
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </Link>
            )
          })}
        </div>
      </div>
      
      {/* Content Area */}
      <div className="mt-4 print:mt-0 print:m-0 print:p-0 print:block w-full">
        {children}
      </div>
    </div>
  );
}
