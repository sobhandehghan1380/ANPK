'use client';
import React, { useState, useEffect } from 'react';
import { getPortalInvoices, payInvoiceWithWallet, requestPayment } from '@/lib/api';
import { FileText, Download, ChevronDown, WalletCards, Loader2 } from 'lucide-react';

export default function ClientInvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedInvoiceId, setExpandedInvoiceId] = useState<number | null>(null);
  const [paying, setPaying] = useState<{ invoiceId: number; method: 'online' | 'wallet' } | null>(null);

  const loadData = async () => {
    try {
      const res = await getPortalInvoices();
      setInvoices(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  
  const handlePayOnline = async (invoiceId: number) => {
    setPaying({ invoiceId, method: 'online' });
    try {
      const res = await requestPayment(invoiceId);
      if (res && res.payment_url) {
        window.location.href = res.payment_url;
      } else {
        alert(res?.error || 'خطا در ارتباط با درگاه پرداخت');
      }
    } catch (e) {
      alert('خطای شبکه. دوباره تلاش کنید.');
    } finally {
      setPaying(null);
    }
  };

  const handlePayWithWallet = async (invoiceId: number) => {
    setPaying({ invoiceId, method: 'wallet' });
    try {
      const res = await payInvoiceWithWallet(invoiceId);
      await loadData();
      alert(res?.message || 'فاکتور با موفقیت از کیف پول پرداخت شد.');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'پرداخت از کیف پول انجام نشد.');
    } finally {
      setPaying(null);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <span className="px-2 py-1 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded text-[10px] font-bold">در انتظار پرداخت</span>;
      case 'paid': return <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded text-[10px] font-bold">پرداخت شده</span>;
      case 'cancelled': return <span className="px-2 py-1 bg-slate-500/10 text-slate-500 border border-slate-500/20 rounded text-[10px] font-bold">لغو شده</span>;
      default: return <span className="px-2 py-1 bg-slate-500/10 text-slate-500 border border-slate-500/20 rounded text-[10px] font-bold">{status}</span>;
    }
  };

  if (loading) return <div className="text-center mt-20"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div></div>;

  return (
    <div className="space-y-6 animate-fade-in text-right">
      <div className="space-y-2">
        <h2 className="text-2xl font-black dark:text-white text-slate-900 flex items-center gap-2">
          <FileText className="w-6 h-6 text-brand-500" />
          فاکتورهای مالی من
        </h2>
        <p className="text-xs text-slate-500">مشاهده و پرداخت صورتحساب‌های خدمات و محصولات.</p>
      </div>

      <div className="space-y-4">
        {invoices.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">فاکتوری یافت نشد.</div>
        ) : (
          invoices.map(inv => (
            <div key={inv.id} className="bg-white dark:bg-slate-900 border dark:border-slate-800 border-slate-200 rounded-2xl overflow-hidden shadow-sm transition-all">
              <div 
                className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50"
                onClick={() => setExpandedInvoiceId(expandedInvoiceId === inv.id ? null : inv.id)}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold dark:text-white text-slate-900 text-sm">{inv.title}</h3>
                    {getStatusBadge(inv.status)}
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <span className="font-mono">{inv.invoice_number}</span>
                    <span className="text-slate-300 dark:text-slate-700">|</span>
                    <span className="font-mono">{inv.created_at}</span>
                  </div>
                  {inv.project_name && <div className="text-[10px] font-bold text-brand-500">پروژه: {inv.project_name}</div>}
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-left hidden sm:block">
                    <div className="text-xs text-slate-500">مبلغ نهایی فاکتور</div>
                    <div className="font-bold font-mono text-brand-500">{parseInt(inv.total_amount).toLocaleString()} تومان</div>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${expandedInvoiceId === inv.id ? 'rotate-180' : ''}`} />
                </div>
              </div>
              
              {/* Expanded Multi-Item Details */}
              {expandedInvoiceId === inv.id && (
                <div className="border-t dark:border-slate-800 border-slate-200 bg-slate-50/50 dark:bg-slate-900/50 p-6">
                  <h4 className="font-bold text-sm mb-4 dark:text-white">ریز اقلام فاکتور</h4>
                  <div className="border dark:border-slate-800 border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-xs text-right">
                      <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        <tr>
                          <th className="p-3">شرح خدمت / کالا</th>
                          <th className="p-3 text-center">تعداد</th>
                          <th className="p-3 text-center">مبلغ واحد (تومان)</th>
                          <th className="p-3 text-left">مبلغ کل (تومان)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                        {inv.items?.map((item: any, idx: number) => (
                          <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="p-3 font-medium dark:text-slate-300">{item.description}</td>
                            <td className="p-3 text-center dark:text-slate-400">{item.quantity}</td>
                            <td className="p-3 text-center font-mono dark:text-slate-400">{parseInt(item.unit_price).toLocaleString()}</td>
                            <td className="p-3 text-left font-mono font-bold text-brand-600 dark:text-brand-400">{parseInt(item.total_price).toLocaleString()}</td>
                          </tr>
                        ))}
                        {(!inv.items || inv.items.length === 0) && (
                          <tr><td colSpan={4} className="p-4 text-center text-slate-400">ردیفی ثبت نشده است</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="mt-4 flex flex-col sm:flex-row justify-between items-end gap-4">
                    <div className="space-y-1">
                      <div className="text-xs text-slate-500">مالیات بر ارزش افزوده (VAT)</div>
                      <div className="font-mono font-bold dark:text-slate-300">{parseInt(inv.tax_amount).toLocaleString()} تومان</div>
                    </div>
                    
                    {inv.status === 'pending' ? (
                      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                        {inv.can_pay_with_wallet && (
                          <button
                            type="button"
                            disabled={paying?.invoiceId === inv.id}
                            onClick={(event) => {
                              event.stopPropagation();
                              handlePayWithWallet(inv.id);
                            }}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-brand-500/30 bg-brand-500/10 px-5 py-2.5 text-sm font-bold text-brand-600 transition-colors hover:bg-brand-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-60 dark:text-brand-400 sm:w-auto"
                          >
                            {paying?.invoiceId === inv.id && paying?.method === 'wallet' ? <Loader2 className="h-4 w-4 animate-spin" /> : <WalletCards className="h-4 w-4" />}
                            پرداخت از کیف پول
                          </button>
                        )}
                        <button
                          type="button"
                          disabled={paying?.invoiceId === inv.id}
                          onClick={(event) => {
                            event.stopPropagation();
                            handlePayOnline(inv.id);
                          }}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand-500/20 transition-colors hover:bg-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                        >
                          {paying?.invoiceId === inv.id && paying?.method === 'online' && <Loader2 className="h-4 w-4 animate-spin" />}
                          پرداخت آنلاین
                        </button>
                        {inv.invoice_type === 'wallet_recharge' && (
                          <span className="self-center text-[11px] text-slate-500">شارژ کیف پول فقط با پرداخت آنلاین یا بانکی انجام می‌شود.</span>
                        )}
                      </div>
                    ) : (
                      <button className="px-6 py-2.5 border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-2 transition-colors w-full sm:w-auto">
                        <Download className="w-4 h-4" />
                        دانلود PDF فاکتور
                      </button>
                    )}
                  </div>
                  
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
