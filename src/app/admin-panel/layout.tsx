'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShieldAlert,
  Users,
  Wallet,
  MessageSquare,
  Send,
  FolderGit2,
  Package,
  Layers,
  Settings,
  Bell,
  Search,
  SlidersHorizontal,
  ChevronLeft,
  Activity,
  LogOut,
  Sparkles,
  BarChart3
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const adminMenu = [
    { href: '/admin-panel', label: 'داشبورد فرماندهی', icon: BarChart3, activeColor: 'from-brand-600 to-brand-500' },
    { href: '/admin-panel/leads', label: 'درخواست‌های پروژه (لیدها)', icon: FolderGit2, badge: '۴ جدید', activeColor: 'from-amber-600 to-orange-600' },
    { href: '/admin-panel/wallets', label: 'کیف پول مشتریان', icon: Wallet, activeColor: 'from-emerald-600 to-teal-600' },
    { href: '/admin-panel/tickets', label: 'تیکت‌های SLA ۲۴/۷', icon: MessageSquare, badge: '۲ منتظر پاسخ', activeColor: 'from-purple-600 to-indigo-600' },
    { href: '/admin-panel/sms', label: 'پایش پیامک‌های سازمانی', icon: Send, activeColor: 'from-sky-600 to-blue-600' },
    { href: '/admin-panel/products', label: 'مدیریت محصولات & راهکارها', icon: Package, activeColor: 'from-slate-700 to-slate-800' },
  ];

  return (
    <div className="min-h-screen dark:bg-slate-950 bg-slate-900 text-right font-sans antialiased text-slate-100 relative overflow-x-hidden">
      {/* Top Fixed Admin Command Bar */}
      <header className="sticky top-0 z-40 dark:bg-slate-950/95 bg-slate-900/95 backdrop-blur-2xl border-b dark:border-slate-800 border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <Link href="/admin-panel" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-brand-600 to-accent-500 p-0.5 shadow-lg group-hover:scale-105 transition-all">
              <div className="w-full h-full bg-slate-950 rounded-[13px] flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-accent-400" />
              </div>
            </div>
            <div>
              <span className="text-sm font-black text-white block tracking-tight">
                سامانه فرماندهی ارشد ANPK
              </span>
              <span className="text-[10px] text-slate-400 font-mono block">Executive Command Center</span>
            </div>
          </Link>

          <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold mr-4">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            سطح دسترسی: مدیر ارشد کل
          </span>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          <Link
            href="/"
            className="px-3.5 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">خروج به سایت</span>
          </Link>
        </div>
      </header>

      {/* Main Admin Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* SIDEBAR NAVIGATION */}
        <aside className={`${sidebarCollapsed ? 'lg:col-span-1' : 'lg:col-span-3'} space-y-4 sticky top-20 transition-all duration-300`}>
          <div className="p-3 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl space-y-1.5 shadow-2xl">
            <div className="flex items-center justify-between px-2 py-2 border-b border-slate-800">
              {!sidebarCollapsed && (
                <span className="text-xs font-black text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-accent-400" />
                  منوی مدیریت سیستم:
                </span>
              )}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                title={sidebarCollapsed ? 'باز کردن منو' : 'جمع کردن منو'}
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            </div>

            {adminMenu.map((item) => {
              const isActive = pathname === item.href;
              const IconComp = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl transition-all text-xs font-bold ${
                    isActive
                      ? `bg-gradient-to-r ${item.activeColor} text-white shadow-lg scale-[1.02] font-black`
                      : 'text-slate-300 hover:bg-slate-800/80'
                  }`}
                  title={item.label}
                >
                  <div className="flex items-center gap-2.5">
                    <IconComp className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </div>

                  {!sidebarCollapsed && item.badge && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-accent-500/20 text-accent-300 border border-accent-500/40'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className={`${sidebarCollapsed ? 'lg:col-span-11' : 'lg:col-span-9'} space-y-8 transition-all duration-300`}>
          {children}
        </main>
      </div>
    </div>
  );
}
