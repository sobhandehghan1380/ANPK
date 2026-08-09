'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText, Clock, Search, Sparkles, Filter, Mail, Send, CheckCircle2, Bookmark, Flame } from 'lucide-react';
import { ScrollReveal } from '@/components/ScrollReveal';
import { TiltCard } from '@/components/TiltCard';

export interface ArticleItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  author: string;
  readTime: string;
  excerpt: string;
  tags: string[];
  publishedAt?: Date | string;
}

interface ArticlesListClientProps {
  articles: ArticleItem[];
}

export function ArticlesListClient({ articles }: ArticlesListClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);

  const articleImages: Record<string, string> = {
    'cmms-in-hospitals': '/images/bg/health_tech.jpg',
    'webrtc-architecture-for-online-education': '/images/bg/prod_aira.jpg',
    'ai-in-process-automation': '/images/bg/ai_network.jpg',
  };

  const categories = useMemo(() => {
    const cats = Array.from(new Set(articles.map((a) => a.category)));
    return ['all', ...cats];
  }, [articles]);

  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      const matchesSearch =
        art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat = selectedCategory === 'all' || art.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [articles, searchQuery, selectedCategory]);

  const featuredArticle = articles[0];

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) return;
    setNewsletterSuccess(true);
    setTimeout(() => {
      setNewsletterEmail('');
    }, 3000);
  };

  return (
    <div className="space-y-16 text-right">
      {/* Search & Category Filter Bar */}
      <ScrollReveal variant="fade-up">
        <div className="p-6 sm:p-8 rounded-3xl glass-card border dark:border-slate-800 border-slate-200/90 space-y-6 card-elevated">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="جستجو در مقالات، کلمات کلیدی، CMMS..."
                className="w-full pl-4 pr-11 py-3.5 rounded-2xl dark:bg-slate-900 bg-slate-100 border dark:border-slate-800 border-slate-300 text-xs dark:text-white text-slate-900 focus:outline-none focus:border-amber-500 font-medium transition-all shadow-inner"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2" />
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
              <Filter className="w-4 h-4 text-amber-500 shrink-0 hidden sm:block" />
              {categories.map((cat) => {
                const isActive = selectedCategory === cat;
                const label = cat === 'all' ? 'همه مقالات' : cat;

                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20 scale-105'
                        : 'dark:bg-slate-900 bg-slate-100 dark:text-slate-400 text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Featured Article Hero Banner (if no active filter) */}
      {!searchQuery && selectedCategory === 'all' && featuredArticle && (
        <ScrollReveal variant="fade-up">
          <div className="relative rounded-3xl overflow-hidden glass-card border dark:border-slate-800 border-slate-200/90 card-elevated grid grid-cols-1 lg:grid-cols-12 gap-0 shadow-xl">
            <div className="lg:col-span-7 p-8 sm:p-12 space-y-6 flex flex-col justify-between relative z-10">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-500 text-white font-black text-xs shadow-md">
                    <Flame className="w-3.5 h-3.5 fill-current" />
                    مقاله منتخب هفته
                  </span>
                  <span className="px-3 py-1 rounded-xl dark:bg-slate-900 bg-slate-100 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-bold">
                    {featuredArticle.category}
                  </span>
                  <span className="text-xs text-slate-400 font-bold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    {featuredArticle.readTime}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-4xl font-black dark:text-white text-slate-900 leading-tight">
                  {featuredArticle.title}
                </h2>

                <p className="dark:text-slate-300 text-slate-600 text-xs sm:text-sm leading-relaxed font-medium line-clamp-3">
                  {featuredArticle.excerpt}
                </p>
              </div>

              <div className="pt-4 flex items-center justify-between border-t dark:border-slate-800 border-slate-200">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                  نویسنده: {featuredArticle.author}
                </span>

                <Link
                  href={`/articles/${featuredArticle.slug}`}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-black text-xs shadow-lg shadow-amber-600/30 flex items-center gap-2 group transition-all"
                >
                  <span>مطالعه مقاله برتر</span>
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Featured Image Right */}
            <div className="lg:col-span-5 relative min-h-[260px] lg:min-h-full overflow-hidden border-t lg:border-t-0 lg:border-r dark:border-slate-800 border-slate-200">
              <img
                src={articleImages[featuredArticle.slug] || '/images/bg/health_tech.jpg'}
                alt={featuredArticle.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-slate-950/80 via-transparent to-transparent"></div>
            </div>
          </div>
        </ScrollReveal>
      )}

      {/* Articles Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black dark:text-white text-slate-900">
            فهرست مقالات ({filteredArticles.length})
          </h3>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-amber-500 font-bold hover:underline"
            >
              پاکسازی جستجو
            </button>
          )}
        </div>

        {filteredArticles.length === 0 ? (
          <div className="p-12 text-center rounded-3xl glass-card border dark:border-slate-800 border-slate-200 space-y-3">
            <FileText className="w-12 h-12 text-slate-400 mx-auto" />
            <h4 className="text-base font-bold dark:text-white text-slate-900">مقاله‌ای با این مشخصات یافت نشد</h4>
            <p className="text-xs dark:text-slate-400 text-slate-600 font-medium">لطفاً عبارت دیگری را جستجو کنید یا فیلتر دسته‌بندی را تغییر دهید.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((art, idx) => {
              const coverImg = articleImages[art.slug] || '/images/bg/ai_network.jpg';

              return (
                <ScrollReveal key={art.id} variant="fade-up" delay={idx * 100}>
                  <TiltCard className="h-full">
                    <Link
                      href={`/articles/${art.slug}`}
                      className="rounded-3xl glass-card border dark:border-slate-800 border-slate-200/90 flex flex-col justify-between group card-elevated card-shimmer relative overflow-hidden h-full block"
                    >
                      {/* Image */}
                      <div className="relative w-full h-48 overflow-hidden border-b dark:border-slate-800 border-slate-200">
                        <img
                          src={coverImg}
                          alt={art.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent"></div>

                        <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between z-10">
                          <span className="px-3 py-1 rounded-xl bg-amber-500/90 text-white font-bold text-xs backdrop-blur-md shadow-md">
                            {art.category}
                          </span>

                          <span className="flex items-center gap-1.5 text-xs font-bold text-white bg-black/40 px-3 py-1 rounded-xl backdrop-blur-md border border-white/10">
                            <Clock className="w-3.5 h-3.5 text-amber-400" />
                            {art.readTime}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6 space-y-4 relative z-10 flex-1 flex flex-col justify-between">
                        <div className="space-y-3">
                          <h4 className="text-lg font-bold dark:text-white text-slate-900 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors leading-snug">
                            {art.title}
                          </h4>
                          <p className="dark:text-slate-400 text-slate-600 text-xs leading-relaxed font-medium line-clamp-2">
                            {art.excerpt}
                          </p>

                          <div className="flex flex-wrap gap-1.5 pt-2">
                            {art.tags.map((tag: string, tIdx: number) => (
                              <span key={tIdx} className="text-[10px] dark:bg-slate-800 bg-slate-100 dark:text-slate-400 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 font-semibold">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="pt-4 border-t dark:border-slate-800 border-slate-200/80 flex items-center justify-between text-xs font-bold text-amber-600 dark:text-amber-400 group-hover:text-amber-500">
                          <span>مطالعه کامل مقاله</span>
                          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1.5 transition-transform" />
                        </div>
                      </div>
                    </Link>
                  </TiltCard>
                </ScrollReveal>
              );
            })}
          </div>
        )}
      </div>

      {/* Knowledge Base Newsletter Subscription Box */}
      <ScrollReveal variant="scale">
        <div className="p-8 sm:p-12 rounded-3xl mesh-gradient-bg border dark:border-slate-800 border-slate-200 shadow-xl text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-950/90 via-slate-900/95 to-slate-950/90"></div>

          <div className="space-y-3 relative z-10 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
              <Mail className="w-4 h-4 text-amber-400" />
              عضویت در پایگاه دانش ANPK
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white">آخرین تحلیلی‌های مهندسی را دریافت کنید</h3>
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              با عضویت در خبرنامه تخصصی ارشیا نگین پردازش کویر، جدیدترین مقالات فنی CMMS، سلامت دیجیتال و هوش مصنوعی را در ایمیل خود دریافت نمایید.
            </p>
          </div>

          <div className="w-full md:w-auto relative z-10 shrink-0">
            {newsletterSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>اشتراک شما با موفقیت فعال شد. سپاسگزاریم!</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="آدرس ایمیل شما (مثال: email@domain.com)"
                  className="px-4 py-3.5 rounded-2xl bg-white/10 border border-white/20 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 font-medium dir-ltr text-right min-w-[240px]"
                />
                <button
                  type="submit"
                  className="px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
                >
                  <Send className="w-4 h-4" />
                  <span>عضویت رایگان</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
