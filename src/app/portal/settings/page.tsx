'use client';

import React, { useState, useEffect } from 'react';
import { getAPIKeys, createAPIKey } from '@/lib/api';
import { Settings, KeyRound, PlusCircle, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function PortalSettingsPage() {
  const [keys, setKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [createdNotice, setCreatedNotice] = useState('');

  const fetchKeys = async () => {
    try {
      const res = await getAPIKeys();
      setKeys(res);
    } catch (err) {
      console.error('Error fetching API keys:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName) return;

    setSubmitting(true);
    setCreatedNotice('');
    try {
      const res = await createAPIKey(newKeyName);
      setCreatedNotice(`کلید API جدید صادر گردید: ${res.api_key}`);
      setNewKeyName('');
      fetchKeys();
    } catch (err) {
      console.error('Error creating API key:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-center">
        <div className="space-y-3">
          <div className="w-10 h-10 border-4 border-slate-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-slate-400">در حال دریافت کلیدهای API از دیتابیس جنگو...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in text-right">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black dark:text-white text-slate-900 flex items-center gap-3">
          <Settings className="w-7 h-7 text-slate-400" />
          تنظیمات متمرکز & کلیدهای API اختصاصی
        </h1>
        <p className="text-xs sm:text-sm dark:text-slate-400 text-slate-600">
          مدیریت کلیدهای امنیتی `X-ANPK-API-KEY` جهت اتصال به پروژه‌های بومی و پلتفرم‌های کلود ANPK.
        </p>
      </div>

      {/* Create New Key Section */}
      <div className="p-6 sm:p-8 rounded-3xl glass-card border dark:border-slate-800 border-slate-200 space-y-6">
        <div className="flex items-center gap-2 border-b dark:border-slate-800 border-slate-200 pb-4">
          <KeyRound className="w-5 h-5 text-brand-500" />
          <h2 className="text-lg font-black dark:text-white text-slate-900">صدور کلید API اختصاصی جدید</h2>
        </div>

        {createdNotice && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center justify-between gap-2">
            <span className="font-mono dir-ltr">{createdNotice}</span>
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
          </div>
        )}

        <form onSubmit={handleCreateKey} className="flex flex-col sm:flex-row items-center gap-4">
          <input
            type="text"
            required
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            placeholder="عنوان کاربرد کلید (مثلاً: کلید اختصاصی پروژه بیمارستان ولایت)"
            className="w-full px-4 py-3 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 border-slate-300 text-xs dark:text-white text-slate-900 focus:outline-none focus:border-brand-500"
          />
          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-all shadow-lg shadow-brand-500/20 shrink-0 flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{submitting ? 'در حال صدور...' : 'صدور کلید جدید'}</span>
          </button>
        </form>
      </div>

      {/* Keys List */}
      <div className="p-6 sm:p-8 rounded-3xl glass-card border dark:border-slate-800 border-slate-200 space-y-4">
        <h2 className="text-base font-bold dark:text-white text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-500" />
          فهرست کلیدهای فعال API ثبت‌شده در دیتابیس:
        </h2>

        {keys.length === 0 ? (
          <div className="p-8 text-center dark:text-slate-500 text-slate-400 text-xs font-bold">
            هیچ کلید API تاکنون ایجاد نشده است.
          </div>
        ) : (
          <div className="space-y-3">
            {keys.map((k: any) => (
              <div key={k.id} className="p-4 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-800 border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
                <div>
                  <span className="text-xs font-bold dark:text-white text-slate-900 block">{k.name}</span>
                  <span className="text-[10px] font-mono text-brand-600 dark:text-brand-400 font-bold dir-ltr block mt-0.5">{k.api_key}</span>
                </div>
                <span className="text-[10px] dark:text-slate-400 text-slate-500 shrink-0 font-mono">ایجاد: {k.created_at || 'امروز'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
