'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAdminOverview, updateAdminItem, deleteAdminItem } from '@/lib/api';
import {
  Users,
  FolderGit2,
  Wallet,
  MessageSquare,
  PackageCheck,
  ArrowUpRight,
  Server,
  Edit,
  Trash2,
  CheckCircle2,
  X,
  Search,
  RefreshCw,
  ShieldCheck
} from 'lucide-react';

export default function CompactAdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'leads' | 'nodes'>('leads');

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [editType, setEditType] = useState<'lead' | 'node'>('lead');
  const [editStatus, setEditStatus] = useState('');
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getAdminOverview();
      setData(res);
    } catch (err) {
      console.error('Error loading admin overview from Django:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenEdit = (item: any, type: 'lead' | 'node') => {
    setEditItem(item);
    setEditType(type);
    setEditStatus(item.status || item.status_label || '');
    setEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editItem) return;
    setSaving(true);
    try {
      if (editType === 'lead') {
        await updateAdminItem('lead', editItem.id, { status: editStatus });
      } else if (editType === 'node') {
        await updateAdminItem('node', editItem.id, { status_label: editStatus });
      }
      setEditModalOpen(false);
      loadData();
    } catch (err) {
      console.error('Error updating item:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, type: string) => {
    if (!confirm('آیا از حذف این ردیف دیتابیس اطمینان دارید؟')) return;
    try {
      await deleteAdminItem(type, id);
      loadData();
    } catch (err) {
      console.error('Error deleting item:', err);
    }
  };

  if (loading && !data) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-center">
        <div className="space-y-3">
          <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-slate-400">در حال بارگذاری مرکز مدیریت...</p>
        </div>
      </div>
    );
  }

  const totalClients = data?.total_clients || 0;
  const activeProjects = data?.active_projects || 0;
  const walletsBalance = data?.total_wallets_balance || 0;
  const pendingTickets = data?.pending_tickets || 0;
  const recentLeads = data?.recent_leads || [];
  const nodes = data?.nodes || [];

  const filteredLeads = recentLeads.filter((l: any) =>
    l.organization.includes(searchQuery) || l.name.includes(searchQuery) || l.phone.includes(searchQuery)
  );

  return (
    <div className="space-y-5 animate-fade-in text-right">
      {/* Top Header Banner - Compact */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-400 text-[11px] font-bold border border-brand-500/20">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
            <span>پنل مدیریت ارشد ANPK Enterprise</span>
          </div>
          <h1 className="text-lg font-black text-white">مرکز پایش متمرکز مایکروپروسس‌های جنگو</h1>
        </div>

        <button
          onClick={loadData}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all border border-slate-700 flex items-center gap-1.5 shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5 text-brand-400" />
          <span>بروزرسانی داده‌ها</span>
        </button>
      </div>

      {/* 4 KPI Compact Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Link href="/admin/clients" className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-brand-500/50 transition-all space-y-2 group shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400">سازمان‌ها</span>
            <Users className="w-4 h-4 text-brand-400 group-hover:scale-110 transition-transform" />
          </div>
          <span className="text-xl font-black text-white block dir-rtl">
            {totalClients.toLocaleString('fa-IR')} <span className="text-[10px] font-normal text-slate-500">مورد</span>
          </span>
          <div className="text-[10px] font-bold text-brand-400 flex items-center gap-0.5 pt-1 border-t border-slate-800">
            <span>مدیریت کارفرمایان</span>
            <ArrowUpRight className="w-3 h-3" />
          </div>
        </Link>

        <Link href="/admin/projects" className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-all space-y-2 group shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400">پروژه‌های فعال</span>
            <FolderGit2 className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
          </div>
          <span className="text-xl font-black text-white block dir-rtl">
            {activeProjects.toLocaleString('fa-IR')} <span className="text-[10px] font-normal text-slate-500">پروژه</span>
          </span>
          <div className="text-[10px] font-bold text-indigo-400 flex items-center gap-0.5 pt-1 border-t border-slate-800">
            <span>مدیریت اسپرینت‌ها</span>
            <ArrowUpRight className="w-3 h-3" />
          </div>
        </Link>

        <Link href="/admin/wallets" className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-all space-y-2 group shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400">تراز مالی</span>
            <Wallet className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <span className="text-lg font-black text-emerald-400 block dir-rtl truncate">
            {walletsBalance.toLocaleString('fa-IR')} <span className="text-[10px] font-normal text-slate-500">تومان</span>
          </span>
          <div className="text-[10px] font-bold text-emerald-400 flex items-center gap-0.5 pt-1 border-t border-slate-800">
            <span>افزایش موجودی</span>
            <ArrowUpRight className="w-3 h-3" />
          </div>
        </Link>

        <Link href="/admin/tickets" className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition-all space-y-2 group shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400">تیکت‌های باز</span>
            <MessageSquare className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <span className="text-xl font-black text-white block dir-rtl">
            {pendingTickets.toLocaleString('fa-IR')} <span className="text-[10px] font-normal text-slate-500">تیکت</span>
          </span>
          <div className="text-[10px] font-bold text-amber-400 flex items-center gap-0.5 pt-1 border-t border-slate-800">
            <span>پاسخ گارانتی SLA</span>
            <ArrowUpRight className="w-3 h-3" />
          </div>
        </Link>
      </div>

      {/* Compact Data Table Section */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('leads')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'leads' ? 'bg-brand-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              لیدها ({recentLeads.length})
            </button>
            <button
              onClick={() => setActiveTab('nodes')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'nodes' ? 'bg-brand-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              نودها ({nodes.length})
            </button>
          </div>

          <div className="relative w-full sm:w-60">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو در جدول..."
              className="w-full pl-3 pr-8 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
          </div>
        </div>

        {/* Data Table */}
        {activeTab === 'leads' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="p-2.5 font-bold">سازمان</th>
                  <th className="p-2.5 font-bold">رابط</th>
                  <th className="p-2.5 font-bold">شماره تماس</th>
                  <th className="p-2.5 font-bold">سرویس</th>
                  <th className="p-2.5 font-bold">بودجه</th>
                  <th className="p-2.5 font-bold">وضعیت</th>
                  <th className="p-2.5 font-bold text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredLeads.map((l: any) => (
                  <tr key={l.id} className="hover:bg-slate-800/40">
                    <td className="p-2.5 font-bold text-white">{l.organization}</td>
                    <td className="p-2.5 text-slate-300">{l.name}</td>
                    <td className="p-2.5 font-mono font-bold text-brand-400">{l.phone}</td>
                    <td className="p-2.5 text-slate-300">{l.service_type}</td>
                    <td className="p-2.5 font-bold text-emerald-400">{l.budget}</td>
                    <td className="p-2.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {l.status}
                      </span>
                    </td>
                    <td className="p-2.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(l, 'lead')}
                          className="p-1 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(l.id, 'lead')}
                          className="p-1 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {nodes.map((n: any) => (
              <div key={n.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{n.name}</span>
                  <button
                    onClick={() => handleOpenEdit(n, 'node')}
                    className="p-1 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-emerald-400">{n.status_label}</span>
                  <span className="text-slate-400 font-mono">{n.latency}ms</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-2xl text-right">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">ویرایش ردیف دیتابیس جنگو</h3>
              <button onClick={() => setEditModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300 block">عنوان:</label>
                <input
                  type="text"
                  disabled
                  value={editItem?.organization || editItem?.name || ''}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300 block">وضعیت جدید:</label>
                <input
                  type="text"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500 font-bold"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={handleSaveEdit}
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold"
                >
                  ذخیره
                </button>
                <button onClick={() => setEditModalOpen(false)} className="px-3 py-2.5 rounded-xl bg-slate-800 text-xs font-bold text-slate-300">
                  انصراف
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
