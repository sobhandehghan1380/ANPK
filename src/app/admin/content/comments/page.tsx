'use client';

import React, { useState, useEffect } from 'react';
import { adminFetch } from '@/lib/api';
import Link from 'next/link';
import { MessageCircle, CheckCircle2, XCircle, Trash2, ArrowLeft, Filter, AlertCircle, Clock, Link as LinkIcon, User } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<any[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(''); // '' means all
  const [msg, setMsg] = useState({ type: '', text: '' });

  const fetchComments = async () => {
    setLoading(true);
    try {
      const url = statusFilter 
        ? `${API_BASE}/api/portal/admin/comments/?status=${statusFilter}`
        : `${API_BASE}/api/portal/admin/comments/`;
      const res = await adminFetch(url);
      setComments(res?.comments || []);
      setPendingCount(res?.pending_count || 0);
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [statusFilter]);

  const showMsg = (type: string, text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), 4000);
  };

  const updateStatus = async (id: number, newStatus: string) => {
    try {
      const res = await adminFetch(`${API_BASE}/api/portal/admin/comments/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      });
      if (res?.message) {
        showMsg('success', res.message);
        fetchComments();
      }
    } catch (err) {
      showMsg('error', 'خطا در تغییر وضعیت نظر.');
    }
  };

  const deleteComment = async (id: number) => {
    if (!confirm('آیا از حذف این نظر اطمینان دارید؟')) return;
    try {
      const res = await adminFetch(`${API_BASE}/api/portal/admin/comments/?id=${id}`, {
        method: 'DELETE'
      });
      if (res?.message) {
        showMsg('success', res.message);
        fetchComments();
      }
    } catch (err) {
      showMsg('error', 'خطا در حذف نظر.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-right">
      
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black dark:text-white flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-brand-500" />
            مدیریت نظرات وبلاگ
          </h1>
          <p className="text-xs text-slate-400 mt-1">تأیید، رد و مدیریت دیدگاه‌های کاربران</p>
        </div>
        <Link href="/admin/content/articles"
          className="px-4 py-2 rounded-xl text-xs font-bold transition-all dark:bg-slate-900 bg-slate-100 dark:text-slate-400 text-slate-600 hover:bg-brand-500 hover:text-white flex items-center gap-1.5">
          <ArrowLeft className="w-3.5 h-3.5" /> بازگشت به مقالات
        </Link>
      </div>

      {msg.text && (
        <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${msg.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
          {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          {msg.text}
        </div>
      )}

      {/* ─── Filters & Stats ─── */}
      <div className="glass-card p-4 rounded-2xl border dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 text-xs font-bold focus:outline-none focus:border-brand-500">
            <option value="">همه نظرات</option>
            <option value="PENDING">در انتظار تأیید ({pendingCount})</option>
            <option value="APPROVED">تأیید شده</option>
            <option value="REJECTED">رد شده</option>
          </select>
        </div>
        <div className="text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
          {pendingCount} نظر در انتظار بررسی
        </div>
      </div>

      {/* ─── Comments List ─── */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400 font-bold">در حال بارگذاری...</div>
      ) : comments.length === 0 ? (
        <div className="glass-card rounded-3xl p-16 text-center space-y-3 border dark:border-slate-800">
          <MessageCircle className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-400">هیچ نظری یافت نشد.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map(c => (
            <div key={c.id} className="glass-card p-5 rounded-2xl border dark:border-slate-800 space-y-4 relative overflow-hidden">
              
              {/* Status Ribbon */}
              <div className={`absolute top-0 right-0 w-1.5 h-full ${
                c.status === 'PENDING' ? 'bg-amber-500' : c.status === 'APPROVED' ? 'bg-emerald-500' : 'bg-rose-500'
              }`} />

              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black dark:text-white text-slate-900 flex items-center gap-1.5">
                      <User className="w-4 h-4 text-slate-400" />
                      {c.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded-md">
                      {c.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {c.created_at}</span>
                    <span className="flex items-center gap-1"><LinkIcon className="w-3 h-3" /> در مقاله: 
                      <Link href={`/articles/${c.article_slug}`} target="_blank" className="text-brand-500 hover:underline">
                        {c.article_title}
                      </Link>
                    </span>
                    {c.ip_address && <span className="font-mono">IP: {c.ip_address}</span>}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {c.status !== 'APPROVED' && (
                    <button onClick={() => updateStatus(c.id, 'APPROVED')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white text-[10px] font-bold transition-all flex items-center gap-1 border border-emerald-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5" /> تأیید
                    </button>
                  )}
                  {c.status !== 'REJECTED' && (
                    <button onClick={() => updateStatus(c.id, 'REJECTED')}
                      className="px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white text-[10px] font-bold transition-all flex items-center gap-1 border border-rose-500/20">
                      <XCircle className="w-3.5 h-3.5" /> رد کردن
                    </button>
                  )}
                  <button onClick={() => deleteComment(c.id)}
                    className="px-3 py-1.5 rounded-lg bg-slate-500/10 text-slate-500 hover:bg-rose-600 hover:text-white text-[10px] font-bold transition-all flex items-center gap-1">
                    <Trash2 className="w-3.5 h-3.5" /> حذف
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-800 text-sm dark:text-slate-300 text-slate-700 leading-relaxed font-medium">
                {c.parent_id && (
                  <div className="text-[10px] font-bold text-brand-500 mb-2 flex items-center gap-1">
                    <ArrowLeft className="w-3 h-3" /> پاسخ به یک نظر دیگر
                  </div>
                )}
                {c.content}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
