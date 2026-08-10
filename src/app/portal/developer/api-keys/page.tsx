'use client';

import React, { useEffect, useState } from 'react';
import { Key, Copy, Plus, ShieldCheck } from 'lucide-react';
import { createAPIKey, getAPIKeys, getClientProjects } from '@/lib/api';

type ClientApiKey = {
  id: number;
  name: string;
  key_type: string;
  api_key: string;
  project_id: number | null;
  project_name: string;
  is_active: boolean;
  date: string;
};

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ClientApiKey[]>([]);
  const [name, setName] = useState('');
  const [projectId, setProjectId] = useState('');
  const [projects, setProjects] = useState<any[]>([]);
  const [createdKey, setCreatedKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadKeys = async () => {
    try {
      const data = await getAPIKeys();
      setKeys(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در دریافت کلیدها');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKeys();
    getClientProjects()
      .then((data) => setProjects(Array.isArray(data) ? data : []))
      .catch((err) => setError(err instanceof Error ? err.message : 'خطا در دریافت پروژه‌ها'));
  }, []);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !projectId) return;
    setSubmitting(true);
    setError('');
    try {
      const result = await createAPIKey(name.trim(), projectId);
      setCreatedKey(result.api_key || '');
      setName('');
      setProjectId('');
      await loadKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ساخت کلید ناموفق بود');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl glass-card border dark:border-slate-800 border-slate-200/90 space-y-6 card-elevated animate-fade-in text-right">
      <div className="space-y-2 border-b dark:border-slate-800 border-slate-200 pb-4">
        <h2 className="text-xl font-black dark:text-white text-slate-900 flex items-center gap-2">
          <Key className="w-6 h-6 text-amber-500" />
          مدیریت کلیدهای API سازمان
        </h2>
        <p className="text-xs dark:text-slate-400 text-slate-600 font-medium">
          مقدار کامل هر کلید فقط هنگام ایجاد نمایش داده می‌شود. آن را در محل امن نگهداری کنید.
        </p>
      </div>

      <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3">
        <select value={projectId} onChange={(event) => setProjectId(event.target.value)} required className="w-full sm:w-64 px-4 py-3 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 border-slate-300 text-sm">
          <option value="">انتخاب پروژه...</option>
          {projects.map(project => <option key={project.id} value={project.id}>{project.title}</option>)}
        </select>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="عنوان کاربرد کلید"
          className="flex-1 px-4 py-3 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 border-slate-300 text-sm"
        />
        <button
          type="submit"
          disabled={submitting || !name.trim() || !projectId}
          className="px-5 py-3 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {submitting ? 'در حال ساخت...' : 'ساخت کلید'}
        </button>
      </form>

      {createdKey && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
          <div className="flex items-center gap-2 text-emerald-500 text-sm font-bold">
            <ShieldCheck className="w-5 h-5" /> کلید جدید ساخته شد؛ این مقدار دوباره نمایش داده نمی‌شود.
          </div>
          <div className="flex gap-2">
            <code className="flex-1 p-3 rounded-xl bg-slate-950 text-emerald-300 text-xs dir-ltr text-left overflow-x-auto">{createdKey}</code>
            <button type="button" onClick={() => navigator.clipboard.writeText(createdKey)} className="p-3 rounded-xl bg-slate-800 text-white" aria-label="کپی کلید">
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-rose-500 font-bold">{error}</p>}

      <div className="space-y-3">
        {loading ? (
          <p className="text-sm text-slate-500">در حال دریافت کلیدها...</p>
        ) : keys.length === 0 ? (
          <p className="text-sm text-slate-500">هنوز کلیدی برای این سازمان ساخته نشده است.</p>
        ) : keys.map((key) => (
          <div key={key.id} className="p-4 rounded-2xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-800 border-slate-200 space-y-2">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-bold dark:text-white text-slate-900">{key.name}</span>
              <span className={`text-[10px] px-2 py-1 rounded-lg font-bold ${key.is_active ? 'bg-emerald-500/15 text-emerald-500' : 'bg-slate-500/15 text-slate-500'}`}>
                {key.is_active ? 'فعال' : 'غیرفعال'}
              </span>
            </div>
            <span className="block text-[10px] font-bold text-brand-500">پروژه: {key.project_name}</span>
            <code className="block text-xs text-amber-500 dir-ltr text-left">{key.api_key}</code>
            <span className="block text-[10px] text-slate-500">ایجاد: {key.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
