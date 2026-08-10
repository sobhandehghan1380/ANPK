'use client';

import React, { useState, useEffect } from 'react';
import { getAdminPricingPlans, manageAdminPricingPlan } from '@/lib/api';
import { PackageSearch, PlusCircle, CheckCircle2, AlertCircle, Edit, Power, Trash2, Server, Headphones, Calendar, Hash } from 'lucide-react';

export default function PricingPlansPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [monthlyPrice, setMonthlyPrice] = useState(0);
  const [yearlyPrice, setYearlyPrice] = useState(0);
  const [serverCost, setServerCost] = useState(0);
  const [supportCost, setSupportCost] = useState(0);
  const [trialDays, setTrialDays] = useState(0);
  const [minMonths, setMinMonths] = useState(1);
  const [featuresList, setFeaturesList] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [serviceType, setServiceType] = useState('SUPPORT');
  const [effectiveFrom, setEffectiveFrom] = useState(() => new Date().toISOString().slice(0, 10));
  
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
      const res = await manageAdminPricingPlan({ 
        id: editingId,
        name, 
        description,
        service_type: serviceType,
        effective_from: effectiveFrom,
        monthly_price: monthlyPrice, 
        yearly_price: yearlyPrice,
        server_cost: serverCost,
        support_cost: supportCost,
        trial_days: trialDays,
        min_months: minMonths,
        features_list: featuresList 
      });
      if (res?.message) {
        setSuccessMsg(res.message);
        setName(''); setDescription(''); setMonthlyPrice(0); setYearlyPrice(0);
        setServerCost(0); setSupportCost(0); setTrialDays(0); setMinMonths(1); setFeaturesList('');
        setEditingId(null); setServiceType('SUPPORT'); setEffectiveFrom(new Date().toISOString().slice(0, 10));
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

  const handleEdit = (plan: any) => {
    setEditingId(plan.id);
    setName(plan.name || '');
    setDescription(plan.description || '');
    setServiceType(plan.service_type || 'SUPPORT');
    setMonthlyPrice(plan.monthly_price || 0);
    setYearlyPrice(plan.yearly_price || 0);
    setServerCost(plan.server_cost || 0);
    setSupportCost(plan.support_cost || 0);
    setTrialDays(plan.trial_days || 0);
    setMinMonths(plan.min_months || 1);
    setFeaturesList(plan.features_list || '');
    setEffectiveFrom(new Date().toISOString().slice(0, 10));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) return <div className="text-center mt-20"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div></div>;

  return (
    <div className="space-y-8 animate-fade-in text-right">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black dark:text-white text-slate-900 flex items-center gap-3">
          <PackageSearch className="w-7 h-7 text-brand-500" />
          مدیریت پکیج‌های قیمت‌گذاری
        </h1>
        <p className="text-xs sm:text-sm dark:text-slate-400 text-slate-600">تعریف پلن‌های ماهانه/سالانه با هزینه سرور و پشتیبانی جداگانه.</p>
      </div>

      {successMsg && <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-bold flex items-center gap-2"><CheckCircle2 className="w-4 h-4" />{successMsg}</div>}
      {errorMsg && <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-bold flex items-center gap-2"><AlertCircle className="w-4 h-4" />{errorMsg}</div>}

      <div className="p-6 sm:p-8 rounded-3xl glass-card border dark:border-slate-800 border-slate-200 shadow-xl">
        <div className="flex items-center gap-2 border-b dark:border-slate-800 border-slate-200 pb-4 mb-6">
          <PlusCircle className="w-5 h-5 text-brand-500" />
          <h2 className="text-base font-black dark:text-white text-slate-900">{editingId ? 'ثبت قیمت جدید برای پلن' : 'تعریف پلن جدید'}</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold dark:text-slate-300 text-slate-700">نام پلن:</label>
              <input type="text" required value={name} onChange={e=>setName(e.target.value)} className="w-full px-4 py-3 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 border-slate-300 text-xs font-bold focus:border-brand-500" placeholder="مثلاً: پلن حرفه‌ای" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold dark:text-slate-300 text-slate-700">توضیحات:</label>
              <input type="text" value={description} onChange={e=>setDescription(e.target.value)} className="w-full px-4 py-3 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 border-slate-300 text-xs font-bold focus:border-brand-500" placeholder="توضیح کوتاه درباره پلن" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold dark:text-slate-300 text-slate-700">نوع سرویس:</label>
              <select value={serviceType} onChange={e => setServiceType(e.target.value)} className="w-full px-4 py-3 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 border-slate-300 text-xs font-bold focus:border-brand-500">
                <option value="HOSTING">میزبانی و سرور</option>
                <option value="SUPPORT">پشتیبانی</option>
                <option value="MAINTENANCE">نگهداری دوره‌ای</option>
                <option value="OTHER">سایر خدمات</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold dark:text-slate-300 text-slate-700">قیمت جدید معتبر از:</label>
              <input type="date" required value={effectiveFrom} onChange={e => setEffectiveFrom(e.target.value)} className="w-full px-4 py-3 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 border-slate-300 text-xs font-bold focus:border-brand-500" />
              <p className="text-[10px] text-slate-400">دوره‌های قبلی با قیمت ثبت‌شده خودشان باقی می‌مانند.</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border dark:border-slate-800 border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-500 flex items-center gap-2"><Server className="w-4 h-4" /> هزینه زیرساخت (سرور)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold dark:text-slate-300 text-slate-700">هزینه سرور ماهانه (تومان):</label>
                <input type="number" min="0" value={serverCost} onChange={e=>setServerCost(Number(e.target.value))} className="w-full px-4 py-3 rounded-xl dark:bg-slate-900 bg-white border dark:border-slate-700 border-slate-300 text-xs font-bold focus:border-brand-500" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold dark:text-slate-300 text-slate-700">هزینه پشتیبانی ماهانه (تومان):</label>
                <input type="number" min="0" value={supportCost} onChange={e=>setSupportCost(Number(e.target.value))} className="w-full px-4 py-3 rounded-xl dark:bg-slate-900 bg-white border dark:border-slate-700 border-slate-300 text-xs font-bold focus:border-brand-500" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold dark:text-slate-300 text-slate-700">قیمت ماهانه (تومان):</label>
              <input type="number" min="0" value={monthlyPrice} onChange={e=>setMonthlyPrice(Number(e.target.value))} className="w-full px-4 py-3 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 border-slate-300 text-xs font-bold focus:border-brand-500" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold dark:text-slate-300 text-slate-700">قیمت سالانه (تومان):</label>
              <input type="number" min="0" value={yearlyPrice} onChange={e=>setYearlyPrice(Number(e.target.value))} className="w-full px-4 py-3 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 border-slate-300 text-xs font-bold focus:border-brand-500" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold dark:text-slate-300 text-slate-700 flex items-center gap-1"><Calendar className="w-3 h-3" /> روزهای تست:</label>
              <input type="number" min="0" value={trialDays} onChange={e=>setTrialDays(Number(e.target.value))} className="w-full px-4 py-3 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 border-slate-300 text-xs font-bold focus:border-brand-500" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold dark:text-slate-300 text-slate-700 flex items-center gap-1"><Hash className="w-3 h-3" /> حداقل مدت (ماه):</label>
              <input type="number" min="1" value={minMonths} onChange={e=>setMinMonths(Number(e.target.value))} className="w-full px-4 py-3 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 border-slate-300 text-xs font-bold focus:border-brand-500" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold dark:text-slate-300 text-slate-700">ویژگی‌ها (هر خط یک ویژگی):</label>
            <textarea rows={4} value={featuresList} onChange={e=>setFeaturesList(e.target.value)} className="w-full px-4 py-3 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 border-slate-300 text-xs font-bold focus:border-brand-500" placeholder="- پشتیبانی ۲۴ ساعته&#10;- آپدیت رایگان&#10;- بکاپ روزانه"></textarea>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={submitting} className="px-8 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-lg">{editingId ? 'ثبت نسخه قیمت جدید' : 'ثبت پلن قیمت‌گذاری'}</button>
            {editingId && <button type="button" onClick={() => { setEditingId(null); setName(''); setDescription(''); }} className="px-5 py-3 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold">انصراف</button>}
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {plans.map(p => (
          <div key={p.id} className={`p-6 rounded-3xl border transition-all ${p.is_active ? 'dark:border-brand-500/30 border-brand-500/30 shadow-lg shadow-brand-500/5' : 'dark:border-slate-800 border-slate-200 opacity-70'} glass-card space-y-4`}>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-black text-brand-500">{p.name}</h3>
                {p.description && <p className="text-xs text-slate-400 mt-1">{p.description}</p>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(p)} className="p-2 rounded-xl bg-sky-500/10 text-sky-500 hover:bg-sky-500 hover:text-white border border-sky-500/20" aria-label="ویرایش و ثبت قیمت جدید">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => handleToggle(p.id)} className={`p-2 rounded-xl border transition-colors ${p.is_active ? 'bg-emerald-500/10 text-emerald-500 hover:bg-amber-500 hover:text-white' : 'bg-slate-500/10 text-slate-400 hover:bg-emerald-500 hover:text-white'}`}>
                  <Power className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(p.id)} className="p-2 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-500/20">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Server className="w-3 h-3" />
                <span>سرور: {p.server_cost?.toLocaleString() || 0} ت/ماه</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Headphones className="w-3 h-3" />
                <span>پشتیبانی: {p.support_cost?.toLocaleString() || 0} ت/ماه</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs dark:text-slate-400 font-bold"><span>ماهانه:</span><span className="dark:text-white text-slate-900">{p.monthly_price?.toLocaleString() || 0} تومان</span></div>
              <div className="flex justify-between text-xs dark:text-slate-400 font-bold"><span>سالانه:</span><span className="dark:text-white text-slate-900">{p.yearly_price?.toLocaleString() || 0} تومان</span></div>
            </div>

            <div className="flex gap-2 flex-wrap">
              <span className="text-[9px] bg-brand-500/10 text-brand-500 px-2 py-1 rounded-full font-bold">{p.service_type === 'HOSTING' ? 'میزبانی' : p.service_type === 'SUPPORT' ? 'پشتیبانی' : p.service_type === 'MAINTENANCE' ? 'نگهداری' : 'سایر'}</span>
              {p.trial_days > 0 && <span className="text-[9px] bg-sky-500/10 text-sky-500 px-2 py-1 rounded-full font-bold">{p.trial_days} روز تست</span>}
              {p.min_months > 1 && <span className="text-[9px] bg-amber-500/10 text-amber-500 px-2 py-1 rounded-full font-bold">حداقل {p.min_months} ماه</span>}
            </div>

            {p.price_versions?.length > 0 && (
              <div className="border-t dark:border-slate-800 pt-3 space-y-1">
                <div className="text-[10px] font-bold text-slate-500">تاریخچه قیمت ماهانه</div>
                {p.price_versions.slice(0, 3).map((version: any) => (
                  <div key={version.id} className="flex justify-between text-[10px] text-slate-400">
                    <span>از {version.effective_from}</span>
                    <span className="font-mono">{Number(version.monthly_price).toLocaleString()} تومان</span>
                  </div>
                ))}
              </div>
            )}

            <div className="text-[10px] dark:text-slate-400 whitespace-pre-line border-t dark:border-slate-800 pt-4 font-medium">
              {p.features_list}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
