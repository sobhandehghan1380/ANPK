'use client';

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ShieldCheck, CreditCard, XCircle, CheckCircle2 } from 'lucide-react';

function GatewayContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const authority = searchParams.get('authority');
  const amount = searchParams.get('amount') || '0';
  const invoiceId = searchParams.get('invoice');
  
  const handlePayment = (status: 'OK' | 'NOK') => {
    // In a real scenario, the bank POSTs back to the callback URL or redirects to it.
    router.push(`/portal/finance/payment/callback?Authority=${authority}&Status=${status}&invoice_id=${invoiceId}`);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 dir-rtl font-sans text-right">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
        <div className="bg-brand-600 p-6 text-center text-white space-y-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          <CreditCard className="w-12 h-12 mx-auto mb-2 opacity-90" />
          <h1 className="text-xl font-black">درگاه پرداخت امن (محیط تستی)</h1>
          <p className="text-sm text-brand-100">شبکه الکترونیکی پرداخت کارت (شاپرک)</p>
        </div>
        
        <div className="p-8 space-y-6">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
            <div className="flex justify-between items-center text-sm border-b border-slate-200 pb-3">
              <span className="text-slate-500 font-bold">پذیرنده:</span>
              <span className="font-black text-slate-800">شرکت ارشیا نگین پردازش کویر</span>
            </div>
            <div className="flex justify-between items-center text-sm border-b border-slate-200 pb-3">
              <span className="text-slate-500 font-bold">شماره پیگیری:</span>
              <span className="font-mono text-slate-600">{authority || 'نامشخص'}</span>
            </div>
            <div className="flex justify-between items-center text-sm pt-1">
              <span className="text-slate-500 font-bold">مبلغ قابل پرداخت:</span>
              <span className="font-black text-xl text-brand-600">{parseInt(amount).toLocaleString()} <span className="text-xs">تومان</span></span>
            </div>
          </div>
          
          <div className="space-y-3 pt-4">
             <button 
                onClick={() => handlePayment('OK')}
                className="w-full flex items-center justify-center gap-2 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black transition-all shadow-lg shadow-emerald-500/20"
             >
                <CheckCircle2 className="w-5 h-5" />
                شبیه‌سازی پرداخت موفق
             </button>
             
             <button 
                onClick={() => handlePayment('NOK')}
                className="w-full flex items-center justify-center gap-2 py-3 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-2xl font-bold transition-all border border-slate-200"
             >
                <XCircle className="w-5 h-5" />
                انصراف و بازگشت
             </button>
          </div>
        </div>
        
        <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            این یک درگاه تستی و شبیه‌سازی شده است
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GatewayPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">در حال انتقال به درگاه...</div>}>
      <GatewayContent />
    </Suspense>
  );
}
