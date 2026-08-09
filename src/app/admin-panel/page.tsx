'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAdminOverview } from '@/lib/api';
import {
  Users,
  FolderGit2,
  Wallet,
  MessageSquare,
  PackageCheck,
  ArrowUpRight,
  Server,
  ShieldCheck
} from 'lucide-react';

export default function AdminPanelOverviewPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await getAdminOverview();
        setData(res);
      } catch (err) {
        console.error('Error loading admin overview in admin-panel:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-center">
        <div className="space-y-3">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-slate-400">در حال دریافت داده‌های زنده از بک‌اند جنگو...</p>
        </div>
      </div>
    );
  }

  const totalClients = data?.total_clients || 0;
  const activeProjects = data?.active_projects || 0;
  const walletsBalance = data?.total_wallets_balance || 0;
  const pendingTickets = data?.pending_tickets || 0;
  const recentLeads = data?.recent_leads || [];
  const nodes = data?.nodes || [];

  return (
    <div className="space-y-8 animate-fade-in text-right">
      {/* Top Banner Header */}
      <div className="p-6 sm:p-8 rounded-3xl dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-xl sm:text-3xl font-black dark:text-white text-slate-900 leading-tight">
              مرکز فرماندهی و پایش سیستم <span className="text-brand-500">ANPK Admin Panel</span>
            </h1>
            <p className="text-xs sm:text-sm dark:text-slate-400 text-slate-600 font-medium">
              مدیریت لیدها، موجودی کیف پول سازمان‌ها، پاسخ به تیکت‌ها و پایش نودها از دیتابیس جنگو.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/admin/leads"
              className="px-5 py-3 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-lg transition-all flex items-center gap-2"
            >
              <PackageCheck className="w-4 h-4" />
              <span>مشاهده درخواست‌های لید ({recentLeads.length})</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-6 rounded-3xl dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold dark:text-slate-400 text-slate-600">سازمان‌های ثبت‌شده</span>
            <Users className="w-5 h-5 text-brand-500" />
          </div>
          <span className="text-2xl font-black dark:text-white text-slate-900 block dir-rtl">
            {totalClients.toLocaleString('fa-IR')} <span className="text-xs font-bold dark:text-slate-400 text-slate-500">سازمان</span>
          </span>
        </div>

        <div className="p-6 rounded-3xl dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold dark:text-slate-400 text-slate-600">پروژه‌های فعال</span>
            <FolderGit2 className="w-5 h-5 text-indigo-500" />
          </div>
          <span className="text-2xl font-black dark:text-white text-slate-900 block dir-rtl">
            {activeProjects.toLocaleString('fa-IR')} <span className="text-xs font-bold dark:text-slate-400 text-slate-500">پروژه</span>
          </span>
        </div>

        <div className="p-6 rounded-3xl dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold dark:text-slate-400 text-slate-600">کیف‌پول‌های سازمان‌ها</span>
            <Wallet className="w-5 h-5 text-emerald-500" />
          </div>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 block dir-rtl">
            {walletsBalance.toLocaleString('fa-IR')} <span className="text-xs font-bold dark:text-slate-400 text-slate-500">تومان</span>
          </span>
        </div>

        <div className="p-6 rounded-3xl dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold dark:text-slate-400 text-slate-600">تیکت‌های در حال بررسی</span>
            <MessageSquare className="w-5 h-5 text-amber-500" />
          </div>
          <span className="text-2xl font-black dark:text-white text-slate-900 block dir-rtl">
            {pendingTickets.toLocaleString('fa-IR')} <span className="text-xs font-bold dark:text-slate-400 text-slate-500">تیکت</span>
          </span>
        </div>
      </div>

      {/* Leads Table */}
      <div className="p-6 sm:p-8 rounded-3xl glass-card border dark:border-slate-800 border-slate-200 space-y-6">
        <div className="flex items-center justify-between border-b dark:border-slate-800 border-slate-200 pb-4">
          <div className="flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-brand-500" />
            <h2 className="text-lg font-black dark:text-white text-slate-900">آخرین لیدهای ثبت‌شده از فرم ۴ مرحله‌ای</h2>
          </div>
        </div>

        <div className="space-y-3">
          {recentLeads.map((lead: any) => (
            <div key={lead.id} className="p-4 rounded-2xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-800 border-slate-200 flex items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold dark:text-white text-slate-900 block">{lead.organization} (رابط: {lead.name})</span>
                <span className="text-[11px] dark:text-slate-400 text-slate-600 font-mono">سرویس: {lead.service_type} | بودجه: {lead.budget}</span>
              </div>
              <span className="text-xs font-mono dark:text-slate-300 text-slate-700 bg-slate-200 dark:bg-slate-800 px-3 py-1 rounded-xl">
                {lead.phone}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
