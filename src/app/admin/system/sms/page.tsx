'use client';

import React, { useState, useEffect } from 'react';
import { getAdminSMSLogs, adminFetch } from '@/lib/api';
import { Send, PlusCircle, CheckCircle2, MessageSquare, PhoneCall, Filter } from 'lucide-react';

export default function AdminSMSPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Send Form State
  const [recipient, setRecipient] = useState('');
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const loadLogs = async () => {
    try {
      const res = await getAdminSMSLogs();
      setLogs(res || []);
    } catch (err) {
      console.error('Error loading SMS logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleSendSMS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient || !text) return;

    setSubmitting(true);
    setSuccessMsg('');
    try {
      const res = await adminFetch('http://127.0.0.1:8000/api/admin/sms-logs/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient, text })
      });
      const data = await res.json();
      if (data?.message) {
        setSuccessMsg(data.message);
        setRecipient('');
        setText('');
        loadLogs();
      }
    } catch (err) {
      console.error('Error sending SMS:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-center">
        <div className="space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-slate-400">در حال دریافت گزارش‌های سامانه پیامک بومی...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in text-right">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black dark:text-white text-slate-900 flex items-center gap-3">
          <Send className="w-7 h-7 text-indigo-500" />
          ارسال پیامک مستقیم & پایش تراکنش‌های پنل پیامکی
        </h1>
        <p className="text-xs sm:text-sm dark:text-slate-400 text-slate-600">
          ارسال پیامک اطلاع‌رسانی مستقیم به شماره کارفرمایان و پایش تاریخچه پیامک‌های ارسالی.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Send Direct SMS Form */}
      <div className="p-6 sm:p-8 rounded-3xl glass-card border dark:border-slate-800 border-slate-200 space-y-6 shadow-xl">
        <div className="flex items-center gap-2 border-b dark:border-slate-800 border-slate-200 pb-4">
          <Send className="w-5 h-5 text-indigo-500" />
          <h2 className="text-lg font-black dark:text-white text-slate-900">ارسال پیامک سازمانی به شماره همراه</h2>
        </div>

        <form onSubmit={handleSendSMS} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold dark:text-slate-300 text-slate-700 block">شماره همراه گیرنده:</label>
            <input
              type="text"
              required
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="09130000000"
              className="w-full sm:w-80 px-4 py-3 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 border-slate-300 text-xs dark:text-white text-slate-900 focus:outline-none focus:border-indigo-500 font-mono font-bold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold dark:text-slate-300 text-slate-700 block">متن پیامک:</label>
            <textarea
              rows={3}
              required
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="متن پیامک اطلاع‌رسانی، کد پیگیری یا هماهنگی..."
              className="w-full px-4 py-3 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 border-slate-300 text-xs dark:text-white text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>{submitting ? 'در حال ارسال...' : 'ارسال فوری پیامک'}</span>
          </button>
        </form>
      </div>

      {/* SMS Logs Table */}
      <div className="p-6 sm:p-8 rounded-3xl glass-card border dark:border-slate-800 border-slate-200 space-y-4">
        <h2 className="text-base font-bold dark:text-white text-slate-900">تاریخچه پیامک‌های ارسالی سیستم:</h2>

        <div className="space-y-3">
          {logs.map((s: any) => (
            <div key={s.id} className="p-4 rounded-2xl dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-indigo-500">شماره گیرنده: {s.recipient}</span>
                <span className="text-[10px] text-slate-400 font-mono">{s.sent_at}</span>
              </div>
              <p className="text-xs dark:text-slate-300 text-slate-700 font-medium">{s.text}</p>
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t dark:border-slate-800 border-slate-200">
                <span>اپراتور: {s.operator}</span>
                <span>هزینه: {s.cost} تومان</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

