'use client';

import React, { useState, useEffect } from 'react';
import { updateAdminItem, deleteAdminItem, adminFetch } from '@/lib/api';
import { Cpu, PlusCircle, CheckCircle2, Globe, Trash2, Eye, Edit, X, Tag, Sparkles } from 'lucide-react';

const API_BASE = 'http://127.0.0.1:8000/api/portal';

export default function AdminProductsPage() {
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'features'>('products');
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [features, setFeatures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Product form
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [demoUrl, setDemoUrl] = useState('https://anpk.ir');
  const [categoryId, setCategoryId] = useState<number | null>(null);

  // Category form
  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catIcon, setCatIcon] = useState('cpu');

  // Feature form
  const [featProductId, setFeatProductId] = useState<number | null>(null);
  const [featTitle, setFeatTitle] = useState('');
  const [featDesc, setFeatDesc] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // View & Edit Modals
  const [viewProduct, setViewProduct] = useState<any>(null);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [saving, setSaving] = useState(false);

  const loadAll = async () => {
    try {
      const [pRes, cRes, fRes] = await Promise.all([
        adminFetch(`${API_BASE}/admin/products/`),
        adminFetch(`${API_BASE}/admin/product-categories/`),
        adminFetch(`${API_BASE}/admin/product-features/`),
      ]);
      setProducts(pRes || []);
      setCategories(cRes || []);
      setFeatures(fRes || []);
    } catch (err) {
      console.error('Error loading products data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg('');
    try {
      const res = await adminFetch(`${API_BASE}/admin/products/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, slug, short_description: shortDesc, demo_url: demoUrl, category_id: categoryId })
      }).then(r => r.json());
      if (res?.message) { setSuccessMsg(res.message); setName(''); setSlug(''); setShortDesc(''); loadAll(); }
    } catch (err) { console.error(err); } finally { setSubmitting(false); }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await adminFetch(`${API_BASE}/admin/product-categories/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: catName, slug: catSlug, icon_name: catIcon })
      }).then(r => r.json());
      if (res?.message) { setSuccessMsg(res.message); setCatName(''); setCatSlug(''); loadAll(); }
    } catch (err) { console.error(err); } finally { setSubmitting(false); }
  };

  const handleCreateFeature = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!featProductId) return;
    setSubmitting(true);
    try {
      const res = await adminFetch(`${API_BASE}/admin/product-features/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: featProductId, title: featTitle, description: featDesc })
      }).then(r => r.json());
      if (res?.message) { setSuccessMsg(res.message); setFeatTitle(''); setFeatDesc(''); loadAll(); }
    } catch (err) { console.error(err); } finally { setSubmitting(false); }
  };

  const handleOpenEdit = (p: any) => {
    setEditProduct(p); setEditName(p.name || ''); setEditDesc(p.short_description || ''); setEditStatus(p.status || 'ACTIVE');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProduct) return;
    setSaving(true);
    try {
      await updateAdminItem('product', editProduct.id, { name: editName, short_description: editDesc, status: editStatus });
      setEditProduct(null); loadAll();
    } catch (err) { console.error(err); } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('آیا از حذف این محصول اطمینان دارید؟')) return;
    await deleteAdminItem('product', id); loadAll();
  };

  if (loading) return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
    </div>
  );

  const tabs = [
    { id: 'products', label: `محصولات (${products.length})` },
    { id: 'categories', label: `دسته‌بندی‌ها (${categories.length})` },
    { id: 'features', label: `ویژگی‌های محصولات (${features.length})` },
  ] as const;

  return (
    <div className="space-y-8 animate-fade-in text-right">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black dark:text-white text-slate-900 flex items-center gap-3">
          <Cpu className="w-7 h-7 text-brand-500" />
          مدیریت کاتالوگ محصولات، دسته‌بندی‌ها & ویژگی‌ها
        </h1>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" /><span>{successMsg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b dark:border-slate-800 border-slate-200">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl border-b-2 transition-all ${activeTab === t.id ? 'border-brand-500 text-brand-500 bg-brand-500/5' : 'border-transparent dark:text-slate-400 text-slate-500'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ===== TAB 1: PRODUCTS ===== */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl glass-card border dark:border-slate-800 border-slate-200 space-y-5 shadow-xl">
            <div className="flex items-center gap-2 border-b dark:border-slate-800 border-slate-200 pb-4">
              <PlusCircle className="w-5 h-5 text-brand-500" />
              <h2 className="text-base font-black dark:text-white text-slate-900">افزودن محصول جدید</h2>
            </div>
            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold dark:text-slate-300 text-slate-700 block">نام محصول:</label>
                  <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="CMMS تأسیسات نگار"
                    className="w-full px-4 py-3 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 border-slate-300 text-xs dark:text-white text-slate-900 focus:outline-none focus:border-brand-500 font-bold" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold dark:text-slate-300 text-slate-700 block">نامک (Slug):</label>
                  <input type="text" required value={slug} onChange={e => setSlug(e.target.value)} placeholder="tasisatnegar-cmms"
                    className="w-full px-4 py-3 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 border-slate-300 text-xs dark:text-white text-slate-900 focus:outline-none focus:border-brand-500 font-mono font-bold" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold dark:text-slate-300 text-slate-700 block">دسته‌بندی:</label>
                  <select onChange={e => setCategoryId(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 border-slate-300 text-xs dark:text-white text-slate-900 focus:outline-none focus:border-brand-500 font-bold">
                    <option value="">بدون دسته‌بندی</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold dark:text-slate-300 text-slate-700 block">لینک دمو:</label>
                  <input type="text" value={demoUrl} onChange={e => setDemoUrl(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 border-slate-300 text-xs dark:text-white text-slate-900 focus:outline-none focus:border-brand-500 font-mono font-bold" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold dark:text-slate-300 text-slate-700 block">توضیحات کوتاه:</label>
                <input type="text" required value={shortDesc} onChange={e => setShortDesc(e.target.value)} placeholder="توضیحات کلیدی محصول..."
                  className="w-full px-4 py-3 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 border-slate-300 text-xs dark:text-white text-slate-900 focus:outline-none focus:border-brand-500 font-medium" />
              </div>
              <button type="submit" disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20">
                <PlusCircle className="w-4 h-4" />{submitting ? 'در حال ثبت...' : 'افزودن به کاتالوگ'}
              </button>
            </form>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {products.map((p: any) => (
              <div key={p.id} className="p-5 rounded-2xl glass-card border dark:border-slate-800 border-slate-200 space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black dark:text-white text-slate-900">{p.name}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">{p.status || 'ACTIVE'}</span>
                </div>
                {p.category_name && <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 font-bold">{p.category_name}</span>}
                <p className="text-xs dark:text-slate-300 text-slate-600 line-clamp-2 font-medium">{p.short_description}</p>
                <div className="flex items-center justify-between pt-2 border-t dark:border-slate-800 border-slate-200">
                  <div className="flex gap-2">
                    <button onClick={() => setViewProduct(p)} className="p-1.5 rounded-lg bg-slate-800 text-brand-400 hover:bg-slate-700 transition-colors" title="جزئیات"><Eye className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleOpenEdit(p)} className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-colors" title="ویرایش"><Edit className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all" title="حذف"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                  {p.demo_url && <a href={p.demo_url} target="_blank" rel="noreferrer" className="text-xs text-brand-500 font-bold flex items-center gap-1"><Globe className="w-3 h-3" />دمو</a>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== TAB 2: CATEGORIES ===== */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl glass-card border dark:border-slate-800 border-slate-200 space-y-5 shadow-xl">
            <div className="flex items-center gap-2 border-b dark:border-slate-800 border-slate-200 pb-4">
              <Tag className="w-5 h-5 text-brand-500" />
              <h2 className="text-base font-black dark:text-white text-slate-900">افزودن دسته‌بندی محصول جدید</h2>
            </div>
            <form onSubmit={handleCreateCategory} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              <div className="space-y-1.5">
                <label className="text-xs font-bold dark:text-slate-300 text-slate-700 block">نام دسته‌بندی:</label>
                <input type="text" required value={catName} onChange={e => setCatName(e.target.value)} placeholder="نرم‌افزار صنعتی"
                  className="w-full px-4 py-3 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 border-slate-300 text-xs dark:text-white text-slate-900 focus:outline-none focus:border-brand-500 font-bold" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold dark:text-slate-300 text-slate-700 block">نامک (Slug):</label>
                <input type="text" required value={catSlug} onChange={e => setCatSlug(e.target.value)} placeholder="industrial-software"
                  className="w-full px-4 py-3 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 border-slate-300 text-xs dark:text-white text-slate-900 focus:outline-none focus:border-brand-500 font-mono font-bold" />
              </div>
              <button type="submit" disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md">
                <PlusCircle className="w-4 h-4" />{submitting ? 'در حال ثبت...' : 'ثبت دسته‌بندی'}
              </button>
            </form>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {categories.map((c: any) => (
              <div key={c.id} className="p-5 rounded-2xl glass-card border dark:border-slate-800 border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black dark:text-white text-slate-900 flex items-center gap-1.5"><Tag className="w-4 h-4 text-brand-500" />{c.name}</span>
                  <span className="text-xs font-bold text-brand-500 bg-brand-500/10 px-2 py-0.5 rounded-full">{c.products_count} محصول</span>
                </div>
                <span className="text-xs text-slate-400 font-mono block">slug: {c.slug}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== TAB 3: FEATURES ===== */}
      {activeTab === 'features' && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl glass-card border dark:border-slate-800 border-slate-200 space-y-5 shadow-xl">
            <div className="flex items-center gap-2 border-b dark:border-slate-800 border-slate-200 pb-4">
              <Sparkles className="w-5 h-5 text-brand-500" />
              <h2 className="text-base font-black dark:text-white text-slate-900">افزودن ویژگی جدید به محصول</h2>
            </div>
            <form onSubmit={handleCreateFeature} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              <div className="space-y-1.5">
                <label className="text-xs font-bold dark:text-slate-300 text-slate-700 block">انتخاب محصول:</label>
                <select required onChange={e => setFeatProductId(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 border-slate-300 text-xs dark:text-white text-slate-900 focus:outline-none focus:border-brand-500 font-bold">
                  <option value="">انتخاب محصول...</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold dark:text-slate-300 text-slate-700 block">عنوان ویژگی:</label>
                <input type="text" required value={featTitle} onChange={e => setFeatTitle(e.target.value)} placeholder="مانیتورینگ آنلاین ۲۴/۷"
                  className="w-full px-4 py-3 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 border-slate-300 text-xs dark:text-white text-slate-900 focus:outline-none focus:border-brand-500 font-bold" />
              </div>
              <button type="submit" disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md">
                <PlusCircle className="w-4 h-4" />{submitting ? 'در حال افزودن...' : 'افزودن ویژگی'}
              </button>
            </form>
          </div>
          <div className="space-y-2">
            {features.map((f: any) => (
              <div key={f.id} className="p-4 rounded-2xl glass-card border dark:border-slate-800 border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-black dark:text-white text-slate-900">{f.title}</span>
                  <span className="text-[10px] text-brand-400 font-bold mr-2">({f.product_name})</span>
                </div>
                {f.description && <p className="text-xs text-slate-400 hidden sm:block">{f.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-2xl text-right">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2"><Eye className="w-5 h-5 text-brand-400" />جزئیات محصول</h3>
              <button onClick={() => setViewProduct(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800"><span className="text-slate-400 block">نام:</span><span className="font-black text-white">{viewProduct.name}</span></div>
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800"><span className="text-slate-400 block">Slug:</span><span className="font-mono text-brand-400">{viewProduct.slug}</span></div>
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800"><span className="text-slate-400 block">دسته‌بندی:</span><span className="font-bold text-white">{viewProduct.category_name || 'ندارد'}</span></div>
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800"><span className="text-slate-400 block">توضیحات:</span><p className="text-slate-200 leading-relaxed">{viewProduct.short_description}</p></div>
            </div>
            <button onClick={() => setViewProduct(null)} className="w-full py-2.5 rounded-xl bg-slate-800 text-white text-xs font-bold">بستن</button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-2xl text-right">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2"><Edit className="w-5 h-5 text-indigo-400" />ویرایش محصول #{editProduct.id}</h3>
              <button onClick={() => setEditProduct(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">نام محصول:</label>
                <input type="text" required value={editName} onChange={e => setEditName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500 font-bold" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">توضیحات:</label>
                <textarea rows={3} value={editDesc} onChange={e => setEditDesc(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500"></textarea>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">وضعیت:</label>
                <select value={editStatus} onChange={e => setEditStatus(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500 font-bold">
                  <option value="ACTIVE">فعال</option>
                  <option value="INACTIVE">غیرفعال</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="flex-1 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold">
                  {saving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                </button>
                <button type="button" onClick={() => setEditProduct(null)} className="px-4 py-3 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">انصراف</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

