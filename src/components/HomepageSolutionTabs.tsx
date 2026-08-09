'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, ShieldAlert, Sparkles, Activity, Wrench, GraduationCap, Bot, Laptop, Layers } from 'lucide-react';

interface SolutionItem {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  problemStatement: string;
  beforeAfter: { before: string; after: string };
  capabilities: string[];
}

export function HomepageSolutionTabs({ solutions }: { solutions: SolutionItem[] }) {
  const [activeSlug, setActiveSlug] = useState(solutions[0]?.slug || 'digital-health');

  const activeSolution = solutions.find((s) => s.slug === activeSlug) || solutions[0];

  const domainIcons: Record<string, any> = {
    'digital-health': Activity,
    'cmms-facility': Wrench,
    'virtual-classroom': GraduationCap,
    'process-automation-ai': Bot,
    'custom-platforms': Laptop,
    'management-dashboards': Layers,
  };

  return (
    <div className="space-y-8">
      {/* Category Tabs Switcher Bar */}
      <div className="flex flex-wrap items-center justify-center gap-2 p-2 dark:bg-slate-900 bg-white rounded-2xl border dark:border-slate-800 border-slate-200 shadow-sm max-w-4xl mx-auto">
        {solutions.slice(0, 6).map((sol) => {
          const Icon = domainIcons[sol.slug] || Layers;
          const isActive = activeSlug === sol.slug;
          return (
            <button
              key={sol.slug}
              onClick={() => setActiveSlug(sol.slug)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-brand-600 to-accent-600 text-white shadow-lg shadow-brand-600/25 scale-105'
                  : 'dark:text-slate-400 text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{sol.title.split(' ')[0]} {sol.title.split(' ')[1]}</span>
            </button>
          );
        })}
      </div>

      {/* Active Solution Showcase Card */}
      {activeSolution && (
        <div className="p-8 sm:p-10 rounded-3xl glass-card border border-slate-800 space-y-8 animate-fadeIn">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b dark:border-slate-800 border-slate-200 pb-6">
            <div className="space-y-1">
              <span className="text-xs font-bold text-brand-500 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                راهکار منتخب
              </span>
              <h3 className="text-2xl sm:text-3xl font-black dark:text-white text-slate-900">
                {activeSolution.title}
              </h3>
              <p className="text-xs sm:text-sm dark:text-slate-300 text-slate-600 leading-relaxed font-medium">
                {activeSolution.subtitle}
              </p>
            </div>

            <Link
              href={`/solutions/${activeSolution.slug}`}
              className="px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg flex items-center gap-2 shrink-0 self-start md:self-auto"
            >
              <span>جزئیات کامل این راهکار</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>

          {/* Before & After Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/30 space-y-2">
              <span className="text-xs font-bold text-red-500 block">قبل از پیاده‌سازی (چالش‌ها):</span>
              <p className="text-xs dark:text-red-200 text-red-800 leading-relaxed font-medium">
                {activeSolution.beforeAfter?.before}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
              <span className="text-xs font-bold text-emerald-500 block">بعد از پیاده‌سازی (نتایج):</span>
              <p className="text-xs dark:text-emerald-200 text-emerald-800 leading-relaxed font-medium">
                {activeSolution.beforeAfter?.after}
              </p>
            </div>
          </div>

          {/* Key Capabilities Pills */}
          <div className="space-y-3">
            <span className="text-xs font-bold dark:text-slate-300 text-slate-800 block">قابلیت‌های برجسته:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeSolution.capabilities?.slice(0, 4).map((cap, idx) => (
                <div key={idx} className="p-3.5 rounded-xl dark:bg-slate-900/80 bg-slate-50 border dark:border-slate-800 border-slate-200 flex items-center gap-2.5 text-xs font-medium dark:text-slate-200 text-slate-800 shadow-sm">
                  <CheckCircle2 className="w-4 h-4 text-accent-500 shrink-0" />
                  <span>{cap}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
