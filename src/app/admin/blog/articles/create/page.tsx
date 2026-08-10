'use client';

import React, { useState, useEffect, Suspense, useCallback, useRef } from 'react';
import { adminFetch } from '@/lib/api';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen, PlusCircle, CheckCircle2, UploadCloud, X, ArrowRight,
  Eye, EyeOff, Globe, Clock, Hash, Search, Share2, Settings,
  AlertCircle, Sparkles, Calendar, MessageCircle, List, FileText, Save, RotateCcw
} from 'lucide-react';
import FileUpload from '@/components/admin/FileUpload';

const TiptapEditor = dynamic(() => import('@/components/admin/TiptapEditor'), { ssr: false });
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

// Auto-save hook
function useAutoSave(key: string, data: any, interval = 30000) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Save to localStorage
  const save = useCallback(() => {
    try {
      setIsSaving(true);
      localStorage.setItem(`autosave_${key}`, JSON.stringify({
        data,
        timestamp: new Date().toISOString()
      }));
      setLastSaved(new Date());
      setTimeout(() => setIsSaving(false), 500);
    } catch (e) {
      console.error('Auto-save error:', e);
    }
  }, [key, data]);

  // Load from localStorage
  const load = useCallback(() => {
    try {
      const saved = localStorage.getItem(`autosave_${key}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed;
      }
    } catch (e) {
      console.error('Load auto-save error:', e);
    }
    return null;
  }, [key]);

  // Clear saved data
  const clear = useCallback(() => {
    localStorage.removeItem(`autosave_${key}`);
    setLastSaved(null);
  }, [key]);

  // Auto-save on data change
  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(save, interval);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [save, interval]);

  return { lastSaved, isSaving, save, load, clear };
}

// Auto-generate slug from title
function toSlug(str: string): string {
  return str
    .toLowerCase()
    .replace(/[\u0600-\u06FF\s]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Estimate read time from HTML content
function estimateReadTime(html: string): string {
  const text = html.replace(/<[^>]+>/g, '');
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / 200);
  return `${minutes} دقیقه`;
}

// Google Snippet Preview
function GooglePreview({ title, slug, description }: { title: string; slug: string; description: string }) {
  return (
    <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
      <p className="text-[10px] text-slate-400 font-mono mb-2">پیش‌نمایش نتیجه گوگل:</p>
      <div className="text-green-700 dark:text-green-500 text-xs font-mono truncate">
        anpk.ir/blog/{slug || 'article-slug'}
      </div>
      <div className="text-blue-700 dark:text-blue-400 text-sm font-medium line-clamp-1">
        {title || 'عنوان مقاله شما اینجا نمایش داده می‌شود'}
      </div>
      <div className="text-slate-600 dark:text-slate-400 text-[11px] line-clamp-2">
        {description || 'توضیحات متا را وارد کنید تا در نتایج جستجو نمایش داده شود. این متن حدود ۱۵۰ کاراکتر باید باشد.'}
      </div>
    </div>
  );
}

function CreateArticleForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');

  const [categories, setCategories] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [activeSection, setActiveSection] = useState<'content' | 'seo' | 'og' | 'advanced'>('content');

  // Core Fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugManual, setSlugManual] = useState(false);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [author, setAuthor] = useState('مهندس شاطریان');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [readTime, setReadTime] = useState('۵ دقیقه');
  const [status, setStatus] = useState('PUBLISHED');
  const [isFeatured, setIsFeatured] = useState(false);
  const [language, setLanguage] = useState('fa');
  const [allowComments, setAllowComments] = useState(true);
  const [tableOfContents, setTableOfContents] = useState(true);
  const [publishedAt, setPublishedAt] = useState('');

  // Tags
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Media (URLs from upload)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [ogImageUrl, setOgImageUrl] = useState<string | null>(null);

  // SEO
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');

  // Open Graph
  const [ogTitle, setOgTitle] = useState('');
  const [ogDescription, setOgDescription] = useState('');

  // Advanced
  const [schemaType, setSchemaType] = useState('Article');

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-save
  const autoSaveKey = editId ? `article_edit_${editId}` : 'article_new';
  const { lastSaved, isSaving, save: triggerAutoSave, load: loadAutoSave, clear: clearAutoSave } = useAutoSave(
    autoSaveKey,
    { title, slug, content, summary, tags },
    30000
  );

  const loadData = async () => {
    try {
      const catList = await adminFetch(`${API_BASE}/api/portal/admin/article-categories/`);
      setCategories(catList || []);
      if (editId) {
        const artList = await adminFetch(`${API_BASE}/api/portal/admin/articles/`);
        const a = artList?.find((art: any) => art.id.toString() === editId);
        if (a) {
          setTitle(a.title || ''); setSlug(a.slug || ''); setSlugManual(true);
          setCategoryId(a.category_id || null); setAuthor(a.author || '');
          setSummary(a.summary || ''); setContent(a.content || '');
          setReadTime(a.read_time || ''); setStatus(a.status || 'PUBLISHED');
          setIsFeatured(a.is_featured || false); setLanguage(a.language || 'fa');
          setAllowComments(a.allow_comments !== false);
          setTableOfContents(a.table_of_contents !== false);
          setMetaTitle(a.meta_title || ''); setMetaDescription(a.meta_description || '');
          setCanonicalUrl(a.canonical_url || '');
          setOgTitle(a.og_title || ''); setOgDescription(a.og_description || '');
          setSchemaType(a.schema_type || 'Article');
          setTags(Array.isArray(a.tags) ? a.tags : (a.tags ? a.tags.split(',') : []));
          if (a.thumbnail) setThumbnailPreview(a.thumbnail.startsWith('http') ? a.thumbnail : `${API_BASE}${a.thumbnail}`);
          if (a.cover_image) setCoverPreview(a.cover_image.startsWith('http') ? a.cover_image : `${API_BASE}${a.cover_image}`);
          if (a.og_image) setOgImageUrl(a.og_image.startsWith('http') ? a.og_image : `${API_BASE}${a.og_image}`);
        }
      }
    } catch (err) {
      console.error('Load error:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => { loadData(); }, [editId]);

  // Auto-save restore prompt
  const [showRestorePrompt, setShowRestorePrompt] = useState(false);
  const [savedDraft, setSavedDraft] = useState<any>(null);

  useEffect(() => {
    // Check for saved draft on initial load
    const saved = loadAutoSave();
    if (saved && saved.data) {
      const { title: sTitle, content: sContent, summary: sSummary } = saved.data;
      // Only prompt if there's meaningful saved content and current fields are empty
      if ((sTitle || sContent) && !title && !content) {
        setSavedDraft(saved);
        setShowRestorePrompt(true);
      }
    }
  }, []); // Only on mount

  const handleRestoreDraft = () => {
    if (savedDraft?.data) {
      if (savedDraft.data.title) setTitle(savedDraft.data.title);
      if (savedDraft.data.content) setContent(savedDraft.data.content);
      if (savedDraft.data.summary) setSummary(savedDraft.data.summary);
      if (savedDraft.data.slug) { setSlug(savedDraft.data.slug); setSlugManual(true); }
      if (savedDraft.data.tags) setTags(savedDraft.data.tags);
    }
    setShowRestorePrompt(false);
  };

  const handleDiscardDraft = () => {
    clearAutoSave();
    setShowRestorePrompt(false);
  };

  // Auto-slug from title
  useEffect(() => {
    if (!slugManual && title) {
      setSlug(toSlug(title));
    }
  }, [title, slugManual]);

  // Auto read-time from content
  useEffect(() => {
    if (content) {
      setReadTime(estimateReadTime(content));
    }
  }, [content]);

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = tagInput.trim();
      if (val && !tags.includes(val)) setTags([...tags, val]);
      setTagInput('');
    }
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug) { setErrorMsg('عنوان و نامک الزامی است.'); return; }

    setSubmitting(true); setSuccessMsg(''); setErrorMsg('');
    try {
      const fd = new FormData();
      if (editId) fd.append('id', editId);
      fd.append('title', title); fd.append('slug', slug);
      if (categoryId) fd.append('category_id', String(categoryId));
      fd.append('author', author); fd.append('summary', summary);
      fd.append('content', content); fd.append('read_time', readTime);
      fd.append('status', status); fd.append('is_featured', String(isFeatured));
      fd.append('language', language); fd.append('allow_comments', String(allowComments));
      fd.append('table_of_contents', String(tableOfContents));
      fd.append('tags', tags.join(','));
      fd.append('meta_title', metaTitle); fd.append('meta_description', metaDescription);
      fd.append('canonical_url', canonicalUrl);
      fd.append('og_title', ogTitle); fd.append('og_description', ogDescription);
      fd.append('schema_type', schemaType);
      if (publishedAt) fd.append('published_at', publishedAt);
      if (thumbnailPreview) fd.append('thumbnail', thumbnailPreview);
      if (coverPreview) fd.append('cover_image', coverPreview);
      if (ogImageUrl) fd.append('og_image', ogImageUrl);

      const method = editId ? 'PUT' : 'POST';
      const res = await adminFetch(`${API_BASE}/api/portal/admin/articles/`, { method, body: fd });
      if (res?.message) {
        setSuccessMsg(res.message);
        clearAutoSave(); // Clear auto-save after successful submit
        setTimeout(() => router.push('/admin/blog/articles'), 1500);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'خطا در ارسال اطلاعات');
    } finally {
      setSubmitting(false);
    }
  };

  const sidebarSections = [
    { key: 'content', label: 'محتوا', icon: FileText },
    { key: 'seo', label: 'سئو', icon: Search },
    { key: 'og', label: 'شبکه اجتماعی', icon: Share2 },
    { key: 'advanced', label: 'پیشرفته', icon: Settings },
  ] as const;

  if (loadingData) return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="space-y-3 text-center">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400">در حال بارگذاری...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in text-right">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black dark:text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-brand-500" />
            {editId ? 'ویرایش مقاله' : 'ایجاد مقاله جدید'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">CMS حرفه‌ای با ادیتور پیشرفته، سئو کامل و تنظیمات شبکه اجتماعی</p>
        </div>
        <Link href="/admin/blog/articles" className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 flex items-center gap-2">
          <ArrowRight className="w-4 h-4" /> بازگشت
        </Link>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {errorMsg}
        </div>
      )}

      {/* Auto-save Restore Prompt */}
      {showRestorePrompt && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-3">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs font-bold">
            <Save className="w-4 h-4" />
            پیش‌نویس ذخیره شده یافت شد
          </div>
          <p className="text-[11px] text-slate-400">
            یک پیش‌نویس ذخیره شده از تاریخ {savedDraft?.timestamp ? new Date(savedDraft.timestamp).toLocaleString('fa-IR') : 'ناموجود'} یافت شد. آیا می‌خواهید آن را بازیابی کنید؟
          </p>
          <div className="flex gap-2">
            <button onClick={handleRestoreDraft} className="px-3 py-1.5 rounded-lg bg-amber-500 text-white text-xs font-bold flex items-center gap-1">
              <RotateCcw className="w-3 h-3" /> بازیابی
            </button>
            <button onClick={handleDiscardDraft} className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-bold">
              حذف پیش‌نویس
            </button>
          </div>
        </div>
      )}

      {/* Auto-save Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/50 border dark:border-slate-800 text-[10px] text-slate-400">
        <div className="flex items-center gap-2">
          {isSaving ? (
            <>
              <div className="w-3 h-3 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
              <span>در حال ذخیره خودکار...</span>
            </>
          ) : lastSaved ? (
            <>
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              <span>آخرین ذخیره: {lastSaved.toLocaleTimeString('fa-IR')}</span>
            </>
          ) : (
            <>
              <Save className="w-3 h-3" />
              <span>ذخیره خودکار فعال (هر ۳۰ ثانیه)</span>
            </>
          )}
        </div>
        <button onClick={triggerAutoSave} className="text-brand-500 hover:underline flex items-center gap-1">
          <Save className="w-3 h-3" /> ذخیره دستی
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          
          {/* ─── Main Editor (3/4 wide) ─── */}
          <div className="xl:col-span-3 space-y-5">
            
            {/* Title */}
            <div className="glass-card rounded-2xl p-5 border dark:border-slate-800 space-y-3">
              <input
                type="text" required value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="عنوان مقاله..."
                className="w-full text-xl font-black bg-transparent border-none focus:outline-none dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600"
              />
              {/* Slug row */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400 font-mono shrink-0">anpk.ir/blog/</span>
                <input
                  type="text" required value={slug}
                  onChange={e => { setSlug(e.target.value); setSlugManual(true); }}
                  className="flex-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-brand-500 text-xs"
                />
                <button type="button" onClick={() => { setSlug(toSlug(title)); setSlugManual(false); }}
                  className="px-2 py-1 rounded-lg bg-brand-500/10 text-brand-500 text-[10px] font-bold hover:bg-brand-500 hover:text-white transition-all">
                  بازتولید
                </button>
              </div>
            </div>

            {/* Section Tabs */}
            <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              {sidebarSections.map(s => (
                <button key={s.key} type="button" onClick={() => setActiveSection(s.key)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                    activeSection === s.key ? 'bg-white dark:bg-slate-900 shadow text-brand-500' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}>
                  <s.icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
              ))}
            </div>

            {/* CONTENT TAB */}
            {activeSection === 'content' && (
              <div className="space-y-5">
                {/* Rich Editor */}
                <div className="space-y-2">
                  <label className="text-xs font-bold dark:text-slate-300">متن کامل مقاله:</label>
                  <TiptapEditor content={content} onChange={setContent} placeholder="متن مقاله را اینجا بنویسید..." />
                </div>

                {/* Summary */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold dark:text-slate-300">خلاصه / چکیده (Summary):</label>
                    <span className={`text-[10px] font-mono ${summary.length > 160 ? 'text-rose-500' : 'text-slate-400'}`}>
                      {summary.length}/160
                    </span>
                  </div>
                  <textarea rows={3} required value={summary} onChange={e => setSummary(e.target.value)}
                    placeholder="خلاصه کوتاهی که در کارت‌های مقاله نمایش داده می‌شود (حداکثر ۱۶۰ کاراکتر)..."
                    className="w-full px-4 py-3 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 border-slate-200 text-xs dark:text-white focus:outline-none focus:border-brand-500 resize-none" />
                </div>

                {/* Media */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold dark:text-slate-300 flex items-center gap-2">
                    <UploadCloud className="w-4 h-4 text-brand-500" />
                    تصاویر مقاله
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <FileUpload
                      value={thumbnailPreview || ''}
                      onChange={setThumbnailPreview}
                      label="تصویر شاخص (Thumbnail)"
                      type="image"
                      placeholder="تصویر کوچک مقاله"
                    />
                    <FileUpload
                      value={coverPreview || ''}
                      onChange={setCoverPreview}
                      label="تصویر هدر (Cover)"
                      type="image"
                      placeholder="تصویر بزرگ هدر"
                    />
                    <FileUpload
                      value={ogImageUrl || ''}
                      onChange={setOgImageUrl}
                      label="تصویر شبکه اجتماعی (OG)"
                      type="image"
                      placeholder="تصویر اشتراک‌گذاری"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SEO TAB */}
            {activeSection === 'seo' && (
              <div className="space-y-5">
                <GooglePreview title={metaTitle || title} slug={slug} description={metaDescription || summary} />
                <div className="space-y-4 p-5 glass-card rounded-2xl border dark:border-slate-800">
                  <h3 className="text-sm font-bold flex items-center gap-2"><Search className="w-4 h-4 text-brand-500" /> تنظیمات موتور جستجو</h3>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <label className="text-[10px] font-bold text-slate-400">Meta Title (عنوان موتور جستجو):</label>
                      <span className={`text-[10px] font-mono ${metaTitle.length > 60 ? 'text-rose-500' : 'text-slate-400'}`}>{metaTitle.length}/60</span>
                    </div>
                    <input type="text" value={metaTitle} onChange={e => setMetaTitle(e.target.value)}
                      placeholder={title || 'عنوان سئو...'}
                      className="w-full px-3 py-2 rounded-lg dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 text-xs focus:outline-none focus:border-brand-500" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <label className="text-[10px] font-bold text-slate-400">Meta Description (توضیحات گوگل):</label>
                      <span className={`text-[10px] font-mono ${metaDescription.length > 160 ? 'text-rose-500' : 'text-slate-400'}`}>{metaDescription.length}/160</span>
                    </div>
                    <textarea rows={3} value={metaDescription} onChange={e => setMetaDescription(e.target.value)}
                      placeholder={summary || 'توضیحات سئو...'}
                      className="w-full px-3 py-2 rounded-lg dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 text-xs focus:outline-none focus:border-brand-500 resize-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">Canonical URL (جلوگیری از محتوای تکراری):</label>
                    <input type="url" value={canonicalUrl} onChange={e => setCanonicalUrl(e.target.value)}
                      placeholder="https://anpk.ir/blog/..."
                      className="w-full px-3 py-2 rounded-lg dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 text-xs font-mono focus:outline-none focus:border-brand-500" />
                  </div>
                </div>
              </div>
            )}

            {/* OPEN GRAPH TAB */}
            {activeSection === 'og' && (
              <div className="space-y-5">
                <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs">
                  <Share2 className="w-4 h-4 inline ml-1" />
                  این اطلاعات هنگام اشتراک‌گذاری در <strong>تلگرام، واتساپ، توییتر، لینکدین</strong> نمایش داده می‌شود.
                </div>
                <div className="space-y-4 p-5 glass-card rounded-2xl border dark:border-slate-800">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">عنوان (OG Title):</label>
                    <input type="text" value={ogTitle} onChange={e => setOgTitle(e.target.value)}
                      placeholder={title || 'عنوان شبکه اجتماعی...'}
                      className="w-full px-3 py-2 rounded-lg dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 text-xs focus:outline-none focus:border-brand-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">توضیحات (OG Description):</label>
                    <textarea rows={3} value={ogDescription} onChange={e => setOgDescription(e.target.value)}
                      placeholder={summary || 'توضیحات شبکه اجتماعی...'}
                      className="w-full px-3 py-2 rounded-lg dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 text-xs focus:outline-none focus:border-brand-500 resize-none" />
                  </div>
                </div>
              </div>
            )}

            {/* ADVANCED TAB */}
            {activeSection === 'advanced' && (
              <div className="space-y-5 p-5 glass-card rounded-2xl border dark:border-slate-800">
                <h3 className="text-sm font-bold flex items-center gap-2"><Settings className="w-4 h-4 text-brand-500" /> تنظیمات پیشرفته</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">زبان مقاله:</label>
                    <select value={language} onChange={e => setLanguage(e.target.value)} className="w-full px-3 py-2 rounded-lg dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 text-xs">
                      <option value="fa">🇮🇷 فارسی</option>
                      <option value="en">🇬🇧 English</option>
                      <option value="ar">🇸🇦 العربية</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">نوع Schema.org:</label>
                    <select value={schemaType} onChange={e => setSchemaType(e.target.value)} className="w-full px-3 py-2 rounded-lg dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 text-xs">
                      <option value="Article">مقاله (Article)</option>
                      <option value="NewsArticle">خبر (NewsArticle)</option>
                      <option value="BlogPosting">پست وبلاگ (BlogPosting)</option>
                      <option value="TechArticle">مقاله فنی (TechArticle)</option>
                      <option value="HowTo">آموزش (HowTo)</option>
                    </select>
                  </div>
                </div>
                <div className="flex flex-col gap-3 pt-2 border-t dark:border-slate-700">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div onClick={() => setAllowComments(!allowComments)}
                      className={`w-10 h-5 rounded-full transition-colors relative ${allowComments ? 'bg-brand-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${allowComments ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </div>
                    <span className="text-xs font-bold"><MessageCircle className="w-3.5 h-3.5 inline ml-1 text-brand-500" />اجازه نظردهی (Comments)</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div onClick={() => setTableOfContents(!tableOfContents)}
                      className={`w-10 h-5 rounded-full transition-colors relative ${tableOfContents ? 'bg-brand-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${tableOfContents ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </div>
                    <span className="text-xs font-bold"><List className="w-3.5 h-3.5 inline ml-1 text-brand-500" />فهرست مطالب خودکار (ToC)</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* ─── Right Sidebar (1/4 wide) ─── */}
          <div className="space-y-4">
            
            {/* Publish Box */}
            <div className="glass-card rounded-2xl p-4 border dark:border-slate-800 space-y-4">
              <h3 className="text-sm font-bold flex items-center gap-2"><Sparkles className="w-4 h-4 text-brand-500" /> انتشار</h3>
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400">وضعیت:</label>
                <select value={status} onChange={e => setStatus(e.target.value)} className="w-full px-3 py-2 rounded-lg dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 text-xs font-bold">
                  <option value="DRAFT">📝 پیش‌نویس</option>
                  <option value="PUBLISHED">✅ منتشر شده</option>
                  <option value="ARCHIVED">📦 آرشیو شده</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 flex items-center gap-1"><Calendar className="w-3 h-3"/> زمان‌بندی انتشار:</label>
                <input type="datetime-local" value={publishedAt} onChange={e => setPublishedAt(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 text-xs" />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} className="w-4 h-4 text-brand-500 rounded" />
                <span className="text-xs font-bold">⭐ مقاله ویژه</span>
              </label>

              <button type="submit" disabled={submitting}
                className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-all shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2">
                <PlusCircle className="w-4 h-4" />
                {submitting ? 'در حال ثبت...' : (editId ? 'ذخیره ویرایش' : 'انتشار مقاله')}
              </button>
            </div>

            {/* Taxonomy */}
            <div className="glass-card rounded-2xl p-4 border dark:border-slate-800 space-y-3">
              <h3 className="text-sm font-bold">دسته‌بندی</h3>
              <select value={categoryId || ''} onChange={e => setCategoryId(Number(e.target.value) || null)}
                className="w-full px-3 py-2 rounded-lg dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 text-xs">
                <option value="">انتخاب دسته‌بندی...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            {/* Tags */}
            <div className="glass-card rounded-2xl p-4 border dark:border-slate-800 space-y-3">
              <h3 className="text-sm font-bold flex items-center gap-2"><Hash className="w-4 h-4 text-brand-500" /> برچسب‌ها</h3>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((t, i) => (
                  <span key={i} className="bg-brand-500/10 text-brand-500 border border-brand-500/20 text-[10px] px-2 py-1 rounded-full flex items-center gap-1 font-bold">
                    {t}
                    <button type="button" onClick={() => setTags(tags.filter((_, idx) => idx !== i))} className="hover:text-rose-500"><X className="w-2.5 h-2.5" /></button>
                  </span>
                ))}
              </div>
              <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={handleAddTag}
                placeholder="Enter برای افزودن..."
                className="w-full px-3 py-2 rounded-lg dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 text-xs" />
            </div>

            {/* Article Info */}
            <div className="glass-card rounded-2xl p-4 border dark:border-slate-800 space-y-2">
              <h3 className="text-sm font-bold">اطلاعات مقاله</h3>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400">نویسنده:</label>
                <input type="text" value={author} onChange={e => setAuthor(e.target.value)} className="w-full px-3 py-1.5 rounded-lg dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 text-xs" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3"/> زمان مطالعه (خودکار):</label>
                <input type="text" value={readTime} onChange={e => setReadTime(e.target.value)} className="w-full px-3 py-1.5 rounded-lg dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 text-xs" />
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function CreateArticlePageWrapper() {
  return (
    <Suspense fallback={<div className="flex justify-center p-8"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <CreateArticleForm />
    </Suspense>
  );
}
