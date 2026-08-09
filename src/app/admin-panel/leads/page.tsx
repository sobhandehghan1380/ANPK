'use client';

import React, { useState } from 'react';
import { FolderGit2, Search, Filter, PhoneCall, CheckCircle2, Clock, UserCheck, Check, AlertCircle } from 'lucide-react';

export default function AdminLeadsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'new' | 'contacted' | 'contract'>('all');

  const [leads, setLeads] = useState([
    { id: 'LD-904', company: 'بیمارستان شهید صدوقی یزد', contact: 'دکتر علوی (۰۹۱۳۱۵۱۰۰۰۰)', service: 'سامانه CMMS نگهداشت تأسیسات', budget: '۱۵۰ میلیون تومان', date: '۱۴۰۴/۱۱/۱۸ - ۰۹:۱۵', status: 'new' },
    { id: 'LD-903', company: 'دانشگاه علوم پزشکی اصفهان', contact: 'مهندس رضایی (۰۹۱۳۲۵۰۹۹۸۸)', service: 'کلاس آنلاین و وبینار آیرا', budget: '۲۲۰ میلیون تومان', date: '۱۴۰۴/۱۱/۱۷ - ۱۶:۴۰', status: 'contacted' },
    { id: 'LD-899', company: 'مرکز تحقیقات ژنتیک', contact: 'دکتر مهدوی (۰۹۱۲۳۴۵۱۱۲۲)', service: 'هوش مصنوعی OCR اسناد', budget: '۸۵ میلیون تومان', date: '۱۴۰۴/۱۱/۱۶ - ۱۱:۳۰', status: 'contract' },
    { id: 'LD-880', company: 'مجتمع درمانی خاتم‌الانبیاء', contact: 'خانم دکتر طباطبایی (۰۹۱۳۹۹۹۴۴۰۰)', service: 'پرونده الکترونیک و اتوماسیون', budget: '۱۸۰ میلیون تومان', date: '۱۴۰۴/۱۱/۱۵ - ۱۴:۲۰', status: 'contacted' },
  ]);

  const updateLeadStatus = (id: string, newStatus: string) => {
    setLeads((prev) =>
      prev.map((ld) => (ld.id === id ? { ...ld, status: newStatus } : ld))
    );
  };

  const filteredLeads = leads.filter((ld) => {
    const matchesSearch = ld.company.includes(searchQuery) || ld.contact.includes(searchQuery) || ld.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' ? true : ld.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 animate-fade-in text-right">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
          <FolderGit2 className="w-6 h-6 text-amber-400" />
          مدیریت لیدها و درخواست‌های ثبت پروژه (فرم ۴ مرحله‌ای)
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 font-medium">
          بررسی مشخصات سازمان‌های متقاضی، تعیین کارشناس فروش و تغییر فاز پیگیری لیدها.
        </p>
      </div>

      {/* Filter and Table */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو نام سازمان یا شماره..."
              className="w-full pr-9 pl-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-bold">
            {[
              { id: 'all', label: 'همه لیدها' },
              { id: 'new', label: 'جدید' },
              { id: 'contacted', label: 'در حال پیگیری' },
              { id: 'contract', label: 'عقد قرارداد' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setFilterStatus(st.id as any)}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  filterStatus === st.id ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-3 px-3">کد لید</th>
                <th className="py-3 px-3">نام سازمان / مشتری</th>
                <th className="py-3 px-3">اطلاعات تماس</th>
                <th className="py-3 px-3">سرویس درخواستی</th>
                <th className="py-3 px-3">بودجه متقاضی</th>
                <th className="py-3 px-3">تاریخ ثبت</th>
                <th className="py-3 px-3">اقدام و تغییر وضعیت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-medium">
              {filteredLeads.map((ld) => (
                <tr key={ld.id} className="hover:bg-slate-800/50">
                  <td className="py-3.5 px-3 font-mono font-bold text-amber-400">{ld.id}</td>
                  <td className="py-3.5 px-3 text-white font-bold">{ld.company}</td>
                  <td className="py-3.5 px-3 text-slate-300">{ld.contact}</td>
                  <td className="py-3.5 px-3 text-slate-300">{ld.service}</td>
                  <td className="py-3.5 px-3 text-emerald-400 font-bold">{ld.budget}</td>
                  <td className="py-3.5 px-3 text-slate-400">{ld.date}</td>
                  <td className="py-3.5 px-3">
                    <select
                      value={ld.status}
                      onChange={(e) => updateLeadStatus(ld.id, e.target.value)}
                      className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-bold text-amber-400 focus:outline-none"
                    >
                      <option value="new">جدید (نیازمند بررسی)</option>
                      <option value="contacted">در حال پیگیری و تماس</option>
                      <option value="contract">تایید و عقد قرارداد</option>
                    </select>
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
