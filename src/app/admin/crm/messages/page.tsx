'use client';

import React, { useState, useEffect } from 'react';
import { adminFetch } from '@/lib/api';
import { Mail, CheckCircle2, Trash2, MailOpen, AlertCircle } from 'lucide-react';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000') + '/api/v1/admin';

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchMessages = async () => {
    try {
      const res = await adminFetch(`${API_BASE}/messages/`);
      setMessages(res || []);
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleMarkAsRead = async (id: number) => {
    setActionLoading(id);
    try {
      await adminFetch(`${API_BASE}/messages/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_read', id })
      });
      fetchMessages();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('آیا از حذف این پیام اطمینان دارید؟')) return;
    setActionLoading(id);
    try {
      await adminFetch(`${API_BASE}/messages/`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      fetchMessages();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-center">
        <div className="space-y-3">
          <div className="w-10 h-10 border-4 border-slate-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-slate-400">در حال دریافت پیام‌های دریافتی...</p>
        </div>
      </div>
    );
  }

  const unreadCount = messages.filter(m => !m.is_read).length;

  return (
    <div className="space-y-8 animate-fade-in text-right">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black dark:text-white text-slate-900 flex items-center gap-3">
          <Mail className="w-7 h-7 text-brand-500" />
          صندوق پیام‌های تماس با ما
        </h1>
        <p className="text-xs sm:text-sm dark:text-slate-400 text-slate-600">
          پیام‌های ارسال شده توسط کاربران از فرم صفحه اصلی را در اینجا مدیریت کنید.
        </p>
      </div>

      <div className="flex items-center gap-4 border-b dark:border-slate-800 border-slate-200 pb-2">
        <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400">کل پیام‌ها:</span>
          <span className="text-sm font-black text-white">{messages.length}</span>
        </div>
        <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
          <span className="text-xs font-bold text-emerald-500">خوانده نشده:</span>
          <span className="text-sm font-black text-emerald-400">{unreadCount}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {messages.length === 0 ? (
          <div className="p-8 text-center glass-card rounded-3xl border dark:border-slate-800 border-slate-200">
            <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-3 opacity-50" />
            <p className="text-sm font-bold text-slate-400">هیچ پیامی در صندوق دریافت نشده است.</p>
          </div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={`p-6 rounded-3xl border transition-all ${m.is_read ? 'bg-slate-900/50 border-slate-800/50 opacity-70' : 'glass-card border-brand-500/30 shadow-lg shadow-brand-500/5'} flex flex-col sm:flex-row gap-6 relative overflow-hidden`}>
              {!m.is_read && (
                <div className="absolute top-0 right-0 w-1.5 h-full bg-brand-500 shadow-[0_0_10px_rgba(var(--brand-500),0.8)]"></div>
              )}
              
              <div className="flex-1 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h3 className="text-lg font-black dark:text-white text-slate-900 flex items-center gap-2">
                    {m.is_read ? <MailOpen className="w-5 h-5 text-slate-500" /> : <Mail className="w-5 h-5 text-brand-400" />}
                    {m.subject}
                  </h3>
                  <span className="text-xs font-mono text-slate-400 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">{m.created_at}</span>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <span className="text-xs font-bold bg-slate-800 text-slate-300 px-3 py-1 rounded-lg">👤 فرستنده: {m.name}</span>
                  <span className="text-xs font-bold bg-slate-800 text-slate-300 px-3 py-1 rounded-lg dir-ltr">📞 {m.phone}</span>
                  {m.email && <span className="text-xs font-bold bg-slate-800 text-slate-300 px-3 py-1 rounded-lg dir-ltr">✉️ {m.email}</span>}
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/50">
                  <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{m.message}</p>
                </div>
              </div>

              <div className="flex flex-row sm:flex-col items-center justify-end sm:justify-start gap-2 shrink-0">
                {!m.is_read && (
                  <button 
                    onClick={() => handleMarkAsRead(m.id)}
                    disabled={actionLoading === m.id}
                    className="w-full px-4 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 text-xs font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    علامت خوانده شده
                  </button>
                )}
                <button 
                  onClick={() => handleDelete(m.id)}
                  disabled={actionLoading === m.id}
                  className="w-full px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-500 text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  حذف دائم
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
