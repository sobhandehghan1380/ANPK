'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { KanbanSquare, FolderGit2, LifeBuoy } from 'lucide-react';

export default function HubLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const tabs = [{"path": "/admin/projects/board", "label": "پروژه\u200cها و فازبندی", "icon": "KanbanSquare"}, {"path": "/admin/projects/tickets", "label": "تیکت\u200cهای پشتیبانی", "icon": "LifeBuoy"}];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl p-6 border dark:border-slate-800 border-slate-200">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="space-y-1 text-right w-full">
            <h1 className="text-2xl font-black dark:text-white text-slate-900 flex items-center gap-3">
              <FolderGit2 className="w-8 h-8 text-brand-500" />
              مدیریت پروژه‌ها و پشتیبانی
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">نظارت بر فازبندی پروژه‌ها، قراردادهای SLA و تیکت‌های پشتیبانی.</p>
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
