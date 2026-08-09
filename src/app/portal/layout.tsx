'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getPortalOverview, getNotifications, markNotificationRead } from '@/lib/api';
import {
  Wallet,
  CreditCard,
  MessageSquare,
  ShieldCheck,
  PlusCircle,
  Layers,
  Send,
  FolderGit2,
  SlidersHorizontal,
  Settings,
  Bot,
  Sparkles,
  PhoneCall,
  MoreHorizontal,
  LogOut,
  X,
  Banknote,
  Code2,
  Bell,
  Check,
} from 'lucide-react';
import { ScrollReveal } from '@/components/ScrollReveal';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [clientName, setClientName] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userPhone, setUserPhone] = useState('');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotif, setShowNotif] = useState(false);

  useEffect(() => {
    // Check local storage for authenticated mobile session
    const loggedIn = localStorage.getItem('anpk_user_logged_in');
    const phone = localStorage.getItem('anpk_user_phone');
    if (!loggedIn) {
      router.push('/login');
    } else {
      setIsAuthenticated(true);
      if (phone) setUserPhone(phone);

      // Fetch live portal overview data for top header banner
      getPortalOverview()
        .then((res) => {
          if (res?.wallet_balance !== undefined) setWalletBalance(res.wallet_balance);
          if (res?.client_name) setClientName(res.client_name);
        })
        .catch((err) => console.error('Error loading header portal overview:', err));

      // Fetch Notifications
      getNotifications().then(res => setNotifications(res));

    }
  }, [router]);

  
  const handleReadNotif = async (id: number) => {
    await markNotificationRead(id);
    setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('anpk_user_logged_in');
      localStorage.removeItem('anpk_user_phone');
    }
    router.push('/login');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-center">
        <div className="space-y-3">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-bold text-slate-400">در حال بررسی سطح دسترسی کاربر...</p>
        </div>
      </div>
    );
  }

  const sidebarMenu = [
    { href: '/portal', label: 'داشبورد کلی', icon: Layers, activeColor: 'from-brand-600 to-brand-500' },
    { href: '/portal/projects', label: 'پروژه‌ها', icon: FolderGit2, activeColor: 'from-indigo-600 to-purple-600' },
    { href: '/portal/wallet', label: 'کیف پول', icon: Wallet, activeColor: 'from-emerald-600 to-teal-600' },
    { href: '/portal/ai-usage', label: 'مصرف AI', icon: Bot, activeColor: 'from-purple-600 to-pink-600' },
    { href: '/portal/sms-logs', label: 'پیامک‌ها', icon: Send, activeColor: 'from-sky-600 to-blue-600' },
    { href: '/portal/invoices', label: 'فاکتورها', icon: CreditCard, activeColor: 'from-amber-600 to-orange-600' },
    { href: '/portal/sla-support', label: 'پشتیبانی SLA', icon: ShieldCheck, activeColor: 'from-emerald-600 to-teal-600' },
    { href: '/portal/tickets', label: 'تیکت‌ها', icon: MessageSquare, activeColor: 'from-purple-600 to-indigo-600' },
    { href: '/portal/settings', label: 'تنظیمات', icon: Settings, activeColor: 'from-slate-700 to-slate-800' },
  ];

  // Mobile Bottom Bar Quick Items
  const mobileBottomBar = [
    { href: '/portal', label: 'داشبورد', icon: Layers },
    { href: '/portal/projects', label: 'پروژه‌ها', icon: FolderGit2 },
    { href: '/portal/wallet', label: 'کیف پول', icon: Wallet },
    { href: '/portal/tickets', label: 'تیکت‌ها', icon: MessageSquare },
  ];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8 text-right relative overflow-x-hidden pb-24 lg:pb-10">
      {/* Top Banner Header - Perfect Dual Mode High Contrast */}
      <ScrollReveal variant="fade-up">
        <div className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 shadow-2xl relative overflow-hidden text-right">
          <div className="absolute top-0 left-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full dark:bg-emerald-500/10 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/30">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>حساب سازمانی تایید شده: {clientName || 'سازمان کاربر جدید'}</span>
              </div>
              <h1 className="text-xl sm:text-3xl font-black dark:text-white text-slate-900 leading-tight">
                پورتال خدمات، مالی و پشتیبانی ANPK
              </h1>
              <p className="text-xs sm:text-sm dark:text-slate-400 text-slate-600 font-medium">
                مدیریت کیف پول، تمدید پشتیبانی SLA ۲۴/۷، پیگیری پروژه‌ها و گزارش پیامک‌ها.
              </p>
            </div>

            {/* Quick Wallet Box */}
            <div className="w-full md:w-auto p-4 sm:p-5 rounded-2xl dark:bg-slate-950/70 bg-slate-100/90 border dark:border-slate-800/80 border-slate-200/90 space-y-3 shrink-0 shadow-inner">
              <div className="flex items-center justify-between gap-6">
                <span className="text-xs font-bold dark:text-slate-400 text-slate-600">موجودی کیف پول:</span>
                <span className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 dir-rtl">
                  {walletBalance.toLocaleString('fa-IR')} <span className="text-xs font-bold dark:text-slate-400 text-slate-600">تومان</span>
                </span>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t dark:border-slate-800 border-slate-200">
                <Link
                  href="/portal/wallet"
                  className="flex-1 py-2 px-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>شارژ کیف پول</span>
                </Link>

                {/* Notification Bell */}
                <div className="relative">
                  <button onClick={() => setShowNotif(!showNotif)} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border dark:border-slate-700 border-slate-300 text-slate-600 dark:text-slate-300 relative hover:bg-slate-50 transition-colors">
                    <Bell className="w-4 h-4" />
                    {notifications.filter(n => !n.is_read).length > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full text-white text-[9px] flex items-center justify-center font-bold">
                        {notifications.filter(n => !n.is_read).length}
                      </span>
                    )}
                  </button>
                  
                  {showNotif && (
                    <div className="absolute top-12 left-0 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl z-50 overflow-hidden">
                      <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                        <span className="text-sm font-bold">اعلان‌ها</span>
                        <span className="text-xs text-brand-500 cursor-pointer" onClick={() => setShowNotif(false)}>بستن</span>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-xs text-slate-400">اعلانی وجود ندارد.</div>
                        ) : (
                          notifications.map(n => (
                            <div key={n.id} onClick={() => handleReadNotif(n.id)} className={`p-4 border-b border-slate-50 dark:border-slate-800/50 cursor-pointer transition-colors ${!n.is_read ? 'bg-sky-50 dark:bg-sky-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                              <div className="flex justify-between items-start mb-1">
                                <span className={`text-xs font-bold ${!n.is_read ? 'text-slate-800 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>{n.title}</span>
                                {n.is_read && <Check className="w-3 h-3 text-emerald-500" />}
                              </div>
                              <p className="text-[11px] text-slate-500">{n.message}</p>
                              <div className="text-[10px] text-slate-400 mt-2 font-mono">{n.created_at}</div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>


                <div className="px-2.5 py-1.5 rounded-xl dark:bg-slate-900 bg-white border dark:border-slate-700 border-slate-300 text-[11px] font-mono font-bold dark:text-slate-300 text-slate-700 shrink-0">
                  موبایل: {userPhone}
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* DESKTOP SIDEBAR NAVIGATION */}
        <aside className={`hidden lg:block ${sidebarCollapsed ? 'lg:col-span-1' : 'lg:col-span-3'} space-y-4 sticky top-24 transition-all duration-300`}>
          <div className="p-3 rounded-3xl dark:bg-slate-900/80 bg-white/90 border dark:border-slate-800/90 border-slate-200/90 backdrop-blur-xl space-y-1.5 shadow-xl">
            <div className="flex items-center justify-between px-2 py-2 border-b dark:border-slate-800 border-slate-200/90">
              {!sidebarCollapsed && (
                <span className="text-xs font-black dark:text-slate-300 text-slate-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-500" />
                  منوی دسترسی پورتال:
                </span>
              )}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                title={sidebarCollapsed ? 'باز کردن منو' : 'جمع کردن منو'}
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            </div>

            {sidebarMenu.map((item) => {
              const isActive = pathname === item.href;
              const IconComp = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl transition-all text-xs font-bold ${
                    isActive
                      ? `bg-gradient-to-r ${item.activeColor} text-white shadow-lg scale-[1.02] font-black`
                      : 'dark:text-slate-300 text-slate-700 hover:bg-slate-200/70 dark:hover:bg-slate-800/70'
                  }`}
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
                          : 'bg-brand-500/10 text-brand-500 border border-brand-500/30'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* SLA Quick Support Box */}
          {!sidebarCollapsed && (
            <div className="p-4 rounded-3xl dark:bg-slate-900 bg-white border dark:border-emerald-500/30 border-emerald-500/40 space-y-3 text-right shadow-xl">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-5 h-5 shrink-0" />
                <span className="text-xs font-black">پشتیبانی ۲۴/۷ SLA</span>
              </div>
              <p className="text-[11px] dark:text-slate-300 text-slate-700 font-medium">
                رفع فوری اختلالات با اولویت خط بحرانی.
              </p>
              <a
                href="tel:03538209090"
                className="w-full py-2 rounded-xl bg-emerald-500/10 dark:text-emerald-400 text-emerald-700 border border-emerald-500/30 text-xs font-black flex items-center justify-center gap-1 transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>۰۳۵-۳۸۲۰۹۰۹۰</span>
              </a>
            </div>
          )}
        </aside>

        {/* CONTENT PANEL CHILDREN */}
        <main className={`${sidebarCollapsed ? 'lg:col-span-11' : 'lg:col-span-9'} space-y-6 sm:space-y-8 transition-all duration-300`}>
          {children}
        </main>
      </div>

      {/* MOBILE NATIVE BOTTOM NAVIGATION BAR */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 dark:bg-slate-950/95 bg-white/95 backdrop-blur-2xl border-t dark:border-slate-800 border-slate-200 px-3 py-2 shadow-2xl">
        <div className="flex items-center justify-around">
          {mobileBottomBar.map((item) => {
            const isActive = pathname === item.href;
            const IconComp = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${
                  isActive
                    ? 'text-brand-500 font-black scale-105'
                    : 'text-slate-400 font-medium hover:text-slate-200'
                }`}
              >
                <IconComp className={`w-5 h-5 ${isActive ? 'text-brand-500 animate-pulse' : 'text-slate-400'}`} />
                <span className="text-[10px]">{item.label}</span>
              </Link>
            );
          })}

          {/* More Items Drawer Trigger Button */}
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="flex flex-col items-center gap-1 px-3 py-1.5 text-slate-400 font-medium hover:text-slate-200"
          >
            <MoreHorizontal className="w-5 h-5 text-slate-400" />
            <span className="text-[10px]">بیشتر</span>
          </button>
        </div>
      </nav>

      {/* MOBILE BOTTOM SHEET DRAWER */}
      {mobileDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-end animate-fade-in">
          <div className="w-full dark:bg-slate-900 bg-white rounded-t-3xl border-t dark:border-slate-800 border-slate-200 p-6 space-y-4 shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b dark:border-slate-800 border-slate-200 pb-3">
              <span className="text-sm font-black dark:text-white text-slate-900">سایر بخش‌های پورتال</span>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="p-2 rounded-xl dark:bg-slate-800 bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              {sidebarMenu.map((item) => {
                const isActive = pathname === item.href;
                const IconComp = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileDrawerOpen(false)}
                    className={`flex items-center gap-2 p-3 rounded-2xl border transition-all ${
                      isActive
                        ? 'bg-brand-600 text-white border-brand-500 font-black'
                        : 'dark:bg-slate-950 bg-slate-100 dark:border-slate-800 border-slate-200 dark:text-slate-300 text-slate-700 font-bold'
                    }`}
                  >
                    <IconComp className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
