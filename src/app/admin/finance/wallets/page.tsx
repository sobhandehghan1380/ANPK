'use client';

import React, { useState, useEffect } from 'react';
import { getAdminWallets, topUpClientWallet, adminFetch } from '@/lib/api';
import { Wallet, PlusCircle, CheckCircle2, DollarSign, History, ShieldCheck, X, Eye, TrendingUp, TrendingDown } from 'lucide-react';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000') + '/api/v1/admin';

export default function AdminWalletsPage() {
  const [activeTab, setActiveTab] = useState<'wallets' | 'transactions' | 'sla'>('wallets');
  const [wallets, setWallets] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [slaContracts, setSlaContracts] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Top-up form
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [amount, setAmount] = useState<number>(5000000);
  const [description, setDescription] = useState('شارژ حساب توسط ادمین ارشیا نگین پردازش');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // SLA form
  const [slaPlan, setSlaPlan] = useState('SLA Gold');
  const [slaDuration, setSlaDuration] = useState(12);
  const [slaSubscriptionId, setSlaSubscriptionId] = useState<number | null>(null);
  const [slaSupportSchedule, setSlaSupportSchedule] = useState('24/7');
  const [slaResponseMinutes, setSlaResponseMinutes] = useState(30);
  const [slaResolutionHours, setSlaResolutionHours] = useState(4);
  const [slaAvailability, setSlaAvailability] = useState(99.9);

  // View transactions modal
  const [txClientId, setTxClientId] = useState<number | null>(null);

  const loadAll = async () => {
    try {
      const [wRes, subRes, slaRes] = await Promise.all([
        adminFetch(`${API_BASE}/wallets/`),
        adminFetch(`${API_BASE}/finance/subscriptions/`),
        adminFetch(`${API_BASE}/sla-contracts/`),
      ]);
      setWallets(Array.isArray(wRes) ? wRes : []);
      setSubscriptions(Array.isArray(subRes?.subscriptions) ? subRes.subscriptions : []);
      setSlaContracts(Array.isArray(slaRes) ? slaRes : []);
      if (Array.isArray(wRes) && wRes.length > 0) setSelectedClientId(wRes[0].client_id);
    } catch (err) {
      console.error('Error loading wallets data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async (clientId?: number) => {
    try {
      const url = clientId
        ? `${API_BASE}/wallet-transactions/?client_id=${clientId}`
        : `${API_BASE}/wallet-transactions/`;
      const res = await adminFetch(url);
      setTransactions(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('Error loading transactions:', err);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    if (activeTab === 'transactions') loadTransactions(txClientId || undefined);
  }, [activeTab, txClientId]);

  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId || !amount) return;
    setSubmitting(true);
    setSuccessMsg('');
    try {
      const res = await topUpClientWallet(selectedClientId, amount, description);
      if (res?.message) {
        setSuccessMsg(res.message);
        loadAll();
      }
    } catch (err) {
      console.error('Error topping up wallet:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateSLA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slaSubscriptionId) return;
    setSubmitting(true);
    try {
      const res = await adminFetch(`${API_BASE}/sla-contracts/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription_id: slaSubscriptionId,
          plan_name: slaPlan,
          duration_months: slaDuration,
          support_schedule: slaSupportSchedule,
          response_time_minutes: slaResponseMinutes,
          resolution_time_hours: slaResolutionHours,
          availability_percentage: slaAvailability,
        })
      });
      if (res?.message) {
        setSuccessMsg(res.message);
        loadAll();
      }
    } catch (err) {
      console.error('Error creating SLA:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="space-y-3 text-center">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-slate-400">در حال دریافت اطلاعات مالی از دیتابیس جنگو...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'wallets', label: `کیف‌پول‌ها (${wallets.length})`, icon: Wallet },
    { id: 'transactions', label: 'تاریخچه تراکنش‌ها', icon: History },
    { id: 'sla', label: `قراردادهای SLA (${slaContracts.length})`, icon: ShieldCheck },
  ] as const;

  return (
    <div className="space-y-8 animate-fade-in text-right">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black dark:text-white text-slate-900 flex items-center gap-3">
          <Wallet className="w-7 h-7 text-emerald-500" />
          مدیریت مالی، کیف‌پول‌ها، تراکنش‌ها & قراردادهای SLA
        </h1>
        <p className="text-xs sm:text-sm dark:text-slate-400 text-slate-600">
          شارژ کیف‌پول سازمان‌ها، پایش تاریخچه تراکنش‌ها و مدیریت قراردادهای SLA پشتیبانی.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Tab Switcher */}
      <div className="flex gap-2 border-b dark:border-slate-800 border-slate-200 pb-0">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-t-xl border-b-2 transition-all ${
              activeTab === t.id
                ? 'border-emerald-500 text-emerald-500 bg-emerald-500/5'
                : 'border-transparent dark:text-slate-400 text-slate-500 hover:text-slate-700'
            }`}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* ===== TAB 1: WALLETS ===== */}
      {activeTab === 'wallets' && (
        <div className="space-y-6">
          {/* Top-up Form */}
          <div className="p-6 sm:p-8 rounded-3xl glass-card border dark:border-slate-800 border-slate-200 space-y-5 shadow-xl">
            <div className="flex items-center gap-2 border-b dark:border-slate-800 border-slate-200 pb-4">
              <PlusCircle className="w-5 h-5 text-emerald-500" />
              <h2 className="text-base font-black dark:text-white text-slate-900">شارژ دستی کیف‌پول سازمان</h2>
            </div>
            <form onSubmit={handleTopUp} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              <div className="space-y-1.5">
                <label className="text-xs font-bold dark:text-slate-300 text-slate-700 block">انتخاب سازمان:</label>
                <select
                  required
                  onChange={(e) => setSelectedClientId(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 border-slate-300 text-xs dark:text-white text-slate-900 focus:outline-none focus:border-emerald-500 font-bold"
                >
                  {wallets.map(w => (
                    <option key={w.client_id} value={w.client_id}>{w.client_name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold dark:text-slate-300 text-slate-700 block">مبلغ شارژ (تومان):</label>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={e => setAmount(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 border-slate-300 text-xs dark:text-white text-slate-900 focus:outline-none focus:border-emerald-500 font-mono font-bold"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md"
              >
                <DollarSign className="w-4 h-4" />
                <span>{submitting ? 'در حال شارژ...' : 'شارژ کیف‌پول'}</span>
              </button>
            </form>
          </div>

          {/* Wallets Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {wallets.map((w: any) => (
              <div key={w.client_id} className="p-5 rounded-2xl glass-card border dark:border-slate-800 border-slate-200 space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black dark:text-white text-slate-900">{w.client_name}</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${w.is_active ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
                    {w.is_active ? 'فعال' : 'مسدود'}
                  </span>
                </div>
                <div className="space-y-1 border-t dark:border-slate-800 border-slate-200 pt-3">
                  <p className="text-xs dark:text-slate-400 text-slate-500">موجودی فعلی:</p>
                  <p className="text-lg font-black text-emerald-500 font-mono">{(w.balance || 0).toLocaleString('fa-IR')} تومان</p>
                </div>
                <button
                  onClick={() => { setActiveTab('transactions'); setTxClientId(w.client_id); }}
                  className="w-full py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <History className="w-3.5 h-3.5" />
                  مشاهده تراکنش‌ها
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== TAB 2: TRANSACTIONS ===== */}
      {activeTab === 'transactions' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { setTxClientId(null); loadTransactions(); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${!txClientId ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-300'}`}
            >همه تراکنش‌ها</button>
            {wallets.map((w: any) => (
              <button
                key={w.client_id}
                onClick={() => setTxClientId(w.client_id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${txClientId === w.client_id ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-300'}`}
              >{w.client_name}</button>
            ))}
          </div>

          <div className="space-y-3">
            {transactions.map((t: any) => (
              <div key={t.id} className="p-4 rounded-2xl glass-card border dark:border-slate-800 border-slate-200 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {t.transaction_type === 'TOPUP' || t.transaction_type === 'CREDIT'
                    ? <TrendingUp className="w-5 h-5 text-emerald-500 shrink-0" />
                    : <TrendingDown className="w-5 h-5 text-rose-500 shrink-0" />
                  }
                  <div>
                    <p className="text-xs font-bold dark:text-white text-slate-900">{t.client_name}</p>
                    <p className="text-[10px] text-slate-400">{t.description || t.transaction_type}</p>
                  </div>
                </div>
                <div className="text-left space-y-0.5">
                  <p className={`text-sm font-black font-mono ${t.transaction_type === 'DEDUCT' ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {t.transaction_type === 'DEDUCT' ? '−' : '+'}{(t.amount || 0).toLocaleString('fa-IR')} ت
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">{t.created_at}</p>
                </div>
              </div>
            ))}
            {transactions.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-10">هنوز تراکنشی ثبت نشده است.</p>
            )}
          </div>
        </div>
      )}

      {/* ===== TAB 3: SLA CONTRACTS ===== */}
      {activeTab === 'sla' && (
        <div className="space-y-6">
          {/* Create SLA Form */}
          <div className="p-6 sm:p-8 rounded-3xl glass-card border dark:border-slate-800 border-slate-200 space-y-5 shadow-xl">
            <div className="flex items-center gap-2 border-b dark:border-slate-800 border-slate-200 pb-4">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <h2 className="text-base font-black dark:text-white text-slate-900">ثبت قرارداد SLA پشتیبانی جدید</h2>
            </div>
            <form onSubmit={handleCreateSLA} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <div className="space-y-1.5">
                <label className="text-xs font-bold dark:text-slate-300 text-slate-700 block">اشتراک پروژه:</label>
                <select
                  required
                  value={slaSubscriptionId || ''}
                  onChange={e => setSlaSubscriptionId(Number(e.target.value) || null)}
                  className="w-full px-4 py-3 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 border-slate-300 text-xs dark:text-white text-slate-900 focus:outline-none focus:border-emerald-500 font-bold"
                >
                  <option value="">انتخاب اشتراک...</option>
                  {subscriptions.filter(subscription => !subscription.has_sla && subscription.project_id).map(subscription => (
                    <option key={subscription.id} value={subscription.id}>{subscription.client_name} — {subscription.project_name} — {subscription.plan_name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold dark:text-slate-300 text-slate-700 block">نوع پلن SLA:</label>
                <select
                  value={slaPlan}
                  onChange={e => setSlaPlan(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 border-slate-300 text-xs dark:text-white text-slate-900 focus:outline-none focus:border-emerald-500 font-bold"
                >
                  <option value="SLA Bronze">SLA Bronze - پشتیبانی پایه</option>
                  <option value="SLA Silver">SLA Silver - پشتیبانی استاندارد</option>
                  <option value="SLA Gold">SLA Gold - پشتیبانی طلایی</option>
                  <option value="SLA Platinum">SLA Platinum - پشتیبانی پلاتینیوم</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold dark:text-slate-300 text-slate-700 block">ساعات پشتیبانی:</label>
                <input value={slaSupportSchedule} onChange={e => setSlaSupportSchedule(e.target.value)} className="w-full px-4 py-3 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 border-slate-300 text-xs font-bold" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold dark:text-slate-300 text-slate-700 block">مدت قرارداد (ماه):</label>
                <input type="number" min="1" value={slaDuration} onChange={e => setSlaDuration(Number(e.target.value))} className="w-full px-4 py-3 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 border-slate-300 text-xs font-bold" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold dark:text-slate-300 text-slate-700 block">زمان پاسخ (دقیقه):</label>
                <input type="number" min="1" value={slaResponseMinutes} onChange={e => setSlaResponseMinutes(Number(e.target.value))} className="w-full px-4 py-3 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 border-slate-300 text-xs font-bold" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold dark:text-slate-300 text-slate-700 block">زمان رفع بحرانی (ساعت):</label>
                <input type="number" min="1" value={slaResolutionHours} onChange={e => setSlaResolutionHours(Number(e.target.value))} className="w-full px-4 py-3 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 border-slate-300 text-xs font-bold" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold dark:text-slate-300 text-slate-700 block">دسترس‌پذیری تضمینی:</label>
                <input type="number" min="0" max="100" step="0.01" value={slaAvailability} onChange={e => setSlaAvailability(Number(e.target.value))} className="w-full px-4 py-3 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 border-slate-300 text-xs font-bold" />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{submitting ? 'در حال ثبت...' : 'ثبت قرارداد SLA'}</span>
              </button>
            </form>
          </div>

          {/* SLA List */}
          <div className="space-y-3">
            {slaContracts.map((c: any) => (
              <div key={c.id} className="p-5 rounded-2xl glass-card border dark:border-slate-800 border-slate-200 flex flex-col sm:flex-row justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black dark:text-white text-slate-900">{c.client_name}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${c.is_active ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
                      {c.is_active ? 'فعال' : 'منقضی'}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-brand-500">پروژه: {c.project_name}</p>
                  <p className="text-xs dark:text-slate-400 text-slate-500">پلن: <strong className="dark:text-white text-slate-900">{c.plan_name}</strong> &nbsp;|&nbsp; شروع: {c.start_date} &nbsp;|&nbsp; مدت: {c.duration_months} ماه</p>
                  <p className="text-[10px] dark:text-slate-500 text-slate-400">{c.support_schedule} · پاسخ {c.response_time_minutes} دقیقه · رفع بحرانی {c.resolution_time_hours} ساعت · دسترس‌پذیری {c.availability_percentage}٪</p>
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-amber-500">{c.remaining_days} روز مانده</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

