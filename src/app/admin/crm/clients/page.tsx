'use client';

import React, { useState, useEffect } from 'react';
import { getAdminClients, createAdminClient, getAdminUsers, deleteAdminItem } from '@/lib/api';
import { Users, PlusCircle, CheckCircle2, ShieldCheck, Wallet, FolderGit2, Trash2, UserCheck, Link as LinkIcon } from 'lucide-react';

export default function AdminClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const loadData = async () => {
    try {
      const [cList, uList] = await Promise.all([
        getAdminClients(),
        getAdminUsers()
      ]);
      setClients(cList || []);
      setUsers(uList || []);
    } catch (err) {
      console.error('Error loading clients & users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    setSubmitting(true);
    setSuccessMsg('');
    try {
      const res = await createAdminClient(name, contactPerson, phone, selectedUserId || undefined);
      if (res?.message) {
        setSuccessMsg(res.message);
        setName('');
        setContactPerson('');
        setPhone('');
        setSelectedUserId(null);
        loadData();
      }
    } catch (err) {
      console.error('Error creating client:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClient = async (id: number) => {
    if (!confirm('آیا از حذف این سازمان و کیف‌پول آن اطمینان دارید؟')) return;
    try {
      await deleteAdminItem('client', id);
      loadData();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-center">
        <div className="space-y-3">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-slate-400">در حال دریافت لیست سازمان‌ها و اکانت‌های کاربر متصل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in text-right">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black dark:text-white text-slate-900 flex items-center gap-3">
          <Users className="w-7 h-7 text-brand-500" />
          مدیریت سازمان‌ها & اتصال به اکانت کاربران (Client Organizations & Users)
        </h1>
        <p className="text-xs sm:text-sm dark:text-slate-400 text-slate-600">
          تعریف سازمان جدید، انتساب اکانت کاربر مسئول (Owner User)، تخصیص کیف‌پول اعتباری و پایش پروژه‌های مرتبط.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Create Client Form with Linked User Dropdown */}
      <div className="p-6 sm:p-8 rounded-3xl glass-card border dark:border-slate-800 border-slate-200 space-y-6 shadow-xl">
        <div className="flex items-center gap-2 border-b dark:border-slate-800 border-slate-200 pb-4">
          <PlusCircle className="w-5 h-5 text-brand-500" />
          <h2 className="text-lg font-black dark:text-white text-slate-900">ثبت سازمان جدید & انتساب اکانت کاربر</h2>
        </div>

        <form onSubmit={handleCreateClient} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold dark:text-slate-300 text-slate-700 block">نام سازمان / شرکت / بیمارستان:</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثلاً: علوم پزشکی / نگارستان"
                className="w-full px-4 py-3 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 border-slate-300 text-xs dark:text-white text-slate-900 focus:outline-none focus:border-brand-500 font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold dark:text-slate-300 text-slate-700 block">نام نماینده / رابط مسئول:</label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="مهندس شاطریان"
                className="w-full px-4 py-3 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 border-slate-300 text-xs dark:text-white text-slate-900 focus:outline-none focus:border-brand-500 font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold dark:text-slate-300 text-slate-700 block">شماره همراه پورتال:</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="09130000000"
                className="w-full px-4 py-3 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 border-slate-300 text-xs dark:text-white text-slate-900 focus:outline-none focus:border-brand-500 font-mono font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold dark:text-slate-300 text-slate-700 block">انتساب به اکانت کاربر (User):</label>
              <select
                onChange={(e) => setSelectedUserId(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 border-slate-300 text-xs dark:text-white text-slate-900 focus:outline-none focus:border-brand-500 font-bold"
              >
                <option value="">انتخاب کاربر مالک (اختیاری)...</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.username} ({u.role_label})</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-all shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{submitting ? 'در حال ثبت...' : 'ایجاد سازمان، انتساب کاربر و ساخت کیف‌پول ۱۰ میلیون تومانی'}</span>
          </button>
        </form>
      </div>

      {/* Organizations Grid with Linked User & Projects */}
      <div className="space-y-6">
        <h2 className="text-lg font-black dark:text-white text-slate-900">لیست سازمان‌ها، اکانت متصل و پروژه‌ها:</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {clients.map((c: any) => (
            <div key={c.id} className="p-6 rounded-3xl glass-card border dark:border-slate-800 border-slate-200 space-y-4 shadow-xl text-right">
              <div className="flex items-start justify-between gap-3 border-b dark:border-slate-800 border-slate-200 pb-3">
                <div className="space-y-1">
                  <h3 className="text-base font-black dark:text-white text-slate-900">{c.name}</h3>
                  <span className="text-xs text-brand-500 font-mono font-bold">شماره تماس: {c.phone}</span>
                </div>

                <button
                  onClick={() => handleDeleteClient(c.id)}
                  className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all"
                  title="حذف سازمان"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Linked User Info */}
              <div className="p-3 rounded-2xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-800 border-slate-200 flex items-center justify-between text-xs">
                <span className="font-bold dark:text-slate-300 text-slate-700 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-indigo-500" />
                  اکانت کاربر مالک:
                </span>
                <span className="font-mono font-bold text-indigo-500">{c.owner_username}</span>
              </div>

              {/* Linked Wallet Info */}
              <div className="p-3 rounded-2xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-800 border-slate-200 flex items-center justify-between text-xs">
                <span className="font-bold dark:text-slate-300 text-slate-700 flex items-center gap-1.5">
                  <Wallet className="w-4 h-4 text-emerald-500" />
                  موجود کیف‌پول:
                </span>
                <span className="font-mono font-black text-emerald-500">{(c.wallet_balance || 0).toLocaleString('fa-IR')} تومان</span>
              </div>

              {/* Linked Projects */}
              <div className="space-y-2 pt-2 border-t dark:border-slate-800 border-slate-200">
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                  <FolderGit2 className="w-4 h-4 text-brand-500" />
                  پروژه‌های متصل ({c.projects_count || 0} پروژه):
                </span>

                {c.projects_list?.length > 0 ? (
                  <div className="space-y-1">
                    {c.projects_list.map((p: any) => (
                      <div key={p.id} className="flex justify-between text-xs p-2 rounded-xl dark:bg-slate-950 bg-white border dark:border-slate-800 border-slate-200">
                        <span className="font-bold dark:text-white text-slate-900">{p.title}</span>
                        <span className="font-mono text-brand-500">{p.sprint_progress}% پیشرفت</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-slate-400 block">هنوز پروژه‌ای ثبت نشده است.</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
