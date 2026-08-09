'use client';

import React, { useState } from 'react';
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  Monitor,
  Users,
  MessageSquare,
  PenTool,
  HelpCircle,
  Award,
  Radio,
  Building2,
  CheckCircle,
  Play,
  Maximize2,
  Settings,
  Sparkles,
  BarChart2,
  UserCheck,
  Heart,
  ThumbsUp,
  Smile,
  Volume2,
  VolumeX,
  Share2
} from 'lucide-react';

export function AiraDemo() {
  const [activeScenario, setActiveScenario] = useState<'classroom' | 'webinar' | 'corporate'>('classroom');
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [soundOn, setSoundOn] = useState(true);
  const [selectedTool, setSelectedTool] = useState<'pen' | 'text' | 'shape'>('pen');
  const [currentSlide, setCurrentSlide] = useState(1);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswered, setQuizAnswered] = useState(false);

  // Live reaction counts
  const [reactions, setReactions] = useState({ hearts: 142, claps: 89, ideas: 56, hands: 3 });

  const addReaction = (type: 'hearts' | 'claps' | 'ideas' | 'hands') => {
    setReactions((prev) => ({ ...prev, [type]: prev[type] + 1 }));
  };

  const scenarios = [
    {
      id: 'classroom',
      title: 'سناریو ۱: کلاس مجازی تعاملی',
      desc: 'مناسب دانشگاه‌ها و مدرسین با تخته هوشمند، رفع دست و آزمون آنلاین',
      icon: Users,
    },
    {
      id: 'webinar',
      title: 'سناریو ۲: وبینار و رویداد آنلاین',
      desc: 'مناسب همایش‌ها تا ۱۰,۰۰۰ کاربر همزمان با پنل پرسش و پاسخ و نظرسنجی زنده',
      icon: Radio,
    },
    {
      id: 'corporate',
      title: 'سناریو ۳: آموزش سازمانی و ارزیابی',
      desc: 'مناسب سازمان‌ها با اتاق‌های تمرین (Breakout)، کنترل حضور و صدور گواهی',
      icon: Building2,
    },
  ];

  return (
    <div className="w-full glass-card rounded-3xl border border-slate-700/80 overflow-hidden shadow-2xl my-8">
      {/* Top Demo Header */}
      <div className="dark:bg-slate-900/90 bg-white border-b dark:border-slate-800 border-slate-200 p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-500 mb-1">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span>دموی مفهومی زنده و تعاملی پلتفرم آیرا (Aira Live Simulator)</span>
          </div>
          <h3 className="text-xl font-black dark:text-white text-slate-900">تجربه زنده محیط کاربری آیرا</h3>
          <p className="text-xs dark:text-slate-400 text-slate-600 mt-1">
            سناریوی مورد نظر را انتخاب کنید و قابلیت‌های تعاملی پلتفرم را امتحان نمایید.
          </p>
        </div>

        {/* Scenario Switcher Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 dark:bg-slate-950 bg-slate-100 p-1.5 rounded-2xl border dark:border-slate-800 border-slate-200">
          {scenarios.map((sc) => {
            const Icon = sc.icon;
            const isActive = activeScenario === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => {
                  setActiveScenario(sc.id as any);
                  setShowQuiz(false);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-brand-600 to-accent-600 text-white shadow-lg shadow-brand-600/30'
                    : 'dark:text-slate-400 text-slate-700 hover:dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{sc.id === 'classroom' ? 'کلاس مجازی' : sc.id === 'webinar' ? 'وبینار' : 'آموزش سازمانی'}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Workplace UI */}
      <div className="grid grid-cols-1 lg:grid-cols-4 min-h-[540px] dark:bg-slate-950 bg-slate-50">
        {/* Left/Main Stage (Interactive Viewport) */}
        <div className="lg:col-span-3 p-4 dark:bg-slate-950 bg-slate-50 flex flex-col justify-between relative border-l dark:border-slate-800 border-slate-200">
          {/* Top Stage Bar */}
          <div className="flex items-center justify-between dark:bg-slate-900/80 bg-white px-4 py-2.5 rounded-xl border dark:border-slate-800 border-slate-200 mb-3 text-xs shadow-sm">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
              <span className="font-bold dark:text-slate-200 text-slate-900">
                {activeScenario === 'classroom' && 'کلاس درس: معماری سامانه‌های توزیع‌شده (کد: CS-402)'}
                {activeScenario === 'webinar' && 'وبینار سراسری: تحول دیجیتال در سلامت و CMMS (۲,۴۸۰ شرکت‌کننده)'}
                {activeScenario === 'corporate' && 'دوره آموزشی سازمانی: مدیریت نگهداشت بیمارستانی (دپارتمان نت)'}
              </span>
            </div>

            <div className="flex items-center gap-3 dark:text-slate-400 text-slate-600 font-mono text-[11px]">
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-bold">
                Full HD (WebRTC)
              </span>
              <span>۰۰:۴۲:۱۵</span>
            </div>
          </div>

          {/* Canvas / Whiteboard / Presentation View */}
          <div className="relative flex-1 rounded-2xl dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 overflow-hidden flex flex-col items-center justify-center p-6 text-center group min-h-[360px] shadow-sm">
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />

            {/* SCENARIO 1: CLASSROOM CONTENT */}
            {activeScenario === 'classroom' && (
              <div className="relative z-10 w-full h-full flex flex-col justify-between">
                <div className="flex items-center justify-between border-b dark:border-slate-800 border-slate-200 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs dark:text-slate-400 text-slate-600 font-bold">تخته تعاملی:</span>
                    <button
                      onClick={() => setSelectedTool('pen')}
                      className={`p-2 rounded-lg border text-xs flex items-center gap-1 font-bold ${
                        selectedTool === 'pen' ? 'bg-brand-600 text-white border-brand-500' : 'dark:bg-slate-800 bg-slate-100 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <PenTool className="w-3.5 h-3.5" /> قلم نوری
                    </button>
                    <button
                      onClick={() => setSelectedTool('shape')}
                      className={`p-2 rounded-lg border text-xs flex items-center gap-1 font-bold ${
                        selectedTool === 'shape' ? 'bg-brand-600 text-white border-brand-500' : 'dark:bg-slate-800 bg-slate-100 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      شکل‌ها & دیاگرام
                    </button>
                  </div>

                  <button
                    onClick={() => setShowQuiz(!showQuiz)}
                    className="px-3 py-1.5 bg-accent-600 hover:bg-accent-500 text-white text-xs font-bold rounded-lg shadow transition-all flex items-center gap-1.5"
                  >
                    <HelpCircle className="w-4 h-4" />
                    ارسال کوییز کلاسی
                  </button>
                </div>

                {/* Whiteboard Workspace Simulation */}
                <div className="my-auto py-8 text-right space-y-4">
                  <div className="inline-block px-4 py-2 bg-brand-500/10 border border-brand-500/30 rounded-xl text-brand-600 dark:text-brand-300 font-mono text-sm font-bold">
                    {"f(x) = \\sum_{i=1}^{n} \\text{Load}(i) \\cdot \\text{Latency}(i)"}
                  </div>
                  <h4 className="text-lg font-bold dark:text-white text-slate-900">معماری ریزسرویس و تعادل‌بار (Load Balancing)</h4>
                  <p className="text-xs dark:text-slate-400 text-slate-600 max-w-xl">
                    در الگوریتم توزیع بار آیرا، جریان‌های صوتی و تصویری بدون تداخل در سرورهای لبه (Edge Nodes) پردازش می‌شوند.
                  </p>

                  {/* Simulated Pen Strokes */}
                  <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/30 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2 font-bold">
                    <PenTool className="w-4 h-4" />
                    <span>مدرس هم‌اکنون در حال رسم نمودار جریان داده در تخته هوشمند است...</span>
                  </div>
                </div>

                {/* Quiz Popup Overlay */}
                {showQuiz && (
                  <div className="absolute inset-x-8 top-12 dark:bg-slate-900/95 bg-white/95 border border-accent-500/50 p-5 rounded-2xl shadow-2xl text-right z-20 backdrop-blur-md">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-accent-600 dark:text-accent-400 flex items-center gap-1">
                        <Sparkles className="w-4 h-4" /> کوییز کوتاه زنده
                      </span>
                      <span className="text-xs text-slate-400">مهلت پاسخ: ۰۰:۴۵</span>
                    </div>
                    <p className="text-sm font-bold dark:text-white text-slate-900 mb-3">
                      کدام پروتکل برای انتقال ویدیو با کمترین تاخیر در پلتفرم آیرا استفاده می‌شود؟
                    </p>
                    <div className="space-y-2 text-xs">
                      <button
                        onClick={() => setQuizAnswered(true)}
                        className={`w-full p-2.5 rounded-xl text-right border transition-all ${
                          quizAnswered ? 'bg-emerald-600/20 border-emerald-500 text-emerald-700 dark:text-emerald-200 font-bold' : 'dark:bg-slate-800 bg-slate-100 border-slate-300 text-slate-800'
                        }`}
                      >
                        الف) WebRTC با کدگذاری صوتی Opus و ویدیویی VP9
                      </button>
                      <button className="w-full p-2.5 rounded-xl text-right border dark:bg-slate-800 bg-slate-100 border-slate-300 text-slate-700">
                        ب) HLS سنتی با تاخیر ۱۰ ثانیه‌ای
                      </button>
                    </div>
                    {quizAnswered && (
                      <p className="mt-3 text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" /> پاسخ درست ثبت شد! امتیازبندی به استادیار منتقل گردید.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* SCENARIO 2: WEBINAR CONTENT */}
            {activeScenario === 'webinar' && (
              <div className="relative z-10 w-full h-full flex flex-col justify-between">
                {/* Presenter Slide View */}
                <div className="dark:bg-slate-950 bg-slate-50 p-6 rounded-2xl border dark:border-slate-800 border-slate-200 text-right space-y-4 my-auto">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>اسلاید {currentSlide} از ۱۲</span>
                    <span className="text-brand-500 font-bold">همایش تحول دیجیتال صنایع</span>
                  </div>
                  <h3 className="text-xl font-extrabold dark:text-white text-slate-900">
                    نقش CMMS و هوش مصنوعی در کاهش ۴۵٪ هزینه خرابی تجهیزات
                  </h3>
                  <p className="text-xs dark:text-slate-300 text-slate-700 leading-relaxed">
                    با ادغام سامانه تأسیسات نگار و پلتفرم‌های آنالیز داده، تعمیرات پیشگیرانه قبل از بروز توقف خطوط تولید صادر می‌شود...
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t dark:border-slate-800 border-slate-200">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentSlide(Math.max(1, currentSlide - 1))}
                        className="px-3 py-1.5 dark:bg-slate-800 bg-slate-200 text-slate-700 dark:text-slate-200 rounded-lg text-xs hover:bg-slate-300"
                      >
                        اسلاید قبلی
                      </button>
                      <button
                        onClick={() => setCurrentSlide(Math.min(12, currentSlide + 1))}
                        className="px-3 py-1.5 bg-brand-600 text-white rounded-lg text-xs hover:bg-brand-500 font-bold"
                      >
                        اسلاید بعدی
                      </button>
                    </div>
                    <span className="text-xs text-amber-500 font-bold flex items-center gap-1">
                      <BarChart2 className="w-4 h-4" />
                      نظرسنجی زنده: ۹۲٪ حاضرین رویکرد پیشگیرانه را تایید کردند.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* SCENARIO 3: CORPORATE TRAINING CONTENT */}
            {activeScenario === 'corporate' && (
              <div className="relative z-10 w-full h-full flex flex-col justify-between">
                <div className="my-auto text-right space-y-4">
                  <div className="p-4 dark:bg-slate-900 bg-slate-50 border dark:border-slate-800 border-slate-200 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                        <UserCheck className="w-4 h-4" /> وضعیت حضور و غیاب هوشمند سازمانی
                      </span>
                      <span className="text-xs text-slate-400">شناسه دوره: TRN-904</span>
                    </div>

                    {/* Progress bar */}
                    <div>
                      <div className="flex justify-between text-xs dark:text-slate-300 text-slate-700 mb-1">
                        <span>میزان تکمیل سرفصل‌های دوره</span>
                        <span className="font-bold text-accent-500">۸۸٪</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-gradient-to-r from-brand-500 to-accent-400 h-full w-[88%]" />
                      </div>
                    </div>

                    {/* Breakout rooms grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                      <div className="p-2.5 dark:bg-slate-950 bg-white rounded-xl border dark:border-slate-800 border-slate-200 dark:text-slate-300 text-slate-800 flex items-center justify-between shadow-sm">
                        <span>اتاق تمرین ۱ (تکنسین‌ها)</span>
                        <span className="text-emerald-500 font-bold">۸ نفر</span>
                      </div>
                      <div className="p-2.5 dark:bg-slate-950 bg-white rounded-xl border dark:border-slate-800 border-slate-200 dark:text-slate-300 text-slate-800 flex items-center justify-between shadow-sm">
                        <span>اتاق تمرین ۲ (مدیران)</span>
                        <span className="text-emerald-500 font-bold">۶ نفر</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 font-bold">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-emerald-500" />
                      <span>صدور گواهی‌نامه رسمی دیجیتال پس از اتمام آزمون پایانی</span>
                    </div>
                    <button className="px-3 py-1 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500">
                      مشاهده نمونه گواهی
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Interactive Live Reactions Floating Bar */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700 text-xs shadow-lg z-20">
              <button onClick={() => addReaction('hearts')} className="flex items-center gap-1 text-red-400 hover:scale-110 transition-transform">
                <Heart className="w-3.5 h-3.5 fill-red-400" />
                <span className="font-mono text-[10px]">{reactions.hearts}</span>
              </button>
              <button onClick={() => addReaction('claps')} className="flex items-center gap-1 text-amber-400 hover:scale-110 transition-transform">
                <ThumbsUp className="w-3.5 h-3.5" />
                <span className="font-mono text-[10px]">{reactions.claps}</span>
              </button>
              <button onClick={() => addReaction('ideas')} className="flex items-center gap-1 text-sky-400 hover:scale-110 transition-transform">
                <Sparkles className="w-3.5 h-3.5" />
                <span className="font-mono text-[10px]">{reactions.ideas}</span>
              </button>
            </div>

            {/* Floating Video Stream Thumbnails */}
            <div className="absolute bottom-3 left-3 flex items-center gap-2">
              <div className="w-24 h-16 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden relative shadow-lg">
                <div className="w-full h-full bg-gradient-to-tr from-brand-900 to-slate-800 flex items-center justify-center text-xs font-bold text-slate-300">
                  استاد / ارائه
                </div>
                <span className="absolute bottom-1 right-1 text-[9px] bg-slate-950/80 text-white px-1.5 py-0.5 rounded">
                  دکتر رضایی
                </span>
              </div>
              <div className="w-24 h-16 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden relative shadow-lg">
                <div className="w-full h-full bg-slate-900 flex items-center justify-center text-xs font-bold text-slate-400">
                  {videoOn ? 'شما (آنلاین)' : 'دوربین خاموش'}
                </div>
                <span className="absolute bottom-1 right-1 text-[9px] bg-slate-950/80 text-white px-1.5 py-0.5 rounded">
                  تصویر شما
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Interactive Audio/Video Control Bar */}
          <div className="mt-3 dark:bg-slate-900/90 bg-white border dark:border-slate-800 border-slate-200 px-4 py-3 rounded-2xl flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMicOn(!micOn)}
                className={`p-3 rounded-xl transition-all ${
                  micOn ? 'dark:bg-slate-800 bg-slate-100 text-slate-700 dark:text-slate-200' : 'bg-red-500/20 text-red-500 border border-red-500/40'
                }`}
                aria-label="میکروفون"
              >
                {micOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setVideoOn(!videoOn)}
                className={`p-3 rounded-xl transition-all ${
                  videoOn ? 'dark:bg-slate-800 bg-slate-100 text-slate-700 dark:text-slate-200' : 'bg-red-500/20 text-red-500 border border-red-500/40'
                }`}
                aria-label="دوربین"
              >
                {videoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setSoundOn(!soundOn)}
                className={`p-3 rounded-xl transition-all ${
                  soundOn ? 'dark:bg-slate-800 bg-slate-100 text-slate-700 dark:text-slate-200' : 'bg-amber-500/20 text-amber-500 border border-amber-500/40'
                }`}
                aria-label="صدا"
              >
                {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
              <button className="p-3 rounded-xl dark:bg-slate-800 bg-slate-100 text-slate-700 dark:text-slate-200" aria-label="اشتراک صفحه">
                <Monitor className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-500 font-bold flex items-center gap-2">
              <span className="hidden sm:inline">حالت کنترل: دسترسی مدرس با مجوز فعالیت صوتی</span>
            </div>

            <div className="flex items-center gap-2">
              <button className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all">
                خروج از جلسه
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Chat & Participants Panel */}
        <div className="p-4 dark:bg-slate-900/60 bg-white flex flex-col justify-between text-right border-r dark:border-slate-800 border-slate-200">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b dark:border-slate-800 border-slate-200 text-xs">
              <span className="font-bold dark:text-white text-slate-900 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-brand-500" />
                لیست حاضرین (۲۴)
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold font-mono">
                شبکه پایدار
              </span>
            </div>

            {/* User list */}
            <div className="space-y-2 text-xs max-h-48 overflow-y-auto pr-1">
              <div className="flex items-center justify-between p-2 rounded-lg dark:bg-slate-950 bg-slate-100 border dark:border-slate-800 border-slate-200">
                <span className="font-bold dark:text-slate-200 text-slate-900">دکتر علی رضایی (مدرس)</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-brand-600 text-white rounded font-bold">مدرس</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg dark:bg-slate-950/60 bg-slate-50 text-slate-700 dark:text-slate-300">
                <span>مهندس سارا حسینی</span>
                <span className="text-[10px] text-amber-500 font-bold">دست بالا ✋</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg dark:bg-slate-950/60 bg-slate-50 text-slate-700 dark:text-slate-300">
                <span>محمد کریمی (دانشجو)</span>
                <span className="text-[10px] text-slate-400">شنونده</span>
              </div>
            </div>

            {/* Chat section */}
            <div className="pt-3 border-t dark:border-slate-800 border-slate-200 space-y-2">
              <span className="text-xs font-bold dark:text-white text-slate-900 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-accent-500" />
                گفتگوی متنی زنده
              </span>

              <div className="p-3 dark:bg-slate-950 bg-slate-100 rounded-xl border dark:border-slate-800 border-slate-200 text-xs space-y-2.5 max-h-40 overflow-y-auto">
                <div>
                  <span className="font-bold text-brand-500">رضایی:</span>
                  <p className="dark:text-slate-300 text-slate-700 text-[11px] mt-0.5">لطفاً سوالات خود را در پنل پرسش ثبت کنید.</p>
                </div>
                <div>
                  <span className="font-bold text-emerald-500">حسینی:</span>
                  <p className="dark:text-slate-300 text-slate-700 text-[11px] mt-0.5">آیا جزوه این اسلایدها در سامانه قابل دانلود است؟</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t dark:border-slate-800 border-slate-200">
            <input
              type="text"
              readOnly
              value="پیام خود را تایپ کنید..."
              className="w-full p-2.5 dark:bg-slate-950 bg-slate-100 border dark:border-slate-800 border-slate-300 rounded-xl text-xs text-slate-400 cursor-not-allowed"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
