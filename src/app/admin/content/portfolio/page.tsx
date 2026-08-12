'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { FolderOpen, PlusCircle, CheckCircle2, Star, Trash2, Edit, X, ExternalLink, Save, AlertCircle, Tag, Cpu } from 'lucide-react';
import { adminFetch } from '@/lib/api';
import FileUpload from '@/components/admin/FileUpload';

const TiptapEditor = dynamic(() => import('@/components/admin/TiptapEditor'), { ssr: false });

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export default function AdminPortfolioPage() {
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [technologies, setTechnologies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  
  // Form states
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [clientDisplay, setClientDisplay] = useState('');
  const [summary, setSummary] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [progress, setProgress] = useState(100);
  const [isFeatured, setIsFeatured] = useState(true);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [selectedTechs, setSelectedTechs] = useState<number[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Category & Tech management
  const [newCatName, setNewCatName] = useState('');
  const [newTechName, setNewTechName] = useState('');

  const loadAll = async () => {
    setLoading(true);
    try {
      const [pRes, metaRes] = await Promise.all([
        adminFetch(`${API_BASE}/api/admin/portfolio-projects/`),
        adminFetch(`${API_BASE}/api/admin/project-metadata/`),
      ]);
      setPortfolio(pRes || []);
      setCategories(metaRes?.categories || []);
      setTechnologies(metaRes?.technologies || []);
    } catch (err) {
      console.error('Error loading portfolio data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    loadAll(); 
  }, []);

  const showMsg = (type: 'success' | 'error', text: string) => {
    if (type === 'success') setSuccessMsg(text);
    else setErrorMsg(text);
    setTimeout(() => { setSuccessMsg(''); setErrorMsg(''); }, 3000);
  };

  // ─── Modal Handlers ───
  const openCreateModal = () => {
    setEditId(null);
    setTitle(''); setSlug(''); setClientDisplay(''); setSummary('');
    setFullDescription(''); setMetaTitle(''); setMetaDescription('');
    setDemoUrl(''); setImageUrl(''); setProgress(100); setIsFeatured(true);
    setCategoryId(null); setSelectedTechs([]);
    setShowModal(true);
  };

  const openEditModal = (p: any) => {
    setEditId(p.id);
    setTitle(p.title); setSlug(p.slug); setClientDisplay(p.client_name_display);
    setSummary(p.summary); setFullDescription(p.full_description || '');
    setMetaTitle(p.meta_title || ''); setMetaDescription(p.meta_description || '');
    setDemoUrl(p.demo_url || ''); setImageUrl(p.image_url || '');
    setProgress(p.sprint_progress || 100);
    setIsFeatured(p.is_featured);
    setCategoryId(p.category_id || null);
    setSelectedTechs(p.technology_ids || []);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditId(null);
  };

  // ─── Submit Handler ───
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg(''); setErrorMsg('');
    try {
      const payload = {
        id: editId,
        title, slug, client_name_display: clientDisplay, summary,
        full_description: fullDescription, meta_title: metaTitle,
        meta_description: metaDescription, demo_url: demoUrl, image_url: imageUrl,
        sprint_progress: progress, is_featured: isFeatured,
        category_id: categoryId, technology_ids: selectedTechs
      };
      
      const method = editId ? 'PUT' : 'POST';
      const res = await adminFetch(`${API_BASE}/api/admin/portfolio-projects/`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res?.message) {
        showMsg('success', res.message);
        closeModal();
        loadAll();
      }
    } catch (err: any) {
      showMsg('error', err?.message || 'خطا در ثبت نمونه‌کار');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Delete Handler ───
  const handleDelete = async (id: number) => {
    if (!confirm('آیا از حذف این نمونه‌کار اطمینان دارید؟')) return;
    try {
      await adminFetch(`${API_BASE}/api/admin/portfolio-projects/?id=${id}`, { method: 'DELETE' });
      showMsg('success', 'نمونه‌کار حذف شد.');
      loadAll();
    } catch (err: any) {
      showMsg('error', err?.message || 'خطا در حذف');
    }
  };

  // ─── Category & Tech Handlers ───
  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    try {
      const res = await adminFetch(`${API_BASE}/api/admin/project-metadata/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_category', name: newCatName })
      });
      if (res?.message) {
        showMsg('success', res.message);
        setNewCatName('');
        // Reload categories
        const metaRes = await adminFetch(`${API_BASE}/api/admin/project-metadata/`);
        setCategories(metaRes?.categories || []);
      } else if (res?.error) {
        showMsg('error', res.error);
      }
    } catch (err: any) {
      showMsg('error', err?.message || 'خطا در افزودن دسته‌بندی');
    }
  };

  const handleAddTechnology = async () => {
    if (!newTechName.trim()) return;
    try {
      const res = await adminFetch(`${API_BASE}/api/admin/project-metadata/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_technology', name: newTechName })
      });
      if (res?.message) {
        showMsg('success', res.message);
        setNewTechName('');
        // Reload technologies
        const metaRes = await adminFetch(`${API_BASE}/api/admin/project-metadata/`);
        setTechnologies(metaRes?.technologies || []);
      } else if (res?.error) {
        showMsg('error', res.error);
      }
    } catch (err: any) {
      showMsg('error', err?.message || 'خطا در افزودن تکنولوژی');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('آیا از حذف این دسته‌بندی اطمینان دارید؟')) return;
    try {
      await adminFetch(`${API_BASE}/api/admin/project-metadata/`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_category', id })
      });
      showMsg('success', 'دسته‌بندی حذف شد');
      const metaRes = await adminFetch(`${API_BASE}/api/admin/project-metadata/`);
      setCategories(metaRes?.categories || []);
    } catch (err: any) {
      showMsg('error', err?.message || 'خطا در حذف دسته‌بندی');
    }
  };

  const handleDeleteTechnology = async (id: number) => {
    if (!confirm('آیا از حذف این تکنولوژی اطمینان دارید؟')) return;
    try {
      await adminFetch(`${API_BASE}/api/admin/project-metadata/`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_technology', id })
      });
      showMsg('success', 'تکنولوژی حذف شد');
      const metaRes = await adminFetch(`${API_BASE}/api/admin/project-metadata/`);
      setTechnologies(metaRes?.technologies || []);
    } catch (err: any) {
      showMsg('error', err?.message || 'خطا در حذف تکنولوژی');
    }
  };

  const toggleTech = (techId: number) => {
    setSelectedTechs(prev => 
      prev.includes(techId) ? prev.filter(id => id !== techId) : [...prev, techId]
    );
  };

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
            <FolderOpen className="w-7 h-7 text-brand-500" />
            نمونه‌کارها و پروژه‌ها
          </h1>
          <p className="text-xs text-slate-400 mt-1">مدیریت پورتفولیو و نمونه‌کارهای عمومی</p>
        </div>
        <button onClick={openCreateModal}
          className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-brand-500/20">
          <PlusCircle className="w-4 h-4" /> نمونه‌کار جدید
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

      {/* Categories & Technologies Management */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Categories */}
        <div className="p-4 rounded-2xl glass-card border dark:border-slate-800 border-slate-200 space-y-3">
          <h3 className="text-sm font-bold dark:text-white flex items-center gap-2">
            <Tag className="w-4 h-4 text-brand-500" /> دسته‌بندی‌ها
          </h3>
          <div className="flex gap-2">
            <input type="text" value={newCatName} onChange={e => setNewCatName(e.target.value)}
              placeholder="دسته‌بندی جدید..."
              className="flex-1 px-3 py-2 rounded-lg dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 border-slate-200 text-xs focus:outline-none focus:border-brand-500"
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddCategory())} />
            <button onClick={handleAddCategory} className="px-3 py-2 rounded-lg bg-brand-500 text-white text-xs font-bold">
              <PlusCircle className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {categories.map(c => (
              <span key={c.id} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-brand-500/10 text-brand-500 text-[10px] font-bold border border-brand-500/20">
                {c.name}
                <button onClick={() => handleDeleteCategory(c.id)} className="hover:text-rose-500">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {categories.length === 0 && <span className="text-[10px] text-slate-400">هنوز دسته‌بندی‌ای ثبت نشده</span>}
          </div>
        </div>

        {/* Technologies */}
        <div className="p-4 rounded-2xl glass-card border dark:border-slate-800 border-slate-200 space-y-3">
          <h3 className="text-sm font-bold dark:text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-500" /> تکنولوژی‌ها
          </h3>
          <div className="flex gap-2">
            <input type="text" value={newTechName} onChange={e => setNewTechName(e.target.value)}
              placeholder="تکنولوژی جدید..."
              className="flex-1 px-3 py-2 rounded-lg dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 border-slate-200 text-xs focus:outline-none focus:border-brand-500"
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddTechnology())} />
            <button onClick={handleAddTechnology} className="px-3 py-2 rounded-lg bg-emerald-500 text-white text-xs font-bold">
              <PlusCircle className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {technologies.map(t => (
              <span key={t.id} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold border border-emerald-500/20">
                {t.name}
                <button onClick={() => handleDeleteTechnology(t.id)} className="hover:text-rose-500">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {technologies.length === 0 && <span className="text-[10px] text-slate-400">هنوز تکنولوژی‌ای ثبت نشده</span>}
          </div>
        </div>
      </div>

      {/* Portfolio Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {portfolio.map((p: any) => (
          <div key={p.id} className="p-5 rounded-2xl glass-card border dark:border-slate-800 border-slate-200 space-y-3 shadow-lg hover:border-brand-500/30 transition-colors">
            {p.image_url && (
              <div className="w-full h-24 rounded-xl overflow-hidden border dark:border-slate-700">
                <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold dark:text-white text-slate-900 text-sm">{p.title}</h3>
                <p className="text-xs text-brand-500 font-bold mt-1">{p.client_name_display}</p>
              </div>
              {p.is_featured && <Star className="w-5 h-5 text-amber-400 fill-amber-400" />}
            </div>
            
            <p className="text-xs dark:text-slate-300 text-slate-600 line-clamp-2">{p.summary}</p>
            
            {p.technologies?.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {p.technologies.slice(0, 3).map((tech: string, i: number) => (
                  <span key={i} className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[9px] font-bold">{tech}</span>
                ))}
                {p.technologies.length > 3 && <span className="text-[9px] text-slate-400">+{p.technologies.length - 3}</span>}
              </div>
            )}
            
            <div className="flex items-center justify-between pt-3 border-t dark:border-slate-800 border-slate-200">
              <div className="flex gap-2">
                <button onClick={() => openEditModal(p)} className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500 hover:text-white transition-all" title="ویرایش">
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all" title="حذف">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              {p.demo_url && (
                <a href={p.demo_url} target="_blank" rel="noreferrer" className="text-xs text-brand-500 font-bold flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" /> دمو
                </a>
              )}
            </div>
          </div>
        ))}
        {portfolio.length === 0 && (
          <div className="col-span-3 text-center py-16 text-slate-400 glass-card rounded-2xl border dark:border-slate-800">
            <FolderOpen className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="text-sm font-bold mb-2">هنوز نمونه‌کاری ثبت نشده</p>
            <button onClick={openCreateModal} className="px-4 py-2 rounded-lg bg-brand-500 text-white text-xs font-bold">
              افزودن اولین نمونه‌کار
            </button>
          </div>
        )}
      </div>

      {/* ===== PORTFOLIO MODAL ===== */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-right max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 bg-slate-900 border-b border-slate-800 p-5 flex items-center justify-between rounded-t-3xl">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                {editId ? <Edit className="w-5 h-5 text-indigo-400" /> : <PlusCircle className="w-5 h-5 text-brand-400" />}
                {editId ? 'ویرایش نمونه‌کار' : 'نمونه‌کار جدید'}
              </h3>
              <button onClick={closeModal} className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">عنوان پروژه:</label>
                  <input required value={title} onChange={e => setTitle(e.target.value)}
                    placeholder="سامانه پایش تاسیسات"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500 font-bold" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">Slug:</label>
                  <input required value={slug} onChange={e => setSlug(e.target.value)}
                    placeholder="cmms-system"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500 font-mono" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">نام کارفرما:</label>
                  <input required value={clientDisplay} onChange={e => setClientDisplay(e.target.value)}
                    placeholder="بیمارستان ولایت"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">لینک دمو:</label>
                  <input type="url" value={demoUrl} onChange={e => setDemoUrl(e.target.value)}
                    placeholder="https://demo.anpk.ir"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500 font-mono" />
                </div>
              </div>

              {/* Image Upload */}
              <FileUpload
                value={imageUrl}
                onChange={setImageUrl}
                label="تصویر نمونه‌کار"
                type="image"
                placeholder="تصویر نمایشی پروژه را آپلود کنید..."
              />

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">خلاصه:</label>
                <input required value={summary} onChange={e => setSummary(e.target.value)}
                  placeholder="خلاصه دستاوردها و ارزش افزوده..."
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">دسته‌بندی:</label>
                  <select value={categoryId || ''} onChange={e => setCategoryId(Number(e.target.value) || null)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500 font-bold">
                    <option value="">بدون دسته‌بندی</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">درصد پیشرفت: {progress}%</label>
                  <input type="range" min="0" max="100" value={progress} onChange={e => setProgress(Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-500" />
                </div>
              </div>

              {/* Technologies */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 block">تکنولوژی‌ها:</label>
                <div className="flex flex-wrap gap-2">
                  {technologies.map(t => (
                    <button key={t.id} type="button" onClick={() => toggleTech(t.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        selectedTechs.includes(t.id)
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}>
                      {t.name}
                    </button>
                  ))}
                  {technologies.length === 0 && <span className="text-xs text-slate-400">ابتدا تکنولوژی‌ها را اضافه کنید</span>}
                </div>
              </div>

              {/* Full Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">محتوای کامل پروژه:</label>
                <TiptapEditor content={fullDescription} onChange={setFullDescription} placeholder="شرح کامل معماری فنی و جزئیات استقرار..." />
              </div>

              {/* SEO */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-700 space-y-3">
                <h4 className="text-xs font-bold text-brand-400">تنظیمات سئو</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">Meta Title (حداکثر ۷۰ کاراکتر):</label>
                    <input maxLength={70} value={metaTitle} onChange={e => setMetaTitle(e.target.value)}
                      placeholder="عنوان جذاب برای گوگل..."
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">Meta Description (حداکثر ۱۶۰ کاراکتر):</label>
                    <textarea maxLength={160} value={metaDescription} onChange={e => setMetaDescription(e.target.value)}
                      placeholder="توضیحات سئو..."
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500 resize-none h-[38px]" />
                  </div>
                </div>
              </div>

              {/* Featured Toggle */}
              <label className="flex items-center gap-3 cursor-pointer">
                <div onClick={() => setIsFeatured(!isFeatured)}
                  className={`w-10 h-5 rounded-full transition-colors relative ${isFeatured ? 'bg-brand-500' : 'bg-slate-600'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${isFeatured ? 'left-5' : 'left-0.5'}`} />
                </div>
                <span className="text-xs font-bold flex items-center gap-1"><Star className="w-3 h-3 text-yellow-500" /> نمایش ویژه در صفحه اصلی</span>
              </label>

              {/* Modal Footer */}
              <div className="flex gap-3 pt-4 border-t border-slate-800">
                <button type="submit" disabled={submitting}
                  className="flex-1 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold flex items-center justify-center gap-2">
                  {editId ? <Save className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
                  {submitting ? 'در حال ثبت...' : (editId ? 'ذخیره تغییرات' : 'ذخیره نمونه‌کار')}
                </button>
                <button type="button" onClick={closeModal}
                  className="px-6 py-3 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 transition-colors">
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
