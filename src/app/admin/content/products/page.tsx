'use client';

import React, { useState, useEffect } from 'react';
import { adminFetch } from '@/lib/api';
import { Cpu, PlusCircle, CheckCircle2, Globe, Trash2, Eye, Edit, X, Tag, Sparkles, Star, Image, Save, AlertCircle, Package } from 'lucide-react';
import FileUpload from '@/components/admin/FileUpload';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export default function AdminProductsPage() {
  const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products');
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showProductModal, setShowProductModal] = useState(false);
  const [editProdId, setEditProdId] = useState<number | null>(null);
  const [prodForm, setProdForm] = useState({
    name: '', slug: '', short_description: '', full_description: '',
    demo_url: '', image_url: '', features_list: '', technical_specs: '',
    category_id: '', status: 'دمو فعال / آماده استقرار', is_featured: true, order: 0
  });
  const [productFeatures, setProductFeatures] = useState<any[]>([]);
  const [newFeature, setNewFeature] = useState({ title: '', description: '', icon_name: 'CheckCircle2' });

  // Category form
  const [catForm, setCatForm] = useState({ name: '', slug: '', icon_name: 'Layers', description: '', order: 0 });
  const [editCatId, setEditCatId] = useState<number | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // View Modal
  const [viewProduct, setViewProduct] = useState<any>(null);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([
        adminFetch(`${API_BASE}/api/portal/admin/products/`),
        adminFetch(`${API_BASE}/api/portal/admin/product-categories/`),
      ]);
      setProducts(pRes || []);
      setCategories(cRes || []);
    } catch (err) {
      console.error('Error loading products data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const showMsg = (type: 'success' | 'error', text: string) => {
    if (type === 'success') setSuccessMsg(text);
    else setErrorMsg(text);
    setTimeout(() => { setSuccessMsg(''); setErrorMsg(''); }, 3000);
  };

  // ─── Product Modal ───
  const openCreateModal = () => {
    setEditProdId(null);
    setProdForm({ name: '', slug: '', short_description: '', full_description: '', demo_url: '', image_url: '', features_list: '', technical_specs: '', category_id: '', status: 'دمو فعال / آماده استقرار', is_featured: true, order: 0 });
    setProductFeatures([]);
    setNewFeature({ title: '', description: '', icon_name: 'CheckCircle2' });
    setShowProductModal(true);
  };

  const openEditModal = async (p: any) => {
    setEditProdId(p.id);
    setProdForm({
      name: p.name, slug: p.slug, short_description: p.short_description || '',
      full_description: p.full_description || '', demo_url: p.demo_url || '',
      image_url: p.image_url || '', features_list: p.features_list || '',
      technical_specs: p.technical_specs || '', category_id: p.category_id ? String(p.category_id) : '',
      status: p.status || 'دمو فعال / آماده استقرار', is_featured: p.is_featured, order: p.order || 0
    });
    
    try {
      const features = await adminFetch(`${API_BASE}/api/portal/admin/product-features/?product_id=${p.id}`);
      setProductFeatures(features || []);
    } catch {
      setProductFeatures([]);
    }
    setNewFeature({ title: '', description: '', icon_name: 'CheckCircle2' });
    setShowProductModal(true);
  };

  const closeProductModal = () => {
    setShowProductModal(false);
    setEditProdId(null);
    setProductFeatures([]);
  };

  // ─── Product Handlers ───
  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const method = editProdId ? 'PUT' : 'POST';
      const body = editProdId 
        ? { ...prodForm, id: editProdId, category_id: prodForm.category_id ? Number(prodForm.category_id) : null }
        : { ...prodForm, category_id: prodForm.category_id ? Number(prodForm.category_id) : null };
      
      const res = await adminFetch(`${API_BASE}/api/portal/admin/products/`, {
        method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
      });
      if (res?.message) {
        showMsg('success', res.message);
        closeProductModal();
        loadAll();
      }
    } catch (err: any) { showMsg('error', err?.message || 'خطا در ثبت محصول'); }
    finally { setSubmitting(false); }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('آیا از حذف این محصول و تمام ویژگی‌های آن اطمینان دارید؟')) return;
    try {
      await adminFetch(`${API_BASE}/api/portal/admin/products/?id=${id}`, { method: 'DELETE' });
      showMsg('success', 'محصول حذف شد.');
      loadAll();
    } catch (err: any) { showMsg('error', err?.message || 'خطا در حذف'); }
  };

  // ─── Feature Handlers (Inline) ───
  const handleAddFeature = async () => {
    if (!newFeature.title.trim() || !editProdId) return;
    setSubmitting(true);
    try {
      const res = await adminFetch(`${API_BASE}/api/portal/admin/product-features/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: editProdId, ...newFeature })
      });
      if (res?.message) {
        showMsg('success', res.message);
        setNewFeature({ title: '', description: '', icon_name: 'CheckCircle2' });
        const features = await adminFetch(`${API_BASE}/api/portal/admin/product-features/?product_id=${editProdId}`);
        setProductFeatures(features || []);
      }
    } catch (err: any) { showMsg('error', err?.message || 'خطا در افزودن ویژگی'); }
    finally { setSubmitting(false); }
  };

  const handleUpdateFeature = async (featId: number, data: any) => {
    try {
      const res = await adminFetch(`${API_BASE}/api/portal/admin/product-features/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: featId, product_id: editProdId, ...data })
      });
      if (res?.message) {
        showMsg('success', res.message);
        const features = await adminFetch(`${API_BASE}/api/portal/admin/product-features/?product_id=${editProdId}`);
        setProductFeatures(features || []);
      }
    } catch (err: any) { showMsg('error', err?.message || 'خطا در بروزرسانی ویژگی'); }
  };

  const handleDeleteFeature = async (featId: number) => {
    if (!confirm('آیا از حذف این ویژگی اطمینان دارید؟')) return;
    try {
      await adminFetch(`${API_BASE}/api/portal/admin/product-features/?id=${featId}`, { method: 'DELETE' });
      showMsg('success', 'ویژگی حذف شد.');
      const features = await adminFetch(`${API_BASE}/api/portal/admin/product-features/?product_id=${editProdId}`);
      setProductFeatures(features || []);
    } catch (err: any) { showMsg('error', err?.message || 'خطا در حذف ویژگی'); }
  };

  // ─── Category Handlers ───
  const handleSubmitCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const method = editCatId ? 'PUT' : 'POST';
      const body = editCatId ? { ...catForm, id: editCatId } : catForm;
      const res = await adminFetch(`${API_BASE}/api/portal/admin/product-categories/`, {
        method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
      });
      if (res?.message) {
        showMsg('success', res.message);
        setCatForm({ name: '', slug: '', icon_name: 'Layers', description: '', order: 0 });
        setEditCatId(null);
        loadAll();
      }
    } catch (err: any) { showMsg('error', err?.message || 'خطا در ثبت دسته‌بندی'); }
    finally { setSubmitting(false); }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('آیا از حذف این دسته‌بندی اطمینان دارید؟')) return;
    try {
      await adminFetch(`${API_BASE}/api/portal/admin/product-categories/?id=${id}`, { method: 'DELETE' });
      showMsg('success', 'دسته‌بندی حذف شد.');
      loadAll();
    } catch (err: any) { showMsg('error', err?.message || 'خطا در حذف'); }
  };

  const startEditCategory = (c: any) => {
    setEditCatId(c.id);
    setCatForm({ name: c.name, slug: c.slug, icon_name: c.icon_name || 'Layers', description: c.description || '', order: c.order || 0 });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Stats
  const totalProducts = products.length;
  const featuredProducts = products.filter(p => p.is_featured).length;
  const totalCategories = categories.length;

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in text-right">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black dark:text-white text-slate-900 flex items-center gap-2">
            <Cpu className="w-7 h-7 text-brand-500" />
            مدیریت کاتالوگ محصولات
          </h1>
          <p className="text-xs text-slate-400 mt-1">مدیریت محصولات، دسته‌بندی‌ها و ویژگی‌های نرم‌افزاری</p>
        </div>
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
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card rounded-2xl p-4 border dark:border-slate-800 flex items-center gap-3">
          <Package className="w-5 h-5 text-brand-500" />
          <div>
            <div className="text-lg font-black dark:text-white">{totalProducts}</div>
            <div className="text-[10px] text-slate-400">کل محصولات</div>
          </div>
        </div>
        <div className="glass-card rounded-2xl p-4 border dark:border-slate-800 flex items-center gap-3">
          <Star className="w-5 h-5 text-yellow-500" />
          <div>
            <div className="text-lg font-black dark:text-white">{featuredProducts}</div>
            <div className="text-[10px] text-slate-400">محصولات ویژه</div>
          </div>
        </div>
        <div className="glass-card rounded-2xl p-4 border dark:border-slate-800 flex items-center gap-3">
          <Tag className="w-5 h-5 text-emerald-500" />
          <div>
            <div className="text-lg font-black dark:text-white">{totalCategories}</div>
            <div className="text-[10px] text-slate-400">دسته‌بندی‌ها</div>
          </div>
        </div>
      </div>

      {/* ===== PRODUCTS SECTION ===== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold dark:text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-brand-500" />
            محصولات
          </h2>
          <button onClick={openCreateModal}
            className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-brand-500/20">
            <PlusCircle className="w-4 h-4" /> محصول جدید
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p: any) => (
            <div key={p.id} className="p-5 rounded-2xl glass-card border dark:border-slate-800 border-slate-200 space-y-3 shadow-lg hover:border-brand-500/30 transition-colors">
              {p.image_url && (
                <div className="w-full h-32 rounded-xl overflow-hidden border dark:border-slate-700">
                  <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black dark:text-white text-slate-900">{p.name}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">{p.status}</span>
              </div>
              {p.category_name && <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 font-bold">{p.category_name}</span>}
              <p className="text-xs dark:text-slate-300 text-slate-600 line-clamp-2 font-medium">{p.short_description}</p>
              <div className="flex items-center justify-between pt-2 border-t dark:border-slate-800 border-slate-200">
                <div className="flex gap-2">
                  <button onClick={() => setViewProduct(p)} className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-brand-500 hover:bg-brand-500 hover:text-white transition-all" title="مشاهده"><Eye className="w-3.5 h-3.5" /></button>
                  <button onClick={() => openEditModal(p)} className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500 hover:text-white transition-all" title="ویرایش"><Edit className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDeleteProduct(p.id)} className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all" title="حذف"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
                {p.demo_url && <a href={p.demo_url} target="_blank" rel="noreferrer" className="text-xs text-brand-500 font-bold flex items-center gap-1"><Globe className="w-3 h-3" />دمو</a>}
              </div>
            </div>
          ))}
          {products.length === 0 && (
            <div className="col-span-3 text-center py-16 text-slate-400 glass-card rounded-2xl border dark:border-slate-800">
              <Cpu className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="text-sm font-bold mb-2">هنوز محصولی ثبت نشده</p>
              <button onClick={openCreateModal} className="px-4 py-2 rounded-lg bg-brand-500 text-white text-xs font-bold">
                افزودن اولین محصول
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ===== CATEGORIES SECTION ===== */}
      <div className="space-y-4 pt-6 border-t dark:border-slate-800">
        <h2 className="text-lg font-bold dark:text-white flex items-center gap-2">
          <Tag className="w-5 h-5 text-emerald-500" />
          دسته‌بندی‌ها
        </h2>

        {/* Category Form */}
        <div className="p-5 rounded-2xl glass-card border dark:border-slate-800 border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold dark:text-white">{editCatId ? 'ویرایش دسته‌بندی' : 'دسته‌بندی جدید'}</h3>
            {editCatId && (
              <button onClick={() => { setEditCatId(null); setCatForm({ name: '', slug: '', icon_name: 'Layers', description: '', order: 0 }); }}
                className="text-xs text-slate-400 hover:text-rose-500 flex items-center gap-1"><X className="w-3.5 h-3.5" /> لغو</button>
            )}
          </div>
          <form onSubmit={handleSubmitCategory} className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[150px] space-y-1">
              <label className="text-[10px] font-bold text-slate-400">نام:</label>
              <input type="text" required value={catForm.name} onChange={e => setCatForm({...catForm, name: e.target.value})}
                placeholder="نرم‌افزار صنعتی"
                className="w-full px-3 py-2 rounded-lg dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 border-slate-200 text-xs focus:outline-none focus:border-brand-500 font-bold" />
            </div>
            <div className="flex-1 min-w-[150px] space-y-1">
              <label className="text-[10px] font-bold text-slate-400">Slug:</label>
              <input type="text" required value={catForm.slug} onChange={e => setCatForm({...catForm, slug: e.target.value})}
                placeholder="industrial-software"
                className="w-full px-3 py-2 rounded-lg dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 border-slate-200 text-xs focus:outline-none focus:border-brand-500 font-mono" />
            </div>
            <div className="w-32 space-y-1">
              <label className="text-[10px] font-bold text-slate-400">آیکون:</label>
              <input type="text" value={catForm.icon_name} onChange={e => setCatForm({...catForm, icon_name: e.target.value})}
                placeholder="Layers"
                className="w-full px-3 py-2 rounded-lg dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 border-slate-200 text-xs focus:outline-none focus:border-brand-500 font-mono" />
            </div>
            <div className="w-20 space-y-1">
              <label className="text-[10px] font-bold text-slate-400">ترتیب:</label>
              <input type="number" value={catForm.order} onChange={e => setCatForm({...catForm, order: Number(e.target.value)})}
                className="w-full px-3 py-2 rounded-lg dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 border-slate-200 text-xs focus:outline-none focus:border-brand-500 text-center" />
            </div>
            <button type="submit" disabled={submitting}
              className="px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold flex items-center gap-1">
              {editCatId ? <Save className="w-3.5 h-3.5" /> : <PlusCircle className="w-3.5 h-3.5" />}
              {editCatId ? 'ذخیره' : 'افزودن'}
            </button>
          </form>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {categories.map((c: any) => (
            <div key={c.id} className="p-4 rounded-xl glass-card border dark:border-slate-800 border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-black dark:text-white text-slate-900 flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-brand-500" />{c.name}
                </span>
                <span className="text-[10px] font-bold text-brand-500 bg-brand-500/10 px-1.5 py-0.5 rounded">{c.products_count}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono block">/{c.slug}</span>
              <div className="flex gap-1 pt-1 border-t dark:border-slate-800">
                <button onClick={() => startEditCategory(c)}
                  className="flex-1 py-1 rounded bg-indigo-500/10 text-indigo-500 text-[9px] font-bold hover:bg-indigo-500 hover:text-white transition-all flex items-center justify-center gap-0.5">
                  <Edit className="w-2.5 h-2.5" /> ویرایش
                </button>
                <button onClick={() => handleDeleteCategory(c.id)}
                  className="flex-1 py-1 rounded bg-rose-500/10 text-rose-500 text-[9px] font-bold hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center gap-0.5">
                  <Trash2 className="w-2.5 h-2.5" /> حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== PRODUCT MODAL ===== */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-right max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 bg-slate-900 border-b border-slate-800 p-5 flex items-center justify-between rounded-t-3xl">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                {editProdId ? <Edit className="w-5 h-5 text-indigo-400" /> : <PlusCircle className="w-5 h-5 text-brand-400" />}
                {editProdId ? 'ویرایش محصول' : 'محصول جدید'}
              </h3>
              <button onClick={closeProductModal} className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitProduct} className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">نام محصول:</label>
                  <input type="text" required value={prodForm.name} onChange={e => setProdForm({...prodForm, name: e.target.value})}
                    placeholder="CMMS تأسیسات نگار"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500 font-bold" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">نامک (Slug):</label>
                  <input type="text" required value={prodForm.slug} onChange={e => setProdForm({...prodForm, slug: e.target.value})}
                    placeholder="tasisatnegar-cmms"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500 font-mono" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">دسته‌بندی:</label>
                  <select value={prodForm.category_id} onChange={e => setProdForm({...prodForm, category_id: e.target.value})}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500 font-bold">
                    <option value="">بدون دسته‌بندی</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">لینک دمو:</label>
                  <input type="text" value={prodForm.demo_url} onChange={e => setProdForm({...prodForm, demo_url: e.target.value})}
                    placeholder="https://demo.anpk.ir"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500 font-mono" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">توضیحات کوتاه:</label>
                <input type="text" required value={prodForm.short_description} onChange={e => setProdForm({...prodForm, short_description: e.target.value})}
                  placeholder="توضیحات کلیدی محصول..."
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">توضیحات کامل:</label>
                <textarea rows={3} value={prodForm.full_description} onChange={e => setProdForm({...prodForm, full_description: e.target.value})}
                  placeholder="توضیحات جامع محصول..."
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500 resize-none" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FileUpload
                  value={prodForm.image_url}
                  onChange={(url) => setProdForm({...prodForm, image_url: url})}
                  label="تصویر محصول"
                  type="image"
                  placeholder="تصویر محصول را آپلود کنید..."
                />
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">وضعیت:</label>
                  <select value={prodForm.status} onChange={e => setProdForm({...prodForm, status: e.target.value})}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500 font-bold">
                    <option value="دمو فعال / آماده استقرار">دمو فعال</option>
                    <option value="در حال توسعه">در حال توسعه</option>
                    <option value="منتشر شده">منتشر شده</option>
                    <option value="غیرفعال">غیرفعال</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">لیست ویژگی‌ها (هر خط یک ویژگی):</label>
                <textarea rows={3} value={prodForm.features_list} onChange={e => setProdForm({...prodForm, features_list: e.target.value})}
                  placeholder="مانیتورینگ آنلاین&#10;گزارش‌گیری پیشرفته&#10;پشتیبانی ۲۴/۷"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500 resize-none" />
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={prodForm.is_featured} onChange={e => setProdForm({...prodForm, is_featured: e.target.checked})}
                    className="w-4 h-4 text-brand-500 rounded" />
                  <span className="text-xs font-bold flex items-center gap-1"><Star className="w-3 h-3 text-yellow-500" /> نمایش ویژه</span>
                </label>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-slate-400">ترتیب:</label>
                  <input type="number" value={prodForm.order} onChange={e => setProdForm({...prodForm, order: Number(e.target.value)})}
                    className="w-16 px-2 py-1 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white text-center" />
                </div>
              </div>

              {/* Inline Features Section (shown when editing) */}
              {editProdId && (
                <div className="pt-5 border-t border-slate-800 space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-brand-500" />
                    <h3 className="text-sm font-bold text-white">ویژگی‌های تفصیلی محصول</h3>
                  </div>

                  {productFeatures.length > 0 && (
                    <div className="space-y-2">
                      {productFeatures.map((f: any) => (
                        <div key={f.id} className="p-3 rounded-xl bg-slate-950 border border-slate-700 flex items-center justify-between gap-3">
                          <div className="flex-1">
                            <span className="text-xs font-bold text-white">{f.title}</span>
                            {f.description && <p className="text-[11px] text-slate-400">{f.description}</p>}
                          </div>
                          <div className="flex gap-1">
                            <button type="button" onClick={() => {
                              const newTitle = prompt('عنوان جدید:', f.title);
                              if (newTitle !== null) handleUpdateFeature(f.id, { title: newTitle, description: f.description });
                            }} className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500 hover:text-white transition-all">
                              <Edit className="w-3 h-3" />
                            </button>
                            <button type="button" onClick={() => handleDeleteFeature(f.id)} className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-700 space-y-3">
                    <span className="text-xs font-bold text-slate-400">افزودن ویژگی جدید:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input type="text" value={newFeature.title} onChange={e => setNewFeature({...newFeature, title: e.target.value})}
                        placeholder="عنوان ویژگی"
                        className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500 font-bold" />
                      <input type="text" value={newFeature.description} onChange={e => setNewFeature({...newFeature, description: e.target.value})}
                        placeholder="توضیحات (اختیاری)"
                        className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500" />
                      <button type="button" onClick={handleAddFeature} disabled={!newFeature.title.trim()}
                        className="px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 disabled:bg-slate-700 text-white text-xs font-bold flex items-center justify-center gap-1 transition-all">
                        <PlusCircle className="w-3.5 h-3.5" /> افزودن
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Footer */}
              <div className="flex gap-3 pt-4 border-t border-slate-800">
                <button type="submit" disabled={submitting}
                  className="flex-1 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold flex items-center justify-center gap-2">
                  {editProdId ? <Save className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
                  {submitting ? 'در حال ثبت...' : (editProdId ? 'ذخیره تغییرات' : 'افزودن محصول')}
                </button>
                <button type="button" onClick={closeProductModal}
                  className="px-6 py-3 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 transition-colors">
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-2xl text-right max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2"><Eye className="w-5 h-5 text-brand-400" />جزئیات محصول</h3>
              <button onClick={() => setViewProduct(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            {viewProduct.image_url && (
              <div className="w-full h-40 rounded-xl overflow-hidden">
                <img src={viewProduct.image_url} alt={viewProduct.name} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800"><span className="text-slate-400 block">نام:</span><span className="font-black text-white">{viewProduct.name}</span></div>
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800"><span className="text-slate-400 block">Slug:</span><span className="font-mono text-brand-400">{viewProduct.slug}</span></div>
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800"><span className="text-slate-400 block">دسته‌بندی:</span><span className="font-bold text-white">{viewProduct.category_name || 'ندارد'}</span></div>
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800"><span className="text-slate-400 block">وضعیت:</span><span className="font-bold text-emerald-400">{viewProduct.status}</span></div>
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800"><span className="text-slate-400 block">توضیحات کوتاه:</span><p className="text-slate-200 leading-relaxed">{viewProduct.short_description}</p></div>
              {viewProduct.full_description && (
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800"><span className="text-slate-400 block">توضیحات کامل:</span><p className="text-slate-200 leading-relaxed">{viewProduct.full_description}</p></div>
              )}
              {viewProduct.features_list && (
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800"><span className="text-slate-400 block">ویژگی‌ها:</span><p className="text-slate-200 leading-relaxed whitespace-pre-line">{viewProduct.features_list}</p></div>
              )}
            </div>
            <button onClick={() => setViewProduct(null)} className="w-full py-2.5 rounded-xl bg-slate-800 text-white text-xs font-bold">بستن</button>
          </div>
        </div>
      )}
    </div>
  );
}
