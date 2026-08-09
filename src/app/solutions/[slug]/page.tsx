import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSolutionBySlug } from '@/lib/data';
import { ArrowLeft, CheckCircle2, Layers, Rocket, ShieldCheck, Sparkles, ExternalLink, Activity, Building2, ChevronDown } from 'lucide-react';
import { ScrollReveal } from '@/components/ScrollReveal';
import { TiltCard } from '@/components/TiltCard';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const solution = await getSolutionBySlug(params.slug);
  if (!solution) return { title: 'راهکار تخصصی یافت نشد | ANPK' };
  return {
    title: `${solution.title || 'راهکار تخصصی'} | ارشیا نگین پردازش`,
    description: solution.summary || 'راهکارهای تخصصی هوشمندسازی سازمانی ANPK',
  };
}

export default async function SolutionDetailPage({ params }: { params: { slug: string } }) {
  const solution = await getSolutionBySlug(params.slug);

  if (!solution) {
    notFound();
  }

  const beforeText = solution?.beforeAfter?.before || 'توقف‌های ناخواسته، اتلاف زمان در فرآیندهای سنتی و ثبت دستی اطلاعات.';
  const afterText = solution?.beforeAfter?.after || 'استقرار مانیتورینگ آنلاین، پایداری ۹۹.۹٪ و اتوماسیون کامل فرایندهای سازمانی.';
  const problemText = solution?.problemStatement || solution?.summary || 'چالش‌های نگهداشت، پایش آنلاین تجهیزات و دیجیتال‌سازی اسناد.';
  const capabilities = Array.isArray(solution?.capabilities) && solution.capabilities.length > 0
    ? solution.capabilities
    : (Array.isArray(solution?.key_benefits) ? solution.key_benefits : ['پایش آنلاین ۲۴/۷', 'هشدار پیامکی SMS', 'گزارش‌دهی هوشمند BI']);
  const faqList = Array.isArray(solution?.faq) ? solution.faq : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20 overflow-x-hidden text-right">
      {/* HERO / OVERVIEW */}
      <section className="space-y-8 relative">
        <ScrollReveal variant="fade-down">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full dark:bg-slate-900/80 bg-white/90 border dark:border-slate-700/60 border-slate-200/90 text-xs font-bold text-brand-500 backdrop-blur-2xl shadow-sm">
            <ShieldCheck className="w-4 h-4 text-brand-500" />
            <span>راهکار تخصصی صنعت & کلود</span>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          <div className="lg:col-span-2 space-y-6">
            <ScrollReveal variant="fade-up" delay={100}>
              <h1 className="text-3xl sm:text-5xl font-black dark:text-white text-slate-900 leading-tight">
                {solution.title}
              </h1>
            </ScrollReveal>

            <ScrollReveal variant="fade-up" delay={200}>
              <p className="text-base sm:text-lg dark:text-slate-300 text-slate-600 leading-relaxed font-medium">
                {solution.summary}
              </p>
            </ScrollReveal>

            <ScrollReveal variant="fade-up" delay={300}>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link
                  href="/start-project"
                  className="gradient-border px-7 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 text-white font-bold text-sm shadow-xl shadow-brand-600/20 hover:shadow-brand-600/35 transition-all flex items-center justify-center gap-2 group"
                >
                  <Rocket className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                  <span>درخواست پیاده‌سازی این راهکار</span>
                </Link>

                <a
                  href="#problem-solution"
                  className="px-7 py-3.5 rounded-2xl dark:bg-slate-900/80 bg-white border dark:border-slate-700 border-slate-300 dark:text-slate-200 text-slate-800 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>بررسی تحلیل عارضه & بعد از اجرا</span>
                  <ArrowLeft className="w-4 h-4" />
                </a>
              </div>
            </ScrollReveal>
          </div>

          {/* Side Highlights Card */}
          <ScrollReveal variant="fade-left" delay={250}>
            <div className="p-7 rounded-3xl glass-card border dark:border-slate-800 border-slate-200/90 space-y-6 card-elevated">
              <h3 className="text-base font-bold dark:text-white text-slate-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-500" />
                <span>دستاورد و شاخص کلیدی</span>
              </h3>
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 space-y-1">
                <span className="text-2xl font-black block">{solution.subtitle || 'پایداری ۹۹.۹٪'}</span>
                <span className="text-xs font-bold block">تحویل همراه با لایسنس و پشتیبانی SLA</span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 1. PROBLEM & COMPARISON */}
      <section id="problem-solution" className="space-y-6">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-500 uppercase tracking-widest">
          <Activity className="w-4 h-4" />
          <span>تحلیل مسئله و تغییر بعد از پیاده‌سازی</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Problem Statement Card */}
          <ScrollReveal variant="fade-up" delay={100} className="lg:col-span-1">
            <TiltCard className="h-full">
              <div className="p-7 rounded-3xl glass-card border border-amber-500/30 space-y-4 card-elevated h-full">
                <h3 className="text-lg font-bold dark:text-white text-slate-900 flex items-center gap-2">
                  <span>مسئله و عارضه اصلی سازمان</span>
                </h3>
                <p className="text-xs sm:text-sm dark:text-slate-300 text-slate-600 leading-relaxed font-medium">
                  {problemText}
                </p>
              </div>
            </TiltCard>
          </ScrollReveal>

          {/* Before & After Comparison Card */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Before */}
            <ScrollReveal variant="fade-up" delay={200}>
              <div className="p-6 rounded-3xl dark:bg-red-950/20 bg-red-50/80 border border-red-500/30 space-y-3 h-full shadow-sm">
                <span className="px-3 py-1 bg-red-500/20 text-red-600 dark:text-red-400 rounded-full text-xs font-bold border border-red-500/30 inline-block">
                  وضعیت سنتی قبل از اجرا
                </span>
                <p className="text-xs sm:text-sm dark:text-red-300 text-red-900 leading-relaxed font-medium">
                  {beforeText}
                </p>
              </div>
            </ScrollReveal>

            {/* After */}
            <ScrollReveal variant="fade-up" delay={300}>
              <div className="p-6 rounded-3xl dark:bg-emerald-950/20 bg-emerald-50/80 border border-emerald-500/30 space-y-3 h-full shadow-sm">
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-bold border border-emerald-500/30 inline-block">
                  وضعیت نوین بعد از پیاده‌سازی
                </span>
                <p className="text-xs sm:text-sm dark:text-emerald-300 text-emerald-900 leading-relaxed font-medium">
                  {afterText}
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* 2. CAPABILITIES */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 text-xs font-bold text-brand-400 uppercase tracking-widest">
          <Sparkles className="w-4 h-4" />
          <span>قابلیت‌ها و ویژگی‌های کلیدی</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {capabilities.map((cap: any, idx: number) => {
            const title = typeof cap === 'string' ? cap : cap.title;
            const desc = typeof cap === 'string' ? 'ارائه زیرساخت استاندارد با پشتیبانی فنی' : cap.description;
            return (
              <ScrollReveal key={idx} variant="fade-up" delay={idx * 100}>
                <div className="p-6 rounded-2xl glass-card border dark:border-slate-800 border-slate-200/90 space-y-2 flex items-start gap-4">
                  <div className="w-8 h-8 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center shrink-0 mt-1">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold dark:text-white text-slate-900">{title}</h4>
                    <p className="text-xs dark:text-slate-400 text-slate-600 leading-relaxed mt-1 font-medium">{desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      {/* 3. FAQ SECTION (IF ANY) */}
      {faqList.length > 0 && (
        <section className="space-y-6">
          <h3 className="text-xl font-bold dark:text-white text-slate-900">سوالات متداول راهکار</h3>
          <div className="space-y-4">
            {faqList.map((item: any, idx: number) => (
              <div key={idx} className="p-5 rounded-2xl glass-card border dark:border-slate-800 border-slate-200 space-y-2">
                <h4 className="text-sm font-bold dark:text-white text-slate-900">{item.q}</h4>
                <p className="text-xs text-slate-400 font-medium">{item.a}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
