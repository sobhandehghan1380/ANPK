'use client';

import React, { useState, useEffect } from 'react';
import { getSMSLogs, getClientProjects, getProjectUsage } from '@/lib/api';
import { MessageSquare, Send, CheckCircle2, AlertCircle, Filter } from 'lucide-react';

export default function SMSLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProjects() {
      try {
        const projRes = await getClientProjects();
        setProjects(projRes || []);
      } catch (err) {
        console.error('Error loading projects:', err);
      }
    }
    loadProjects();
  }, []);

  useEffect(() => {
    async function fetchLogsData() {
      setLoading(true);
      try {
        if (selectedProjectId) {
          const usage = await getProjectUsage(selectedProjectId);
          setLogs(usage?.sms?.logs || []);
        } else {
          const res = await getSMSLogs();
          setLogs(res || []);
        }
      } catch (err) {
        console.error('Error loading SMS logs:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchLogsData();
  }, [selectedProjectId]);

  const totalCost = logs.reduce((sum, item) => sum + (item.cost || 75), 0);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in text-right">
      <div className="p-6 sm:p-8 rounded-3xl glass-card border dark:border-slate-800 border-slate-200/90 space-y-6 card-elevated">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b dark:border-slate-800 border-slate-200 pb-4">
          <div className="space-y-1">
            <h2 className="text-xl font-black dark:text-white text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-brand-500" />
              گزارشات ارسال پیامک سازمانی (SMS Logs)
            </h2>
            <p className="text-xs dark:text-slate-400 text-slate-600 font-medium">
              مشاهده وضعیت تحویل پیامک‌های کدهای OTP، هشدارها و اطلاع‌رسانی‌ها تفکیک‌شده بر حسب پروژه.
            </p>
          </div>

          <div className="text-left bg-slate-900 px-4 py-2 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold block">مجموع هزینه پیامک‌ها</span>
            <span className="text-sm font-black text-emerald-400 font-mono">
              {totalCost.toLocaleString('fa-IR')} تومان
            </span>
          </div>
        </div>

        {/* Project Selector Filter Bar */}
        <div className="p-4 rounded-2xl dark:bg-slate-900/60 bg-slate-50 border dark:border-slate-800 border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-bold dark:text-slate-300 text-slate-700">
            <Filter className="w-4 h-4 text-brand-500" />
            <span>فیلتر پیامک‌ها بر اساس پروژه:</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full sm:w-64 px-4 py-2 rounded-xl dark:bg-slate-950 bg-white border dark:border-slate-700 border-slate-300 text-xs font-bold dark:text-white text-slate-900 focus:outline-none focus:border-brand-500"
            >
              <option value="">همه پیامک‌های سازمان</option>
              {projects.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.title} (قرارداد {p.contract_number})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* SMS Logs List */}
        {loading ? (
          <div className="p-8 text-center text-xs dark:text-slate-400 text-slate-500">در حال بروزرسانی پیامک‌ها...</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center space-y-2 dark:bg-slate-900/40 bg-slate-50 rounded-2xl border dark:border-slate-800 border-slate-200">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs font-bold dark:text-slate-300 text-slate-700">هیچ گزارش پیامکی برای پروژه انتخابی یافت نشد.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log: any, idx: number) => (
              <div
                key={log.id || idx}
                className="p-5 rounded-2xl dark:bg-slate-900/90 bg-white border dark:border-slate-800 border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
              >
                <div className="space-y-1.5 text-right">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-brand-600 dark:text-brand-400 bg-brand-500/10 px-2.5 py-0.5 rounded-full border border-brand-500/20">
                      گیرنده: {log.recipient}
                    </span>
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                      پروژه: {log.project_title}
                    </span>
                    <span className="text-[10px] dark:text-slate-400 text-slate-500">{log.operator}</span>
                    <span className="text-[10px] dark:text-slate-500 text-slate-400">{log.sent_at || log.date}</span>
                  </div>
                  <p className="text-xs font-bold dark:text-white text-slate-900">{log.text}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-3 py-1 rounded-xl border border-rose-500/20">
                    -{log.cost || 75} تومان
                  </span>

                  <span className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>تحویل گردیده</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
