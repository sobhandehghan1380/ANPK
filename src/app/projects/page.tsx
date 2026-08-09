import React from 'react';
import Link from 'next/link';
import { ArrowLeft, FolderGit2, CheckCircle2, ExternalLink, Sparkles, AlertCircle } from 'lucide-react';
import { getProjects } from '@/lib/data';
import { ScrollReveal } from '@/components/ScrollReveal';
import { TiltCard } from '@/components/TiltCard';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'پروژه‌های منتخب و سوابق اجرایی | ارشیا نگین پردازش',
  description: 'فهرست پروژه‌های موفق اجرا شده توسط شرکت ارشیا نگین پردازش کویر در حوزه بیمارستانی، آموزشی و صنعتی.',
};

export default async function ProjectsListPage() {
  const projectsData = await getProjects();
  const projects = Array.isArray(projectsData) ? projectsData : [];

  const projectImages: Record<string, string> = {
    'cmms-facility-negar': '/images/bg/proj_his.jpg',
    'aira-webrtc-platform': '/images/bg/proj_lms.jpg',
    'anpk-vision-ocr': '/images/bg/proj_telemed.jpg',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16 overflow-x-hidden text-right">
      {/* Header */}
      <ScrollReveal variant="fade-up">
        <div className="text-center space-y-4 max-w-3xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full dark:bg-slate-900/80 bg-white/90 border dark:border-slate-700/60 border-slate-200/90 text-xs font-bold text-sky-600 dark:text-sky-400 backdrop-blur-2xl shadow-sm mx-auto">
            <FolderGit2 className="w-4 h-4 text-sky-500" />
            <span>پروژه‌های موفق و سامانه‌های پیاده‌شده</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black dark:text-white text-slate-900 leading-tight">
            پروژه‌های منتخب و <span className="gradient-text-accent">مورد کاوی‌ها</span>
          </h1>
          <p className="dark:text-slate-300 text-slate-600 text-sm sm:text-base leading-relaxed font-medium">
            نمونه‌ای از سامانه‌های بزرگ تحویل‌شده به دانشگاه‌ها، بیمارستان‌ها و صنایع کشور همراه با دستاوردهای کمی ثبت‌شده.
          </p>
        </div>
      </ScrollReveal>

      {/* Projects Grid or Empty State */}
      {projects.length === 0 ? (
        <div className="p-12 rounded-3xl glass-card border dark:border-slate-800 border-slate-200 text-center space-y-4 max-w-xl mx-auto">
          <AlertCircle className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-lg font-bold dark:text-white text-slate-900">هیچ پروژه عمومی ثبت نگردیده است</h3>
          <p className="text-xs text-slate-400">
            پروژه‌ها و نمونه‌کارهای جدید پس از تایید نهایی کارفرما در این بخش منتشر می‌گردند.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((proj: any, idx: number) => {
            const logoImg = projectImages[proj.slug] || '/images/bg/proj_his.jpg';
            const resultsList = Array.isArray(proj.results) && proj.results.length > 0
              ? proj.results
              : ['استقرار بومی پلتفرم سازمانی', 'تحویل با پایداری ۹۹.۹٪ و مستندات فنی'];

            return (
              <ScrollReveal key={proj.id || idx} variant="fade-up" delay={idx * 120}>
                <TiltCard className="h-full">
                  <div className="p-7 rounded-3xl glass-card border dark:border-slate-800 border-slate-200/90 space-y-6 flex flex-col justify-between group card-elevated card-shimmer relative overflow-hidden h-full">
                    {/* Top Accent Gradient Line */}
                    <div className="absolute top-0 right-0 left-0 h-[3px] bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500 opacity-60 group-hover:opacity-100 transition-opacity duration-300" />

                    <div className="space-y-5 relative z-10">
                      {/* Header: Large Client Image Logo + Status */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border dark:border-slate-700 border-slate-200 shadow-md shrink-0 group-hover:scale-105 transition-transform duration-300 p-1 bg-white dark:bg-slate-800">
                            <img src={logoImg} alt={proj.clientName || 'کارفرما'} className="w-full h-full object-cover rounded-xl" />
                          </div>
                          <div>
                            <span className="text-xs sm:text-sm font-bold dark:text-white text-slate-900 block leading-snug">
                              {proj.clientName || 'دانشگاه‌ها و مراکز صنعتی بزرگ'}
                            </span>
                            <span className="text-[11px] text-sky-600 dark:text-sky-400 font-mono font-bold block mt-1">
                              {proj.domain || 'پلتفرم سازمانی'}
                            </span>
                          </div>
                        </div>

                        <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20 shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                          تحویل شده
                        </span>
                      </div>

                      {/* Title */}
                      <h2 className="text-xl font-bold dark:text-white text-slate-900 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors leading-tight">
                        {proj.title}
                      </h2>
                      <p className="text-xs dark:text-slate-400 text-slate-600 leading-relaxed font-medium line-clamp-3">
                        {proj.summary}
                      </p>

                      {/* Results list */}
                      <div className="space-y-2 pt-3 border-t dark:border-slate-800 border-slate-200">
                        <span className="text-xs font-bold dark:text-slate-300 text-slate-700 block">دستاوردهای کمی لایو:</span>
                        <div className="space-y-1.5">
                          {resultsList.map((res: string, rIdx: number) => (
                            <div key={rIdx} className="flex items-start gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-500" />
                              <span>{res}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t dark:border-slate-800 border-slate-200 relative z-10">
                      <Link
                        href={`/projects/${proj.slug || proj.id}`}
                        className="w-full py-3 rounded-xl dark:bg-slate-800 bg-slate-100 hover:bg-sky-600 text-slate-800 dark:text-slate-200 hover:text-white font-bold text-xs transition-all flex items-center justify-center gap-2 group-hover:bg-sky-600 group-hover:text-white shadow-sm"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>مشاهده کامل مورد کاوی و دستاوردها</span>
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </TiltCard>
              </ScrollReveal>
            );
          })}
        </div>
      )}
    </div>
  );
}
