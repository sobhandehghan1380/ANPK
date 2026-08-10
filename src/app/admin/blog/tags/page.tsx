'use client';

import React, { useState, useEffect } from 'react';
import { adminFetch } from '@/lib/api';
import Link from 'next/link';
import { Tag, PlusCircle, Edit, Trash2, ArrowLeft, CheckCircle2, AlertCircle, X, Hash, FileText } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export default function AdminTagsPage() {
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // Form state
  const [tagName, setTagName] = useState('');
  const [tagSlug, setTagSlug] = useState('');
  const [slugManual, setSlugManual] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const loadTags = async () => {
    setLoading(true);
    try {
      const data = await adminFetch(`${API_BASE}/api/portal/admin/article-tags/`);
      setTags(data || []);
    } catch (err) {
      console.error('Error loading tags:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTags(); }, []);

  const showMsg = (type: string, text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), 4000);
  };

  // Auto-generate slug from name
  useEffect(() => {
    if (!slugManual && tagName) {
      const slug = tagName
        .toLowerCase()
        .replace(/[\u0600-\u06FF\s]+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      setTagSlug(slug);
    }
  }, [tagName, slugManual]);

  const resetForm = () => {
    setTagName('');
    setTagSlug('');
    setSlugManual(false);
    setEditId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagName.trim() || !tagSlug.trim()) {
      showMsg('error', 'نام و نامک برچسب الزامی است.');
      return;
    }

    setSubmitting(true);
    try {
      const method = editId ? 'PUT' : 'POST';
      const body: any = { name: tagName.trim(), slug: tagSlug.trim() };
      if (editId) body.id = editId;

      const res = await adminFetch(`${API_BASE}/api/portal/admin/article-tags/`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res?.message) {
        showMsg('success', res.message);
        resetForm();
        loadTags();
      }
    } catch (err: any) {
      showMsg('error', err?.message || 'خطا در ذخیره برچسب.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (tag: any) => {
    setEditId(tag.id);
    setTagName(tag.name);
    setTagSlug(tag.slug);
    setSlugManual(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`آیا از حذف برچسب "${name}" اطمینان دارید؟`)) return;
    try {
      const res = await adminFetch(`${API_BASE}/api/portal/admin/article-tags/?id=${id}`, {
        method: 'DELETE',
      });
      if (res?.message) {
        showMsg('success', res.message);
        loadTags();
      }
    } catch (err: any) {
      showMsg('error', err?.message || 'خطا در حذف برچسب.');
    }
  };

  // Stats
  const totalTags = tags.length;
  const totalArticles = tags.reduce((sum, t) => sum + (t.articles_count || 0), 0);
  const unusedTags = tags.filter(t => !t.articles_count || t.articles_count === 0).length;

  return (
    <div className="space-y-6 animate-fade-in text-right">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black dark:text-white flex items-center gap-2">
            <Tag className="w-6 h-6 text-brand-500" />
            مدیریت برچسب‌ها
          </h1>
          <p className="text-xs text-slate-400 mt-1">افزودن و مدیریت برچسب‌های مقالات وبلاگ</p>
        </div>
        <Link href="/admin/blog/articles"
          className="px-4 py-2 rounded-xl text-xs font-bold transition-all dark:bg-slate-900 bg-slate-100 dark:text-slate-400 text-slate-600 hover:bg-brand-500 hover:text-white flex items-center gap-1.5">
          <ArrowLeft className="w-3.5 h-3.5" /> بازگشت به مقالات
        </Link>
      </div>

      {/* Messages */}
      {msg.text && (
        <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${msg.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
          {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          {msg.text}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card rounded-2xl p-4 border dark:border-slate-800 flex items-center gap-3">
          <Tag className="w-5 h-5 text-brand-500" />
          <div>
            <div className="text-lg font-black dark:text-white">{totalTags}</div>
            <div className="text-[10px] text-slate-400">کل برچسب‌ها</div>
          </div>
        </div>
        <div className="glass-card rounded-2xl p-4 border dark:border-slate-800 flex items-center gap-3">
          <FileText className="w-5 h-5 text-emerald-500" />
          <div>
            <div className="text-lg font-black dark:text-white">{totalArticles}</div>
            <div className="text-[10px] text-slate-400">مقالات برچسب‌خورده</div>
          </div>
        </div>
        <div className="glass-card rounded-2xl p-4 border dark:border-slate-800 flex items-center gap-3">
          <Hash className="w-5 h-5 text-amber-500" />
          <div>
            <div className="text-lg font-black dark:text-white">{unusedTags}</div>
            <div className="text-[10px] text-slate-400">برچسب‌های بدون استفاده</div>
          </div>
        </div>
      </div>

      {/* Create / Edit Form */}
      <div className="glass-card rounded-3xl p-6 border dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b dark:border-slate-800 pb-3">
          <h2 className="text-base font-black dark:text-white flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-brand-500" />
            {editId ? 'ویرایش برچسب' : 'برچسب جدید'}
          </h2>
          {editId && (
            <button onClick={resetForm} className="text-xs text-slate-400 hover:text-rose-500 flex items-center gap-1">
              <X className="w-3.5 h-3.5" /> لغو
            </button>
          )}
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400">نام برچسب:</label>
              <input
                required
                value={tagName}
                onChange={e => setTagName(e.target.value)}
                placeholder="مثلاً: هوش مصنوعی"
                className="w-full px-3 py-2.5 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 text-xs focus:outline-none focus:border-brand-500 font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 flex items-center gap-2">
                نامک (Slug):
                <button
                  type="button"
                  onClick={() => {
                    setSlugManual(false);
                    const slug = tagName.toLowerCase()
                      .replace(/[㴀-鿿\s]+/g, '-')
                      .replace(/[^a-z0-9-]/g, '')
                      .replace(/-+/g, '-')
                      .replace(/^-|-$/g, '');
                    setTagSlug(slug);
                  }}
                  className="text-[9px] text-brand-500 hover:underline"
                >
                  بازتولید خودکار
                </button>
              </label>
              <input
                required
                value={tagSlug}
                onChange={e => { setTagSlug(e.target.value); setSlugManual(true); }}
                placeholder="artificial-intelligence"
                className="w-full px-3 py-2.5 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 text-xs font-mono focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <PlusCircle className="w-4 h-4" />
            {submitting ? 'در حال ذخیره...' : (editId ? 'ذخیره ویرایش' : 'ایجاد برچسب')}
          </button>
        </form>
      </div>

      {/* Tags List */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400 font-bold">در حال بارگذاری...</div>
      ) : tags.length === 0 ? (
        <div className="glass-card rounded-3xl p-16 text-center space-y-3 border dark:border-slate-800">
          <Tag className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-400">هنوز برچسبی ثبت نشده.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {tags.map((tag) => (
            <div key={tag.id} className="glass-card rounded-2xl p-4 border dark:border-slate-800 space-y-3 group hover:border-brand-500/30 transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-bold dark:text-white text-slate-900 flex items-center gap-1.5 text-sm">
                  <Hash className="w-4 h-4 text-brand-500 shrink-0" />
                  {tag.name}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  tag.articles_count > 0
                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                    : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                }`}>
                  {tag.articles_count || 0} مقاله
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">/{tag.slug}</div>
              <div className="flex gap-2 pt-1 border-t dark:border-slate-800">
                <button
                  onClick={() => handleEdit(tag)}
                  className="flex-1 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-500 text-[10px] font-bold hover:bg-indigo-500 hover:text-white transition-all flex items-center justify-center gap-1"
                >
                  <Edit className="w-3 h-3" /> ویرایش
                </button>
                <button
                  onClick={() => handleDelete(tag.id, tag.name)}
                  className="flex-1 py-1.5 rounded-lg bg-rose-500/10 text-rose-500 text-[10px] font-bold hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
