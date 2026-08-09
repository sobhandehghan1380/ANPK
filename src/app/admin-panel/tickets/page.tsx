'use client';

import React, { useState } from 'react';
import { MessageSquare, Send, CheckCircle2, Clock, ShieldCheck, CornerDownLeft } from 'lucide-react';

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState([
    {
      id: 'TCK-90184',
      client: 'بیمارستان ولایت (مهندس اکبری)',
      subject: 'درخواست افزایش ظرفیت پهنای باند آیرا WebRTC',
      category: 'پشتیبانی SLA / خط بحرانی',
      date: '۱۴۰۴/۱۱/۱۸ - ۰۸:۳۰',
      status: 'pending',
      userMessage: 'با سلام، با توجه به افزایش کلاس‌های آنلاین بیمارستان، ظرفیت همزمان به ۱۵۰ کاربر افزایش یابد.',
      adminResponse: '',
    },
    {
      id: 'TCK-90170',
      client: 'دانشگاه علوم پزشکی یزد',
      subject: 'سرویس دوره‌ای CMMS تأسیسات نگار',
      category: 'نگهداشت تجهیزات',
      date: '۱۴۰۴/۱۱/۱۷ - ۱۴:۱۵',
      status: 'resolved',
      userMessage: 'دستور کار سرویس چیلرهای مرکزی ثبت شد.',
      adminResponse: 'با سلام، کارشناس مقیم تأسیسات بررسی را انجام داد و گزارش ثبت شد.',
    },
  ]);

  const [activeTicketId, setActiveTicketId] = useState<string | null>('TCK-90184');
  const [replyText, setReplyText] = useState('');
  const [replySuccess, setReplySuccess] = useState('');

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicketId || !replyText) return;

    setTickets((prev) =>
      prev.map((t) =>
        t.id === activeTicketId
          ? { ...t, adminResponse: replyText, status: 'resolved' }
          : t
      )
    );

    setReplySuccess(`پاسخ مدیریت با موفقیت به تیکت ${activeTicketId} ارسال گردید.`);
    setReplyText('');
    setTimeout(() => setReplySuccess(''), 4000);
  };

  const currentTicket = tickets.find((t) => t.id === activeTicketId);

  return (
    <div className="space-y-8 animate-fade-in text-right">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-purple-400" />
          مدیریت و پاسخ‌گویی به تیکت‌های پشتیبانی SLA ۲۴/۷
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 font-medium">
          بررسی درخواست‌های خط بحرانی سازمان‌ها و پاسخ‌گویی مستقیم کارشناسان ارشد.
        </p>
      </div>

      {/* Grid: Tickets List + Active Ticket Response Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Tickets List */}
        <div className="lg:col-span-5 space-y-3">
          {tickets.map((t) => (
            <div
              key={t.id}
              onClick={() => setActiveTicketId(t.id)}
              className={`p-4 rounded-3xl border cursor-pointer transition-all space-y-2 text-right ${
                activeTicketId === t.id
                  ? 'bg-slate-900 border-purple-500 shadow-xl scale-[1.02]'
                  : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-purple-400 text-xs">{t.id}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  t.status === 'pending'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {t.status === 'pending' ? 'منتظر پاسخ' : 'پاسخ داده شده'}
                </span>
              </div>
              <h3 className="text-xs font-bold text-white leading-snug">{t.subject}</h3>
              <p className="text-[11px] text-slate-400 font-medium">{t.client}</p>
            </div>
          ))}
        </div>

        {/* Active Ticket Response Workspace */}
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          {currentTicket ? (
            <>
              <div className="border-b border-slate-800 pb-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-purple-400 text-xs">{currentTicket.id}</span>
                  <span className="text-xs text-slate-400">{currentTicket.date}</span>
                </div>
                <h2 className="text-base font-black text-white">{currentTicket.subject}</h2>
                <p className="text-xs text-slate-300 font-bold">فرستنده: {currentTicket.client}</p>
              </div>

              {/* User Message */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-400 block">متن درخواست مشتری:</span>
                <p className="text-xs text-slate-200 leading-relaxed font-medium">{currentTicket.userMessage}</p>
              </div>

              {/* Existing Admin Response if any */}
              {currentTicket.adminResponse && (
                <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 space-y-2">
                  <span className="text-xs font-bold text-purple-400 block">پاسخ ثبت‌شده مدیریت:</span>
                  <p className="text-xs text-slate-200 leading-relaxed font-medium">{currentTicket.adminResponse}</p>
                </div>
              )}

              {/* Reply Form */}
              {replySuccess && (
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{replySuccess}</span>
                </div>
              )}

              <form onSubmit={handleSendReply} className="space-y-4 pt-2">
                <label className="block text-xs font-bold text-slate-300">ارسال پاسخ جدید مدیریت ارشد:</label>
                <textarea
                  required
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="متن پاسخ رسمی کارشناس پشتیبانی ANPK..."
                  className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500 font-medium"
                />

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs shadow-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <Send className="w-4 h-4" />
                  <span>ارسال پاسخ و بستن تیکت</span>
                </button>
              </form>
            </>
          ) : (
            <p className="text-xs text-slate-400 font-medium">لطفاً یک تیکت را از منوی سمت راست انتخاب کنید.</p>
          )}
        </div>
      </div>
    </div>
  );
}
