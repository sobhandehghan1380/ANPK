'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { adminFetch } from '@/lib/api';
import { 
  Users, PlusCircle, CheckCircle2, ShieldCheck, Wallet, FolderGit2, 
  Trash2, UserCheck, Search, Edit, AlertCircle, Building2, 
  Phone, Mail, CreditCard, Ticket, MessageSquare, ExternalLink,
  Globe, FileText, Image, Hash
} from 'lucide-react';
import FileUpload from '@/components/admin/FileUpload';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export default function AdminClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [nationalCode, setNationalCode] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [tags, setTags] = useState('');
  const [portalAccess, setPortalAccess] = useState(true);
  const [initialBalance, setInitialBalance] = useState<number>(0);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [cList, uList] = await Promise.all([
        adminFetch(`${API_BASE}/api/portal/admin/clients/`),
        adminFetch(`${API_BASE}/api/portal/admin/users/`),
      ]);
      setClients(cList || []);
      setUsers(uList || []);
    } catch (err) {
      console.error('Error loading clients & users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const showMsg = (type: 'success' | 'error', text: string) => {
    if (type === 'success') setSuccessMsg(text);
    else setErrorMsg(text);
    setTimeout(() => { setSuccessMsg(''); setErrorMsg(''); }, 3000);
  };

  // ─── Modal Handlers ───
  const openCreateModal = () => {
    setEditId(null);
    setName(''); setContactPerson(''); setPhone(''); setSelectedUserId(null);
    setEmail(''); setAddress(''); setNationalCode(''); setWebsite('');
    setDescription(''); setLogoUrl(''); setTags(''); setPortalAccess(true);
    setInitialBalance(0);
    setShowModal(true);
  };

  const openEditModal = (c: any) => {
    setEditId(c.id);
    setName(c.name); setContactPerson(c.contact_person || ''); setPhone(c.phone);
    setEmail(c.email || ''); setAddress(c.address || ''); setNationalCode(c.national_code || '');
    setWebsite(c.website || ''); setDescription(c.description || ''); setLogoUrl(c.logo_url || '');
    setTags(c.tags || ''); setPortalAccess(c.portal_access !== false);
    setSelectedUserId(c.owner_user_id || null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditId(null);
  };

  // ─── Submit Handler ───
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    setSubmitting(true);
    setSuccessMsg(''); setErrorMsg('');
    try {
      const method = editId ? 'PUT' : 'POST';
      const body: any = { 
        name, contact_person: contactPerson, phone, user_id: selectedUserId,
        email, address, national_code: nationalCode, website, description, logo_url: logoUrl,
        tags, portal_access: portalAccess
      };
      if (editId) {
        body.id = editId;
      } else {
        body.initial_balance = initialBalance;
      }

      const res = await adminFetch(`${API_BASE}/api/portal/admin/clients/`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (res?.message) {
        showMsg('success', res.message);
        closeModal();
        loadData();
      } else if (res?.error) {
        showMsg('error', res.error);
      }
    } catch (err: any) {
      showMsg('error', err?.message || 'خطا در ثبت سازمان');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Delete Handler ───
  const handleDeleteClient = async (id: number) => {
    if (!confirm('آیا از حذف این سازمان و تمام اطلاعات مرتبط اطمینان دارید؟')) return;
    try {
      await adminFetch(`${API_BASE}/api/portal/admin/clients/?id=${id}`, { method: 'DELETE' });
      showMsg('success', 'سازمان حذف شد.');
      loadData();
    } catch (err: any) {
      showMsg('error', err?.message || 'خطا در حذف');
    }
  };

  // ─── Filtered Data ───
  const filteredClients = useMemo(() => {
    let list = [...clients];
    
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(c => 
        c.name?.toLowerCase().includes(q) ||
        c.phone?.includes(q) ||
        c.contact_person?.toLowerCase().includes(q) ||
        c.owner_username?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.national_code?.includes(q) ||
        c.website?.toLowerCase().includes(q)
      );
    }

    if (statusFilter === 'active') {
      list = list.filter(c => c.projects_count > 0);
    } else if (statusFilter === 'inactive') {
      list = list.filter(c => c.projects_count === 0);
    }

    return list;
  }, [clients, searchQuery, statusFilter]);

  // ─── Stats ───
  const stats = useMemo(() => ({
    total: clients.length,
    withProjects: clients.filter(c => c.projects_count > 0).length,
    withWallet: clients.filter(c => c.wallet_balance > 0).length,
    totalWalletBalance: clients.reduce((sum, c) => sum + (c.wallet_balance || 0), 0)
  }), [clients]);

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs font-bold text-slate-400">در حال دریافت لیست سازمان‌ها...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in text-right">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black dark:text-white text-slate-900 flex items-center gap-2">
            <Building2 className="w-7 h-7 text-brand-500" />
            مدیریت سازمان‌ها
          </h1>
          <p className="text-xs text-slate-400 mt-1">مدیریت مشتریان، کیف پول و پروژه‌های متصل</p>
        </div>
        <button onClick={openCreateModal}
          className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-brand-500/20">
          <PlusCircle className="w-4 h-4" /> سازمان جدید
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

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-card rounded-2xl p-4 border dark:border-slate-800 border-slate-200 flex items-center gap-3 hover:border-brand-500/30 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-brand-500" />
          </div>
          <div>
            <div className="text-xl font-black dark:text-white">{stats.total}</div>
            <div className="text-[10px] text-slate-400">کل سازمان‌ها</div>
          </div>
        </div>
        <div className="glass-card rounded-2xl p-4 border dark:border-slate-800 border-slate-200 flex items-center gap-3 hover:border-emerald-500/30 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <FolderGit2 className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <div className="text-xl font-black dark:text-white">{stats.withProjects}</div>
            <div className="text-[10px] text-slate-400">با پروژه فعال</div>
          </div>
        </div>
        <div className="glass-card rounded-2xl p-4 border dark:border-slate-800 border-slate-200 flex items-center gap-3 hover:border-amber-500/30 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <div className="text-xl font-black dark:text-white">{stats.withWallet}</div>
            <div className="text-[10px] text-slate-400">با کیف پول</div>
          </div>
        </div>
        <div className="glass-card rounded-2xl p-4 border dark:border-slate-800 border-slate-200 flex items-center gap-3 hover:border-sky-500/30 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-sky-500" />
          </div>
          <div>
            <div className="text-lg font-black dark:text-white">{(stats.totalWalletBalance / 1000000).toFixed(1)}M</div>
            <div className="text-[10px] text-slate-400">کل موجودی (میلیون تومان)</div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="glass-card rounded-2xl p-4 border dark:border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="جستجو در نام، شماره تماس، رابط یا نام کاربری..."
              className="w-full pr-9 pl-4 py-2.5 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 border-slate-200 text-xs focus:outline-none focus:border-brand-500"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'active', 'inactive'] as const).map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === status
                    ? 'bg-brand-500 text-white'
                    : 'dark:bg-slate-900 bg-slate-50 dark:text-slate-400 text-slate-600 border dark:border-slate-700 border-slate-200'
                }`}
              >
                {status === 'all' ? 'همه' : status === 'active' ? 'فعال' : 'بدون پروژه'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredClients.map((c: any) => (
          <div key={c.id} className="group rounded-2xl glass-card border dark:border-slate-800 border-slate-200 overflow-hidden shadow-lg hover:shadow-xl hover:border-brand-500/40 transition-all duration-300">
            {/* Card Header with Gradient */}
            <div className="h-20 bg-gradient-to-r from-brand-500/20 via-accent-500/20 to-sky-500/20 relative">
              <div className="absolute -bottom-6 right-4">
                {c.logo_url ? (
                  <img src={c.logo_url} alt={c.name} className="w-14 h-14 rounded-xl object-cover border-4 border-white dark:border-slate-900 shadow-lg" />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center border-4 border-white dark:border-slate-900 shadow-lg">
                    <Building2 className="w-7 h-7 text-white" />
                  </div>
                )}
              </div>
              <div className="absolute top-3 left-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEditModal(c)} className="p-2 rounded-lg bg-white/90 dark:bg-slate-800/90 text-indigo-500 hover:bg-indigo-500 hover:text-white transition-all shadow-sm" title="ویرایش">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => handleDeleteClient(c.id)} className="p-2 rounded-lg bg-white/90 dark:bg-slate-800/90 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm" title="حذف">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Card Body */}
            <div className="pt-8 pb-5 px-5 space-y-4">
              {/* Name & Contact */}
              <div>
                <h3 className="text-base font-black dark:text-white text-slate-900 truncate">{c.name}</h3>
                {c.contact_person && (
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-brand-500/10 flex items-center justify-center">
                      <UserCheck className="w-3 h-3 text-brand-500" />
                    </div>
                    {c.contact_person}
                  </p>
                )}
              </div>

              {/* Contact Details */}
              <div className="space-y-2 p-3 rounded-xl dark:bg-slate-900/50 bg-slate-50/50">
                <div className="flex items-center gap-2 text-xs">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-mono text-slate-600 dark:text-slate-300">{c.phone}</span>
                </div>
                {c.email && (
                  <div className="flex items-center gap-2 text-xs">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono text-slate-600 dark:text-slate-300 truncate">{c.email}</span>
                  </div>
                )}
                {c.website && (
                  <div className="flex items-center gap-2 text-xs">
                    <Globe className="w-3.5 h-3.5 text-sky-500" />
                    <span className="font-mono text-sky-500 truncate">{c.website}</span>
                  </div>
                )}
                {c.national_code && (
                  <div className="flex items-center gap-2 text-xs">
                    <Hash className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono text-slate-600 dark:text-slate-300">{c.national_code}</span>
                  </div>
                )}
              </div>

              {/* Tags */}
              {c.tags_list?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {c.tags_list.slice(0, 3).map((tag: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-500 text-[9px] font-bold border border-brand-500/20">
                      {tag}
                    </span>
                  ))}
                  {c.tags_list.length > 3 && <span className="text-[9px] text-slate-400">+{c.tags_list.length - 3}</span>}
                </div>
              )}

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-center">
                  <Wallet className="w-4 h-4 mx-auto text-emerald-500 mb-1" />
                  <div className="text-[10px] font-black text-emerald-600 dark:text-emerald-400">{(c.wallet_balance || 0) >= 1000000 ? `${(c.wallet_balance / 1000000).toFixed(1)}M` : `${(c.wallet_balance / 1000).toFixed(0)}K`}</div>
                  <div className="text-[8px] text-slate-400">کیف پول</div>
                </div>
                <div className="p-2 rounded-xl bg-brand-500/5 border border-brand-500/10 text-center">
                  <FolderGit2 className="w-4 h-4 mx-auto text-brand-500 mb-1" />
                  <div className="text-[10px] font-black text-brand-600 dark:text-brand-400">{c.projects_count || 0}</div>
                  <div className="text-[8px] text-slate-400">پروژه</div>
                </div>
                <div className="p-2 rounded-xl bg-indigo-500/5 border border-indigo-500/10 text-center">
                  <ShieldCheck className="w-4 h-4 mx-auto text-indigo-500 mb-1" />
                  <div className="text-[10px] font-black text-indigo-600 dark:text-indigo-400">{c.portal_access ? 'فعال' : 'غیرفعال'}</div>
                  <div className="text-[8px] text-slate-400">پورتال</div>
                </div>
              </div>

              {/* Projects Preview */}
              {c.projects_list?.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                    <FolderGit2 className="w-3 h-3" /> آخرین پروژه‌ها:
                  </span>
                  {c.projects_list.slice(0, 2).map((p: any) => (
                    <div key={p.id} className="flex justify-between items-center text-xs p-2 rounded-lg dark:bg-slate-950 bg-white border dark:border-slate-800 border-slate-200">
                      <span className="font-bold dark:text-white text-slate-900 truncate flex-1">{p.title}</span>
                      <div className="flex items-center gap-2 mr-2">
                        <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-brand-500 rounded-full" style={{ width: `${p.sprint_progress}%` }}></div>
                        </div>
                        <span className="font-mono text-brand-500 text-[10px]">{p.sprint_progress}%</span>
                      </div>
                    </div>
                  ))}
                  {c.projects_list.length > 2 && (
                    <span className="text-[10px] text-slate-400 block text-center">+{c.projects_list.length - 2} پروژه دیگر</span>
                  )}
                </div>
              )}

              {/* Owner Info */}
              {c.owner_username && c.owner_username !== 'اکانت کاربر متصل‌نشده' && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-indigo-500/5 border border-indigo-500/10">
                  <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center">
                    <UserCheck className="w-3 h-3 text-indigo-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">{c.owner_username}</div>
                    {c.owner_email && <div className="text-[9px] text-slate-400 truncate">{c.owner_email}</div>}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <div className="text-center py-20 text-slate-400 glass-card rounded-2xl border dark:border-slate-800 border-slate-200">
          <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
            <Users className="w-10 h-10 text-slate-300" />
          </div>
          <p className="text-lg font-black mb-2">
            {searchQuery ? 'نتیجه‌ای یافت نشد' : 'هنوز سازمانی ثبت نشده'}
          </p>
          <p className="text-xs text-slate-400 mb-4 max-w-md mx-auto">
            {searchQuery ? 'عبارت جستجو را تغییر دهید یا فیلترها را بررسی کنید' : 'برای شروع، اولین سازمان خود را ثبت کنید'}
          </p>
          {!searchQuery && (
            <button onClick={openCreateModal} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-accent-500 text-white text-xs font-bold shadow-lg shadow-brand-500/20 hover:shadow-brand-500/40 transition-all">
              <PlusCircle className="w-4 h-4 inline ml-1" /> افزودن اولین سازمان
            </button>
          )}
        </div>
      )}

      {/* ===== CLIENT MODAL ===== */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-right max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 bg-slate-900 border-b border-slate-800 p-5 flex items-center justify-between rounded-t-3xl">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                {editId ? <Edit className="w-5 h-5 text-indigo-400" /> : <PlusCircle className="w-5 h-5 text-brand-400" />}
                {editId ? 'ویرایش سازمان' : 'سازمان جدید'}
              </h3>
              <button onClick={closeModal} className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                <span className="text-xl">&times;</span>
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">نام سازمان / شرکت / بیمارستان:</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثلاً: علوم پزشکی / نگارستان"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500 font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">نام نماینده / رابط مسئول:</label>
                <input
                  type="text"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="مهندس شاطریان"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500 font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">شماره همراه پورتال:</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="09130000000"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500 font-mono font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">ایمیل:</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="info@organization.com"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">کد اقتصادی / شناسه ملی:</label>
                <input
                  type="text"
                  value={nationalCode}
                  onChange={(e) => setNationalCode(e.target.value)}
                  placeholder="123456789012"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">وب‌سایت:</label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://www.organization.com"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">آدرس:</label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="آدرس کامل سازمان..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500 resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">توضیحات / یادداشت:</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="یادداشت‌های داخلی درباره سازمان..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500 resize-none"
                />
              </div>

              {/* Logo Upload */}
              <FileUpload
                value={logoUrl}
                onChange={setLogoUrl}
                label="لوگوی سازمان"
                type="image"
                placeholder="لوگوی سازمان را آپلود کنید..."
              />

              {/* Tags */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">برچسب‌ها:</label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="VIP، صنعتی، بیمارستان (با کاما جدا کنید)"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500"
                />
                <p className="text-[10px] text-slate-400">برچسب‌ها را با کاما جدا کنید</p>
              </div>

              {/* Portal Access */}
              <label className="flex items-center gap-3 cursor-pointer">
                <div onClick={() => setPortalAccess(!portalAccess)}
                  className={`w-10 h-5 rounded-full transition-colors relative ${portalAccess ? 'bg-brand-500' : 'bg-slate-600'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${portalAccess ? 'left-5' : 'left-0.5'}`} />
                </div>
                <span className="text-xs font-bold">دسترسی به پورتال مشتری</span>
              </label>

              {/* Initial Balance - Only show when creating */}
              {!editId && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">شارژ اولیه کیف پول (تومان):</label>
                  <input
                    type="number"
                    min="0"
                    step="100000"
                    value={initialBalance}
                    onChange={(e) => setInitialBalance(Number(e.target.value))}
                    placeholder="0"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500 font-mono font-bold"
                  />
                  <p className="text-[10px] text-slate-400">مبلغی که به عنوان اعتبار اولیه به کیف پول سازمان اضافه می‌شود</p>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">انتساب به اکانت کاربر (User):</label>
                <select
                  value={selectedUserId || ''}
                  onChange={(e) => setSelectedUserId(Number(e.target.value) || null)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500 font-bold"
                >
                  <option value="">انتخاب کاربر مالک (اختیاری)...</option>
                  {users.map((u: any) => (
                    <option key={u.id} value={u.id}>{u.username} ({u.role_label || 'کاربر'})</option>
                  ))}
                </select>
              </div>

              <div className="p-4 rounded-xl bg-brand-500/10 border border-brand-500/20 text-xs text-brand-300">
                <strong>نکته:</strong> پس از ایجاد سازمان، یک کیف پول ۱۰ میلیون تومانی به صورت خودکار برای آن ساخته می‌شود.
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 pt-4 border-t border-slate-800">
                <button type="submit" disabled={submitting}
                  className="flex-1 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50">
                  {submitting ? 'در حال ثبت...' : (editId ? 'ذخیره تغییرات' : 'ایجاد سازمان')}
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
