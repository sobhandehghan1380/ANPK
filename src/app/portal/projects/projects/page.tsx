'use client';

import React, { useState, useEffect } from 'react';
import { getClientProjects } from '@/lib/api';
import { FolderGit2, CheckCircle2, Clock, Calendar, ShieldCheck, ArrowUpRight } from 'lucide-react';

export default function PortalClientProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await getClientProjects();
        setProjects(res);
      } catch (err) {
        console.error('Error fetching client projects:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-center">
        <div className="space-y-3">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-slate-400">در حال دریافت فازها و پروژه‌ها از دیتابیس جنگو...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in text-right">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black dark:text-white text-slate-900 flex items-center gap-3">
          <FolderGit2 className="w-7 h-7 text-indigo-500" />
          پروژه‌ها و فازهای اجرایی کارفرما
        </h1>
        <p className="text-xs sm:text-sm dark:text-slate-400 text-slate-600">
          پیگیری خط زمانی (Roadmap)، فازبندی پروژه‌های قراردادی و وضعیت پیشرفت اسپرینت‌ها از دیتابیس جنگو.
        </p>
      </div>

      {projects.length === 0 ? (
        <div className="p-8 sm:p-12 rounded-3xl glass-card border dark:border-slate-800 border-slate-200 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl dark:bg-slate-900 bg-slate-100 border dark:border-slate-800 border-slate-200 flex items-center justify-center mx-auto text-slate-400">
            <FolderGit2 className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold dark:text-white text-slate-900">هیچ پروژه قراردادی برای این حساب یافت نشد</h3>
            <p className="text-xs dark:text-slate-400 text-slate-600 max-w-md mx-auto">
              پروژه‌های سفارشی و خصوصی بر اساس شماره تلفن ثبت‌شده کارفرما تفکیک می‌شوند. در صورت تعریف پروژه جدید، فازها در این بخش قابل پیگیری خواهند بود.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {projects.map((proj) => (
            <div key={proj.id} className="p-6 sm:p-8 rounded-3xl glass-card border dark:border-slate-800 border-slate-200 space-y-6 card-elevated">
              {/* Project Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b dark:border-slate-800 border-slate-200 pb-6">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                    شماره قرارداد: {proj.contract_number}
                  </span>
                  <h2 className="text-xl font-black dark:text-white text-slate-900 mt-2">{proj.title}</h2>
                </div>
                <div className="flex items-center gap-4 dir-rtl">
                  <div className="text-left">
                    <span className="text-[10px] dark:text-slate-400 text-slate-600 font-bold block">پیشرفت کل اسپرینت</span>
                    <span className="text-lg font-black text-emerald-600 dark:text-emerald-500">{proj.progress}%</span>
                  </div>
                  <a
                    href={proj.login_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-brand-500/20"
                  >
                    ورود به سامانه
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Phases Roadmap */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold dark:text-slate-300 text-slate-700">فازبندی کامل پروژه (Roadmap):</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {(proj.phases || []).map((phase: any) => (
                    <div
                      key={phase.number}
                      className={`p-4 rounded-2xl border space-y-3 transition-all ${
                        phase.status === 'COMPLETED'
                          ? 'bg-emerald-500/10 dark:bg-emerald-500/5 border-emerald-500/30'
                          : phase.status === 'IN_PROGRESS'
                          ? 'bg-brand-500/10 dark:bg-brand-500/5 border-brand-500/40 shadow-md ring-1 ring-brand-500/20'
                          : 'dark:bg-slate-900/50 bg-slate-50 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-400">فاز {phase.number}</span>
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            phase.status === 'COMPLETED'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : phase.status === 'IN_PROGRESS'
                              ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {phase.status_display}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white line-clamp-2">{phase.title}</h4>
                      <div className="space-y-1.5 pt-2 border-t border-slate-800/60 text-[10px] text-slate-400">
                        <div className="flex justify-between">
                          <span>تاریخ شروع:</span>
                          <span className="font-bold text-slate-300">{phase.start_date}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>تاریخ تحویل:</span>
                          <span className="font-bold text-slate-300">{phase.target_date}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>پیشرفت:</span>
                          <span className="font-bold text-white">{phase.progress}%</span>
                        </div>
                        
                        {phase.deliverable_file && (
                          <div className="pt-2 mt-2 border-t border-slate-800/60">
                             <a href={process.env.NEXT_PUBLIC_API_URL + phase.deliverable_file} target="_blank" className="w-full text-center block bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 py-1.5 rounded-lg transition-all font-bold">
                                دانلود فایل خروجی (Deliverable)
                             </a>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
