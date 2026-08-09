import React from 'react';
import { getArticles } from '@/lib/data';
import { ArticlesListClient } from '@/components/ArticlesListClient';
import { ScrollReveal } from '@/components/ScrollReveal';
import { FileText } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'مقالات و دانش فنی | ارشیا نگین پردازش',
  description: 'پایگاه دانش جامع مقالات فنی و تحلیل‌های تخصصی درباره CMMS، سلامت دیجیتال، WebRTC و هوش مصنوعی.',
};

export default async function ArticlesListPage() {
  const articles = await getArticles();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12 overflow-x-hidden">
      {/* Header */}
      <ScrollReveal variant="fade-up">
        <div className="text-center space-y-4 max-w-3xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full dark:bg-slate-900/80 bg-white/90 border dark:border-slate-700/60 border-slate-200/90 text-xs font-bold text-amber-600 dark:text-amber-400 backdrop-blur-2xl shadow-sm mx-auto">
            <FileText className="w-4 h-4 text-amber-500" />
            <span>پایگاه دانش و نشریات مهندسی ANPK</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black dark:text-white text-slate-900 leading-tight">
            مقالات و تحلیل‌های <span className="gradient-text-accent">تخصصی تکنولوژی</span>
          </h1>
          <p className="dark:text-slate-300 text-slate-600 text-sm sm:text-base leading-relaxed font-medium">
            تحلیل‌های عمیق فنی، معرفی بهترین الگوها و معماری‌های نرم‌افزاری توسط دپارتمان مهندسی ارشیا نگین پردازش کویر.
          </p>
        </div>
      </ScrollReveal>

      {/* Interactive Full-Option Articles Client */}
      <ArticlesListClient articles={articles} />
    </div>
  );
}
