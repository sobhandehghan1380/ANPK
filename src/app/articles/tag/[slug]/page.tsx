import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { getArticles } from '@/lib/data';
import { ArticlesListClient } from '@/components/ArticlesListClient';
import { ScrollReveal } from '@/components/ScrollReveal';
import { Tag, ChevronRight } from 'lucide-react';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tagName = slug.replace(/-/g, ' ');
  
  return {
    title: `مقالات برچسب ${tagName} | پایگاه دانش ANPK`,
    description: `مقالات تخصصی با برچسب ${tagName} - تحلیل‌های فنی توسط مهندسان ارشیا نگین پردازش کویر`,
  };
}

export default async function TagArticlesPage({ params }: Props) {
  const { slug } = await params;
  const articles = await getArticles();
  
  // Filter articles by tag slug
  const tagArticles = articles.filter((a: any) => {
    if (!a.tags || !Array.isArray(a.tags)) return false;
    return a.tags.some((t: string) => {
      const tagSlug = t.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      return tagSlug === slug || t.toLowerCase() === slug.replace(/-/g, ' ');
    });
  });

  if (tagArticles.length === 0) {
    notFound();
  }

  const tagName = tagArticles[0]?.tags?.find((t: string) => {
    const tagSlug = t.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    return tagSlug === slug || t.toLowerCase() === slug.replace(/-/g, ' ');
  }) || slug.replace(/-/g, ' ');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10 overflow-x-hidden">
      
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-400 font-bold" aria-label="breadcrumb">
        <Link href="/" className="hover:text-brand-400 transition-colors">صفحه اصلی</Link>
        <ChevronRight className="w-3.5 h-3.5 rotate-180 shrink-0" />
        <Link href="/articles" className="hover:text-brand-400 transition-colors">مقالات</Link>
        <ChevronRight className="w-3.5 h-3.5 rotate-180 shrink-0" />
        <span className="text-brand-400">#{tagName}</span>
      </nav>

      {/* Header */}
      <ScrollReveal variant="fade-up">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full dark:bg-slate-900/80 bg-white/90 border dark:border-slate-700/60 border-slate-200/90 text-xs font-bold text-amber-600 dark:text-amber-400 backdrop-blur-2xl shadow-sm mx-auto">
            <Tag className="w-4 h-4 text-amber-500" />
            <span>برچسب تخصصی</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black dark:text-white text-slate-900 leading-tight">
            مقالات با برچسب <span className="gradient-text-accent">#{tagName}</span>
          </h1>
          <p className="dark:text-slate-300 text-slate-600 text-sm sm:text-base leading-relaxed font-medium">
            {tagArticles.length} مقاله با برچسب «{tagName}» منتشر شده است
          </p>
        </div>
      </ScrollReveal>

      {/* Articles List */}
      <ArticlesListClient articles={tagArticles} />

      {/* Back to all articles */}
      <div className="text-center pt-8">
        <Link
          href="/articles"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-brand-500 hover:text-white transition-all font-bold text-sm"
        >
          <ChevronRight className="w-4 h-4" />
          مشاهده همه مقالات
        </Link>
      </div>
    </div>
  );
}
