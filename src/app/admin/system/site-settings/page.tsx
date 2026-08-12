'use client';

import React, { useState, useEffect } from 'react';
import { adminFetch } from '@/lib/api';
import { Settings, ShieldCheck, CheckCircle2, Type, Building2, PanelTop, Trash2, PlusCircle } from 'lucide-react';

const API_BASE = 'http://127.0.0.1:8000/api/admin';

export default function AdminSiteSettingsPage() {
  const [activeTab, setActiveTab] = useState<'company' | 'hero' | 'typewriter'>('company');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const [company, setCompany] = useState({ name: '', tagline: '', phone: '', email: '', address: '' });
  const [hero, setHero] = useState({ badge_text: '', main_title_static: '', sub_description: '', primary_button_text: '', secondary_button_text: '', is_active: true });
  const [typewriters, setTypewriters] = useState<any[]>([]);

  const [newTwText, setNewTwText] = useState('');
  const [newTwOrder, setNewTwOrder] = useState('1');
  const [newTwColor, setNewTwColor] = useState('gradient-text-primary');

  const fetchSettings = async () => {
    try {
      const res = await adminFetch(`${API_BASE}/admin/site-settings/`);
      if (res) {
        setCompany(res.company);
        setHero(res.hero);
        setTypewriters(res.typewriters || []);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  const handleUpdateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await adminFetch(`${API_BASE}/admin/site-settings/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_company', ...company })
      });
      showSuccess(res.message || 'اطلاعات شرکت با موفقیت ثبت شد');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateHero = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await adminFetch(`${API_BASE}/admin/site-settings/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_hero', ...hero })
      });
      showSuccess(res.message || 'تنظیمات هیرو بروزرسانی شد');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddTypewriter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTwText) return;
    setSubmitting(true);
    try {
      const res = await adminFetch(`${API_BASE}/admin/site-settings/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_typewriter', text: newTwText, order: newTwOrder, color_class: newTwColor })
      });
      setNewTwText('');
      fetchSettings();
      showSuccess(res.message || 'متن جدید اضافه شد');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTypewriter = async (id: number) => {
    if (!confirm('از حذف این آیتم اطمینان دارید؟')) return;
    try {
      await adminFetch(`${API_BASE}/admin/site-settings/`, {
        method: 'POST', // Backend expects action in POST for this script
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_typewriter', id })
      });
      fetchSettings();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-center">
        <div className="space-y-3">
          <div className="w-10 h-10 border-4 border-slate-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-slate-400">در حال دریافت تنظیمات سیستم...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in text-right">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black dark:text-white text-slate-900 flex items-center gap-3">
          <ShieldCheck className="w-7 h-7 text-brand-500" />
          تنظیمات پایه و هیرو سایت
        </h1>
        <p className="text-xs sm:text-sm dark:text-slate-400 text-slate-600">
          اطلاعات اصلی شرکت و همچنین محتوای صفحه اول (Hero) را در این بخش مدیریت کنید.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center justify-between gap-2">
          <span>{successMsg}</span>
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b dark:border-slate-800 border-slate-200 pb-0 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('company')}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-black transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'company'
              ? 'border-brand-500 text-brand-500 dark:text-brand-400'
              : 'border-transparent dark:text-slate-400 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          اطلاعات شرکت
        </button>
        <button
          onClick={() => setActiveTab('hero')}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-black transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'hero'
              ? 'border-brand-500 text-brand-500 dark:text-brand-400'
              : 'border-transparent dark:text-slate-400 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <PanelTop className="w-4 h-4" />
          متن‌های صفحه اول
        </button>
        <button
          onClick={() => setActiveTab('typewriter')}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-black transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'typewriter'
              ? 'border-brand-500 text-brand-500 dark:text-brand-400'
              : 'border-transparent dark:text-slate-400 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <Type className="w-4 h-4" />
          افکت تایپ شونده
        </button>
      </div>

      {/* TAB 1: Company Info */}
      {activeTab === 'company' && (
        <div className="p-6 sm:p-8 rounded-3xl glass-card border dark:border-slate-800 border-slate-200 space-y-6 shadow-xl">
          <form onSubmit={handleUpdateCompany} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold dark:text-slate-300 text-slate-700">نام شرکت:</label>
              <input
                type="text"
                value={company.name}
                onChange={e => setCompany({ ...company, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 border-slate-300 text-xs dark:text-white text-slate-900 focus:outline-none focus:border-brand-500 font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold dark:text-slate-300 text-slate-700">شعار / تگ‌لاین:</label>
              <input
                type="text"
                value={company.tagline}
                onChange={e => setCompany({ ...company, tagline: e.target.value })}
                className="w-full px-4 py-3 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 border-slate-300 text-xs dark:text-white text-slate-900 focus:outline-none focus:border-brand-500 font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold dark:text-slate-300 text-slate-700">تلفن تماس:</label>
              <input
                type="text"
                value={company.phone}
                onChange={e => setCompany({ ...company, phone: e.target.value })}
                className="w-full px-4 py-3 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 border-slate-300 text-xs dark:text-white text-slate-900 focus:outline-none focus:border-brand-500 font-bold dir-ltr"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold dark:text-slate-300 text-slate-700">ایمیل:</label>
              <input
                type="email"
                value={company.email}
                onChange={e => setCompany({ ...company, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 border-slate-300 text-xs dark:text-white text-slate-900 focus:outline-none focus:border-brand-500 font-bold dir-ltr"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label className="text-xs font-bold dark:text-slate-300 text-slate-700">آدرس (جهت نمایش در فوتر):</label>
              <textarea
                value={company.address}
                onChange={e => setCompany({ ...company, address: e.target.value })}
                className="w-full px-4 py-3 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 border-slate-300 text-xs dark:text-white text-slate-900 focus:outline-none focus:border-brand-500 font-bold min-h-[80px]"
              />
            </div>
            
            <div className="sm:col-span-2 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-all shadow-lg shadow-brand-500/20 w-full sm:w-auto"
              >
                {submitting ? 'در حال ثبت...' : 'ذخیره اطلاعات شرکت'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: Hero Section */}
      {activeTab === 'hero' && (
        <div className="p-6 sm:p-8 rounded-3xl glass-card border dark:border-slate-800 border-slate-200 space-y-6 shadow-xl">
          <form onSubmit={handleUpdateHero} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2 sm:col-span-2">
              <label className="text-xs font-bold dark:text-slate-300 text-slate-700">متن بج بالایی (بالای تیتر اصلی):</label>
              <input
                type="text"
                value={hero.badge_text}
                onChange={e => setHero({ ...hero, badge_text: e.target.value })}
                className="w-full px-4 py-3 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 border-slate-300 text-xs dark:text-white text-slate-900 focus:outline-none focus:border-brand-500 font-bold"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label className="text-xs font-bold dark:text-slate-300 text-slate-700">متن ثابت تیتر (قبل از عبارات تایپ شونده):</label>
              <input
                type="text"
                value={hero.main_title_static}
                onChange={e => setHero({ ...hero, main_title_static: e.target.value })}
                className="w-full px-4 py-3 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 border-slate-300 text-xs dark:text-white text-slate-900 focus:outline-none focus:border-brand-500 font-bold"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label className="text-xs font-bold dark:text-slate-300 text-slate-700">توضیحات اصلی هیرو:</label>
              <textarea
                value={hero.sub_description}
                onChange={e => setHero({ ...hero, sub_description: e.target.value })}
                className="w-full px-4 py-3 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 border-slate-300 text-xs dark:text-white text-slate-900 focus:outline-none focus:border-brand-500 font-bold min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold dark:text-slate-300 text-slate-700">متن دکمه اصلی:</label>
              <input
                type="text"
                value={hero.primary_button_text}
                onChange={e => setHero({ ...hero, primary_button_text: e.target.value })}
                className="w-full px-4 py-3 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 border-slate-300 text-xs dark:text-white text-slate-900 focus:outline-none focus:border-brand-500 font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold dark:text-slate-300 text-slate-700">متن دکمه دوم (اختیاری):</label>
              <input
                type="text"
                value={hero.secondary_button_text}
                onChange={e => setHero({ ...hero, secondary_button_text: e.target.value })}
                className="w-full px-4 py-3 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 border-slate-300 text-xs dark:text-white text-slate-900 focus:outline-none focus:border-brand-500 font-bold"
              />
            </div>

            <div className="space-y-2 sm:col-span-2 pt-2 border-t dark:border-slate-800 border-slate-200 mt-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={hero.is_active}
                  onChange={e => setHero({ ...hero, is_active: e.target.checked })}
                  className="w-5 h-5 rounded border-slate-700 bg-slate-900 text-brand-500 focus:ring-brand-500/20"
                />
                <span className="text-sm font-bold dark:text-white text-slate-900">فعال بودن بخش هیرو در سایت</span>
              </label>
            </div>
            
            <div className="sm:col-span-2 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-all shadow-lg shadow-brand-500/20 w-full sm:w-auto"
              >
                {submitting ? 'در حال ثبت...' : 'ذخیره تنظیمات هیرو'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: Typewriter Items */}
      {activeTab === 'typewriter' && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl glass-card border dark:border-slate-800 border-slate-200 shadow-xl">
            <h2 className="text-base font-black dark:text-white text-slate-900 mb-4 border-b dark:border-slate-800 border-slate-200 pb-4">افزودن عبارت متحرک جدید</h2>
            <form onSubmit={handleAddTypewriter} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
              <div className="space-y-2 sm:col-span-2">
                <label className="text-xs font-bold dark:text-slate-300 text-slate-700">متن عبارت:</label>
                <input
                  type="text"
                  required
                  value={newTwText}
                  onChange={e => setNewTwText(e.target.value)}
                  placeholder="مثلاً: پلتفرم‌های ابری"
                  className="w-full px-4 py-3 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 border-slate-300 text-xs dark:text-white text-slate-900 focus:outline-none focus:border-brand-500 font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold dark:text-slate-300 text-slate-700">ترتیب نمایش:</label>
                <input
                  type="number"
                  value={newTwOrder}
                  onChange={e => setNewTwOrder(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 border-slate-300 text-xs dark:text-white text-slate-900 focus:outline-none focus:border-brand-500 font-bold dir-ltr"
                />
              </div>
              <div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full px-4 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-all shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  افزودن
                </button>
              </div>
            </form>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {typewriters.length === 0 ? (
              <p className="text-sm text-slate-400 p-4 col-span-full">هیچ عبارت متحرکی ثبت نشده است.</p>
            ) : (
              typewriters.map(tw => (
                <div key={tw.id} className="p-4 rounded-2xl border dark:border-slate-800 border-slate-200 glass-card flex items-center justify-between gap-3 shadow-sm hover:border-brand-500/30 transition-all">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 flex items-center justify-center rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-slate-400">
                      {tw.order}
                    </span>
                    <span className="text-sm font-black dark:text-white text-slate-900">{tw.text}</span>
                  </div>
                  <button 
                    onClick={() => handleDeleteTypewriter(tw.id)}
                    className="p-2 rounded-xl hover:bg-rose-500/10 text-rose-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
