import React from 'react';
import { ShieldCheck, Lock, Cpu, Server, CheckCircle, Zap } from 'lucide-react';

export function HomepageTrustSeals() {
  const seals = [
    { title: 'استاندارد امنیت OWASP', desc: 'رمزنگاری TLS 1.3 و تست‌های نفوذپذیری', icon: ShieldCheck, color: 'text-emerald-500' },
    { title: 'انطباق HL7 FHIR', desc: 'استاندارد جهانی سلامت و پرونده الکترونیک', icon: Server, color: 'text-sky-500' },
    { title: 'ارتباط بومی WebRTC', desc: 'تاخیر زیر ۵۰ms و ترافیک نیم‌بهاء', icon: Zap, color: 'text-amber-500' },
    { title: 'معماری Zero Trust', desc: 'کنترل دسترسی سطوح سازمانی RBAC', icon: Lock, color: 'text-indigo-500' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {seals.map((seal, idx) => {
        const Icon = seal.icon;
        return (
          <div key={idx} className="p-5 rounded-2xl glass-card border border-slate-800 flex items-start gap-3 shadow-sm">
            <div className={`p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 ${seal.color} shrink-0`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold dark:text-white text-slate-900">{seal.title}</h4>
              <p className="text-[11px] dark:text-slate-400 text-slate-600 mt-0.5 leading-relaxed font-medium">{seal.desc}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
