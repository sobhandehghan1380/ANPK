'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Layers,
  Users,
  FolderGit2,
  FolderOpen,
  Wallet,
  MessageSquare,
  PackageCheck,
  Server,
  Send,
  BookOpen,
  Cpu,
  UserCheck,
  BarChart3,
  Settings,
  ShieldCheck,
  Sparkles,
  Search,
  ChevronLeft,
  Activity,
  LogOut,
  User as UserIcon,
  Globe,
  CheckCircle2,
  FileText,
  Banknote,
} from 'lucide-react';


export default function CategorizedAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [adminUser, setAdminUser] = useState<any>(null);

  // Auth guard — redirect to login if no token
  useEffect(() => {
    if (pathname === '/admin/login') return;
    const token = localStorage.getItem('anpk_admin_token');
    if (!token) {
      router.replace('/admin/login');
      return;
    }
    const user = localStorage.getItem('anpk_admin_user');
    if (user) setAdminUser(JSON.parse(user));
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem('anpk_admin_token');
    localStorage.removeItem('anpk_admin_refresh');
    localStorage.removeItem('anpk_admin_user');
    router.replace('/admin/login');
  };

  // Skip layout for login page
  if (pathname === '/admin/login') return <>{children}</>;

  // Categorized Admin Sidebar Groups
  const menuGroups = [
    {
      groupTitle: 'پایش اصلی',
      items: [
        { href: '/admin', label: 'داشبورد مانیتورینگ', icon: Layers },
        { href: '/admin/users', label: 'مدیریت کاربران', icon: UserCheck },
      ]
    },
    {
      groupTitle: 'هاب‌های مدیریتی (Core Hubs)',
      items: [
        { href: '/admin/crm/leads', label: 'مدیریت مشتریان (CRM)', icon: Users },
        { href: '/admin/finance/invoices', label: 'امور مالی و حسابداری', icon: Banknote },
        { href: '/admin/projects/board', label: 'پروژه‌ها و پشتیبانی', icon: FolderGit2 },
        { href: '/admin/content/articles', label: 'محتوا و کاتالوگ', icon: BookOpen },
        { href: '/admin/system/site-settings', label: 'تنظیمات و زیرساخت', icon: Settings },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 print:bg-white print:text-black font-vazir text-right relative overflow-x-hidden selection:bg-brand-500 selection:text-white dir-rtl">
      {/* Dynamic Glow Background Lights */}
      <div className="fixed top-0 right-1/4 w-[500px] h-[500px] bg-brand-600/10 rounded-full blur-[140px] pointer-events-none z-0 print:hidden"></div>
      <div className="fixed bottom-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none z-0 print:hidden"></div>

      {/* TOP HIGH-TECH NAVBAR */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 shadow-md print:hidden">
        <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 p-0.5 shadow-md">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-brand-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black tracking-tight text-white">ANPK Enterprise Admin Suite</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Django REST Active
                </span>
              </div>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2">
            <Link
              href="/portal"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] font-bold text-slate-300 hover:text-white transition-all"
            >
              <Globe className="w-3.5 h-3.5 text-brand-400" />
              <span>پورتال کارفرما</span>
            </Link>

            <Link
              href="/"
              className="px-3 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-[11px] font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>صفحه اصلی سایت</span>
            </Link>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-6 py-4 relative z-10 print:p-0 print:m-0 print:max-w-none">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start print:block print:gap-0">
          {/* CATEGORIZED SIDEBAR NAVIGATION */}
          <aside className={`hidden lg:block print:hidden ${sidebarCollapsed ? 'lg:col-span-1' : 'lg:col-span-4 xl:col-span-3'} space-y-3 sticky top-16 transition-all duration-300`}>
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800/90 backdrop-blur-xl space-y-4 shadow-xl">
              <div className="px-2 py-1 flex items-center justify-between border-b border-slate-800/80 pb-2">
                {!sidebarCollapsed && (
                  <span className="text-xs font-black text-slate-300 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-brand-400" />
                    ماژول‌های ارشد سیستم:
                  </span>
                )}
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${sidebarCollapsed ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {!sidebarCollapsed && (
                <div className="relative px-0.5">
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="جستجوی سریع در ماژول‌ها..."
                    className="w-full pl-3 pr-9 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 font-medium"
                  />
                </div>
              )}

              {/* Categorized Menu Groups */}
              <div className="space-y-4">
                {menuGroups.map((group, gIdx) => {
                  const filteredItems = group.items.filter(i => i.label.includes(searchQuery));
                  if (filteredItems.length === 0) return null;

                  return (
                    <div key={gIdx} className="space-y-1">
                      {!sidebarCollapsed && (
                        <div className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {group.groupTitle}
                        </div>
                      )}

                      <div className="space-y-1">
                        {filteredItems.map((item) => {
                          const isActive = pathname === item.href;
                          const IconComp = item.icon;

                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all text-xs sm:text-sm font-bold ${
                                isActive
                                  ? 'bg-brand-500 text-white shadow-md font-black'
                                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 truncate">
                                <IconComp className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-brand-400'}`} />
                                {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Admin User Info + Logout */}
            <div className="p-3 border-t dark:border-slate-800 border-slate-200 mt-2 space-y-2">
              {adminUser && !sidebarCollapsed && (
                <div className="p-3 rounded-2xl bg-slate-800/50 border border-slate-800 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-brand-500/20 flex items-center justify-center">
                      <UserIcon className="w-3 h-3 text-brand-400" />
                    </div>
                    <span className="text-xs font-black text-white truncate">{adminUser.username}</span>
                    {adminUser.is_superuser && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold">Super</span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 pr-8">{adminUser.email || 'ادمین سیستم'}</p>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white text-xs font-bold transition-all duration-200 border border-rose-500/20"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                {!sidebarCollapsed && <span>خروج از پنل</span>}
              </button>
            </div>
          </aside>

          {/* MAIN ADMIN PAGE CONTENT */}
          <main className={`${sidebarCollapsed ? 'lg:col-span-11' : 'lg:col-span-8 xl:col-span-9'} space-y-4 transition-all duration-300 print:block print:w-full print:m-0 print:p-0`}>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
