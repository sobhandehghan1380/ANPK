'use client';

import React, { useState, useEffect } from 'react';
import { getAdminInvoices, manageAdminInvoice } from '@/lib/api';
import { FileText, PlusCircle, CheckCircle2, AlertCircle, Banknote, Trash2, XCircle, Wallet, Plus, Minus, List, Printer, Link2, Copy } from 'lucide-react';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [clientId, setClientId] = useState('');
  const [invoiceType, setInvoiceType] = useState('custom');
  const [subId, setSubId] = useState('');
  const [description, setDescription] = useState('');
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [dueDate, setDueDate] = useState('');
  
  // Dynamic Items Array
  const [items, setItems] = useState<any[]>([{ title: '', quantity: 1, unit_price: 0 }]);
  
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [expandedInvoiceId, setExpandedInvoiceId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [printingInvoice, setPrintingInvoice] = useState<any>(null);
  
  // Custom Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{action: string, id: number, type?: string, title: string, desc: string} | null>(null);

  useEffect(() => {
    const handleAfterPrint = () => {
      // Small delay in case of glitchy browsers
      setTimeout(() => setPrintingInvoice(null), 500);
    };
    window.addEventListener('afterprint', handleAfterPrint);
    return () => window.removeEventListener('afterprint', handleAfterPrint);
  }, []);

  const loadData = async () => {
    try {
      const res = await getAdminInvoices();
      console.log('Invoices API Response:', res);
      setInvoices(res?.invoices || []);
      setClients(res?.clients || []);
      setSubscriptions(res?.subscriptions || []);
    } catch (err) {
      console.error('Error loading invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
        setIsModalOpen(false);
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    setDueDate(nextWeek.toISOString().split('T')[0]);
  }, []);

  const handleAddItem = () => {
    setItems([...items, { title: '', quantity: 1, unit_price: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unit_price)), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !dueDate) return setErrorMsg('موارد الزامی را تکمیل کنید.');
    if (items.length === 0 || items.some(i => !i.title || !i.unit_price)) return setErrorMsg('لطفاً عنوان و قیمت تمامی ردیف‌ها را مشخص کنید.');
    
    setSubmitting(true); setSuccessMsg(''); setErrorMsg('');
    try {
      const res = await manageAdminInvoice({ 
        client_id: clientId, 
        subscription_id: invoiceType === 'subscription' ? subId : null,
        invoice_type: invoiceType,
        description: description,
        items: items, 
        discount_amount: discount,
        tax_amount: tax, 
        due_date: dueDate 
      });
      if (res?.error) {
         setErrorMsg(res.error);
      }
      else if (res?.message) {
        setSuccessMsg(res.message);
        setItems([{ title: '', quantity: 1, unit_price: 0 }]); 
        setDiscount(0);
        setTax(0); 
        setDescription('');
        loadData();
        setIsModalOpen(false);
      }
    } catch (err) {
      setErrorMsg('خطا در صدور فاکتور.');
    } finally { setSubmitting(false); }
  };

  const executeAction = async (action: string, id: number, paymentMethod: string = 'کارت / حواله بانکی') => {
    setConfirmModal(null);
    setSubmitting(true);
    
    const res = await manageAdminInvoice({ action, id, payment_method: paymentMethod });
    
    if (res?.error) {
      setErrorMsg(res.error);
    } else if (res?.message) {
      setSuccessMsg(res.message);
      loadData();
    }
    setSubmitting(false);
  }

  const getTypeLabel = (type: string) => {
    if (type === 'wallet_recharge') return <span className="flex items-center gap-1 text-emerald-500 font-bold"><Wallet className="w-3.5 h-3.5" /> شارژ کیف پول</span>;
    if (type === 'subscription') return <span className="text-brand-500 font-bold">بابت اشتراک</span>;
    return <span className="text-slate-500 font-bold">خدمات اختصاصی</span>;
  }

  if (loading) return <div className="text-center mt-20"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div></div>;

  if (printingInvoice) {
    return (
      <div className="bg-white text-slate-900 p-8 min-h-screen font-vazir" dir="rtl">
        <div className="max-w-4xl mx-auto border border-slate-200 p-10 rounded-sm">
          {/* A4 Invoice Template */}
          <div className="flex justify-between items-start border-b-2 border-slate-800 pb-6 mb-8">
            <div>
              <h1 className="text-3xl font-black">فاکتور رسمی</h1>
              <p className="text-slate-500 mt-2">شماره فاکتور: {printingInvoice.invoice_number}</p>
              <p className="text-slate-500">تاریخ صدور: {printingInvoice.created_at}</p>
            </div>
            <div className="text-left">
              <h2 className="text-xl font-bold">شرکت ارشیا نگین پردازش کویر</h2>
              <p className="text-sm text-slate-500 mt-1">شناسه ملی: ۱۴۰۰۹۸۷۶۵۴۳</p>
              <p className="text-sm text-slate-500">تلفن: ۰۲۱-۱۲۳۴۵۶۷۸</p>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="font-bold text-lg mb-2">مشخصات خریدار:</h3>
            <p className="font-bold text-slate-800">{printingInvoice.client_name}</p>
          </div>

          <table className="w-full text-right border-collapse mb-8 text-sm">
            <thead>
              <tr className="bg-slate-100 border border-slate-300">
                <th className="border-l border-slate-300 p-3 w-16 text-center">ردیف</th>
                <th className="border-l border-slate-300 p-3">شرح کالا / خدمات</th>
                <th className="border-l border-slate-300 p-3 w-24 text-center">تعداد</th>
                <th className="border-l border-slate-300 p-3 w-40 text-left">مبلغ واحد (تومان)</th>
                <th className="p-3 w-40 text-left">مبلغ کل (تومان)</th>
              </tr>
            </thead>
            <tbody>
              {printingInvoice.items?.map((item: any, idx: number) => (
                <tr key={idx} className="border-b border-slate-300">
                  <td className="border-l border-slate-300 p-3 text-center">{idx + 1}</td>
                  <td className="border-l border-slate-300 p-3">{item.title}</td>
                  <td className="border-l border-slate-300 p-3 text-center font-mono">{item.quantity}</td>
                  <td className="border-l border-slate-300 p-3 text-left font-mono">{(item.unit_price).toLocaleString()}</td>
                  <td className="p-3 text-left font-bold font-mono">{(item.total_price).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="w-full sm:w-1/2 mr-auto border border-slate-300 rounded-lg p-4 text-sm">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">جمع مبلغ پایه:</span>
              <span className="font-bold font-mono">{(printingInvoice.amount).toLocaleString()} تومان</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">تخفیف:</span>
              <span className="font-bold text-red-600 font-mono">{(printingInvoice.discount_amount || 0).toLocaleString()} تومان</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">مالیات بر ارزش افزوده:</span>
              <span className="font-bold font-mono">{(printingInvoice.tax_amount).toLocaleString()} تومان</span>
            </div>
            <div className="flex justify-between py-2 bg-slate-50 mt-2 px-2 rounded items-center">
              <span className="font-bold text-base">مبلغ نهایی قابل پرداخت:</span>
              <span className="font-black text-lg font-mono text-emerald-600">{(printingInvoice.total_amount).toLocaleString()} تومان</span>
            </div>
          </div>
          
          <div className="mt-16 pt-8 border-t border-slate-200 flex justify-between text-slate-500 text-sm">
            <p>مهر و امضای فروشنده</p>
            <p>مهر و امضای خریدار</p>
          </div>
        </div>
        
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex gap-4 print:hidden">
          <button onClick={() => window.print()} className="px-6 py-3 bg-emerald-600 text-white rounded-xl shadow-lg font-bold flex items-center gap-2 hover:bg-emerald-700">
            <Printer className="w-5 h-5" /> چاپ فاکتور
          </button>
          <button onClick={() => setPrintingInvoice(null)} className="px-6 py-3 bg-slate-800 text-white rounded-xl shadow-lg font-bold flex items-center gap-2 hover:bg-slate-900">
            <XCircle className="w-5 h-5" /> بازگشت
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in text-right">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black dark:text-white text-slate-900 flex items-center gap-3">
            <FileText className="w-7 h-7 text-brand-500" />
            فاکتورهای چندردیفه (Multi-Item)
          </h1>
          <p className="text-xs sm:text-sm dark:text-slate-400 text-slate-600">صدور فاکتور با بی‌نهایت ردیف کالا/خدمات و محاسبه خودکار مبلغ.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-bold transition-all shadow-lg shadow-brand-500/20 flex items-center gap-2">
          <PlusCircle className="w-5 h-5" />
          <span>صدور فاکتور چندردیفه</span>
        </button>
      </div>

      {successMsg && <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-bold flex items-center gap-2"><CheckCircle2 className="w-4 h-4" />{successMsg}</div>}
      {errorMsg && <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-bold flex items-center gap-2"><AlertCircle className="w-4 h-4" />{errorMsg}</div>}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-950 rounded-3xl shadow-2xl w-full max-w-4xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-brand-500" />
                صدور فاکتور رسمی جدید
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                <XCircle className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 sm:p-7">


        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 border-b dark:border-slate-800 border-slate-200 pb-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold dark:text-slate-300 text-slate-700">نوع فاکتور:</label>
              <select required value={invoiceType} onChange={e=>setInvoiceType(e.target.value)} className="w-full px-4 py-3 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 border-slate-300 text-xs font-bold text-brand-500">
                <option value="custom">خدمات متفرقه و اختصاصی</option>
                <option value="wallet_recharge">شارژ حساب / کیف پول</option>
                <option value="subscription">تمدید / خرید اشتراک</option>
              </select>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold dark:text-slate-300 text-slate-700">مشتری / پرداخت‌کننده:</label>
              <select required value={clientId} onChange={e=>setClientId(e.target.value)} className="w-full px-4 py-3 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 border-slate-300 text-xs font-bold">
                <option value="">انتخاب مشتری...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            {invoiceType === 'subscription' ? (
              <div className="space-y-1.5">
                <label className="text-xs font-bold dark:text-slate-300 text-slate-700">بابت کدام اشتراک:</label>
                <select required value={subId} onChange={e=>setSubId(e.target.value)} className="w-full px-4 py-3 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 border-slate-300 text-xs font-bold">
                  <option value="">انتخاب اشتراک...</option>
                  {subscriptions.filter(s => s.label.includes(clients.find(c => c.id == clientId)?.name || '')).map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-xs font-bold dark:text-slate-300 text-slate-700">توضیحات فاکتور (اختیاری):</label>
                <input type="text" value={description} onChange={e=>setDescription(e.target.value)} className="w-full px-4 py-3 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 border-slate-300 text-xs font-bold" placeholder="توضیحات کلی..." />
              </div>
            )}
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold dark:text-slate-300 text-slate-700">مهلت پرداخت:</label>
              <input type="date" required value={dueDate} onChange={e=>setDueDate(e.target.value)} className="w-full px-4 py-3 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 border-slate-300 text-xs font-bold font-mono" />
            </div>
          </div>

          <div className="space-y-3 border-b dark:border-slate-800 border-slate-200 pb-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold dark:text-white text-slate-900 flex items-center gap-2"><List className="w-4 h-4 text-brand-500" /> ردیف‌های فاکتور (آیتم‌ها)</h3>
            </div>
            
            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="flex flex-col sm:flex-row gap-3 items-end p-4 rounded-2xl dark:bg-slate-900/50 bg-slate-50 border dark:border-slate-800 border-slate-200">
                  <div className="w-full sm:flex-1 space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500">شرح کالا / خدمات</label>
                    <input type="text" required value={item.title} onChange={e => handleItemChange(index, 'title', e.target.value)} placeholder="مثلاً طراحی وبسایت" className="w-full px-3 py-2.5 rounded-lg dark:bg-slate-800 bg-white border dark:border-slate-700 border-slate-300 text-xs font-bold" />
                  </div>
                  <div className="w-full sm:w-24 space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500">تعداد</label>
                    <input type="number" min="1" required value={item.quantity} onChange={e => handleItemChange(index, 'quantity', Number(e.target.value))} className="w-full px-3 py-2.5 rounded-lg dark:bg-slate-800 bg-white border dark:border-slate-700 border-slate-300 text-xs font-bold text-center" />
                  </div>
                  <div className="w-full sm:w-40 space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500">مبلغ واحد (تومان)</label>
                    <input type="number" required value={item.unit_price} onChange={e => handleItemChange(index, 'unit_price', Number(e.target.value))} className="w-full px-3 py-2.5 rounded-lg dark:bg-slate-800 bg-white border dark:border-slate-700 border-slate-300 text-xs font-bold text-left font-mono" />
                  </div>
                  <div className="w-full sm:w-40 space-y-1.5">
                    <label className="text-[10px] font-bold text-brand-500">مبلغ کل (تومان)</label>
                    <div className="w-full px-3 py-2.5 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-500 text-xs font-bold text-center font-mono">
                      {(item.quantity * item.unit_price).toLocaleString()}
                    </div>
                  </div>
                  {items.length > 1 && (
                    <button type="button" onClick={() => handleRemoveItem(index)} className="p-2.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors">
                      <Minus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button type="button" onClick={handleAddItem} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold hover:text-brand-500 transition-colors mt-2">
              <Plus className="w-3.5 h-3.5" /> افزودن ردیف جدید
            </button>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center gap-6">
            <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900 px-6 py-4 rounded-2xl border dark:border-slate-800 border-slate-200">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500">جمع مبلغ پایه</span>
                <div className="font-mono font-bold text-sm dark:text-slate-300 text-slate-700">{calculateSubtotal().toLocaleString()} T</div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500">تخفیف</span>
                <input type="number" min="0" value={discount} onChange={e=>setDiscount(Number(e.target.value))} className="w-24 px-2 py-1 rounded bg-white dark:bg-slate-800 border dark:border-slate-700 text-xs font-mono font-bold text-rose-500" />
              </div>
              <div className="text-slate-300 dark:text-slate-700 text-xl">+</div>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500">مالیات</span>
                <input type="number" value={tax} onChange={e=>setTax(Number(e.target.value))} className="w-24 px-2 py-1 rounded bg-white dark:bg-slate-800 border dark:border-slate-700 text-xs font-mono font-bold text-amber-500" />
              </div>
              <div className="text-slate-300 dark:text-slate-700 text-xl">=</div>
              <div className="space-y-1 text-left">
                <span className="text-[10px] font-bold text-emerald-500">مبلغ نهایی فاکتور</span>
                <div className="font-mono font-black text-lg text-emerald-500">{Math.max(0, calculateSubtotal() - discount + tax).toLocaleString()} T</div>
              </div>
            </div>
            
            <button type="submit" disabled={submitting} className="px-8 py-4 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold shadow-lg shadow-brand-500/30 w-full sm:w-auto">ثبت فاکتور چند ردیفه</button>
          </div>
        </form>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto glass-card rounded-3xl border dark:border-slate-800 border-slate-200 shadow-xl">
        <table className="w-full text-right border-collapse text-xs">
          <thead>
            <tr className="border-b dark:border-slate-800 border-slate-200 text-slate-500 font-bold bg-slate-50/50 dark:bg-slate-900/50">
              <th className="p-4">شماره فاکتور</th>
              <th className="p-4">مشتری</th>
              <th className="p-4">نوع / ردیف‌ها</th>
              <th className="p-4">مبلغ کل</th>
              <th className="p-4">مهلت پرداخت</th>
              <th className="p-4">وضعیت</th>
              <th className="p-4 text-center">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-slate-800 divide-slate-200">
            {invoices.map(i => (
              <React.Fragment key={i.id}>
                <tr className={`hover:bg-slate-50 dark:hover:bg-slate-900/50 ${expandedInvoiceId === i.id ? 'bg-slate-50 dark:bg-slate-900/50' : ''}`}>
                  <td className="p-4 font-mono font-black text-brand-500">{i.invoice_number}</td>
                  <td className="p-4 font-bold dark:text-white text-slate-900">{i.client_name}</td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1 items-start">
                      {getTypeLabel(i.invoice_type)}
                      <button onClick={() => setExpandedInvoiceId(expandedInvoiceId === i.id ? null : i.id)} className="text-[10px] text-slate-500 hover:text-brand-500 underline underline-offset-4 decoration-slate-300 hover:decoration-brand-500">
                        مشاهده {i.items?.length || 0} ردیف فاکتور
                      </button>
                    </div>
                  </td>
                  <td className="p-4 font-black dark:text-white text-slate-900">{i.total_amount.toLocaleString()} T</td>
                  <td className="p-4 font-mono text-slate-500">{i.due_date}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold border ${i.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : (i.status === 'cancelled' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20')}`}>
                      {i.status === 'paid' ? 'پرداخت شده' : (i.status === 'cancelled' ? 'لغو شده' : 'در انتظار پرداخت')}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {i.status === 'pending' && (
                        <>
                          <button onClick={() => setConfirmModal({action: 'mark_paid', id: i.id, type: i.invoice_type, title: 'تایید پرداخت', desc: 'نحوه تسویه این فاکتور را انتخاب کنید:'})} title="تایید پرداخت دستی" className="p-1.5 rounded-lg border bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-colors"><Banknote className="w-4 h-4" /></button>
                          <button onClick={() => setConfirmModal({action: 'cancel', id: i.id, type: i.invoice_type, title: 'لغو فاکتور', desc: 'آیا از لغو این فاکتور اطمینان دارید؟'})} title="لغو فاکتور" className="p-1.5 rounded-lg border bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors"><XCircle className="w-4 h-4" /></button>
                        </>
                      )}
                      <button onClick={() => setConfirmModal({action: 'delete', id: i.id, type: i.invoice_type, title: 'حذف دائم فاکتور', desc: 'این عملیات غیرقابل بازگشت است. ادامه می‌دهید؟'})} title="حذف دائم" className="p-1.5 rounded-lg border border-transparent hover:bg-rose-500 hover:text-white text-slate-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
                
                {/* Expanded Details Row */}
                {expandedInvoiceId === i.id && (
                  <tr className="bg-slate-100 dark:bg-slate-900/80 border-b-2 border-brand-500/20">
                    <td colSpan={7} className="p-4 px-8">
                      <div className="space-y-3 text-xs">
                        <div className="flex justify-between font-bold dark:text-slate-300 text-slate-700 border-b dark:border-slate-800 border-slate-300 pb-2">
                          <span className="w-1/2">شرح کالا / خدمات</span>
                          <span className="w-1/6 text-center">تعداد</span>
                          <span className="w-1/6 text-left">مبلغ واحد</span>
                          <span className="w-1/6 text-left">مبلغ کل</span>
                        </div>
                        {i.items?.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center py-1">
                            <span className="w-1/2 font-bold dark:text-white">{item.title}</span>
                            <span className="w-1/6 text-center font-mono text-slate-500">{item.quantity}</span>
                            <span className="w-1/6 text-left font-mono text-slate-500">{item.unit_price.toLocaleString()}</span>
                            <span className="w-1/6 text-left font-mono font-bold dark:text-white">{item.total_price.toLocaleString()}</span>
                          </div>
                        ))}
                        <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center pt-4 border-t dark:border-slate-800 border-slate-300">
                          <div className="flex items-center gap-3 mb-4 sm:mb-0">
                            <button onClick={() => { setPrintingInvoice(i); setTimeout(() => window.print(), 200); }} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors">
                              <Printer className="w-4 h-4" /> چاپ فاکتور
                            </button>
                            <button onClick={() => {navigator.clipboard.writeText(`${window.location.origin}/pay/${i.invoice_number}`); alert('لینک پرداخت کپی شد!');}} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 hover:bg-brand-500 hover:text-white text-xs font-bold transition-colors">
                              <Copy className="w-4 h-4" /> کپی لینک پرداخت
                            </button>
                          </div>
                          
                          <div className="flex flex-wrap justify-end gap-x-8 gap-y-2 font-mono">
                            <div className="text-slate-500">مبلغ پایه: {(i.amount).toLocaleString()}</div>
                            <div className="text-rose-500">تخفیف: {(i.discount_amount || 0).toLocaleString()}</div>
                            <div className="text-slate-500">مالیات: {(i.tax_amount).toLocaleString()}</div>
                            <div className="font-black text-emerald-600 dark:text-emerald-400 text-sm bg-emerald-500/10 px-3 py-1 rounded-lg">مبلغ کل پرداخت: {(i.total_amount).toLocaleString()} T</div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in text-right">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col p-6 animate-scale-in">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-3 rounded-full ${confirmModal.action === 'mark_paid' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-500'}`}>
                {confirmModal.action === 'mark_paid' ? <Banknote className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">{confirmModal.title}</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 font-medium leading-relaxed">
              {confirmModal.desc}
            </p>
            
            {confirmModal.action === 'mark_paid' ? (
              <div className="flex flex-col gap-3">
                {confirmModal.type !== 'wallet_recharge' && (
                  <button 
                    disabled={submitting}
                    onClick={() => executeAction(confirmModal.action, confirmModal.id, 'کیف پول')} 
                    className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold transition-all shadow-lg flex justify-center items-center gap-2"
                  >
                    <Wallet className="w-4 h-4" /> پرداخت از کیف پول
                  </button>
                )}
                <button 
                  disabled={submitting}
                  onClick={() => executeAction(confirmModal.action, confirmModal.id, 'کارت / حواله بانکی')} 
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-all shadow-lg flex justify-center items-center gap-2"
                >
                  <Banknote className="w-4 h-4" /> پرداخت بانکی (کارت/حواله)
                </button>
                <button 
                  onClick={() => setConfirmModal(null)} 
                  className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold transition-all mt-2"
                >
                  انصراف
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setConfirmModal(null)} 
                  className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold transition-all"
                >
                  بازگشت
                </button>
                <button 
                  disabled={submitting}
                  onClick={() => executeAction(confirmModal.action, confirmModal.id)} 
                  className="flex-1 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold transition-all shadow-lg shadow-rose-500/30"
                >
                  بله، مطمئنم
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
