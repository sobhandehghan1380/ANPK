'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Calculator, TrendingUp, Clock, ShieldCheck, ArrowLeft, Sparkles, Building2, Activity, Wrench, GraduationCap } from 'lucide-react';

export function HomepageROICalculator() {
  const [industry, setIndustry] = useState<'health' | 'facility' | 'education' | 'corporate'>('facility');
  const [orgSize, setOrgSize] = useState<number>(150); // Personnel count
  const [selectedModules, setSelectedModules] = useState<string[]>(['cmms', 'mobile']);

  const toggleModule = (id: string) => {
    if (selectedModules.includes(id)) {
      if (selectedModules.length > 1) {
        setSelectedModules(selectedModules.filter((m) => m !== id));
      }
    } else {
      setSelectedModules([...selectedModules, id]);
    }
  };

  // Dynamic ROI calculation based on inputs
  const estCostSavingsPercent = Math.min(65, Math.round(25 + selectedModules.length * 8 + (orgSize > 100 ? 10 : 5)));
  const estTimeReductionHours = Math.round(orgSize * 0.45 * (selectedModules.length * 0.5));
  const estTimelineWeeks = selectedModules.length <= 2 ? 4 : selectedModules.length === 3 ? 6 : 8;

  return (
    <div className="w-full glass-card rounded-3xl border border-brand-500/30 p-6 sm:p-10 shadow-2xl space-y-8 relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="text-center space-y-2 relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 text-brand-500 text-xs font-bold border border-brand-500/20">
          <Calculator className="w-4 h-4" />
          <span>محاسبه‌گر هوشمند ارزیابی اثرگذاری و ROI سازمان شما</span>
        </div>
        <h3 className="text-2xl sm:text-3xl font-black dark:text-white text-slate-900">
          تخمین آنی بازدهی، صرفه‌جویی و زمان استقرار
        </h3>
        <p className="text-xs sm:text-sm dark:text-slate-400 text-slate-600 max-w-xl mx-auto font-medium">
          پارامترهای سازمان خود را انتخاب کنید تا تخمین هوشمند کاهش هزینه‌ها و زمان تحویل پروژه را مشاهده نمایید.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        {/* Left Inputs Controls (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Industry Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold dark:text-slate-300 text-slate-800 block">
              ۱. نوع صنعت / سازمان شما:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'facility', label: 'صنعتی / CMMS', icon: Wrench },
                { id: 'health', label: 'بیمارستان / درمانی', icon: Activity },
                { id: 'education', label: 'دانشگاه / آموزشی', icon: GraduationCap },
                { id: 'corporate', label: 'شرکت / هلدینگ', icon: Building2 },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = industry === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setIndustry(item.id as any)}
                    className={`p-3 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center gap-1.5 ${
                      isActive
                        ? 'bg-brand-600 text-white border-brand-500 shadow-md shadow-brand-600/30'
                        : 'dark:bg-slate-900 bg-slate-50 dark:text-slate-400 text-slate-700 border-slate-200 dark:border-slate-800 hover:border-brand-500/40'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Org Size Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold dark:text-slate-300 text-slate-800">
                ۲. تعداد پرسنل / کاربران فعال سیستم:
              </label>
              <span className="font-mono font-black text-brand-500 bg-brand-500/10 px-2.5 py-0.5 rounded border border-brand-500/20">
                {orgSize} نفر
              </span>
            </div>
            <input
              type="range"
              min={20}
              max={1000}
              step={10}
              value={orgSize}
              onChange={(e) => setOrgSize(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>۲۰ نفر</span>
              <span>۵۰۰ نفر</span>
              <span>۱,۰۰۰ نفر</span>
            </div>
          </div>

          {/* Module Selector Checkboxes */}
          <div className="space-y-2">
            <label className="text-xs font-bold dark:text-slate-300 text-slate-800 block">
              ۳. ماژول‌های نیازمند پیاده‌سازی:
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {[
                { id: 'cmms', label: 'نگهداشت تأسیسات و کدهای QR' },
                { id: 'mobile', label: 'اپلیکیشن موبایل تکنسین‌ها' },
                { id: 'ai', label: 'هوش مصنوعی و OCR اسناد' },
                { id: 'bi', label: 'داشبورد مدیریتی و گزارش‌ساز BI' },
              ].map((mod) => {
                const isSelected = selectedModules.includes(mod.id);
                return (
                  <button
                    key={mod.id}
                    onClick={() => toggleModule(mod.id)}
                    className={`p-3 rounded-xl border text-right font-medium transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-accent-500/10 border-accent-500 text-accent-600 dark:text-accent-300 font-bold'
                        : 'dark:bg-slate-900 bg-slate-50 dark:text-slate-400 text-slate-700 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <span>{mod.label}</span>
                    <span
                      className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold ${
                        isSelected ? 'bg-accent-500 text-white' : 'border border-slate-400'
                      }`}
                    >
                      {isSelected && '✓'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Output Panel (5 Cols) */}
        <div className="lg:col-span-5 p-6 rounded-3xl dark:bg-slate-950/90 bg-white border dark:border-slate-800 border-slate-200 flex flex-col justify-between space-y-6 shadow-xl">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b dark:border-slate-800 border-slate-200 pb-3">
              <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                <Sparkles className="w-4 h-4" /> نتیجه تخمین آنی ANPK
              </span>
              <span className="text-[10px] text-slate-400 font-mono">بر اساس استاندارد ISO</span>
            </div>

            <div className="space-y-4 text-right">
              {/* Cost savings metric */}
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
                <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                  <span>کاهش تخمینی هزینه‌ها:</span>
                  <TrendingUp className="w-4 h-4" />
                </div>
                <span className="font-mono text-3xl font-black text-emerald-500 block">
                  {estCostSavingsPercent}٪
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  کاهش توقف تجهیزات و بهینه‌سازی منابع انسانی
                </span>
              </div>

              {/* Time saved metric */}
              <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/30 space-y-1">
                <div className="flex items-center justify-between text-xs text-sky-600 dark:text-sky-400 font-bold">
                  <span>صرفه‌جویی ماهیانه در زمان:</span>
                  <Clock className="w-4 h-4" />
                </div>
                <span className="font-mono text-3xl font-black text-sky-500 block">
                  ~ {estTimeReductionHours} ساعت
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  حذف دوباره‌کاری‌ها و اتوماسیون فرایندهای دستی
                </span>
              </div>

              {/* Timeline metric */}
              <div className="flex items-center justify-between p-3.5 rounded-xl dark:bg-slate-900 bg-slate-100 text-xs font-bold dark:text-slate-200 text-slate-800">
                <span>زمان تخمینی تحویل فاز اول:</span>
                <span className="font-mono text-brand-500 font-black">{estTimelineWeeks} هفته کاری</span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/start-project"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 text-white font-black text-xs shadow-lg flex items-center justify-center gap-2 group"
            >
              <span>دریافت پروپوزال رسمی بر اساس این تخمین</span>
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
