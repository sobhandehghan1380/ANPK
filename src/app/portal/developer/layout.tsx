'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrainCircuit, Code2, KeyRound, MessageSquare } from 'lucide-react';

export default function HubLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const tabs = [{"path": "/portal/developer/api-keys", "label": "کلیدهای API", "icon": "KeyRound"}, {"path": "/portal/developer/ai-usage", "label": "گزارش مصرف هوش مصنوعی", "icon": "BrainCircuit"}, {"path": "/portal/developer/sms-logs", "label": "گزارش پیامک\u200cها", "icon": "MessageSquare"}];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl p-6 border dark:border-slate-800 border-slate-200">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="space-y-1 text-right w-full">
            <h1 className="text-2xl font-black dark:text-white text-slate-900 flex items-center gap-3">
              <Code2 className="w-8 h-8 text-brand-500" />
              پنل برنامه‌نویسان (Developer API)
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">دسترسی به کلیدهای API و گزارش مصرف سرویس‌های AI و پیامک.</p>
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
      <div className="mt-4">
        {children}
      </div>
    </div>
  );
}
