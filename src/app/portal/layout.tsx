'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getPortalOverview, getNotifications, markNotificationRead, clientLogout } from '@/lib/api';
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
  Bell,
  Check,
  UserRound,
  RefreshCw,
  LoaderCircle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { ScrollReveal } from '@/components/ScrollReveal';

type PortalNotification = {
  id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

type NotificationStatus = 'loading' | 'success' | 'error';

function formatNotificationDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [clientName, setClientName] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [memberName, setMemberName] = useState('');
  const [memberRole, setMemberRole] = useState('');
  const [memberRoleLabel, setMemberRoleLabel] = useState('');
  const [memberPhone, setMemberPhone] = useState('');
  const [notifications, setNotifications] = useState<PortalNotification[]>([]);
  const [notificationStatus, setNotificationStatus] = useState<NotificationStatus>('loading');
  const [showNotif, setShowNotif] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  const loadNotifications = useCallback(async () => {
    setNotificationStatus('loading');
    try {
      const result = await getNotifications();
      setNotifications(Array.isArray(result) ? result : []);
      setNotificationStatus('success');
    } catch (error) {
      console.error('Error loading portal notifications:', error);
      setNotificationStatus('error');
    }
  }, []);

  useEffect(() => {
    // Check local storage for an authenticated (JWT) client session
    const token = localStorage.getItem('anpk_client_token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Fetch live portal overview data for top header banner
    getPortalOverview()
      .then((res) => {
        if (res?.wallet_balance !== undefined) setWalletBalance(res.wallet_balance);
        if (res?.client_name) setClientName(res.client_name);
        if (res?.member) {
          setMemberName(res.member.name || '');
          setMemberRole(res.member.role || '');
          setMemberRoleLabel(res.member.role_label || '');
          setMemberPhone(res.member.phone || '');
        }
      })
      .catch((err) => console.error('Error loading header portal overview:', err))
      .finally(() => setIsAuthenticated(true));

    const notificationTimer = window.setTimeout(loadNotifications, 0);
    return () => window.clearTimeout(notificationTimer);
  }, [loadNotifications, router]);

  useEffect(() => {
    if (!showNotif) return;

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotif(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShowNotif(false);
    };

    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [showNotif]);


  const handleReadNotif = async (id: number) => {
    const notification = notifications.find(item => item.id === id);
    if (!notification || notification.is_read) return;

    const result = await markNotificationRead(id);
    if (result) {
      setNotifications(current => current.map(item => item.id === id ? { ...item, is_read: true } : item));
    }
  };

  const handleLogout = () => {
    clientLogout();
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

  const sidebarMenu: Array<{ href: string; label: string; icon: LucideIcon; activeColor: string; badge?: string }> = [
    { href: '/portal', label: 'داشبورد کلی', icon: Layers, activeColor: 'from-brand-600 to-brand-500' },
    { href: '/portal/projects', label: 'پروژه‌ها', icon: FolderGit2, activeColor: 'from-indigo-600 to-purple-600' },
    { href: '/portal/finance/wallet', label: 'کیف پول', icon: Wallet, activeColor: 'from-emerald-600 to-teal-600' },
    { href: '/portal/developer/ai-usage', label: 'مصرف AI', icon: Bot, activeColor: 'from-purple-600 to-pink-600' },
    { href: '/portal/developer/sms-logs', label: 'پیامک‌ها', icon: Send, activeColor: 'from-sky-600 to-blue-600' },
    { href: '/portal/finance/invoices', label: 'فاکتورها', icon: CreditCard, activeColor: 'from-amber-600 to-orange-600' },
    { href: '/portal/projects/sla-support', label: 'پشتیبانی SLA', icon: ShieldCheck, activeColor: 'from-emerald-600 to-teal-600' },
    { href: '/portal/projects/tickets', label: 'تیکت‌ها', icon: MessageSquare, activeColor: 'from-purple-600 to-indigo-600' },
    { href: '/portal/settings', label: 'تنظیمات', icon: Settings, activeColor: 'from-slate-700 to-slate-800' },
  ];

  // Mobile Bottom Bar Quick Items
  const mobileBottomBar = [
    { href: '/portal', label: 'داشبورد', icon: Layers },
    { href: '/portal/projects', label: 'پروژه‌ها', icon: FolderGit2 },
    { href: '/portal/finance/wallet', label: 'کیف پول', icon: Wallet },
    { href: '/portal/projects/tickets', label: 'تیکت‌ها', icon: MessageSquare },
  ];

  const unreadNotifications = notifications.filter(notification => !notification.is_read).length;
  const visibleMemberName = memberName || 'کاربر پورتال';
  const visibleMemberRole = memberRoleLabel || (memberRole === 'OWNER' ? 'مالک سازمان' : 'عضو سازمان');
  const memberInitial = visibleMemberName.trim().charAt(0) || 'ک';

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-2 sm:pt-4 pb-24 lg:pb-8 space-y-5 sm:space-y-6 text-right relative overflow-x-hidden">
      {/* Top Banner Header - Perfect Dual Mode High Contrast */}
      <ScrollReveal variant="fade-up" className={showNotif ? 'relative z-40' : 'relative z-10'}>
        <div className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 shadow-xl relative text-right">
          <div className="absolute inset-0 overflow-hidden rounded-2xl sm:rounded-3xl pointer-events-none">
            <div className="absolute top-0 left-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 space-y-2.5">
            {/* Account bar: identity and global portal actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b dark:border-slate-800 border-slate-200">
              <div className="inline-flex self-start items-center gap-1.5 px-2.5 py-1 rounded-full dark:bg-emerald-500/10 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold border border-emerald-500/25">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="truncate">حساب سازمانی تایید شده: {clientName || 'سازمان کاربر جدید'}</span>
              </div>

              <div className="w-full sm:w-auto flex items-center gap-2">
                <Link
                  href="/portal/settings"
                  title="مشاهده حساب کاربری"
                  className="min-w-0 flex-1 sm:min-w-48 px-2 py-1.5 rounded-xl dark:bg-slate-950/60 bg-slate-50 border dark:border-slate-700 border-slate-200 flex items-center gap-2 hover:border-brand-400 dark:hover:border-brand-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                >
                  <span className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-black shrink-0" aria-hidden="true">
                    {memberName ? memberInitial : <UserRound className="w-4 h-4" />}
                  </span>
                  <span className="min-w-0 text-right leading-tight">
                    <span className="block text-[11px] font-black dark:text-white text-slate-800 truncate">{visibleMemberName}</span>
                    <span className="block text-[9px] mt-0.5 dark:text-slate-400 text-slate-500 truncate">
                      {visibleMemberRole}
                      {memberPhone && <><span aria-hidden="true"> · </span><span dir="ltr">{memberPhone}</span></>}
                    </span>
                  </span>
                </Link>

                {/* Notification Bell */}
                <div className="relative" ref={notificationRef}>
                  <button
                    type="button"
                    onClick={() => setShowNotif(current => !current)}
                    aria-label="نمایش اعلان‌ها"
                    aria-haspopup="dialog"
                    aria-expanded={showNotif}
                    className="w-10 h-10 rounded-xl dark:bg-slate-950/60 bg-slate-50 border dark:border-slate-700 border-slate-200 text-slate-600 dark:text-slate-300 relative flex items-center justify-center hover:border-brand-400 hover:text-brand-600 dark:hover:border-brand-500 dark:hover:text-brand-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadNotifications > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-rose-500 rounded-full text-white text-[9px] flex items-center justify-center font-bold">
                        {unreadNotifications > 9 ? '+۹' : unreadNotifications.toLocaleString('fa-IR')}
                      </span>
                    )}
                  </button>

                  {showNotif && (
                    <div
                      role="dialog"
                      aria-label="اعلان‌های حساب کاربری"
                      className="absolute top-12 -left-12 sm:left-0 w-[calc(100vw-2rem)] max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden"
                    >
                      <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                        <div>
                          <span className="text-sm font-bold dark:text-white text-slate-900">اعلان‌ها</span>
                          {unreadNotifications > 0 && (
                            <span className="mr-2 text-[10px] text-rose-500 font-bold">{unreadNotifications.toLocaleString('fa-IR')} خوانده‌نشده</span>
                          )}
                        </div>
                        <button type="button" className="text-xs text-brand-500 hover:text-brand-600 font-bold" onClick={() => setShowNotif(false)}>بستن</button>
                      </div>
                      <div className="max-h-80 overflow-y-auto overscroll-contain">
                        {notificationStatus === 'loading' ? (
                          <div className="p-8 flex items-center justify-center gap-2 text-xs text-slate-500">
                            <LoaderCircle className="w-4 h-4 animate-spin text-brand-500" />
                            در حال دریافت اعلان‌ها...
                          </div>
                        ) : notificationStatus === 'error' ? (
                          <div className="p-6 text-center space-y-3">
                            <p className="text-xs text-rose-600 dark:text-rose-400">دریافت اعلان‌ها با خطا مواجه شد.</p>
                            <button type="button" onClick={loadNotifications} className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 dark:text-brand-400">
                              <RefreshCw className="w-3.5 h-3.5" />
                              تلاش دوباره
                            </button>
                          </div>
                        ) : notifications.length === 0 ? (
                          <div className="p-8 text-center space-y-2">
                            <Bell className="w-7 h-7 mx-auto text-slate-300 dark:text-slate-600" />
                            <p className="text-xs text-slate-500">فعلاً اعلانی برای حساب شما ثبت نشده است.</p>
                          </div>
                        ) : (
                          notifications.map(n => (
                            <button type="button" key={n.id} onClick={() => handleReadNotif(n.id)} className={`w-full p-4 text-right border-b last:border-b-0 border-slate-100 dark:border-slate-800/70 transition-colors ${!n.is_read ? 'bg-sky-50/80 dark:bg-sky-900/10 hover:bg-sky-100/80' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                              <div className="flex justify-between items-start mb-1">
                                <span className={`text-xs font-bold ${!n.is_read ? 'text-slate-800 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>{n.title}</span>
                                {n.is_read ? <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <span className="w-2 h-2 mt-1 rounded-full bg-sky-500 shrink-0" />}
                              </div>
                              <p className="text-[11px] leading-5 text-slate-500 dark:text-slate-400">{n.message}</p>
                              <div className="text-[10px] text-slate-400 mt-2" dir="rtl">{formatNotificationDate(n.created_at)}</div>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  title="خروج از پورتال"
                  aria-label="خروج از پورتال"
                  className="w-10 h-10 rounded-xl dark:bg-slate-950/60 bg-slate-50 border dark:border-slate-700 border-slate-200 text-slate-500 dark:text-slate-300 flex items-center justify-center hover:border-rose-300 hover:text-rose-500 dark:hover:border-rose-500/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div className="space-y-1 max-w-2xl">
                <h1 className="text-lg sm:text-xl font-black dark:text-white text-slate-900 leading-tight">
                  پورتال خدمات، مالی و پشتیبانی ANPK
                </h1>
                <p className="text-xs sm:text-[13px] dark:text-slate-400 text-slate-600 font-medium leading-5">
                  مدیریت کیف پول، تمدید پشتیبانی SLA ۲۴/۷، پیگیری پروژه‌ها و گزارش پیامک‌ها.
                </p>
              </div>

              {/* Wallet summary: only finance information and its primary action */}
              <div className="w-full md:w-auto p-2 rounded-xl dark:bg-slate-950/60 bg-slate-50 border dark:border-slate-800 border-slate-200 flex items-center gap-2.5 shrink-0">
                <span className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Wallet className="w-4 h-4" />
                </span>
                <div className="min-w-0">
                  <span className="block text-[10px] font-bold dark:text-slate-400 text-slate-500">موجودی کیف پول</span>
                  <span className="block text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                    {walletBalance.toLocaleString('fa-IR')} <span className="text-[9px] font-bold dark:text-slate-400 text-slate-500">تومان</span>
                  </span>
                </div>
                <Link
                  href="/portal/finance/wallet"
                  className="mr-auto py-1.5 px-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-bold transition-colors text-center flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 whitespace-nowrap"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>شارژ کیف پول</span>
                </Link>
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
