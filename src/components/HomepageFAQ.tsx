'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Sparkles } from 'lucide-react';

export function HomepageFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'آیا شرکت ارشیا نگین پردازش کویر سورس‌کد کامل سامانه‌ها را تحویل می‌دهد؟',
      a: 'بله، طبق قوانین شرکت و قراردادهای توسعه اختصاصی، مالکیت مادی و معنوی کامل سورس‌کد، پایگاه داده و داکیومنت‌های فنی پس از تسویه نهایی به سازمان مشتری واگذار می‌گردد.',
    },
    {
      q: 'آیا امکان استقرار سامانه‌ها روی داتاسنتر داخلی سازمان (On-Premise) وجود دارد؟',
      a: 'بله، تمام پلتفرم‌های ANPK از جمله سامانه CMMS تأسیسات نگار و پلتفرم کلاس مجازی آیرا قابلیت استقرار هم به‌صورت SaaS (ابری) و هم به‌صورت On-Premise (زیرساخت اختصاصی سازمان بدون نیاز به اینترنت) را دارند.',
    },
    {
      q: 'کلاس مجازی آیرا چگونه تاخیر صوتی و قطع ارتباط را کاهش می‌دهد؟',
      a: 'آیرا از معماری بومی توزیع‌شده WebRTC با کدگذاری صوتی Opus و ویدیویی VP9 استفاده می‌کند. سرورهای پردازشی داخل داتاسنترهای اصلی ایران مستقر بوده و ترافیک کاربران به‌صورت نیم‌بهاء محاسبه می‌شود.',
    },
    {
      q: 'فرایند ثبت سفارش و دریافت پروپوزال پروژه چقدر زمان می‌برد؟',
      a: 'پس از تکمیل فرم ۴ مرحله‌ای و دریافت کد پیگیری یکتا، دپارتمان مهندسی ظرف حداکثر ۲۴ ساعت کاری با شما تماس گرفته و پروپوزال فنی، زمان‌بندی و برآورد مالی را ارائه خواهد داد.',
    },
    {
      q: 'آیا سامانه‌های درمانی ANPK با سیستم‌های بیمه و سپاس یکپارچه می‌شوند؟',
      a: 'بله، راهکارهای سلامت دیجیتال ما بر اساس استاندارد HL7 FHIR توسعه یافته و دارای Web APIهای آماده جهت اتصال به سیستم‌های سپاس، استحقاق درمان، تامین اجتماعی و سلامت هستند.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {faqs.map((faq, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div
            key={idx}
            className={`rounded-2xl border transition-all overflow-hidden ${
              isOpen
                ? 'glass-card border-brand-500/50 shadow-md'
                : 'dark:bg-slate-900/60 bg-white border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <button
              onClick={() => setOpenIndex(isOpen ? null : idx)}
              className="w-full p-5 text-right flex items-center justify-between gap-4 font-bold dark:text-white text-slate-900 text-sm sm:text-base focus:outline-none"
            >
              <span className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-brand-500/10 text-brand-500 flex items-center justify-center font-mono text-xs font-bold shrink-0">
                  0{idx + 1}
                </span>
                <span>{faq.q}</span>
              </span>
              <ChevronDown
                className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-300 ${
                  isOpen ? 'rotate-180 text-brand-500' : ''
                }`}
              />
            </button>

            {isOpen && (
              <div className="px-5 pb-5 pt-1 text-xs sm:text-sm dark:text-slate-300 text-slate-700 leading-relaxed font-medium border-t dark:border-slate-800/80 border-slate-100 animate-fadeIn pr-14">
                {faq.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
