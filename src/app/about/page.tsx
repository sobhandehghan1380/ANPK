import React from 'react';
import {
  Cpu,
  ShieldCheck,
  Award,
  Users,
  CheckCircle2,
  Rocket,
  Sparkles,
  Layers,
  Activity,
  Lock,
  Globe,
  Server,
  Wrench,
  Bot,
  Laptop,
  GraduationCap,
  Workflow,
  Code2,
  Terminal,
  Building,
  Check
} from 'lucide-react';
import Link from 'next/link';
import { ScrollReveal } from '@/components/ScrollReveal';
import { TiltCard } from '@/components/TiltCard';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'درباره شرکت | ارشیا نگین پردازش کویر',
  description: 'معرفی جامع شرکت ارشیا نگین پردازش کویر، شناسنامه ثبتی رسمی، دپارتمان‌های تخصصی، متدولوژی توسعه و ارزش‌های مهندسی.',
};

export default function AboutPage() {
  const departments = [
    {
      title: 'دپارتمان سلامت دیجیتال و پرونده الکترونیک',
      icon: Activity,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-500/10',
      desc: 'طراحی زیرساخت پرونده سلامت الکترونیک، سامانه مدیریت اطلاعات آزمایشگاهی (LIS)، مدیریت هوشمند کلینیک و پیاده‌سازی کامل استانداردهای HL7 FHIR و ICD-11.'
    },
    {
      title: 'دپارتمان نگهداشت تأسیسات و CMMS (تأسیسات نگار)',
      icon: Wrench,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-500/10',
      desc: 'مکانیزاسیون نگهداری پیشگیرانه (PM) و تعمیرات اضطراری تجهیزات صنعتی و بیمارستانی همراه با شناسه‌گذاری هوشمند QR کد و داشبورد پایش فنی.'
    },
    {
      title: 'دپارتمان هوش مصنوعی و بینایی ماشین',
      icon: Bot,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-500/10',
      desc: 'توسعه موتورهای بینایی ماشین OCR فارسی، مدلسازی هوشمند فرایندهای سازمانی (BPMN) و الگوریتم‌های پیش‌بینی خرابی یا تصمیم‌یار بالینی.'
    },
    {
      title: 'دپارتمان پلتفرم‌های ارتباطی و کلاس مجازی (آیرا)',
      icon: GraduationCap,
      color: 'text-sky-600 dark:text-sky-400',
      bg: 'bg-sky-500/10',
      desc: 'استقرار پلتفرم بومی WebRTC با ترافیک نیم‌بهاء برای برگزاری کلاس‌های آنلاین، وبینارهای سراسری، سمینارهای ملی و مشاوره تصویری از راه دور.'
    },
    {
      title: 'دپارتمان تجارت الکترونیک و توسعه وب (هنرداری)',
      icon: Laptop,
      color: 'text-brand-600 dark:text-brand-400',
      bg: 'bg-brand-500/10',
      desc: 'طراحی سامانه‌های فروشگاهی، پلتفرم‌های بازارگاه (Marketplace)، اتوماسیون سفارش‌گیری و زیرساخت‌های تجارت الکترونیک اختصاصی.'
    },
    {
      title: 'دپارتمان داشبوردهای مدیریتی و هوش کسب‌وکار (BI)',
      icon: Layers,
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-500/10',
      desc: 'تجمیع آنی داده‌های داتابیس‌های پراکنده، نمایش شاخص‌های کلیدی عملکرد (KPI) و داشبوردهای تصویری تصمی‌گیری برای مدیران ارشد.'
    }
  ];

  const engineeringStandards = [
    {
      title: 'معماری ریزسرویس (Microservices)',
      desc: 'طراحی ماژولار سامانه‌ها جهت مقیاس‌پذیری بالا، پایداری ۹۹.۹ درصدی و امکان به‌روزرسانی بخش‌ها بدون قطع خدمت.'
    },
    {
      title: 'امنیت لایه‌ای و OWASP Top 10',
      desc: 'رمزنگاری داده‌ها در انتقال (TLS 1.3) و ذخیره‌سازی (AES-256)، احراز هویت دو مرحله‌ای و پایش حملات سایبری.'
    },
    {
      title: 'توسعه چابک (Agile / Scrum)',
      desc: 'ارائه اسپرینت‌های منظم، گزارش‌دهی فازبندی‌شده، تست خودکار کدها و تحویل بر اساس تعهدات زمانی.'
    },
    {
      title: 'مواقت‌نامه سطح خدمات (SLA ۲۴/۷)',
      desc: 'پایش مداوم زیرساخت سرورها، رفع آنی اختلالات احتمالی و پشتیبانی فنی پاسخگو برای سازمان‌ها.'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20 overflow-x-hidden text-right">
      {/* Hero Header */}
      <ScrollReveal variant="fade-up">
        <div className="text-center space-y-4 max-w-3xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full dark:bg-slate-900/80 bg-white/90 border dark:border-slate-700/60 border-slate-200/90 text-xs font-bold text-brand-600 dark:text-brand-400 backdrop-blur-2xl shadow-sm mx-auto">
            <Cpu className="w-4 h-4 text-brand-500" />
            <span>شناسنامه و هویت مهندسی شرکت</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black dark:text-white text-slate-900 leading-tight">
            درباره <span className="gradient-text-primary">ارشیا نگین پردازش کویر</span>
          </h1>
          <p className="dark:text-slate-300 text-slate-600 text-sm sm:text-base leading-relaxed font-medium">
            شرکت دانش‌بنیان مهندسی نرم‌افزار، طراح و مجری سامانه‌های پیشرفته اختصاصی، سلامت دیجیتال، هوش مصنوعی کاربردی و اتوماسیون صنعتی.
          </p>
        </div>
      </ScrollReveal>

      {/* Bento Stats in About */}
      <ScrollReveal variant="scale">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-right max-w-5xl mx-auto">
          <div className="p-6 rounded-3xl glass-card border-r-4 border-r-brand-500 dark:border-slate-800 border-slate-200 space-y-1 relative overflow-hidden group card-elevated card-shimmer">
            <Activity className="absolute -left-3 -bottom-3 w-20 h-20 text-brand-500/15 pointer-events-none" />
            <div className="relative z-10">
              <span className="block text-3xl sm:text-4xl font-black text-brand-600 dark:text-brand-400">
                <AnimatedCounter end={99.9} decimals={1} suffix="٪" />
              </span>
              <span className="text-xs dark:text-slate-400 text-slate-600 font-bold block mt-1">پایداری SLA خدمات</span>
            </div>
          </div>

          <div className="p-6 rounded-3xl glass-card border-r-4 border-r-accent-500 dark:border-slate-800 border-slate-200 space-y-1 relative overflow-hidden group card-elevated card-shimmer">
            <Layers className="absolute -left-3 -bottom-3 w-20 h-20 text-accent-500/15 pointer-events-none" />
            <div className="relative z-10">
              <span className="block text-3xl sm:text-4xl font-black text-accent-600 dark:text-accent-400">
                <AnimatedCounter end={9} suffix="+" />
              </span>
              <span className="text-xs dark:text-slate-400 text-slate-600 font-bold block mt-1">راهکار تخصصی</span>
            </div>
          </div>

          <div className="p-6 rounded-3xl glass-card border-r-4 border-r-sky-500 dark:border-slate-800 border-slate-200 space-y-1 relative overflow-hidden group card-elevated card-shimmer">
            <Server className="absolute -left-3 -bottom-3 w-20 h-20 text-sky-500/15 pointer-events-none" />
            <div className="relative z-10">
              <span className="block text-3xl sm:text-4xl font-black text-sky-600 dark:text-sky-400">
                <AnimatedCounter end={3} />
              </span>
              <span className="text-xs dark:text-slate-400 text-slate-600 font-bold block mt-1">محصول عملیاتی</span>
            </div>
          </div>

          <div className="p-6 rounded-3xl glass-card border-r-4 border-r-amber-500 dark:border-slate-800 border-slate-200 space-y-1 relative overflow-hidden group card-elevated card-shimmer">
            <Lock className="absolute -left-3 -bottom-3 w-20 h-20 text-amber-500/15 pointer-events-none" />
            <div className="relative z-10">
              <span className="block text-3xl sm:text-4xl font-black text-amber-600 dark:text-amber-400">
                <AnimatedCounter end={100} suffix="٪" />
              </span>
              <span className="text-xs dark:text-slate-400 text-slate-600 font-bold block mt-1">توسعه سفارشی و بومی</span>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Corporate Registration & History Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <ScrollReveal variant="fade-up" delay={100}>
          <TiltCard className="h-full">
            <div className="p-8 rounded-3xl glass-card border dark:border-slate-800 border-slate-200/90 space-y-4 card-elevated card-shimmer h-full relative overflow-hidden">
              <div className="absolute top-0 right-0 left-0 h-[3px] bg-gradient-to-r from-brand-500 to-accent-500 opacity-60" />
              <h2 className="text-2xl font-black dark:text-white text-slate-900 flex items-center gap-2">
                <Award className="w-6 h-6 text-brand-500" />
                شناسنامه و تاریخچه رسمی ثبتی
              </h2>
              <p className="text-xs sm:text-sm dark:text-slate-300 text-slate-600 leading-relaxed font-medium">
                شرکت «ارشیا نگین پردازش کویر» (سهامی خاص) به شماره ثبت ۱۹۲۷۱ و شناسه ملی ۱۴۰۰۹۱۵۱۲۰۷ با مدیریت خانم فاطمه طالبی نصرآبادی تاسیس گردید. این شرکت با هدف پاسخگویی به چالش‌های نرم‌افزاری سازمان‌ها، توسعه پلتفرم‌های ملی نظیر سامانه هنرداری و اجرای پروژه‌های کلان فناوری اطلاعات فعالیت می‌نماید.
              </p>
              <div className="pt-2 text-xs font-mono dark:text-slate-400 text-slate-500 border-t dark:border-slate-800 border-slate-200">
                محل ثبت: استان یزد، شهر یزد، محله خرمشاه | وضعیت: فعال رسمی
              </div>
            </div>
          </TiltCard>
        </ScrollReveal>

        <ScrollReveal variant="fade-up" delay={200}>
          <TiltCard className="h-full">
            <div className="p-8 rounded-3xl glass-card border dark:border-slate-800 border-slate-200/90 space-y-4 card-elevated card-shimmer h-full relative overflow-hidden">
              <div className="absolute top-0 right-0 left-0 h-[3px] bg-gradient-to-r from-accent-500 to-sky-500 opacity-60" />
              <h2 className="text-2xl font-black dark:text-white text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-accent-500" />
                چشم‌انداز و اصول مهندسی
              </h2>
              <p className="text-xs sm:text-sm dark:text-slate-300 text-slate-600 leading-relaxed font-medium">
                استفاده از آخرین استانداردهای جهانی نظیر HL7 FHIR در سلامت، WebRTC بومی در کلاس مجازی، استاندارد OWASP در امنیت، و معماری ریزسرویس برای پایداری ۹۹.۹ درصدی از اصول تخطی‌ناپذیر مهندسی ما در ANPK است.
              </p>
              <div className="pt-2 text-xs font-mono text-emerald-600 dark:text-emerald-400 border-t dark:border-slate-800 border-slate-200 font-bold">
                تعهد به کیفیت، انطباق با نیازمندی‌ها و پشتیبانی مداوم
              </div>
            </div>
          </TiltCard>
        </ScrollReveal>
      </div>

      {/* Engineering Departments Section */}
      <div className="space-y-10">
        <ScrollReveal variant="fade-up">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest bg-brand-500/10 px-3 py-1.5 rounded-full border border-brand-500/20">
              دپارتمان‌های تخصص و حوزه خدمات
            </span>
            <h2 className="text-2xl sm:text-3xl font-black dark:text-white text-slate-900">
              ساختار دپارتمان‌های مهندسی ANPK
            </h2>
            <p className="text-xs sm:text-sm dark:text-slate-400 text-slate-600 font-medium">
              مجموعه تیم‌های تخصصی نرم‌افزاری که پروژه‌ها و محصولات شرکت را بر اساس آخرین متدولوژی‌های روز توسعه می‌دهند.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {departments.map((dept, idx) => {
            const IconComp = dept.icon;

            return (
              <ScrollReveal key={idx} variant="fade-up" delay={idx * 100}>
                <TiltCard className="h-full">
                  <div className="p-7 rounded-3xl glass-card border dark:border-slate-800 border-slate-200/90 space-y-4 card-elevated card-shimmer h-full relative overflow-hidden flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className={`w-12 h-12 rounded-2xl ${dept.bg} ${dept.color} border border-current/20 flex items-center justify-center icon-glow`}>
                        <IconComp className="w-6 h-6" />
                      </div>
                      <h3 className="text-base font-bold dark:text-white text-slate-900 leading-snug">
                        {dept.title}
                      </h3>
                      <p className="text-xs dark:text-slate-400 text-slate-600 leading-relaxed font-medium">
                        {dept.desc}
                      </p>
                    </div>
                  </div>
                </TiltCard>
              </ScrollReveal>
            );
          })}
        </div>
      </div>

      {/* Engineering Standards & Methodology */}
      <div className="space-y-10">
        <ScrollReveal variant="fade-up">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-widest bg-sky-500/10 px-3 py-1.5 rounded-full border border-sky-500/20">
              توسعه نرم‌افزار با کیفیت صنعتی
            </span>
            <h2 className="text-2xl sm:text-3xl font-black dark:text-white text-slate-900">
              استانداردهای مهندسی و متدولوژی ANPK
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {engineeringStandards.map((std, idx) => (
            <ScrollReveal key={idx} variant="fade-up" delay={idx * 100}>
              <div className="p-6 rounded-3xl glass-card border dark:border-slate-800 border-slate-200/90 space-y-3 card-elevated card-shimmer h-full">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center font-bold text-sm">
                  0{idx + 1}
                </div>
                <h3 className="text-sm font-bold dark:text-white text-slate-900">{std.title}</h3>
                <p className="text-xs dark:text-slate-400 text-slate-600 leading-relaxed font-medium">{std.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>

      {/* Core Values */}
      <div className="space-y-8">
        <ScrollReveal variant="fade-up">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">تعهد و مسئولیت‌پذیری</span>
            <h2 className="text-2xl sm:text-3xl font-black dark:text-white text-slate-900">ارزش‌های کلیدی سازمانی ما</h2>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: 'شفافیت کامل در تحویل', desc: 'ارائه گزارش‌های فازبندی‌شده، داکیومنت‌ها و راهنمای کاربری جامع.' },
            { title: 'عدم نمایش آمار ساختگی', desc: 'تمام آمارها، کدهای پیگیری و قابلیت‌های اعلام‌شده کاملاً واقعی و مبتنی بر عمل‌اند.' },
            { title: 'پشتیبانی و SLA سازمانی', desc: 'تعهد به پاسخگویی، پایش پایداری سرورها و گارانتی کارکرد نرم‌افزار.' },
            { title: 'امنیت و حفظ حریم داده', desc: 'رمزنگاری داده‌ها در انتقال و ذخیره‌سازی طبق قوانین حریم خصوصی.' },
          ].map((val, idx) => (
            <ScrollReveal key={idx} variant="fade-up" delay={idx * 100}>
              <div className="p-6 rounded-2xl glass-card border dark:border-slate-800 border-slate-200/90 space-y-3 card-elevated card-shimmer h-full">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                <h3 className="text-base font-bold dark:text-white text-slate-900">{val.title}</h3>
                <p className="text-xs dark:text-slate-400 text-slate-600 leading-relaxed font-medium">{val.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>

      {/* CTA */}
      <ScrollReveal variant="scale">
        <div className="p-8 sm:p-12 rounded-3xl mesh-gradient-bg text-center space-y-6 relative overflow-hidden shadow-xl text-white">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-900/90 via-slate-900/95 to-slate-950/90"></div>
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="text-2xl sm:text-3xl font-black text-white">تمایل به همکاری با تیم ارشیا نگین پردازش دارید؟</h2>
            <p className="text-xs sm:text-sm text-slate-300 font-medium">
              کارشناسان ارشیا نگین پردازش کویر آماده مشاوره تخصصی و عارضه‌یابی رایگان فرایندهای سازمان شما هستند.
            </p>
            <Link
              href="/start-project"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-brand-900 hover:bg-slate-100 font-black text-sm shadow-xl hover:-translate-y-0.5 transition-all group"
            >
              <Rocket className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span>ارسال درخواست پروژه در فرم ۴ مرحله‌ای</span>
            </Link>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
