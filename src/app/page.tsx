import React from 'react';
import Link from 'next/link';
import {
  Rocket,
  ShieldCheck,
  Cpu,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  Layers,
  Package,
  FolderGit2,
  FileText,
  Activity,
  GraduationCap,
  Wrench,
  Bot,
  Laptop,
  Clock,
  ExternalLink,
  Building2,
  Globe
} from 'lucide-react';

import { getProducts, getSolutions, getProjects, getArticles, getHeroData } from '@/lib/data';
import { ProductBadge } from '@/components/ProductBadge';
import { ScrollReveal } from '@/components/ScrollReveal';
import { TiltCard } from '@/components/TiltCard';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { TypewriterText } from '@/components/TypewriterText';

export default async function HomePage() {
  const [products, solutions, projects, articles, heroData] = await Promise.all([
    getProducts(false),
    getSolutions(),
    getProjects(),
    getArticles(),
    getHeroData(),
  ]);

  const dynamicItems = heroData?.dynamicItems && heroData.dynamicItems.length > 0
    ? heroData.dynamicItems
    : [
        { text: 'هوش مصنوعی و سلامت', colorClass: 'gradient-text-primary' },
        { text: 'اتوماسیون بیمارستانی', colorClass: 'gradient-text-accent' },
        { text: 'سامانه‌های چابک سازمانی', colorClass: 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent' },
        { text: 'داشبوردهای هوشمند BI', colorClass: 'bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent' },
      ];

  const badgeText = heroData?.badgeText || 'پیشرو در توسعه پلتفرم‌های سازمانی';
  const mainTitleStatic = heroData?.mainTitleStatic || 'معماری سامانه‌های اختصاصی،';
  const subDescription = heroData?.subDescription || 'شرکت «ارشیا نگین پردازش کویر» طراح و مجری سامانه‌های مایکروپروسس بومی برای دانشگاه‌ها، بیمارستان‌ها و سازمان‌های بزرگ کشور با پایداری ۹۹.۹٪ و ارائه مستندات کامل فنی.';
  const primaryButtonText = heroData?.primaryButtonText || 'ثبت درخواست پروژه (فرم ۴ مرحله‌ای)';
  const secondaryButtonText = heroData?.secondaryButtonText || 'محصولات نرم‌افزاری';

  return (
    <div className="space-y-20 pb-20 overflow-x-hidden">
      {/* HERO SECTION: Dramatic & Immersive */}
      <section className="relative pt-16 pb-24 md:pt-24 md:pb-28 text-center mesh-gradient-bg">
        {/* Animated Orbs */}
        <div className="absolute inset-0 noise-overlay opacity-30 pointer-events-none"></div>
        <div className="absolute top-1/4 right-1/4 w-[280px] h-[280px] bg-brand-500/20 rounded-full blur-[120px] float-orb pointer-events-none"></div>
        <div className="absolute bottom-1/4 left-1/4 w-[250px] h-[250px] bg-accent-500/20 rounded-full blur-[100px] float-orb-delayed pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 w-[320px] h-[320px] bg-indigo-500/15 rounded-full blur-[130px] float-orb-slow pointer-events-none"></div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
          {/* Badge */}
          <ScrollReveal variant="fade-down">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full dark:bg-slate-900/80 bg-white/90 border dark:border-slate-700/60 border-slate-200/90 text-[11px] sm:text-xs font-bold dark:text-slate-200 text-slate-800 backdrop-blur-2xl shadow-sm mx-auto max-w-full">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <Sparkles className="w-3.5 h-3.5 text-accent-500 shrink-0" />
              <span className="truncate">
                {badgeText}
              </span>
            </div>
          </ScrollReveal>

          {/* Title - Bold, Grand & Impressively Large */}
          <ScrollReveal variant="fade-up" delay={150}>
            <h1 className="flex flex-col gap-2 sm:gap-3 font-black dark:text-white text-slate-900 leading-tight tracking-tight hero-glow-title">
              <span className="text-3xl sm:text-5xl lg:text-7xl font-black">{mainTitleStatic}</span>
              <span className="text-3xl sm:text-5xl lg:text-7xl font-black min-h-[1.25em]">
                <TypewriterText items={dynamicItems} />
              </span>
            </h1>
          </ScrollReveal>

          <ScrollReveal variant="fade-up" delay={300}>
            <p className="text-base sm:text-lg dark:text-slate-300 text-slate-600 leading-relaxed font-medium max-w-3xl mx-auto">
              {subDescription}
            </p>
          </ScrollReveal>

          <ScrollReveal variant="fade-up" delay={400}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/start-project"
                className="gradient-border w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 via-brand-500 to-accent-600 hover:from-brand-500 hover:to-accent-500 text-white font-black text-sm shadow-xl shadow-brand-600/25 hover:shadow-brand-600/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                <Rocket className="w-5 h-5 group-hover:rotate-12 transition-transform relative z-10" />
                <span className="relative z-10">{primaryButtonText}</span>
              </Link>

              <Link
                href="/products"
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl dark:bg-slate-900/90 bg-white/90 border dark:border-slate-700/80 border-slate-200/90 hover:border-brand-500/50 dark:text-slate-200 text-slate-800 font-bold text-sm backdrop-blur-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
              >
                <Package className="w-5 h-5 text-brand-500 group-hover:scale-110 transition-transform" />
                <span>{secondaryButtonText}</span>
              </Link>
            </div>
          </ScrollReveal>

          {/* Stats Bento Grid - 4 Uniform Cards in 2x2 Mobile Grid */}
          <ScrollReveal variant="scale" delay={500}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-10 text-right max-w-4xl mx-auto">
              {/* Card 1: 99.9% Uptime */}
              <div className="p-4 rounded-2xl glass-card border-r-4 border-r-brand-500 dark:border-slate-800 border-slate-200 space-y-1 relative overflow-hidden group transition-all card-elevated flex flex-col justify-center bg-gradient-to-br from-brand-500/5 to-transparent">
                <Activity className="absolute -left-3 -bottom-3 w-20 h-20 text-brand-500/15 pointer-events-none" />
                <div className="relative z-10">
                  <span className="block text-2xl sm:text-3xl font-black text-brand-600 dark:text-brand-400">
                    <AnimatedCounter end={99.9} decimals={1} suffix="٪" />
                  </span>
                  <span className="text-[11px] dark:text-slate-400 text-slate-600 font-bold block mt-1">پایداری خدمات و SLA</span>
                </div>
              </div>

              {/* Card 2: 9+ Solutions */}
              <div className="p-4 rounded-2xl glass-card border-r-4 border-r-accent-500 dark:border-slate-800 border-slate-200 space-y-1 relative overflow-hidden group transition-all card-elevated flex flex-col justify-center">
                <Layers className="absolute -left-3 -bottom-3 w-20 h-20 text-accent-500/15 pointer-events-none" />
                <div className="relative z-10">
                  <span className="block text-2xl sm:text-3xl font-black text-accent-600 dark:text-accent-400">
                    <AnimatedCounter end={9} suffix="+" />
                  </span>
                  <span className="text-[11px] dark:text-slate-400 text-slate-600 font-bold block mt-1">راهکار تخصصی</span>
                </div>
              </div>

              {/* Card 3: 3 Products */}
              <div className="p-4 rounded-2xl glass-card border-r-4 border-r-sky-500 dark:border-slate-800 border-slate-200 space-y-1 relative overflow-hidden group transition-all card-elevated flex flex-col justify-center">
                <Package className="absolute -left-3 -bottom-3 w-20 h-20 text-sky-500/15 pointer-events-none" />
                <div className="relative z-10">
                  <span className="block text-2xl sm:text-3xl font-black text-sky-600 dark:text-sky-400">
                    <AnimatedCounter end={3} />
                  </span>
                  <span className="text-[11px] dark:text-slate-400 text-slate-600 font-bold block mt-1">محصول عملیاتی</span>
                </div>
              </div>

              {/* Card 4: 100% Native */}
              <div className="p-4 rounded-2xl glass-card border-r-4 border-r-amber-500 dark:border-slate-800 border-slate-200 space-y-1 relative overflow-hidden group transition-all card-elevated flex flex-col justify-center">
                <FolderGit2 className="absolute -left-3 -bottom-3 w-20 h-20 text-amber-500/15 pointer-events-none" />
                <div className="relative z-10">
                  <span className="block text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
                    <AnimatedCounter end={100} suffix="٪" />
                  </span>
                  <span className="text-[11px] dark:text-slate-400 text-slate-600 font-bold block mt-1">توسعه سفارشی و بومی</span>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* CORE FIELDS: Asymmetric Layout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <ScrollReveal variant="fade-up">
          <div className="space-y-2">
            <div className="inline-block relative">
              <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest bg-brand-500/10 px-3 py-1.5 rounded-full border border-brand-500/20">دانش فنی و زیرساخت‌های مهندسی</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black dark:text-white text-slate-900 leading-tight">تخصص‌های فنی <span className="text-slate-400 dark:text-slate-500 font-normal">ارشیا نگین پردازش</span></h2>
            <p className="text-xs sm:text-sm dark:text-slate-400 text-slate-600 font-medium max-w-2xl">تکنولوژی‌ها و هسته دانش مهندسی که سامانه‌ها و پلتفرم‌های ما بر پایه آن‌ها معماری می‌شوند.</p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative">
          {/* Left Column: 2 Large Featured Cards */}
          <div className="lg:col-span-5 space-y-6">
            {[
              {
                title: 'سلامت دیجیتال و اتوماسیون پزشکی',
                desc: 'یکپارچه‌سازی جامع پرونده سلامت الکترونیک (EHR)، سیستم مدیریت اطلاعات آزمایشگاه (LIS)، مدیریت هوشمند کلینیک و پیاده‌سازی کامل استانداردهای تبادل داده HL7.',
                icon: Activity,
                color: 'text-brand-600 dark:text-brand-400',
                bg: 'bg-brand-500/10',
              },
              {
                title: 'سامانه‌های سفارشی سازمانی',
                desc: 'معماری ریزسرویس (Microservices) پیشرفته برای پاسخگویی به پیچیده‌ترین الزامات کسب‌وکار، با مقیاس‌پذیری بالا و پایداری تضمین‌شده در ترافیک انبوه.',
                icon: Laptop,
                color: 'text-indigo-600 dark:text-indigo-400',
                bg: 'bg-indigo-500/10',
              }
            ].map((item, idx) => (
              <ScrollReveal key={idx} variant="fade-up" delay={idx * 100}>
                <div className="p-6 rounded-2xl glass-card border dark:border-slate-800 border-slate-200/90 h-full flex flex-col justify-between group relative overflow-hidden card-elevated card-shimmer">
                  <div className={`absolute top-0 right-0 w-32 h-32 ${item.bg} blur-[60px] rounded-full group-hover:scale-150 transition-transform duration-700`}></div>
                  <div className="relative z-10 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`w-11 h-11 rounded-xl ${item.bg} flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform duration-300 icon-glow`}>
                        <item.icon className="w-5 h-5" />
                      </div>
                      <span className="text-xl font-black text-slate-300 dark:text-slate-800">
                        {['۰۱', '۰۲'][idx]}
                      </span>
                    </div>
                    <h3 className="text-base font-bold dark:text-white text-slate-900 group-hover:text-brand-500 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs dark:text-slate-400 text-slate-600 leading-relaxed font-medium">{item.desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* Right Column: 4 Smaller Cards Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
             {[
              {
                title: 'مدیریت نگهداشت (CMMS)',
                desc: 'پایش تجهیزات، کدهای QR و دستورکارهای (PM).',
                icon: Wrench,
                color: 'text-emerald-600 dark:text-emerald-400',
                bg: 'bg-emerald-500/10',
                num: '۰۳'
              },
              {
                title: 'کلاس مجازی',
                desc: 'پلتفرم‌های تعاملی بومی، ویدیو کم‌حجم WebRTC.',
                icon: GraduationCap,
                color: 'text-sky-600 dark:text-sky-400',
                bg: 'bg-sky-500/10',
                num: '۰۴'
              },
              {
                title: 'هوش مصنوعی',
                desc: 'مدل‌سازی BPMN 2.0، بینایی ماشین و OCR فارسی.',
                icon: Bot,
                color: 'text-amber-600 dark:text-amber-400',
                bg: 'bg-amber-500/10',
                num: '۰۵'
              },
              {
                title: 'داشبوردهای BI',
                desc: 'تجمیع داده‌ها و ارائه شاخص‌های KPI در لحظه.',
                icon: Layers,
                color: 'text-purple-600 dark:text-purple-400',
                bg: 'bg-purple-500/10',
                num: '۰۶'
              }
            ].map((item, idx) => (
              <ScrollReveal key={idx} variant="fade-up" delay={(idx + 2) * 100}>
                <div className="p-5 rounded-2xl glass-card border dark:border-slate-800 border-slate-200/90 h-full flex flex-col justify-between group relative overflow-hidden card-elevated card-shimmer">
                   <div className="space-y-3 relative z-10">
                    <div className="flex items-center justify-between">
                      <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform duration-300 icon-glow`}>
                        <item.icon className="w-5 h-5" />
                      </div>
                      <span className="text-base font-black text-slate-300 dark:text-slate-800">
                        {item.num}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold dark:text-white text-slate-900 group-hover:text-brand-500 transition-colors mb-1">
                        {item.title}
                      </h3>
                      <p className="text-xs dark:text-slate-400 text-slate-600 leading-relaxed font-medium">{item.desc}</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* SOLUTIONS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <ScrollReveal variant="fade-up">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b dark:border-slate-800 border-slate-200/80 pb-5">
            <div className="space-y-2">
              <span className="text-xs font-bold text-accent-600 dark:text-accent-400 uppercase tracking-widest bg-accent-500/10 px-3 py-1.5 rounded-full border border-accent-500/20">سامانه‌های آماده استقرار</span>
              <h2 className="text-2xl sm:text-3xl font-black dark:text-white text-slate-900">راهکارهای عملیاتی سازمان‌ها</h2>
              <p className="text-xs sm:text-sm dark:text-slate-400 text-slate-600 font-medium max-w-xl">پاسخ‌های آماده نرم‌افزاری برای تحول دیجیتال بیمارستان‌ها، دانشگاه‌ها و صنایع بزرگ.</p>
            </div>
            <Link
              href="/solutions"
              className="text-sm font-bold text-accent-600 dark:text-accent-400 hover:text-accent-500 flex items-center gap-1.5 transition-colors group link-underline"
            >
              <span>مشاهده تمامی ۹ راهکار</span>
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </Link>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {solutions.slice(0, 5).map((sol: any, idx: number) => {
            const isFeatured = idx === 0;
            return (
              <ScrollReveal key={sol.id} variant="fade-up" delay={idx * 100} className={isFeatured ? "md:col-span-2 lg:col-span-2" : ""}>
                <TiltCard className="h-full">
                  <Link
                    href={`/solutions/${sol.slug}`}
                    className={`rounded-2xl glass-card border dark:border-slate-800 border-slate-200/90 flex flex-col justify-between group h-full block transition-all duration-400 relative overflow-hidden card-shimmer card-elevated ${isFeatured ? 'p-7 bg-gradient-to-br from-brand-500/5 to-transparent' : 'p-6'}`}
                  >
                    <div className="space-y-4 relative z-10">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono text-brand-600 dark:text-brand-400 bg-brand-500/10 px-2.5 py-1 rounded-lg border border-brand-500/20 font-bold tracking-wider">
                          {isFeatured ? 'راهکار ویژه' : 'راهکار تخصصی'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">ANPK-SOL</span>
                      </div>

                      <h3 className={`${isFeatured ? 'text-xl' : 'text-base'} font-bold dark:text-white text-slate-900 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors`}>
                        {sol.title}
                      </h3>
                      <p className={`dark:text-slate-400 text-slate-600 leading-relaxed font-medium ${isFeatured ? 'text-sm line-clamp-3' : 'text-xs line-clamp-2'}`}>
                        {sol.subtitle}
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t dark:border-slate-800/80 border-slate-200/80 flex items-center justify-between text-xs font-bold dark:text-slate-300 text-slate-700 group-hover:text-brand-600 dark:group-hover:text-brand-400 relative z-10">
                      <span>مشاهده جزئیات کامل</span>
                      <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-brand-500 group-hover:text-white flex items-center justify-center transition-all">
                        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </TiltCard>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      {/* PRODUCTS SHOWCASE */}
      <section className="dark:bg-slate-900/30 bg-slate-50/80 border-y dark:border-slate-800/50 border-slate-200/60 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <ScrollReveal variant="fade-up">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b dark:border-slate-800 border-slate-200/80">
              <div className="space-y-2">
                <span className="text-xs font-bold text-accent-600 dark:text-accent-400 uppercase tracking-widest">سبد محصولات نرم‌افزاری</span>
                <h2 className="text-2xl sm:text-3xl font-black dark:text-white text-slate-900">محصولات نرم‌افزاری شرکت</h2>
              </div>
              <Link
                href="/products"
                className="text-sm font-bold text-accent-600 dark:text-accent-400 hover:text-accent-500 flex items-center gap-1.5 transition-colors group link-underline"
              >
                <span>مشاهده همه محصولات</span>
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              </Link>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {products.map((prod: any, idx: number) => {
              // Image Logos for Products
              const prodImages = [
                '/images/bg/prod_aira.jpg',
                '/images/bg/prod_tasisat.jpg',
                '/images/bg/prod_nikilink.jpg',
              ];
              const logoImg = prod.image_url || prodImages[idx % prodImages.length];

              return (
                <ScrollReveal key={prod.id} variant="fade-up" delay={idx * 100}>
                  <TiltCard className="h-full">
                    <div className="p-6 rounded-2xl glass-card border dark:border-slate-800 border-slate-200/90 flex flex-col justify-between space-y-5 relative overflow-hidden group card-elevated card-shimmer h-full">
                      {/* Top Accent Line */}
                      <div className="absolute top-0 right-0 left-0 h-[3px] bg-gradient-to-r from-accent-500 via-brand-500 to-sky-500 opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      <div className="space-y-4 relative z-10">
                        {/* Header: Image Logo Container + Status & Delivery */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="relative w-12 h-12 rounded-xl overflow-hidden border dark:border-slate-700 border-slate-200 shadow-sm shrink-0 group-hover:scale-105 transition-transform duration-300">
                              <img src={logoImg} alt={prod.title} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <ProductBadge status={prod.status} isPublic={prod.isPublic} />
                              <span className="block text-[10px] font-mono text-slate-400 mt-0.5">{prod.deliveryModel}</span>
                            </div>
                          </div>

                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                            PROD-0{idx + 1}
                          </span>
                        </div>

                        {/* Title + Tagline */}
                        <div>
                          <h3 className="text-lg font-bold dark:text-white text-slate-900 group-hover:text-accent-600 dark:group-hover:text-accent-400 transition-colors leading-tight">
                            {prod.title}
                          </h3>
                          <p className="text-xs font-bold text-brand-600 dark:text-brand-400 mt-1">{prod.tagline}</p>
                        </div>

                        {/* Description */}
                        <p className="text-xs dark:text-slate-400 text-slate-600 leading-relaxed font-medium line-clamp-2">{prod.description}</p>

                        {/* Features */}
                        <div className="space-y-2 pt-3 border-t dark:border-slate-800 border-slate-200/80">
                          <span className="text-[11px] font-bold dark:text-slate-300 text-slate-700 block">قابلیت‌های اصلی:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {prod.features.slice(0, 3).map((feat: string, fIdx: number) => (
                              <span key={fIdx} className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md dark:bg-slate-800 bg-slate-100 dark:text-slate-300 text-slate-700 font-medium border dark:border-slate-700 border-slate-200">
                                <CheckCircle2 className="w-3 h-3 text-accent-500 shrink-0" />
                                {feat}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* CTA */}
                      <Link
                        href={`/products/${prod.slug}`}
                        className="w-full py-2.5 rounded-xl dark:bg-slate-800 bg-slate-100 hover:bg-accent-600 text-slate-700 dark:text-slate-300 hover:text-white font-bold text-xs transition-all flex items-center justify-center gap-2 group-hover:bg-accent-600 group-hover:text-white relative z-10 shadow-sm"
                      >
                        <span>مشاهده جزئیات محصول</span>
                        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </TiltCard>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* PROJECTS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <ScrollReveal variant="fade-up">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b dark:border-slate-800 border-slate-200/80 pb-5">
            <div className="space-y-2">
              <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-widest">پروژه‌های اجرایی و سامانه‌های پیاده‌شده</span>
              <h2 className="text-2xl sm:text-3xl font-black dark:text-white text-slate-900 mt-1">پروژه‌های منتخب و سامانه‌های عملیاتی</h2>
              <p className="text-xs sm:text-sm dark:text-slate-400 text-slate-600 font-medium max-w-xl">نمایش سامانه‌های آنلاین و پروژه‌های تحویل‌شده به دانشگاه‌ها، بیمارستان‌ها و صنایع بزرگ.</p>
            </div>
            <Link
              href="/projects"
              className="text-sm font-bold text-sky-600 dark:text-sky-400 hover:text-sky-500 flex items-center gap-1.5 transition-colors group link-underline"
            >
              <span>مشاهده همه پروژه‌ها</span>
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </Link>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj: any, idx: number) => {
            // Client Image Logos
            const projImages = [
              '/images/bg/proj_his.jpg',
              '/images/bg/proj_lms.jpg',
              '/images/bg/proj_telemed.jpg',
            ];
            const projLogoImg = projImages[idx % projImages.length];

            return (
              <ScrollReveal key={proj.id} variant="fade-up" delay={idx * 100}>
                <TiltCard className="h-full">
                  <div className="p-6 rounded-2xl glass-card border dark:border-slate-800 border-slate-200/90 flex flex-col justify-between space-y-4 group h-full card-elevated card-shimmer relative overflow-hidden">
                    {/* Top Accent */}
                    <div className="absolute top-0 right-0 left-0 h-[3px] bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500 opacity-50 group-hover:opacity-100 transition-opacity duration-300" />

                    <div className="space-y-4 relative z-10">
                      {/* Client Image Logo Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border dark:border-slate-700 border-slate-200/90 shadow-md shrink-0 group-hover:scale-105 transition-transform duration-300 p-1 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md">
                            <img src={projLogoImg} alt={proj.clientName} className="w-full h-full object-cover rounded-xl" />
                          </div>
                          <div>
                            <span className="text-xs sm:text-sm font-bold dark:text-white text-slate-900 block leading-snug">{proj.clientName}</span>
                            <span className="text-[11px] text-sky-600 dark:text-sky-400 font-mono font-bold block mt-1">{proj.domain}</span>
                          </div>
                        </div>

                        {/* Live Site Badge */}
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20 shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                          تحویل شده
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-base font-bold dark:text-white text-slate-900 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors leading-snug">
                        {proj.title}
                      </h3>

                      {/* Summary */}
                      <p className="text-xs dark:text-slate-400 text-slate-600 leading-relaxed font-medium line-clamp-2">{proj.summary}</p>
                    </div>

                    {/* Results */}
                      {proj.results && Array.isArray(proj.results) && proj.results.length > 0 && (
                        <div className="pt-3 border-t dark:border-slate-800/80 border-slate-200/80 space-y-2 relative z-10">
                          <span className="text-[11px] font-bold dark:text-slate-300 text-slate-700 block">دستاوردهای لایو سامانه:</span>
                          {proj.results.slice(0, 2).map((res: string, rIdx: number) => (
                            <p key={rIdx} className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-start gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                              <span className="leading-relaxed">{res}</span>
                            </p>
                          ))}
                        </div>
                      )}

                    {/* Deployed Site Link */}
                    <div className="pt-2 relative z-10 flex items-center justify-between gap-2">
                      <Link
                        href={`/projects/${proj.slug}`}
                        className="w-full py-2.5 rounded-xl dark:bg-slate-800 bg-slate-100 hover:bg-sky-600 text-slate-700 dark:text-slate-300 hover:text-white font-bold text-xs transition-all flex items-center justify-center gap-2 group-hover:bg-sky-600 group-hover:text-white shadow-sm"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>مشاهده سامانه و اطلاعات پروژه</span>
                        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </TiltCard>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      {/* PROCESS/STEPS SECTION */}
      <section className="relative py-16 overflow-hidden">
        {/* Subtle animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-900/5 via-accent-900/5 to-sky-900/5 dark:from-brand-900/20 dark:via-accent-900/20 dark:to-sky-900/20 animate-gradient-x -z-10"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <ScrollReveal variant="fade-up">
            <div className="text-center space-y-3">
              <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest px-3 py-1.5 rounded-full border border-brand-500/20 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md inline-block">متدولوژی و شفافیت</span>
              <h2 className="text-2xl sm:text-3xl font-black dark:text-white text-slate-900">روش همکاری <span className="text-brand-500">مبتنی بر چابکی</span></h2>
              <p className="text-xs sm:text-sm dark:text-slate-400 text-slate-600 max-w-xl mx-auto font-medium">
                فرایند ۴ گام شفاف از عارضه‌یابی تا تحویل کامل سورس‌کد و پشتیبانی فنی سازمانی.
              </p>
            </div>
          </ScrollReveal>

          <div className="relative">
             {/* Horizontal Animated Connector */}
             <div className="hidden md:block absolute top-10 left-0 right-0 h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mx-16">
                <div className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-brand-500 via-accent-500 to-sky-500 origin-left animate-[scaleX_3s_infinite_alternate]"></div>
             </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
              {[
                {
                  step: '۱',
                  title: 'شناخت و عارضه‌یابی',
                  desc: 'تحلیل دقیق فرایند فعلی سازمان، مصاحبه با ذینفعان و تدوین سند شفاف نیازمندی‌ها.',
                  color: 'from-brand-500 to-brand-600'
                },
                {
                  step: '۲',
                  title: 'معماری و پروپوزال',
                  desc: 'انتخاب پلتفرم مناسب، تدوین مدل امنیت داده، زمان‌بندی دقیق و شفافیت مالی.',
                  color: 'from-accent-500 to-accent-600'
                },
                {
                  step: '۳',
                  title: 'توسعه و تحویل فازبندی',
                  desc: 'توسعه به روش Agile با تست‌های نفوذپذیری، استقرار آزمایشی و آموزش کاربران.',
                  color: 'from-sky-500 to-sky-600'
                },
                {
                  step: '۴',
                  title: 'استقرار و SLA',
                  desc: 'تحویل کامل داکیومنت‌ها، پایش مداوم پایداری سرورها و پشتیبانی ۲۴/۷ سازمانی.',
                  color: 'from-emerald-500 to-emerald-600'
                },
              ].map((st, idx) => (
                <ScrollReveal key={idx} variant="fade-up" delay={idx * 150} className="relative">
                  <div className="flex flex-col items-center text-center space-y-4">
                    {/* Floating Number Badge */}
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${st.color} text-white font-black text-xl flex items-center justify-center shadow-md transform hover:-translate-y-0.5 transition-transform duration-300 relative`}>
                      {st.step}
                    </div>
                    
                    <div className="p-5 rounded-2xl glass-card border dark:border-slate-800 border-slate-200/90 backdrop-blur-xl w-full hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-sm">
                       <h3 className="text-sm font-bold dark:text-white text-slate-900 mb-2">{st.title}</h3>
                       <p className="text-xs dark:text-slate-400 text-slate-600 leading-relaxed font-medium">{st.desc}</p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ARTICLES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <ScrollReveal variant="fade-up">
           <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b dark:border-slate-800 border-slate-200/80">
            <div className="space-y-2">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20">دانش فنی و توسعه</span>
              <h2 className="text-2xl sm:text-3xl font-black dark:text-white text-slate-900">جدیدترین مقالات تخصصی</h2>
            </div>
            <Link
              href="/articles"
              className="px-5 py-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-amber-500 hover:text-white flex items-center gap-2 transition-all group shadow-sm"
            >
              <span>آرشیو کامل مقالات</span>
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            </Link>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.map((art: any, idx: number) => {
            const isFeatured = idx === 0;
            // Article Cover Images
            const articleImages = [
              '/images/bg/health_tech.jpg',
              '/images/bg/prod_aira.jpg',
              '/images/bg/ai_network.jpg',
            ];
            const coverImg = articleImages[idx % articleImages.length];

            return (
              <ScrollReveal key={art.id} variant="fade-up" delay={idx * 150} className={isFeatured ? "md:col-span-2" : ""}>
                <TiltCard className="h-full">
                  <Link
                    href={`/articles/${art.slug}`}
                    className={`rounded-2xl glass-card border dark:border-slate-800 border-slate-200/90 group flex flex-col justify-between h-full block hover:border-amber-500/60 transition-all duration-400 relative overflow-hidden shadow-sm hover:shadow-md card-shimmer ${isFeatured ? 'p-0' : 'p-0'}`}
                  >
                    {/* Article Cover Image Container */}
                    <div className={`relative w-full ${isFeatured ? 'h-48 sm:h-56' : 'h-40'} overflow-hidden border-b dark:border-slate-800 border-slate-200`}>
                      <img
                        src={coverImg}
                        alt={art.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent"></div>
                      
                      {/* Floating Category Badge over Image */}
                      <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between z-10">
                        <span className="px-3 py-1 rounded-lg bg-amber-500/90 text-white font-bold text-[11px] backdrop-blur-md shadow-md">
                          {art.category}
                        </span>

                        <span className="flex items-center gap-1 text-[11px] font-bold text-white bg-black/40 px-2.5 py-1 rounded-lg backdrop-blur-md border border-white/10">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          {art.readTime}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 space-y-3 relative z-10 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <h3 className={`${isFeatured ? 'text-lg sm:text-xl' : 'text-base'} font-bold dark:text-white text-slate-900 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors leading-snug`}>
                          {art.title}
                        </h3>
                        <p className={`dark:text-slate-400 text-slate-600 leading-relaxed font-medium ${isFeatured ? 'text-sm line-clamp-3' : 'text-xs line-clamp-2'}`}>
                          {art.excerpt}
                        </p>
                      </div>

                      <div className="pt-3 border-t dark:border-slate-800/80 border-slate-200/80 flex items-center justify-between text-xs dark:text-slate-400 text-slate-600 group-hover:text-amber-600 dark:group-hover:text-amber-400 font-bold">
                        <span>مطالعه مقاله تخصصی</span>
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </TiltCard>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      {/* FINAL PROJECT CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal variant="scale">
          <div className="relative rounded-3xl p-8 sm:p-12 overflow-hidden shadow-xl text-white mesh-gradient-bg">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-900/90 via-slate-900/95 to-slate-950/90 dark:from-brand-950 dark:via-slate-900 dark:to-slate-950"></div>
            <div className="absolute inset-0 noise-overlay opacity-40 mix-blend-overlay"></div>
            
            {/* Floating Orbs in CTA */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/25 rounded-full blur-[100px] float-orb pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-accent-500/20 rounded-full blur-[80px] float-orb-delayed pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
               <div className="max-w-2xl space-y-4 text-right flex-1">
                 <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-white text-xs font-bold border border-white/20 backdrop-blur-xl">
                   <Rocket className="w-4 h-4 text-accent-400" />
                   آماده شروع تحول دیجیتال سازمان خود هستید؟
                 </span>

                 <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                   درخواست خود را در فرم ۴ مرحله‌ای ثبت کنید
                 </h2>

                 <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                   تیم مهندسی ارشیا نگین پردازش کویر ظرف حداکثر ۲۴ ساعت کاری پس از بررسی مسئله و زیرساخت، با شما تماس گرفته و پروپوزال فنی را ارائه خواهد کرد.
                 </p>
               </div>

               <div className="w-full md:w-auto flex flex-col gap-3">
                 <Link
                    href="/start-project"
                    className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white text-brand-900 hover:bg-slate-100 font-black text-xs shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group"
                 >
                   <span>ورود به فرم شروع پروژه</span>
                   <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                 </Link>
                 <Link
                   href="/contact"
                    className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 font-bold text-xs text-center transition-all backdrop-blur-xl hover:border-white/20"
                 >
                   ارتباط مستقیم با کارشناسان فنی
                 </Link>
               </div>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
