'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search,
  Menu,
  X,
  Rocket,
  Cpu,
  Sparkles,
  Home,
  Layers,
  Package,
  FolderGit2,
  FileText,
  Building2,
  PhoneCall,
  Wallet,
  UserCheck
} from 'lucide-react';
import { SearchModal } from './SearchModal';
import { ThemeToggle } from './ThemeToggle';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      if (window.scrollY > 15) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Global Keyboard Shortcut: Ctrl + K / Cmd + K to open search modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K' || e.key === 'ن')) {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Dynamic Theme based on active page route
  const theme = useMemo(() => {
    if (pathname.startsWith('/products')) {
      return {
        badge: 'محصولات ANPK',
        activeNav: 'bg-gradient-to-r from-indigo-600 via-purple-600 to-brand-600 text-white shadow-lg shadow-indigo-600/30',
        logoGlow: 'from-indigo-600 via-purple-600 to-brand-500',
        logoIcon: 'text-indigo-500',
        headerBorder: 'border-indigo-500/30',
        topGlow: 'bg-indigo-500/20',
        ctaBtn: 'from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-indigo-600/30',
        badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
      };
    }
    if (pathname.startsWith('/solutions')) {
      return {
        badge: 'راهکارها',
        activeNav: 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-lg shadow-emerald-600/30',
        logoGlow: 'from-emerald-600 via-teal-500 to-cyan-500',
        logoIcon: 'text-emerald-500',
        headerBorder: 'border-emerald-500/30',
        topGlow: 'bg-emerald-500/20',
        ctaBtn: 'from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-600/30',
        badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      };
    }
    if (pathname.startsWith('/projects')) {
      return {
        badge: 'پروژه‌ها',
        activeNav: 'bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 text-white shadow-lg shadow-sky-600/30',
        logoGlow: 'from-sky-600 via-blue-500 to-indigo-500',
        logoIcon: 'text-sky-500',
        headerBorder: 'border-sky-500/30',
        topGlow: 'bg-sky-500/20',
        ctaBtn: 'from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 shadow-sky-600/30',
        badgeColor: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30',
      };
    }
    if (pathname.startsWith('/portal')) {
      return {
        badge: 'امور مالی و پشتیبانی',
        activeNav: 'bg-gradient-to-r from-emerald-600 via-teal-600 to-brand-600 text-white shadow-lg shadow-emerald-600/30',
        logoGlow: 'from-emerald-600 via-teal-500 to-brand-500',
        logoIcon: 'text-emerald-500',
        headerBorder: 'border-emerald-500/30',
        topGlow: 'bg-emerald-500/20',
        ctaBtn: 'from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-600/30',
        badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      };
    }
    if (pathname.startsWith('/articles')) {
      return {
        badge: 'پایگاه دانش',
        activeNav: 'bg-gradient-to-r from-amber-600 via-orange-600 to-yellow-600 text-white shadow-lg shadow-amber-600/30',
        logoGlow: 'from-amber-600 via-orange-500 to-yellow-500',
        logoIcon: 'text-amber-500',
        headerBorder: 'border-amber-500/30',
        topGlow: 'bg-amber-500/20',
        ctaBtn: 'from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-amber-600/30',
        badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
      };
    }
    if (pathname.startsWith('/start-project')) {
      return {
        badge: 'ثبت درخواست',
        activeNav: 'bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 text-white shadow-lg shadow-rose-600/30',
        logoGlow: 'from-rose-600 via-pink-500 to-purple-500',
        logoIcon: 'text-rose-500',
        headerBorder: 'border-rose-500/30',
        topGlow: 'bg-rose-500/20',
        ctaBtn: 'from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 shadow-rose-600/30',
        badgeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
      };
    }
    if (pathname.startsWith('/about')) {
      return {
        badge: 'شناسنامه ANPK',
        activeNav: 'bg-gradient-to-r from-cyan-600 via-brand-600 to-indigo-600 text-white shadow-lg shadow-cyan-600/30',
        logoGlow: 'from-cyan-600 via-brand-500 to-indigo-500',
        logoIcon: 'text-cyan-500',
        headerBorder: 'border-cyan-500/30',
        topGlow: 'bg-cyan-500/20',
        ctaBtn: 'from-cyan-600 to-brand-600 hover:from-cyan-500 hover:to-brand-500 shadow-cyan-600/30',
        badgeColor: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
      };
    }
    if (pathname.startsWith('/contact')) {
      return {
        badge: 'تماس و پشتیبانی',
        activeNav: 'bg-gradient-to-r from-teal-600 via-emerald-600 to-sky-600 text-white shadow-lg shadow-teal-600/30',
        logoGlow: 'from-teal-600 via-emerald-500 to-sky-500',
        logoIcon: 'text-teal-500',
        headerBorder: 'border-teal-500/30',
        topGlow: 'bg-teal-500/20',
        ctaBtn: 'from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 shadow-teal-600/30',
        badgeColor: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/30',
      };
    }

    // Default Homepage Theme
    return {
      badge: 'کویر',
      activeNav: 'bg-gradient-to-r from-brand-600 via-brand-500 to-accent-600 text-white shadow-lg shadow-brand-600/30',
      logoGlow: 'from-brand-600 via-brand-500 to-accent-500',
      logoIcon: 'text-brand-500',
      headerBorder: 'dark:border-slate-800/90 border-slate-200',
      topGlow: 'bg-brand-500/15',
      ctaBtn: 'from-brand-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 shadow-brand-600/30',
      badgeColor: 'bg-brand-500/10 text-brand-600 dark:text-brand-300 border-brand-500/30',
    };
  }, [pathname]);

  const navLinks = [
    { href: '/', label: 'صفحه اصلی', icon: Home },
    { href: '/solutions', label: 'راهکارها', icon: Layers },
    { href: '/products', label: 'محصولات', icon: Package },
    { href: '/projects', label: 'پروژه‌ها', icon: FolderGit2 },
    { href: '/articles', label: 'مقالات', icon: FileText },
    { href: '/about', label: 'درباره ما', icon: Building2 },
    { href: '/contact', label: 'تماس', icon: PhoneCall },
  ];

  return (
    <>
      <header
        className={`fixed top-0 right-0 left-0 z-40 transition-all duration-300 ${
          isScrolled
            ? `py-2.5 dark:bg-slate-950/85 bg-white/85 backdrop-blur-xl border-b ${theme.headerBorder} shadow-lg`
            : 'py-4 bg-transparent'
        }`}
      >
        {/* Dynamic Top Glow Ambient Light */}
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 rounded-full ${theme.topGlow} blur-sm pointer-events-none transition-all duration-500`} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between relative z-10">
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className={`w-9 h-9 rounded-2xl bg-gradient-to-tr ${theme.logoGlow} p-0.5 shadow-md group-hover:scale-105 transition-all duration-300`}>
              <div className="w-full h-full dark:bg-slate-950 bg-white rounded-[13px] flex items-center justify-center">
                <Cpu className={`w-4.5 h-4.5 ${theme.logoIcon} group-hover:rotate-12 transition-transform duration-300`} />
              </div>
            </div>
            <div>
              <span className="text-xs sm:text-base font-black tracking-tight dark:text-white text-slate-900 block">
                ارشیا نگین پردازش
              </span>
              <span className="hidden sm:block text-[9px] dark:text-slate-400 text-slate-500 font-sans tracking-wider font-semibold">
                Arshia Negin Pardazesh Kavir
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links with Route Theme Styling */}
          <nav className="hidden lg:flex items-center gap-1 p-1 rounded-full dark:bg-slate-900/80 bg-slate-100/90 border dark:border-slate-800/90 border-slate-200/90 backdrop-blur-md shadow-inner">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              const IconComp = link.icon;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 h-8 rounded-full transition-all duration-300 whitespace-nowrap ${
                    isActive
                      ? `${theme.activeNav} px-3.5 font-black text-xs tracking-tight shadow-md`
                      : 'px-3 text-xs font-bold dark:text-slate-300 text-slate-700 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-800/70'
                  }`}
                >
                  {isActive && <IconComp className="w-3.5 h-3.5 text-white animate-pulse shrink-0" />}
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Customer Portal Control */}
            <Link
              href="/portal"
              className={`hidden sm:flex items-center justify-center gap-1.5 h-8 px-3.5 rounded-full border transition-all text-xs font-bold whitespace-nowrap ${
                pathname.startsWith('/portal')
                  ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20'
                  : 'dark:bg-slate-900/80 bg-slate-100/90 dark:border-slate-800 border-slate-200 dark:text-slate-300 text-slate-700 hover:text-emerald-500'
              }`}
              title="پورتال مشتریان"
            >
              <UserCheck className={`w-3.5 h-3.5 shrink-0 ${pathname.startsWith('/portal') ? 'text-white' : 'text-emerald-500 dark:text-emerald-400'}`} />
              <span>پورتال مشتریان</span>
            </Link>

            {/* Quick Search Button */}
            <button
              onClick={() => setSearchModalOpen(true)}
              className="w-8 h-8 rounded-full dark:bg-slate-900/80 bg-slate-100/90 border dark:border-slate-800 border-slate-200/90 text-slate-700 dark:text-slate-300 hover:text-brand-500 transition-all flex items-center justify-center group"
              aria-label="جستجو در سایت"
              title="جستجوی سریع (Ctrl+K)"
            >
              <Search className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </button>

            {/* Theme Toggle Button */}
            <ThemeToggle />

            {/* Start Project CTA Button */}
            <Link
              href="/start-project"
              className={`hidden md:flex items-center gap-1.5 h-9 px-4 rounded-full bg-gradient-to-r text-white text-xs font-black shadow-md transition-all hover:-translate-y-0.5 ${theme.ctaBtn}`}
            >
              <Rocket className="w-3.5 h-3.5" />
              <span>شروع پروژه</span>
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-8 h-8 rounded-full dark:bg-slate-900 bg-slate-100 border dark:border-slate-800 border-slate-200 dark:text-slate-300 text-slate-700 flex items-center justify-center"
              aria-label="منوی موبایل"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Off-canvas Side Navigation Drawer (RTL Right-to-Left Slide) */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            {/* Backdrop Blur Overlay */}
            <div
              className="fixed inset-0 bg-slate-950/75 backdrop-blur-md transition-opacity animate-fade-in"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Off-canvas Side Panel Sliding strictly from Right (RTL) */}
            <div className="fixed inset-y-0 right-0 left-auto w-4/5 max-w-xs h-full dark:bg-slate-950 bg-white border-l dark:border-slate-800 border-slate-200 p-6 space-y-6 shadow-2xl z-50 flex flex-col justify-between overflow-y-auto text-right animate-slide-in-right dir-rtl">
              <div className="space-y-6">
                {/* Header inside Drawer */}
                <div className="flex items-center justify-between border-b dark:border-slate-800 border-slate-200 pb-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${theme.logoGlow} p-0.5 shadow-md`}>
                      <div className="w-full h-full dark:bg-slate-950 bg-white rounded-[10px] flex items-center justify-center">
                        <Cpu className={`w-4 h-4 ${theme.logoIcon}`} />
                      </div>
                    </div>
                    <div>
                      <span className="text-sm font-black dark:text-white text-slate-900 block">
                        ارشیا نگین پردازش
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-xl dark:bg-slate-900 bg-slate-100 dark:text-slate-300 text-slate-700 hover:text-white transition-colors"
                    aria-label="بستن منو"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Quick Portal & Search Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/portal"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`py-2.5 px-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all ${
                      pathname.startsWith('/portal')
                        ? 'bg-emerald-500 text-white border-emerald-500 font-black'
                        : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    <UserCheck className={`w-4 h-4 ${pathname.startsWith('/portal') ? 'text-white' : 'text-emerald-500'}`} />
                    <span>پورتال</span>
                  </Link>

                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setSearchModalOpen(true);
                    }}
                    className="py-2.5 px-3 rounded-2xl dark:bg-slate-900 bg-slate-100 border dark:border-slate-800 border-slate-300 dark:text-slate-300 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Search className="w-4 h-4 text-brand-500" />
                    <span>جستجو</span>
                  </button>
                </div>

                {/* Navigation Links */}
                <nav className="flex flex-col gap-1">
                  {navLinks.map((link) => {
                    const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                    const IconComp = link.icon;

                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 p-3 rounded-2xl text-xs transition-all ${
                          isActive
                            ? `${theme.activeNav} font-black text-xs sm:text-sm shadow-md`
                            : 'font-bold dark:text-slate-300 text-slate-700 hover:bg-slate-200 dark:hover:bg-slate-900'
                        }`}
                      >
                        <IconComp className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span>{link.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Start Project CTA Button at bottom of Drawer */}
              <div className="pt-4 border-t dark:border-slate-800 border-slate-200 space-y-3">
                <Link
                  href="/start-project"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`w-full py-3.5 rounded-2xl bg-gradient-to-r text-white text-xs font-black shadow-lg flex items-center justify-center gap-2 ${theme.ctaBtn}`}
                >
                  <Rocket className="w-4 h-4" />
                  <span>درخواست مشاوره و شروع پروژه</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Global Quick Search Modal */}
      <SearchModal isOpen={searchModalOpen} onClose={() => setSearchModalOpen(false)} />
    </>
  );
}
