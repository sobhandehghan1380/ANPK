import React from 'react';
import { CheckCircle2, Clock, EyeOff, Sparkles } from 'lucide-react';

interface ProductBadgeProps {
  status: string;
  isPublic?: boolean;
  className?: string;
}

export function ProductBadge({ status, isPublic = true, className = '' }: ProductBadgeProps) {
  if (!isPublic || status === 'draft') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold dark:bg-slate-800 bg-slate-200 dark:text-slate-400 text-slate-600 border dark:border-slate-700 border-slate-300 shadow-sm ${className}`}>
        <EyeOff className="w-3.5 h-3.5" />
        پیش‌نویس غیرعمومی
      </span>
    );
  }

  if (status === 'under_development') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold dark:bg-amber-500/10 bg-amber-50 dark:text-amber-300 text-amber-700 border dark:border-amber-500/30 border-amber-300 shadow-sm ${className}`}>
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
        </span>
        <Clock className="w-3.5 h-3.5 animate-spin-slow" />
        در حال توسعه
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold dark:bg-emerald-500/10 bg-emerald-50 dark:text-emerald-300 text-emerald-700 border dark:border-emerald-500/30 border-emerald-300 shadow-sm ${className}`}>
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>
      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
      عملیاتی و آماده تحویل
    </span>
  );
}
