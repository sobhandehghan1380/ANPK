import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Package, CheckCircle2, Sparkles, Layers, ShieldCheck } from 'lucide-react';
import { getProducts } from '@/lib/data';
import { ProductBadge } from '@/components/ProductBadge';
import { ScrollReveal } from '@/components/ScrollReveal';
import { TiltCard } from '@/components/TiltCard';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'محصولات نرم‌افزاری | ارشیا نگین پردازش کویر',
  description: 'سبد محصولات نرم‌افزاری ارشیا نگین پردازش شامل آیرا، تأسیسات نگار، نیکی لینک و پروژه‌های در حال توسعه.',
};

export default async function ProductsListPage() {
  const products = await getProducts(true);

  const productImages: Record<string, string> = {
    aira: '/images/bg/prod_aira.jpg',
    'tasisat-negar': '/images/bg/prod_tasisat.jpg',
    nikilink: '/images/bg/prod_nikilink.jpg',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16 overflow-x-hidden">
      {/* Dramatic Header */}
      <ScrollReveal variant="fade-up">
        <div className="text-center space-y-4 max-w-3xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full dark:bg-slate-900/80 bg-white/90 border dark:border-slate-700/60 border-slate-200/90 text-xs font-bold text-accent-600 dark:text-accent-400 backdrop-blur-2xl shadow-sm mx-auto">
            <Package className="w-4 h-4 text-accent-500" />
            <span>سبد محصولات بومی و عملیاتی</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black dark:text-white text-slate-900 leading-tight">
            محصولات نرم‌افزاری <span className="gradient-text-primary">ارشیا نگین پردازش</span>
          </h1>
          <p className="dark:text-slate-300 text-slate-600 text-sm sm:text-base leading-relaxed font-medium">
            پلتفرم‌ها و سامانه‌های بومی توسعه‌یافته بر اساس نیازمندی‌های عمیق سازمان‌ها، با شفافیت وضعیت انتشار و مالکیت ۱۰۰٪ سورس‌کد.
          </p>
        </div>
      </ScrollReveal>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((prod, idx) => {
          const logoImg = productImages[prod.slug] || '/images/bg/prod_aira.jpg';

          return (
            <ScrollReveal key={prod.id} variant="fade-up" delay={idx * 120}>
              <TiltCard className="h-full">
                <div className="p-7 rounded-3xl glass-card border dark:border-slate-800 border-slate-200/90 space-y-6 flex flex-col justify-between group card-elevated card-shimmer h-full relative overflow-hidden">
                  {/* Top Accent Line */}
                  <div className="absolute top-0 right-0 left-0 h-[3px] bg-gradient-to-r from-accent-500 via-brand-500 to-sky-500 opacity-60 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="space-y-5 relative z-10">
                    {/* Header: Logo Container + Status & Delivery */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl overflow-hidden border dark:border-slate-700 border-slate-200 shadow-md shrink-0 group-hover:scale-105 transition-transform duration-300 p-1 bg-white dark:bg-slate-800">
                          <img src={logoImg} alt={prod.title} className="w-full h-full object-cover rounded-xl" />
                        </div>
                        <div>
                          <ProductBadge status={prod.status} isPublic={prod.isPublic} />
                          <span className="block text-[10px] font-mono text-slate-400 font-bold mt-1">{prod.deliveryModel}</span>
                        </div>
                      </div>

                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                        PROD-0{idx + 1}
                      </span>
                    </div>

                    {/* Title + Tagline */}
                    <div>
                      <h2 className="text-xl font-extrabold dark:text-white text-slate-900 group-hover:text-accent-600 dark:group-hover:text-accent-400 transition-colors leading-tight">
                        {prod.title}
                      </h2>
                      <p className="text-xs font-bold text-brand-600 dark:text-brand-400 mt-1">{prod.tagline}</p>
                    </div>

                    {/* Description */}
                    <p className="text-xs dark:text-slate-400 text-slate-600 leading-relaxed font-medium line-clamp-3">{prod.description}</p>

                    {/* Value Proposition snippet */}
                    <div className="p-3.5 dark:bg-emerald-950/20 bg-emerald-50/80 border border-emerald-500/30 rounded-2xl text-xs dark:text-emerald-200 text-emerald-800">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-0.5">ارزش اصلی محصول:</span>
                      <p className="leading-relaxed font-medium text-[11px]">{prod.valueProposition}</p>
                    </div>

                    {/* Features list */}
                    <div className="space-y-2 pt-3 border-t dark:border-slate-800 border-slate-200">
                      <span className="text-xs font-bold dark:text-slate-300 text-slate-700 block">قابلیت‌های اصلی:</span>
                      <div className="space-y-1.5">
                        {prod.features.slice(0, 3).map((feat: string, fIdx: number) => (
                          <div key={fIdx} className="flex items-center gap-2 text-xs dark:text-slate-400 text-slate-600 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 text-accent-500 shrink-0" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t dark:border-slate-800 border-slate-200 relative z-10">
                    <Link
                      href={`/products/${prod.slug}`}
                      className="w-full py-3 rounded-xl dark:bg-slate-800 bg-slate-100 hover:bg-accent-600 text-slate-800 dark:text-slate-200 hover:text-white font-bold text-xs transition-all flex items-center justify-center gap-2 group-hover:bg-accent-600 group-hover:text-white shadow-sm"
                    >
                      <span>مشاهده مشخصات کامل و دمو</span>
                      <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </TiltCard>
            </ScrollReveal>
          );
        })}
      </div>
    </div>
  );
}
