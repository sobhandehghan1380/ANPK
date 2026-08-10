'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { adminFetch } from '@/lib/api';
import { 
  Banknote, TrendingUp, TrendingDown, Wallet, FileText, 
  CreditCard, Repeat, Users, Calendar, ArrowLeft, 
  DollarSign, Activity, CheckCircle2, Clock, AlertCircle
} from 'lucide-react';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export default function FinanceDashboardPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [wallets, setWallets] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [invRes, walRes, subRes] = await Promise.all([
        adminFetch(`${API_BASE}/api/portal/admin/finance/invoices/`),
        adminFetch(`${API_BASE}/api/portal/admin/wallets/`),
        adminFetch(`${API_BASE}/api/portal/admin/finance/subscriptions/`),
      ]);
      setInvoices(invRes?.invoices || []);
      setWallets(Array.isArray(walRes) ? walRes : []);
      setSubscriptions(subRes?.subscriptions || []);
    } catch (err) {
      console.error('Error loading finance data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const stats = useMemo(() => {
    const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
    const paidRevenue = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
    const pendingRevenue = invoices.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
    const totalWalletBalance = wallets.reduce((sum, w) => sum + (w.balance || 0), 0);
    const activeSubscriptions = subscriptions.filter(sub => sub.is_active).length;
    const expiringSoon = subscriptions.filter(sub => sub.is_active && sub.days_remaining <= 7 && sub.days_remaining >= 0).length;
    const totalClients = wallets.length;
    const activeClients = wallets.filter(w => w.is_active).length;

    // Monthly revenue (last 6 months)
    const monthlyRevenue = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('fa-IR', { month: 'short' });
      const monthRevenue = invoices
        .filter(inv => {
          const invDate = new Date(inv.created_at);
          return invDate.getMonth() === date.getMonth() && invDate.getFullYear() === date.getFullYear() && inv.status === 'paid';
        })
        .reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
      monthlyRevenue.push({ month: monthName, amount: monthRevenue });
    }

    return {
      totalRevenue, paidRevenue, pendingRevenue,
      totalWalletBalance, activeSubscriptions, expiringSoon,
      totalClients, activeClients, monthlyRevenue,
      totalInvoices: invoices.length,
      paidInvoices: invoices.filter(inv => inv.status === 'paid').length,
      pendingInvoices: invoices.filter(inv => inv.status === 'pending').length
    };
  }, [invoices, wallets, subscriptions]);

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs font-bold text-slate-400">در حال بارگذاری داشبورد مالی...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in text-right">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black dark:text-white text-slate-900 flex items-center gap-2">
            <Banknote className="w-7 h-7 text-brand-500" />
            داشبورد مالی
          </h1>
          <p className="text-xs text-slate-400 mt-1">نمای کلی از درآمد، فاکتورها و اشتراک‌ها</p>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-card rounded-2xl p-4 border dark:border-slate-800 hover:border-emerald-500/30 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <div className="text-lg font-black dark:text-white">{(stats.totalRevenue / 1000000).toFixed(1)}M</div>
              <div className="text-[10px] text-slate-400">کل درآمد</div>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-2xl p-4 border dark:border-slate-800 hover:border-amber-500/30 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <div className="text-lg font-black dark:text-white">{(stats.pendingRevenue / 1000000).toFixed(1)}M</div>
              <div className="text-[10px] text-slate-400">در انتظار پرداخت</div>
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
              <div className="text-[10px] text-slate-400">موجودی کیف پول‌ها</div>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-2xl p-4 border dark:border-slate-800 hover:border-indigo-500/30 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
              <Repeat className="w-5 h-5 text-indigo-500" />
            </div>
            <div>
              <div className="text-lg font-black dark:text-white">{stats.activeSubscriptions}</div>
              <div className="text-[10px] text-slate-400">اشتراک فعال</div>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="glass-card rounded-2xl p-5 border dark:border-slate-800">
        <h3 className="text-sm font-bold dark:text-white mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-brand-500" />
          نمودار درآمد (۶ ماه اخیر)
        </h3>
        <div className="flex items-end gap-2 h-32">
          {stats.monthlyRevenue.map((month, idx) => {
            const maxAmount = Math.max(...stats.monthlyRevenue.map(m => m.amount), 1);
            const height = (month.amount / maxAmount) * 100;
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[9px] font-bold text-slate-400">{(month.amount / 1000000).toFixed(1)}M</span>
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-brand-500 to-brand-400 min-h-[4px] transition-all"
                  style={{ height: `${Math.max(height, 4)}%` }}
                />
                <span className="text-[9px] text-slate-400">{month.month}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Invoice Stats */}
        <div className="glass-card rounded-2xl p-5 border dark:border-slate-800">
          <h3 className="text-sm font-bold dark:text-white mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-500" />
            آمار فاکتورها
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">کل فاکتورها</span>
              <span className="text-sm font-black dark:text-white">{stats.totalInvoices}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">پرداخت شده</span>
              <span className="text-sm font-black text-emerald-500">{stats.paidInvoices}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">در انتظار</span>
              <span className="text-sm font-black text-amber-500">{stats.pendingInvoices}</span>
            </div>
            <div className="pt-3 border-t dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">نرخ پرداخت</span>
                <span className="text-sm font-black text-brand-500">
                  {stats.totalInvoices > 0 ? Math.round((stats.paidInvoices / stats.totalInvoices) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Stats */}
        <div className="glass-card rounded-2xl p-5 border dark:border-slate-800">
          <h3 className="text-sm font-bold dark:text-white mb-4 flex items-center gap-2">
            <Repeat className="w-4 h-4 text-indigo-500" />
            آمار اشتراک‌ها
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">کل مشتریان</span>
              <span className="text-sm font-black dark:text-white">{stats.totalClients}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">مشتریان فعال</span>
              <span className="text-sm font-black text-emerald-500">{stats.activeClients}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">اشتراک فعال</span>
              <span className="text-sm font-black text-indigo-500">{stats.activeSubscriptions}</span>
            </div>
            <div className="pt-3 border-t dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">در حال انقضا</span>
                <span className="text-sm font-black text-amber-500">{stats.expiringSoon}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <Link href="/admin/finance/invoices" className="p-4 rounded-2xl glass-card border dark:border-slate-800 hover:border-emerald-500/30 transition-all group">
          <FileText className="w-6 h-6 text-emerald-500 mb-2 group-hover:scale-110 transition-transform" />
          <h4 className="text-xs font-bold dark:text-white">فاکتورها</h4>
          <p className="text-[9px] text-slate-400 mt-1">صدور و مدیریت فاکتور</p>
        </Link>
        <Link href="/admin/finance/wallets" className="p-4 rounded-2xl glass-card border dark:border-slate-800 hover:border-sky-500/30 transition-all group">
          <Wallet className="w-6 h-6 text-sky-500 mb-2 group-hover:scale-110 transition-transform" />
          <h4 className="text-xs font-bold dark:text-white">کیف پول‌ها</h4>
          <p className="text-[9px] text-slate-400 mt-1">شارژ و تراکنش‌ها</p>
        </Link>
        <Link href="/admin/finance/plans" className="p-4 rounded-2xl glass-card border dark:border-slate-800 hover:border-brand-500/30 transition-all group">
          <CreditCard className="w-6 h-6 text-brand-500 mb-2 group-hover:scale-110 transition-transform" />
          <h4 className="text-xs font-bold dark:text-white">پلن‌ها</h4>
          <p className="text-[9px] text-slate-400 mt-1">قیمت‌گذاری خدمات</p>
        </Link>
        <Link href="/admin/finance/subscriptions" className="p-4 rounded-2xl glass-card border dark:border-slate-800 hover:border-indigo-500/30 transition-all group">
          <Repeat className="w-6 h-6 text-indigo-500 mb-2 group-hover:scale-110 transition-transform" />
          <h4 className="text-xs font-bold dark:text-white">اشتراک‌ها</h4>
          <p className="text-[9px] text-slate-400 mt-1">مدیریت اشتراک‌ها</p>
        </Link>
      </div>
    </div>
  );
}
