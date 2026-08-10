'use client';

import React, { useState, useEffect } from 'react';
import { adminFetch } from '@/lib/api';
import Link from 'next/link';
import {
  BarChart3, BookOpen, Eye, MessageCircle, Tag, FolderOpen,
  TrendingUp, Clock, Star, ArrowLeft, CheckCircle2, AlertCircle
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export default function BlogAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const res = await adminFetch(`${API_BASE}/api/portal/admin/blog-analytics/`);
      setData(res);
    } catch (err) {
      console.error('Error loading analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">بارگذاری آمار وبلاگ...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6 text-right">
        <div className="border-b dark:border-slate-800 pb-4">
          <h1 className="text-2xl font-black dark:text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-brand-500" />
            داشبورد آماری وبلاگ
          </h1>
        </div>
        <div className="glass-card rounded-2xl p-8 border dark:border-slate-800 text-center">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-400">داده‌ای برای نمایش موجود نیست.</p>
        </div>
      </div>
    );
  }

  const { articles, comments, taxonomy, top_articles, top_categories, recent_comments, views_trend } = data;

  return (
    <div className="space-y-6 animate-fade-in text-right">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black dark:text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-brand-500" />
            داشبورد آماری وبلاگ
          </h1>
          <p className="text-xs text-slate-400 mt-1">نمای کلی عملکرد محتوای وبلاگ و تعامل کاربران</p>
        </div>
        <button
          onClick={loadAnalytics}
          className="px-4 py-2 rounded-xl text-xs font-bold transition-all dark:bg-slate-900 bg-slate-100 dark:text-slate-400 text-slate-600 hover:bg-brand-500 hover:text-white flex items-center gap-1.5"
        >
          <TrendingUp className="w-3.5 h-3.5" /> بروزرسانی
        </button>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-card rounded-2xl p-4 border dark:border-slate-800 space-y-2">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-brand-500" />
            <span className="text-[10px] text-slate-400 font-bold">کل مقالات</span>
          </div>
          <div className="text-2xl font-black dark:text-white">{articles.total.toLocaleString('fa-IR')}</div>
          <div className="flex items-center gap-2 text-[10px]">
            <span className="text-emerald-500">{articles.published.toLocaleString('fa-IR')} منتشر شده</span>
            <span className="text-slate-500">|</span>
            <span className="text-amber-500">{articles.draft.toLocaleString('fa-IR')} پیش‌نویس</span>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 border dark:border-slate-800 space-y-2">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-indigo-500" />
            <span className="text-[10px] text-slate-400 font-bold">کل بازدیدها</span>
          </div>
          <div className="text-2xl font-black dark:text-white">{articles.total_views.toLocaleString('fa-IR')}</div>
          <div className="text-[10px] text-slate-400">
            میانگین {articles.avg_views.toLocaleString('fa-IR')} بازدید به ازای هر مقاله
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 border dark:border-slate-800 space-y-2">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-emerald-500" />
            <span className="text-[10px] text-slate-400 font-bold">نظرات</span>
          </div>
          <div className="text-2xl font-black dark:text-white">{comments.total.toLocaleString('fa-IR')}</div>
          <div className="flex items-center gap-2 text-[10px]">
            <span className="text-amber-500">{comments.pending.toLocaleString('fa-IR')} در انتظار</span>
            <span className="text-slate-500">|</span>
            <span className="text-emerald-500">{comments.approved.toLocaleString('fa-IR')} تأیید شده</span>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 border dark:border-slate-800 space-y-2">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-amber-500" />
            <span className="text-[10px] text-slate-400 font-bold">دسته‌بندی و برچسب</span>
          </div>
          <div className="text-2xl font-black dark:text-white">
            {taxonomy.categories.toLocaleString('fa-IR')} / {taxonomy.tags.toLocaleString('fa-IR')}
          </div>
          <div className="text-[10px] text-slate-400">
            {taxonomy.categories} دسته‌بندی و {taxonomy.tags} برچسب
          </div>
        </div>
      </div>

      {/* Top Articles & Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Articles */}
        <div className="glass-card rounded-2xl p-5 border dark:border-slate-800 space-y-4">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500" />
            محبوب‌ترین مقالات
          </h3>
          {top_articles.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">مقاله‌ای موجود نیست.</p>
          ) : (
            <div className="space-y-3">
              {top_articles.map((a: any, idx: number) => (
                <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl dark:bg-slate-900/50 bg-slate-50 border dark:border-slate-800">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black ${
                    idx === 0 ? 'bg-yellow-500 text-yellow-900' :
                    idx === 1 ? 'bg-slate-300 text-slate-700' :
                    idx === 2 ? 'bg-amber-700 text-amber-100' :
                    'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}>
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <Link href={`/articles/${a.slug}`} target="_blank" className="text-xs font-bold dark:text-white hover:text-brand-500 truncate block">
                      {a.title}
                    </Link>
                    <span className="text-[10px] text-slate-400">{a.category}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-indigo-500 font-bold">
                    <Eye className="w-3 h-3" />
                    {a.views_count.toLocaleString('fa-IR')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Categories */}
        <div className="glass-card rounded-2xl p-5 border dark:border-slate-800 space-y-4">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-brand-500" />
            دسته‌بندی‌های برتر
          </h3>
          {top_categories.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">دسته‌بندی‌ای موجود نیست.</p>
          ) : (
            <div className="space-y-3">
              {top_categories.map((c: any, idx: number) => (
                <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl dark:bg-slate-900/50 bg-slate-50 border dark:border-slate-800">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black ${
                    idx === 0 ? 'bg-brand-500 text-white' :
                    idx === 1 ? 'bg-indigo-500 text-white' :
                    'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}>
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold dark:text-white truncate block">{c.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">/{c.slug}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-brand-500/10 text-brand-500 border border-brand-500/20">
                    {c.article_count} مقاله
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Views Trend & Recent Comments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Views Trend */}
        <div className="glass-card rounded-2xl p-5 border dark:border-slate-800 space-y-4">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            روند بازدید (۷ روز اخیر)
          </h3>
          {views_trend.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">داده‌ای موجود نیست.</p>
          ) : (
            <div className="flex items-end gap-2 h-32">
              {views_trend.map((day: any, idx: number) => {
                const maxViews = Math.max(...views_trend.map((d: any) => d.views), 1);
                const height = (day.views / maxViews) * 100;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[9px] text-slate-400 font-bold">{day.views.toLocaleString('fa-IR')}</span>
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-brand-500 to-brand-400 min-h-[4px] transition-all"
                      style={{ height: `${Math.max(height, 4)}%` }}
                    />
                    <span className="text-[8px] text-slate-500 font-mono truncate w-full text-center">
                      {day.date.slice(5)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Comments */}
        <div className="glass-card rounded-2xl p-5 border dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-brand-500" />
              آخرین نظرات
            </h3>
            <Link href="/admin/content/comments" className="text-[10px] text-brand-500 hover:underline">
              مشاهده همه
            </Link>
          </div>
          {recent_comments.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">نظری موجود نیست.</p>
          ) : (
            <div className="space-y-2">
              {recent_comments.map((c: any) => (
                <div key={c.id} className="p-3 rounded-xl dark:bg-slate-900/50 bg-slate-50 border dark:border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold dark:text-white">{c.name}</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      c.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500' :
                      c.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-500' :
                      'bg-rose-500/10 text-rose-500'
                    }`}>
                      {c.status === 'PENDING' ? 'در انتظار' : c.status === 'APPROVED' ? 'تأیید' : 'رد'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 line-clamp-1">{c.content}</p>
                  <div className="flex items-center gap-2 text-[9px] text-slate-500">
                    <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> {c.created_at}</span>
                    <span>در: {c.article_title}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass-card rounded-2xl p-5 border dark:border-slate-800">
        <h3 className="text-sm font-bold mb-4">دسترسی سریع</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link href="/admin/content/articles/create" className="p-3 rounded-xl bg-brand-500/10 text-brand-500 hover:bg-brand-500 hover:text-white transition-all text-center space-y-2">
            <BookOpen className="w-5 h-5 mx-auto" />
            <span className="text-xs font-bold block">مقاله جدید</span>
          </Link>
          <Link href="/admin/content/comments" className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all text-center space-y-2">
            <MessageCircle className="w-5 h-5 mx-auto" />
            <span className="text-xs font-bold block">مدیریت نظرات</span>
          </Link>
          <Link href="/admin/content/tags" className="p-3 rounded-xl bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white transition-all text-center space-y-2">
            <Tag className="w-5 h-5 mx-auto" />
            <span className="text-xs font-bold block">برچسب‌ها</span>
          </Link>
          <Link href="/admin/content/articles" className="p-3 rounded-xl bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500 hover:text-white transition-all text-center space-y-2">
            <FolderOpen className="w-5 h-5 mx-auto" />
            <span className="text-xs font-bold block">لیست مقالات</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
