'use client';

import React, { useState, useEffect } from 'react';
import { getAdminOverview, manageAdminProjectPhase, getAdminClients, createAdminProject } from '@/lib/api';
import { KanbanSquare, CheckCircle2, CircleDashed, Clock, ChevronLeft, Plus, XCircle } from 'lucide-react';

export default function ProjectBoardPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjTitle, setNewProjTitle] = useState('');
  const [newProjClient, setNewProjClient] = useState<number | ''>('');
  const [newProjContract, setNewProjContract] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadProjects = async () => {
    try {
      const res = await getAdminOverview();
      if (res?.contract_projects) {
        setProjects(res.contract_projects);
        if(!selectedProject && res.contract_projects.length > 0) setSelectedProject(res.contract_projects[0]);
        else if (selectedProject) {
            const updated = res.contract_projects.find((p:any) => p.id === selectedProject.id);
            if(updated) setSelectedProject(updated);
        }
      }
      
      const cliRes = await getAdminClients();
      if (cliRes && Array.isArray(cliRes)) setClients(cliRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleUpdatePhase = async (phaseId: number, data: any) => {
    try {
      let payload: any = data;
      if (data instanceof FormData) {
        payload.append('phase_id', phaseId.toString());
      } else {
        payload = { phase_id: phaseId, ...data };
      }
      await manageAdminProjectPhase(payload);
      loadProjects();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjClient || !newProjTitle) return;
    setSubmitting(true);
    try {
      const res = await createAdminProject(Number(newProjClient), newProjTitle, newProjContract || 'CN-1404-01', '', 0);
      if (res) {
        setIsModalOpen(false);
        setNewProjTitle('');
        setNewProjContract('');
        setNewProjClient('');
        loadProjects();
      }
    } catch(err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };
  
  const isOverdue = (targetDate: string, progress: number) => {
    if (!targetDate || progress === 100) return false;
    return new Date(targetDate).getTime() < new Date().getTime();
  };


  if (loading) return <div className="text-center mt-20"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div></div>;

  return (
    <div className="space-y-6 animate-fade-in text-right">
      <div className="space-y-2">
        <h2 className="text-2xl font-black dark:text-white text-slate-900 flex items-center gap-2">
          <KanbanSquare className="w-6 h-6 text-brand-500" />
          داشبورد فازبندی پروژه‌ها
        </h2>
        <p className="text-xs text-slate-500">مدیریت فازهای اجرایی (Sprints) و پیشرفت ریالی پروژه‌ها.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Project List Sidebar */}
        <div className="w-full lg:w-1/3 space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-slate-700 dark:text-slate-300">لیست پروژه‌های فعال</h3>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-xs font-bold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> پروژه جدید
            </button>
          </div>
          {projects.map(p => (
            <div 
              key={p.id} 
              onClick={() => setSelectedProject(p)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${selectedProject?.id === p.id ? 'border-brand-500 bg-brand-500/5 shadow-md shadow-brand-500/10' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'}`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold dark:text-white">{p.title}</span>
                <ChevronLeft className={`w-4 h-4 ${selectedProject?.id === p.id ? 'text-brand-500' : 'text-slate-400'}`} />
              </div>
              <div className="text-xs text-slate-500">{p.client_name}</div>
              
              <div className="mt-4 space-y-1">
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-slate-500">پیشرفت کل</span>
                  <span className="text-brand-500">{p.sprint_progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-500 rounded-full transition-all duration-500" style={{ width: `${p.sprint_progress}%` }}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Phase Management Board */}
        <div className="w-full lg:w-2/3">
          {selectedProject ? (
            <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 border-slate-200 rounded-3xl p-6">
              <div className="mb-6 pb-6 border-b dark:border-slate-800 border-slate-100 flex flex-wrap justify-between items-center gap-4">
                <div>
                  <h3 className="text-xl font-bold dark:text-white">{selectedProject.title}</h3>
                  <p className="text-sm text-slate-500 mt-1">شماره قرارداد: <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{selectedProject.contract_number}</span></p>
                </div>
                <div className="px-4 py-2 bg-brand-500/10 border border-brand-500/20 text-brand-500 rounded-xl text-center">
                  <div className="text-[10px] font-bold">مبلغ قرارداد</div>
                  <div className="font-mono font-bold">{parseInt(selectedProject.contract_value).toLocaleString()} تومان</div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-bold text-slate-700 dark:text-slate-300">فازهای اجرایی (Sprints)</h4>
                
                {selectedProject.phases?.map((phase: any, idx: number) => {
                  const overdue = isOverdue(phase.target_delivery_date, phase.progress_percentage || phase.progress);
                  return (
                  <div key={idx} className={`border ${overdue ? 'border-rose-500/50 dark:border-rose-500/50 bg-rose-50/30 dark:bg-rose-900/10' : 'dark:border-slate-800 border-slate-200 bg-slate-50 dark:bg-slate-900/50'} rounded-2xl p-5`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        {phase.progress === 100 ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : <CircleDashed className={`w-6 h-6 ${overdue ? 'text-rose-500 animate-pulse' : 'text-brand-500'}`} />}
                        <div>
                          <div className="font-bold text-sm dark:text-white flex items-center gap-2">
                            {phase.title}
                            {overdue && <span className="text-[9px] bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full border border-rose-200">تاخیر (Overdue)</span>}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">{phase.description || 'بدون توضیحات تکمیلی'}</div>
                        </div>
                      </div>
                      <span className="font-mono text-xs font-bold bg-white dark:bg-slate-800 px-2 py-1 rounded shadow-sm border dark:border-slate-700 border-slate-200 text-slate-600 dark:text-slate-300">
                        فاز {phase.phase_number}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-xs">
                      <div className="space-y-1">
                        <label className="text-slate-500 block text-[10px] font-bold">تاریخ شروع فاز</label>
                        <input type="date" value={phase.start_date || ''} onChange={(e) => handleUpdatePhase(phase.id, { start_date: e.target.value })} className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-500 block text-[10px] font-bold">ددلاین / تاریخ تحویل</label>
                        <input type="date" value={phase.target_delivery_date || ''} onChange={(e) => handleUpdatePhase(phase.id, { target_delivery_date: e.target.value })} className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800" />
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between text-[10px] font-bold">
                          <span className="text-slate-500">درصد پیشرفت</span>
                          <span className={phase.progress === 100 ? "text-emerald-500" : (overdue ? "text-rose-500" : "text-brand-500")}>{phase.progress}%</span>
                        </div>
                        <input 
                          type="range" min="0" max="100" step="5" value={phase.progress}
                          onChange={(e) => handleUpdatePhase(phase.id, { progress: parseInt(e.target.value), status: parseInt(e.target.value) === 100 ? 'COMPLETED' : 'IN_PROGRESS' })}
                          className={`w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer ${overdue ? 'accent-rose-500' : 'accent-brand-500'}`}
                        />
                      </div>
                      
                      <select 
                        value={phase.status} 
                        onChange={(e) => handleUpdatePhase(phase.id, { progress: phase.progress, status: e.target.value })}
                        className="text-xs p-2 rounded-xl border dark:border-slate-700 border-slate-300 bg-white dark:bg-slate-800 focus:outline-none"
                      >
                        <option value="PENDING">در انتظار</option>
                        <option value="IN_PROGRESS">در حال انجام</option>
                        <option value="COMPLETED">تکمیل شده</option>
                      </select>
                    </div>

                    <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
                       <div className="text-[10px] text-slate-500">
                          {phase.deliverable_file ? (
                             <a href={process.env.NEXT_PUBLIC_API_URL + phase.deliverable_file} target="_blank" className="text-brand-500 font-bold hover:underline flex items-center gap-1">
                                دانلود فایل خروجی آپلود شده
                             </a>
                          ) : (
                             <span>هنوز فایل خروجی آپلود نشده است</span>
                          )}
                       </div>
                       <div>
                          <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border border-slate-200 dark:border-slate-700 inline-flex items-center gap-1">
                            آپلود فایل جدید
                            <input 
                               type="file" 
                               className="hidden" 
                               onChange={(e) => {
                                  if(e.target.files && e.target.files[0]) {
                                     const fd = new FormData();
                                     fd.append('deliverable_file', e.target.files[0]);
                                     handleUpdatePhase(phase.id, fd);
                                  }
                               }}
                            />
                          </label>
                       </div>
                    </div>
                  </div>
                )})}
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[300px] border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center text-slate-400">
              <KanbanSquare className="w-12 h-12 mb-3 opacity-20" />
              <p className="font-bold text-sm">پروژه‌ای برای مدیریت انتخاب نشده است</p>
            </div>
          )}
        </div>
        
      </div>

      {/* Create Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in text-right">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-brand-500/10 text-brand-500 rounded-xl">
                  <KanbanSquare className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black dark:text-white">تعریف پروژه جدید</h3>
                  <p className="text-xs text-slate-500 mt-1">ایجاد پروفایل پروژه و فازبندی‌های پیش‌فرض</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors text-slate-500">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="createProjectForm" onSubmit={handleCreateProject} className="space-y-5">
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">انتخاب سازمان / کارفرما <span className="text-rose-500">*</span></label>
                  <select 
                    required 
                    value={newProjClient} 
                    onChange={(e) => setNewProjClient(Number(e.target.value))}
                    className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
                  >
                    <option value="">لطفا یک سازمان انتخاب کنید...</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name} {c.economic_code ? `(${c.economic_code})` : ''}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">عنوان پروژه <span className="text-rose-500">*</span></label>
                  <input 
                    type="text" 
                    required 
                    placeholder="مثال: طراحی و توسعه سامانه نوبت‌دهی آنلاین"
                    value={newProjTitle} 
                    onChange={(e) => setNewProjTitle(e.target.value)}
                    className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all" 
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">شماره قرارداد</label>
                  <input 
                    type="text" 
                    placeholder="مثال: CN-1404-01 (اختیاری)"
                    value={newProjContract} 
                    onChange={(e) => setNewProjContract(e.target.value)}
                    className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all font-mono" 
                  />
                </div>
                
                <div className="bg-brand-500/10 text-brand-700 dark:text-brand-300 p-4 rounded-xl text-xs font-medium leading-relaxed">
                  <strong>نکته:</strong> پس از ایجاد پروژه، سیستم به‌صورت خودکار ۳ فاز اجرایی پیش‌فرض و یک کلید API اختصاصی برای این پروژه تولید خواهد کرد. شما می‌توانید فازها را بعداً مدیریت کنید.
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex gap-3 bg-slate-50/50 dark:bg-slate-800/50">
              <button 
                type="submit" 
                form="createProjectForm"
                disabled={submitting || !newProjClient || !newProjTitle} 
                className="flex-1 py-3.5 bg-brand-500 text-white rounded-xl font-bold shadow-lg shadow-brand-500/30 hover:bg-brand-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {submitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'ایجاد و فازبندی پروژه'}
              </button>
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)} 
                className="px-6 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
