'use client';

import React, { useState, useEffect } from 'react';
import { getAdminAILogs } from '@/lib/api';
import { Bot, Cpu, DollarSign, Clock, ShieldAlert, Sparkles, Building2 } from 'lucide-react';

export default function AdminAIUsagePage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      try {
        const res = await getAdminAILogs();
        setLogs(res);
      } catch (err) {
        console.error('Error loading admin AI logs:', err);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, []);

  const totalQueries = logs.length;
  const totalCost = logs.reduce((sum, item) => sum + (item.cost_deducted || 240), 0);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-center">
        <div className="space-y-3">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-slate-400">در حال دریافت مانیتورینگ AI کل سیستم...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in text-right">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black dark:text-white text-slate-900 flex items-center gap-3">
          <Bot className="w-7 h-7 text-purple-500" />
          پایش متمرکز & مانیتورینگ مصرف AI کل سازمان‌ها
        </h1>
        <p className="text-xs sm:text-sm dark:text-slate-400 text-slate-600">
          مشاهده تمام پردازش‌های بینایی ماشین OCR و مدل‌های زبانی ANPK Vision به تفکیک سازمان و پروژه.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 space-y-2 shadow-xl">
          <div className="flex items-center justify-between text-xs dark:text-slate-400 text-slate-600 font-bold">
            <span>کل کوئری‌های هوش مصنوعی کل پلتفرم</span>
            <Cpu className="w-5 h-5 text-purple-500" />
          </div>
          <span className="text-2xl font-black text-purple-600 dark:text-purple-400 block dir-rtl">
            {totalQueries.toLocaleString('fa-IR')} <span className="text-xs font-sans dark:text-slate-400 text-slate-500">پردازش</span>
          </span>
        </div>

        <div className="p-6 rounded-3xl dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 space-y-2 shadow-xl">
          <div className="flex items-center justify-between text-xs dark:text-slate-400 text-slate-600 font-bold">
            <span>مجموع درآمد کسر شده از کیف‌پول‌ها</span>
            <DollarSign className="w-5 h-5 text-emerald-500" />
          </div>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 block dir-rtl">
            {totalCost.toLocaleString('fa-IR')} <span className="text-xs font-sans dark:text-slate-400 text-slate-500">تومان</span>
          </span>
        </div>
      </div>

      {/* AI Logs Table */}
      <div className="p-6 sm:p-8 rounded-3xl glass-card border dark:border-slate-800 border-slate-200 space-y-4">
        <h2 className="text-base font-bold dark:text-white text-slate-900 flex items-center gap-2">
          <Clock className="w-5 h-5 text-purple-500" />
          ریز گزارش کوئری‌های هوش مصنوعی به ترتیب تاریخ:
        </h2>

        {logs.length === 0 ? (
          <div className="p-8 text-center dark:text-slate-500 text-slate-400 text-xs font-bold">
            هیچ کوئری هوش مصنوعی تاکنون ثبت نشده است.
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log: any) => (
              <div key={log.id} className="p-4 rounded-2xl dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-purple-500" />
                    <span className="text-xs font-bold dark:text-white text-slate-900">{log.client_name} ({log.project_name})</span>
                  </div>
                  <p className="text-xs dark:text-slate-300 text-slate-700 font-medium">{log.user_query}</p>
                  <span className="text-[10px] text-purple-600 dark:text-purple-400 font-mono font-bold block">مدل: {log.model_used}</span>
                </div>

                <div className="text-left shrink-0">
                  <span className="text-xs font-black text-rose-500 block dir-rtl">-{log.cost_deducted} تومان</span>
                  <span className="text-[10px] dark:text-slate-500 text-slate-400 font-mono block">{log.created_at}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
