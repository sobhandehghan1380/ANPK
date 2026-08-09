import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Layers, CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react';
import { getSolutions } from '@/lib/data';
import { ScrollReveal } from '@/components/ScrollReveal';
import { TiltCard } from '@/components/TiltCard';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'راهکارهای نرم‌افزاری و تخصصی | ارشیا نگین پردازش کویر',
  description: 'فهرست ۹ راهکار تخصصی نرم‌افزاری شامل سلامت دیجیتال، CMMS، هوش مصنوعی، آزمایشگاه، کلینیک و کلاس مجازی.',
};

export default async function SolutionsListPage() {
  const solutions = await getSolutions();

  const faNumbers = ['۰۱', '۰۲', '۰۳', '۰۴', '۰۵', '۰۶', '۰۷', '۰۸', '۰۹'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16 overflow-x-hidden">
      {/* Header */}
      <ScrollReveal variant="fade-up">
        <div className="text-center space-y-4 max-w-3xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full dark:bg-slate-900/80 bg-white/90 border dark:border-slate-700/60 border-slate-200/90 text-xs font-bold text-brand-600 dark:text-brand-400 backdrop-blur-2xl shadow-sm mx-auto">
            <Layers className="w-4 h-4 text-brand-500" />
            <span>۹ راهکار عملیاتی و تخصصی سازمان‌ها</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black dark:text-white text-slate-900 leading-tight">
            راهکارهای نرم‌افزاری <span className="gradient-text-primary">مبتنی بر مسئله</span>
          </h1>
          <p className="dark:text-slate-300 text-slate-600 text-sm sm:text-base leading-relaxed font-medium">
            هر راهکار بر اساس عارضه‌یابی واقعی صنایع و سازمان‌های ایرانی طراحی شده است تا چالش‌های عملیاتی، مالی و مدیریتی شما را مرتفع سازد.
          </p>
        </div>
      </ScrollReveal>

      {/* Solutions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {solutions.map((sol, index) => (
          <ScrollReveal key={sol.id} variant="fade-up" delay={index * 100}>
            <TiltCard className="h-full">
              <Link
                href={`/solutions/${sol.slug}`}
                className="p-7 rounded-3xl glass-card border dark:border-slate-800 border-slate-200/90 space-y-6 flex flex-col justify-between group card-elevated card-shimmer relative overflow-hidden h-full block"
              >
                {/* Top Accent Gradient Line */}
                <div className="absolute top-0 right-0 left-0 h-[3px] bg-gradient-to-r from-brand-500 via-accent-500 to-sky-500 opacity-60 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="space-y-5 relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="w-9 h-9 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/30 flex items-center justify-center font-bold text-sm">
                      {faNumbers[index] || index + 1}
                    </span>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 font-bold">
                      آماده استقرار
                    </span>
                  </div>

                  <div>
                    <h2 className="text-xl font-bold dark:text-white text-slate-900 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors leading-tight">
                      {sol.title}
                    </h2>
                    <p className="text-xs dark:text-slate-400 text-slate-600 leading-relaxed font-medium mt-2 line-clamp-2">{sol.subtitle}</p>
                  </div>

                  {/* Problem snippet card */}
                  <div className="p-3.5 dark:bg-slate-900/90 bg-slate-100/90 rounded-2xl border dark:border-slate-800 border-slate-200 text-xs space-y-1">
                    <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 text-[11px]">
                      <ShieldAlert className="w-3.5 h-3.5" /> چالش سازمان:
                    </span>
                    <p className="line-clamp-2 dark:text-slate-400 text-slate-600 leading-relaxed font-medium text-[11px]">{sol.problemStatement}</p>
                  </div>
                </div>

                <div className="pt-4 border-t dark:border-slate-800/80 border-slate-200 flex items-center justify-between text-xs font-bold text-brand-600 dark:text-brand-400 group-hover:text-brand-500 relative z-10">
                  <span>بررسی قبل/بعد، قابلیت‌ها و گردش‌کار</span>
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1.5 transition-transform" />
                </div>
              </Link>
            </TiltCard>
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
}
