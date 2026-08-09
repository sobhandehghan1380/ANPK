'use client';

import React, { useState, useEffect } from 'react';
import { getAdminServicesConfig, updateAdminServicesConfig } from '@/lib/api';
import { Sliders, PlusCircle, CheckCircle2, Bot, Send, ShieldCheck, DollarSign } from 'lucide-react';

export default function AdminServicesConfigPage() {
  const [defaultModel, setDefaultModel] = useState('google/gemini-2.5-flash');
  const [rate, setRate] = useState(240);
  const [senderLine, setSenderLine] = useState('3000777');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const loadConfig = async () => {
    try {
      const res = await getAdminServicesConfig();
      if (res) {
        if (res.default_model) setDefaultModel(res.default_model);
        if (res.wallet_rate_per_query) setRate(res.wallet_rate_per_query);
        if (res.sender_line) setSenderLine(res.sender_line);
      }
    } catch (err) {
      console.error('Error loading admin services config:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg('');
    try {
      const res = await updateAdminServicesConfig(defaultModel, rate, senderLine);
      if (res?.message) {
        setSuccessMsg(res.message);
        loadConfig();
      }
    } catch (err) {
      console.error('Error updating services config:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-center">
        <div className="space-y-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-slate-400">در حال دریافت تنظیمات موتورهای هوش مصنوعی و سامانه پیامک...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in text-right">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black dark:text-white text-slate-900 flex items-center gap-3">
          <Sliders className="w-7 h-7 text-amber-500" />
          تنظیمات موتور هوش مصنوعی & خطوط پنل پیامک (Services & Gateways Config)
        </h1>
        <p className="text-xs sm:text-sm dark:text-slate-400 text-slate-600">
          تنظیم مدل پیش‌فرض پردازش زبانی و بینایی ماشین، نرخ تعرفه هر کوئری و شماره خط اختصاصی پیامک.
        </p>
      </div>

      <div className="p-6 sm:p-8 rounded-3xl glass-card border dark:border-slate-800 border-slate-200 space-y-6 shadow-xl">
        <div className="flex items-center gap-2 border-b dark:border-slate-800 border-slate-200 pb-4">
          <Bot className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg font-black dark:text-white text-slate-900">پیکربندی هوش مصنوعی و تعرفه‌ها</h2>
        </div>

        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold dark:text-slate-300 text-slate-700 block">مدل پیش‌فرض هوش مصنوعی (OpenRouter / ANPK):</label>
              <select
                value={defaultModel}
                onChange={(e) => setDefaultModel(e.target.value)}
                className="w-full px-4 py-3 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 border-slate-300 text-xs dark:text-white text-slate-900 focus:outline-none focus:border-amber-500 font-bold"
              >
                <option value="google/gemini-2.5-flash">Google Gemini 2.5 Flash (سریع و اقتصادی)</option>
                <option value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet (دقت بالای بینایی ماشین)</option>
                <option value="openai/gpt-4o">OpenAI GPT-4o (سازمانی ارشد)</option>
                <option value="anpk/ocr-v1">ANPK Vision OCR (بومی یزد)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold dark:text-slate-300 text-slate-700 block">تعرفه کسر از کیف پول (تومان per query):</label>
              <input
                type="number"
                required
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 border-slate-300 text-xs dark:text-white text-slate-900 focus:outline-none focus:border-amber-500 font-mono font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold dark:text-slate-300 text-slate-700 block">شماره خط اختصاصی پیامک:</label>
              <input
                type="text"
                required
                value={senderLine}
                onChange={(e) => setSenderLine(e.target.value)}
                className="w-full px-4 py-3 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 border-slate-300 text-xs dark:text-white text-slate-900 focus:outline-none focus:border-amber-500 font-mono font-bold"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{submitting ? 'در حال ذخیره‌سازی...' : 'ذخیره و بهینه‌سازی کانفیگ درگاه‌ها'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
