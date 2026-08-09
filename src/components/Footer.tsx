'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Cpu, Phone, Mail, MapPin, Shield, CheckCircle2, ArrowUp, Check, ChevronDown } from 'lucide-react';

export function Footer() {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [openAccordion, setOpenAccordion] = useState<'solutions' | 'products' | null>(null);

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const toggleAccordion = (section: 'solutions' | 'products') => {
    setOpenAccordion((prev) => (prev === section ? null : section));
  };

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="dark:bg-slate-950 bg-slate-100/90 border-t dark:border-slate-800/80 border-slate-200/90 pt-12 sm:pt-16 pb-12 dark:text-slate-400 text-slate-700 relative overflow-hidden text-right">
      {/* Background glow effects */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-accent-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8 sm:space-y-12">
        {/* DESKTOP FOOTER GRID */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b dark:border-slate-800/80 border-slate-200">
          {/* Company Bio */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black dark:text-white text-slate-900">ارشیا نگین پردازش کویر</h3>
                <p className="text-xs dark:text-slate-400 text-slate-500 font-sans">Arshia Negin Pardazesh Kavir (ANPK)</p>
              </div>
            </div>
            <p className="text-sm dark:text-slate-400 text-slate-600 leading-relaxed max-w-md font-medium">
              طراح و مجری سامانه‌های اختصاصی سازمانی، اتوماسیون فرایند، هوش مصنوعی کاربردی، پلتفرم‌های سلامت دیجیتال، آموزش آنلاین و مدیریت نگهداشت تأسیسات (CMMS).
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 dark:text-slate-300 text-slate-700 shadow-sm font-bold">
                <Shield className="w-3.5 h-3.5 text-accent-500" />
                استاندارد امنیت OWASP
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 dark:text-slate-300 text-slate-700 shadow-sm font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-500" />
                زیرساخت بومی WebRTC
              </span>
            </div>
          </div>

          {/* Quick Links: Solutions */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold dark:text-white text-slate-900 uppercase tracking-wider">راهکارهای نرم‌افزاری</h4>
            <ul className="space-y-2 text-sm font-medium">
              <li><Link href="/solutions/digital-health" className="hover:text-brand-500 transition-colors">سلامت دیجیتال و پرونده الکترونیک</Link></li>
              <li><Link href="/solutions/clinic-management" className="hover:text-brand-500 transition-colors">اتوماسیون مدیریت کلینیک</Link></li>
              <li><Link href="/solutions/lab-system" className="hover:text-brand-500 transition-colors">سامانه مدیریت آزمایشگاه (LIS)</Link></li>
              <li><Link href="/solutions/cmms-facility" className="hover:text-brand-500 transition-colors">نگهداشت تأسیسات و CMMS</Link></li>
              <li><Link href="/solutions/process-automation-ai" className="hover:text-brand-500 transition-colors">اتوماسیون و هوش مصنوعی</Link></li>
              <li><Link href="/solutions/virtual-classroom" className="hover:text-brand-500 transition-colors">کلاس مجازی و وبینار</Link></li>
            </ul>
          </div>

          {/* Products & Pages */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold dark:text-white text-slate-900 uppercase tracking-wider">محصولات و بخش‌ها</h4>
            <ul className="space-y-2 text-sm font-medium">
              <li><Link href="/products/aira" className="hover:text-accent-500 transition-colors">پلتفرم آیرا (Aira)</Link></li>
              <li><Link href="/products/tasisat-negar" className="hover:text-accent-500 transition-colors">تأسیسات نگار (CMMS)</Link></li>
              <li><Link href="/products/nikilink" className="hover:text-accent-500 transition-colors">نیکی لینک (NikiLink)</Link></li>
              <li><Link href="/projects" className="hover:text-brand-500 transition-colors">پروژه‌ها و نمونه‌استقرارها</Link></li>
              <li><Link href="/portal" className="hover:text-emerald-500 font-bold transition-colors">پورتال مشتریان و کیف پول</Link></li>
              <li><Link href="/articles" className="hover:text-brand-500 transition-colors">مقالات و پایگاه دانش</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold dark:text-white text-slate-900 uppercase tracking-wider">ارتباط با شرکت (کلیک جهت کپی)</h4>
            <ul className="space-y-2.5 text-sm font-medium">
              <li
                onClick={() => handleCopy('ایران، استان یزد، شهرستان یزد، محله خرمشاه، شرکت ارشیا نگین پردازش کویر', 'address')}
                className="flex items-start gap-2 cursor-pointer p-2 rounded-xl dark:hover:bg-slate-900 hover:bg-slate-200 transition-colors"
              >
                <MapPin className="w-4 h-4 text-brand-500 mt-1 shrink-0" />
                <span className="text-xs leading-relaxed dark:text-slate-300 text-slate-700">
                  یزد، محله خرمشاه، شرکت ارشیا نگین پردازش کویر
                </span>
                {copiedField === 'address' && <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-1" />}
              </li>

              <li
                onClick={() => handleCopy('09131518904', 'phone')}
                className="flex items-center gap-2 cursor-pointer p-2 rounded-xl dark:hover:bg-slate-900 hover:bg-slate-200 transition-colors"
              >
                <Phone className="w-4 h-4 text-brand-500 shrink-0" />
                <span className="text-xs font-mono font-bold dark:text-slate-300 text-slate-700 dir-ltr text-right">09131518904</span>
                {copiedField === 'phone' && <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
              </li>

              <li
                onClick={() => handleCopy('info@anpk.ir', 'email')}
                className="flex items-center gap-2 cursor-pointer p-2 rounded-xl dark:hover:bg-slate-900 hover:bg-slate-200 transition-colors"
              >
                <Mail className="w-4 h-4 text-brand-500 shrink-0" />
                <span className="text-xs font-mono dark:text-slate-300 text-slate-700">info@anpk.ir</span>
                {copiedField === 'email' && <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
              </li>
            </ul>
          </div>
        </div>

        {/* MOBILE ACCORDION FOOTER */}
        <div className="md:hidden space-y-4 pb-6 border-b dark:border-slate-800 border-slate-200">
          {/* Company Bio Mobile */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white font-bold shadow-md">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black dark:text-white text-slate-900">ارشیا نگین پردازش کویر</h3>
            </div>
            <p className="text-xs dark:text-slate-400 text-slate-600 leading-relaxed">
              طراح و مجری سامانه‌های اختصاصی سازمانی، هوش مصنوعی کاربردی و پلتفرم‌های سلامت دیجیتال.
            </p>
          </div>

          {/* Solutions Accordion */}
          <div className="border dark:border-slate-800 border-slate-200 rounded-2xl overflow-hidden dark:bg-slate-900/50 bg-white">
            <button
              onClick={() => toggleAccordion('solutions')}
              className="w-full p-4 flex items-center justify-between font-bold dark:text-white text-slate-900 text-xs"
            >
              <span>راهکارهای نرم‌افزاری</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${openAccordion === 'solutions' ? 'rotate-180' : ''}`} />
            </button>
            {openAccordion === 'solutions' && (
              <ul className="px-4 pb-4 space-y-2 text-xs border-t dark:border-slate-800 border-slate-100 pt-3 dark:text-slate-300 text-slate-600">
                <li><Link href="/solutions/digital-health">سلامت دیجیتال و پرونده الکترونیک</Link></li>
                <li><Link href="/solutions/clinic-management">اتوماسیون مدیریت کلینیک</Link></li>
                <li><Link href="/solutions/lab-system">سامانه مدیریت آزمایشگاه (LIS)</Link></li>
                <li><Link href="/solutions/cmms-facility">نگهداشت تأسیسات و CMMS</Link></li>
              </ul>
            )}
          </div>

          {/* Products Accordion */}
          <div className="border dark:border-slate-800 border-slate-200 rounded-2xl overflow-hidden dark:bg-slate-900/50 bg-white">
            <button
              onClick={() => toggleAccordion('products')}
              className="w-full p-4 flex items-center justify-between font-bold dark:text-white text-slate-900 text-xs"
            >
              <span>محصولات و پورتال مشتریان</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${openAccordion === 'products' ? 'rotate-180' : ''}`} />
            </button>
            {openAccordion === 'products' && (
              <ul className="px-4 pb-4 space-y-2 text-xs border-t dark:border-slate-800 border-slate-100 pt-3 dark:text-slate-300 text-slate-600">
                <li><Link href="/products/aira">پلتفرم آیرا (Aira)</Link></li>
                <li><Link href="/products/tasisat-negar">تأسیسات نگار (CMMS)</Link></li>
                <li><Link href="/portal">پورتال مشتریان و کیف پول</Link></li>
              </ul>
            )}
          </div>
        </div>

        {/* BOTTOM COPYRIGHT & SCROLL TO TOP */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium dark:text-slate-400 text-slate-600">
          <p className="text-center sm:text-right">
            © ۱۴۰۴ تمامی حقوق مادی و معنوی متعلق به <strong className="dark:text-white text-slate-900">شرکت ارشیا نگین پردازش کویر (ANPK)</strong> می‌باشد.
          </p>

          <button
            onClick={scrollToTop}
            className="p-3 rounded-2xl dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-300 hover:border-brand-500 dark:text-slate-300 text-slate-700 hover:text-brand-500 shadow-md transition-all flex items-center gap-2 text-xs font-bold"
          >
            <span>بازگشت به بالای صفحه</span>
            <ArrowUp className="w-4 h-4 text-brand-500" />
          </button>
        </div>
      </div>
    </footer>
  );
}
