'use client';

import React, { useState, useEffect } from 'react';
import { adminFetch } from '@/lib/api';
import Link from 'next/link';
import { Calendar, Clock, CheckCircle2, AlertCircle, ArrowLeft, Send, BookOpen } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export default function ScheduledPublishPage() {
  const [scheduled, setScheduled] = useState<any[]>([]);
  const [dueCount, setDueCount] = useState(0);
  const [totalScheduled, setTotalScheduled] = useState(0);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await adminFetch(`${API_BASE}/api/admin/scheduled-publish/`);
      setScheduled(res?.scheduled || []);
      setDueCount(res?.due_count || 0);
      setTotalScheduled(res?.total_scheduled || 0);
    } catch (err) {
      console.error('Error loading scheduled articles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const showMsg = (type: string, text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), 4000);
  };

  const handlePublishNow = async () => {
    if (dueCount === 0) {
      showMsg('error', 'مقاله‌ای برای انتشار فوری موجود نیست.');
      return;
    }
    
    if (!confirm(`آیا از انتشار فوری ${dueCount} مقاله در انتظار انتشار اطمینان دارید؟`)) return;
    
    setPublishing(true);
    try {
      const res = await adminFetch(`${API_BASE}/api/admin/scheduled-publish/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'publish_now' })
      });
      if (res?.message) {
        showMsg('success', res.message);
        loadData();
      }
    } catch (err: any) {
      showMsg('error', err?.message || 'خطا در انتشار مقالات.');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-right">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black dark:text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-brand-500" />
            زمان‌بندی انتشار
          </h1>
          <p className="text-xs text-slate-400 mt-1">مدیریت مقالات زمان‌بندی شده و انتشار خودکار</p>
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="glass-card rounded-2xl p-4 border dark:border-slate-800 flex items-center gap-3">
          <Calendar className="w-5 h-5 text-brand-500" />
          <div>
            <div className="text-lg font-black dark:text-white">{totalScheduled}</div>
            <div className="text-[10px] text-slate-400">مقالات زمان‌بندی شده</div>
          </div>
        </div>
        <div className="glass-card rounded-2xl p-4 border dark:border-slate-800 flex items-center gap-3">
          <Clock className="w-5 h-5 text-amber-500" />
          <div>
            <div className="text-lg font-black dark:text-white">{dueCount}</div>
            <div className="text-[10px] text-slate-400">آماده انتشار</div>
          </div>
        </div>
        <div className="glass-card rounded-2xl p-4 border dark:border-slate-800 flex items-center gap-3">
          <Send className="w-5 h-5 text-emerald-500" />
          <div>
            <button
              onClick={handlePublishNow}
              disabled={publishing || dueCount === 0}
              className="text-sm font-bold text-emerald-500 hover:text-emerald-600 disabled:text-slate-400 disabled:cursor-not-allowed"
            >
              {publishing ? 'در حال انتشار...' : 'انتشار فوری'}
            </button>
            <div className="text-[10px] text-slate-400">انتشار دستی مقالات آماده</div>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="p-4 rounded-xl bg-brand-500/5 border border-brand-500/20 text-xs text-slate-300 space-y-2">
        <p className="font-bold text-brand-400">راهنمای زمان‌بندی انتشار:</p>
        <ul className="list-disc list-inside space-y-1 text-slate-400">
          <li>مقالات جدید را با وضعیت «پیش‌نویس» و تاریخ انتشار آینده ذخیره کنید</li>
          <li>مقالات به صورت خودکار در زمان تعیین شده منتشر می‌شوند (نیاز به تنظیم Cron Job دارد)</li>
          <li>همچنین می‌توانید از دکمه «انتشار فوری» برای انتشار دستی استفاده کنید</li>
          <li>برای تنظیم انتشار خودکار، دستور <code className="bg-slate-800 px-1 rounded">python manage.py publish_scheduled</code> را به Cron Job اضافه کنید</li>
        </ul>
      </div>

      {/* Scheduled Articles List */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400 font-bold">در حال بارگذاری...</div>
      ) : scheduled.length === 0 ? (
        <div className="glass-card rounded-3xl p-16 text-center space-y-3 border dark:border-slate-800">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-400">مقاله زمان‌بندی شده‌ای موجود نیست.</p>
          <Link href="/admin/blog/articles/create" className="inline-flex items-center gap-2 mt-2 px-4 py-2 rounded-xl bg-brand-500 text-white text-xs font-bold">
            <BookOpen className="w-4 h-4" /> ایجاد مقاله جدید
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {scheduled.map((article) => (
            <div key={article.id} className="glass-card p-4 rounded-2xl border dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <h3 className="text-sm font-bold dark:text-white">{article.title}</h3>
                <div className="flex items-center gap-3 text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    زمان انتشار: {article.published_at}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    تاریخ ایجاد: {article.created_at}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/blog/articles/create?id=${article.id}`}
                  className="px-3 py-1.5 rounded-lg bg-brand-500/10 text-brand-500 text-[10px] font-bold hover:bg-brand-500 hover:text-white transition-all"
                >
                  ویرایش
                </Link>
                <Link
                  href={`/articles/${article.slug}`}
                  target="_blank"
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                  پیش‌نمایش
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
