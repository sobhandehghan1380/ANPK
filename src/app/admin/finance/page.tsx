'use client';

import React, { useState, useEffect } from 'react';
import { getAdminFinance, manageAdminInvoice, getAdminClients } from '@/lib/api';
import { Wallet, CreditCard, FileText, CheckCircle2, Search, TrendingUp, Activity, PlusCircle, AlertCircle, X, Receipt, Trash2 } from 'lucide-react';

export default function AdminFinancePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Clients for Dropdown
  const [clients, setClients] = useState<any[]>([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    id: '',
    action: 'create',
    client_id: '',
    amount: 0,
    discount_amount: 0,
    tax_amount: 0,
    description: '',
    due_date: '',
    status: 'pending'
  });

  const loadData = async () => {
    try {
      const res = await getAdminFinance();
      setData(res);
      const cls = await getAdminClients();
      setClients(cls || []);
    } catch (err) {
      console.error('Error loading finance data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openModal = (invoice: any = null) => {
    if (invoice) {
      setFormData({
        id: invoice.id,
        action: 'update',
        client_id: invoice.client_id || '',
        amount: invoice.amount || 0,
        discount_amount: invoice.discount_amount || 0,
        tax_amount: invoice.tax_amount || 0,
        description: invoice.description || '',
        due_date: invoice.due_date ? invoice.due_date.replace(/\//g, '-') : '',
        status: invoice.status || 'pending'
      });
    } else {
      setFormData({
        id: '',
        action: 'create',
        client_id: clients.length > 0 ? clients[0].id : '',
        amount: 0,
        discount_amount: 0,
        tax_amount: 0,
        description: '',
        due_date: new Date().toISOString().split('T')[0],
        status: 'pending'
      });
    }
    setIsModalOpen(true);
    setSuccessMsg('');
    setErrorMsg('');
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Auto calculate total
  const totalAmount = Math.max(0, Number(formData.amount) - Number(formData.discount_amount) + Number(formData.tax_amount));

  const handleSaveInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.client_id || !formData.amount) {
      setErrorMsg('مشتری و مبلغ خام فاکتور الزامی است.');
      return;
    }
    
    setSubmitting(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const res = await manageAdminInvoice(formData);
      if (res?.message) {
        setSuccessMsg(res.message);
        closeModal();
        loadData();
      } else if (res?.error) {
        setErrorMsg(res.error);
      }
    } catch (err) {
      console.error('Error saving invoice:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleInvoicePayment = async (invId: number) => {
    try {
      const res = await manageAdminInvoice({ action: 'toggle_payment', id: invId });
      if (res?.message) {
        loadData();
      }
    } catch (err) {
      console.error('Error toggling payment:', err);
    }
  };
  
  const handleDeleteInvoice = async (invId: number) => {
    if(!confirm("آیا از حذف این فاکتور اطمینان دارید؟")) return;
    try {
      const res = await manageAdminInvoice({ action: 'delete', id: invId });
      if (res?.message) {
        loadData();
      }
    } catch (err) {
      console.error('Error deleting invoice:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-center">
        <div className="space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-slate-400">در حال دریافت داده‌های مالی و حسابداری...</p>
        </div>
      </div>
    );
  }

  const invoices = data?.invoices || [];
  const filteredInvoices = invoices.filter((inv: any) =>
    inv.invoice_number.includes(searchQuery) || inv.client_name?.includes(searchQuery) || inv.description?.includes(searchQuery)
  );

  return (
    <div className="space-y-8 animate-fade-in text-right">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black dark:text-white text-slate-900 flex items-center gap-3">
            <Wallet className="w-7 h-7 text-emerald-500" />
            حسابداری و مدیریت مالی
          </h1>
          <p className="text-xs sm:text-sm dark:text-slate-400 text-slate-600">
            صدور فاکتور رسمی، اعمال تخفیفات و مشاهده تراکنش‌های مشتریان.
          </p>
        </div>
        <button onClick={() => openModal()} className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2">
          <PlusCircle className="w-5 h-5" />
          <span>صدور فاکتور جدید</span>
        </button>
      </div>
      
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-6 rounded-3xl bg-gradient-to-br from-white to-emerald-50/30 dark:from-slate-900 dark:to-emerald-900/10 border border-emerald-100 dark:border-emerald-500/20 relative overflow-hidden group hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 hover:-translate-y-1">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all duration-500"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="p-3.5 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-2xl shadow-sm text-emerald-600 dark:text-emerald-400 backdrop-blur-md">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold px-3 py-1.5 bg-emerald-500 text-white rounded-full shadow-md shadow-emerald-500/30">+۱۲٪ رشد</span>
          </div>
          <p className="text-xs font-bold dark:text-slate-400 text-slate-500 mb-1">درآمد کل فاکتورها (تومان)</p>
          <h3 className="text-3xl font-black dark:text-white text-slate-900 font-mono tracking-tight">
            {data?.stats?.total_revenue?.toLocaleString() || '0'}
          </h3>
        </div>

        <div className="p-6 rounded-3xl bg-gradient-to-br from-white to-blue-50/30 dark:from-slate-900 dark:to-blue-900/10 border border-blue-100 dark:border-blue-500/20 relative overflow-hidden group hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all duration-500"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="p-3.5 bg-blue-500/10 dark:bg-blue-500/20 rounded-2xl shadow-sm text-blue-600 dark:text-blue-400 backdrop-blur-md">
              <Activity className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold px-3 py-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-full">معوقات پرداخت</span>
          </div>
          <p className="text-xs font-bold dark:text-slate-400 text-slate-500 mb-1">مطالبات پرداخت‌نشده (تومان)</p>
          <h3 className="text-3xl font-black dark:text-white text-slate-900 font-mono tracking-tight text-amber-600 dark:text-amber-400">
            {data?.stats?.pending_revenue?.toLocaleString() || '0'}
          </h3>
        </div>

        <div className="p-6 rounded-3xl bg-gradient-to-br from-white to-purple-50/30 dark:from-slate-900 dark:to-purple-900/10 border border-purple-100 dark:border-purple-500/20 relative overflow-hidden group hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-1">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all duration-500"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="p-3.5 bg-purple-500/10 dark:bg-purple-500/20 rounded-2xl shadow-sm text-purple-600 dark:text-purple-400 backdrop-blur-md">
              <CreditCard className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs font-bold dark:text-slate-400 text-slate-500 mb-1">تعداد تراکنش‌های درگاه</p>
          <h3 className="text-3xl font-black dark:text-white text-slate-900 font-mono tracking-tight">
            {data?.stats?.total_transactions_count || '0'} <span className="text-sm font-medium text-slate-400">فاکتور</span>
          </h3>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="p-6 sm:p-8 rounded-3xl glass-card border dark:border-slate-800 border-slate-200 space-y-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b dark:border-slate-800 border-slate-200 pb-4">
          <h2 className="text-base font-black dark:text-white text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-500" />
            لیست فاکتورهای صادر شده
          </h2>

          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجوی فاکتور، مشتری..."
              className="w-full pl-3 pr-9 py-2.5 rounded-xl dark:bg-slate-950 bg-slate-100 border dark:border-slate-800 border-slate-300 text-xs dark:text-white text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-xs">
            <thead>
              <tr className="border-b dark:border-slate-800 border-slate-200 text-slate-500 dark:text-slate-400">
                <th className="p-3 font-bold">شماره فاکتور</th>
                <th className="p-3 font-bold">مشتری</th>
                <th className="p-3 font-bold">شرح / بابت</th>
                <th className="p-3 font-bold">تخفیف (تومان)</th>
                <th className="p-3 font-bold">مبلغ نهایی (تومان)</th>
                <th className="p-3 font-bold">وضعیت</th>
                <th className="p-3 font-bold text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-800/60 divide-slate-100">
              {filteredInvoices.map((inv: any) => (
                <tr key={inv.id} className="hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-all duration-200">
                  <td className="p-3.5 font-mono font-bold dark:text-slate-300 text-slate-700">{inv.invoice_number}</td>
                  <td className="p-3.5 font-black dark:text-white text-slate-900">{inv.client_name}</td>
                  <td className="p-3.5 font-medium dark:text-slate-400 text-slate-600 truncate max-w-[150px]">{inv.description || inv.invoice_type_label}</td>
                  <td className="p-3.5 font-mono font-bold text-rose-500">{inv.discount_amount > 0 ? Number(inv.discount_amount).toLocaleString() : '-'}</td>
                  <td className="p-3.5 font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                    {Number(inv.total_amount).toLocaleString()}
                  </td>
                  <td className="p-3.5">
                    <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold border ${
                      inv.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-sm shadow-emerald-500/10' : 
                      inv.status === 'cancelled' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 
                      'bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-sm shadow-amber-500/10 animate-pulse'
                    }`}>
                      {inv.status_label}
                    </span>
                  </td>
                  <td className="p-3.5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => toggleInvoicePayment(inv.id)}
                        className={`p-1.5 rounded-xl border transition-all ${
                          inv.status === 'paid'
                            ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500 hover:text-white shadow-sm'
                            : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500 hover:text-white shadow-sm hover:shadow-emerald-500/30 hover:-translate-y-0.5'
                        }`}
                        title={inv.status === 'paid' ? 'تغییر به پرداخت نشده' : 'تایید پرداخت دستی'}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteInvoice(inv.id)}
                        className="p-1.5 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20 hover:shadow-rose-500/30 hover:-translate-y-0.5"
                        title="حذف فاکتور"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Modal - صدور فاکتور */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/50">
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-500" />
                صدور فاکتور رسمی
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

            <form onSubmit={handleSaveInvoice} className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold dark:text-slate-300 text-slate-700 block">انتخاب مشتری / سازمان طرف حساب:</label>
                <select 
                  value={formData.client_id} 
                  onChange={(e) => setFormData({...formData, client_id: e.target.value})} 
                  className="w-full px-4 py-3 rounded-xl dark:bg-slate-800 bg-slate-100 border dark:border-slate-700 border-slate-300 text-sm font-bold focus:border-emerald-500 outline-none"
                  required
                >
                  <option value="" disabled>انتخاب مشتری...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold dark:text-slate-300 text-slate-700 block">شرح فاکتور (بابت):</label>
                <input 
                  type="text" 
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})} 
                  placeholder="مثال: حق اشتراک سالانه - سامانه نیکی‌لینک" 
                  className="w-full px-4 py-3 rounded-xl dark:bg-slate-800 bg-slate-100 border dark:border-slate-700 border-slate-300 text-sm font-medium focus:border-emerald-500 outline-none" 
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold dark:text-slate-300 text-slate-700 block">مبلغ خام (تومان):</label>
                  <input type="number" min="0" value={formData.amount} onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})} className="w-full px-4 py-3 rounded-xl dark:bg-slate-800 bg-slate-100 border dark:border-slate-700 border-slate-300 text-sm font-bold font-mono focus:border-emerald-500 outline-none" required />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold dark:text-slate-300 text-slate-700 block">تخفیف ویژه (تومان):</label>
                  <input type="number" min="0" value={formData.discount_amount} onChange={(e) => setFormData({...formData, discount_amount: Number(e.target.value)})} className="w-full px-4 py-3 rounded-xl dark:bg-slate-800 bg-slate-100 border dark:border-slate-700 border-slate-300 text-sm font-bold font-mono text-rose-500 focus:border-emerald-500 outline-none" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold dark:text-slate-300 text-slate-700 block">مالیات بر ارزش افزوده (تومان):</label>
                  <input type="number" min="0" value={formData.tax_amount} onChange={(e) => setFormData({...formData, tax_amount: Number(e.target.value)})} className="w-full px-4 py-3 rounded-xl dark:bg-slate-800 bg-slate-100 border dark:border-slate-700 border-slate-300 text-sm font-bold font-mono text-amber-500 focus:border-emerald-500 outline-none" />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold dark:text-slate-300 text-slate-700 block">تاریخ سررسید (مهلت پرداخت):</label>
                  <input type="date" value={formData.due_date} onChange={(e) => setFormData({...formData, due_date: e.target.value})} className="w-full px-4 py-3 rounded-xl dark:bg-slate-800 bg-slate-100 border dark:border-slate-700 border-slate-300 text-sm font-bold font-mono focus:border-emerald-500 outline-none text-left dir-ltr" required />
                </div>
              </div>

              <div className="mt-8 p-6 rounded-3xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent flex flex-col sm:flex-row items-center justify-between gap-4 shadow-inner">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-emerald-600/80 dark:text-emerald-400/80 mb-1">محاسبه‌گر خودکار مبلغ</span>
                  <span className="text-sm font-black dark:text-white text-slate-800">مبلغ نهایی قابل پرداخت:</span>
                </div>
                <div className="flex items-center gap-2.5 px-6 py-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border dark:border-slate-800 border-slate-200">
                  <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono tracking-wider">{totalAmount.toLocaleString()}</span>
                  <span className="text-sm font-bold text-slate-500">تومان</span>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 mt-4">
                <button type="button" onClick={closeModal} className="px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-bold transition-all">
                  انصراف
                </button>
                <button type="submit" disabled={submitting} className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-sm font-bold transition-all shadow-xl shadow-emerald-500/30 flex items-center gap-2 hover:-translate-y-0.5">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{submitting ? 'در حال ثبت سیستم...' : 'صدور و ثبت نهایی فاکتور'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
