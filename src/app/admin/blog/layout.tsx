'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, FileEdit, Tag, MessageCircle, Calendar, BarChart3 } from 'lucide-react';

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const tabs = [
    { path: "/admin/blog", label: "داشبورد وبلاگ", icon: BarChart3 },
    { path: "/admin/blog/articles", label: "مقالات", icon: FileEdit },
    { path: "/admin/blog/tags", label: "برچسب‌ها", icon: Tag },
    { path: "/admin/blog/comments", label: "نظرات", icon: MessageCircle },
    { path: "/admin/blog/scheduled", label: "زمان‌بندی", icon: Calendar },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl p-6 border dark:border-slate-800 border-slate-200">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="space-y-1 text-right w-full">
            <h1 className="text-2xl font-black dark:text-white text-slate-900 flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-brand-500" />
              مدیریت وبلاگ تخصصی
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">مدیریت مقالات، برچسب‌ها، نظرات و آمار وبلاگ</p>
          </div>
        </div>
        
        {/* Animated Tabs */}
        <div className="mt-8 flex flex-wrap gap-2 text-right">
          {tabs.map((tab: any, idx: number) => {
            const isActive = pathname === tab.path || (tab.path !== '/admin/blog' && pathname.startsWith(tab.path));
            return (
              <Link key={idx} href={tab.path}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                  isActive 
                    ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30 scale-105' 
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
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
