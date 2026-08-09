'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ScrollReveal } from '@/components/ScrollReveal';
import { sendOTP, verifyOTP } from '@/lib/api';
import { Phone, Lock, ArrowRight, CheckCircle2, ShieldCheck, KeyRound, Smartphone, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState(['', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [demoCodeNotice, setDemoCodeNotice] = useState('');
  const [countdown, setCountdown] = useState(120);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let timer: any;
    if (step === 'OTP' && countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      setErrorMsg('لطفاً شماره موبایل معتبر (مثلاً 09131518904) وارد نمایید.');
      return;
    }
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await sendOTP(phone);
      if (res.error) {
        setErrorMsg(res.error);
      } else {
        setStep('OTP');
        setCountdown(120);
        setCanResend(false);
        if (res.demo_code) {
          setDemoCodeNotice(res.demo_code);
        }
      }
    } catch (err) {
      setErrorMsg('خطا در برقراری ارتباط با سرویس پیامک.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = otpCode.join('');
    if (fullCode.length < 5) {
      setErrorMsg('لطفاً کد تایید ۵ رقمی پیامک شده را کامل وارد نمایید.');
      return;
    }
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await verifyOTP(phone, fullCode);
      if (res.error) {
        setErrorMsg(res.error);
      } else {
        // Save auth state in localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('anpk_user_logged_in', 'true');
          localStorage.setItem('anpk_user_phone', phone);
        }
        router.push('/portal');
      }
    } catch (err) {
      setErrorMsg('کد تایید اشتباه است یا منقضی شده است.');
    } finally {
      setLoading(false);
    }
  };

  const toEnglishDigits = (str: string) => {
    return str
      .replace(/[۰-۹]/g, (d) => (d.charCodeAt(0) - 1776).toString())
      .replace(/[٠-٩]/g, (d) => (d.charCodeAt(0) - 1632).toString());
  };

  const handleOtpChange = (index: number, rawValue: string) => {
    const value = toEnglishDigits(rawValue).replace(/[^0-9]/g, '');
    const digit = value.length > 0 ? value[value.length - 1] : '';

    const newCode = [...otpCode];
    newCode[index] = digit;
    setOtpCode(newCode);

    // Auto focus next input
    if (digit && index < 4) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = toEnglishDigits(e.clipboardData.getData('text')).replace(/[^0-9]/g, '');
    if (pasteData.length > 0) {
      const newCode = ['', '', '', '', ''];
      for (let i = 0; i < Math.min(pasteData.length, 5); i++) {
        newCode[i] = pasteData[i];
      }
      setOtpCode(newCode);
      const nextIdx = Math.min(pasteData.length, 4);
      const targetInput = document.getElementById(`otp-input-${nextIdx}`);
      targetInput?.focus();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <ScrollReveal variant="scale">
        <div className="w-full max-w-md p-8 sm:p-10 rounded-3xl glass-card border dark:border-slate-800 border-slate-200 shadow-2xl relative z-10 card-elevated text-right">
          {/* Header Icon */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-accent-500 text-white flex items-center justify-center mx-auto mb-6 shadow-lg shadow-brand-500/20 icon-glow">
            {step === 'PHONE' ? <Smartphone className="w-8 h-8" /> : <ShieldCheck className="w-8 h-8" />}
          </div>

          <div className="text-center space-y-2 mb-8">
            <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest bg-brand-500/10 px-3 py-1 rounded-full border border-brand-500/20">
              ورود امن به پورتال ANPK
            </span>
            <h1 className="text-2xl font-black dark:text-white text-slate-900">
              {step === 'PHONE' ? 'ورود با شماره موبایل' : 'تایید کد پیامک‌شده'}
            </h1>
            <p className="text-xs dark:text-slate-400 text-slate-600 font-medium">
              {step === 'PHONE'
                ? 'جهت ورود به سیستم پورتال مشتریان، شماره همراه خود را وارد کنید.'
                : `کد تایید ۵ رقمی به شماره ${phone} ارسال گردید.`}
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {step === 'PHONE' ? (
            <form onSubmit={handleSendOTP} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold dark:text-slate-300 text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-brand-500" />
                    <span>شماره تلفن همراه</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setPhone('09131518904')}
                    className="text-[11px] text-brand-600 dark:text-brand-400 hover:underline"
                  >
                    درج شماره تست (09131518904)
                  </button>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    placeholder="09123456789"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full dir-ltr text-center font-mono font-bold text-lg px-4 py-3.5 rounded-2xl dark:bg-slate-900/90 bg-slate-50 border dark:border-slate-700/80 border-slate-300 dark:text-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all shadow-inner"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 text-white font-bold text-sm shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 transition-all"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>ارسال کد تایید پیامکی</span>
                    <ArrowRight className="w-4 h-4 rotate-180" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div className="space-y-3">
                <label className="text-xs font-bold dark:text-slate-300 text-slate-700 block text-center">
                  کد ۵ رقمی را وارد نمایید
                </label>
                <div className="flex items-center justify-center gap-2" style={{ direction: 'ltr' }}>
                  {otpCode.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`otp-input-${idx}`}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      autoFocus={idx === 0}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      onPaste={handleOtpPaste}
                      style={{ direction: 'ltr' }}
                      className="w-12 h-14 text-center font-mono font-black text-2xl rounded-2xl dark:bg-slate-900 bg-slate-100 border-2 dark:border-slate-700 border-slate-300 dark:text-white text-slate-900 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/20 shadow-inner transition-all duration-200"
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-bold pt-2">
                <button
                  type="button"
                  onClick={() => setStep('PHONE')}
                  className="text-brand-600 dark:text-brand-400 hover:underline"
                >
                  تغییر شماره همراه
                </button>
                <span className="dark:text-slate-400 text-slate-500 font-mono">
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleSendOTP}
                      className="text-emerald-500 hover:underline"
                    >
                      ارسال مجدد کد
                    </button>
                  ) : (
                    `زمان باقی‌مانده: ${formatTime(countdown)}`
                  )}
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-200" />
                    <span>تایید و ورود به پورتال</span>
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-8 pt-6 border-t dark:border-slate-800/80 border-slate-200 text-center">
            <span className="text-xs dark:text-slate-400 text-slate-600 flex items-center justify-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>پروتکل ورود بدون کلمه عبور با رمزنگاری OTP</span>
            </span>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
