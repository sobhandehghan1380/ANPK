'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { FolderOpen, PlusCircle, CheckCircle2, Star, Trash2, Edit, X } from 'lucide-react';
import { adminFetch } from '@/lib/api';

// React Quill CSS
import 'react-quill/dist/quill.snow.css';

// Dynamically import react-quill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export default function AdminPortfolioPage() {
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [clientDisplay, setClientDisplay] = useState('');
  const [summary, setSummary] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [progress, setProgress] = useState(100);
  const [isFeatured, setIsFeatured] = useState(true);

  const [editId, setEditId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  
  const formRef = useRef<HTMLDivElement>(null);

  const loadAll = async () => {
    try {
      setLoading(true);
      const pRes = await adminFetch(`${API_BASE}/api/portal/admin/portfolio-projects/`);
      setPortfolio(pRes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const handleCreatePortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg('');
    try {
      const payload = {
        id: editId,
        title,
        slug,
        client_name_display: clientDisplay,
        summary,
        full_description: fullDescription,
        meta_title: metaTitle,
        meta_description: metaDescription,
        sprint_progress: progress,
        is_featured: isFeatured
      };
      
      const method = editId ? 'PUT' : 'POST';
      const res = await adminFetch(`${API_BASE}/api/portal/admin/portfolio-projects/`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res?.message) {
        setSuccessMsg(res.message);
        setShowForm(false);
        setEditId(null);
        setTitle(''); setSlug(''); setClientDisplay(''); setSummary(''); 
        setFullDescription(''); setMetaTitle(''); setMetaDescription('');
        setProgress(100); setIsFeatured(true);
        loadAll();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (p: any) => {
    setEditId(p.id);
    setTitle(p.title);
    setSlug(p.slug);
    setClientDisplay(p.client_name_display);
    setSummary(p.summary);
    setFullDescription(p.full_description || '');
    setMetaTitle(p.meta_title || '');
    setMetaDescription(p.meta_description || '');
    setProgress(p.sprint_progress || 100);
    setIsFeatured(p.is_featured);
    setShowForm(true);
    
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('آیا از حذف این نمونه‌کار اطمینان دارید؟')) return;
    try {
      await adminFetch(`${API_BASE}/api/portal/admin/portfolio-projects/?id=${id}`, { method: 'DELETE' });
      loadAll();
    } catch(err) {
      console.error(err);
    }
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image'],
      ['clean']
    ],
  };

  if (loading) return <div className="p-8 text-center">درحال بارگذاری...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-800 dark:text-white">
          <FolderOpen className="text-brand-500" />
          نمونه‌کارها و پروژه‌های عمومی (Portfolio)
        </h1>
        <button 
          onClick={() => {
            setShowForm(!showForm);
            if (!showForm) {
              setEditId(null);
              setTitle(''); setSlug(''); setClientDisplay(''); setSummary(''); 
              setFullDescription(''); setMetaTitle(''); setMetaDescription(''); setProgress(100); setIsFeatured(true);
            }
          }}
          className="px-4 py-2 bg-brand-500 text-white rounded-lg text-sm font-bold flex items-center gap-2"
        >
          {showForm ? 'بستن فرم' : <><PlusCircle className="w-4 h-4" /> افزودن نمونه‌کار جدید</>}
        </button>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 p-4 rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          {successMsg}
        </div>
      )}

      {showForm && (
        <div ref={formRef} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
             <h2 className="text-lg font-bold">{editId ? `ویرایش نمونه‌کار: ${title}` : 'ایجاد نمونه‌کار جدید با ویرایشگر پیشرفته'}</h2>
             {editId && <button onClick={() => {setShowForm(false); setEditId(null);}} className="p-1 rounded bg-slate-100 text-slate-500"><X className="w-5 h-5" /></button>}
          </div>
          <form onSubmit={handleCreatePortfolio} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500">عنوان پروژه</label>
                <input required value={title} onChange={e => setTitle(e.target.value)} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm" placeholder="مثال: سامانه پایش..." />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500">Slug (شناسه آدرس انگلیسی)</label>
                <input required value={slug} onChange={e => setSlug(e.target.value)} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm" placeholder="مثال: cmms-system" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500">نام سازمان کارفرما</label>
                <input required value={clientDisplay} onChange={e => setClientDisplay(e.target.value)} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500">خلاصه (نمایش در کارت)</label>
                <input required value={summary} onChange={e => setSummary(e.target.value)} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500">درصد پیشرفت (۰ تا ۱۰۰)</label>
                <input type="number" min="0" max="100" required value={progress} onChange={e => setProgress(Number(e.target.value))} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-mono" />
              </div>
              <div className="space-y-2 flex flex-col justify-center">
                <label className="text-xs font-bold text-slate-500 mb-2">پروژه ویژه (نمایش در صفحه اصلی)</label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-brand-500"></div>
                </label>
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
               <h3 className="text-sm font-bold mb-4 text-brand-600">تنظیمات SEO (بهینه‌سازی موتور جستجو)</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <label className="text-xs font-bold text-slate-500">Meta Title (حداکثر ۷۰ کاراکتر)</label>
                   <input maxLength={70} value={metaTitle} onChange={e => setMetaTitle(e.target.value)} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm" placeholder="عنوان جذاب برای گوگل..." />
                 </div>
                 <div className="space-y-2">
                   <label className="text-xs font-bold text-slate-500">Meta Description (حداکثر ۱۶۰ کاراکتر)</label>
                   <textarea maxLength={160} value={metaDescription} onChange={e => setMetaDescription(e.target.value)} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm h-[52px]" placeholder="توضیحات سئو..." />
                 </div>
               </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-6 space-y-2">
              <label className="text-xs font-bold text-slate-500">محتوای کامل پروژه (Rich Text)</label>
              <div className="bg-white text-slate-900 rounded-lg overflow-hidden border border-slate-200">
                <ReactQuill theme="snow" modules={modules} value={fullDescription} onChange={setFullDescription} className="h-64" />
              </div>
            </div>
            
            <div className="flex gap-4 items-center pt-8">
              <button disabled={submitting} type="submit" className="px-8 py-3 bg-brand-500 hover:bg-brand-600 transition-colors text-white rounded-lg font-bold">
                {submitting ? 'در حال ثبت...' : (editId ? 'ذخیره تغییرات نمونه‌کار' : 'ذخیره نمونه‌کار جدید')}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {portfolio.map((p: any) => (
           <div key={p.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
             <div className="flex justify-between items-start">
               <div>
                  <h3 className="font-bold text-slate-800 dark:text-white text-sm">{p.title}</h3>
                  <p className="text-xs text-brand-500 font-bold mt-1">{p.client_display}</p>
               </div>
               {p.is_featured && <Star className="w-5 h-5 text-amber-400 fill-amber-400" />}
             </div>
             
             <div className="text-xs text-slate-500 line-clamp-2">
               {p.summary}
             </div>
             
             <div className="flex items-center gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <a href={`/portfolio/${p.slug}`} target="_blank" className="flex-1 py-2 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-center rounded-lg text-xs font-bold hover:bg-brand-50 hover:text-brand-600 transition-colors">
                  مشاهده دمو
                </a>
                <button onClick={() => handleEdit(p)} className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500 hover:text-white transition-colors" title="ویرایش">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(p.id)} className="p-2 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors" title="حذف">
                  <Trash2 className="w-4 h-4" />
                </button>
             </div>
           </div>
         ))}
      </div>
    </div>
  );
}
