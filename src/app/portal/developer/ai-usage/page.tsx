'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAIUsageLogs, getClientProjects } from '@/lib/api';
import { Bot, Cpu, DollarSign, Clock, PlusCircle, Filter, Sparkles, CheckCircle2 } from 'lucide-react';

export default function PortalAIUsagePage() {
  const [aiLogs, setAiLogs] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [aiRate, setAiRate] = useState<number>(240);

  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await getClientProjects();
        setProjects(res);
      } catch (err) {
        console.error('Error loading projects for AI filter:', err);
      }
    }
    loadProjects();
  }, []);

  useEffect(() => {
    async function loadAILogs() {
      setLoading(true);
      try {
        const res = await getAIUsageLogs(selectedProjectId);
        setAiLogs(res);
      } catch (err) {
        console.error('Error loading AI logs:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAILogs();
  }, [selectedProjectId]);

  const totalCost = aiLogs.reduce((sum: number, item: any) => sum + (item.cost_deducted || 240), 0);

  return (
    <div className="space-y-8 animate-fade-in text-right">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b dark:border-slate-800 border-slate-200 pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black dark:text-white text-slate-900 flex items-center gap-3">
            <Bot className="w-7 h-7 text-purple-500" />
            میزان مصرف سرویس‌ها & APIهای هوش مصنوعی (AI Usage)
          </h1>
          <p className="text-xs sm:text-sm dark:text-slate-400 text-slate-600 font-medium">
            پایش لحظه‌ای و فیلتر هزینه‌های بینایی ماشین OCR و پردازش زبان طبیعی بر حسب پروژه.
          </p>
        </div>

        <Link
          href="/portal/wallet"
          className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-colors shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>شارژ اعتباری کیف پول AI</span>
        </Link>
      </div>

      {/* Project Filter Bar */}
      <div className="p-4 rounded-2xl dark:bg-slate-900/60 bg-slate-50 border dark:border-slate-800 border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-bold dark:text-slate-300 text-slate-700">
          <Filter className="w-4 h-4 text-purple-500" />
          <span>فیلتر هزینه‌های AI بر اساس پروژه:</span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="w-full sm:w-64 px-4 py-2 rounded-xl dark:bg-slate-950 bg-white border dark:border-slate-700 border-slate-300 text-xs font-bold dark:text-white text-slate-900 focus:outline-none focus:border-purple-500"
          >
            <option value="">همه پروژه‌های کارفرما</option>
            {projects.map((p: any) => (
              <option key={p.id} value={p.id}>
                {p.title} (قرارداد {p.contract_number})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl dark:bg-slate-900/90 bg-white border dark:border-slate-800 border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs dark:text-slate-400 text-slate-600 font-bold">
            <span>تعداد کل کوئری‌ها</span>
            <Cpu className="w-4 h-4 text-purple-500" />
          </div>
          <span className="text-xl font-black text-purple-600 dark:text-purple-400 block dir-ltr text-right">
            {aiLogs.length.toLocaleString('fa-IR')} <span className="text-xs font-sans dark:text-slate-400 text-slate-500">کوئری</span>
          </span>
          <div className="w-full dark:bg-slate-800 bg-slate-200 h-2 rounded-full overflow-hidden">
            <div className="bg-purple-500 h-full w-full rounded-full"></div>
          </div>
        </div>

        <div className="p-5 rounded-2xl dark:bg-slate-900/90 bg-white border dark:border-slate-800 border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs dark:text-slate-400 text-slate-600 font-bold">
            <span>تعرفه هر کوئری</span>
            <Sparkles className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 block dir-ltr text-right">
            {aiRate} <span className="text-xs font-sans dark:text-slate-400 text-slate-500">تومان</span>
          </span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-500 font-bold block">کسر آنی از کیف پول</span>
        </div>

        <div className="p-5 rounded-2xl dark:bg-slate-900/90 bg-white border dark:border-slate-800 border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs dark:text-slate-400 text-slate-600 font-bold">
            <span>مجموع هزینه پردازش شده</span>
            <DollarSign className="w-4 h-4 text-purple-500" />
          </div>
          <span className="text-xl font-black text-purple-600 dark:text-purple-400 block dir-ltr text-right">
            {totalCost.toLocaleString('fa-IR')} <span className="text-xs font-sans dark:text-slate-400 text-slate-500">تومان</span>
          </span>
          <span className="text-[10px] dark:text-slate-400 text-slate-500 block">فیلتر بر حسب پروژه انتخابی</span>
        </div>
      </div>

      {/* AI Logs Table */}
      <div className="p-6 rounded-3xl glass-card border dark:border-slate-800 border-slate-200 space-y-4">
        <h3 className="text-sm font-bold dark:text-white text-slate-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-purple-500" />
          ریز لاگ‌های پردازش مدل‌های هوش مصنوعی ANPK Vision:
        </h3>

        {loading ? (
          <div className="p-8 text-center text-xs dark:text-slate-400 text-slate-500 font-bold">در حال دریافت لاگ‌های AI...</div>
        ) : aiLogs.length === 0 ? (
          <div className="p-8 text-center dark:text-slate-500 text-slate-400 text-xs font-bold">
            هیچ کوئری هوش مصنوعی برای پروژه انتخابی ثبت نشده است.
          </div>
        ) : (
          <div className="space-y-3">
            {aiLogs.map((log: any) => (
              <div key={log.id} className="p-4 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-800 border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-xs font-bold dark:text-white text-slate-900 block">{log.user_query}</span>
                  <p className="text-[11px] dark:text-slate-400 text-slate-600 line-clamp-1">{log.ai_response}</p>
                  <span className="text-[10px] text-purple-600 dark:text-purple-400 font-mono font-bold block">پروژه: {log.project_name} | مدل: {log.model_used}</span>
                </div>

                <div className="text-left shrink-0">
                  <span className="text-xs font-black text-rose-500 block dir-rtl">-{log.cost_deducted} تومان</span>
                  <span className="text-[10px] dark:text-slate-500 text-slate-400 block">{log.created_at}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
