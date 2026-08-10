import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getArticleBySlug, getArticles } from '@/lib/data';
import { ArticleComments } from '@/components/ArticleComments';
import { Clock, Eye, User, Calendar, Tag, ArrowLeft, BookOpen, Rocket, ChevronRight, Hash, Share2, Globe, MessageCircle } from 'lucide-react';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: 'مقاله یافت نشد | ANPK' };
  return {
    title: article.meta_title || `${article.title} | پایگاه دانش ANPK`,
    description: article.meta_description || article.summary,
    alternates: article.canonical_url ? { canonical: article.canonical_url } : undefined,
    openGraph: {
      title: article.og_title || article.title,
      description: article.og_description || article.summary,
      images: article.og_image ? [{ url: article.og_image }] : (article.cover_image ? [{ url: article.cover_image }] : []),
      type: 'article',
      locale: article.language === 'fa' ? 'fa_IR' : 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: article.og_title || article.title,
      description: article.og_description || article.summary,
    },
  };
}

// Generate schema.org JSON-LD
function ArticleSchema({ article }: { article: any }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': article.schema_type || 'Article',
    headline: article.title,
    description: article.summary,
    author: { '@type': 'Person', name: article.author },
    datePublished: article.date,
    image: article.cover_image || article.thumbnail || undefined,
    publisher: {
      '@type': 'Organization',
      name: 'ارشیا نگین پردازش کویر',
      logo: { '@type': 'ImageObject', url: 'https://anpk.ir/logo.png' }
    },
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
  );
}

export default async function ArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const coverImg = article.cover_image || article.thumbnail;
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
  const resolveMedia = (url: string | null) => {
    if (!url) return null;
    return url.startsWith('http') ? url : `${API_BASE}${url}`;
  };

  return (
    <>
      <ArticleSchema article={article} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 text-right overflow-x-hidden">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-400 font-bold" aria-label="breadcrumb">
          <Link href="/" className="hover:text-brand-400 transition-colors">صفحه اصلی</Link>
          <ChevronRight className="w-3.5 h-3.5 rotate-180 shrink-0" />
          <Link href="/articles" className="hover:text-brand-400 transition-colors">مقالات</Link>
          <ChevronRight className="w-3.5 h-3.5 rotate-180 shrink-0" />
          <span className="text-brand-400 truncate max-w-[200px] sm:max-w-xs">{article.title}</span>
        </nav>

        {/* Article Header */}
        <div className="space-y-5">
          {/* Category Badge */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-500/10 text-brand-400 text-xs font-bold border border-brand-500/20">
              <BookOpen className="w-3.5 h-3.5" />
              {article.category || 'پایگاه دانش مهندسی'}
            </span>
            {article.is_featured && (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-yellow-500/10 text-yellow-500 text-xs font-bold border border-yellow-500/20">
                ⭐ مقاله ویژه
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black dark:text-white text-slate-900 leading-tight max-w-4xl">
            {article.title}
          </h1>

          {/* Meta Bar */}
          <div className="flex flex-wrap items-center gap-4 py-4 border-y dark:border-slate-800 border-slate-200 text-xs text-slate-500 dark:text-slate-400 font-bold">
            <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-brand-400" />{article.author}</span>
            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-sky-400" />{article.date}</span>
            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-amber-400" />زمان مطالعه: {article.readTime}</span>
            <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5 text-purple-400" />{article.views_count?.toLocaleString('fa-IR') || '۰'} بازدید</span>
            {article.allow_comments && (
              <span className="flex items-center gap-1.5"><MessageCircle className="w-3.5 h-3.5 text-emerald-400" />نظرات باز</span>
            )}
            {article.language !== 'fa' && (
              <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-slate-400" />{article.language}</span>
            )}
          </div>
        </div>

        {/* Cover Image */}
        {coverImg && (
          <div className="relative w-full h-56 sm:h-80 lg:h-96 rounded-3xl overflow-hidden border dark:border-slate-800 shadow-2xl group">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
            <img
              src={resolveMedia(coverImg) || ''}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </div>
        )}

        {/* Summary */}
        <div className="p-5 rounded-2xl bg-brand-500/5 border border-brand-500/20">
          <p className="text-xs font-bold text-brand-400 mb-1">چکیده:</p>
          <p className="text-sm dark:text-slate-200 text-slate-700 leading-relaxed">{article.summary}</p>
        </div>

        {/* Main Layout: Content + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ─── Article Content ─── */}
          <article className="lg:col-span-8 glass-card p-6 sm:p-10 rounded-3xl border dark:border-slate-800">
            {/* Render Tiptap HTML */}
            <div
              className="ProseMirror tiptap-content"
              dir="rtl"
              dangerouslySetInnerHTML={{ __html: article.content || '<p>محتوایی بارگذاری نشده.</p>' }}
            />

            {/* Tags */}
            {article.tags?.length > 0 && (
              <div className="mt-8 pt-6 border-t dark:border-slate-800 border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-brand-400" />
                  برچسب‌های مرتبط:
                </span>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag: string, i: number) => (
                    <Link key={i} href={`/articles?tag=${encodeURIComponent(tag)}`}
                      className="px-3 py-1 rounded-xl dark:bg-slate-900 bg-slate-100 border dark:border-slate-800 text-[11px] font-bold text-slate-500 hover:text-brand-500 hover:border-brand-500/30 transition-all">
                      #{tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Share */}
            <div className="mt-6 pt-6 border-t dark:border-slate-800 border-slate-200">
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5 mb-3">
                <Share2 className="w-3.5 h-3.5" /> اشتراک‌گذاری:
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: 'تلگرام', href: `https://t.me/share/url?url=${encodeURIComponent(`https://anpk.ir/articles/${article.slug}`)}&text=${encodeURIComponent(article.title)}`, color: 'bg-sky-500/10 text-sky-500 hover:bg-sky-500 hover:text-white border-sky-500/20' },
                  { name: 'واتساپ', href: `https://wa.me/?text=${encodeURIComponent(`${article.title} | https://anpk.ir/articles/${article.slug}`)}`, color: 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white border-emerald-500/20' },
                  { name: 'لینکدین', href: `https://www.linkedin.com/shareArticle?url=${encodeURIComponent(`https://anpk.ir/articles/${article.slug}`)}&title=${encodeURIComponent(article.title)}`, color: 'bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white border-blue-500/20' },
                ].map(s => (
                  <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer"
                    className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all ${s.color}`}>
                    {s.name}
                  </a>
                ))}
              </div>
            </div>
          </article>

          {/* ─── Sidebar ─── */}
          <aside className="lg:col-span-4 space-y-5 sticky top-24">
            {/* CTA */}
            <div className="p-5 rounded-3xl dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 space-y-3 shadow-xl">
              <h3 className="text-sm font-black dark:text-white flex items-center gap-2">
                <Rocket className="w-4 h-4 text-brand-400" />
                درخواست مشاوره تخصصی
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                جهت ارزیابی زیرساخت سازمان خود فرم مشاوره رایگان را تکمیل کنید.
              </p>
              <Link href="/start-project"
                className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20">
                ثبت درخواست مشاوره <ArrowLeft className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Author */}
            <div className="p-5 rounded-3xl glass-card border dark:border-slate-800 space-y-2">
              <h3 className="text-sm font-bold dark:text-white">درباره نویسنده</h3>
              <p className="text-xs font-bold text-brand-400">{article.author}</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                تیم تخصصی R&D شرکت ارشیا نگین پردازش کویر، طراح سامانه‌های هوشمند بیمارستانی و سازمانی.
              </p>
            </div>

            {/* Article Info */}
            <div className="p-5 rounded-3xl glass-card border dark:border-slate-800 space-y-2">
              <h3 className="text-sm font-bold dark:text-white">اطلاعات مقاله</h3>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">دسته‌بندی:</span>
                  <span className="font-bold dark:text-white">{article.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">زمان مطالعه:</span>
                  <span className="font-bold dark:text-white">{article.readTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">بازدید:</span>
                  <span className="font-bold dark:text-white">{article.views_count?.toLocaleString('fa-IR')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">نوع Schema:</span>
                  <span className="font-mono text-brand-400 text-[10px]">{article.schema_type}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* ─── Comments Section ─── */}
        <div className="max-w-4xl mx-auto">
          <ArticleComments slug={article.slug} allowComments={article.allow_comments} />
        </div>
      </div>
    </>
  );
}
