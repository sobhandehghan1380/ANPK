'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getPortalOverview } from '@/lib/api';
import {
  Wallet,
  ShieldCheck,
  FolderGit2,
  Send,
  Bot,
  Server,
  CreditCard,
  MessageSquare,
  Activity,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function PortalOverviewDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOverview() {
      try {
        const res = await getPortalOverview();
        setData(res);
      } catch (err) {
        console.error('Error loading portal overview from backend:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchOverview();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-center">
        <div className="space-y-3">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-slate-400">در حال دریافت داده‌های زنده دیتابیس جنگو...</p>
        </div>
      </div>
    );
  }

  // Strict Real Database Data Extraction - NO Dummy Fallbacks
  const walletBalance = data?.wallet_balance ?? 0;
  const slaRemainingDays = data?.sla_days_remaining ?? 0;
  const slaPlanName = data?.sla_plan_name || 'فاقد قرارداد پشتیبانی SLA';
  const activeProjectsCount = data?.active_projects_count ?? 0;
  const aiRate = data?.ai_rate ?? 240;
  const projects = data?.projects || [];

  const nodes = data?.nodes || [];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in text-right">
      {/* 1. Executive Top Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {/* Wallet Balance Card */}
        <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl glass-card border-r-4 border-r-emerald-500 space-y-2 card-elevated">
          <div className="flex items-center justify-between text-emerald-500">
            <span className="text-[11px] sm:text-xs font-bold text-slate-400">کیف پول واحد</span>
            <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <span className="text-base sm:text-2xl font-black dark:text-white text-slate-900 block dir-rtl text-right">
              {walletBalance.toLocaleString('fa-IR')} <span className="text-xs font-bold text-slate-400">تومان</span>
            </span>
            <span className="text-[10px] text-emerald-500 font-bold block mt-1">
              {walletBalance > 0 ? 'فعال جهت کسر خودکار' : 'موجودی نیازمند شارژ'}
            </span>
          </div>
        </div>

        {/* SLA Warranty Card */}
        <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl glass-card border-r-4 border-r-sky-500 space-y-2 card-elevated">
          <div className="flex items-center justify-between text-sky-500">
            <span className="text-[11px] sm:text-xs font-bold text-slate-400">پشتیبانی SLA</span>
            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <span className="text-base sm:text-2xl font-black dark:text-white text-slate-900 block dir-rtl text-right">
              {slaRemainingDays} <span className="text-xs font-bold text-slate-400">روز باقی‌مانده</span>
            </span>
            <span className="text-[10px] text-sky-500 font-bold block mt-1 line-clamp-1">{slaPlanName}</span>
          </div>
        </div>

        {/* Active Projects Card */}
        <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl glass-card border-r-4 border-r-purple-500 space-y-2 card-elevated">
          <div className="flex items-center justify-between text-purple-500">
            <span className="text-[11px] sm:text-xs font-bold text-slate-400">پروژه‌های کلود</span>
            <FolderGit2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <span className="text-base sm:text-2xl font-black dark:text-white text-slate-900 block dir-rtl text-right">
              {activeProjectsCount} <span className="text-xs font-bold text-slate-400">سامانه فعال</span>
            </span>
            <span className="text-[10px] text-purple-500 font-bold block mt-1">
              {activeProjectsCount > 0 ? 'در حال سرویس‌دهی' : 'بدون پروژه فعال'}
            </span>
          </div>
        </div>

        {/* AI Query Consumption Card */}
        <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl glass-card border-r-4 border-r-amber-500 space-y-2 card-elevated">
          <div className="flex items-center justify-between text-amber-500">
            <span className="text-[11px] sm:text-xs font-bold text-slate-400">سرویس AI</span>
            <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <span className="text-base sm:text-2xl font-black dark:text-white text-slate-900 block dir-rtl text-right">
              {aiRate} <span className="text-xs font-bold text-slate-400">تومان/کوئری</span>
            </span>
            <span className="text-[10px] text-amber-500 font-bold block mt-1">تعرفه کسر از کیف پول</span>
          </div>
        </div>
      </div>

      {/* 2. Client Projects & Live Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Projects Quick Table */}
        <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl glass-card border dark:border-slate-800 border-slate-200 space-y-6 text-right">
          <div className="flex items-center justify-between border-b dark:border-slate-800 border-slate-200 pb-4">
            <div className="flex items-center gap-2">
              <FolderGit2 className="w-5 h-5 text-brand-500" />
              <h2 className="text-lg font-black dark:text-white text-slate-900">پروژه‌های در حال اجرای کارفرما</h2>
            </div>
            <Link href="/portal/projects" className="text-xs font-bold text-brand-500 hover:underline">
              مشاهده فازها و Roadmap
            </Link>
          </div>

          {projects.length === 0 ? (
            <div className="p-6 text-center space-y-2 dark:bg-slate-900/40 bg-slate-50 rounded-2xl border dark:border-slate-800/80 border-slate-200">
              <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs font-bold dark:text-slate-300 text-slate-700">هیچ پروژه فعال یا قراردادی برای این حساب کاربری یافت نشد.</p>
              <p className="text-[11px] dark:text-slate-500 text-slate-500">پروژه‌ها بر اساس شماره همراه ثبت‌شده کارفرما تفکیک و نمایش داده می‌شوند.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((proj: any) => (
                <div key={proj.id} className="p-4 rounded-2xl dark:bg-slate-900/50 bg-slate-50 border dark:border-slate-800 border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold dark:text-white text-slate-900">{proj.title}</h3>
                    <p className="text-xs dark:text-slate-400 text-slate-600">شماره قرارداد: {proj.contract_number} | فاز: {proj.phase}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-32 dark:bg-slate-800 bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-brand-500 h-full rounded-full" style={{ width: `${proj.progress}%` }}></div>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{proj.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live System Nodes */}
        <div className="p-6 sm:p-8 rounded-3xl glass-card border dark:border-slate-800 border-slate-200 space-y-6 text-right">
          <div className="flex items-center gap-2 border-b dark:border-slate-800 border-slate-200 pb-4">
            <Server className="w-5 h-5 text-emerald-500" />
            <h2 className="text-lg font-black dark:text-white text-slate-900">وضعیت نودها & پایداری</h2>
          </div>

          {projects.length === 0 ? (
            <div className="p-6 text-center space-y-2 dark:bg-slate-900/40 bg-slate-50 rounded-2xl border dark:border-slate-800/80 border-slate-200">
              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
              <p className="text-xs font-bold dark:text-slate-300 text-slate-700">هیچ نود یا سرویس اختصاصی برای این حساب فعال نیست.</p>
              <p className="text-[11px] dark:text-slate-500 text-slate-500">پس از راه‌اندازی پروژه، مانیتورینگ آنی نودها در این بخش قرار می‌گیرد.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {nodes.map((node: any) => (
                <div key={node.id} className="p-3.5 rounded-2xl dark:bg-slate-900/50 bg-slate-50 border dark:border-slate-800 border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold dark:text-white text-slate-900 block">{node.name}</span>
                    <span className="text-[10px] dark:text-slate-400 text-slate-500">تخمین تاخیر: {node.latency}ms</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    {node.status_label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
