'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getPortalOverview, getTickets } from '@/lib/api';
import { ShieldCheck, Clock, CheckCircle2, PhoneCall, AlertTriangle, FileText, Calendar, ShieldAlert, Rocket } from 'lucide-react';

export default function PortalSLASupportPage() {
  const [data, setData] = useState<any>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [overviewRes, ticketsRes] = await Promise.all([
          getPortalOverview(),
          getTickets()
        ]);
        setData(overviewRes);
        setTickets(ticketsRes);
      } catch (err) {
        console.error('Error loading SLA support data from Django backend:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-center">
        <div className="space-y-3">
          <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-slate-400">در حال دریافت جزئیات قرارداد SLA از دیتابیس جنگو...</p>
        </div>
      </div>
    );
  }

  const activeProjectsCount = data?.active_projects_count || 0;
  const hasActiveSLA = data?.has_active_sla && activeProjectsCount > 0;
  const slaRemainingDays = hasActiveSLA ? (data?.sla_days_remaining || 0) : 0;
  const clientName = data?.client_name || 'حساب کاربری جدید';
  const slaPlanName = hasActiveSLA ? (data?.sla_plan_name || 'پشتیبانی طلایی SLA ۲۴/۷') : 'فاقد قرارداد پشتیبانی فعال';

  return (
    <div className="space-y-8 animate-fade-in text-right">
      {/* Header Title */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black dark:text-white text-slate-900 flex items-center gap-3">
          <ShieldCheck className="w-7 h-7 text-sky-500" />
          قرارداد پشتیبانی اختصاصی SLA
        </h1>
        <p className="text-xs sm:text-sm dark:text-slate-400 text-slate-600">
          مشاهده وضعیت گارانتی، پایداری ۹۹.۹٪، روزهای باقی‌مانده و سطوح پاسخگویی ۲۴/۷ ANPK.
        </p>
      </div>

      {/* Main SLA Contract Stats Banner */}
      {hasActiveSLA ? (
        <div className="p-6 sm:p-8 rounded-3xl dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 shadow-2xl relative overflow-hidden text-right">
          <div className="absolute top-0 left-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="space-y-2 border-b md:border-b-0 md:border-l dark:border-slate-800 border-slate-200 pb-4 md:pb-0 md:pl-6">
              <span className="text-xs font-bold text-sky-600 dark:text-sky-400 bg-sky-500/10 px-3 py-1 rounded-full border border-sky-500/20">
                سطح قرارداد فعال
              </span>
              <h2 className="text-xl font-black dark:text-white text-slate-900">{slaPlanName}</h2>
              <p className="text-xs dark:text-slate-400 text-slate-600">مالک قرارداد: {clientName}</p>
            </div>

            <div className="space-y-1 text-center md:text-right border-b md:border-b-0 md:border-l dark:border-slate-800 border-slate-200 pb-4 md:pb-0 md:pl-6">
              <span className="text-xs font-bold dark:text-slate-400 text-slate-600 block">اعتبار باقی‌مانده پشتیبانی</span>
              <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 block dir-rtl">
                {slaRemainingDays} <span className="text-sm font-bold dark:text-slate-300 text-slate-700">روز</span>
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-500 font-bold block">محاسبه‌شده تا امروز</span>
            </div>

            <div className="space-y-2 text-center md:text-right">
              <span className="text-xs font-bold dark:text-slate-400 text-slate-600 block">خط مستقیم پشتیبانی فوری (VIP)</span>
              <a
                href="tel:09131518904"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold transition-all shadow-lg shadow-sky-500/20"
              >
                <PhoneCall className="w-4 h-4" />
                <span>تماس با مرکز پاسخگویی SLA</span>
              </a>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State: No Active SLA Contract */
        <div className="p-8 sm:p-10 rounded-3xl dark:bg-amber-950/20 bg-amber-50 border border-amber-500/30 text-right space-y-5 relative overflow-hidden shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-bold border border-amber-500/30">
                <ShieldAlert className="w-4 h-4 text-amber-500" />
                <span>عدم وجود قرارداد پشتیبانی SLA فعال</span>
              </div>
              <h2 className="text-xl font-bold dark:text-white text-slate-900">حساب شما فاقد پروژه یا قرارداد پشتیبانی SLA می‌باشد</h2>
              <p className="text-xs dark:text-slate-300 text-slate-700 leading-relaxed max-w-2xl font-medium">
                قراردادهای گارانتی و پشتیبانی ۲۴/۷ SLA پس از ثبت و تحویل نهایی پروژه‌های اختصاصی برای سازمان‌ها فعال می‌گردند.
              </p>
            </div>

            <Link
              href="/start-project"
              className="px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition-all shadow-lg shadow-amber-500/20 shrink-0 flex items-center gap-2"
            >
              <Rocket className="w-4 h-4" />
              <span>ثبت درخواست پروژه جدید</span>
            </Link>
          </div>
        </div>
      )}

      {/* Response Times & Guarantees */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl glass-card border dark:border-slate-800 border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <span className="text-xs font-bold">زمان پاسخگویی باگ بحرانی</span>
            <Clock className="w-4 h-4" />
          </div>
          <span className="text-xl font-black dark:text-white text-slate-900 block">کمتر از ۱۵ دقیقه</span>
          <p className="text-[11px] dark:text-slate-400 text-slate-600">رسیدگی به قطع سرویس‌های لایو</p>
        </div>

        <div className="p-6 rounded-2xl glass-card border dark:border-slate-800 border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-sky-600 dark:text-sky-400">
            <span className="text-xs font-bold">پایداری کلود سرورها</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="text-xl font-black dark:text-white text-slate-900 block">۹۹.۹٪ تضمین شده</span>
          <p className="text-[11px] dark:text-slate-400 text-slate-600">ضمانت جبران خسارت قطعی با شارژ کیف پول</p>
        </div>

        <div className="p-6 rounded-2xl glass-card border dark:border-slate-800 border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-purple-600 dark:text-purple-400">
            <span className="text-xs font-bold">آپدیت امنیتی & پچ خودکار</span>
            <FileText className="w-4 h-4" />
          </div>
          <span className="text-xl font-black dark:text-white text-slate-900 block">هفتگی و بدون قطعی</span>
          <p className="text-[11px] dark:text-slate-400 text-slate-600">مانیتورینگ سنسورها و فریم‌ورک‌ها</p>
        </div>
      </div>

      {/* SLA Registered Tickets History */}
      <div className="p-6 rounded-3xl glass-card border dark:border-slate-800 border-slate-200 space-y-4">
        <h3 className="text-base font-bold dark:text-white text-slate-900">آخرین تیکت‌های پشتیبانی ثبت‌شده تحت SLA</h3>
        {tickets.length === 0 ? (
          <div className="p-8 text-center dark:text-slate-500 text-slate-400 text-xs font-bold">
            هیچ تیکتی تاکنون ثبت نشده است.
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((t: any) => (
              <div key={t.id} className="p-4 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-800 border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold dark:text-white text-slate-900 block">{t.subject}</span>
                  <span className="text-[10px] dark:text-slate-400 text-slate-500 font-mono">کد پیگیری: #{t.id}</span>
                </div>
                <span className="text-xs font-bold text-sky-600 dark:text-sky-400">{t.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
