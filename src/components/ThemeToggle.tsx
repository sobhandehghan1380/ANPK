'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('anpk-theme') as 'dark' | 'light' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      applyTheme('dark');
    }
  }, []);

  const applyTheme = (newTheme: 'dark' | 'light') => {
    const root = document.documentElement;
    if (newTheme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('anpk-theme', nextTheme);
    applyTheme(nextTheme);
  };

  if (!mounted) {
    return (
      <button
        aria-label="تم"
        className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 text-amber-400 opacity-50 flex items-center justify-center"
      >
        <Sun className="w-4 h-4" />
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={`w-8 h-8 rounded-full border transition-all flex items-center justify-center ${
        theme === 'dark'
          ? 'bg-slate-900/90 border-slate-800 text-amber-400 hover:scale-105'
          : 'bg-white border-slate-300 text-slate-700 hover:scale-105 shadow-sm'
      }`}
      aria-label={theme === 'dark' ? 'تغییر به تم روشن' : 'تغییر به تم تاریک'}
      title={theme === 'dark' ? 'تغییر به تم روشن (Light Mode)' : 'تغییر به تم تاریک (Dark Mode)'}
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4 text-amber-400 transition-transform hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-indigo-600 transition-transform hover:-rotate-12" />
      )}
    </button>
  );
}
