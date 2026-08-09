'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Rocket, Sparkles, ArrowLeft, Cpu, Shield, Zap, Activity, CheckCircle2 } from 'lucide-react';
import { AnimatedCounter } from './AnimatedCounter';

export function HomepageHeroSpotlight() {
  const [activeTab, setActiveTab] = useState<'ai' | 'cmms' | 'health'>('cmms');

  return (
    <div className="relative pt-8 pb-16 md:pt-16 md:pb-24 overflow-hidden">
      {/* Background Radial Glow Spheres */}
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-brand-500/20 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-10 left-1/4 w-[500px] h-[500px] bg-accent-500/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        {/* Top Operational Status Ping Badge */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full dark:bg-slate-900/90 bg-white/90 border dark:border-slate-800 border-slate-200 text-xs font-bold dark:text-slate-200 text-slate-800 backdrop-blur-xl shadow-xl hover:scale-105 transition-transform">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <Sparkles className="w-4 h-4 text-accent-500 animate-spin-slow" />
            <span>معماری بومی ریزسرویس • تحویل کامل سورس‌کد و داکیومنت‌ها</span>
          </div>
        </div>

        {/* Main Headline & Slogan */}
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black dark:text-white text-slate-900 leading-tight tracking-tight">
            توسعه سامانه‌های اختصاصی،{' '}
            <span className="gradient-text-primary">هوش مصنوعی</span> و{' '}
            <span className="gradient-text-accent">سلامت دیجیتال</span>
          </h1>

          <p className="text-base sm:text-lg dark:text-slate-300 text-slate-600 leading-relaxed font-medium max-w-2xl mx-auto">
            شرکت «ارشیا نگین پردازش کویر» با پلتفرم‌های مایکروپروسس بومی، پیچیده‌ترین اتوماسیون‌های سازمانی، بیمارستانی و صنعتی کشور را با بالاترین استانداردهای امنیت داده اجرا می‌کند.
          </p>

          {/* Dynamic Interactive Node Selector */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {[
              { id: 'cmms', label: 'تأسیسات نگار (CMMS)', desc: 'پایش کدهای QR و دستورکار PM' },
              { id: 'health', label: 'سلامت دیجیتال (EHR/LIS)', desc: 'انطباق با استاندارد HL7' },
              { id: 'ai', label: 'هوش مصنوعی & OCR', desc: 'موتور بینایی بیناسازی اسناد' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                  activeTab === tab.id
                    ? 'bg-brand-600 text-white border-brand-500 shadow-lg shadow-brand-600/30'
                    : 'dark:bg-slate-900/60 bg-white dark:text-slate-400 text-slate-700 border-slate-200 dark:border-slate-800 hover:border-brand-500/40'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/start-project"
              className="w-full sm:w-auto px-9 py-4 rounded-2xl bg-gradient-to-r from-brand-600 via-brand-500 to-accent-600 hover:from-brand-500 hover:to-accent-500 text-white font-black text-base shadow-2xl shadow-brand-600/35 hover:shadow-brand-600/50 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 group"
            >
              <Rocket className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span>ثبت درخواست پروژه (فرم ۴ مرحله‌ای)</span>
            </Link>

            <Link
              href="/products/aira"
              className="w-full sm:w-auto px-7 py-4 rounded-2xl dark:bg-slate-900/90 bg-white hover:bg-slate-100 dark:hover:bg-slate-800 border dark:border-slate-800 border-slate-200 dark:text-slate-200 text-slate-800 font-bold text-base transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 shadow-sm"
            >
              <span>مشاهده دموی آیرا</span>
              <ArrowLeft className="w-4 h-4 text-slate-500" />
            </Link>
          </div>
        </div>

        {/* Hero Interactive Live Dashboard Preview Box */}
        <div className="relative rounded-3xl dark:bg-slate-950/80 bg-white/80 border dark:border-slate-800 border-slate-200 p-6 sm:p-8 backdrop-blur-xl shadow-2xl overflow-hidden max-w-5xl mx-auto">
          {/* Top Bar Controls */}
          <div className="flex items-center justify-between border-b dark:border-slate-800 border-slate-200 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="text-xs font-mono dark:text-slate-400 text-slate-500 ml-2">
                anpk.ir/dashboard/{activeTab}
              </span>
            </div>

            <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" /> وضعیت: ۱۰۰٪ آنلاین
            </span>
          </div>

          {/* Dynamic Content Preview Based on Selected Tab */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-right">
            {activeTab === 'cmms' && (
              <>
                <div className="p-4 rounded-2xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-800 border-slate-200 space-y-2">
                  <span className="text-xs font-bold text-brand-500 block">پایش تجهیزات صنعتی</span>
                  <div className="text-2xl font-black dark:text-white text-slate-900 font-mono">
                    <AnimatedCounter end={1420} suffix=" کد QR" />
                  </div>
                  <p className="text-[11px] dark:text-slate-400 text-slate-600">ثبت‌شده در موتور تأسیسات نگار</p>
                </div>
                <div className="p-4 rounded-2xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-800 border-slate-200 space-y-2">
                  <span className="text-xs font-bold text-emerald-500 block">دستورکارهای PM اجرا شده</span>
                  <div className="text-2xl font-black dark:text-white text-slate-900 font-mono">
                    <AnimatedCounter end={98.4} decimals={1} suffix="٪" />
                  </div>
                  <p className="text-[11px] dark:text-slate-400 text-slate-600">انجام موفق تعمیرات پیشگیرانه</p>
                </div>
                <div className="p-4 rounded-2xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-800 border-slate-200 space-y-2">
                  <span className="text-xs font-bold text-accent-500 block">میانگین زمان رفع خرابی</span>
                  <div className="text-2xl font-black dark:text-white text-slate-900 font-mono">
                    <AnimatedCounter end={18} suffix=" دقیقه" />
                  </div>
                  <p className="text-[11px] dark:text-slate-400 text-slate-600">کاهش ۵۲٪ زمان توقف خطوط</p>
                </div>
              </>
            )}

            {activeTab === 'health' && (
              <>
                <div className="p-4 rounded-2xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-800 border-slate-200 space-y-2">
                  <span className="text-xs font-bold text-sky-500 block">پرونده الکترونیک فعال</span>
                  <div className="text-2xl font-black dark:text-white text-slate-900 font-mono">
                    <AnimatedCounter end={85000} suffix=" پرونده" />
                  </div>
                  <p className="text-[11px] dark:text-slate-400 text-slate-600">انطباق با سامانه سپاس</p>
                </div>
                <div className="p-4 rounded-2xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-800 border-slate-200 space-y-2">
                  <span className="text-xs font-bold text-emerald-500 block">آزمایش‌های LIS ارسال شده</span>
                  <div className="text-2xl font-black dark:text-white text-slate-900 font-mono">
                    <AnimatedCounter end={12400} suffix=" تست" />
                  </div>
                  <p className="text-[11px] dark:text-slate-400 text-slate-600">اتصال مستقیم به دستگاه‌ها</p>
                </div>
                <div className="p-4 rounded-2xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-800 border-slate-200 space-y-2">
                  <span className="text-xs font-bold text-amber-500 block">سرعت فراخوانی آزمایشگاه</span>
                  <div className="text-2xl font-black dark:text-white text-slate-900 font-mono">
                    <AnimatedCounter end={0.2} decimals={1} suffix=" ثانیه" />
                  </div>
                  <p className="text-[11px] dark:text-slate-400 text-slate-600">تحویل آنی پاسخ به پزشک</p>
                </div>
              </>
            )}

            {activeTab === 'ai' && (
              <>
                <div className="p-4 rounded-2xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-800 border-slate-200 space-y-2">
                  <span className="text-xs font-bold text-amber-500 block">دقت موتور OCR فارسی</span>
                  <div className="text-2xl font-black dark:text-white text-slate-900 font-mono">
                    <AnimatedCounter end={99.1} decimals={1} suffix="٪" />
                  </div>
                  <p className="text-[11px] dark:text-slate-400 text-slate-600">استخراج داده از اسناد دست‌نویس</p>
                </div>
                <div className="p-4 rounded-2xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-800 border-slate-200 space-y-2">
                  <span className="text-xs font-bold text-brand-500 block">سرعت پردازش اسناد</span>
                  <div className="text-2xl font-black dark:text-white text-slate-900 font-mono">
                    <AnimatedCounter end={500} suffix=" صفحه/دقیقه" />
                  </div>
                  <p className="text-[11px] dark:text-slate-400 text-slate-600">پردازش موازی پردازنده گرافیگی</p>
                </div>
                <div className="p-4 rounded-2xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-800 border-slate-200 space-y-2">
                  <span className="text-xs font-bold text-emerald-500 block">صرفه‌جویی زمان اپراتورها</span>
                  <div className="text-2xl font-black dark:text-white text-slate-900 font-mono">
                    <AnimatedCounter end={80} suffix="٪" />
                  </div>
                  <p className="text-[11px] dark:text-slate-400 text-slate-600">حذف کامل ورود دستی داده‌ها</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
