'use client';

import React, { useState, useEffect } from 'react';
import { getAdminAnalytics } from '@/lib/api';
import { TrendingUp, BarChart3, PieChart, Activity, DollarSign, Cpu } from 'lucide-react';

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await getAdminAnalytics();
        setData(res);
      } catch (err) {
        console.error('Error loading analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-center">
        <div className="space-y-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-slate-400">در حال دریافت داده‌های تحلیلی و نمودارها...</p>
        </div>
      </div>
    );
  }

  const revenueChart = data?.revenue_chart || [];
  const aiTrend = data?.ai_trend || [];
  const maxRevenue = Math.max(...revenueChart.map((r: any) => r.revenue), 1);
  const maxQueries = Math.max(...aiTrend.map((a: any) => a.queries), 1);

  return (
    <div className="space-y-8 animate-fade-in text-right">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black dark:text-white text-slate-900 flex items-center gap-3">
          <TrendingUp className="w-7 h-7 text-amber-500" />
          چارت‌ها & نمودارهای تحلیلی گرافیکی (Business Intelligence & Analytics)
        </h1>
        <p className="text-xs sm:text-sm dark:text-slate-400 text-slate-600">
          تحلیل روند درآمد ماهانه، میزان فراخوانی کوئری‌های هوش مصنوعی و نرخ پیشرفت اسپرینت پروژه‌ها.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Revenue Growth Bar Chart */}
        <div className="p-6 sm:p-8 rounded-3xl glass-card border dark:border-slate-800 border-slate-200 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b dark:border-slate-800 border-slate-200 pb-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-500" />
              <h2 className="text-base font-black dark:text-white text-slate-900">روند رشد درآمد ماهانه (تومان)</h2>
            </div>
            <span className="text-xs font-bold text-emerald-500">+۶۴٪ رشد دی/بهمن</span>
          </div>

          <div className="space-y-4 pt-4">
            {revenueChart.map((item: any, idx: number) => {
              const percentage = (item.revenue / maxRevenue) * 100;

              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold dark:text-slate-300 text-slate-700">
                    <span>{item.month}</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400">{item.revenue.toLocaleString('fa-IR')} تومان</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
