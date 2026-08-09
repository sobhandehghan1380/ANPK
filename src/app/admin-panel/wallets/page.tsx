'use client';

import React, { useState } from 'react';
import { Wallet, PlusCircle, CheckCircle2, Search, ArrowUpRight, ShieldCheck } from 'lucide-react';

export default function AdminWalletsPage() {
  const [clients, setClients] = useState([
    { id: 'CLI-101', name: 'بیمارستان ولایت', balance: 24500000, lastCharge: '۱۴۰۴/۱۱/۱۰', status: 'فعال' },
    { id: 'CLI-102', name: 'دانشگاه علوم پزشکی یزد', balance: 18200000, lastCharge: '۱۴۰۴/۱۱/۰۵', status: 'فعال' },
    { id: 'CLI-103', name: 'مجتمع تأسیساتی خرمشاه', balance: 4100000, lastCharge: '۱۴۰۴/۱۰/۲۸', status: 'نیازمند شارژ' },
    { id: 'CLI-104', name: 'مرکز تصویربرداری پرتو', balance: 21600000, lastCharge: '۱۴۰۴/۱۱/۱۲', status: 'فعال' },
  ]);

  const [selectedClient, setSelectedClient] = useState('');
  const [chargeAmount, setChargeAmount] = useState('');
  const [chargeSuccess, setChargeSuccess] = useState('');

  const handleManualCharge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || !chargeAmount) return;

    const amountNum = parseInt(chargeAmount, 10);
    setClients((prev) =>
      prev.map((c) => (c.id === selectedClient ? { ...c, balance: c.balance + amountNum } : c))
    );

    setChargeSuccess(`مبلغ ${amountNum.toLocaleString('fa-IR')} تومان به کیف پول مشتری با موفقیت افزوده شد.`);
    setChargeAmount('');
    setTimeout(() => setChargeSuccess(''), 4000);
  };

  return (
    <div className="space-y-8 animate-fade-in text-right">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
          <Wallet className="w-6 h-6 text-emerald-400" />
          مدیریت کیف پول مشتریان و شارژ دستی اعتبار
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 font-medium">
          مشاهده اعتبار زنده سازمان‌ها و ثبت شارژ دستی توسط اپراتور ارشد سیستم.
        </p>
      </div>

      {/* Manual Top-up Form */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <h2 className="text-base font-black text-white flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-emerald-400" />
          ثبت شارژ دستی مستقیم کیف پول
        </h2>

        {chargeSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{chargeSuccess}</span>
          </div>
        )}

        <form onSubmit={handleManualCharge} className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          <div className="sm:col-span-5">
            <label className="block text-xs font-bold text-slate-400 mb-1.5">انتخاب سازمان / مشتری:</label>
            <select
              required
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 font-bold"
            >
              <option value="">-- یک مشتری را انتخاب کنید --</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} (موجودی فعلی: {c.balance.toLocaleString('fa-IR')} تومان)
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-5">
            <label className="block text-xs font-bold text-slate-400 mb-1.5">مبلغ شارژ دستی (تومان):</label>
            <input
              type="number"
              required
              value={chargeAmount}
              onChange={(e) => setChargeAmount(e.target.value)}
              placeholder="مثلاً 5000000"
              className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div className="sm:col-span-2 flex items-end">
            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md transition-colors"
            >
              ثبت شارژ دستی
            </button>
          </div>
        </form>
      </div>

      {/* Clients Wallets List */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
        <h2 className="text-base font-black text-white">لیست موجودی زنده کیف پول سازمان‌ها</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-3 px-3">شناسه مشتری</th>
                <th className="py-3 px-3">نام سازمان</th>
                <th className="py-3 px-3">موجودی کیف پول</th>
                <th className="py-3 px-3">آخرین شارژ</th>
                <th className="py-3 px-3">وضعیت حساب</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-medium">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-slate-800/50">
                  <td className="py-3.5 px-3 font-mono font-bold text-emerald-400">{client.id}</td>
                  <td className="py-3.5 px-3 text-white font-bold">{client.name}</td>
                  <td className="py-3.5 px-3 text-emerald-400 font-bold text-sm">
                    {client.balance.toLocaleString('fa-IR')} تومان
                  </td>
                  <td className="py-3.5 px-3 text-slate-400">{client.lastCharge}</td>
                  <td className="py-3.5 px-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      {client.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
