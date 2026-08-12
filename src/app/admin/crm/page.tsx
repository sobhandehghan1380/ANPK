'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { adminFetch } from '@/lib/api';
import { 
  Building2, Users, Target, TrendingUp, Wallet, FolderGit2, 
  ArrowLeft, CheckCircle2, Clock, AlertCircle
} from 'lucide-react';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export default function CRMDashboardPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cList, lList] = await Promise.all([
        adminFetch(`${API_BASE}/api/admin/clients/`),
        adminFetch(`${API_BASE}/api/leads/submit/`),
      ]);
      setClients(cList || []);
      setLeads(Array.isArray(lList) ? lList : []);
    } catch (err) {
      console.error('Error loading CRM data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const stats = useMemo(() => {
    const totalClients = clients.length;
    const totalLeads = leads.length;
    const hotLeads = leads.filter(l => l.priority === 'hot').length;
    const warmLeads = leads.filter(l => l.priority === 'warm').length;
    const coldLeads = leads.filter(l => l.priority === 'cold').length;
    const newLeads = leads.filter(l => l.status === 'new').length;
    const contactedLeads = leads.filter(l => l.status === 'contacted').length;
    const contractLeads = leads.filter(l => l.status === 'contract').length;
    const totalWalletBalance = clients.reduce((sum, c) => sum + (c.wallet_balance || 0), 0);
    const totalProjects = clients.reduce((sum, c) => sum + (c.projects_count || 0), 0);
    const clientsWithPortal = clients.filter(c => c.portal_access).length;

    // Conversion rate (leads that became clients)
    const conversionRate = totalLeads > 0 ? Math.round((contractLeads / totalLeads) * 100) : 0;

    return {
      totalClients, totalLeads, hotLeads, warmLeads, coldLeads,
      newLeads, contactedLeads, contractLeads,
      totalWalletBalance, totalProjects, clientsWithPortal, conversionRate
    };
  }, [clients, leads]);

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs font-bold text-slate-400">در حال بارگذاری داشبورد CRM...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in text-right">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black dark:text-white text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-7 h-7 text-brand-500" />
            داشبورد CRM
          </h1>
          <p className="text-xs text-slate-400 mt-1">نمای کلی از مشتریان، سرنخ‌ها و عملکرد فروش</p>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-card rounded-2xl p-4 border dark:border-slate-800 hover:border-brand-500/30 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-brand-500" />
            </div>
            <div>
              <div className="text-xl font-black dark:text-white">{stats.totalClients}</div>
              <div className="text-[10px] text-slate-400">سازمان‌ها</div>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-2xl p-4 border dark:border-slate-800 hover:border-emerald-500/30 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Target className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <div className="text-xl font-black dark:text-white">{stats.totalLeads}</div>
              <div className="text-[10px] text-slate-400">سرنخ‌ها</div>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-2xl p-4 border dark:border-slate-800 hover:border-amber-500/30 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <div className="text-xl font-black dark:text-white">{stats.conversionRate}%</div>
              <div className="text-[10px] text-slate-400">نرخ تبدیل</div>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-2xl p-4 border dark:border-slate-800 hover:border-sky-500/30 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-sky-500" />
            </div>
            <div>
              <div className="text-lg font-black dark:text-white">{(stats.totalWalletBalance / 1000000).toFixed(1)}M</div>
              <div className="text-[10px] text-slate-400">کل موجودی</div>
            </div>
          </div>
        </div>
      </div>

      {/* Leads Pipeline */}
      <div className="glass-card rounded-2xl p-5 border dark:border-slate-800">
        <h3 className="text-sm font-bold dark:text-white mb-4 flex items-center gap-2">
          <Target className="w-4 h-4 text-brand-500" />
          پایپ‌لاین سرنخ‌ها
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="text-[10px] font-bold text-slate-400">جدید</span>
            </div>
            <div className="text-2xl font-black text-blue-500">{stats.newLeads}</div>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-amber-500"></div>
              <span className="text-[10px] font-bold text-slate-400">در حال پیگیری</span>
            </div>
            <div className="text-2xl font-black text-amber-500">{stats.contactedLeads}</div>
          </div>
          <div className="p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
              <span className="text-[10px] font-bold text-slate-400">مذاکره</span>
            </div>
            <div className="text-2xl font-black text-indigo-500">{stats.contractLeads}</div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-[10px] font-bold text-slate-400">تکمیل شده</span>
            </div>
            <div className="text-2xl font-black text-emerald-500">{stats.contractLeads}</div>
          </div>
        </div>
      </div>

      {/* Priority Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card rounded-2xl p-5 border dark:border-slate-800">
          <h3 className="text-sm font-bold dark:text-white mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500" />
            توزیع اولویت سرنخ‌ها
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                <span className="text-xs text-slate-400">داغ (فوری)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: `${stats.totalLeads > 0 ? (stats.hotLeads / stats.totalLeads) * 100 : 0}%` }}></div>
                </div>
                <span className="text-xs font-bold text-rose-500 w-6">{stats.hotLeads}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <span className="text-xs text-slate-400">گرم (احتمالی)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${stats.totalLeads > 0 ? (stats.warmLeads / stats.totalLeads) * 100 : 0}%` }}></div>
                </div>
                <span className="text-xs font-bold text-amber-500 w-6">{stats.warmLeads}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-sky-500"></div>
                <span className="text-xs text-slate-400">سرد (بلندمدت)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-sky-500 rounded-full" style={{ width: `${stats.totalLeads > 0 ? (stats.coldLeads / stats.totalLeads) * 100 : 0}%` }}></div>
                </div>
                <span className="text-xs font-bold text-sky-500 w-6">{stats.coldLeads}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border dark:border-slate-800">
          <h3 className="text-sm font-bold dark:text-white mb-4 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-brand-500" />
            آمار سازمان‌ها
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-2 rounded-lg dark:bg-slate-900/50 bg-slate-50">
              <span className="text-xs text-slate-400">کل سازمان‌ها</span>
              <span className="text-sm font-black dark:text-white">{stats.totalClients}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg dark:bg-slate-900/50 bg-slate-50">
              <span className="text-xs text-slate-400">با دسترسی پورتال</span>
              <span className="text-sm font-black text-brand-500">{stats.clientsWithPortal}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg dark:bg-slate-900/50 bg-slate-50">
              <span className="text-xs text-slate-400">کل پروژه‌ها</span>
              <span className="text-sm font-black text-emerald-500">{stats.totalProjects}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg dark:bg-slate-900/50 bg-slate-50">
              <span className="text-xs text-slate-400">موجودی کیف پول‌ها</span>
              <span className="text-sm font-black text-amber-500">{(stats.totalWalletBalance / 1000000).toFixed(1)}M تومان</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link href="/admin/crm/clients" className="p-4 rounded-2xl glass-card border dark:border-slate-800 hover:border-brand-500/30 transition-all group">
          <Building2 className="w-8 h-8 text-brand-500 mb-2 group-hover:scale-110 transition-transform" />
          <h4 className="text-sm font-bold dark:text-white">مدیریت سازمان‌ها</h4>
          <p className="text-[10px] text-slate-400 mt-1">مشاهده و ویرایش مشتریان</p>
        </Link>
        <Link href="/admin/crm/leads" className="p-4 rounded-2xl glass-card border dark:border-slate-800 hover:border-emerald-500/30 transition-all group">
          <Target className="w-8 h-8 text-emerald-500 mb-2 group-hover:scale-110 transition-transform" />
          <h4 className="text-sm font-bold dark:text-white">سرنخ‌های فروش</h4>
          <p className="text-[10px] text-slate-400 mt-1">مدیریت پایپ‌لاین فروش</p>
        </Link>
        <Link href="/admin/crm/messages" className="p-4 rounded-2xl glass-card border dark:border-slate-800 hover:border-sky-500/30 transition-all group">
          <FolderGit2 className="w-8 h-8 text-sky-500 mb-2 group-hover:scale-110 transition-transform" />
          <h4 className="text-sm font-bold dark:text-white">صندوق پیام‌ها</h4>
          <p className="text-[10px] text-slate-400 mt-1">پیام‌های دریافتی کاربران</p>
        </Link>
      </div>
    </div>
  );
}
