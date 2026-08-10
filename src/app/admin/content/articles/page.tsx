'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { adminFetch } from '@/lib/api';
import Link from 'next/link';
import {
  BookOpen, PlusCircle, CheckCircle2, Eye, Trash2, FolderPlus, Tag,
  Edit, Search, Filter, X, ChevronLeft, ChevronRight, Star, Clock,
  Archive, AlertCircle, BarChart2, Globe, MessageCircle, Calendar
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PUBLISHED: { label: 'منتشر شده', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' },
  DRAFT:     { label: 'پیش‌نویس',  color: 'bg-amber-500/10 text-amber-500 border-amber-500/30' },
  ARCHIVED:  { label: 'آرشیو',     color: 'bg-slate-500/10 text-slate-500 border-slate-500/30' },
};

const PAGE_SIZE = 9;

export default function AdminArticlesPage() {
  const [activeTab, setActiveTab] = useState<'articles' | 'categories'>('articles');

  // Data
  const [articles, setArticles] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [featuredFilter, setFeaturedFilter] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);

  // Category form
  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [editCatId, setEditCatId] = useState<number | null>(null);

  // Status
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const loadAll = async () => {
    try {
      const [artList, catList] = await Promise.all([
        adminFetch(`${API_BASE}/api/portal/admin/articles/`),
        adminFetch(`${API_BASE}/api/portal/admin/article-categories/`),
      ]);
      setArticles(artList || []);
      setCategories(catList || []);
    } catch (err) {
      console.error('Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [search, statusFilter, catFilter, featuredFilter]);

  // ─── Client-side filtering ───
  const filtered = useMemo(() => {
    let list = [...articles];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(a =>
        a.title?.toLowerCase().includes(q) ||
        a.summary?.toLowerCase().includes(q) ||
        a.author?.toLowerCase().includes(q) ||
        a.tags?.some((t: string) => t.toLowerCase().includes(q))
      );
    }
    if (statusFilter) list = list.filter(a => a.status === statusFilter);
    if (catFilter) list = list.filter(a => String(a.category_id) === catFilter);
    if (featuredFilter) list = list.filter(a => a.is_featured);
    return list;
  }, [articles, search, statusFilter, catFilter, featuredFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Stats
  const stats = useMemo(() => ({
    total: articles.length,
    published: articles.filter(a => a.status === 'PUBLISHED').length,
    draft: articles.filter(a => a.status === 'DRAFT').length,
    featured: articles.filter(a => a.is_featured).length,
    totalViews: articles.reduce((s, a) => s + (a.views_count || 0), 0),
  }), [articles]);

  // ─── Handlers ───
  const handleDeleteArticle = async (id: number, title: string) => {
    if (!confirm(`آیا از حذف مقاله "${title}" اطمینان دارید؟`)) return;
    try {
      await adminFetch(`${API_BASE}/api/portal/admin/articles/?id=${id}`, { method: 'DELETE' });
      setSuccessMsg('مقاله با موفقیت حذف شد.');
      loadAll();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg('خطا در حذف مقاله.');
      setTimeout(() => setErrorMsg(''), 3000);
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName || !catSlug) return;
    setSubmitting(true);
    setSuccessMsg('');
    try {
      const method = editCatId ? 'PUT' : 'POST';
      const body: any = { name: catName, slug: catSlug, description: catDesc };
      if (editCatId) body.id = editCatId;
      const res = await adminFetch(`${API_BASE}/api/portal/admin/article-categories/`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res?.message) {
        setSuccessMsg(res.message);
        setCatName(''); setCatSlug(''); setCatDesc(''); setEditCatId(null);
        loadAll();
      }
    } catch (err) {
      setErrorMsg('خطا در ذخیره دسته‌بندی.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: number, name: string) => {
    if (!confirm(`آیا از حذف دسته‌بندی "${name}" اطمینان دارید؟`)) return;
    try {
      await adminFetch(`${API_BASE}/api/portal/admin/article-categories/?id=${id}`, { method: 'DELETE' });
      setSuccessMsg('دسته‌بندی حذف شد.');
      loadAll();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg('خطا در حذف دسته‌بندی.');
    }
  };

  const startEditCat = (c: any) => {
    setEditCatId(c.id);
    setCatName(c.name);
    setCatSlug(c.slug);
    setCatDesc(c.description || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setSearch(''); setStatusFilter(''); setCatFilter(''); setFeaturedFilter(false);
  };
  const hasFilters = search || statusFilter || catFilter || featuredFilter;

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400">بارگذاری وبلاگ...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in text-right">

      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black dark:text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-brand-500" />
            مدیریت وبلاگ
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">CMS حرفه‌ای با سئو، برچسب و رسانه</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => setActiveTab('articles')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'articles' ? 'bg-brand-500 text-white' : 'dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
            مقالات ({articles.length})
          </button>
          <button onClick={() => setActiveTab('categories')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'categories' ? 'bg-brand-500 text-white' : 'dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
            دسته‌بندی‌ها ({categories.length})
          </button>
          <Link href="/admin/content/comments"
            className="px-4 py-2 rounded-xl text-xs font-bold transition-all dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5">
            <MessageCircle className="w-3.5 h-3.5" /> نظرات کاربران
          </Link>
          <Link href="/admin/content/tags"
            className="px-4 py-2 rounded-xl text-xs font-bold transition-all dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5" /> برچسب‌ها
          </Link>
          <Link href="/admin/content"
            className="px-4 py-2 rounded-xl text-xs font-bold transition-all dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5">
            <BarChart2 className="w-3.5 h-3.5" /> آمار وبلاگ
          </Link>
          <Link href="/admin/content/scheduled"
            className="px-4 py-2 rounded-xl text-xs font-bold transition-all dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" /> زمان‌بندی
          </Link>
        </div>
      </div>

      {/* ─── Messages ─── */}
      {successMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" /> {errorMsg}
        </div>
      )}

      {/* ════════════ TAB: ARTICLES ════════════ */}
      {activeTab === 'articles' && (
        <div className="space-y-5">

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { label: 'کل مقالات', value: stats.total, icon: BookOpen, color: 'text-brand-500' },
              { label: 'منتشر شده', value: stats.published, icon: Globe, color: 'text-emerald-500' },
              { label: 'پیش‌نویس', value: stats.draft, icon: Clock, color: 'text-amber-500' },
              { label: 'مقالات ویژه', value: stats.featured, icon: Star, color: 'text-yellow-500' },
              { label: 'کل بازدید', value: stats.totalViews, icon: BarChart2, color: 'text-indigo-500' },
            ].map(s => (
              <div key={s.label} className="glass-card rounded-2xl p-3 border dark:border-slate-800 flex items-center gap-3">
                <s.icon className={`w-5 h-5 shrink-0 ${s.color}`} />
                <div>
                  <div className="text-lg font-black dark:text-white">{s.value.toLocaleString('fa-IR')}</div>
                  <div className="text-[10px] text-slate-400">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Search + Filter Bar */}
          <div className="glass-card rounded-2xl p-4 border dark:border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="جستجو در عنوان، خلاصه، نویسنده یا تگ..."
                  className="w-full pr-9 pl-4 py-2.5 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 text-xs focus:outline-none focus:border-brand-500"
                />
              </div>
              <Link href="/admin/content/articles/create"
                className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-brand-500/20 whitespace-nowrap">
                <PlusCircle className="w-4 h-4" /> مقاله جدید
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {/* Status Filter */}
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 text-xs">
                <option value="">همه وضعیت‌ها</option>
                <option value="PUBLISHED">منتشر شده</option>
                <option value="DRAFT">پیش‌نویس</option>
                <option value="ARCHIVED">آرشیو</option>
              </select>
              {/* Category Filter */}
              <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 text-xs">
                <option value="">همه دسته‌بندی‌ها</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {/* Featured Toggle */}
              <button type="button" onClick={() => setFeaturedFilter(!featuredFilter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all border ${
                  featuredFilter ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30' : 'dark:bg-slate-900 bg-slate-50 dark:border-slate-700 border-slate-200 text-slate-500'
                }`}>
                <Star className="w-3.5 h-3.5" /> مقالات ویژه
              </button>
              {/* Clear */}
              {hasFilters && (
                <button type="button" onClick={clearFilters}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-500 text-xs font-bold flex items-center gap-1.5 border border-rose-500/20">
                  <X className="w-3.5 h-3.5" /> پاک کردن فیلترها
                </button>
              )}
              {/* Results count */}
              <span className="mr-auto text-[10px] text-slate-400 self-center">
                {filtered.length} نتیجه از {articles.length} مقاله
              </span>
            </div>
          </div>

          {/* Articles Grid */}
          {paginated.length === 0 ? (
            <div className="glass-card rounded-3xl border dark:border-slate-800 p-16 text-center space-y-3">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-400">
                {hasFilters ? 'هیچ مقاله‌ای با این فیلترها یافت نشد.' : 'هنوز مقاله‌ای ثبت نشده.'}
              </p>
              {!hasFilters && (
                <Link href="/admin/content/articles/create"
                  className="inline-flex items-center gap-2 mt-2 px-4 py-2 rounded-xl bg-brand-500 text-white text-xs font-bold">
                  <PlusCircle className="w-4 h-4" /> اولین مقاله را بنویسید
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {paginated.map((art: any) => (
                <div key={art.id} className="glass-card rounded-2xl border dark:border-slate-800 overflow-hidden group flex flex-col">

                  {/* Thumbnail */}
                  <div className="relative w-full h-40 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 overflow-hidden shrink-0">
                    {art.thumbnail ? (
                      <img
                        src={art.thumbnail.startsWith('http') ? art.thumbnail : `${API_BASE}${art.thumbnail}`}
                        alt={art.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-10 h-10 text-slate-300" />
                      </div>
                    )}
                    {/* Status Badge overlay */}
                    <div className="absolute top-2 right-2">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border backdrop-blur-sm ${STATUS_CONFIG[art.status]?.color || ''}`}>
                        {STATUS_CONFIG[art.status]?.label || art.status}
                      </span>
                    </div>
                    {art.is_featured && (
                      <div className="absolute top-2 left-2">
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-yellow-500/90 text-yellow-900 backdrop-blur-sm flex items-center gap-1">
                          <Star className="w-2.5 h-2.5" /> ویژه
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4 flex flex-col flex-1 space-y-2.5">
                    <h3 className="text-sm font-bold dark:text-white text-slate-900 line-clamp-2 leading-relaxed">
                      {art.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {art.summary}
                    </p>

                    {/* Tags */}
                    {art.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {art.tags.slice(0, 3).map((t: string, i: number) => (
                          <span key={i} className="text-[9px] bg-brand-500/10 text-brand-500 px-1.5 py-0.5 rounded-full border border-brand-500/20">
                            #{t}
                          </span>
                        ))}
                        {art.tags.length > 3 && (
                          <span className="text-[9px] text-slate-400">+{art.tags.length - 3}</span>
                        )}
                      </div>
                    )}

                    {/* Category */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border dark:border-slate-700">
                        {art.category_name || 'عمومی'}
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {art.read_time}
                      </span>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-2 border-t dark:border-slate-800 mt-auto">
                      <div className="flex items-center gap-3 text-[10px] text-slate-400">
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {art.views_count || 0}</span>
                        <span>{art.created_at}</span>
                      </div>
                      <div className="flex gap-1.5">
                        <Link href={`/admin/content/articles/create?id=${art.id}`}
                          className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500 hover:text-white transition-all">
                          <Edit className="w-3.5 h-3.5" />
                        </Link>
                        <button onClick={() => handleDeleteArticle(art.id, art.title)}
                          className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-2 rounded-lg dark:bg-slate-800 bg-slate-100 text-slate-500 disabled:opacity-30 hover:bg-brand-500 hover:text-white transition-all">
                <ChevronRight className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                    p === page ? 'bg-brand-500 text-white' : 'dark:bg-slate-800 bg-slate-100 text-slate-500 hover:bg-brand-500/20'
                  }`}>
                  {p}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-2 rounded-lg dark:bg-slate-800 bg-slate-100 text-slate-500 disabled:opacity-30 hover:bg-brand-500 hover:text-white transition-all">
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ════════════ TAB: CATEGORIES ════════════ */}
      {activeTab === 'categories' && (
        <div className="space-y-6">

          {/* Create / Edit Form */}
          <div className="glass-card rounded-3xl p-6 border dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b dark:border-slate-800 pb-3">
              <h2 className="text-base font-black dark:text-white flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-brand-500" />
                {editCatId ? 'ویرایش دسته‌بندی' : 'دسته‌بندی جدید'}
              </h2>
              {editCatId && (
                <button type="button" onClick={() => { setEditCatId(null); setCatName(''); setCatSlug(''); setCatDesc(''); }}
                  className="text-xs text-slate-400 hover:text-rose-500 flex items-center gap-1">
                  <X className="w-3.5 h-3.5" /> لغو
                </button>
              )}
            </div>
            <form onSubmit={handleSaveCategory} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400">نام دسته‌بندی:</label>
                  <input required value={catName} onChange={e => setCatName(e.target.value)}
                    placeholder="مثلاً: هوش مصنوعی"
                    className="w-full px-3 py-2.5 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 text-xs focus:outline-none focus:border-brand-500 font-bold" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400">نامک (Slug):</label>
                  <input required value={catSlug} onChange={e => setCatSlug(e.target.value)}
                    placeholder="artificial-intelligence"
                    className="w-full px-3 py-2.5 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 text-xs font-mono focus:outline-none focus:border-brand-500" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400">توضیحات:</label>
                <input value={catDesc} onChange={e => setCatDesc(e.target.value)}
                  placeholder="توضیح کوتاه..."
                  className="w-full px-3 py-2.5 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 text-xs focus:outline-none focus:border-brand-500" />
              </div>
              <button type="submit" disabled={submitting}
                className="w-full py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-all flex items-center justify-center gap-2">
                <FolderPlus className="w-4 h-4" />
                {submitting ? 'در حال ذخیره...' : (editCatId ? 'ذخیره ویرایش' : 'ایجاد دسته‌بندی')}
              </button>
            </form>
          </div>

          {/* Categories List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((c: any) => (
              <div key={c.id} className="glass-card rounded-2xl p-4 border dark:border-slate-800 space-y-3 group">
                <div className="flex items-center justify-between">
                  <span className="font-bold dark:text-white text-slate-900 flex items-center gap-1.5 text-sm">
                    <Tag className="w-4 h-4 text-brand-500 shrink-0" />
                    {c.name}
                  </span>
                  <span className="text-[10px] font-bold bg-brand-500/10 text-brand-500 px-2 py-0.5 rounded-full border border-brand-500/20">
                    {c.articles_count} مقاله
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">/{c.slug}</div>
                {c.description && <p className="text-[11px] text-slate-400 line-clamp-2">{c.description}</p>}
                <div className="flex gap-2 pt-1 border-t dark:border-slate-800">
                  <button onClick={() => startEditCat(c)}
                    className="flex-1 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-500 text-[10px] font-bold hover:bg-indigo-500 hover:text-white transition-all flex items-center justify-center gap-1">
                    <Edit className="w-3 h-3" /> ویرایش
                  </button>
                  <button onClick={() => handleDeleteCategory(c.id, c.name)}
                    className="flex-1 py-1.5 rounded-lg bg-rose-500/10 text-rose-500 text-[10px] font-bold hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center gap-1">
                    <Trash2 className="w-3 h-3" /> حذف
                  </button>
                </div>
              </div>
            ))}
            {categories.length === 0 && (
              <div className="col-span-3 text-center py-12 text-slate-400">
                <FolderPlus className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p className="text-xs">هنوز دسته‌بندی‌ای تعریف نشده.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
