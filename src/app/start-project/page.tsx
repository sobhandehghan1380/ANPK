'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Rocket,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Copy,
  Check,
  ShieldCheck,
  Building,
  User,
  Phone,
  Mail,
  FileText,
  Activity,
  Wrench,
  GraduationCap,
  Bot,
  Laptop,
  Layers,
  Sparkles,
  Printer
} from 'lucide-react';
import { ScrollReveal } from '@/components/ScrollReveal';

export default function StartProjectWizardPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);
  const [successReceipt, setSuccessReceipt] = useState<{
    trackingCode: string;
    fullName: string;
    createdAt: string;
  } | null>(null);

  // Form State (Real-world realistic intake process)
  const [formData, setFormData] = useState({
    // Step 1: Contact & Organization Info
    fullName: '',
    company: '',
    phone: '',
    email: '',

    // Step 2: Project Subject & Details (Flexible open format)
    fieldDomain: 'پلتفرم تجارت الکترونیک و فروشگاهی (هنرداری)',
    customDomainText: '',
    projectSubject: '',
    problemDescription: '',
    currentProcessStatus: 'دستی / کاغذی یا فاقد سامانه',

    // Step 3: Preferred Consultation Method & Meeting
    consultationType: 'phone', // 'phone' | 'online_demo' | 'in_person'
    preferredTime: 'صبح (۸ الی ۱۲)',
    additionalNotes: '',

    // Step 4: Final Consent & Verification
    privacyAgreed: true,
    website_hp: '', // Honeypot field
  });

  const domainOptions = [
    { label: 'پلتفرم تجارت الکترونیک و فروشگاهی (هنرداری)', icon: Laptop, desc: 'سامانه‌های فروشگاهی، مدیریت سفارشات و درگاه‌های پرداخت' },
    { label: 'نگهداشت تأسیسات و CMMS (تأسیسات نگار)', icon: Wrench, desc: 'پایش تجهیزات صنعتی و بیمارستانی با QR کد' },
    { label: 'سلامت دیجیتال و پرونده الکترونیک', icon: Activity, desc: 'پرونده سلامت، LIS آزمایشگاه و HL7' },
    { label: 'کلاس مجازی و وبینار (آیرا)', icon: GraduationCap, desc: 'پلتفرم بومی WebRTC با ترافیک نیم‌بهاء' },
    { label: 'اتوماسیون فرایند و هوش مصنوعی', icon: Bot, desc: 'مدل‌سازی BPMN و موتور OCR فارسی' },
    { label: 'سایر پروژه‌ها و پلتفرم‌های سفارشی', icon: Sparkles, desc: 'طراحی اختصاصی بر اساس نیازمندی‌های منحصر‌به‌فرد سازمان شما' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validateStep = (currentStep: number) => {
    setErrorMsg('');

    if (currentStep === 1) {
      if (!formData.fullName.trim()) return 'لطفاً نام و نام خانوادگی خود را وارد نمایید.';
      if (!formData.phone.trim()) return 'لطفاً شماره تماس مستقیم را وارد نمایید.';
      const phoneRegex = /^0[0-9]{9,10}$/;
      if (!phoneRegex.test(formData.phone.trim().replace(/\s+/g, ''))) {
        return 'شماره تماس وارد شده معتبر نمی‌باشد (مثال: 09123456789 یا 03534200000).';
      }
    }

    if (currentStep === 2) {
      if (!formData.projectSubject.trim()) {
        return 'لطفاً عنوان یا موضوع کلی پروژه را وارد نمایید.';
      }
      if (!formData.problemDescription.trim() || formData.problemDescription.trim().length < 10) {
        return 'لطفاً شرح نیازمندی یا صورت مسئله را با جزئیات بیشتر (حداقل ۱۰ کاراکتر) وارد فرمایید.';
      }
    }

    if (currentStep === 3) {
      if (!formData.consultationType) return 'لطفاً شیوه ترجیحی مشاوره را انتخاب نمایید.';
    }

    if (currentStep === 4) {
      if (!formData.privacyAgreed) return 'تایید قوانین حریم خصوصی و صحت اطلاعات الزامی است.';
    }

    return null;
  };

  const handleNextStep = () => {
    const err = validateStep(step);
    if (err) {
      setErrorMsg(err);
      return;
    }
    setErrorMsg('');
    setStep((prev) => Math.min(4, prev + 1));
  };

  const handlePrevStep = () => {
    setErrorMsg('');
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateStep(4);
    if (err) {
      setErrorMsg(err);
      return;
    }

    // Anti-Spam Check
    if (formData.website_hp) return;

    setLoading(true);
    setErrorMsg('');

    try {
      const response = await fetch('/api/v1/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: formData.company || formData.fullName,
          contact_person: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          service_type: formData.fieldDomain,
          project_description: formData.problemDescription,
          budget_range: 'برآورد بر اساس RFP',
          constraints: `نوع مشاوره: ${formData.consultationType} | زمان: ${formData.preferredTime} | توضیحات: ${formData.additionalNotes}`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'خطا در ثبت درخواست');
      }

      setSuccessReceipt({
        trackingCode: data.trackingCode || 'ANPK-' + Math.floor(100000 + Math.random() * 900000),
        fullName: formData.fullName,
        createdAt: new Date().toLocaleDateString('fa-IR'),
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'متأسفانه مشکلی در ارسال داده رخ داد. لطفاً مجدداً تلاش کنید.');
    } finally {
      setLoading(false);
    }
  };

  const copyTrackingCode = () => {
    if (successReceipt) {
      navigator.clipboard.writeText(successReceipt.trackingCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (successReceipt) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-right space-y-8 overflow-x-hidden">
        <ScrollReveal variant="scale">
          <div className="p-8 sm:p-12 rounded-3xl glass-card border border-emerald-500/40 space-y-6 relative overflow-hidden card-elevated text-center">
            <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg icon-glow">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                درخواست شما با موفقیت ثبت گردید
              </span>
              <h1 className="text-2xl sm:text-3xl font-black dark:text-white text-slate-900">
                سپاسگزاریم، جناب/سرکار خانم {successReceipt.fullName}
              </h1>
              <p className="text-xs sm:text-sm dark:text-slate-300 text-slate-600 leading-relaxed max-w-xl mx-auto font-medium">
                درخواست بررسی ایده و مشاوره فنی شما دریافت شد. کارشناسان ارشیا نگین پردازش کویر پس از عارضه‌یابی اولیه، جهت هماهنگی جلسه مشاوره با شما تماس خواهند گرفت.
              </p>
            </div>

            {/* Tracking Code Box */}
            <div className="p-6 rounded-2xl dark:bg-slate-900 bg-slate-100 border dark:border-slate-800 border-slate-300 max-w-md mx-auto space-y-3">
              <span className="text-xs font-bold dark:text-slate-400 text-slate-600 block">کد پیگیری یکتای شما:</span>
              <div className="flex items-center justify-between gap-3 dark:bg-slate-950 bg-white p-3 rounded-xl border dark:border-slate-800 border-slate-200">
                <span className="font-mono text-xl font-black text-brand-600 dark:text-brand-400 tracking-wider">
                  {successReceipt.trackingCode}
                </span>
                <button
                  onClick={copyTrackingCode}
                  className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'کپی شد' : 'کپی کد'}</span>
                </button>
              </div>
            </div>

            <div className="pt-4 border-t dark:border-slate-800 border-slate-200 flex flex-wrap items-center justify-center gap-4 text-xs font-bold">
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-xl dark:bg-slate-800 bg-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 dark:text-slate-200 text-slate-800 flex items-center gap-2 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>چاپ یا ذخیره رسید</span>
              </button>
              <Link
                href="/"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 text-white shadow-md flex items-center gap-2 transition-all"
              >
                <span>بازگشت به صفحه اصلی</span>
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 overflow-x-hidden text-right">
      {/* Page Header */}
      <ScrollReveal variant="fade-up">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full dark:bg-slate-900/80 bg-white/90 border dark:border-slate-700/60 border-slate-200/90 text-xs font-bold text-brand-600 dark:text-brand-400 backdrop-blur-2xl shadow-sm mx-auto">
            <Rocket className="w-4 h-4 text-brand-500" />
            <span>ثبت نیازمندی و مشاوره فنی پروژه‌ها</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black dark:text-white text-slate-900 leading-tight">
            درخواست <span className="gradient-text-primary">بررسی ایده و مشاوره پروژه</span>
          </h1>
          <p className="dark:text-slate-300 text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">
            شرح اولیه مسئله سازمان خود را ثبت کنید. کارشناسان ANPK پس از عارضه‌یابی، برآورد هزینه و زمان‌بندی دقیق را به شما اعلام خواهند کرد.
          </p>
        </div>
      </ScrollReveal>

      {/* Progress Steps Header */}
      <div className="p-4 sm:p-6 rounded-3xl glass-card border dark:border-slate-800 border-slate-200/90 card-elevated">
        <div className="grid grid-cols-4 gap-2 text-center relative">
          {[
            { num: 1, label: 'اطلاعات تماس' },
            { num: 2, label: 'موضوع و شرح نیازمندی' },
            { num: 3, label: 'شیوه مشاوره ترجیحی' },
            { num: 4, label: 'تایید و ثبت نهایی' },
          ].map((s) => {
            const isActive = step === s.num;
            const isDone = step > s.num;

            return (
              <div key={s.num} className="space-y-2 relative z-10">
                <div
                  className={`w-9 h-9 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center mx-auto text-xs sm:text-sm font-bold transition-all duration-300 ${
                    isDone
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                      : isActive
                      ? 'bg-gradient-to-r from-brand-600 to-accent-600 text-white shadow-lg shadow-brand-600/30 scale-105'
                      : 'dark:bg-slate-900 bg-slate-100 dark:text-slate-500 text-slate-400 border dark:border-slate-800 border-slate-300'
                  }`}
                >
                  {isDone ? <Check className="w-5 h-5" /> : s.num}
                </div>
                <span
                  className={`block text-[11px] sm:text-xs font-bold transition-colors ${
                    isActive || isDone ? 'dark:text-white text-slate-900' : 'text-slate-400'
                  }`}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Error Message Box */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-2 animate-shake">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form Steps Card */}
      <div className="p-6 sm:p-10 rounded-3xl glass-card border dark:border-slate-800 border-slate-200/90 space-y-8 card-elevated">
        <form onSubmit={handleSubmit}>
          {/* Honeypot anti-spam */}
          <input
            type="text"
            name="website_hp"
            value={formData.website_hp}
            onChange={handleChange}
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
          />

          {/* STEP 1: CONTACT & ORGANIZATION INFO */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-1 border-b dark:border-slate-800 border-slate-200 pb-4">
                <h2 className="text-lg font-bold dark:text-white text-slate-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-brand-500" />
                  مرحله ۱ از ۴: اطلاعات تماس و سازمان
                </h2>
                <p className="text-xs dark:text-slate-400 text-slate-600 font-medium">
                  جهت برقراری تماس و ارزیابی اولیه، اطلاعات ارتباطی خود را وارد نمایید.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold dark:text-slate-300 text-slate-700 mb-2">
                    نام و نام خانوادگی <span className="text-red-500">*</span>:
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="مثال: دکتر علی رضایی"
                    className="w-full px-4 py-3.5 rounded-2xl dark:bg-slate-900 bg-slate-100 border dark:border-slate-800 border-slate-300 text-xs dark:text-white text-slate-900 focus:outline-none focus:border-brand-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold dark:text-slate-300 text-slate-700 mb-2">
                    نام سازمان / شرکت / مرکز درمانی (اختیاری):
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="مثال: بیمارستان ولایت / شرکت فولاد"
                    className="w-full px-4 py-3.5 rounded-2xl dark:bg-slate-900 bg-slate-100 border dark:border-slate-800 border-slate-300 text-xs dark:text-white text-slate-900 focus:outline-none focus:border-brand-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold dark:text-slate-300 text-slate-700 mb-2">
                    شماره همراه / ثابت مستقیم <span className="text-red-500">*</span>:
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="مثال: 09123456789 یا 03534200000"
                    className="w-full px-4 py-3.5 rounded-2xl dark:bg-slate-900 bg-slate-100 border dark:border-slate-800 border-slate-300 text-xs dark:text-white text-slate-900 focus:outline-none focus:border-brand-500 font-medium dir-ltr text-right"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold dark:text-slate-300 text-slate-700 mb-2">
                    پست الکترونیک (ایمیل رسمی):
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="مثال: info@company.ir"
                    className="w-full px-4 py-3.5 rounded-2xl dark:bg-slate-900 bg-slate-100 border dark:border-slate-800 border-slate-300 text-xs dark:text-white text-slate-900 focus:outline-none focus:border-brand-500 font-medium dir-ltr text-right"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: PROJECT SUBJECT & DETAILS */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-1 border-b dark:border-slate-800 border-slate-200 pb-4">
                <h2 className="text-lg font-bold dark:text-white text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-accent-500" />
                  مرحله ۲ از ۴: موضوع و شرح نیازمندی
                </h2>
                <p className="text-xs dark:text-slate-400 text-slate-600 font-medium">
                  حوزه عمومی، موضوع و خلاصه‌ای از نیازمندی یا صورت مسئله سازمان را بیان کنید.
                </p>
              </div>

              {/* Domain Selection */}
              <div className="space-y-3">
                <label className="block text-xs font-bold dark:text-slate-300 text-slate-700">
                  حوزه پیشنهادی مرتبط:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {domainOptions.map((opt, idx) => {
                    const isSelected = formData.fieldDomain === opt.label;
                    const IconComp = opt.icon;

                    return (
                      <div
                        key={idx}
                        onClick={() => setFormData({ ...formData, fieldDomain: opt.label })}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 space-y-2 ${
                          isSelected
                            ? 'dark:bg-brand-950/40 bg-brand-50 border-brand-500 shadow-md scale-[1.02]'
                            : 'dark:bg-slate-900 bg-slate-100/80 border-slate-200 dark:border-slate-800 hover:border-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <IconComp className={`w-4 h-4 ${isSelected ? 'text-brand-500' : 'text-slate-400'}`} />
                          <span className={`text-xs font-bold ${isSelected ? 'text-brand-600 dark:text-brand-400' : 'dark:text-white text-slate-900'}`}>
                            {opt.label}
                          </span>
                        </div>
                        <p className="text-[11px] dark:text-slate-400 text-slate-600 leading-tight font-medium">
                          {opt.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Custom Domain Text if "Other" selected */}
              {formData.fieldDomain === 'سایر پروژه‌ها و پلتفرم‌های سفارشی' && (
                <div>
                  <label className="block text-xs font-bold dark:text-slate-300 text-slate-700 mb-2">
                    عنوان حوزه اختصاصی شما:
                  </label>
                  <input
                    type="text"
                    name="customDomainText"
                    value={formData.customDomainText}
                    onChange={handleChange}
                    placeholder="مثال: سامانه انبارداری هوشمند، ربات پشتیبانی مشتریان..."
                    className="w-full px-4 py-3.5 rounded-2xl dark:bg-slate-900 bg-slate-100 border dark:border-slate-800 border-slate-300 text-xs dark:text-white text-slate-900 focus:outline-none focus:border-brand-500 font-medium"
                  />
                </div>
              )}

              {/* Project Subject */}
              <div>
                <label className="block text-xs font-bold dark:text-slate-300 text-slate-700 mb-2">
                  عنوان یا موضوع کلی پروژه <span className="text-red-500">*</span>:
                </label>
                <input
                  type="text"
                  name="projectSubject"
                  value={formData.projectSubject}
                  onChange={handleChange}
                  placeholder="مثال: پیاده‌سازی سامانه یکپارچه نگهداشت تأسیسات بیمارستان"
                  className="w-full px-4 py-3.5 rounded-2xl dark:bg-slate-900 bg-slate-100 border dark:border-slate-800 border-slate-300 text-xs dark:text-white text-slate-900 focus:outline-none focus:border-brand-500 font-medium"
                />
              </div>

              {/* Problem Description */}
              <div>
                <label className="block text-xs font-bold dark:text-slate-300 text-slate-700 mb-2">
                  شرح کامل مسئله، هدف یا انتظارات از نرم‌افزار <span className="text-red-500">*</span>:
                </label>
                <textarea
                  name="problemDescription"
                  rows={4}
                  value={formData.problemDescription}
                  onChange={handleChange}
                  placeholder="خلاصه‌ای از چالش‌های فعلی، نیازمندی‌ها، حجم کاربران یا فرایندهایی که قصد مکانیزاسیون آن را دارید بنویسید..."
                  className="w-full px-4 py-3.5 rounded-2xl dark:bg-slate-900 bg-slate-100 border dark:border-slate-800 border-slate-300 text-xs dark:text-white text-slate-900 focus:outline-none focus:border-brand-500 font-medium resize-none leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* STEP 3: PREFERRED CONSULTATION METHOD */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-1 border-b dark:border-slate-800 border-slate-200 pb-4">
                <h2 className="text-lg font-bold dark:text-white text-slate-900 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-sky-500" />
                  مرحله ۳ از ۴: نحوه مشاوره و زمان ارتباط
                </h2>
                <p className="text-xs dark:text-slate-400 text-slate-600 font-medium">
                  پس از بررسی اولیه، تمایل دارید کارشناسان ما از چه طریقی با شما ارتباط برقرار نمایند؟
                </p>
              </div>

              {/* Consultation Method Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { id: 'phone', title: 'مشاوره تلفنی مستقیم', desc: 'تماس تلفنی با کارشناس فروش و ارزیابی فنی', icon: Phone },
                  { id: 'online_demo', title: 'جلسه آنلاین و دموی تصویری', desc: 'برگزاری جلسه آنلاین WebRTC جهت مشاهده دموی محصول', icon: Laptop },
                  { id: 'in_person', title: 'جلسه حضوری در محل', desc: 'هماهنگی جلسه حضوری در دفتر شرکت یا محل سازمان شما', icon: Building },
                ].map((m) => {
                  const isSelected = formData.consultationType === m.id;
                  const IconComp = m.icon;

                  return (
                    <div
                      key={m.id}
                      onClick={() => setFormData({ ...formData, consultationType: m.id })}
                      className={`p-5 rounded-2xl border cursor-pointer transition-all duration-200 space-y-2 text-center ${
                        isSelected
                          ? 'dark:bg-sky-950/40 bg-sky-50 border-sky-500 shadow-md scale-[1.02]'
                          : 'dark:bg-slate-900 bg-slate-100/80 border-slate-200 dark:border-slate-800 hover:border-slate-400'
                      }`}
                    >
                      <IconComp className={`w-6 h-6 mx-auto ${isSelected ? 'text-sky-500' : 'text-slate-400'}`} />
                      <h3 className={`text-xs font-bold ${isSelected ? 'text-sky-600 dark:text-sky-400' : 'dark:text-white text-slate-900'}`}>
                        {m.title}
                      </h3>
                      <p className="text-[11px] dark:text-slate-400 text-slate-600 font-medium leading-relaxed">
                        {m.desc}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Preferred Time Window */}
              <div>
                <label className="block text-xs font-bold dark:text-slate-300 text-slate-700 mb-2">
                  بازه زمانی ترجیحی جهت تماس کارشناس:
                </label>
                <select
                  name="preferredTime"
                  value={formData.preferredTime}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 rounded-2xl dark:bg-slate-900 bg-slate-100 border dark:border-slate-800 border-slate-300 text-xs dark:text-white text-slate-900 focus:outline-none focus:border-brand-500 font-medium"
                >
                  <option value="صبح (۸ الی ۱۲)">صبح (ساعت ۸ الی ۱۲)</option>
                  <option value="عصر (۱۲ الی ۱۷)">عصر (ساعت ۱۲ الی ۱۷)</option>
                  <option value="فرقی نمی‌کند">در اولین فرصت کاری (فرقی نمی‌کند)</option>
                </select>
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-xs font-bold dark:text-slate-300 text-slate-700 mb-2">
                  توضیحات تکمیلی یا ملاحظات خاص (اختیاری):
                </label>
                <textarea
                  name="additionalNotes"
                  rows={2}
                  value={formData.additionalNotes}
                  onChange={handleChange}
                  placeholder="اگر نیازمند ارسال فایل RFP یا توضیحات خاصی هستید در این بخش بنویسید..."
                  className="w-full px-4 py-3.5 rounded-2xl dark:bg-slate-900 bg-slate-100 border dark:border-slate-800 border-slate-300 text-xs dark:text-white text-slate-900 focus:outline-none focus:border-brand-500 font-medium resize-none"
                />
              </div>
            </div>
          )}

          {/* STEP 4: FINAL CONFIRMATION */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="space-y-1 border-b dark:border-slate-800 border-slate-200 pb-4">
                <h2 className="text-lg font-bold dark:text-white text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  مرحله ۴ از ۴: تایید و صدور کد پیگیری
                </h2>
                <p className="text-xs dark:text-slate-400 text-slate-600 font-medium">
                  لطفاً خلاصه‌ای از اطلاعات وارد شده را مرور نموده و درخواست خود را نهایی کنید.
                </p>
              </div>

              {/* Summary Card */}
              <div className="p-6 rounded-2xl dark:bg-slate-900/90 bg-slate-100/90 border dark:border-slate-800 border-slate-200 space-y-4 text-xs font-medium">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b dark:border-slate-800 border-slate-200 pb-4">
                  <div>
                    <span className="text-slate-400 block">متقاضی:</span>
                    <span className="dark:text-white text-slate-900 font-bold">{formData.fullName} ({formData.company || 'شخصی'})</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">شماره تماس:</span>
                    <span className="dark:text-white text-slate-900 font-bold dir-ltr text-right">{formData.phone}</span>
                  </div>
                </div>

                <div className="space-y-2 border-b dark:border-slate-800 border-slate-200 pb-4">
                  <span className="text-slate-400 block">حوزه و موضوع پروژه:</span>
                  <span className="dark:text-brand-400 text-brand-600 font-bold block">{formData.fieldDomain}</span>
                  <p className="dark:text-white text-slate-900 font-semibold">{formData.projectSubject}</p>
                  <p className="dark:text-slate-300 text-slate-600 leading-relaxed">{formData.problemDescription}</p>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span>شیوه مشاوره ترجیحی:</span>
                  <span className="font-bold text-sky-600 dark:text-sky-400">
                    {formData.consultationType === 'phone' ? 'تلفنی' : formData.consultationType === 'online_demo' ? 'دموی آنلاین' : 'جلسه حضوری'} ({formData.preferredTime})
                  </span>
                </div>
              </div>

              {/* Privacy Consent Checkbox */}
              <label className="flex items-start gap-3 p-4 rounded-2xl dark:bg-slate-900/60 bg-slate-100/60 border dark:border-slate-800 border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  name="privacyAgreed"
                  checked={formData.privacyAgreed}
                  onChange={handleChange}
                  className="mt-0.5 w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
                />
                <span className="text-xs dark:text-slate-300 text-slate-700 leading-relaxed font-medium">
                  صحت اطلاعات وارد شده را تایید می‌کنم و موافقت دارم که کارشناسان ANPK جهت هماهنگی جلسه با اینجانب تماس حاصل نمایند.
                </span>
              </label>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="pt-8 border-t dark:border-slate-800 border-slate-200 flex items-center justify-between gap-4">
            {step > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-6 py-3 rounded-xl dark:bg-slate-800 bg-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 dark:text-slate-200 text-slate-800 text-xs font-bold flex items-center gap-2 transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
                <span>مرحله قبل</span>
              </button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 text-white font-black text-xs shadow-lg shadow-brand-600/30 flex items-center gap-2 transition-all hover:-translate-y-0.5"
              >
                <span>ادامه به مرحله بعد</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="px-10 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-xl shadow-emerald-600/30 flex items-center gap-2 transition-all hover:-translate-y-0.5 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>در حال ثبت درخواست...</span>
                  </>
                ) : (
                  <>
                    <Rocket className="w-5 h-5" />
                    <span>تایید نهایی و دریافت کد پیگیری</span>
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
