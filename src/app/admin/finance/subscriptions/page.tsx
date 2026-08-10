'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Repeat, Ban, CheckCircle2, AlertCircle, PlusCircle, Search, RefreshCw, PackageCheck, X, ShieldCheck, CreditCard } from 'lucide-react';
import { getAdminSubscriptions, manageAdminSubscription } from '@/lib/api';

export default function AdminSubscriptionsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expiring' | 'past_due' | 'expired'>('all');
  
  // Main Modal State
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'ready' | 'custom'>('ready');
  
  // Form states
  const [projectId, setProjectId] = useState('');
  const [planId, setPlanId] = useState('');
  const [customPlanName, setCustomPlanName] = useState('');
  const [customMonthlyPrice, setCustomMonthlyPrice] = useState(0);
  const [customYearlyPrice, setCustomYearlyPrice] = useState(0);
  const [customServerCost, setCustomServerCost] = useState(0);
  const [customSupportCost, setCustomSupportCost] = useState(0);
  const [customDescription, setCustomDescription] = useState('');
  const [months, setMonths] = useState(1);
  const [autoRenew, setAutoRenew] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [renewalSubscription, setRenewalSubscription] = useState<any>(null);
  const [renewalMonths, setRenewalMonths] = useState(1);
  const [renewing, setRenewing] = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const res = await getAdminSubscriptions();
      setData(res);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  const showMsg = (type: 'success' | 'error', text: string) => {
    if (type === 'success') setSuccessMsg(text);
    else setErrorMsg(text);
    setTimeout(() => { setSuccessMsg(''); setErrorMsg(''); }, 3000);
  };

  const resetForm = () => {
    setProjectId(''); setPlanId(''); setMonths(1); setAutoRenew(false);
    setActiveTab('ready');
    setCustomPlanName(''); setCustomMonthlyPrice(0); setCustomYearlyPrice(0); setCustomDescription(''); setCustomServerCost(0); setCustomSupportCost(0);
  };

  const openSubscriptionModal = () => {
    resetForm();
    setShowSubscriptionModal(true);
  };

  const closeSubscriptionModal = () => {
    setShowSubscriptionModal(false);
    resetForm();
  };

  const handleCreateSub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) {
      showMsg('error', 'انتخاب پروژه الزامی است.');
      return;
    }
    
    if (activeTab === 'ready' && !planId) {
      showMsg('error', 'لطفاً پلن را انتخاب کنید.');
      return;
    }

    if (activeTab === 'custom' && !customPlanName) {
      showMsg('error', 'نام پلن اختصاصی الزامی است.');
      return;
    }
    
    setSubmitting(true);
    try {
      const subscriptionData: any = {
        action: 'create_subscription',
        project_id: parseInt(projectId),
        months,
        auto_renew: autoRenew,
        use_custom_plan: activeTab === 'custom',
      };

      if (activeTab === 'custom') {
        subscriptionData.custom_plan = {
          name: customPlanName,
          monthly_price: customMonthlyPrice,
          yearly_price: customYearlyPrice,
          description: customDescription,
          server_cost: customServerCost,
          support_cost: customSupportCost
        };
      } else {
        subscriptionData.plan_id = parseInt(planId);
      }

      const res = await manageAdminSubscription(subscriptionData);
      if (res && res.error) {
        showMsg('error', res.error);
      } else {
        showMsg('success', res?.message || 'قرارداد سرویس و فاکتور دوره نخست ثبت شد.');
        closeSubscriptionModal();
        loadData();
      }
    } catch (err) {
      showMsg('error', 'خطا در ثبت قرارداد سرویس');
    }
    setSubmitting(false);
  };

  const handleCancelSub = async (id: number) => {
    if (!confirm('آیا از لغو این قرارداد سرویس اطمینان دارید؟ فاکتورهای تمدید پرداخت‌نشده نیز لغو می‌شوند.')) return;
    try {
      await manageAdminSubscription({ action: 'cancel_subscription', subscription_id: id });
      showMsg('success', 'قرارداد سرویس لغو شد.');
      loadData();
    } catch (err) {
      showMsg('error', 'خطا در لغو قرارداد سرویس');
    }
  };

  const handleRenewSub = async (id: number) => {
    const subscription = (data?.subscriptions || []).find((item: any) => item.id === id);
    setRenewalSubscription(subscription || { id });
    setRenewalMonths(1);
  };

  const submitRenewal = async () => {
    if (!renewalSubscription || renewalMonths < 1 || renewalMonths > 36) return;
    setRenewing(true);
    try {
      const result = await manageAdminSubscription({
        action: 'renew_subscription',
        subscription_id: renewalSubscription.id,
        months: renewalMonths,
      });
      if (!result) {
        showMsg('error', 'صدور فاکتور تمدید انجام نشد؛ ممکن است فاکتور باز دیگری وجود داشته باشد.');
        return;
      }
      showMsg('success', `فاکتور تمدید ${renewalMonths} ماهه صادر شد؛ سرویس پس از پرداخت تمدید می‌شود.`);
      setRenewalSubscription(null);
      await loadData();
    } catch (err) {
      showMsg('error', 'خطا در صدور فاکتور تمدید');
    } finally {
      setRenewing(false);
    }
  };

  // Filtered subscriptions
  const filteredSubs = useMemo(() => {
    const subs = data?.subscriptions || [];
    let list = [...subs];

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(sub => 
        sub.client_name?.toLowerCase().includes(q) ||
        sub.project_name?.toLowerCase().includes(q) ||
        sub.plan_name?.toLowerCase().includes(q)
      );
    }

    if (statusFilter === 'active') {
      list = list.filter(sub => sub.status === "active" && sub.days_remaining > 7);
    } else if (statusFilter === 'expiring') {
      list = list.filter(sub => sub.status === "active" && sub.days_remaining <= 7 && sub.days_remaining >= 0);
    } else if (statusFilter === 'past_due') {
      list = list.filter(sub => sub.status === "past_due");
    } else if (statusFilter === 'expired') {
      list = list.filter(sub => ["expired", "canceled"].includes(sub.status) || (sub.status === "active" && sub.days_remaining < 0));
    }

    return list;
  }, [data, searchQuery, statusFilter]);

  // Stats
  const stats = useMemo(() => {
    const subs = data?.subscriptions || [];
    return {
      total: subs.length,
      active: subs.filter((s: any) => s.status === "active" && s.days_remaining > 7).length,
      expiring: subs.filter((s: any) => s.status === "active" && s.days_remaining <= 7 && s.days_remaining >= 0).length,
      pastDue: subs.filter((s: any) => s.status === "past_due").length,
      expired: subs.filter((s: any) => ["expired", "canceled"].includes(s.status) || (s.status === "active" && s.days_remaining < 0)).length,
    };
  }, [data]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="space-y-3 text-center">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-slate-400">در حال بارگذاری قراردادهای سرویس...</p>
        </div>
      </div>
    );
  }

  const plans = data?.plans || [];

  const projects = data?.projects || [];

  return (
    <div className="space-y-6 animate-fade-in text-right">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black dark:text-white text-slate-900 flex items-center gap-2">
            <Repeat className="w-7 h-7 text-brand-500" />
            مدیریت قراردادهای سرویس
          </h1>
          <p className="text-xs text-slate-400 mt-1">صدور دوره، پیگیری پرداخت، سررسید و تمدید خدمات هر پروژه</p>
        </div>
        <button 
          onClick={openSubscriptionModal}
          className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-brand-500/20"
        >
          <PlusCircle className="w-4 h-4" /> قرارداد سرویس جدید
        </button>
      </div>

      {successMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" /><span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" /><span>{errorMsg}</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <div className="glass-card rounded-2xl p-4 border dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center">
              <Repeat className="w-5 h-5 text-brand-500" />
            </div>
            <div>
              <div className="text-xl font-black dark:text-white">{stats.total}</div>
              <div className="text-[10px] text-slate-400">کل قراردادها</div>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-2xl p-4 border dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <div className="text-xl font-black dark:text-white">{stats.active}</div>
              <div className="text-[10px] text-slate-400">فعال</div>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-2xl p-4 border dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-sky-500" />
            </div>
            <div>
              <div className="text-xl font-black dark:text-white">{stats.pastDue}</div>
              <div className="text-[10px] text-slate-400">در انتظار پرداخت</div>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-2xl p-4 border dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <div className="text-xl font-black dark:text-white">{stats.expiring}</div>
              <div className="text-[10px] text-slate-400">در حال انقضا</div>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-2xl p-4 border dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
              <Ban className="w-5 h-5 text-rose-500" />
            </div>
            <div>
              <div className="text-xl font-black dark:text-white">{stats.expired}</div>
              <div className="text-[10px] text-slate-400">منقضی یا لغوشده</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="glass-card rounded-2xl p-4 border dark:border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="جستجوی مشتری یا پلن..."
              className="w-full pr-9 pl-4 py-2.5 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 border-slate-200 text-xs focus:outline-none focus:border-brand-500"
            />
          </div>
          <div className="flex gap-2">
            {[
              { id: 'all', label: 'همه' },
              { id: 'active', label: 'فعال' },
              { id: 'expiring', label: 'در حال انقضا' },
              { id: 'past_due', label: 'در انتظار پرداخت' },
              { id: 'expired', label: 'منقضی' },
            ].map(s => (
              <button
                key={s.id}
                onClick={() => setStatusFilter(s.id as any)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === s.id
                    ? 'bg-brand-500 text-white'
                    : 'dark:bg-slate-900 bg-slate-50 dark:text-slate-400 text-slate-600 border dark:border-slate-700 border-slate-200'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Subscriptions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSubs.length === 0 ? (
          <div className="col-span-full text-center py-16 text-slate-400 glass-card rounded-2xl border dark:border-slate-800">
            <Repeat className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="text-sm font-bold">هیچ قرارداد سرویسی یافت نشد.</p>
          </div>
        ) : (
          filteredSubs.map((sub: any) => {
            const isExpiringSoon = sub.status === "active" && sub.days_remaining <= 7 && sub.days_remaining >= 0;
            const isPendingPayment = sub.status === "past_due";
            const isCanceled = sub.status === "canceled";
            const isExpired = ["expired", "canceled"].includes(sub.status) || (sub.status === "active" && sub.days_remaining < 0);
            const statusLabel = isPendingPayment
              ? "در انتظار پرداخت"
              : isCanceled
                ? "لغوشده"
                : isExpired
                  ? "منقضی"
                  : isExpiringSoon
                    ? "در حال انقضا"
                    : sub.status === "trialing"
                      ? "آزمایشی"
                      : "فعال";
            
            return (
              <div 
                key={sub.id} 
                className={`rounded-2xl border-2 overflow-hidden transition-all hover:shadow-lg ${
                  isPendingPayment
                    ? 'border-sky-300 dark:border-sky-500/30'
                    : isExpired 
                    ? 'border-rose-200 dark:border-rose-900/30 opacity-75' 
                    : isExpiringSoon 
                      ? 'border-amber-300 dark:border-amber-500/30' 
                      : 'dark:border-slate-800 border-slate-200 hover:border-brand-400'
                }`}
              >
                <div className={`p-4 ${
                  isPendingPayment
                    ? 'bg-sky-50 dark:bg-sky-900/10'
                    : isExpired 
                    ? 'bg-rose-50 dark:bg-rose-900/10' 
                    : isExpiringSoon 
                      ? 'bg-amber-50 dark:bg-amber-900/10' 
                      : 'bg-gradient-to-r from-brand-500/5 to-accent-500/5'
                }`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">{sub.client_name}</h3>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">پروژه: {sub.project_name}</p>
                      <div className="text-xs text-brand-500 font-bold flex items-center gap-1 mt-1">
                        <ShieldCheck className="w-3 h-3" /> {sub.plan_name}
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                      isPendingPayment
                        ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400'
                        : isExpired 
                        ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' 
                        : isExpiringSoon 
                          ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' 
                          : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                    }`}>
                      {statusLabel}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-3 bg-white dark:bg-slate-900">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                      <span className="text-slate-400 text-[9px]">شروع</span>
                      <p className="font-mono font-bold text-slate-700 dark:text-slate-300">{sub.start_date}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                      <span className="text-slate-400 text-[9px]">سررسید</span>
                      <p className="font-mono font-bold text-slate-700 dark:text-slate-300">{sub.end_date}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <span className="text-xs text-slate-400">زمان باقیمانده:</span>
                    <span className={`text-sm font-black ${
                      isPendingPayment ? 'text-sky-500' : isExpired ? 'text-rose-500' : isExpiringSoon ? 'text-amber-500' : 'text-emerald-500'
                    }`}>
                      {isPendingPayment ? 'در انتظار تسویه فاکتور' : isCanceled ? 'لغو شده' : isExpired ? 'منقضی شده' : `${sub.days_remaining} روز`}
                    </span>
                  </div>

                  {isPendingPayment && (
                    <div className="pt-3 border-t dark:border-slate-800 border-slate-200 flex gap-2">
                      <Link
                        href="/admin/finance/invoices"
                        className="flex-1 py-2 rounded-lg bg-sky-500/10 text-sky-600 hover:bg-sky-500 hover:text-white text-xs font-bold flex items-center justify-center gap-1 transition-all"
                      >
                        <CreditCard className="w-3 h-3" /> مشاهده و پرداخت فاکتور
                      </Link>
                      <button
                        onClick={() => handleCancelSub(sub.id)}
                        className="px-4 py-2 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white text-xs font-bold flex items-center justify-center gap-1 transition-all"
                      >
                        <Ban className="w-3 h-3" /> لغو
                      </button>
                    </div>
                  )}

                  {["active", "expired"].includes(sub.status) && (
                    <div className="pt-3 border-t dark:border-slate-800 border-slate-200 flex gap-2">
                      <button
                        onClick={() => handleRenewSub(sub.id)}
                        className="flex-1 py-2 rounded-lg bg-brand-500/10 text-brand-500 hover:bg-brand-500 hover:text-white text-xs font-bold flex items-center justify-center gap-1 transition-all"
                      >
                        <RefreshCw className="w-3 h-3" /> صدور فاکتور تمدید
                      </button>
                      <button 
                        onClick={() => handleCancelSub(sub.id)} 
                        className="flex-1 py-2 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white text-xs font-bold flex items-center justify-center gap-1 transition-all"
                      >
                        <Ban className="w-3 h-3" /> لغو
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ===== NEW SUBSCRIPTION MODAL ===== */}
      {showSubscriptionModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-right overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between shrink-0">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-brand-400" />
                ثبت قرارداد سرویس جدید
              </h3>
              <button 
                onClick={closeSubscriptionModal} 
                className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreateSub} className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Project Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">پروژه مشتری:</label>
                <select 
                  value={projectId}
                  onChange={e => setProjectId(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-brand-500"
                >
                  <option value="">انتخاب پروژه...</option>
                  {projects.map((project: any) => (
                    <option key={project.id} value={project.id}>
                      {project.client_name} — {project.title} ({project.contract_number})
                    </option>
                  ))}
                </select>
              </div>

              {/* Plan Type Tabs */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-300 block">نوع پلن:</label>
                <div className="flex gap-2 p-1 rounded-xl bg-slate-950 border border-slate-700">
                  <button
                    type="button"
                    onClick={() => setActiveTab('ready')}
                    className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      activeTab === 'ready'
                        ? 'bg-brand-500 text-white shadow-lg'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <PackageCheck className="w-4 h-4" /> پلن آماده
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('custom')}
                    className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      activeTab === 'custom'
                        ? 'bg-brand-500 text-white shadow-lg'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <PlusCircle className="w-4 h-4" /> پلن اختصاصی
                  </button>
                </div>
              </div>

              {/* Plan Content */}
              {activeTab === 'ready' ? (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">انتخاب پلن:</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {plans.map((p: any) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPlanId(p.id)}
                        className={`p-4 rounded-xl border-2 text-right transition-all ${
                          planId === p.id
                            ? 'border-brand-500 bg-brand-500/10'
                            : 'border-slate-700 bg-slate-950 hover:border-slate-600'
                        }`}
                      >
                        <h4 className="text-sm font-bold text-white">{p.name}</h4>
                        <p className="text-xs text-brand-400 mt-1">{p.monthly_price?.toLocaleString()} ت/ماه</p>
                        <p className="text-[10px] text-slate-400">{p.yearly_price?.toLocaleString()} ت/سال</p>
                      </button>
                    ))}
                  </div>
                  {plans.length === 0 && (
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-700 text-center">
                      <p className="text-xs text-slate-400">هیچ پلن آماده‌ای تعریف نشده</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-700 space-y-4">
                  <h4 className="text-xs font-bold text-brand-400 flex items-center gap-2">
                    <PlusCircle className="w-4 h-4" /> تعریف پلن اختصاصی برای این مشتری
                  </h4>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 block">نام پلن:</label>
                    <input 
                      type="text" 
                      value={customPlanName} 
                      onChange={e => setCustomPlanName(e.target.value)}
                      placeholder="مثلاً: پلن جامع بیمارستان ولایت"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 block">قیمت ماهانه:</label>
                      <input 
                        type="number" 
                        min="0"
                        value={customMonthlyPrice} 
                        onChange={e => setCustomMonthlyPrice(Number(e.target.value))}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-brand-500 font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 block">قیمت سالانه:</label>
                      <input 
                        type="number" 
                        min="0"
                        value={customYearlyPrice} 
                        onChange={e => setCustomYearlyPrice(Number(e.target.value))}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-brand-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 block">هزینه سرور (ماهانه):</label>
                      <input 
                        type="number" 
                        min="0"
                        value={customServerCost} 
                        onChange={e => setCustomServerCost(Number(e.target.value))}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-brand-500 font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 block">هزینه پشتیبانی (ماهانه):</label>
                      <input 
                        type="number" 
                        min="0"
                        value={customSupportCost} 
                        onChange={e => setCustomSupportCost(Number(e.target.value))}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-brand-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 block">توضیحات خدمات:</label>
                    <textarea 
                      rows={2}
                      value={customDescription} 
                      onChange={e => setCustomDescription(e.target.value)}
                      placeholder="شامل هاست + پشتیبانی ۲۴/۷ + بکاپ روزانه"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-brand-500 resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Duration & Auto Renew */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">مدت (ماه):</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="36"
                    value={months} 
                    onChange={e => setMonths(parseInt(e.target.value))} 
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-brand-500" 
                  />
                </div>
                <div className="space-y-1.5 flex flex-col justify-end">
                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-slate-950 border border-slate-700">
                    <input 
                      type="checkbox" 
                      checked={autoRenew} 
                      onChange={e => setAutoRenew(e.target.checked)} 
                      className="w-4 h-4 accent-brand-500 rounded" 
                    />
                    <span className="text-xs font-bold text-slate-300">تمدید خودکار</span>
                  </label>
                </div>
              </div>
            </form>

            {/* Modal Footer */}
            <div className="p-5 border-t border-slate-800 flex gap-3 shrink-0">
              <button 
                onClick={handleCreateSub}
                disabled={submitting}
                className="flex-1 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? 'در حال ثبت...' : <><CheckCircle2 className="w-4 h-4" /> ثبت قرارداد و صدور فاکتور</>}
              </button>
              <button 
                onClick={closeSubscriptionModal}
                className="px-6 py-3 rounded-xl bg-slate-800 text-slate-300 text-sm font-bold hover:bg-slate-700 transition-colors"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}

      {renewalSubscription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6 text-right shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-white">صدور فاکتور تمدید</h3>
                <p className="mt-1 text-xs text-slate-400">
                  {renewalSubscription.project_name} — {renewalSubscription.plan_name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRenewalSubscription(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                aria-label="بستن"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <label className="mb-2 block text-xs font-bold text-slate-300" htmlFor="renewal-months">
              مدت تمدید (ماه)
            </label>
            <input
              id="renewal-months"
              type="number"
              min="1"
              max="36"
              value={renewalMonths}
              onChange={(event) => setRenewalMonths(Number(event.target.value))}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white focus:border-brand-500 focus:outline-none"
            />
            <p className="mt-2 text-[11px] leading-5 text-slate-500">
              قیمت معتبر در شروع دوره روی فاکتور ثبت می‌شود. تاریخ سرویس فقط بعد از پرداخت تغییر می‌کند.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                disabled={renewing || renewalMonths < 1 || renewalMonths > 36}
                onClick={submitRenewal}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-500 py-3 text-sm font-bold text-white hover:bg-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {renewing && <RefreshCw className="h-4 w-4 animate-spin" />}
                صدور فاکتور
              </button>
              <button
                type="button"
                disabled={renewing}
                onClick={() => setRenewalSubscription(null)}
                className="rounded-xl bg-slate-800 px-5 py-3 text-sm font-bold text-slate-300 hover:bg-slate-700"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
