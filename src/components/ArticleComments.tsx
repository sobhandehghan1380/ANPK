'use client';

import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, CheckCircle2, AlertCircle, Clock, User } from 'lucide-react';

interface ArticleCommentsProps {
  slug: string;
  allowComments: boolean;
}

export function ArticleComments({ slug, allowComments }: ArticleCommentsProps) {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [replyTo, setReplyTo] = useState<{ id: number; name: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

  useEffect(() => {
    fetchComments();
  }, [slug]);

  const fetchComments = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/blog/articles/${slug}/comments/`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
      }
    } catch (err) {
      console.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allowComments) return;
    
    setSubmitting(true);
    setMsg({ type: '', text: '' });
    
    try {
      const payload = { name, email, content, parent_id: replyTo?.id };
      const res = await fetch(`${API_BASE}/api/blog/articles/${slug}/comments/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      
      if (res.ok) {
        setMsg({ type: 'success', text: data.message });
        setName('');
        setEmail('');
        setContent('');
        setReplyTo(null);
      } else {
        setMsg({ type: 'error', text: data.error || 'خطا در ثبت نظر.' });
      }
    } catch (err) {
      setMsg({ type: 'error', text: 'خطا در ارتباط با سرور.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="py-8 text-center text-xs text-slate-400">در حال دریافت نظرات...</div>;

  return (
    <div className="mt-12 pt-10 border-t dark:border-slate-800 border-slate-200">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-500">
          <MessageCircle className="w-5 h-5" />
        </div>
        <h3 className="text-xl font-black dark:text-white text-slate-900">نظرات کاربران ({comments.length})</h3>
      </div>

      {/* Form */}
      {allowComments ? (
        <div className="glass-card rounded-3xl p-5 sm:p-6 lg:p-8 border dark:border-slate-800 border-slate-200 mb-10 shadow-lg">
          <h4 className="text-sm font-bold dark:text-white text-slate-900 mb-5">
            {replyTo ? `پاسخ به ${replyTo.name}` : 'دیدگاه خود را ثبت کنید'}
          </h4>
          
          {msg.text && (
            <div className={`p-3 rounded-xl mb-5 text-xs font-bold flex items-center gap-2 ${msg.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
              {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {msg.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input required type="text" placeholder="نام شما" value={name} onChange={e => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 text-xs focus:outline-none focus:border-brand-500 font-bold" />
              <input required type="email" placeholder="ایمیل (نمایش داده نمی‌شود)" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 text-xs focus:outline-none focus:border-brand-500 dir-ltr text-left" />
            </div>
            <textarea required rows={4} placeholder="متن دیدگاه..." value={content} onChange={e => setContent(e.target.value)}
              className="w-full px-4 py-3 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-700 text-xs focus:outline-none focus:border-brand-500 leading-loose" />
            
            <div className="flex items-center justify-between">
              {replyTo && (
                <button type="button" onClick={() => setReplyTo(null)} className="text-[10px] text-rose-500 font-bold hover:underline">
                  لغو پاسخ
                </button>
              )}
              <button type="submit" disabled={submitting}
                className={`py-3 px-6 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-all shadow-lg shadow-brand-500/20 flex items-center gap-2 ${replyTo ? '' : 'mr-auto'}`}>
                <Send className="w-4 h-4" />
                {submitting ? 'در حال ثبت...' : 'ارسال نظر'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900 border dark:border-slate-800 text-center text-xs font-bold text-slate-500 mb-8">
          نظرات برای این مقاله غیرفعال شده است.
        </div>
      )}

      {/* List */}
      <div className="space-y-6">
        {comments.length === 0 && allowComments && (
          <p className="text-center text-sm font-bold text-slate-400 py-6">اولین نفری باشید که نظر می‌دهد!</p>
        )}
        
        {comments.map((c) => (
          <div key={c.id} className="p-5 rounded-2xl dark:bg-slate-900/50 bg-slate-50 border dark:border-slate-800 border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black dark:text-white text-slate-900">{c.name}</div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" /> {c.created_at}
                  </div>
                </div>
              </div>
              {allowComments && (
                <button onClick={() => { setReplyTo({ id: c.id, name: c.name }); window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' }); }}
                  className="text-[10px] font-bold text-brand-500 hover:underline">
                  پاسخ به این نظر
                </button>
              )}
            </div>
            <p className="text-xs sm:text-sm dark:text-slate-300 text-slate-700 leading-relaxed font-medium pt-1">
              {c.content}
            </p>

            {/* Replies */}
            {c.replies?.length > 0 && (
              <div className="mt-4 mr-4 sm:mr-8 space-y-3 pr-3 border-r-2 dark:border-slate-800 border-slate-200">
                {c.replies.map((r: any) => (
                  <div key={r.id} className="p-4 rounded-xl dark:bg-slate-900/80 bg-white border dark:border-slate-800 border-slate-200">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="text-[11px] font-bold dark:text-white text-slate-900">{r.name}</div>
                      <div className="text-[9px] text-slate-400">{r.created_at}</div>
                    </div>
                    <p className="text-xs dark:text-slate-300 text-slate-700 leading-relaxed">{r.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
