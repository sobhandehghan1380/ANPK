import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { getArticles } from '@/lib/data';
import { ArticlesListClient } from '@/components/ArticlesListClient';
import { ScrollReveal } from '@/components/ScrollReveal';
import { FolderOpen, ChevronRight } from 'lucide-react';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const articles = await getArticles();
  const categoryArticles = articles.filter((a: any) => 
    a.category?.toLowerCase().replace(/\s+/g, '-') === slug ||
    a.category === slug
  );
  
  const categoryName = categoryArticles[0]?.category || slug.replace(/-/g, ' ');
  
  return {
    title: `${categoryName} | پایگاه دانش ANPK`,
    description: `مقالات تخصصی در حوزه ${categoryName} - تحلیل‌های فنی توسط مهندسان ارشیا نگین پردازش کویر`,
  };
}

export default async function CategoryArticlesPage({ params }: Props) {
  const { slug } = await params;
  const articles = await getArticles();
  
  // Filter articles by category slug
  const categoryArticles = articles.filter((a: any) => {
    const catSlug = (a.category || '').toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and');
    return catSlug === slug || a.category === slug;
  });

  if (categoryArticles.length === 0) {
    notFound();
  }

  const categoryName = categoryArticles[0]?.category || slug.replace(/-/g, ' ');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10 overflow-x-hidden">
      
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-400 font-bold" aria-label="breadcrumb">
        <Link href="/" className="hover:text-brand-400 transition-colors">صفحه اصلی</Link>
        <ChevronRight className="w-3.5 h-3.5 rotate-180 shrink-0" />
        <Link href="/articles" className="hover:text-brand-400 transition-colors">مقالات</Link>
        <ChevronRight className="w-3.5 h-3.5 rotate-180 shrink-0" />
        <span className="text-brand-400">{categoryName}</span>
      </nav>

      {/* Header */}
      <ScrollReveal variant="fade-up">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full dark:bg-slate-900/80 bg-white/90 border dark:border-slate-700/60 border-slate-200/90 text-xs font-bold text-brand-600 dark:text-brand-400 backdrop-blur-2xl shadow-sm mx-auto">
            <FolderOpen className="w-4 h-4 text-brand-500" />
            <span>دسته‌بندی تخصصی</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black dark:text-white text-slate-900 leading-tight">
            مقالات حوزه <span className="gradient-text-accent">{categoryName}</span>
          </h1>
          <p className="dark:text-slate-300 text-slate-600 text-sm sm:text-base leading-relaxed font-medium">
            {categoryArticles.length} مقاله تخصصی در این حوزه منتشر شده است
          </p>
        </div>
      </ScrollReveal>

      {/* Articles List */}
      <ArticlesListClient articles={categoryArticles} />

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
