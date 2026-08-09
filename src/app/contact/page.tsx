'use client';

import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Rocket, ShieldCheck, Sparkles, Send, CheckCircle2, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { ScrollReveal } from '@/components/ScrollReveal';
import { TiltCard } from '@/components/TiltCard';

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.message) return;
    setSent(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16 overflow-x-hidden">
      {/* Header */}
      <ScrollReveal variant="fade-up">
        <div className="text-center space-y-4 max-w-3xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full dark:bg-slate-900/80 bg-white/90 border dark:border-slate-700/60 border-slate-200/90 text-xs font-bold text-brand-600 dark:text-brand-400 backdrop-blur-2xl shadow-sm mx-auto">
            <Phone className="w-4 h-4 text-brand-500" />
            <span>ارتباط مستقیم با کارشناسان ANPK</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black dark:text-white text-slate-900 leading-tight">
            تماس با <span className="gradient-text-primary">ارشیا نگین پردازش کویر</span>
          </h1>
          <p className="dark:text-slate-300 text-slate-600 text-sm sm:text-base leading-relaxed font-medium">
            برای مشاوره فنی، دریافت دموی حضوری محصولات یا بررسی سفارش پروژه، از راه‌های زیر با ما در تماس باشید.
          </p>
        </div>
      </ScrollReveal>

      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <ScrollReveal variant="fade-up" delay={100}>
          <TiltCard className="h-full">
            <div className="p-8 rounded-3xl glass-card border dark:border-slate-800 border-slate-200/90 space-y-5 text-center card-elevated card-shimmer h-full relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 left-0 h-[3px] bg-gradient-to-r from-brand-500 to-accent-500 opacity-60" />
              <div className="space-y-4 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/30 flex items-center justify-center mx-auto shadow-sm icon-glow">
                  <Phone className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold dark:text-white text-slate-900">خطوط تماس واحد فروش و مشاوره</h3>
                <p className="text-xs dark:text-slate-400 text-slate-600 font-medium">شنبه تا چهارشنبه - ساعت ۸ الی ۱۷</p>
                <span className="block font-mono text-xl font-black text-brand-600 dark:text-brand-400">۰۳۴-۳۴۲۰۰۰۰۰</span>
              </div>
            </div>
          </TiltCard>
        </ScrollReveal>

        <ScrollReveal variant="fade-up" delay={200}>
          <TiltCard className="h-full">
            <div className="p-8 rounded-3xl glass-card border dark:border-slate-800 border-slate-200/90 space-y-5 text-center card-elevated card-shimmer h-full relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 left-0 h-[3px] bg-gradient-to-r from-accent-500 to-sky-500 opacity-60" />
              <div className="space-y-4 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-accent-500/10 text-accent-600 dark:text-accent-400 border border-accent-500/30 flex items-center justify-center mx-auto shadow-sm icon-glow">
                  <Mail className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold dark:text-white text-slate-900">پست الکترونیک رسمی</h3>
                <p className="text-xs dark:text-slate-400 text-slate-600 font-medium">ارسال RFP و نامه‌های اداری</p>
                <span className="block font-mono text-base font-bold text-accent-600 dark:text-accent-400">info@anpk.ir</span>
              </div>
            </div>
          </TiltCard>
        </ScrollReveal>

        <ScrollReveal variant="fade-up" delay={300}>
          <TiltCard className="h-full">
            <div className="p-8 rounded-3xl glass-card border dark:border-slate-800 border-slate-200/90 space-y-5 text-center card-elevated card-shimmer h-full relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 left-0 h-[3px] bg-gradient-to-r from-sky-500 to-purple-500 opacity-60" />
              <div className="space-y-4 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/30 flex items-center justify-center mx-auto shadow-sm icon-glow">
                  <MapPin className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold dark:text-white text-slate-900">نشانی ثبتی و دفتر مرکزی</h3>
                <p className="text-xs dark:text-slate-300 text-slate-600 leading-relaxed font-medium">
                  ایران، استان یزد، شهرستان یزد، محله خرمشاه، دفتر مرکزی شرکت ارشیا نگین پردازش کویر
                </p>
                <div className="pt-2 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  شناسه ملی: ۱۴۰۰۹۱۵۱۲۰۷ | ثبت: ۱۹۲۷۱
                </div>
              </div>
            </div>
          </TiltCard>
        </ScrollReveal>
      </div>

      {/* Quick Message & Map Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Quick Form */}
        <ScrollReveal variant="fade-up">
          <div className="p-8 rounded-3xl glass-card border dark:border-slate-800 border-slate-200/90 space-y-6 card-elevated">
            <div className="space-y-2">
              <span className="text-xs font-bold text-brand-600 dark:text-brand-400 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4" /> پیام سریع
              </span>
              <h2 className="text-xl sm:text-2xl font-black dark:text-white text-slate-900">ارسال پیام مستقیم به واحد کارشناسان</h2>
            </div>

            {sent ? (
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h3 className="text-base font-bold text-emerald-600 dark:text-emerald-400">پیام شما با موفقیت ثبت شد</h3>
                <p className="text-xs dark:text-slate-300 text-slate-600 font-medium">کارشناسان ANPK به زودی با شما تماس خواهند گرفت.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold dark:text-slate-300 text-slate-700 mb-1.5">نام و نام خانوادگی:</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="مثال: علی محمدی"
                    className="w-full px-4 py-3 rounded-xl dark:bg-slate-900 bg-slate-100 border dark:border-slate-800 border-slate-300 text-xs dark:text-white text-slate-900 focus:outline-none focus:border-brand-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold dark:text-slate-300 text-slate-700 mb-1.5">شماره تماس / موبایل:</label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="مثال: ۰۹۱۲۱۲۳۴۵۶۷"
                    className="w-full px-4 py-3 rounded-xl dark:bg-slate-900 bg-slate-100 border dark:border-slate-800 border-slate-300 text-xs dark:text-white text-slate-900 focus:outline-none focus:border-brand-500 font-medium dir-ltr text-right"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold dark:text-slate-300 text-slate-700 mb-1.5">متن پیام یا درخواست:</label>
                  <textarea
                    rows={4}
                    required
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="خلاصه‌ای از درخواست یا سوال خود را بنویسید..."
                    className="w-full px-4 py-3 rounded-xl dark:bg-slate-900 bg-slate-100 border dark:border-slate-800 border-slate-300 text-xs dark:text-white text-slate-900 focus:outline-none focus:border-brand-500 font-medium resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 text-white font-bold text-xs shadow-lg shadow-brand-600/30 flex items-center justify-center gap-2 group transition-all"
                >
                  <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  <span>ارسال پیام</span>
                </button>
              </form>
            )}
          </div>
        </ScrollReveal>

        {/* Location & Support Schedule */}
        <ScrollReveal variant="fade-up" delay={150}>
          <div className="p-8 rounded-3xl glass-card border dark:border-slate-800 border-slate-200/90 space-y-6 card-elevated h-full flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-xs font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> پشتیبانی و ساعات کاری
              </span>
              <h2 className="text-xl sm:text-2xl font-black dark:text-white text-slate-900">ساعات پاسخگویی واحدها</h2>
              
              <div className="space-y-3 text-xs dark:text-slate-300 text-slate-700 font-medium">
                <div className="p-3.5 rounded-xl dark:bg-slate-900 bg-slate-100 border dark:border-slate-800 border-slate-200 flex justify-between items-center">
                  <span>واحد فروش و مشاوره پروژه:</span>
                  <span className="font-bold text-brand-600 dark:text-brand-400">شنبه تا چهارشنبه (۸ الی ۱۷)</span>
                </div>
                <div className="p-3.5 rounded-xl dark:bg-slate-900 bg-slate-100 border dark:border-slate-800 border-slate-200 flex justify-between items-center">
                  <span>پشتیبانی فنی و تیکتینگ SLA:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">۲۴ ساعته (۷ روز هفته)</span>
                </div>
                <div className="p-3.5 rounded-xl dark:bg-slate-900 bg-slate-100 border dark:border-slate-800 border-slate-200 flex justify-between items-center">
                  <span>جلسات و دموی حضوری:</span>
                  <span className="font-bold text-sky-600 dark:text-sky-400">با هماهنگی قبلی</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl dark:bg-slate-900 bg-slate-100 border dark:border-slate-800 border-slate-200 space-y-2 text-center">
              <MapPin className="w-8 h-8 text-brand-500 mx-auto" />
              <h3 className="text-sm font-bold dark:text-white text-slate-900">موقعیت دفتر مرکزی شرکت</h3>
              <p className="text-xs dark:text-slate-400 text-slate-600 font-medium">رفسنجان، استان کرمان، دفتر مرکزی ANPK</p>
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* Direct Project Inquiry Route Box */}
      <ScrollReveal variant="scale">
        <div className="p-8 sm:p-12 rounded-3xl mesh-gradient-bg border dark:border-slate-800 border-slate-200 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden text-white">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-900/90 via-slate-900/95 to-slate-950/90"></div>
          <div className="space-y-2 text-right relative z-10">
            <h2 className="text-2xl font-black text-white">آیا قصد ثبت سفارش رسمی پروژه را دارید؟</h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl font-medium">
              برای ثبت سریع نیازمندی‌های صورت مسئله، زیرساخت و دریافت کدرهگیری یکتا، از فرم ۴ مرحله‌ای اختصاصی استفاده نمایید.
            </p>
          </div>

          <Link
            href="/start-project"
            className="w-full md:w-auto px-8 py-4 rounded-2xl bg-white text-brand-900 hover:bg-slate-100 font-black text-sm shadow-xl flex items-center justify-center gap-2 shrink-0 relative z-10 hover:-translate-y-0.5 transition-all group"
          >
            <Rocket className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            <span>ورود به فرم شروع پروژه</span>
          </Link>
        </div>
      </ScrollReveal>
    </div>
  );
}
