'use client';
import React, { useState, useEffect } from 'react';
import { getAdminLeads, manageAdminLead, convertLeadToClient } from '@/lib/api';
import { Users, Filter, CheckCircle2, AlertCircle, Phone, FileText, ArrowLeftRight, UserCheck, Search, MessageSquare, Briefcase, Plus, Send } from 'lucide-react';

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals & Panels
  const [convertingLead, setConvertingLead] = useState<any>(null);
  const [activityLead, setActivityLead] = useState<any>(null);
  const [newActivityDesc, setNewActivityDesc] = useState('');
  const [newActivityType, setNewActivityType] = useState('note');
  const [submitting, setSubmitting] = useState(false);

  // Drag state
  const [draggedLeadId, setDraggedLeadId] = useState<number | null>(null);

  const loadLeads = async () => {
    try {
      const res = await getAdminLeads();
      setLeads(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  // --- Drag and Drop Logic ---
  const handleDragStart = (e: React.DragEvent, id: number) => {
    setDraggedLeadId(id);
    e.dataTransfer.effectAllowed = "move";
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };
  
  const handleDrop = async (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    if (!draggedLeadId) return;
    
    // Optimistic update
    const updatedLeads = leads.map(l => l.id === draggedLeadId ? { ...l, status: targetStatus } : l);
    setLeads(updatedLeads);
    setDraggedLeadId(null);
    
    // API Call
    try {
      await manageAdminLead({ action: 'update_status', lead_id: draggedLeadId, status: targetStatus });
    } catch(err) {
      loadLeads(); // revert on fail
    }
  };

  // --- Activity Log Logic ---
  const handleAddActivity = async () => {
    if(!newActivityDesc.trim() || !activityLead) return;
    setSubmitting(true);
    try {
      const res = await manageAdminLead({
        action: 'add_activity',
        lead_id: activityLead.id,
        activity_type: newActivityType,
        description: newActivityDesc
      });
      if(res?.message) {
        setNewActivityDesc('');
        loadLeads();
        // Update local state to show immediately
        const newAct = {
            id: Date.now(),
            type: newActivityType,
            description: newActivityDesc,
            created_at: 'همین الان'
        };
        setActivityLead({...activityLead, activities: [newAct, ...(activityLead.activities || [])]});
      }
    } catch(err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // --- Convert to Client Logic ---
  const handleConvertToClient = async (leadId: number) => {
    setSubmitting(true);
    try {
      const res = await convertLeadToClient(leadId);
      if (res?.message) {
        setSuccessMsg(res.message);
        setConvertingLead(null);
        loadLeads();
      } else if (res?.error) setErrorMsg(res.error);
    } catch (err) {
      setErrorMsg('خطای سیستم.');
    } finally {
      setSubmitting(false);
      setTimeout(() => { setSuccessMsg(''); setErrorMsg(''); }, 5000);
    }
  };

  const columns = [
    { id: 'new', title: 'سرنخ‌های جدید', color: 'border-blue-500', bg: 'bg-blue-500/10' },
    { id: 'contacted', title: 'در حال پیگیری / تماس', color: 'border-amber-500', bg: 'bg-amber-500/10' },
    { id: 'contract', title: 'مذاکره و پیش‌فاکتور', color: 'border-indigo-500', bg: 'bg-indigo-500/10' },
    { id: 'archived', title: 'مشتری قطعی / بایگانی', color: 'border-emerald-500', bg: 'bg-emerald-500/10' },
  ];

  if (loading) return <div className="text-center mt-20"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div></div>;

  return (
    <div className="space-y-6 animate-fade-in text-right min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <h2 className="text-2xl font-black dark:text-white text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-brand-500" />
            پایپ‌لاین فروش (CRM)
          </h2>
          <p className="text-xs text-slate-500">مدیریت گرافیکی سرنخ‌ها، ثبت لاگ تماس‌ها و جلسات مذاکره.</p>
        </div>
        <div className="flex bg-white dark:bg-slate-900 border dark:border-slate-800 border-slate-200 rounded-xl overflow-hidden p-1 shadow-sm w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 mt-2 mr-2" />
          <input 
            type="text" 
            placeholder="جستجوی نام یا تلفن..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 bg-transparent text-sm focus:outline-none dark:text-white"
          />
        </div>
      </div>

      {successMsg && <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-bold flex items-center gap-2"><CheckCircle2 className="w-4 h-4" />{successMsg}</div>}
      {errorMsg && <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-bold flex items-center gap-2"><AlertCircle className="w-4 h-4" />{errorMsg}</div>}

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x">
        {columns.map(col => {
          const colLeads = leads.filter(l => l.status === col.id && (l.company.includes(searchQuery) || l.contact.includes(searchQuery)));
          
          return (
            <div 
              key={col.id} 
              className={`flex-none w-80 bg-slate-50/50 dark:bg-slate-900/50 border dark:border-slate-800 border-slate-200 rounded-3xl p-4 flex flex-col gap-4 snap-start`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-sm dark:text-white text-slate-800 flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full border-[3px] ${col.color}`}></div>
                  {col.title}
                </h3>
                <span className="bg-white dark:bg-slate-800 text-slate-500 text-[10px] font-mono px-2 py-1 rounded-lg font-bold shadow-sm">{colLeads.length}</span>
              </div>
              
              <div className="flex-1 flex flex-col gap-3 min-h-[500px]">
                {colLeads.map(lead => (
                  <div 
                    key={lead.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, lead.id)}
                    className="bg-white dark:bg-slate-800 border dark:border-slate-700 border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing flex flex-col gap-3 group relative"
                  >
                    <div className="flex justify-between items-start">
                      <div className="font-bold text-sm text-slate-900 dark:text-white">{lead.company}</div>
                      {lead.activities?.length > 0 && (
                        <div className="text-[10px] bg-indigo-500/10 text-indigo-500 px-1.5 py-0.5 rounded flex items-center gap-1 font-bold">
                          <MessageSquare className="w-3 h-3" />
                          {lead.activities.length}
                        </div>
                      )}
                    </div>
                    
                    <div className="text-xs text-slate-500 flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5" />
                      {lead.contact}
                    </div>
                    
                    <div className="text-[11px] bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 p-2 rounded-lg flex items-center gap-2">
                      <Briefcase className="w-3.5 h-3.5" />
                      {lead.service}
                    </div>
                    
                    <div className="mt-2 pt-3 border-t dark:border-slate-700 border-slate-100 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setActivityLead(lead)} className="text-[10px] font-bold text-slate-500 hover:text-brand-500 flex items-center gap-1 transition-colors">
                        <Plus className="w-3 h-3" />
                        ثبت فعالیت
                      </button>
                      <button onClick={() => setConvertingLead(lead)} className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded hover:bg-emerald-500 hover:text-white transition-colors">
                        تبدیل به مشتری
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Convert Lead Modal */}
      {convertingLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-md border dark:border-slate-800 shadow-2xl animate-fade-in text-right space-y-6">
            <div className="space-y-1">
              <h3 className="text-lg font-black dark:text-white">تبدیل به مشتری قطعی</h3>
              <p className="text-xs text-slate-500">لید "{convertingLead.company}" به چرخه مالی سیستم متصل خواهد شد.</p>
            </div>
            
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center gap-3 text-sm dark:text-slate-300">
                <UserCheck className="w-5 h-5 text-emerald-500" />
                ساخت اکانت اتوماتیک برای کاربر
              </div>
              <div className="flex items-center gap-3 text-sm dark:text-slate-300">
                <FileText className="w-5 h-5 text-emerald-500" />
                تشکیل پرونده حقوقی (Client)
              </div>
              <div className="flex items-center gap-3 text-sm dark:text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                افتتاح کیف‌پول مالی در سیستم
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button onClick={() => setConvertingLead(null)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 rounded-xl text-xs font-bold">انصراف</button>
              <button disabled={submitting} onClick={() => handleConvertToClient(convertingLead.id)} className="px-6 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold">تایید و اتصال به سیستم</button>
            </div>
          </div>
        </div>
      )}

      {/* Activity Log Sidebar / Modal */}
      {activityLead && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/20 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md h-full shadow-2xl border-l dark:border-slate-800 animate-slide-in-right flex flex-col">
            <div className="p-6 border-b dark:border-slate-800 border-slate-200 flex justify-between items-center">
              <div className="space-y-1">
                <h3 className="text-lg font-black dark:text-white">تاریخچه فعالیت‌ها</h3>
                <p className="text-xs text-slate-500">{activityLead.company}</p>
              </div>
              <button onClick={() => setActivityLead(null)} className="w-8 h-8 flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full hover:bg-rose-500/10 hover:text-rose-500 transition-colors">
                <Search className="w-4 h-4 rotate-45" /> {/* Just using search icon rotated as X for quickness if X not imported */}
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {activityLead.activities?.length === 0 && (
                <div className="text-center py-10 text-slate-400 text-sm">هیچ فعالیتی ثبت نشده است.</div>
              )}
              {activityLead.activities?.map((act: any) => (
                <div key={act.id} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl space-y-2 border dark:border-slate-800 border-slate-100">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold bg-brand-500/10 text-brand-500 px-2 py-0.5 rounded">{act.type === 'call' ? 'تماس' : act.type === 'meeting' ? 'جلسه' : act.type === 'email' ? 'ایمیل' : 'یادداشت'}</span>
                    <span className="text-[10px] font-mono text-slate-500">{act.created_at}</span>
                  </div>
                  <p className="text-xs leading-relaxed dark:text-slate-300 text-slate-700 whitespace-pre-wrap">{act.description}</p>
                </div>
              ))}
            </div>
            
            <div className="p-6 border-t dark:border-slate-800 border-slate-200 bg-slate-50 dark:bg-slate-900 space-y-3">
              <select value={newActivityType} onChange={e=>setNewActivityType(e.target.value)} className="w-full p-3 rounded-xl bg-white dark:bg-slate-800 border dark:border-slate-700 text-xs focus:outline-none focus:border-brand-500">
                <option value="note">یادداشت داخلی</option>
                <option value="call">تماس تلفنی</option>
                <option value="meeting">جلسه حضوری/آنلاین</option>
                <option value="email">ایمیل/پیامک</option>
              </select>
              <textarea 
                placeholder="شرح مذاکره یا یادداشت..." 
                value={newActivityDesc}
                onChange={e=>setNewActivityDesc(e.target.value)}
                className="w-full p-3 rounded-xl bg-white dark:bg-slate-800 border dark:border-slate-700 text-xs h-24 focus:outline-none focus:border-brand-500 resize-none"
              ></textarea>
              <button disabled={submitting || !newActivityDesc.trim()} onClick={handleAddActivity} className="w-full py-3 bg-brand-500 text-white rounded-xl text-xs font-bold hover:bg-brand-600 disabled:opacity-50 transition-colors flex justify-center items-center gap-2">
                <Send className="w-4 h-4" />
                ثبت فعالیت جدید
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
