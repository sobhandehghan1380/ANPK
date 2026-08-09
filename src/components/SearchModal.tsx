'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Search,
  X,
  Layers,
  Package,
  FolderGit2,
  FileText,
  ArrowLeft,
  Loader2,
  Sparkles,
  CornerDownLeft,
  Flame,
  Zap,
  Globe,
  Tag
} from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'solutions' | 'products' | 'projects' | 'articles'>('all');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    solutions: any[];
    products: any[];
    projects: any[];
    articles: any[];
  }>({
    solutions: [],
    products: [],
    projects: [],
    articles: [],
  });

  const inputRef = useRef<HTMLInputElement>(null);

  const quickTags = [
    { label: 'آیرا', icon: '📹' },
    { label: 'تأسیسات نگار', icon: '🔧' },
    { label: 'سلامت دیجیتال', icon: '🏥' },
    { label: 'CMMS', icon: '⚙️' },
    { label: 'هنرداری', icon: '🛍️' },
    { label: 'آزمايشگاه LIS', icon: '🧪' },
    { label: 'هوش مصنوعی', icon: '🤖' },
  ];

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults({ solutions: [], products: [], projects: [], articles: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data.success) {
          setResults(data.results);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const hasResults =
    results.solutions.length > 0 ||
    results.products.length > 0 ||
    results.projects.length > 0 ||
    results.articles.length > 0;

  const filteredSolutions = activeCategory === 'all' || activeCategory === 'solutions' ? results.solutions : [];
  const filteredProducts = activeCategory === 'all' || activeCategory === 'products' ? results.products : [];
  const filteredProjects = activeCategory === 'all' || activeCategory === 'projects' ? results.projects : [];
  const filteredArticles = activeCategory === 'all' || activeCategory === 'articles' ? results.articles : [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 sm:pt-20 px-4 bg-slate-900/25 dark:bg-black/45 backdrop-blur-md transition-all animate-fade-in text-right">
      <div
        className="w-full max-w-3xl rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl shadow-2xl shadow-slate-900/20 dark:shadow-black/80 overflow-hidden flex flex-col max-h-[85vh] relative z-10"
        role="dialog"
        aria-modal="true"
        aria-label="جستجوی یکپارچه و هوشمند سایت"
      >
        {/* Search Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-900/60 relative">
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-brand-600 dark:text-brand-400 shrink-0" />

            <input
              ref={inputRef}
              type="text"
              className="w-full bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none text-base sm:text-lg font-bold"
              placeholder="جستجوی پلتفرم، CMMS، هنرداری، آیرا، یا مقاله..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />

            {loading && <Loader2 className="w-5 h-5 text-brand-500 animate-spin shrink-0" />}

            {query && (
              <button
                onClick={() => setQuery('')}
                className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-800/80 font-bold"
              >
                پاکسازی
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-2xl bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-red-500 transition-colors shrink-0"
              aria-label="بستن پنجره جستجو"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Suggestion Tags & Category Filter Tabs */}
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800/90 bg-slate-100/70 dark:bg-slate-950 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
            {[
              { id: 'all', label: 'همه نتایج' },
              { id: 'solutions', label: 'راهکارها' },
              { id: 'products', label: 'محصولات' },
              { id: 'projects', label: 'پروژه‌ها' },
              { id: 'articles', label: 'مقالات' },
            ].map((cat) => {
              const isActive = activeCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id as any)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20 scale-105'
                      : 'text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Quick Hot Trending Tags */}
          <div className="hidden md:flex items-center gap-1.5 overflow-x-auto text-[11px] font-bold scrollbar-none">
            <span className="text-amber-500 flex items-center gap-1 shrink-0 whitespace-nowrap">
              <Flame className="w-3.5 h-3.5 fill-current" />
              پرجستجو:
            </span>
            {quickTags.map((tag) => (
              <button
                key={tag.label}
                onClick={() => setQuery(tag.label)}
                className="px-2.5 py-1 rounded-xl dark:bg-slate-900 bg-white dark:text-slate-300 text-slate-700 border dark:border-slate-800 border-slate-200 hover:border-brand-500 hover:text-brand-500 transition-all flex items-center gap-1 shadow-sm whitespace-nowrap shrink-0"
              >
                <span>{tag.icon}</span>
                <span>{tag.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Results Body */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1 scrollbar-thin">
          {query.trim().length < 2 && (
            <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-brand-500/10 text-brand-500 border border-brand-500/20 flex items-center justify-center mx-auto shadow-lg icon-glow">
                <Sparkles className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold dark:text-white text-slate-900">جستجوی هوشمند در پلتفرم‌های ANPK</h3>
                <p className="text-xs dark:text-slate-400 text-slate-600 font-medium max-w-sm mx-auto">
                  عبارت مورد نظر خود را تایپ فرمایید یا یکی از کلمات کلیدی بالا را انتخاب کنید.
                </p>
              </div>

              {/* Mobile Quick Tags fallback */}
              <div className="md:hidden flex flex-wrap justify-center gap-2 pt-2">
                {quickTags.map((tag) => (
                  <button
                    key={tag.label}
                    onClick={() => setQuery(tag.label)}
                    className="px-3 py-1.5 rounded-xl dark:bg-slate-900 bg-slate-100 text-xs font-bold dark:text-slate-300 text-slate-700 border dark:border-slate-800 border-slate-200 flex items-center gap-1 whitespace-nowrap"
                  >
                    <span>{tag.icon}</span>
                    <span>{tag.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {query.trim().length >= 2 && !loading && !hasResults && (
            <div className="text-center py-12 text-slate-400 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-300">نتیجه‌ای برای «{query}» یافت نشد.</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">لطفاً املای عبارت را چک کنید یا کلماتی مانند «سلامت»، «CMMS»، «هنرداری» یا «آیرا» را امتحان فرمایید.</p>
            </div>
          )}

          {/* Solutions Section */}
          {filteredSolutions.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-brand-500 uppercase tracking-wider">
                <Layers className="w-4 h-4" />
                <span>راهکارها ({filteredSolutions.length})</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredSolutions.map((item) => (
                  <Link
                    key={item.id}
                    href={`/solutions/${item.slug}`}
                    onClick={onClose}
                    className="p-4 rounded-2xl dark:bg-slate-900/90 bg-slate-50 border dark:border-slate-800 border-slate-200/90 hover:border-brand-500/60 transition-all flex items-center justify-between group shadow-sm hover:shadow-md card-elevated min-w-0"
                  >
                    <div className="space-y-1 min-w-0 flex-1 pl-2">
                      <h4 className="text-sm font-bold dark:text-white text-slate-900 group-hover:text-brand-500 transition-colors truncate">
                        {item.title}
                      </h4>
                      <p className="text-xs dark:text-slate-400 text-slate-600 font-medium truncate">{item.subtitle}</p>
                    </div>
                    <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-brand-500 group-hover:-translate-x-1 transition-transform shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Products Section */}
          {filteredProducts.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-accent-500 uppercase tracking-wider">
                <Package className="w-4 h-4" />
                <span>محصولات نرم‌افزاری ({filteredProducts.length})</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredProducts.map((item) => (
                  <Link
                    key={item.id}
                    href={`/products/${item.slug}`}
                    onClick={onClose}
                    className="p-4 rounded-2xl dark:bg-slate-900/90 bg-slate-50 border dark:border-slate-800 border-slate-200/90 hover:border-accent-500/60 transition-all flex items-center justify-between group shadow-sm hover:shadow-md card-elevated min-w-0"
                  >
                    <div className="space-y-1 min-w-0 flex-1 pl-2">
                      <h4 className="text-sm font-bold dark:text-white text-slate-900 group-hover:text-accent-500 transition-colors truncate">
                        {item.title}
                      </h4>
                      <p className="text-xs dark:text-slate-400 text-slate-600 font-medium truncate">{item.tagline}</p>
                    </div>
                    <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-accent-500 group-hover:-translate-x-1 transition-transform shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Projects Section */}
          {filteredProjects.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-sky-500 uppercase tracking-wider">
                <FolderGit2 className="w-4 h-4" />
                <span>پروژه‌های استقراریافته ({filteredProjects.length})</span>
              </div>
              <div className="space-y-2">
                {filteredProjects.map((item) => (
                  <Link
                    key={item.id}
                    href={`/projects/${item.slug}`}
                    onClick={onClose}
                    className="p-4 rounded-2xl dark:bg-slate-900/90 bg-slate-50 border dark:border-slate-800 border-slate-200/90 hover:border-sky-500/60 transition-all flex items-center justify-between group shadow-sm hover:shadow-md card-elevated min-w-0"
                  >
                    <div className="space-y-1 min-w-0 flex-1 pl-2">
                      <h4 className="text-sm font-bold dark:text-white text-slate-900 group-hover:text-sky-500 transition-colors truncate">
                        {item.title}
                      </h4>
                      <p className="text-xs dark:text-slate-400 text-slate-600 font-medium truncate">
                        کارفرما: {item.clientName} | حوزه: {item.domain}
                      </p>
                    </div>
                    <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-sky-500 group-hover:-translate-x-1 transition-transform shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Articles Section */}
          {filteredArticles.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-500 uppercase tracking-wider">
                <FileText className="w-4 h-4" />
                <span>مقالات و نشریات مهندسی ({filteredArticles.length})</span>
              </div>
              <div className="space-y-2">
                {filteredArticles.map((item) => (
                  <Link
                    key={item.id}
                    href={`/articles/${item.slug}`}
                    onClick={onClose}
                    className="p-4 rounded-2xl dark:bg-slate-900/90 bg-slate-50 border dark:border-slate-800 border-slate-200/90 hover:border-amber-500/60 transition-all flex items-center justify-between group shadow-sm hover:shadow-md card-elevated min-w-0"
                  >
                    <div className="space-y-1 min-w-0 flex-1 pl-2">
                      <h4 className="text-sm font-bold dark:text-white text-slate-900 group-hover:text-amber-500 transition-colors truncate">
                        {item.title}
                      </h4>
                      <p className="text-xs dark:text-slate-400 text-slate-600 font-medium truncate">{item.excerpt}</p>
                    </div>
                    <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-amber-500 group-hover:-translate-x-1 transition-transform shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Shortcut Bar */}
        <div className="p-3.5 dark:bg-slate-900 bg-slate-100 border-t dark:border-slate-800 border-slate-200/90 text-xs text-slate-500 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
            <CornerDownLeft className="w-3.5 h-3.5 text-brand-500" />
            انتخاب سریع با کلیک روی گزینه‌ها
          </span>
          <div className="flex items-center gap-3 text-[11px] font-bold">
            <span className="flex items-center gap-1">
              <kbd className="px-2 py-0.5 dark:bg-slate-800 bg-slate-200 rounded border dark:border-slate-700 border-slate-300 text-slate-400 font-mono text-[10px]">Ctrl K</kbd>
              <span>باز/بستن</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-2 py-0.5 dark:bg-slate-800 bg-slate-200 rounded border dark:border-slate-700 border-slate-300 text-slate-400 font-mono text-[10px]">ESC</kbd>
              <span>خروج</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
