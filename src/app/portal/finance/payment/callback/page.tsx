'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { verifyPayment } from '@/lib/api';
import { CheckCircle2, XCircle, ArrowRight, Loader2 } from 'lucide-react';

function CallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const authority = searchParams.get('Authority');
  const status = searchParams.get('Status');
  const invoiceId = searchParams.get('invoice_id');
  
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function verify() {
      if (!invoiceId || !authority || !status) {
        setSuccess(false);
        setMessage('اطلاعات بازگشتی از درگاه نامعتبر است.');
        setLoading(false);
        return;
      }
      
      try {
        const res = await verifyPayment(parseInt(invoiceId), authority, status);
        if (res && res.status === 'success') {
          setSuccess(true);
          setMessage(res.message);
        } else {
          setSuccess(false);
          setMessage(res?.error || 'پرداخت ناموفق بود.');
        }
      } catch (err) {
        setSuccess(false);
        setMessage('خطا در ارتباط با سرور.');
      } finally {
        setLoading(false);
      }
    }
    
    verify();
  }, [invoiceId, authority, status]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 text-brand-500 animate-spin mb-4" />
        <p className="font-bold text-slate-600">در حال بررسی و تایید تراکنش بانکی...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] bg-slate-50 flex items-center justify-center p-4 dir-rtl text-right">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-lg border border-slate-200 p-8 text-center space-y-6">
        
        <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${success ? 'bg-emerald-100 text-emerald-500' : 'bg-rose-100 text-rose-500'}`}>
           {success ? <CheckCircle2 className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
        </div>
        
        <div className="space-y-2">
           <h2 className="text-2xl font-black text-slate-800">{success ? 'تراکنش موفق' : 'تراکنش ناموفق'}</h2>
           <p className="text-sm font-bold text-slate-500">{message}</p>
        </div>
        
        <div className="bg-slate-50 rounded-xl p-4 text-sm font-mono border border-slate-100 text-slate-600">
           شماره پیگیری: {authority || '-'}
        </div>
        
        <div className="pt-4">
           <button 
             onClick={() => router.push('/portal/finance/invoices')}
             className="w-full flex items-center justify-center gap-2 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-brand-500/20"
           >
             <ArrowRight className="w-5 h-5" />
             بازگشت به صورتحساب‌ها
           </button>
        </div>
        
      </div>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">درحال پردازش...</div>}>
      <CallbackContent />
    </Suspense>
  );
}
