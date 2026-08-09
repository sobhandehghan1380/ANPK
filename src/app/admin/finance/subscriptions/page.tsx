'use client';

import React, { useState, useEffect } from 'react';
import { Repeat, Calendar, Ban, CheckCircle2, AlertCircle, PlusCircle, User, ShieldCheck } from 'lucide-react';
import { getAdminSubscriptions, manageAdminSubscription } from '@/lib/api';

export default function AdminSubscriptionsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Form states for new subscription
  const [showForm, setShowForm] = useState(false);
  const [clientId, setClientId] = useState('');
  const [planId, setPlanId] = useState('');
  const [months, setMonths] = useState(1);
  const [autoRenew, setAutoRenew] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

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

  const handleCreateSub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !planId) return alert('مشتری و پلن باید انتخاب شوند.');
    
    setSubmitting(true);
    try {
      const res = await manageAdminSubscription({
        action: 'create_subscription',
        client_id: parseInt(clientId),
        plan_id: parseInt(planId),
        months,
        auto_renew: autoRenew
      });
      if (res && res.error) {
        alert(res.error);
      } else {
        alert('اشتراک باموفقیت ثبت شد!');
        setShowForm(false);
        loadData();
      }
    } catch (err) {
      alert('خطا در ثبت اشتراک');
    }
    setSubmitting(false);
  };

  const handleCancelSub = async (id: number) => {
    if (!confirm('آیا از لغو این اشتراک اطمینان دارید؟')) return;
    try {
      await manageAdminSubscription({ action: 'cancel_subscription', subscription_id: id });
      loadData();
    } catch (err) {
      alert('خطا در لغو اشتراک');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const subs = data?.subscriptions || [];
  const plans = data?.plans || [];
  const clients = data?.clients || [];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black dark:text-white text-slate-900 flex items-center gap-3">
            <Repeat className="w-8 h-8 text-indigo-500" />
            چرخه اشتراک‌ها
          </h1>
          <p className="text-sm dark:text-slate-400 text-slate-600">
            مدیریت اشتراک‌های فعال، سررسیدها و تمدیدهای دوره‌ای (SLA & Services)
          </p>
        </div>
        
        <button 
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-500/20 transition-all flex items-center gap-2"
        >
          {showForm ? 'بستن فرم' : (
            <>
              <PlusCircle className="w-5 h-5" />
              تخصیص اشتراک جدید
            </>
          )}
        </button>
      </div>

      {showForm && (
        <div className="p-6 bg-white dark:bg-slate-900 border dark:border-slate-800 border-slate-200 rounded-3xl shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white border-b dark:border-slate-800 pb-4">ایجاد اشتراک جدید</h2>
          <form onSubmit={handleCreateSub} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 block">سازمان مشتری</label>
              <select value={clientId} onChange={e => setClientId(e.target.value)} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm">
                <option value="">انتخاب مشتری...</option>
                {clients.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 block">پلن / سرویس</label>
              <select value={planId} onChange={e => setPlanId(e.target.value)} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm">
                <option value="">انتخاب پلن...</option>
                {plans.map((p: any) => <option key={p.id} value={p.id}>{p.name} ({p.monthly_price} تومان)</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 block">مدت زمان (ماه)</label>
              <input type="number" min="1" max="60" value={months} onChange={e => setMonths(parseInt(e.target.value))} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm" />
            </div>
            <div className="space-y-2 flex flex-col justify-end">
              <label className="flex items-center gap-2 cursor-pointer bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <input type="checkbox" checked={autoRenew} onChange={e => setAutoRenew(e.target.checked)} className="accent-brand-500 w-4 h-4" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">تمدید خودکار (Auto Renew)</span>
              </label>
            </div>
            <div className="lg:col-span-4 pt-2 border-t dark:border-slate-800 flex justify-end">
              <button disabled={submitting} type="submit" className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold disabled:opacity-50">
                {submitting ? 'در حال ثبت...' : 'ثبت اشتراک و صدور فاکتور'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subs.length === 0 ? (
          <div className="lg:col-span-3 text-center py-12 text-slate-400">هیچ اشتراکی یافت نشد.</div>
        ) : (
          subs.map((sub: any) => {
            const isExpiringSoon = sub.is_active && sub.days_remaining <= 7 && sub.days_remaining >= 0;
            const isExpired = !sub.is_active || sub.days_remaining < 0;
            
            return (
              <div key={sub.id} className={`bg-white dark:bg-slate-900 rounded-3xl p-6 border-2 transition-all ${isExpired ? 'border-rose-100 dark:border-rose-900/30 opacity-75' : isExpiringSoon ? 'border-amber-200 dark:border-amber-500/30' : 'border-slate-100 dark:border-slate-800 hover:border-brand-300'}`}>
                <div className="flex justify-between items-start mb-6">
                  <div className="space-y-1 flex-1">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${isExpired ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                      {isExpired ? 'منقضی/لغوشده' : 'فعال'}
                    </span>
                    <h3 className="font-bold text-slate-800 dark:text-white pt-2">{sub.client_name}</h3>
                    <div className="text-xs text-brand-500 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> {sub.plan_name}
                    </div>
                  </div>
                  {isExpiringSoon && (
                    <div className="text-amber-500 bg-amber-50 dark:bg-amber-500/10 p-2 rounded-xl text-center" title="به زودی منقضی می‌شود">
                      <AlertCircle className="w-6 h-6 mx-auto mb-1 animate-pulse" />
                      <span className="text-[10px] font-black">{sub.days_remaining} روز</span>
                    </div>
                  )}
                  {!isExpired && !isExpiringSoon && (
                    <div className="text-slate-400 bg-slate-50 dark:bg-slate-800 p-2 rounded-xl text-center">
                      <Calendar className="w-6 h-6 mx-auto mb-1 opacity-50" />
                      <span className="text-[10px] font-bold">{sub.days_remaining} روز</span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex justify-between items-center text-slate-500">
                    <span>تاریخ شروع:</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">{sub.start_date}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-500">
                    <span>تاریخ سررسید:</span>
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{sub.end_date}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-500">
                    <span>تمدید خودکار:</span>
                    <span className={sub.auto_renew ? 'text-emerald-500 font-bold' : 'text-slate-400'}>{sub.auto_renew ? 'فعال' : 'غیرفعال'}</span>
                  </div>
                </div>
                
                {sub.is_active && (
                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <button onClick={() => handleCancelSub(sub.id)} className="w-full py-2.5 rounded-xl border border-rose-200 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-xs font-bold flex items-center justify-center gap-2 transition-colors">
                      <Ban className="w-4 h-4" /> لغو اشتراک
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
