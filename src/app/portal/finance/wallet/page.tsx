'use client';

import React, { useState, useEffect } from 'react';
import { getWalletDetails, chargeWallet } from '@/lib/api';
import { Wallet, CreditCard, ArrowDownLeft, ArrowUpRight, ShieldCheck, Clock, CheckCircle2, PlusCircle, AlertCircle } from 'lucide-react';

export default function PortalWalletPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Charge wallet form states
  const [chargeAmount, setChargeAmount] = useState('5000000');
  const [charging, setCharging] = useState(false);
  const [chargeNotice, setChargeNotice] = useState('');
  const [showModal, setShowModal] = useState(false);

  const fetchWallet = async () => {
    try {
      const res = await getWalletDetails();
      setData(res);
    } catch (err) {
      console.error('Error fetching wallet details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const handleChargeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseInt(chargeAmount, 10);
    if (!numericAmount || numericAmount <= 0) return;

    setCharging(true);
    setChargeNotice('');
    try {
      const res = await chargeWallet(numericAmount, `افزایش اعتبار آنلاین کیف پول سازمان (${numericAmount.toLocaleString('fa-IR')} تومان)`);
      setChargeNotice(`شارژ با موفقیت انجام شد! موجودی جدید دیتابیس: ${res.new_balance.toLocaleString('fa-IR')} تومان`);
      setShowModal(false);
      fetchWallet();
    } catch (err) {
      console.error('Error charging wallet:', err);
    } finally {
      setCharging(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-center">
        <div className="space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-slate-400">در حال دریافت حساب مالی و تراکنش‌ها از دیتابیس جنگو...</p>
        </div>
      </div>
    );
  }

  const balance = data?.balance || 0;
  const transactions = data?.transactions || [];

  return (
    <div className="space-y-8 animate-fade-in text-right">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black dark:text-white text-slate-900 flex items-center gap-3">
          <Wallet className="w-7 h-7 text-emerald-500" />
          امور مالی و کیف پول واحد سازمان
        </h1>
        <p className="text-xs sm:text-sm dark:text-slate-400 text-slate-600">
          مدیریت متمرکز موجودی اعتباری، کسر اتوماتیک بابت خدمات هوش مصنوعی و شارژ آنلاین دیتابیس.
        </p>
      </div>

      {chargeNotice && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{chargeNotice}</span>
        </div>
      )}

      {/* Balance Card */}
      <div className="p-6 sm:p-8 rounded-3xl dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 shadow-2xl relative overflow-hidden text-right">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-right">
            <span className="text-xs font-bold dark:text-slate-400 text-slate-600">موجودی فعلی کیف پول سازمان:</span>
            <span className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400 block dir-rtl">
              {balance.toLocaleString('fa-IR')} <span className="text-sm font-bold dark:text-slate-300 text-slate-700">تومان</span>
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-500 font-bold block">وضعیت: فعال جهت کسر خودکار باگ و AI</span>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            <span>شارژ آنلاین کیف پول</span>
          </button>
        </div>
      </div>

      {/* Quick Preset Amounts or Modal */}
      {showModal && (
        <div className="p-6 sm:p-8 rounded-3xl glass-card border border-emerald-500/40 space-y-4 dark:bg-slate-950/90 bg-white text-right animate-scale">
          <div className="flex items-center justify-between border-b dark:border-slate-800 border-slate-200 pb-3">
            <h2 className="text-base font-bold dark:text-white text-slate-900 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-emerald-500" />
              فرم افزایش اعتبار آنلاین دیتابیس
            </h2>
            <button onClick={() => setShowModal(false)} className="dark:text-slate-400 text-slate-600 text-xs hover:text-red-500">بستن</button>
          </div>

          <form onSubmit={handleChargeSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold dark:text-slate-300 text-slate-700 block">مبلغ شارژ (تومان)</label>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {['2000000', '5000000', '10000000'].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setChargeAmount(amt)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      chargeAmount === amt
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500'
                        : 'dark:bg-slate-900 bg-slate-100 dark:border-slate-800 border-slate-200 dark:text-slate-400 text-slate-600 hover:border-emerald-500'
                    }`}
                  >
                    {parseInt(amt, 10).toLocaleString('fa-IR')} تومان
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={chargeAmount}
                onChange={(e) => setChargeAmount(e.target.value)}
                className="w-full px-4 py-3 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 border-slate-300 dark:text-white text-slate-900 text-xs font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={charging}
              className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              <span>{charging ? 'در حال ثبت در دیتابیس...' : 'انتقال به درگاه و شارژ آنی'}</span>
            </button>
          </form>
        </div>
      )}

      {/* Transactions Table */}
      <div className="p-6 sm:p-8 rounded-3xl glass-card border dark:border-slate-800 border-slate-200 space-y-6">
        <h2 className="text-base font-bold dark:text-white text-slate-900 flex items-center gap-2">
          <Clock className="w-5 h-5 text-emerald-500" />
          تاریخچه تراکنش‌های کیف پول ثبت‌شده در دیتابیس جنگو:
        </h2>

        <div className="space-y-3">
          {transactions.map((t: any) => (
            <div key={t.id} className="p-4 rounded-2xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-800 border-slate-200 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.type === 'CHARGE' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                  {t.type === 'CHARGE' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-xs font-bold dark:text-white text-slate-900">{t.description}</h3>
                  <span className="text-[10px] dark:text-slate-400 text-slate-500">{t.date}</span>
                </div>
              </div>

              <span className={`text-xs font-black font-mono ${t.type === 'CHARGE' ? 'text-emerald-500' : 'text-rose-500'}`}>
                {t.type === 'CHARGE' ? '+' : '-'}{t.amount.toLocaleString('fa-IR')} تومان
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
