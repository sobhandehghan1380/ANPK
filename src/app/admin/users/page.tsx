'use client';

import React, { useState, useEffect } from 'react';
import { getAdminUsers, manageAdminUser, toggleAdminUserActive, deleteAdminUser } from '@/lib/api';
import { UserCheck, PlusCircle, CheckCircle2, Shield, Lock, Trash2, Power, Mail, KeyRound, Search, AlertCircle, Edit, User, MapPin, Briefcase, Phone, X, Info } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('essential');
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    id: '',
    action: 'create_or_update',
    username: '',
    password: '',
    email: '',
    first_name: '',
    last_name: '',
    role: 'client',
    phone_number: '',
    national_code: '',
    job_title: '',
    address: '',
    bio: ''
  });

  const loadUsers = async () => {
    try {
      const res = await getAdminUsers();
      setUsers(res || []);
    } catch (err) {
      console.error('Error loading admin users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const openModal = (user: any = null) => {
    if (user) {
      setFormData({
        id: user.id,
        action: 'edit_user',
        username: user.username || '',
        password: '',
        email: user.email === 'ثبت‌نشده' ? '' : (user.email || ''),
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        role: user.is_superuser ? 'superuser' : (user.is_staff ? 'admin' : 'client'),
        phone_number: user.phone_number || '',
        national_code: user.national_code || '',
        job_title: user.job_title || '',
        address: user.address || '',
        bio: user.bio || ''
      });
    } else {
      setFormData({
        id: '',
        action: 'create_or_update',
        username: '',
        password: '',
        email: '',
        first_name: '',
        last_name: '',
        role: 'client',
        phone_number: '',
        national_code: '',
        job_title: '',
        address: '',
        bio: ''
      });
    }
    setActiveTab('essential');
    setIsModalOpen(true);
    setSuccessMsg('');
    setErrorMsg('');
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username) {
      setErrorMsg('نام کاربری الزامی است.');
      return;
    }
    if (formData.action === 'create_or_update' && !formData.password) {
      setErrorMsg('برای ساخت کاربر جدید کلمه عبور الزامی است.');
      return;
    }

    setSubmitting(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const res = await manageAdminUser(formData);
      if (res?.message) {
        setSuccessMsg(res.message);
        closeModal();
        loadUsers();
      } else if (res?.error) {
        setErrorMsg(res.error);
      }
    } catch (err) {
      console.error('Error saving admin user:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (userId: number) => {
    try {
      const res = await toggleAdminUserActive(userId);
      if (res?.message) {
        setSuccessMsg(res.message);
        loadUsers();
      }
    } catch (err) {
      console.error('Toggle user active error:', err);
    }
  };

  const handleDeleteUser = async (userId: number, uname: string) => {
    if (!confirm(`آیا از حذف اکانت کاربر "${uname}" اطمینان کامل دارید؟`)) return;
    try {
      const res = await deleteAdminUser(userId);
      if (res?.message) {
        setSuccessMsg(res.message);
        loadUsers();
      }
    } catch (err) {
      console.error('Delete user error:', err);
    }
  };

  const filteredUsers = users.filter((u) =>
    u.username.includes(searchQuery) || u.email?.includes(searchQuery) || u.role_label?.includes(searchQuery) || u.first_name?.includes(searchQuery) || u.last_name?.includes(searchQuery)
  );

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-center">
        <div className="space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-slate-400">در حال همگام‌سازی لیست کاربران سیستم با دیتابیس جنگو...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in text-right">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black dark:text-white text-slate-900 flex items-center gap-3">
            <UserCheck className="w-7 h-7 text-indigo-500" />
            مدیریت جامع کاربران و پروفایل‌ها
          </h1>
          <p className="text-xs sm:text-sm dark:text-slate-400 text-slate-600">
            نمایش کامل اطلاعات، ثبت اطلاعات غیرضروری، ویرایش نقش‌ها و تغییر پسورد.
          </p>
        </div>
        <button onClick={() => openModal()} className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2">
          <PlusCircle className="w-5 h-5" />
          <span>افزودن کاربر جدید</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Users Data Grid Table */}
      <div className="p-6 sm:p-8 rounded-3xl glass-card border dark:border-slate-800 border-slate-200 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b dark:border-slate-800 border-slate-200 pb-4">
          <h2 className="text-base font-black dark:text-white text-slate-900">لیست کامل کاربران دیتابیس:</h2>

          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجوی نام، کاربری، ایمیل..."
              className="w-full pl-3 pr-9 py-2.5 rounded-xl dark:bg-slate-950 bg-slate-100 border dark:border-slate-800 border-slate-300 text-xs dark:text-white text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-xs">
            <thead>
              <tr className="border-b dark:border-slate-800 border-slate-200 text-slate-500 dark:text-slate-400">
                <th className="p-3 font-bold">نام و نام‌خانوادگی</th>
                <th className="p-3 font-bold">نام کاربری</th>
                <th className="p-3 font-bold">پست الکترونیک</th>
                <th className="p-3 font-bold">نقش سیستمی</th>
                <th className="p-3 font-bold text-center">وضعیت</th>
                <th className="p-3 font-bold text-center">عملیات مدیریت</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-800 divide-slate-200">
              {filteredUsers.map((u: any) => (
                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                  <td className="p-3 font-bold text-slate-800 dark:text-white">
                    {u.first_name || u.last_name ? `${u.first_name} ${u.last_name}` : '-'}
                  </td>
                  <td className="p-3 font-black dark:text-white text-slate-900 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span>{u.username}</span>
                  </td>
                  <td className="p-3 dark:text-slate-300 text-slate-700 font-mono">{u.email}</td>
                  <td className="p-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                      u.is_superuser
                        ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                        : (u.is_staff ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20')
                    }`}>
                      {u.role_label}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                      u.is_active ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                    }`}>
                      {u.is_active ? 'فعال' : 'غیرفعال'}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openModal(u)}
                        className="p-1.5 rounded-lg border bg-indigo-500/10 text-indigo-500 border-indigo-500/20 hover:bg-indigo-500 hover:text-white transition-all"
                        title="نمایش جزئیات و ویرایش کامل"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleToggleActive(u.id)}
                        className={`p-1.5 rounded-lg border transition-all ${
                          u.is_active
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-amber-500 hover:text-white'
                            : 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-emerald-500 hover:text-white'
                        }`}
                        title={u.is_active ? 'غیرفعال‌سازی اکانت' : 'فعال‌سازی اکانت'}
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteUser(u.id, u.username)}
                        className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20"
                        title="حذف اکانت کاربر"
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
      </div>

      {/* View & Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-3xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/50">
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                {formData.action === 'edit_user' ? <Edit className="w-5 h-5 text-indigo-500" /> : <PlusCircle className="w-5 h-5 text-indigo-500" />}
                {formData.action === 'edit_user' ? `پروفایل و ویرایش: ${formData.username}` : 'ایجاد کاربر جدید'}
              </h2>
              <button onClick={closeModal} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {errorMsg && (
              <div className="m-5 mb-0 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="flex border-b border-slate-200 dark:border-slate-800 px-5 pt-4 gap-6 bg-slate-50 dark:bg-slate-950/50 overflow-x-auto">
              <button 
                onClick={() => setActiveTab('essential')}
                className={`pb-3 text-sm font-bold border-b-2 transition-all ${activeTab === 'essential' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                اطلاعات هویتی
              </button>
              <button 
                onClick={() => setActiveTab('non-essential')}
                className={`pb-3 text-sm font-bold border-b-2 transition-all ${activeTab === 'non-essential' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                اطلاعات تکمیلی
              </button>
              <button 
                onClick={() => setActiveTab('security')}
                className={`pb-3 text-sm font-bold border-b-2 transition-all ${activeTab === 'security' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                امنیت و دسترسی
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
              
              {activeTab === 'essential' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 animate-fade-in">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold dark:text-slate-300 text-slate-700 flex items-center gap-1.5"><User className="w-3.5 h-3.5"/> نام:</label>
                    <input type="text" value={formData.first_name} onChange={(e) => setFormData({...formData, first_name: e.target.value})} className="w-full px-4 py-2.5 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 border-slate-300 text-sm font-bold focus:border-indigo-500 outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold dark:text-slate-300 text-slate-700 flex items-center gap-1.5"><User className="w-3.5 h-3.5"/> نام خانوادگی:</label>
                    <input type="text" value={formData.last_name} onChange={(e) => setFormData({...formData, last_name: e.target.value})} className="w-full px-4 py-2.5 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 border-slate-300 text-sm font-bold focus:border-indigo-500 outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold dark:text-slate-300 text-slate-700 flex items-center gap-1.5"><Info className="w-3.5 h-3.5"/> کد ملی:</label>
                    <input type="text" value={formData.national_code} onChange={(e) => setFormData({...formData, national_code: e.target.value})} className="w-full px-4 py-2.5 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 border-slate-300 text-sm font-bold font-mono focus:border-indigo-500 outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold dark:text-slate-300 text-slate-700 flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5"/> عنوان شغلی:</label>
                    <input type="text" value={formData.job_title} onChange={(e) => setFormData({...formData, job_title: e.target.value})} placeholder="مثال: مدیر فنی" className="w-full px-4 py-2.5 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 border-slate-300 text-sm font-bold focus:border-indigo-500 outline-none" />
                  </div>
                </div>
              )}

              {activeTab === 'non-essential' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 animate-fade-in">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold dark:text-slate-300 text-slate-700 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5"/> شماره موبایل:</label>
                    <input type="text" value={formData.phone_number} onChange={(e) => setFormData({...formData, phone_number: e.target.value})} className="w-full px-4 py-2.5 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 border-slate-300 text-sm font-bold font-mono focus:border-indigo-500 outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold dark:text-slate-300 text-slate-700 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5"/> پست الکترونیک:</label>
                    <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2.5 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 border-slate-300 text-sm font-bold font-mono text-left focus:border-indigo-500 outline-none" />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold dark:text-slate-300 text-slate-700 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5"/> آدرس پستی:</label>
                    <textarea value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} rows={2} className="w-full px-4 py-3 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 border-slate-300 text-sm font-medium focus:border-indigo-500 outline-none" />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold dark:text-slate-300 text-slate-700 flex items-center gap-1.5"><Info className="w-3.5 h-3.5"/> درباره شخص (Bio):</label>
                    <textarea value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} rows={3} className="w-full px-4 py-3 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 border-slate-300 text-sm font-medium focus:border-indigo-500 outline-none" />
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 animate-fade-in">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold dark:text-slate-300 text-slate-700 flex items-center gap-1.5"><Shield className="w-3.5 h-3.5"/> نام کاربری (تغییر ناپذیر در ادیت):</label>
                    <input type="text" required disabled={formData.action === 'edit_user'} value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} className="w-full px-4 py-2.5 rounded-xl dark:bg-slate-800 bg-slate-100 border dark:border-slate-700 border-slate-300 text-sm font-bold font-mono focus:border-indigo-500 outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold dark:text-slate-300 text-slate-700 flex items-center gap-1.5"><KeyRound className="w-3.5 h-3.5"/> کلمه عبور جدید:</label>
                    <input type="password" required={formData.action === 'create_or_update'} value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder={formData.action === 'edit_user' ? 'فقط در صورت نیاز به تغییر وارد کنید' : 'الزامی'} className="w-full px-4 py-2.5 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 border-slate-300 text-sm font-bold font-mono focus:border-indigo-500 outline-none" />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold dark:text-slate-300 text-slate-700 flex items-center gap-1.5"><Lock className="w-3.5 h-3.5"/> سطح دسترسی در سیستم:</label>
                    <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} className="w-full px-4 py-3 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 border-slate-300 text-sm font-bold focus:border-indigo-500 outline-none">
                      <option value="superuser">مدیر کل ارشد (Superuser)</option>
                      <option value="admin">ادمین سیستم (Staff Member)</option>
                      <option value="client">کاربر عادی پورتال</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-bold transition-all">
                  انصراف
                </button>
                <button type="submit" disabled={submitting} className="px-7 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{submitting ? 'در حال ذخیره...' : 'ذخیره اطلاعات'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
