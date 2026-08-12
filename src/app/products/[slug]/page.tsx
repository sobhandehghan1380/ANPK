import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  Users,
  Workflow,
  HelpCircle,
  Rocket,
  Package,
  Sparkles,
  Server,
  AlertCircle,
  EyeOff
} from 'lucide-react';

import { getProductBySlug, getProducts } from '@/lib/data';
import { ProductBadge } from '@/components/ProductBadge';
import { AiraDemo } from '@/components/AiraDemo';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) return { title: 'محصول یافت نشد' };
  return {
    title: `${product.title} | محصولات ارشیا نگین پردازش`,
    description: product.description,
  };
}

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const allProducts = await getProducts(true);
  const relatedProducts = allProducts.filter((p: any) => p.slug !== product.slug && p.isPublic);

  const isAira = product.slug === 'aira';

  const productImages: Record<string, string> = {
    aira: '/images/bg/prod_aira.jpg',
    'tasisat-negar': '/images/bg/prod_tasisat.jpg',
    nikilink: '/images/bg/prod_nikilink.jpg',
  };
  const logoImg = product.image_url || productImages[product.slug] || '/images/bg/prod_aira.jpg';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 overflow-x-hidden">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Link href="/" className="hover:text-white transition-colors">صفحه اصلی</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-white transition-colors">محصولات</Link>
        <span>/</span>
        <span className="text-accent-400 font-bold">{product.title}</span>
      </div>

      {/* DRAFT NOTICE BANNER FOR HONARDARI */}
      {(!product.isPublic || product.status === 'draft') && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-amber-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <EyeOff className="w-5 h-5 text-amber-400 shrink-0" />
            <span>
              <strong>توجه:</strong> این صفحه مربوط به محصول پیش‌نویس (Draft) غیرعمومی می‌باشد و صرفاً در پنل مدیریت قابل مشاهده و تنظیم است.
            </span>
          </div>
          <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 rounded font-mono">وضعیت: Draft</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative rounded-3xl glass-card border dark:border-slate-800 border-slate-200 p-8 sm:p-12 space-y-8 overflow-hidden card-elevated">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-4 max-w-3xl">
            <div className="flex items-center gap-3">
              <ProductBadge status={product.status} isPublic={product.isPublic} />
              <span className="text-xs font-mono dark:text-slate-400 text-slate-600 dark:bg-slate-900 bg-slate-100 border dark:border-slate-800 border-slate-200 px-3 py-1 rounded-full font-bold">
                مدل ارائه: {product.deliveryModel}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black dark:text-white text-slate-900 leading-tight">
              {product.title}
            </h1>
            <p className="text-brand-600 dark:text-brand-300 text-lg font-bold">{product.tagline}</p>
            <p className="dark:text-slate-300 text-slate-600 text-base leading-relaxed font-medium">{product.description}</p>
          </div>

          {/* Product Brand Logo */}
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl overflow-hidden border dark:border-slate-700 border-slate-200 shadow-xl shrink-0 p-1 bg-white dark:bg-slate-800">
            <img src={logoImg} alt={product.title} className="w-full h-full object-cover rounded-2xl" />
          </div>
        </div>

        {/* Value Proposition Box */}
        <div className="p-5 rounded-2xl dark:bg-accent-950/30 bg-accent-50 border border-accent-500/30 space-y-1 relative z-10">
          <span className="text-xs font-bold text-accent-600 dark:text-accent-400 block">ارزش پیشنهادی اصلی محصول:</span>
          <p className="text-sm font-bold text-accent-800 dark:text-accent-200">{product.valueProposition}</p>
        </div>

        <div className="pt-2 flex flex-wrap gap-4 relative z-10">
          <Link
            href="/start-project"
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 text-white font-black text-sm shadow-xl shadow-brand-600/30 flex items-center gap-2 group transition-all hover:-translate-y-0.5"
          >
            <Rocket className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            <span>درخواست سفارش این محصول</span>
          </Link>
        </div>
      </div>

      {/* INTERACTIVE DEMO (For AIRA) */}
      {isAira && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-accent-400" />
              دموی مفهومی تعاملی آیرا
            </h2>
            <span className="text-xs text-slate-400">امکان تست زنده سناریوهای کلاس، وبینار و آموزش سازمانی</span>
          </div>

          {/* Interactive Demo Component */}
          <AiraDemo />
        </section>
      )}

      {/* FEATURES & ROLES GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Features */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-xs font-bold text-accent-400 uppercase tracking-widest">
            <Package className="w-4 h-4" />
            <span>قابلیت‌های محصول</span>
          </div>

          <div className="space-y-3">
            {product.features.map((feat: string, idx: number) => (
              <div key={idx} className="p-4 rounded-xl glass-card border border-slate-800 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-accent-400 shrink-0" />
                <span className="text-sm font-medium text-slate-200">{feat}</span>
              </div>
            ))}
          </div>
        </section>

        {/* User Roles */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-widest">
            <Users className="w-4 h-4" />
            <span>نقش‌های کاربران در محصول</span>
          </div>

          <div className="space-y-3">
            {product.userRoles.map((ur: any, idx: number) => (
              <div key={idx} className="p-4 rounded-xl glass-card border border-slate-800 space-y-1">
                <h4 className="text-sm font-bold text-sky-300">{ur.role}</h4>
                <p className="text-xs text-slate-400">{ur.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* WORKFLOW & DELIVERY MODELS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Workflow */}
        <section className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-widest">
            <Workflow className="w-4 h-4" />
            <span>گردش‌کار و نحوه استفاده</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {product.workflow.map((wf: any, idx: number) => (
              <div key={idx} className="p-5 rounded-2xl glass-card border border-slate-800 space-y-2">
                <span className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center font-bold font-mono text-xs">
                  {wf.step}
                </span>
                <h4 className="text-sm font-bold text-white">{wf.title}</h4>
                <p className="text-xs text-slate-400">{wf.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Delivery Models */}
        <section className="space-y-4 p-6 rounded-2xl glass-card border border-slate-800">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-widest">
            <Server className="w-4 h-4" />
            <span>نحوه ارائه و استقرار</span>
          </div>
          <div className="space-y-3 text-xs text-slate-300">
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
              <span className="font-bold text-white block">SaaS (ابری)</span>
              <p className="text-slate-400 mt-0.5">راه‌اندازی آنی روی سرورهای ابری امن شرکت ارشیا نگین پردازش.</p>
            </div>
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
              <span className="font-bold text-white block">On-Premise (سازمانی)</span>
              <p className="text-slate-400 mt-0.5">استقرار بر روی داتاسنتر و زیرساخت اختصاصی سازمان شما.</p>
            </div>
          </div>
        </section>
      </div>

      {/* FAQ */}
      {product.faq && product.faq.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest">
            <HelpCircle className="w-4 h-4" />
            <span>پرسش‌های متداول محصول</span>
          </div>

          <div className="space-y-4">
            {product.faq.map((f: any, idx: number) => (
              <div key={idx} className="p-5 rounded-2xl glass-card border border-slate-800 space-y-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="text-accent-400 font-mono">س:</span>
                  <span>{f.q}</span>
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed pr-5">{f.a}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* RELATED PRODUCTS */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6 pt-6 border-t border-slate-800">
          <h3 className="text-xl font-bold text-white">محصولات مرتبط</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {relatedProducts.map((rel: any) => (
              <Link
                key={rel.id}
                href={`/products/${rel.slug}`}
                className="p-5 rounded-2xl glass-card glass-card-hover border border-slate-800 space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold text-white group-hover:text-accent-300 transition-colors">
                    {rel.title}
                  </h4>
                  <ProductBadge status={rel.status} isPublic={rel.isPublic} />
                </div>
                <p className="text-xs text-slate-400 line-clamp-2">{rel.tagline}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-accent-950 border border-accent-500/30 text-center space-y-6">
        <h2 className="text-2xl sm:text-3xl font-black text-white">
          آیا مایل به دریافت اطلاعات بیشتر درباره «{product.title}» هستید؟
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
          جهت ثبت سفارش یا دریافت نسخه دمو و پروپوزال، درخواست خود را ارسال فرمایید.
        </p>
        <Link
          href="/start-project"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-600 to-accent-600 text-white font-bold text-sm shadow-xl hover:-translate-y-0.5 transition-all"
        >
          <Rocket className="w-5 h-5" />
          <span>ثبت درخواست سفارشی‌سازی</span>
        </Link>
      </section>
    </div>
  );
}
