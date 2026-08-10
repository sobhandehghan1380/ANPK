'use client';

import React, { useState, useEffect } from 'react';
import { adminFetch } from '@/lib/api';
import Link from 'next/link';
import { MessageCircle, CheckCircle2, XCircle, Trash2, ArrowLeft, Filter, AlertCircle, Clock, Link as LinkIcon, User, Reply, Send } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: 'در انتظار تأیید', color: 'text-amber-500', bg: 'bg-amber-500' },
  APPROVED: { label: 'تأیید شده', color: 'text-emerald-500', bg: 'bg-emerald-500' },
  REJECTED: { label: 'رد شده', color: 'text-rose-500', bg: 'bg-rose-500' },
};

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<any[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [msg, setMsg] = useState({ type: '', text: '' });
  
  // Reply state
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);

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

  const handleReply = async (commentId: number) => {
    if (!replyText.trim() || replyText.trim().length < 5) {
      showMsg('error', 'پاسخ باید حداقل ۵ کاراکتر باشد.');
      return;
    }
    
    setReplySubmitting(true);
    try {
      const res = await adminFetch(`${API_BASE}/api/portal/admin/comments/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment_id: commentId, message: replyText.trim() })
      });
      if (res?.message) {
        showMsg('success', res.message);
        setReplyText('');
        setReplyingTo(null);
        fetchComments();
      }
    } catch (err: any) {
      showMsg('error', err?.message || 'خطا در ارسال پاسخ.');
    } finally {
      setReplySubmitting(false);
    }
  };

  const cancelReply = () => {
    setReplyingTo(null);
    setReplyText('');
  };

  return (
    <div className="space-y-6 animate-fade-in text-right">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black dark:text-white flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-brand-500" />
            مدیریت نظرات وبلاگ
          </h1>
          <p className="text-xs text-slate-400 mt-1">تأیید، رد، پاسخ و مدیریت دیدگاه‌های کاربران</p>
        </div>
        <Link href="/admin/blog/articles"
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

      {/* Filters & Stats */}
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

      {/* Comments List */}
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
              <div className={`absolute top-0 right-0 w-1.5 h-full ${STATUS_CONFIG[c.status]?.bg || 'bg-slate-500'}`} />

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
                    {c.parent_id && (
                      <span className="text-[10px] font-bold text-brand-500 bg-brand-500/10 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Reply className="w-3 h-3" /> پاسخ
                      </span>
                    )}
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
                  <button onClick={() => setReplyingTo(c.id)}
                    className="px-3 py-1.5 rounded-lg bg-brand-500/10 text-brand-500 hover:bg-brand-500 hover:text-white text-[10px] font-bold transition-all flex items-center gap-1 border border-brand-500/20">
                    <Reply className="w-3.5 h-3.5" /> پاسخ
                  </button>
                  <button onClick={() => deleteComment(c.id)}
                    className="px-3 py-1.5 rounded-lg bg-slate-500/10 text-slate-500 hover:bg-rose-600 hover:text-white text-[10px] font-bold transition-all flex items-center gap-1">
                    <Trash2 className="w-3.5 h-3.5" /> حذف
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-800 text-sm dark:text-slate-300 text-slate-700 leading-relaxed font-medium">
                {c.content}
              </div>

              {/* Reply Form */}
              {replyingTo === c.id && (
                <div className="p-4 rounded-xl bg-brand-500/5 border border-brand-500/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-brand-500 flex items-center gap-1">
                      <Reply className="w-3.5 h-3.5" /> پاسخ ادمین به {c.name}
                    </span>
                    <button onClick={cancelReply} className="text-[10px] text-slate-400 hover:text-rose-500">
                      لغو
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder="متن پاسخ خود را بنویسید..."
                    className="w-full px-3 py-2 rounded-lg dark:bg-slate-900 bg-white border dark:border-slate-700 text-xs focus:outline-none focus:border-brand-500 resize-none"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">{replyText.length}/2000</span>
                    <button
                      onClick={() => handleReply(c.id)}
                      disabled={replySubmitting || replyText.trim().length < 5}
                      className="px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white text-xs font-bold transition-all flex items-center gap-2"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {replySubmitting ? 'در حال ارسال...' : 'ارسال پاسخ'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
