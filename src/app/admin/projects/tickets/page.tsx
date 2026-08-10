'use client';

import React, { useState, useEffect } from 'react';
import { getAdminTickets, manageAdminTicket } from '@/lib/api';
import { LifeBuoy, AlertCircle, Trash2, CheckCircle2, MessageSquare, Send, User, Reply } from 'lucide-react';

export default function TicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const [expandedTicketId, setExpandedTicketId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const res = await getAdminTickets();
      setTickets(Array.isArray(res) ? res : (res?.tickets || []));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAction = async (action: string, id: number, extraData: any = {}) => {
    if (action === 'delete' && !confirm('آیا از حذف این تیکت اطمینان دارید؟')) return;
    
    setSubmitting(true);
    const payload = { action, id, ...extraData };
    
    try {
      const res = await manageAdminTicket(payload);
      if (res?.message) {
        setSuccessMsg(res.message);
        if (action === 'reply_ticket') {
          setReplyText('');
        }
        loadData();
      } else if (res?.error) {
        setErrorMsg(res.error);
      }
    } catch (err) {
      setErrorMsg('خطای ارتباط با سرور.');
    } finally {
      setSubmitting(false);
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open': return <span className="px-2 py-1 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded text-[10px] font-bold">باز / در انتظار</span>;
      case 'answered': return <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded text-[10px] font-bold">پاسخ داده شده</span>;
      case 'closed': return <span className="px-2 py-1 bg-slate-500/10 text-slate-500 border border-slate-500/20 rounded text-[10px] font-bold">بسته شده</span>;
      default: return <span className="px-2 py-1 bg-slate-500/10 text-slate-500 border border-slate-500/20 rounded text-[10px] font-bold">{status}</span>;
    }
  };

  if (loading) return <div className="text-center mt-20"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div></div>;

  return (
    <div className="space-y-6 animate-fade-in text-right">
      <div className="space-y-2">
        <h2 className="text-2xl font-black dark:text-white text-slate-900 flex items-center gap-2">
          <LifeBuoy className="w-6 h-6 text-brand-500" />
          تیکت‌های پشتیبانی مشتریان
        </h2>
        <p className="text-xs text-slate-500">پاسخ‌دهی به درخواست‌ها و مکالمات پشتیبانی کارفرمایان.</p>
      </div>

      {successMsg && <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-bold flex items-center gap-2"><CheckCircle2 className="w-4 h-4" />{successMsg}</div>}
      {errorMsg && <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-bold flex items-center gap-2"><AlertCircle className="w-4 h-4" />{errorMsg}</div>}

      <div className="space-y-4">
        {tickets.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">تیکتی یافت نشد.</div>
        ) : (
          tickets.map(t => (
            <div key={t.id} className="bg-white dark:bg-slate-900 border dark:border-slate-800 border-slate-200 rounded-2xl overflow-hidden shadow-sm transition-all">
              <div 
                className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50"
                onClick={() => setExpandedTicketId(expandedTicketId === t.id ? null : t.id)}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold dark:text-white text-slate-900 text-sm">{t.subject}</h3>
                    {getStatusBadge(t.status)}
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <User className="w-3.5 h-3.5" /> {t.client_name}
                    <span className="text-slate-300 dark:text-slate-700">|</span>
                    <span className="font-bold text-brand-500">{t.project_name}</span>
                    <span className="text-slate-300 dark:text-slate-700">|</span>
                    <span className="font-mono">{t.created_at}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button onClick={(e) => { e.stopPropagation(); handleAction('update_status', t.id, { status: t.status === 'closed' ? 'open' : 'closed' }); }} className="px-3 py-1.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                    {t.status === 'closed' ? 'باز کردن تیکت' : 'بستن تیکت'}
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleAction('delete', t.id); }} className="p-1.5 rounded text-rose-500 hover:bg-rose-500 hover:text-white transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* Expandable Chat Thread */}
              {expandedTicketId === t.id && (
                <div className="border-t dark:border-slate-800 border-slate-200 bg-slate-50/50 dark:bg-slate-900/50 p-6 space-y-6">
                  
                  {/* Original Message */}
                  <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-slate-500" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs dark:text-white text-slate-900">{t.client_name}</span>
                        <span className="text-[10px] font-mono text-slate-500">{t.created_at}</span>
                      </div>
                      <div className="p-4 rounded-2xl rounded-tr-none bg-white dark:bg-slate-800 border dark:border-slate-700 border-slate-200 text-sm dark:text-slate-300 text-slate-700 whitespace-pre-wrap">
                        {t.message}
                      </div>
                    </div>
                  </div>
                  
                  {/* Replies Thread */}
                  {t.replies?.map((reply: any) => (
                    <div key={reply.id} className={`flex gap-4 items-start ${reply.is_admin ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${reply.is_admin ? 'bg-brand-500/20 text-brand-500' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
                        {reply.is_admin ? <Reply className="w-5 h-5" /> : <User className="w-5 h-5" />}
                      </div>
                      <div className={`flex-1 space-y-1 ${reply.is_admin ? 'text-left' : 'text-right'}`}>
                        <div className={`flex items-center gap-2 ${reply.is_admin ? 'justify-end' : ''}`}>
                          <span className="font-bold text-xs dark:text-white text-slate-900">{reply.sender_name}</span>
                          <span className="text-[10px] font-mono text-slate-500">{reply.created_at}</span>
                        </div>
                        <div className={`p-4 rounded-2xl text-sm whitespace-pre-wrap ${
                          reply.is_admin 
                            ? 'rounded-tl-none bg-brand-500 text-white shadow-lg shadow-brand-500/20 text-right inline-block max-w-[85%]' 
                            : 'rounded-tr-none bg-white dark:bg-slate-800 border dark:border-slate-700 border-slate-200 dark:text-slate-300 text-slate-700 inline-block max-w-[85%]'
                        }`}>
                          {reply.message}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Reply Form */}
                  {t.status !== 'closed' && (
                    <div className="pt-4 border-t dark:border-slate-800 border-slate-200">
                      <div className="flex gap-2">
                        <textarea 
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="پاسخ خود را بنویسید..." 
                          className="flex-1 min-h-[80px] p-4 rounded-2xl dark:bg-slate-800 bg-white border dark:border-slate-700 border-slate-300 text-sm focus:outline-none focus:border-brand-500 resize-none"
                        ></textarea>
                        <button 
                          disabled={submitting || !replyText.trim()}
                          onClick={() => handleAction('reply_ticket', t.id, { message: replyText })}
                          className="px-6 rounded-2xl bg-brand-500 text-white font-bold hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                        >
                          <Send className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}
                  
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
