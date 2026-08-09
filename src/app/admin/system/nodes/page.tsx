'use client';

import React, { useState, useEffect } from 'react';
import { getAdminNodes, createAdminNode } from '@/lib/api';
import { Server, PlusCircle, CheckCircle2, Activity, Wifi } from 'lucide-react';

export default function AdminNodesPage() {
  const [nodes, setNodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [statusLabel, setStatusLabel] = useState('عملیاتی (۹۹.۹٪)');
  const [uptime, setUptime] = useState('۹۹.۹٪');
  const [latency, setLatency] = useState(25);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const loadNodes = async () => {
    try {
      const res = await getAdminNodes();
      setNodes(res);
    } catch (err) {
      console.error('Error loading admin nodes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNodes();
  }, []);

  const handleCreateNode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    setSubmitting(true);
    setSuccessMsg('');
    try {
      const res = await createAdminNode(name, statusLabel, uptime, latency);
      if (res?.message) {
        setSuccessMsg(res.message);
        setName('');
        loadNodes();
      }
    } catch (err) {
      console.error('Error creating admin node:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-center">
        <div className="space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-slate-400">در حال دریافت وضعیت نودها...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in text-right">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black dark:text-white text-slate-900 flex items-center gap-3">
          <Server className="w-7 h-7 text-emerald-500" />
          مانیتورینگ زنده نودها & پایداری زیرساخت (Nodes & Servers)
        </h1>
        <p className="text-xs sm:text-sm dark:text-slate-400 text-slate-600">
          افزودن نود سرور جدید، پایش آنلاین تاخیر شبکه (Latency) و درصد Uptime موتورهای وبینار و OCR.
        </p>
      </div>

      {/* Create Node Form */}
      <div className="p-6 sm:p-8 rounded-3xl glass-card border dark:border-slate-800 border-slate-200 space-y-6 shadow-xl">
        <div className="flex items-center gap-2 border-b dark:border-slate-800 border-slate-200 pb-4">
          <PlusCircle className="w-5 h-5 text-emerald-500" />
          <h2 className="text-lg font-black dark:text-white text-slate-900">افزودن نود سرور جدید به شبکه مانیتورینگ</h2>
        </div>

        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleCreateNode} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-bold dark:text-slate-300 text-slate-700 block">عنوان نود سرور:</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثلاً: سرور پردازش بینایی ماشین و اسناد OCR"
              className="w-full px-4 py-3 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 border-slate-300 text-xs dark:text-white text-slate-900 focus:outline-none focus:border-emerald-500 font-bold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold dark:text-slate-300 text-slate-700 block">تاخیر شبکه (ms):</label>
            <input
              type="number"
              required
              value={latency}
              onChange={(e) => setLatency(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 border-slate-300 text-xs dark:text-white text-slate-900 focus:outline-none focus:border-emerald-500 font-mono font-bold"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{submitting ? 'در حال ثبت...' : 'افزودن نود سرور'}</span>
          </button>
        </form>
      </div>

      {/* Nodes Status Grid */}
      <div className="p-6 sm:p-8 rounded-3xl glass-card border dark:border-slate-800 border-slate-200 space-y-4">
        <h2 className="text-base font-bold dark:text-white text-slate-900">نودهای فعال در شبکه زیرساخت ANPK:</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {nodes.map((n: any) => (
            <div key={n.id} className="p-5 rounded-2xl dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold dark:text-white text-slate-900">{n.name}</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>

              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-emerald-500">{n.status_label}</span>
                <span className="dark:text-slate-400 text-slate-500 font-mono">تاخیر: {n.latency}ms</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
