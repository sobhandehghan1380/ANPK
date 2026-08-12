import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, FolderGit2, Rocket, Building2, ExternalLink, Sparkles } from 'lucide-react';
import { getProjectBySlug, getProjects } from '@/lib/data';
import { ScrollReveal } from '@/components/ScrollReveal';
import { TiltCard } from '@/components/TiltCard';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const project = await getProjectBySlug(params.slug);
  if (!project) return { title: 'پروژه یافت نشد' };
  return {
    title: project.metaTitle || `${project.title} | پروژه‌های ارشیا نگین پردازش`,
    description: project.metaDescription || project.summary,
  };
}

export default async function ProjectDetailPage({ params }: { params: { slug: string } }) {
  const project = await getProjectBySlug(params.slug);
  if (!project) notFound();

  const allProjects = await getProjects();
  const relatedProjects = allProjects.filter((p: any) => p.slug !== project.slug).slice(0, 2);

  const projectImages: Record<string, string> = {
    'cmms-hospital': '/images/bg/proj_his.jpg',
    'national-webinar-platform': '/images/bg/proj_lms.jpg',
    'ai-ocr-document-automation': '/images/bg/proj_telemed.jpg',
  };
  const logoImg = projectImages[project.slug] || '/images/bg/proj_his.jpg';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 overflow-x-hidden">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Link href="/" className="hover:text-white transition-colors">صفحه اصلی</Link>
        <span>/</span>
        <Link href="/projects" className="hover:text-white transition-colors">پروژه‌ها</Link>
        <span>/</span>
        <span className="text-sky-400 font-bold">{project.title}</span>
      </div>

      {/* Main Banner */}
      <ScrollReveal variant="fade-up">
        <div className="p-8 sm:p-12 rounded-3xl glass-card border dark:border-slate-800 border-slate-200/90 space-y-8 card-elevated relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-4 max-w-3xl">
              <div className="flex items-center gap-3 text-xs">
                <span className="px-3.5 py-1.5 bg-sky-500/10 text-sky-600 dark:text-sky-400 rounded-full border border-sky-500/20 font-mono font-bold">
                  حوزه: {project.domain}
                </span>
                <span className="flex items-center gap-1.5 font-bold text-slate-600 dark:text-slate-300">
                  <Building2 className="w-4 h-4 text-sky-500" />
                  کارفرما: {project.clientName}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  تحویل شده
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black dark:text-white text-slate-900 leading-tight">
                {project.title}
              </h1>
              <p className="dark:text-slate-300 text-slate-600 text-base sm:text-lg leading-relaxed font-medium">
                {project.summary}
              </p>
              
              {project.fullDescription && (
                <div 
                  className="prose dark:prose-invert max-w-none pt-4 text-sm sm:text-base"
                  dangerouslySetInnerHTML={{ __html: project.fullDescription }}
                />
              )}
            </div>

            {/* Client Logo Header */}
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl overflow-hidden border dark:border-slate-700 border-slate-200 shadow-xl shrink-0 p-1 bg-white dark:bg-slate-800">
              <img src={logoImg} alt={project.clientName} className="w-full h-full object-cover rounded-2xl" />
            </div>
          </div>

          <div className="pt-2 flex flex-wrap gap-4 relative z-10 border-t dark:border-slate-800 border-slate-200/80">
            <Link
              href="/start-project"
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-black text-sm shadow-xl shadow-sky-600/30 flex items-center gap-2 group transition-all hover:-translate-y-0.5"
            >
              <Rocket className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span>سفارش پروژه مشابه برای سازمان شما</span>
            </Link>
          </div>
        </div>
      </ScrollReveal>

      {/* Results & Features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ScrollReveal variant="fade-up" delay={100}>
          <TiltCard className="h-full">
            <div className="p-7 rounded-3xl glass-card border dark:border-slate-800 border-slate-200/90 space-y-5 card-elevated h-full">
              <h2 className="text-xl font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6" />
                نتایج واقعی و دستاوردهای کمی ثبت‌شده
              </h2>
              <div className="space-y-3">
                {project.results.map((res: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 p-4 dark:bg-slate-900 bg-slate-100/90 rounded-2xl border dark:border-slate-800 border-slate-200 text-xs dark:text-slate-200 text-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="leading-relaxed font-bold">{res}</span>
                  </div>
                ))}
              </div>
            </div>
          </TiltCard>
        </ScrollReveal>

        <ScrollReveal variant="fade-up" delay={200}>
          <TiltCard className="h-full">
            <div className="p-7 rounded-3xl glass-card border dark:border-slate-800 border-slate-200/90 space-y-5 card-elevated h-full">
              <h2 className="text-xl font-black text-sky-600 dark:text-sky-400 flex items-center gap-2">
                <FolderGit2 className="w-6 h-6" />
                قابلیت‌ها و معماری پیاده‌سازی شده
              </h2>
              <div className="space-y-3">
                {project.features.map((feat: string, idx: number) => (
                  <div key={idx} className="p-4 dark:bg-slate-900 bg-slate-100/90 rounded-2xl border dark:border-slate-800 border-slate-200 text-xs dark:text-slate-300 text-slate-700 font-bold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </TiltCard>
        </ScrollReveal>
      </div>

      {/* Related Projects */}
      {relatedProjects.length > 0 && (
        <div className="space-y-6 pt-6 border-t dark:border-slate-800 border-slate-200">
          <h3 className="text-xl font-black dark:text-white text-slate-900">پروژه‌های مشابه و مرتبط</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {relatedProjects.map((rel: any) => {
              const relImg = projectImages[rel.slug] || '/images/bg/proj_his.jpg';

              return (
                <Link
                  key={rel.id}
                  href={`/projects/${rel.slug}`}
                  className="p-5 rounded-2xl glass-card border dark:border-slate-800 border-slate-200/90 space-y-3 group card-elevated card-shimmer flex items-center gap-4"
                >
                  <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 p-0.5 bg-white dark:bg-slate-800">
                    <img src={relImg} alt={rel.title} className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold dark:text-white text-slate-900 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors line-clamp-2 leading-snug">
                      {rel.title}
                    </h4>
                    <p className="text-xs dark:text-slate-400 text-slate-600 line-clamp-1 mt-1 font-medium">{rel.summary}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
      {/* CTA */}
      <ScrollReveal variant="scale">
        <div className="p-8 sm:p-12 rounded-3xl mesh-gradient-bg text-center space-y-6 relative overflow-hidden shadow-xl text-white">
          <div className="absolute inset-0 bg-gradient-to-r from-sky-900/90 via-slate-900/95 to-slate-950/90"></div>
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="text-2xl sm:text-3xl font-black text-white">نیازمند راه‌اندازی پروژه مشابه هستید؟</h2>
            <p className="text-xs sm:text-sm text-slate-300 font-medium">
              تیم مهندسی ارشیا نگین پردازش کویر آماده امکان‌سنجی و پیاده‌سازی سفارشی این سامانه برای سازمان شماست.
            </p>
            <Link
              href="/start-project"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-sky-900 hover:bg-slate-100 font-black text-sm shadow-xl hover:-translate-y-0.5 transition-all group"
            >
              <Rocket className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span>ثبت سفارش در فرم ۴ مرحله‌ای</span>
            </Link>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
