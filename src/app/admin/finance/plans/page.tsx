'use client';

import React, { useState, useEffect } from 'react';
import { getAdminPricingPlans, manageAdminPricingPlan } from '@/lib/api';
import { PackageSearch, PlusCircle, CheckCircle2, AlertCircle, Edit, Power, Trash2 } from 'lucide-react';

export default function PricingPlansPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [name, setName] = useState('');
  const [monthlyPrice, setMonthlyPrice] = useState(0);
  const [yearlyPrice, setYearlyPrice] = useState(0);
  const [featuresList, setFeaturesList] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const loadData = async () => {
    try {
      const res = await getAdminPricingPlans();
      setPlans(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return setErrorMsg('نام پلن الزامی است.');
    setSubmitting(true); setSuccessMsg(''); setErrorMsg('');
    try {
      const res = await manageAdminPricingPlan({ name, monthly_price: monthlyPrice, yearly_price: yearlyPrice, features_list: featuresList });
      if (res?.message) {
        setSuccessMsg(res.message);
        setName(''); setMonthlyPrice(0); setYearlyPrice(0); setFeaturesList('');
        loadData();
      }
    } catch (err) {
      setErrorMsg('خطا در ثبت پلن.');
    } finally { setSubmitting(false); }
  };

  const handleToggle = async (id: number) => {
    await manageAdminPricingPlan({ action: 'toggle_active', id });
    loadData();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('آیا از حذف این پلن مطمئن هستید؟')) return;
    await manageAdminPricingPlan({ action: 'delete', id });
    loadData();
  }

  if (loading) return <div className="text-center mt-20"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div></div>;

  return (
    <div className="space-y-8 animate-fade-in text-right">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black dark:text-white text-slate-900 flex items-center gap-3">
          <PackageSearch className="w-7 h-7 text-brand-500" />
          مدیریت پکیج‌های قیمت‌گذاری
        </h1>
        <p className="text-xs sm:text-sm dark:text-slate-400 text-slate-600">تعریف پلن‌های ماهانه/سالانه سیستم فروش (SaaS و پشتیبانی).</p>
      </div>

      {successMsg && <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-bold flex items-center gap-2"><CheckCircle2 className="w-4 h-4" />{successMsg}</div>}
      {errorMsg && <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-bold flex items-center gap-2"><AlertCircle className="w-4 h-4" />{errorMsg}</div>}

      <div className="p-6 sm:p-8 rounded-3xl glass-card border dark:border-slate-800 border-slate-200 shadow-xl">
        <div className="flex items-center gap-2 border-b dark:border-slate-800 border-slate-200 pb-4 mb-6">
          <PlusCircle className="w-5 h-5 text-brand-500" />
          <h2 className="text-base font-black dark:text-white text-slate-900">تعریف پلن جدید</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold dark:text-slate-300 text-slate-700">نام پلن:</label>
              <input type="text" required value={name} onChange={e=>setName(e.target.value)} className="w-full px-4 py-3 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 border-slate-300 text-xs font-bold focus:border-brand-500" placeholder="مثلاً: پلن حرفه‌ای" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold dark:text-slate-300 text-slate-700">قیمت ماهانه (تومان):</label>
              <input type="number" value={monthlyPrice} onChange={e=>setMonthlyPrice(Number(e.target.value))} className="w-full px-4 py-3 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 border-slate-300 text-xs font-bold focus:border-brand-500" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold dark:text-slate-300 text-slate-700">قیمت سالانه (تومان):</label>
              <input type="number" value={yearlyPrice} onChange={e=>setYearlyPrice(Number(e.target.value))} className="w-full px-4 py-3 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 border-slate-300 text-xs font-bold focus:border-brand-500" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold dark:text-slate-300 text-slate-700">ویژگی‌ها (هر خط یک ویژگی):</label>
            <textarea rows={4} value={featuresList} onChange={e=>setFeaturesList(e.target.value)} className="w-full px-4 py-3 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 border-slate-300 text-xs font-bold focus:border-brand-500" placeholder="- پشتیبانی ۲۴ ساعته\n- آپدیت رایگان"></textarea>
          </div>
          <button type="submit" disabled={submitting} className="px-8 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-lg">ثبت پلن قیمت‌گذاری</button>
        </form>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {plans.map(p => (
          <div key={p.id} className={`p-6 rounded-3xl border transition-all ${p.is_active ? 'dark:border-brand-500/30 border-brand-500/30 shadow-lg shadow-brand-500/5' : 'dark:border-slate-800 border-slate-200 opacity-70'} glass-card space-y-4`}>
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-black text-brand-500">{p.name}</h3>
              <div className="flex gap-2">
                <button onClick={() => handleToggle(p.id)} className={`p-2 rounded-xl border transition-colors ${p.is_active ? 'bg-emerald-500/10 text-emerald-500 hover:bg-amber-500 hover:text-white' : 'bg-slate-500/10 text-slate-400 hover:bg-emerald-500 hover:text-white'}`}>
                  <Power className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(p.id)} className="p-2 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-500/20">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs dark:text-slate-400 font-bold"><span>ماهانه:</span><span className="dark:text-white text-slate-900">{p.monthly_price.toLocaleString()} تومان</span></div>
              <div className="flex justify-between text-xs dark:text-slate-400 font-bold"><span>سالانه:</span><span className="dark:text-white text-slate-900">{p.yearly_price.toLocaleString()} تومان</span></div>
            </div>
            <div className="text-[10px] dark:text-slate-400 whitespace-pre-line border-t dark:border-slate-800 pt-4 font-medium">
              {p.features_list}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
